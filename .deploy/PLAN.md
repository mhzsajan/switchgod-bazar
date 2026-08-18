# PLAN — Customization, SEO, Mobile, Security & Bugs

> **AI CONTEXT FILE** — Master plan for improving the shop. Read `.deploy/README.md` first. Work through phases in order (1 → 8). After each task, update status and push to GitHub.

---

## Phase 1 — Customization (Branding & Visual)

| # | Task | Status |
|---|------|--------|
| 1.1 | Replace PickBazar logo with your own logo | `[ ]` |
| 1.2 | Replace favicon | `[ ]` |
| 1.3 | Change accent/theme colors to match your brand | `[ ]` |
| 1.4 | Update site title and subtitle | `[ ]` |
| 1.5 | Update footer content (contact info, social links, copyright) | `[ ]` |
| 1.6 | Add/replace homepage banner images | `[ ]` |
| 1.7 | Update shop names and descriptions | `[ ]` |
| 1.8 | Replace placeholder product images | `[ ]` |

**Key files:** `shop/public/logo.svg`, `shop/src/config/site.ts`, `shop/src/assets/css/main.css`, `api/rest/src/db/pickbazar/settings.json`

---

## Phase 2 — SEO (Google-Friendly)

| # | Task | Status |
|---|------|--------|
| 2.1 | Fix sitemap.xml + robots.txt — hardcoded `localhost:3000` | `[ ]` |
| 2.2 | Add `NEXT_PUBLIC_SITE_URL` env var for sitemap/robots | `[ ]` |
| 2.3 | Fill SEO settings in API seed data (meta title, description, OG tags) | `[ ]` |
| 2.4 | Add JSON-LD structured data (Organization, Product, BreadcrumbList) | `[ ]` |
| 2.5 | Add per-page SEO for shops, products, categories | `[ ]` |
| 2.6 | Verify canonical URLs are correct | `[ ]` |

**Key files:** `shop/next-sitemap.config.js`, `shop/.env.local`, `api/rest/src/db/pickbazar/settings.json`

---

## Phase 3 — Security (Hacker-Proof)

| # | Task | Status |
|---|------|--------|
| 3.1 | Add security headers via `next.config.js` (CSP, X-Frame-Options, HSTS, etc.) | `[ ]` |
| 3.2 | Lock down CORS in API (restrict to your domains only) | `[ ]` |
| 3.3 | Add rate limiting to API | `[ ]` |
| 3.4 | Add `helmet` middleware to NestJS API | `[ ]` |
| 3.5 | Audit `dangerouslySetInnerHTML` — verify all 12 instances use `sanitize-html` | `[ ]` |

**Key files:** `shop/next.config.js`, `api/rest/src/main.ts`

---

## Phase 4 — Mobile-Friendly

| # | Task | Status |
|---|------|--------|
| 4.1 | Test mobile navigation flow — fix any touch/click issues | `[ ]` |
| 4.2 | Fix mobile search UX (full-width, easy close) | `[ ]` |
| 4.3 | Optimize mobile page load (reduce JS bundle, lazy load offscreen) | `[ ]` |
| 4.4 | Test all forms on mobile (login, register, contact, checkout) | `[ ]` |
| 4.5 | Verify PWA manifest is correct (icons, theme color, start_url) | `[ ]` |

**Key files:** `mobile-navigation.tsx`, `mobile-main-menu.tsx`, `header.tsx`

---

## Phase 5 — UI Navigation Fix

| # | Task | Status |
|---|------|--------|
| 5.1 | Clean up header links (11 links is too many — prioritize) | `[x]` |
| 5.2 | Add breadcrumbs for deep pages (product, shop, category) | `[ ]` |
| 5.3 | Add "back to top" button on long pages | `[ ]` |
| 5.4 | Fix footer — ensure all links work, no dead ends | `[x]` |
| 5.5 | Add loading skeletons instead of blank screens | `[ ]` |

---

## Phase 6 — Bug Fixes

| # | Task | Status |
|---|------|--------|
| 6.1 | Remove `typescript: { ignoreBuildErrors: true }` — fix underlying errors | `[ ]` |
| 6.2 | Remove `eslint: { ignoreDuringBuilds: true }` — fix lint warnings | `[ ]` |
| 6.3 | Add React error boundary (catches white screen crashes) | `[ ]` |
| 6.4 | Remove unused Google Fonts (Roboto, Raleway, Lato, Rubik, Open Sans) | `[ ]` |
| 6.5 | Audit and fix any broken internal links | `[ ]` |

**Key files:** `next.config.js`, `custom-plugins.css`

---

## Phase 7 — Performance

| # | Task | Status |
|---|------|--------|
| 7.1 | Remove unused font imports (5 fonts loaded, only Google Sans Code used) | `[ ]` |
| 7.2 | Add `loading="lazy"` to below-fold images | `[ ]` |
| 7.3 | Add blur placeholders to `next/image` components | `[ ]` |

---

## Phase 8 — Mobile Visual/UX Fixes (All 67 Issues Fixed ✅)

> All 67 issues from `.deploy/AUDIT.md` are fixed. See AUDIT.md for full details.

**Status:** ✅ Complete (Sessions 13-14)

---

## Phase 9 — Add-to-Cart Flow (REVERTED — Root Causes Documented)

> All changes reverted. Root causes documented in `.deploy/KNOWN_ISSUES.md`.

| # | Task | Status | Priority |
|---|------|--------|----------|
| 9.1 | 2 "+ Cart" buttons in product popup | `[ ]` | HIGH |
| 9.2 | Counter position after adding (appears at bottom) | `[ ]` | HIGH |
| 9.3 | Popup scroll position when switching products | `[ ]` | MEDIUM |
| 9.4-9.8 | Other add-to-cart issues (REVERTED) | `[ ]` | — |

**Key files:** `add-to-cart.tsx`, `add-to-cart-btn.tsx`, `popup.tsx`, `details.tsx`, `short-details.tsx`

---

## Phase 10 — API Persistence (Data Actually Saves)

> **HIGH PRIORITY** — Without this, creating/editing anything in the admin does nothing. All 30+ API services ignore input data and return static mock records.

| # | Task | Status | Priority |
|---|------|--------|----------|
| 10.1 | Fix **shops** service — create/update/approve persist to `shops.json` | `[x]` | **HIGH** |
| 10.2 | Fix **products** service — create/update persist to `products.json` | `[x]` | **HIGH** |
| 10.3 | Fix **orders** service — create/update/payment status persist to `orders.json` | `[x]` | **HIGH** |
| 10.4 | Fix **coupons** service — create/update/approve persist to `coupons.json` | `[x]` | **HIGH** |
| 10.5 | Fix **users** service — create/update/ban persist to `users.json` | `[x]` | **HIGH** |
| 10.6 | Fix **auth registration** — new users persist to `users.json` (not just in-memory) | `[x]` | **HIGH** |
| 10.7 | Fix **categories, types, tags** services | `[x]` | MEDIUM |
| 10.8 | Fix **reviews, questions, wishlists** services | `[x]` | MEDIUM |
| 10.9 | Fix **remaining services** (shipping, taxes, flash sales, attributes, manufacturers, authors, store notices) | `[x]` | LOW |
| 10.10 | Fix **admin UI bugs** (image validation uncommented, `console.log` commented out in shop form) | `[x]` | LOW |

**Key files:** All files under `api/rest/src/*/`. See `.deploy/KNOWN_ISSUES.md` → "Widespread API Persistence Bug" for full details.

**Fix pattern** (same as Settings in Session 36):
1. After mutating in-memory data, call `saveToFile()` that writes to the corresponding `src/db/pickbazar/*.json`
2. `create()` should push new items to arrays, `update()` should merge into existing items
3. After each fix: `npx nest build && pm2 restart api`

---

## Phase 11 — Auth Security (Real Login)

> **CRITICAL** — Current auth is completely fake: any password works, token is literal string `"jwt token"`, no API endpoints are protected. Site is public on internet.

| # | Task | Status | Priority |
|---|------|--------|----------|
| 11.1 | Install `bcrypt`, `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt` | `[x]` | **CRITICAL** |
| 11.2 | Update `AuthService.register()` — hash password with bcrypt before saving | `[x]` | **CRITICAL** |
| 11.3 | Update `UsersService.create()` — hash password with bcrypt | `[x]` | **CRITICAL** |
| 11.4 | Update `AuthService.login()` — validate email + compare password with bcrypt (remove hardcoded email checks) | `[x]` | **CRITICAL** |
| 11.5 | Create JWT strategy (passport-jwt) with a secret key | `[x]` | **CRITICAL** |
| 11.6 | Create JwtAuthGuard and apply to `/me` endpoint | `[x]` | **CRITICAL** |
| 11.7 | Create setup script to add initial super admin (`mhzsajan@gmail.com`) with hashed password | `[x]` | **CRITICAL** |
| 11.8 | Remove default demo users (`admin@demo.com`, `store_owner@demo.com`, `customer@demo.com`) from users.json | `[x]` | HIGH |
| 11.9 | Add JWT secret to auth module (uses default secret, works without .env) | `[x]` | HIGH |
| 11.10 | Rebuild API, restart, verify login works with real credentials | `[x]` | **CRITICAL** |

**Key files:**
- `api/rest/src/auth/auth.service.ts` — login/register (currently hardcoded stub)
- `api/rest/src/auth/auth.module.ts` — add JWT module import
- `api/rest/src/users/users.service.ts` — create() needs password hashing
- `api/rest/src/db/pickbazar/users.json` — will store hashed passwords
- `api/rest/src/main.ts` — add global guards or enable CORS for auth
- `api/rest/.env` — add JWT_SECRET

**Important:** Only protect admin endpoints. Public endpoints (products, shops, categories, types, settings GET) must remain open for the shop frontend to work.

---

## Phase 12 — Auth Hardening & Email (Sessions 48-55, DONE ✅)

> Custom-domain email, role security, email verification, Google login, Turnstile captcha, crash fixes.

| # | Task | Status |
|---|------|--------|
| 12.1 | Email system — MailModule + MailService (Gmail SMTP), reset/verify/welcome/order/shop emails | `[x]` S48 |
| 12.2 | Custom domain email — Cloudflare Email Routing (support@/admin@/info@ → Gmail), Gmail send-as alias, MAIL_FROM=support@switchgod.com.np | `[x]` S49 |
| 12.3 | Role security — register() grants customer only; ADMIN_EMAILS env promotion | `[x]` S50 |
| 12.4 | Mandatory email verification — 6-digit code, /me 409, verify-email endpoints + UI | `[x]` S50 |
| 12.5 | Real Google login — token verification + aud check | `[x]` S51 |
| 12.6 | dist/db ENOENT crash — mkdirSync in all 20 dual-write services | `[x]` S52 |
| 12.7 | Turnstile captcha — registration (storefront + admin) | `[x]` S53 |
| 12.8 | Turnstile captcha — login (storefront + admin) | `[x]` S54 |
| 12.9 | Admin logout menu fix — role derivation + unconditional logout link | `[x]` S55 |

**Deferred (needs external accounts/keys):** Phone OTP login (SMS provider — user said skip), Stripe/PayPal (API keys), AI descriptions (OpenAI key), wallet add-points.

---

## Summary

| Phase | Focus | Tasks | Done | Remaining |
|-------|-------|-------|------|-----------|
| 1 — Customization | Branding | 8 | 0 | 8 |
| 2 — SEO | Google-friendly | 6 | 0 | 6 |
| 3 — Security | Hacker-proof | 5 | 0 | 5 |
| 4 — Mobile | Mobile-friendly | 5 | 0 | 5 |
| 5 — Navigation | UI navigation | 5 | 2 | 3 |
| 6 — Bugs | Bug fixes | 5 | 0 | 5 |
| 7 — Performance | Speed | 3 | 0 | 3 |
| 8 — Mobile Audit | Visual/UX fixes | 67 | 67 | 0 |
| 9 — Add-to-Cart | Flow redesign | 8 | 0 | 8 |
| **10 — API Persistence** | **Data actually saves** | **10** | **10** | **0** |
| **11 — Auth Security** | **Real login + JWT** | **10** | **10** | **0** |
| **Total** | | **132** | **89** | **43** |

---
*Created: Session 7 — June 27, 2026*
*Last updated: Session 44 — July 17, 2026*
