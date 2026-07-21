# scripts/

This folder contains all shell scripts and helpers for the switchgod.com.np deployment.
Run them in order, from the project root `/home/switchgod/Desktop/New Pickbazar/`.

| Script | Step | Status | Run command |
|---|---|---|---|
| `setup-prereqs.sh` | Step 1 | **DONE** ✅ | `bash scripts/setup-prereqs.sh` (already used) |
| `setup-env.sh` | Step 2 | **SKIPPED** | Created .env files manually instead |
| `install-deps.sh` | Step 2 | **SKIPPED** | Ran `npm install --legacy-peer-deps` manually per service |
| `build-all.sh` | Step 3 | NOT CREATED YET | Will build shop, admin, api |
| `pm2-start.sh` | Step 7 | NOT CREATED YET | Starts all 3 services + tunnel under PM2 |
| `cloudflare-tunnel.sh` | Step 5 | NOT CREATED YET | Creates tunnel + DNS routes |
| `webhook-server.js` | Step 8 | NOT CREATED YET | Auto-deploy listener for GitHub webhooks |

## Context Files (in project root)

| File | Purpose | Size |
|---|---|---|
| `RESUME.md` | **Read this first** — where we stopped, what works, next command | ~50 lines |
| `SESSIONS.md` | What happened each session, problems, solutions | ~100 lines |
| `COMMANDS.md` | Copy-paste commands that actually work | ~120 lines |
| `.deploy/README.md` | Full project reference (read only if needed) | ~280 lines |

## Notes
- `setup-prereqs.sh` was created in Session 1 and used successfully in Session 2.
- Steps 1-2 scripts are not needed since we did everything manually.
- Future scripts will be created during their corresponding steps.
- **Important:** Always use `npm` not `yarn` for installs (yarn has a bug on this machine).
