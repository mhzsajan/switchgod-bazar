# RESUME — Read This First

## Where We Stopped
- **New repo (fresh start, 2026-08-18):** Git history restarted as `mhzsajan/switchgod-bazar` (3 commits). Old repo `mhzsajan/pickbazar` kept on GitHub as reference.
- **Last completed:** Session 46 — Restored all persistence fixes from old repo (19 services). `create()`/`update()`/`remove()` now save to JSON. Shop creation fixed and verified.
- **⚠️ IMPORTANT FIX (better than old repo):** `saveToFile()` now writes to BOTH `src/db/pickbazar/` AND `dist/db/pickbazar/`. Old repo only wrote `src/` — data was silently lost on restart. Verify with `grep test-shop api/rest/dist/db/pickbazar/shops.json`.
- **Auth status:** Real bcrypt+JWT (Session 47). Login: `mhzsajan@gmail.com` / `Pass@123` — the ONLY user (all demo users deleted). Wrong password → 401. `/me` protected by JWT guard.
- **Old repo docs (PLAN.md etc.) describe the old project** — validate before trusting numbers.

## What Works Now
| Service | Port | PM2 | Status | Domain |
|---------|------|-----|--------|--------|
| API | 9000 | api | Running | api.switchgod.com.np |
| Shop | 3003 | shop | Running | switchgod.com.np |
| Admin | 3002 | admin | Running | admin.switchgod.com.np |
| Tunnel | — | tunnel | Running | — |

## Quick Status
- Prerequisites: Node 18, npm, git, PM2, cloudflared, gh CLI
- Build: All 3 services built and running via PM2
- PM2 auto-start: Configured via systemd
- Git: mhzsajan/pickbazar (private) — `main` reset to `ace8c18` (force pushed)
- Public URLs: switchgod.com.np, admin.switchgod.com.np, api.switchgod.com.np
- Font: Google Sans Code (SIL Open Font License)
- Mobile: All 67 audit issues fixed (Phase 8)
- Modal UX: Close button, back button, swipe-to-go-back — all working
- Add-to-cart: ⚠️ Issues found, code reverted, root causes documented
- Settings persistence: ✅ API now persists settings changes to `settings.json` (Session 36 fix)
- Currency: ✅ Set to NPR via Admin Dashboard (Nepalese Rupee)
- **API persistence:** ✅ **Phase 10 complete** (Sessions 36-42) — all 30+ services persist create/update/delete to JSON files
- Theme: Pure light mode only — NO dark mode, NO dark toggle, NO canvas animations
- Dark mode backup: `git checkout v2.0-dark-mode-full` to restore full dark mode state

## Rules
- **npm, NOT yarn** (yarn hangs). Always `npm install --legacy-peer-deps`
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
