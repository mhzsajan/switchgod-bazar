# RESUME — Read This First

## Where We Stopped
- **New repo:** `mhzsajan/switchgod-bazar` (main). Old repo `mhzsajan/pickbazar` kept as Git reference (old `main` was reset to `ace8c18`).
- **Last completed:** Sessions 49–55 (Aug 18) — custom-domain email, role security fix, email verification, real Google login, dist/db crash fix, Turnstile captcha on registration + login, admin logout menu fix. See SESSIONS.md for details.
- **Role security:** ✅ `register()` grants `customer` only. Admins auto-promoted via `ADMIN_EMAILS` env = `mhzsajan@gmail.com,admin@switchgod.com.np` (both are verified super_admins, ids 4 & 5).
- **Email (all live):** ✅ Sending from `support@switchgod.com.np` via Gmail SMTP (MAIL_FROM). Receiving: Cloudflare Email Routing forwards `support@`/`admin@`/`info@switchgod.com.np` → mhzsajan@gmail.com (zone `7b412d7e52599a85d466c88551d9aa1f` — NOT `4c31a7c6...` which is aussiebazar.com.au). Flows: password reset code (30min, `password-resets.json`), email verification code (30min, `email-verifications.json`), welcome, shop created/approved, order confirmation.
- **Captcha (Turnstile):** ✅ Registration + login, storefront + admin. Widget created via CF API: site key `0x4AAAAAAEUG15igFGFiQJMU`, secret in `TURNSTILE_SECRET_KEY` (api/rest/.env). Skipped server-side when secret unset.
- **Google login:** ✅ Real (access-token verification). OAuth creds in shop/.env.local (`GOOGLE_CLIENT_ID/SECRET`) + API `GOOGLE_CLIENT_ID` for aud check. Redirect URIs on the OAuth client: `https://switchgod.com.np/api/auth/callback/google`, `http://localhost:3001/api/auth/callback/google`.
- **Remaining stubs (by design / pending):** Phone OTP login (SKIP per user — needs Twilio or Nepal SMS provider), wallet add-points, AI descriptions (needs OpenAI key), Stripe/PayPal (need API keys), `approveShopWithCommissionSchema` admin import warning (pre-existing).

## What Works Now
| Service | Port | PM2 | Status | Domain |
|---------|------|-----|--------|--------|
| API | 9000 | api | Running | api.switchgod.com.np |
| Shop | 3003 | shop | Running | switchgod.com.np |
| Admin | 3002 | admin | Running | admin.switchgod.com.np |
| Tunnel | — | tunnel | Running | — |

## Quick Status
- Prerequisites: Node 18, npm, git, PM2, cloudflared, gh CLI
- Build: All 3 services built and running via PM2. **NOTE:** API rebuild wipes `dist/db` — all 20 db services now `mkdirSync` before dual-write (don't regress)
- Admin login: `mhzsajan@gmail.com` / `Pass@123` (captcha now required on login/register)
- OTP stub endpoints still return fake `'jwt token'` — phone login button doesn't work (by design)
- Git: `mhzsajan/switchgod-bazar`, branch `main`
- Public URLs: switchgod.com.np, admin.switchgod.com.np, api.switchgod.com.np
- Font: Google Sans Code (SIL Open Font License)
- Mobile: All 67 audit issues fixed (Phase 8)
- Settings persistence: ✅ API persists settings changes to `settings.json` (Session 36 fix)
- Currency: ✅ Set to NPR via Admin Dashboard (Nepalese Rupee)
- **API persistence:** ✅ **Phase 10 complete** (Sessions 36-42) — all 30+ services persist create/update/delete to JSON files
- Theme: Pure light mode only — NO dark mode, NO dark toggle, NO canvas animations
- Dark mode backup: `git checkout v2.0-dark-mode-full` to restore full dark mode state

## Rules
- **npm, NOT yarn** (yarn hangs). Always `npm install --legacy-peer-deps`
- **npm install in shop/admin workspaces fails** (husky + .git). Avoid new deps there; vendor scripts via script-tag components instead
- **After changes:** `rm -rf .next` before rebuild
- **Don't push** until user approves on localhost
- **Beginner user** — explain commands before running
- **Shop:** `next start` on port 3003. **Admin:** `next start -p 3002`. **API:** `node dist/main.js` on port 9000
- **API must be running** when building shop (Next.js fetches from API at build time)
- **VS Code can be closed** — PM2 runs as background daemon

## Commands
```bash
pm2 status                    # Check all services
pm2 restart shop              # Restart a service
pm2 save                      # Save process list

# Rebuild shop (API must be running)
cd /home/switchgod/Desktop/New Pickbazar/shop && rm -rf .next && npm run build:rest && pm2 restart shop

# Rebuild admin
cd /home/switchgod/Desktop/New Pickbazar/admin/rest && rm -rf .next && npx next build && pm2 restart admin

# Rebuild API
cd /home/switchgod/Desktop/New Pickbazar/api/rest && npx nest build && pm2 restart api
```
