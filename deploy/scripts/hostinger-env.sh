#!/usr/bin/env bash
# Generate app env files on Hostinger VPS (run as root).
set -euo pipefail

SHARED=/root/luxero-app.env
CLIENT=/root/luxero-client.env
ADMIN=/root/luxero-admin.env

if [[ -f "$SHARED" ]]; then
  echo "$SHARED already exists — remove luxero-* env files to regenerate." >&2
  exit 1
fi

rand_hex() { openssl rand -hex 32; }
rand_b64() { openssl rand -base64 32; }

MINIO_USER="luxero_minio_$(openssl rand -hex 4)"
MINIO_PASS="$(rand_hex)"

BASE=https://srv2011364.hstgr.cloud
ADMIN_URL=https://admin.srv2011364.hstgr.cloud
SHOP=https://shop.srv2011364.hstgr.cloud
ASSETS=https://assets.srv2011364.hstgr.cloud
ASSET_BASE="${ASSETS}/luxero-assets"

SETUP_SECRET="$(rand_b64)"
EMERGENCY_SECRET="$(rand_b64)"
CRON_SECRET="$(rand_b64)"
CLIENT_AUTH="$(rand_hex)"
ADMIN_AUTH="$(rand_hex)"

write_shared() {
  cat >"$SHARED" <<EOF
NODE_ENV=production
SECURE_COOKIES=true
MINIO_ROOT_USER=${MINIO_USER}
MINIO_ROOT_PASSWORD=${MINIO_PASS}
S3_ENDPOINT=${ASSETS}
S3_BUCKET=luxero-assets
S3_FORCE_PATH_STYLE=true
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=${MINIO_USER}
AWS_SECRET_ACCESS_KEY=${MINIO_PASS}
S3_ACCESS_KEY_ID=${MINIO_USER}
S3_SECRET_ACCESS_KEY=${MINIO_PASS}
ASSET_BASE_URL=${ASSET_BASE}
NEXT_PUBLIC_ASSET_BASE_URL=${ASSET_BASE}
SEND_EMAIL=false
SMTP_ENABLED=false
SETUP_SECRET=${SETUP_SECRET}
ADMIN_EMERGENCY_SECRET=${EMERGENCY_SECRET}
CRON_JOBS_SECRET=${CRON_SECRET}
CROSS_SUBDOMAIN_COOKIES=false
RATE_LIMIT_AUTH=0
PUBLIC_ENV__PAYMENT_BYPASS=true
PUBLIC_ENV__PAYMENT_DEBUG=false
ENABLE_LOCAL_PAYMENT_METHOD=true
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
PUBLIC_ENV__TURNSTILE_SITE_KEY=1x00000000000000000000AA
NEXT_PUBLIC_UMAMI_WEBSITE_ID=
SHOP_URL=${SHOP}
NEXT_PUBLIC_SHOP_URL=${SHOP}
# Origin allowlist (CSRF/CORS/CSP) reads APP_URL, ASSET_BASE_URL, etc. from these files.
# Optional extra suffixes: ORIGIN_ALLOW_HOST_SUFFIXES=mydomain.com
# Optional exact origins: AUTH_TRUSTED_ORIGINS_EXTRA=https://one.off,https://two.off
EOF
  chmod 600 "$SHARED"
}

write_client() {
  cat >"$CLIENT" <<EOF
APP_URL=${BASE}
PUBLIC_ENV__APP_URL=${BASE}
PUBLIC_ENV__ADMIN_URL=${ADMIN_URL}
BETTER_AUTH_URL=${BASE}
BETTER_AUTH_SECRET=${CLIENT_AUTH}
REDIS_ENABLED=true
EOF
  chmod 600 "$CLIENT"
}

write_shop() {
  cat >"/root/luxero-shop.env" <<EOF
APP_URL=${SHOP}
BETTER_AUTH_SECRET=${CLIENT_AUTH}
EOF
  chmod 600 /root/luxero-shop.env
}

write_admin() {
  cat >"$ADMIN" <<EOF
FRAMEWORK=next
APP_URL=${ADMIN_URL}
ADMIN_URL=${ADMIN_URL}
BETTER_AUTH_URL=${ADMIN_URL}
ADMIN_BETTER_AUTH_URL=${ADMIN_URL}
NEXT_PUBLIC_ADMIN_URL=${ADMIN_URL}
NEXT_PUBLIC_APP_URL=${ADMIN_URL}
NEXT_PUBLIC_FRONTEND_URL=${BASE}
NEXT_PUBLIC_LOGIN_URL=/auth/login
BETTER_AUTH_SECRET=${ADMIN_AUTH}
EOF
  chmod 600 "$ADMIN"
}

write_shared
write_client
write_admin
write_shop

echo "Wrote $SHARED, $CLIENT, $ADMIN"
echo ""
echo "First admin: ${ADMIN_URL}/auth/setup"
echo "SETUP_SECRET=${SETUP_SECRET}"
