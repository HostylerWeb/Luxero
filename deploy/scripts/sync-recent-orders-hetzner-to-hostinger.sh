#!/usr/bin/env bash
# Merge new orders and tickets from Hetzner prod Mongo into Hostinger luxero DB.
set -euo pipefail

HETZNER="${HETZNER:-root@167.233.52.87}"
HOSTINGER="${HOSTINGER:-root@187.7.28.125}"
HETZNER_MONGO="${HETZNER_MONGO:-wo6f6g4c3hvcv6nhouj1k4cr}"
SINCE="${SINCE:-2026-11-01T00:00:00.000Z}"
SSH=(ssh -i "${HOME}/.ssh/id_ed25519" -o IdentitiesOnly=yes -o BatchMode=yes)
TMP="${TMPDIR:-/tmp}/luxero-sync-$$"
mkdir -p "$TMP"
trap 'rm -rf "$TMP"' EXIT

read -r -d '' QUERY <<EOF || true
{"createdAt":{"\$gte":{"\$date":"${SINCE}"}}}
EOF

get_hetzner_pass() {
  "${SSH[@]}" "$HETZNER" \
    "docker inspect ${HETZNER_MONGO} --format '{{range .Config.Env}}{{println .}}{{end}}' | sed -n 's/^MONGO_INITDB_ROOT_PASSWORD=//p' | head -1"
}

HPASS=$("${SSH[@]}" "$HOSTINGER" "grep ^MONGO_ROOT_PASSWORD= /root/luxero-secrets.env | cut -d= -f2-")
MPASS=$(get_hetzner_pass)

for coll in orders tickets; do
  echo "==> ${coll} since ${SINCE}"
  "${SSH[@]}" "$HETZNER" \
    "docker exec ${HETZNER_MONGO} mongodump -u root -p '${MPASS}' --authenticationDatabase admin --db=test --collection=${coll} --query '${QUERY}' --archive --gzip" \
    >"${TMP}/${coll}.gz"
  scp -i "${HOME}/.ssh/id_ed25519" -o IdentitiesOnly=yes "${TMP}/${coll}.gz" "${HOSTINGER}:/tmp/luxero-sync-${coll}.gz"
  "${SSH[@]}" "$HOSTINGER" bash -s <<EOF
set -euo pipefail
docker exec -i luxero_mongo mongorestore -u root -p '${HPASS}' --authenticationDatabase admin \
  --nsFrom='test.*' --nsTo='luxero.*' --archive --gzip < /tmp/luxero-sync-${coll}.gz
rm -f /tmp/luxero-sync-${coll}.gz
EOF
done

echo "Done."
