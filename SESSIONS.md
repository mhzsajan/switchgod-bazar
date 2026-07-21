# SESSIONS — Session History (Compressed)

> **AI CONTEXT FILE** — One-line summary per session. Details in `.deploy/KNOWN_ISSUES.md` for bugs.

| Session | Date | What Was Done |
|---------|------|---------------|
| 1 | Before conversation | Created setup script, nothing installed yet |
| 2 | Jun 27 | Verified prereqs, created .env files, installed deps (npm, not yarn), built all services |
| 3 | Jun 27 | Fixed API start script, started all via PM2, fixed LAN access, rebuilt with LAN IP |
| 4 | Jun 27 | GitHub CLI login, created repo, committed + pushed all code |
| 5 | Jun 27 | Cloudflare tunnel setup, DNS routing, updated .env to public URLs, rebuilt |
| 6 | Jun 27 | Fixed Google OAuth error, API SHOP_URL, PM2 auto-start on boot |
| 7 | Jun 27 | Added Google Sans Code font via Fontsource CDN |
| 8 | Jun 27 | Created master plan (`.deploy/PLAN.md`), updated `.deploy/README.md` |
| 9 | Jun 27 | Fixed homepage footer, header cleanup, removed dead code |
| 10 | Jun 27 | Cleaned header links (removed Offers, Become a Seller) |
| 11 | Jun 27 | Full header visual audit, removed ~50 lines dead code, standardized spacing |
| 12 | Jun 28 | Full mobile audit — found 67 issues, created `.deploy/AUDIT.md` |
| 13 | Jun 28 | Fixed all 19 HIGH priority mobile issues (touch targets, overlaps, broken features) |
| 14 | Jun 28 | Fixed all 48 MEDIUM + LOW priority mobile issues (z-index, spacing, responsive, dead code) |
| 15 | Jun 28 | Fixed modal close button (z-[70]/z-[80]), back button, swipe-to-go-back |
| 16 | Jun 28 | Attempted add-to-cart redesign (quantity popup), NOT pushed |
| 17 | Jun 28 | Reverted add-to-cart changes, documented root causes in KNOWN_ISSUES.md |
| 18-22 | Jun 28-29 | Dark blue theme (Midjourney-style #06051d), dark mode toggle, surface colors, Phase 10 visual fixes (SSR flash prevention, text-light→text-white, 37 UI fixes across 80+ files) |
| 23 | Jun 29 | Tagged restore point `v1.0-20260629-0926`, backup branch `backup-pre-customization` |
| 24-30 | Jun 29-Jul 9 | 7-layer particle canvas animations (orbs/constellation/streaks), scroll reveals, card hover effects |
| 31 | Jul 9 | Hide shops nav for single-shop mode, redirect / to /grocery |
| 32 | Jul 9 | Footer reorganization — new Policies section, cleaner menu layout |
| 33 | Jul 9 | Color scheme consistency audit — fixed bg-gray-100/200→bg-surface/light across ~45 files, hardcoded hex borders → CSS var classes, color-scheme meta |
| **34** | **Jul 9** | **FULL DARK MODE REVERT** — Hard reset to `ace8c18` (pre-dark-theme light PickBazar). Tagged current state as `v2.0-dark-mode-full`, backup branch `backup-dark-mode-full`. All Sessions 18-33 code removed. Sessions 1-17 preserved. |
| **35** | **Jul 9** | **Shop product filter fix** — Reordered fuzzy search before exact `shop_id` filter in API service. All shops now show correct products. Restored canvas animation on homepage only. |
| **36** | **Jul 17** | **Settings persistence fix** — API's `SettingsService.create()/update()` silently ignored all input data. Fixed to merge + write to `settings.json` on save. Currency change (USD→NPR) now persists to JSON and reflects in shop frontend. |
| **37** | **Jul 17** | **Full API persistence audit** — Audited all 46 API services. Found same bug in 30+ services (shops, products, orders, users, coupons, etc.). Documented in `KNOWN_ISSUES.md`, added Phase 10 to `PLAN.md`. Next: fix shops & products. |
| **38** | **Jul 17** | **Shops + Products persistence fixes** — `create()`/`update()`/`remove()` all persist to JSON files. Rebuilt + API restarted. |
| **39** | **Jul 17** | **Orders persistence fix** — `create()` now builds new order instead of mutating `orders[0]`, pushes to array, persists. `update()`/`remove()`/`stripePay()`/`paypalPay()`/`changeOrderPaymentStatus()` all persist to `orders.json`. Order statuses also fixed. |
| **40** | **Jul 17** | **Coupons, Users, Auth persistence fixes** — coupons create/update/approve/disapprove/remove persist. Users create/update/ban/active/makeAdmin/remove persist. Auth registration now writes new users to `users.json` (was in-memory only). |
| **41** | **Jul 17** | **Categories, Types, Tags persistence fixes** — all three now persist create/update/remove to their respective JSON files. |
| **42** | **Jul 17** | **Reviews, Questions, Wishlists persistence fixes** — all persist to JSON. **Remaining services fixed** — shipping, taxes, attributes, manufacturers, authors, flash sales, store notices. **Admin UI bugs** — removed debug console.log, uncommented image validation error message. Phase 10 complete (10/10). |
| **43** | **Jul 17** | **Shop visibility fix** — `getShops()` `is_active` filter was broken: the proper `data.filter()` was commented out and replaced with `fuse.search("1")` (fuzzy text search for string "1"). Fixed to separate exact filters from fuzzy filters. Approved shops now appear on frontend. |
| **44** | **Jul 17** | **Orphaned products cleanup** — New "Gaming" shop (ID 12) showed 188 phantom products from old deleted "noaw" shop that also had ID 12. Removed from `products.json`. Also discovered API reads JSON from `dist/db/pickbazar/` — `src/db/` edits must be synced to `dist/db/` before restart. |
| **45** | **Jul 17** | **Auth security fix implemented** — Replaced fake login with real bcrypt password hashing + JWT. `AuthService.login()` now validates email + bcrypt password (no more hardcoded email checks). Demo users can't log in (no password hash). `AuthService.register()` and `UsersService.create()` hash passwords. `/me` endpoint protected with JWT guard. Phase 11 tasks 11.1-11.10 complete (10/10). Demo users (`admin@demo.com`, etc.) removed from `users.json`. Only `mhzsajan@gmail.com` remains. |

---

## Key Lessons Learned
- **npm, not yarn** — yarn hangs on this machine
- **API must be running** during shop build (Next.js fetches from API at build time)
- **`NEXT_PUBLIC_*` vars** are baked at build time — rebuild required after .env changes
- **Old DNS CNAME records** block new tunnel routing — must delete first
- **PM2 auto-start:** `pm2 startup` + `pm2 save` after changes
- **Modal z-index:** Dialog `z-[70]`, close button `z-[80]` with `fixed` positioning
- **Add-to-cart:** Intersection observer `threshold: 1` triggers sticky bar on mobile (content taller than viewport)
- **API filter order matters:** Apply fuzzy search (`fuse.search`) BEFORE exact filters (`shop_id`). Doing it in reverse causes fuzzy search on ALL products to overwrite the filtered set.
- **Settings persistence:** API's `SettingsService` initially returned in-memory copy without merging DTO or writing to JSON. Admin UI appeared to save (local React state updated on "success") but data was lost. To fix: merge DTO into in-memory object + `fs.writeFileSync` to `settings.json`. API rebuild + restart required after change.
- **API dist/DB sync:** The API runs from `dist/main.js` and reads DB JSON files from `dist/db/pickbazar/`, NOT `src/db/pickbazar/`. Editing DB files in `src/` requires copying them to `dist/db/` before restart. Rebuilding with `npx nest build` auto-copies them.
