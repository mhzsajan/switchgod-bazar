# switchgod.com.np — PickBazar Deployment Project

> **AI CONTEXT FILE** — Read this first. Full project context, services, architecture, and instructions.

---

## 1. Project Identity

| Field | Value |
|-------|-------|
| **Project** | PickBazar e-commerce monorepo (v11.10.2 by RedQ) |
| **Owner** | switchgod |
| **Domain** | switchgod.com.np (Cloudflare) |
| **Host** | Ubuntu 24.04 desktop, hostname `switchserver` |
| **Path** | `/home/switchgod/Desktop/New Pickbazar/` |
| **Goal** | Self-hosted, exposed via Cloudflare Tunnel |
| **Actual Use** | Single-company multi-department store (NOT multi-vendor marketplace) |

## 1a. Important — How We Use This Platform

> **AI NOTE:** PickBazar is designed as a multi-vendor marketplace (many vendors each have their own shop). We use it differently.

**Our setup (Option A):** We are **one company** with multiple departments. Each department is created as a "Shop" in the system:

| Department (Shop name in system) | Products |
|---|---|
| Auto Parts Shop | Car batteries, tires, engine oil |
| Gaming Shop | Consoles, controllers, games |
| Electronics Shop | Laptops, phones, chargers |
| Computer IT Shop | Monitors, keyboards, cables |
| Music Shop | Guitars, headphones, speakers |

**Key implications for AI agents:**

- We are the ONLY vendor. No external sellers. No "Become a Seller" flow needed.
- "Shop" = department. "Shops page" = department listing page.
- The homepage grid of shops shows our departments — this is correct behavior for our use case.
- Frontend modifications should preserve this mental model. Don't remove the shop grid unless explicitly asked.
- The `is_active` filter fix (Session 43) is critical — new departments must be approved before appearing.
- We use **NPR** (Nepalese Rupee) as currency, set via Admin Dashboard (Session 36 fix).
- All prices are in NPR.
- See `.deploy/EMPLOYEE_MANUAL.md` for beginner instructions given to staff.

---

## 2. Monorepo Structure

```
pickbazar/
├── shop/           # Next.js 13.5 storefront (React 18, Tailwind) → port 3003
├── admin/rest/     # Admin dashboard (Next.js 13.5) → port 3002
├── api/rest/       # Backend API (NestJS, in-memory mock data) → port 9000
├── .deploy/        # This folder — scripts, plan, audit, context
│   ├── README.md   # This file
│   ├── PLAN.md     # Master plan (112 tasks across 9 phases)
│   ├── AUDIT.md    # Mobile audit (67 issues, all fixed)
│   └── KNOWN_ISSUES.md  # Bugs, root causes, what NOT to try
└── deployment/     # Original deployment docs (reference only)
```

**We use REST only** (shop + admin/rest + api/rest). GraphQL variants ignored.

---

## 3. Services

| Service | Folder | Port | PM2 | Public URL |
|---------|--------|------|-----|------------|
| API | `api/rest` | 9000 | `api` | api.switchgod.com.np |
| Shop | `shop` | 3003 | `shop` | switchgod.com.np |
| Admin | `admin/rest` | 3002 | `admin` | admin.switchgod.com.np |
| Tunnel | — | — | `tunnel` | — |

All run under PM2 with auto-start on boot (systemd).

---

## 4. Current Status

| Step | Status |
|------|--------|
| Prerequisites installed | ✅ Node 18, npm, git, PM2, cloudflared, gh |
| Dependencies installed | ✅ All 3 (npm + --legacy-peer-deps) |
| .env files created | ✅ All 3 with public domain URLs |
| Services built | ✅ API, Shop, Admin |
| PM2 running | ✅ api, shop, admin, tunnel |
| PM2 auto-start | ✅ systemd + pm2 save |
| Git pushed | ✅ **mhzsajan/switchgod-bazar** (private, branch `main`) — fresh start Aug 18; old repo `mhzsajan/pickbazar` kept as reference |
| Cloudflare Tunnel | ✅ switchgod-tunnel, 3 DNS routes |
| Public URLs | ✅ switchgod.com.np, admin.*, api.* |
| Font | ✅ Google Sans Code (SIL Open Font License) |
| Mobile audit | ✅ 67/67 issues fixed (Phase 8) |
| Modal UX | ✅ Close button, back button, swipe-to-go-back |
| Add-to-cart | ⚠️ Reverted, root causes in KNOWN_ISSUES.md |
| Settings persistence | ✅ API `SettingsService` now writes to `settings.json` on save |
| Currency | ✅ Set to NPR (Nepalese Rupee) via Admin Dashboard |
| API persistence (all services) | ✅ Phase 10 complete — all 30+ services persist to JSON on create/update/delete |
| Auth security | ✅ **FIXED** — bcrypt password hashing, real JWT, hardcoded email checks removed. `/me` endpoint guarded. See Phase 11 |
| Role security | ✅ **FIXED (S50)** — register grants `customer` only; admins via `ADMIN_EMAILS` env |
| Email verification | ✅ **FIXED (S50)** — 6-digit code, `/me` 409 until verified, verify-email page UI |
| Email (sending) | ✅ **LIVE (S48-49)** — Gmail SMTP from `support@switchgod.com.np` (alias), reset/verify/welcome/order/shop emails |
| Email (receiving) | ✅ **LIVE (S49)** — Cloudflare Email Routing: support@/admin@/info@switchgod.com.np → Gmail |
| Google login | ✅ **FIXED (S51)** — real token verification, auto-create customer, real JWT |
| Captcha | ✅ **LIVE (S53-54)** — Cloudflare Turnstile on register + login (storefront + admin) |
| Admin logout menu | ✅ **FIXED (S55)** — role derived from permissions, logout always visible |
| Theme | ✅ **Pure light mode** — no dark mode, no dark toggle |
| Dark mode backup | 🔄 Tag `v2.0-dark-mode-full`, branch `backup-dark-mode-full` |

---

## 5. Architecture

```
You (VS Code) ──git push──> GitHub (mhzsajan/pickbazar)
                                    │
                              GitHub Webhook (not set up)
                                    │
                        switchserver pulls + rebuilds
                                    │
                  ┌─────────────────┼─────────────────┐
                  │                 │                 │
             shop :3003       admin :3002        api :9000
                  │                 │                 │
                  └─────────────────┴── Cloudflare Tunnel ──> Internet
                                                         │
                                               switchgod.com.np
                                               admin.switchgod.com.np
                                               api.switchgod.com.np
```

---

## 6. Environment Variables

### api/rest/.env (gitignored — contains secrets)
```env
APP_NAME=PickBazar
PORT=9000
DEFAULT_CURRENCY=USD
SHOP_URL=https://switchgod.com.np
# Email (Gmail SMTP, app password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=mhzsajan@gmail.com
SMTP_PASS=<gmail app password>
MAIL_FROM=support@switchgod.com.np
FRONTEND_URL=https://switchgod.com.np
ADMIN_EMAIL=mhzsajan@gmail.com
# Admin promotion (comma-separated; get super_admin on register)
ADMIN_EMAILS=mhzsajan@gmail.com,admin@switchgod.com.np
# Cloudflare Turnstile (created via CF API)
TURNSTILE_SITE_KEY=0x4AAAAAAEUG15igFGFiQJMU
TURNSTILE_SECRET_KEY=<secret>
# Google login aud check (optional)
GOOGLE_CLIENT_ID=1077694169384-...apps.googleusercontent.com
```

### shop/.env.local (gitignored — contains secrets)
```env
FRAMEWORK_PROVIDER="rest"
NEXT_PUBLIC_REST_API_ENDPOINT="https://api.switchgod.com.np/api"
APPLICATION_MODE=production
NEXT_PUBLIC_ADMIN_URL="https://admin.switchgod.com.np"
NEXTAUTH_URL=https://switchgod.com.np
SECRET=<random — was "your-secret-key-change-this", regenerated S51>
GOOGLE_CLIENT_ID=1077694169384-...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAEUG15igFGFiQJMU
NEXT_PUBLIC_SITE_URL=https://switchgod.com.np
NEXT_PUBLIC_VERSION=11.10.2
```

### admin/rest/.env.local
```env
NEXT_PUBLIC_REST_API_ENDPOINT="https://api.switchgod.com.np/api"
NEXT_PUBLIC_SHOP_URL="https://switchgod.com.np"
APPLICATION_MODE=production
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAEUG15igFGFiQJMU
NEXT_PUBLIC_VERSION=11.10.2
```

**Note:** These are baked in at build time. Change = rebuild + restart.

---

## 7. AI Instructions — How to Resume

1. Read `RESUME.md` first — where we stopped, rules, commands
2. Read this file — full project context
3. Read `.deploy/PLAN.md` — active work plan (112 tasks)
4. Read `.deploy/KNOWN_ISSUES.md` — bugs and root causes
5. Find first incomplete task in PLAN.md and continue
6. **npm, not yarn** — always `npm install --legacy-peer-deps`
7. After changes: `rm -rf .next` before rebuild
8. Don't push until user approves on localhost
9. User is beginner — explain commands before running
10. **⚠️ API reads JSON from `dist/db/pickbazar/`, NOT `src/db/pickbazar/`** — after editing DB files in `src/`, copy them to `dist/db/` before restart

---

## 8. Commands

```bash
# PM2
pm2 status
pm2 restart shop
pm2 save

# Rebuild shop (API must be running)
cd /home/switchgod/Desktop/New Pickbazar/shop && rm -rf .next && npm run build:rest && pm2 restart shop

# Rebuild admin
cd /home/switchgod/Desktop/New Pickbazar/admin/rest && rm -rf .next && npx next build && pm2 restart admin

# Rebuild API
cd /home/switchgod/Desktop/New Pickbazar/api/rest && npx nest build && pm2 restart api

# Quick DB edit (no rebuild) — copy updated JSON to dist/
cp api/rest/src/db/pickbazar/*.json api/rest/dist/db/pickbazar/ && pm2 restart api
```

---

*Created: Session 2 — June 27, 2026*
*Last updated: Session 42 — July 17, 2026*
