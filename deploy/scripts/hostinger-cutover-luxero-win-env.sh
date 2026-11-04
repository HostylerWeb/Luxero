#!/usr/bin/env bash
# Point Hostinger production env at luxero.win (run on VPS as root).
set -euo pipefail

set_kv() {
  local file=$1 key=$2 val=$3
  if grep -q "^${key}=" "$file" 2>/dev/null; then
    sed -i "s|^${key}=.*|${key}=${val}|" "$file"
  else
    echo "${key}=${val}" >>"$file"
  fi
}

APP=/root/luxero-app.env
CLIENT=/root/luxero-client.env
ADMIN=/root/luxero-admin.env
SHOP=/root/luxero-shop.env
CLIENT_AGRO=/root/luxero-client-agro.env
ADMIN_AGRO=/root/luxero-admin-agro.env
LINK=/root/luxero-link.env

ASSETS=https://assets.luxero.win
ASSET_BASE="${ASSETS}/luxero-assets"

# Turnstile (optional): export TURNSTILE_SITE_KEY + TURNSTILE_SECRET_KEY before running.
if [[ -n "${TURNSTILE_SITE_KEY:-}" && -n "${TURNSTILE_SECRET_KEY:-}" ]]; then
  set_kv "$APP" NEXT_PUBLIC_TURNSTILE_SITE_KEY "$TURNSTILE_SITE_KEY"
  set_kv "$APP" PUBLIC_ENV__TURNSTILE_SITE_KEY "$TURNSTILE_SITE_KEY"
  set_kv "$APP" TURNSTILE_SECRET_KEY "$TURNSTILE_SECRET_KEY"
  echo "Updated Turnstile keys in luxero-app.env (rebuild admin + admin-agro)."
fi

set_kv "$APP" S3_ENDPOINT "$ASSETS"
set_kv "$APP" ASSET_BASE_URL "$ASSET_BASE"
set_kv "$APP" NEXT_PUBLIC_ASSET_BASE_URL "$ASSET_BASE"
set_kv "$APP" SHOP_URL https://shop.luxero.win
set_kv "$APP" NEXT_PUBLIC_SHOP_URL https://shop.luxero.win

set_kv "$CLIENT" APP_URL https://luxero.win
set_kv "$CLIENT" PUBLIC_ENV__APP_URL https://luxero.win
set_kv "$CLIENT" PUBLIC_ENV__ADMIN_URL https://admin.luxero.win
set_kv "$CLIENT" BETTER_AUTH_URL https://luxero.win

set_kv "$ADMIN" APP_URL https://admin.luxero.win
set_kv "$ADMIN" ADMIN_URL https://admin.luxero.win
set_kv "$ADMIN" BETTER_AUTH_URL https://admin.luxero.win
set_kv "$ADMIN" ADMIN_BETTER_AUTH_URL https://admin.luxero.win
set_kv "$ADMIN" NEXT_PUBLIC_ADMIN_URL https://admin.luxero.win
set_kv "$ADMIN" NEXT_PUBLIC_APP_URL https://admin.luxero.win
set_kv "$ADMIN" NEXT_PUBLIC_FRONTEND_URL https://luxero.win

set_kv "$SHOP" APP_URL https://shop.luxero.win

set_kv "$CLIENT_AGRO" APP_URL https://agro.luxero.win
set_kv "$CLIENT_AGRO" PUBLIC_ENV__APP_URL https://agro.luxero.win
set_kv "$CLIENT_AGRO" PUBLIC_ENV__ADMIN_URL https://admin.agro.luxero.win
set_kv "$CLIENT_AGRO" BETTER_AUTH_URL https://agro.luxero.win

set_kv "$ADMIN_AGRO" APP_URL https://admin.agro.luxero.win
set_kv "$ADMIN_AGRO" ADMIN_URL https://admin.agro.luxero.win
set_kv "$ADMIN_AGRO" BETTER_AUTH_URL https://admin.agro.luxero.win
set_kv "$ADMIN_AGRO" ADMIN_BETTER_AUTH_URL https://admin.agro.luxero.win
set_kv "$ADMIN_AGRO" NEXT_PUBLIC_ADMIN_URL https://admin.agro.luxero.win
set_kv "$ADMIN_AGRO" NEXT_PUBLIC_APP_URL https://admin.agro.luxero.win
set_kv "$ADMIN_AGRO" NEXT_PUBLIC_FRONTEND_URL https://agro.luxero.win

if [[ -f "$LINK" ]]; then
  set_kv "$LINK" APP_URL https://link.luxero.win
  set_kv "$LINK" NEXT_PUBLIC_APP_URL https://link.luxero.win
fi

echo "Updated Hostinger env files for luxero.win production."
