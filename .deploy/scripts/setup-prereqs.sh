#!/bin/bash
# setup-prereqs.sh
# Installs all prerequisites for the switchgod.com.np PickBazar deployment.
# Run once on a fresh Ubuntu 24.04 machine as your normal user (not root).
# You will be prompted for your sudo password.
#
# What this installs:
#   - git & build-essential
#   - Node.js 18 LTS (via NodeSource)
#   - Yarn 1.22.22 (via corepack, ships with Node)
#   - PM2 (process manager — keeps services alive)
#   - cloudflared (Cloudflare Tunnel client)
#   - gh (GitHub CLI — for creating repos from terminal)
#
# Usage:
#   bash scripts/setup-prereqs.sh

set -e  # Exit immediately if any command fails

echo "=== [1/6] Installing git & build tools ==="
sudo apt-get update -y
sudo apt-get install -y git curl ca-certificates gnupg build-essential

echo "=== [2/6] Installing Node.js 18 LTS (via NodeSource) ==="
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
echo "Node: $(node --version)  npm: $(npm --version)"

echo "=== [3/6] Enabling Yarn (via corepack, ships with Node) ==="
sudo corepack enable
corepack prepare yarn@1.22.22 --activate
echo "Yarn: $(yarn --version)"

echo "=== [4/6] Installing PM2 (process manager) globally ==="
sudo npm install -g pm2
echo "PM2: $(pm2 --version)"

echo "=== [5/6] Installing Cloudflare Tunnel client (cloudflared) ==="
curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null
echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared $(lsb_release -cs) main" \
  | sudo tee /etc/apt/sources.list.d/cloudflared.list
sudo apt-get update -y
sudo apt-get install -y cloudflared
echo "cloudflared: $(cloudflared --version)"

echo "=== [6/6] Installing GitHub CLI (gh) ==="
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
  | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] \
  https://cli.github.com/packages stable main" \
  | sudo tee /etc/apt/sources.list.d/github-cli.list >/dev/null
sudo apt-get update -y
sudo apt-get install -y gh
echo "gh: $(gh --version | head -1)"

echo ""
echo "============================================"
echo "  ALL PREREQUISITES INSTALLED SUCCESSFULLY"
echo "============================================"
echo ""
echo "Next step: run  bash scripts/setup-env.sh"
echo "(See README.md Step 2)"
