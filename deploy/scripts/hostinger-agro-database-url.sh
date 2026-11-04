#!/usr/bin/env bash
# Point Hostinger Agro apps at Mongo database "agro" (separate from main "luxero").
set -euo pipefail

CLIENT_AGRO=/root/luxero-client-agro.env
ADMIN_AGRO=/root/luxero-admin-agro.env
SECRETS=/root/luxero-secrets.env

if [[ ! -f "$SECRETS" ]]; then
  echo "Missing $SECRETS" >&2
  exit 1
fi

PASS=$(grep '^MONGO_ROOT_PASSWORD=' "$SECRETS" | cut -d= -f2-)
AGRO_DB_URL="mongodb://root:${PASS}@mongo:27017/agro?authSource=admin&replicaSet=rs0"

for f in "$CLIENT_AGRO" "$ADMIN_AGRO"; do
  if [[ ! -f "$f" ]]; then
    echo "Missing $f — run hostinger-agro-env.sh first." >&2
    exit 1
  fi
  if grep -q '^DATABASE_URL=' "$f"; then
    sed -i "s|^DATABASE_URL=.*|DATABASE_URL=${AGRO_DB_URL}|" "$f"
  else
    echo "DATABASE_URL=${AGRO_DB_URL}" >>"$f"
  fi
done

echo "Agro DATABASE_URL set to database 'agro' on both client and admin env files."
