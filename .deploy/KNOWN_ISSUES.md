# KNOWN ISSUES — Bugs, Root Causes, Attempted Fixes

> **AI CONTEXT FILE** — Central place for known bugs, root causes, and what NOT to try again. Read this before fixing any issue.

---

## Recent Issues (Sessions 49-58, all FIXED)

### Issue: Product create 500 + invisible products + wrong shop products (FIXED S58)
- **Symptom:** Creating a product in admin → 500. New products never appear on the storefront. New shop counter showed 0 but foreign products appeared on its page; shop was missing from listings entirely.
- **Root causes (4 separate bugs, same chain):**
  1. `create()` stored only `shop_id` — no embedded `shop` object → `getProducts` filter `product.shop.id` crashed (500) and the storefront's fuse `$and` silently dropped items missing `visibility:visibility_public` (invisible products)
  2. Shop id 12 was reused — 188 orphaned seed products from the deleted "Gaming Shop" (S44/S49) still pointed at id 12 → foreign products on the new store + `products_count` hardcoded 0
  3. `getShops` `is_active` query param arrives as string `"1"` (Nest) vs boolean `true` → strict `===` filtered out ALL shops
  4. `GET /products/{id}` 500 — `getProductBySlug()` looked up by slug only and crashed dereferencing an undefined product
- **Fixes:** `create()` resolves shop/type/categories from the JSON files + defaults `visibility`/`is_active`/`deleted_at`/`translated_languages`; defensive `product?.shop?.id` filter + all methods `reloadFromFile()` + newest-first sorting for shop pages; shop re-id 12→13 (no orders referenced 12) + products repointed; live `products_count` via new `countProducts()`/`withCounts()`; `is_active` coercion (`true/'true'/1/1`); `getProductBySlug` matches slug OR numeric id and 404s instead of crashing
- **What NOT to try:** Reusing a deleted shop's numeric id; strict `===` on query-param booleans; assuming the admin edit form uses id-based GET (it uses slug — only the broken id GET 500'd)

### Issue: Anyone registering became super_admin (CRITICAL, FIXED S50)
- **Symptom:** Every `/api/register` account got `super_admin` + `customer` permissions — anyone could enter the admin panel
- **Root cause:** Stock `register()` in `api/rest/src/auth/auth.service.ts` hardcoded both permissions
- **Fix:** Default = `customer` only; `ADMIN_EMAILS` env promotes admins. Commit `0ed267d`
- **What NOT to try:** Re-adding super_admin to register default. Use ADMIN_EMAILS.

### Issue: Email verification bypassed (FIXED S50)
- **Symptom:** Users could log in without ever verifying their email (`email_verified: true` hardcoded)
- **Fix:** 6-digit code + `email-verifications.json` (30min TTL, dual-write), `GET /me` → 409 until verified, endpoints `POST /verify-email` + `/email/verification-notification` (JWT-guarded), storefront `/verify-email` code-input UI

### Issue: API crash after rebuild — ENOENT dist/db (FIXED S52)
- **Symptom:** `npm run build` wipes `dist/db/pickbazar/*.json`; first save (register, shop, order…) crashed with `ENOENT .../dist/db/pickbazar/users.json`
- **Root cause:** dual-write `saveToFile()` wrote to `dist/db` without `mkdirSync`
- **Fix:** All 20 db services got `fs.mkdirSync(path.dirname(distPath), { recursive: true })` before the dist write. Commit `b8a015c`
- **Lesson:** after ANY API rebuild, dist/db JSON is gone until the next dual-write — that's OK now, mkdir recreates it

### Issue: Google login returned fake token (FIXED S51)
- **Symptom:** `/social-login-token` returned `'jwt token'` (stock stub)
- **Fix:** Verify access_token via `https://www.googleapis.com/oauth2/v3/userinfo`, aud check vs `GOOGLE_CLIENT_ID`, find/create user, real JWT

### Issue: Admin avatar dropdown empty — no logout (FIXED S55)
- **Symptom:** Top-right avatar menu showed no Profile/Logout items
- **Root cause:** `authorized-menu.tsx` filtered links with `permission?.includes(role!)`; stale/missing `role` in the AUTH_CRED cookie hid everything
- **Fix:** `getAuthCredentials()` derives role from permissions when absent; logout link exempt from role gate. Commit `e3ac437`

### Issue: `npm install` fails in shop/admin workspaces (UNFIXED — WORKAROUND)
- **Error:** `husky - .git can't be found` (prepare script)
- **Workaround:** Avoid new npm deps in these workspaces. Load vendor scripts dynamically (see `shop/src/components/ui/turnstile.tsx` — script tag + `window.X.render` + cleanup on unmount)

### Issue: Wrong Cloudflare zone (CLOSED S49)
- User-provided zone `4c31a7c68f38aef752c16787e9704cb4` = **aussiebazar.com.au**. Correct switchgod.com.np zone = `7b412d7e52599a85d466c88551d9aa1f` (account `dc91e4a69167c4f28baf574d312e943b`). Don't touch the aussiebazar zone.

### Known stubs (by design / pending)
- Phone OTP login (`otp-login`, `send-otp-code`, `verify-otp-code`) — fake tokens; user said SKIP (needs Twilio/Nepal SMS provider)
- Wallet `add-points` — returns `me()`; not used by storefront UI
- AI `generate-descriptions` — dummy response (needs OpenAI key)
- Payments (Stripe/PayPal) — wired but need real API keys
- Admin build warning: `approveShopWithCommissionSchema` import error (pre-existing, non-blocking)

---

## Add-to-Cart Issues (Session 16-17, REVERTED)

All add-to-cart code was reverted to original. Here are the root causes found:

### Issue 1: Two "+ Cart" Buttons in Product Popup
- **Symptom:** Both sticky bar and details section show "+ Cart" buttons
- **Root cause:** Intersection observer `threshold: 1` in `details.tsx:74-77` triggers sticky bar immediately on mobile (content taller than viewport)
- **Key files:** `details.tsx:74-77`, `short-details.tsx:171`, `popup.tsx:54`
- **What NOT to try:** Changing threshold to 0 changes sticky bar behavior globally

### Issue 2: Counter Appears at Bottom of Popup
- **Symptom:** After adding to cart, counter appears at bottom of popup instead of where button was
- **Root cause:** AddToCart in Details section is positioned at bottom of product info (below image, name, price, description, variations). Counter replaces button in same DOM position
- **Key files:** `details.tsx:238`, `add-to-cart.tsx:122-136`
- **What NOT to try:** Moving AddToCart higher in details causes layout issues

### Issue 3: Popup Not Scrolling to Top
- **Symptom:** When switching products in popup, scroll position stays at bottom
- **Root cause:** Modal Dialog has `overflow-y-auto`, no scroll-to-top on product change
- **Key files:** `popup.tsx`, `modal.tsx`
- **Status:** PARTIALLY FIXED — `popup.tsx` now resets `stickyShortDetailsAtom` and scrolls dialog to top

### Key Architecture Notes
- `stickyShortDetailsAtom` (Jotai) is global state shared between `popup.tsx` and `details.tsx`
- Intersection observer in `details.tsx` controls sticky bar visibility
- `ShortDetails` (sticky bar) has `hidden md:block` — hidden on mobile, shown on desktop
- Both Details and ShortDetails use `variant="big"` which renders full-width button
- After adding to cart, `isInCart` check returns true → Counter replaces button

---

---

## Shop Product Filtering Bug (Session 35, FIXED)

### Symptom
Visiting any shop page (e.g., Clothing Shop) shows products from ALL shops — clothes, gadgets, books, makeup mixed together. Products do not match the shop.

### Root Cause
In `api/rest/src/products/products.service.ts:65-75`, the exact `shop_id` filter was applied **before** the fuzzy `fuse.search()`. The fuzzy search operates on the **global** product list (all 1200+ products), so it overwrote the shop-filtered result:

```typescript
// OLD (broken) — step order:
// 1. Filter to shop_id=2 → 64 products ✅
// 2. fuse.search() on ALL 1200+ products → 1199 products ❌ overwrites!
if (exactFilters.shop_id) {
  data = data.filter((product) => product.shop.id === exactFilters.shop_id);
}
if (fuzzyFilters.length) {
  data = fuse.search({ $and: fuzzyFilters })?.map(({ item }) => item);
}
```

### The Fix
Swap the order — apply fuzzy search first (narrows by status/visibility), then exact `shop_id` filter on the result:

```typescript
// FIXED — step order:
// 1. fuse.search({status:'publish', visibility:'visibility_public'}) → 1199 products
// 2. Filter to shop_id=2 → 64 products ✅
if (fuzzyFilters.length) {
  data = fuse.search({ $and: fuzzyFilters })?.map(({ item }) => item);
}
if (exactFilters.shop_id) {
  data = data.filter((product) => product.shop.id === exactFilters.shop_id);
}
```

### Key Files
- `api/rest/src/products/products.service.ts` — REST API products service (the bug + fix)
- `api/graphql/src/products/products.service.ts` — GraphQL has the same pattern (not fixed yet — not in use)

### Verification
| Shop | Expected products | Actual |
|------|------------------|--------|
| Clothing Shop (id=2) | 64 | ✅ |
| Gadget Shop (id=9) | 44 | ✅ |

### What NOT to Do
- Do NOT add `shop_id` as a filter to the Fuse instance options — it's an exact match, not fuzzy
- Do NOT try to create separate Fuse instances per shop — the global instance is fine when filters are applied in the right order

---

## Shop `is_active` Filter Bug (Session 43, FIXED)

### Symptom
After approving a shop in the admin, the shop does not appear on the storefront homepage or the `/shops` listing page. The shop is correctly saved with `is_active: true` in `shops.json`, but the frontend never shows it.

### Root Cause
In `shops.service.ts` `getShops()` method, the `is_active` filter was completely broken:

```typescript
// OLD (broken):
if (search) {
  const parseSearchParams = search.split(';');
  for (const searchParam of parseSearchParams) {
    const [key, value] = searchParam.split(':');
    // data = data.filter((item) => item[key] === value);  ← COMMENTED OUT
    data = fuse.search(value)?.map(({ item }) => item);    ← FUZZY SEARCH FOR "1"
  }
}
```

The frontend sends `search=is_active%3A1` (which parses to `is_active:1`). Instead of filtering shops where `is_active === true`, the code ran `fuse.search("1")` — a fuzzy text search for the string "1" across shop names, slugs, and `is_active` values. This accidentally worked for old shops because their `is_active` was the number `1` (which Fuse can match), but failed for newly approved shops with `is_active: true` (boolean — Fuse cannot match "1" against "true").

### The Fix
Separate exact filters (`is_active`) from fuzzy filters in the search param parsing, same pattern as products service:

```typescript
// FIXED:
if (search) {
  const parseSearchParams = search.split(';');
  const fuzzyFilters: any[] = [];
  for (const searchParam of parseSearchParams) {
    const [key, value] = searchParam.split(':');
    if (key === 'is_active') {
      data = data.filter((item) => Boolean(item.is_active) === (value === '1'));
    } else {
      fuzzyFilters.push({ [key]: value });
    }
  }
  if (fuzzyFilters.length) {
    data = fuse.search({ $and: fuzzyFilters })?.map(({ item }) => item);
  }
}
```

Also handles the `is_active` query param directly from `GetShopsDto` when no `search` string is present.

### Key Files
- `api/rest/src/shops/shops.service.ts` — `getShops()` and `getNewShops()` methods (the bug + fix)

### What NOT to Do
- Do NOT use `fuse.search()` for structured/exact filters like `is_active` — use `data.filter()` instead
- Do NOT compare `is_active` with `===` against a string like `"1"` — use `Boolean()` conversion for type-safe comparison

---

## Other Known Issues

| Issue | Status | Notes |
|-------|--------|-------|
| Yarn hangs on "Fetching packages..." | Known | Use npm instead |
| Google OAuth not configured | By design | GoogleProvider commented out in [...nextauth].ts |
| Dark mode broken | Reverted | Tried and fully reverted (commit ed44c2b) |
| ESLint/TS errors ignored in build | TODO | See PLAN.md Phase 6 |
| Sitemap has localhost URLs | TODO | See PLAN.md Phase 2 |
| No security headers | TODO | See PLAN.md Phase 3 |

---

---

## Settings Persistence Bug (Session 36, FIXED)

### Symptom
Changing currency (or any setting) in Admin Dashboard → Settings → General Settings appears to save successfully, but the change is not reflected on the shop frontend. On API restart, the old value returns.

### Root Cause
`api/rest/src/settings/settings.service.ts` — `create()` and `update()` methods ignored the incoming DTO and returned the original in-memory object loaded once from `@db/settings.json` at module load. No write-back to the JSON file occurred.

```typescript
// OLD (broken) — ignores input, returns original
create(createSettingDto: CreateSettingDto) {
  return this.settings;  // ← always USD, never updates
}
```

The admin UI's `onSuccess` handler updates its own React context, creating an **illusion of persistence**. The shop frontend fetches `GET /settings` from the API and always gets the stale in-memory copy.

### The Fix
Merge the incoming DTO into the in-memory object and write back to `settings.json`:

```typescript
// FIXED — merge + persist
create(createSettingDto: CreateSettingDto) {
  this.settings = {
    ...this.settings,
    ...createSettingDto,
    options: { ...this.settings.options, ...createSettingDto.options },
    updated_at: new Date(),
  };
  this.saveToFile();
  return this.settings;
}
```

Added a `private saveToFile()` method that writes `this.settings` back to `src/db/pickbazar/settings.json` using `fs.writeFileSync`.

### Key Files
- `api/rest/src/settings/settings.service.ts` — the bug + fix
- `api/rest/src/db/pickbazar/settings.json` — now actually updated on save

### Rebuild Required
After editing, run:
```bash
cd /home/switchgod/Desktop/New Pickbazar/api/rest && npx nest build && pm2 restart api
```

### What NOT to Do
- Do NOT create a new admin account — this is not an auth/permission issue
- Do NOT edit `settings.json` manually as a workaround — the fix properly persists via the API endpoint

---

## Widespread API Persistence Bug (Session 37, NOT YET FIXED)

### Summary
A full audit of all 46 API services revealed that **only Settings** has working persistence (fixed in Session 36). Every other service that exposes `create()` or `update()` silently ignores the input data and returns a static record from the in-memory JSON file.

### What This Means
| Action in Admin | What the user sees | What actually happens |
|----------------|-------------------|---------------------|
| Create a new shop | Form submits successfully | API returns `shops[0]` — your shop is lost |
| Create a new product | Form submits successfully | API returns `products[0]` — your product is lost |
| Register a new user | Success message | API pushes to in-memory array but never writes to file — lost on restart |
| Create a coupon | Form submits successfully | API returns `coupons[0]` — your coupon is lost |
| Approve/ban a shop | UI toggles | In-memory only — resets on restart |
| Create any entity | Success notification | **Nothing is saved** |

### Root Cause
Every service follows this pattern — load JSON once at module startup, store in memory, but never write back:

```typescript
// Common pattern across ALL services (broken):
const data = plainToClass(Model, jsonData);

@Injectable()
export class SomeService {
  private items = data;  // in-memory copy

  create(dto: CreateDto) {
    return this.items[0];   // ← ignores dto, returns first dummy record
  }

  update(id: number, dto: UpdateDto) {
    return this.items[0];   // ← ignores dto and id, returns first dummy record
  }
}
```

### Affected Services (30+)
All services under `api/rest/src/` that load from `@db/*.json`:
- **Shops** — `shops.service.ts`
- **Products** — `products.service.ts`
- **Categories** — `categories.service.ts`
- **Orders** — `orders.service.ts`
- **Coupons** — `coupons.service.ts`
- **Users** — `users.service.ts`
- **Types, Tags, Brands, Attributes, Taxes, Shippings**
- **Reviews, Questions, Wishlists**
- **Refunds, Refund Policies, Refund Reasons**
- **Terms & Conditions, Flash Sales, Store Notices**
- **Conversations, Messages, FAQs, Become Seller, Ownership Transfer**
- **Withdraws, Manufacturers, Authors**
- **Auth register** (pushes to array but no file write)

### The Fix Pattern
Each service needs the same treatment as Settings:
1. Merge the DTO into the in-memory data (push to arrays for `create`, update fields for `update`)
2. Add a `saveToFile()` private method using `fs.writeFileSync`
3. Call it after every mutation

### Priority Order (Recommended)
1. **HIGH** — Shops, Products, Orders, Coupons, Users, Auth (register)
2. **MEDIUM** — Categories, Types, Tags, Reviews, Questions, Wishlists
3. **LOW** — Everything else (shipping, taxes, flash sales, etc.)

See `.deploy/PLAN.md` Phase 10 for the full task breakdown.

---

---

## Orphaned Products from Deleted Shop (Session 44, FIXED)

### Symptom
After creating a new "Gaming" shop, it showed 188 products from a different shop ("noaw" — previously deleted). The products were not related to Gaming.

### Root Cause
Two issues combined:

1. **Orphaned data:** A shop named "noaw" (ID 12) previously existed and had 188 products. When "noaw" was deleted from `shops.json`, its products stayed in `products.json` with `shop.id = 12`. The new "Gaming" shop was assigned the same ID (12) via auto-increment, inheriting all of noaw's orphaned products.

2. **dist/DB desync:** The API runs from `dist/main.js` and reads JSON from `dist/db/pickbazar/`, NOT from `src/db/pickbazar/`. Editing `src/db/pickbazar/products.json` alone had no effect — the file in `dist/db/` still contained the old data. The API restart appeared to pick up nothing because it was reading the stale dist copy.

### The Fix
1. Filtered out 188 products with `shop.id === 12` from `products.json`
2. Copied the updated file to `dist/db/pickbazar/products.json`
3. Restarted API: `pm2 restart api`

### Key Files
- `api/rest/src/db/pickbazar/products.json` — primary data
- `api/rest/dist/db/pickbazar/products.json` — runtime copy (the one the API actually reads)

### What NOT to Do
- Do NOT edit `dist/db/` directly — always edit `src/db/` then copy to `dist/db/`
- Do NOT assume `pm2 restart api` picks up `src/` edits — the `dist/` copy is what matters at runtime
- Do NOT reuse shop IDs that previously belonged to deleted shops — orphaned products may persist

---

## Fake Authentication — No Password Validation (CRITICAL, FIXED in Session 45)

### Symptom
Anyone who knows an email address (`admin@demo.com`, `store_owner@demo.com`) can log in as that user with **any password**. There is no real authentication.

### Root Cause
`api/rest/src/auth/auth.service.ts` `login()` method uses hardcoded email checks and ignores the password entirely:

```typescript
// Current code — completely fake:
async login(loginInput: LoginDto): Promise<AuthResponse> {
    if (loginInput.email === 'admin@demo.com') {
      return {
        token: 'jwt token',              // ← literal string, not a real JWT
        permissions: ['store_owner', 'super_admin'],
        role: 'super_admin',
      };
    }
    // ... more hardcoded email checks
}
```

Additionally:
- No bcrypt or password hashing anywhere — passwords stored in plain text
- No JWT implementation — the "token" is the literal string `"jwt token"`
- No auth guards on any API endpoint — all endpoints are publicly accessible
- No JWT secret or signing key

### Impact
| Vulnerability | Risk |
|---|---|
| Anyone can login as admin | **CRITICAL** — full site takeover |
| API endpoints unprotected | **CRITICAL** — data can be read/modified by anyone |
| No real token validation | **HIGH** — no session security |
| Passwords stored in plaintext | **HIGH** — credential theft if DB leaked |

### The Fix (Implemented in Session 45)
1. ✅ Install bcrypt + @nestjs/jwt + passport-jwt
2. ✅ Hash passwords on register/create with bcrypt
3. ✅ Validate passwords on login (removed hardcoded email checks)
4. ✅ Create real JWT strategy with secret key
5. ✅ Create JwtAuthGuard and protect `/me` endpoint
6. ✅ Setup script created initial super admin (`mhzsajan@gmail.com`)
7. ✅ Remove default demo users from `users.json`

### What still needs doing
- Add JWT guards to more admin endpoints (Phase 3 task — Security headers)

### Key Files
- `api/rest/src/auth/auth.service.ts` — login/register (stub)
- `api/rest/src/auth/auth.module.ts` — needs JWT module
- `api/rest/src/users/users.service.ts` — create() needs hashing

### What NOT to Do
- Do NOT just edit the hardcoded email list as a "quick fix" — the auth is still fake
- Do NOT remove demo users without having a way to create new ones first

---

*Created: Session 17 — June 28, 2026*<br>
*Updated: Session 58 — August 20, 2026*
