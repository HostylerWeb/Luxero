#!/usr/bin/env bash
# Stream Hetzner Agro Mongo (database "test") → Hostinger Mongo (database "agro").
set -euo pipefail

HETZNER="${HETZNER:-root@167.233.52.87}"
HOSTINGER="${HOSTINGER:-root@187.7.28.125}"
HETZNER_MONGO="${HETZNER_MONGO:-lld6jjb8co5ctwb9171g3ssb}"
SSH=(ssh -i "${HOME}/.ssh/id_ed25519" -o IdentitiesOnly=yes -o BatchMode=yes)

dump_cmd=$(cat <<EOF
set -euo pipefail
CONTAINER='$HETZNER_MONGO'
PASS=\$(docker inspect "\$CONTAINER" --format '{{range .Config.Env}}{{println .}}{{end}}' | sed -n 's/^MONGO_INITDB_ROOT_PASSWORD=//p' | head -1)
docker exec "\$CONTAINER" mongodump -u root -p "\$PASS" --authenticationDatabase admin --db=test --archive --gzip
EOF
)

restore_cmd=$(cat <<'EOF'
set -euo pipefail
PASS=$(grep '^MONGO_ROOT_PASSWORD=' /root/luxero-secrets.env | cut -d= -f2-)
docker exec -i luxero_mongo mongorestore -u root -p "$PASS" --authenticationDatabase admin --drop --nsFrom='test.*' --nsTo='agro.*' --archive --gzip
echo restore_ok
EOF
)

echo "==> Mongo: Hetzner Agro (test) → Hostinger (agro)"
"${SSH[@]}" "$HETZNER" "$dump_cmd" | "${SSH[@]}" "$HOSTINGER" "$restore_cmd"

run_migrate() {
  local file=$1
  echo "==> $file on agro DB"
  "${SSH[@]}" "$HOSTINGER" bash -s <<EOF
set -euo pipefail
PASS=\$(grep '^MONGO_ROOT_PASSWORD=' /root/luxero-secrets.env | cut -d= -f2-)
URI="mongodb://root:\${PASS}@localhost:27017/agro?authSource=admin"
docker cp "/var/www/luxero/turborepo-main/deploy/scripts/$file" luxero_mongo:/tmp/$file
docker exec luxero_mongo mongosh "\$URI" --quiet --file "/tmp/$file"
EOF
}

run_migrate migrate-hostinger-domains.js
run_migrate migrate-image-urls-to-webp.js

echo "Done."
