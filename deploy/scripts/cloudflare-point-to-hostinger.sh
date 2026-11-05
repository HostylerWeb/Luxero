#!/usr/bin/env bash
# Point luxero.win product DNS at Hostinger. Remove staging hostnames. Keeps MX, tunnels, build.coolify, cdn.
#
# Usage (same token you created in Cloudflare → API Tokens):
#   export CF_API_TOKEN='cfut_…'
#   bash deploy/scripts/cloudflare-point-to-hostinger.sh
set -euo pipefail

HOSTINGER_IP="${HOSTINGER_IP:-187.7.28.125}"
ZONE="${ZONE:-luxero.win}"

if [[ -z "${CF_API_TOKEN:-}" ]]; then
  echo "Set CF_API_TOKEN to your Cloudflare API token (Zone → DNS Edit + Zone Read for ${ZONE})." >&2
  echo "Verify: curl -s -H \"Authorization: Bearer \$CF_API_TOKEN\" https://api.cloudflare.com/client/v4/user/tokens/verify" >&2
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
    echo "PATCH A ${fqdn} -> ${HOSTINGER_IP}"
  else
    curl -sf -X POST -H "Authorization: Bearer ${CF_API_TOKEN}" -H "Content-Type: application/json" \
      "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records" -d "$payload" >/dev/null
    echo "CREATE A ${fqdn} -> ${HOSTINGER_IP}"
  fi
}

delete_records_for_name() {
  local fqdn=$1
  local page=1
  while true; do
    local resp
    resp=$(curl -sf -H "Authorization: Bearer ${CF_API_TOKEN}" \
      "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records?per_page=100&page=${page}&name=${fqdn}")
    local ids
    ids=$(echo "$resp" | python3 -c "import sys,json; d=json.load(sys.stdin); print(' '.join(r['id'] for r in d.get('result',[])))")
    [[ -z "$ids" ]] && break
    for id in $ids; do
      curl -sf -X DELETE -H "Authorization: Bearer ${CF_API_TOKEN}" \
        "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records/${id}" >/dev/null
      echo "DELETE ${fqdn} (record ${id:0:8}…)"
    done
    local total pages
    read -r total pages <<<"$(echo "$resp" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('result_info',{}).get('total',0), d.get('result_info',{}).get('total_pages',1))")"
    (( page >= pages )) && break
    page=$((page + 1))
  done
}

echo "==> Production + wildcard → Hostinger"
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
  "*.${ZONE}"; do
  upsert_a "$fqdn"
done

echo "==> Remove staging DNS (not used)"
# List all records containing staging.luxero.win
curl -sf -H "Authorization: Bearer ${CF_API_TOKEN}" \
  "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records?per_page=500" \
  | python3 -c "
import sys, json
d = json.load(sys.stdin)
for r in d.get('result', []):
    n = r.get('name', '')
    if 'staging.${ZONE}' in n or n.endswith('.staging.${ZONE}'):
        print(n)
" | sort -u | while read -r name; do
  delete_records_for_name "$name"
done

echo "Done. Check: dig +short A staging.${ZONE} (empty); dig +short A foo.${ZONE} -> ${HOSTINGER_IP}"
