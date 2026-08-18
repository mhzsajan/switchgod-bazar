# COMMANDS — Working Commands Reference

> **v1.1 (Aug 18, 2026):** Email, captcha (Turnstile), Google login, role security and email verification are live. Env vars added: `ADMIN_EMAILS`, `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `GOOGLE_CLIENT_ID` (api) + `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `GOOGLE_CLIENT_ID/SECRET` (shop). See `.deploy/README.md` §6. `npm install` inside shop/admin workspaces FAILS (husky) — use script-tag components, no new deps.

<!-- !! FOR AI: Update this file after EVERY step. Add new working commands, remove broken ones, fix any that changed. Keep it accurate — user copies these directly. !! -->

All commands tested and confirmed working on this machine.
Copy-paste directly — do not modify unless you know what you're doing.

---

## Project Root
```
/home/switchgod/Desktop/New Pickbazar/
```

---

## Install Dependencies

```bash
# API (takes ~2 min)
cd /home/switchgod/Desktop/New Pickbazar/api/rest && npm install --legacy-peer-deps

# Shop (takes ~17 min — run in background)
cd /home/switchgod/Desktop/New Pickbazar/shop && npm install --legacy-peer-deps --maxsockets=2

# Admin (takes ~17 min — run in background)
cd /home/switchgod/Desktop/New Pickbazar/admin/rest && npm install --legacy-peer-deps --maxsockets=2
```

**Note:** If npm hangs, add `--maxsockets=2` to limit connections.

---

## Build

```bash
# API (NestJS) — must be built before shop build
cd /home/switchgod/Desktop/New Pickbazar/api/rest && npx nest build

# Shop (Next.js) — API must be running on :9000 during this build
cd /home/switchgod/Desktop/New Pickbazar/shop && npm run build:rest

# Admin (Next.js)
cd /home/switchgod/Desktop/New Pickbazar/admin/rest && npm run build
```

---

## Run (Production via PM2)

```bash
# Start API
pm2 start dist/main.js --name api --cwd /home/switchgod/Desktop/New Pickbazar/api/rest

# Start Shop on port 3003
pm2 start npm --name shop --cwd /home/switchgod/Desktop/New Pickbazar/shop -- run start -- -p 3003

# Start Admin on port 3002
pm2 start npm --name admin --cwd /home/switchgod/Desktop/New Pickbazar/admin/rest -- run start -- -p 3002

# Check status
pm2 status

# View logs (all or specific)
pm2 logs
pm2 logs shop

# Restart a service
pm2 restart shop

# Stop / Start
pm2 stop shop
pm2 start shop

# Save process list + auto-start on reboot (already configured via systemd)
pm2 save
```

---

## Cloudflare Tunnel

```bash
# Start tunnel via PM2 (already running as 'tunnel')
pm2 start cloudflared --name tunnel -- tunnel run switchgod-tunnel

# Restart tunnel
pm2 restart tunnel

# Tunnel config location
cat /home/switchgod/.cloudflared/config.yml
```

---

## Git

```bash
cd /home/switchgod/Desktop/New\ Pickbazar
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/mhzsajan/pickbazar.git
git push -u origin main
```

---

## Test API

```bash
# Quick test — should return products JSON
curl http://localhost:9000/api/products | head -c 200

# Test via tunnel
curl -s -o /dev/null -w "%{http_code}" https://api.switchgod.com.np/api/products?limit=1
curl -s -o /dev/null -w "%{http_code}" https://switchgod.com.np
curl -s -o /dev/null -w "%{http_code}" https://admin.switchgod.com.np
```

---

## Rebuild Shop (After Font/Config Changes)

```bash
# Clear .next cache + rebuild + restart
cd /home/switchgod/Desktop/New Pickbazar/shop && rm -rf .next && npx next build && pm2 restart shop
```

---

## .env.local IP Addresses (Current)

```bash
# Shop: /home/switchgod/Desktop/New Pickbazar/shop/.env.local
NEXT_PUBLIC_REST_API_ENDPOINT="https://api.switchgod.com.np/api"
NEXT_PUBLIC_ADMIN_URL="https://admin.switchgod.com.np"
NEXTAUTH_URL=https://switchgod.com.np

# Admin: /home/switchgod/Desktop/New Pickbazar/admin/rest/.env.local
NEXT_PUBLIC_REST_API_ENDPOINT="https://api.switchgod.com.np/api"
NEXT_PUBLIC_SHOP_URL="https://switchgod.com.np"
```

**Note:** These are baked in at build time. If you change these, you must rebuild and restart.
```bash
# Rebuild shop (API must be running)
cd /home/switchgod/Desktop/New Pickbazar/shop && npm run build:rest && pm2 restart shop

# Rebuild admin
cd /home/switchgod/Desktop/New Pickbazar/admin/rest && npm run build && pm2 restart admin
```

---

## Cleanup (If Needed)

```bash
# Remove all node_modules (full reinstall)
cd /home/switchgod/Desktop/New\ Pickbazar
rm -rf "api/rest/node_modules" "shop/node_modules" "admin/rest/node_modules"

# Remove .next build caches
rm -rf shop/.next admin/rest/.next
```
