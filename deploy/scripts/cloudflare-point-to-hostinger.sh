#!/usr/bin/env bash
# Point luxero.win DNS at Hostinger (187.7.28.125). Does not change MX, tunnels, build.coolify, cdn.
set -euo pipefail

HOSTINGER_IP="${HOSTINGER_IP:-187.7.28.125}"
ZONE="${ZONE:-luxero.win}"

if [[ -z "${CF_API_TOKEN:-}" ]]; then
  echo "Set CF_API_TOKEN (Zone DNS Edit + Zone Read for ${ZONE})." >&2
  exit 1
fi

ZONE_ID=$(curl -sf -H "Authorization: Bearer ${CF_API_TOKEN}" \
  "https://api.cloudflare.com/client/v4/zones?name=${ZONE}" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['result'][0]['id'])")

upsert_a() {
  local fqdn=$1
  local existing id payload
  existing=$(curl -sf -H "Authorization: Bearer ${CF_API_TOKEN}" \
    "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records?type=A&name=${fqdn}")
  id=$(echo "$existing" | python3 -c "import sys,json; r=json.load(sys.stdin)['result']; print(r[0]['id'] if r else '')")
  payload=$(FQDN="$fqdn" IP="$HOSTINGER_IP" python3 -c "import json,os; print(json.dumps({'type':'A','name':os.environ['FQDN'],'content':os.environ['IP'],'ttl':60,'proxied':False}))")
  if [[ -n "$id" ]]; then
    curl -sf -X PATCH -H "Authorization: Bearer ${CF_API_TOKEN}" -H "Content-Type: application/json" \
      "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records/${id}" -d "$payload" >/dev/null
    echo "PATCH ${fqdn} -> ${HOSTINGER_IP}"
  else
    curl -sf -X POST -H "Authorization: Bearer ${CF_API_TOKEN}" -H "Content-Type: application/json" \
      "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records" -d "$payload" >/dev/null
    echo "CREATE ${fqdn} -> ${HOSTINGER_IP}"
  fi
}

for fqdn in \
  "${ZONE}" \
  "www.${ZONE}" \
  "admin.${ZONE}" \
  "www.admin.${ZONE}" \
  "shop.${ZONE}" \
  "www.shop.${ZONE}" \
  "assets.${ZONE}" \
  "link.${ZONE}" \
  "agro.${ZONE}" \
  "admin.agro.${ZONE}" \
  "staging.${ZONE}" \
  "*.${ZONE}" \
  "*.staging.${ZONE}"; do
  upsert_a "$fqdn"
done

echo "Done."
