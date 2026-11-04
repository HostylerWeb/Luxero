#!/usr/bin/env bash
# Create Agro env files on Hostinger (separate Mongo DB `agro`; separate URLs + auth cookies).
set -euo pipefail

CLIENT_AGRO=/root/luxero-client-agro.env
ADMIN_AGRO=/root/luxero-admin-agro.env

if [[ -f "$CLIENT_AGRO" ]]; then
  echo "$CLIENT_AGRO already exists — remove agro env files to regenerate." >&2
  exit 1
fi

rand_hex() { openssl rand -hex 32; }

AGRO_BASE="${AGRO_BASE:-https://agro.srv2011364.hstgr.cloud}"
AGRO_ADMIN="${AGRO_ADMIN:-https://admin.agro.srv2011364.hstgr.cloud}"
MAIN_BASE="$(grep -E '^APP_URL=' /root/luxero-client.env | cut -d= -f2- || true)"
MAIN_ADMIN="$(grep -E '^PUBLIC_ENV__ADMIN_URL=' /root/luxero-client.env | cut -d= -f2- || true)"

CLIENT_AUTH="$(rand_hex)"
ADMIN_AUTH="$(rand_hex)"

cat >"$CLIENT_AGRO" <<EOF
APP_URL=${AGRO_BASE}
PUBLIC_ENV__APP_URL=${AGRO_BASE}
PUBLIC_ENV__ADMIN_URL=${AGRO_ADMIN}
BETTER_AUTH_URL=${AGRO_BASE}
BETTER_AUTH_SECRET=${CLIENT_AUTH}
REDIS_ENABLED=true
REDIS_NAMESPACE=agro
SENTRY_ENVIRONMENT=agro
EOF
chmod 600 "$CLIENT_AGRO"

cat >"$ADMIN_AGRO" <<EOF
FRAMEWORK=next
APP_URL=${AGRO_ADMIN}
ADMIN_URL=${AGRO_ADMIN}
BETTER_AUTH_URL=${AGRO_ADMIN}
ADMIN_BETTER_AUTH_URL=${AGRO_ADMIN}
NEXT_PUBLIC_ADMIN_URL=${AGRO_ADMIN}
NEXT_PUBLIC_APP_URL=${AGRO_ADMIN}
NEXT_PUBLIC_FRONTEND_URL=${AGRO_BASE}
NEXT_PUBLIC_LOGIN_URL=/auth/login
BETTER_AUTH_SECRET=${ADMIN_AUTH}
REDIS_NAMESPACE=agro
SENTRY_ENVIRONMENT=agro
EOF
chmod 600 "$ADMIN_AGRO"

echo "Wrote $CLIENT_AGRO and $ADMIN_AGRO"
echo "Agro customer: ${AGRO_BASE}"
echo "Agro admin:    ${AGRO_ADMIN}"
echo "Main site unchanged: ${MAIN_BASE:-?} / ${MAIN_ADMIN:-?}"
