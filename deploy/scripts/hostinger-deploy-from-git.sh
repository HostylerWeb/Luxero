#!/usr/bin/env bash
# Run on Hostinger VPS as root after git pull — rebuilds apps with production PUBLIC_ENV baked in.
set -euo pipefail

REPO="${REPO:-/var/www/luxero/turborepo-main}"
COMPOSE="${COMPOSE:-/var/www/luxero/deploy/docker-compose.hostinger.yml}"
BRANCH="${BRANCH:-main}"

cd "$REPO"
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

if [[ -x "$REPO/deploy/scripts/hostinger-cutover-luxero-win-env.sh" ]]; then
  bash "$REPO/deploy/scripts/hostinger-cutover-luxero-win-env.sh"
fi

# Fix MinIO public URL in compose (runtime env override)
if grep -q 'assets.srv2011364.hstgr.cloud' "$COMPOSE" 2>/dev/null; then
  sed -i 's|MINIO_SERVER_URL: https://assets.srv2011364.hstgr.cloud|MINIO_SERVER_URL: https://assets.luxero.win|' "$COMPOSE"
fi

cd "$(dirname "$COMPOSE")"

build_service() {
  local service=$1
  shift
  set -a
  # shellcheck disable=SC1091
  source /root/luxero-app.env
  for envfile in "$@"; do
    # shellcheck disable=SC1090
    source "$envfile"
  done
  export NEXT_PUBLIC_TURNSTILE_SITE_KEY="${PUBLIC_ENV__TURNSTILE_SITE_KEY:-${NEXT_PUBLIC_TURNSTILE_SITE_KEY:-}}"
  set +a
  echo "==> docker compose build ${service}"
  docker compose -f "$COMPOSE" build "$service"
}

build_service client /root/luxero-client.env
build_service client-agro /root/luxero-client-agro.env
build_service admin /root/luxero-admin.env
build_service admin-agro /root/luxero-admin-agro.env
build_service shop /root/luxero-shop.env
docker compose -f "$COMPOSE" build web-lander

docker compose -f "$COMPOSE" up -d
docker compose -f "$COMPOSE" ps

echo "Deploy complete. Smoke: curl -sI https://luxero.win/en | head -1"
