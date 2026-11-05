#!/usr/bin/env bash
# Stream Hetzner production Mongo (database "test" — live prod data) → Hostinger (database "luxero").
set -euo pipefail

HETZNER="${HETZNER:-root@167.233.52.87}"
HOSTINGER="${HOSTINGER:-root@187.7.28.125}"
HETZNER_MONGO="${HETZNER_MONGO:-wo6f6g4c3hvcv6nhouj1k4cr}"
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
docker exec -i luxero_mongo mongorestore -u root -p "$PASS" --authenticationDatabase admin --drop --nsFrom='test.*' --nsTo='luxero.*' --archive --gzip
echo restore_ok
EOF
)

echo "==> Mongo: Hetzner default → Hostinger luxero"
"${SSH[@]}" "$HETZNER" "$dump_cmd" | "${SSH[@]}" "$HOSTINGER" "$restore_cmd"

echo "==> Asset URL rewrite"
"${SSH[@]}" "$HOSTINGER" bash -s <<'EOF'
set -euo pipefail
PASS=$(grep '^MONGO_ROOT_PASSWORD=' /root/luxero-secrets.env | cut -d= -f2-)
docker cp /var/www/luxero/turborepo-main/deploy/scripts/migrate-asset-urls.js luxero_mongo:/tmp/migrate-asset-urls.js
docker exec luxero_mongo mongosh "mongodb://root:${PASS}@localhost:27017/luxero?authSource=admin" --quiet --file /tmp/migrate-asset-urls.js
EOF

echo "Done."
