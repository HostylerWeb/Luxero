#!/usr/bin/env bash
# Assert Hostinger production does not depend on Hetzner (run on VPS as root).
set -euo pipefail

HOSTINGER_IP="${HOSTINGER_IP:-187.7.28.125}"
HETZNER_IP="${HETZNER_IP:-167.233.52.87}"
FAIL=0

warn() { echo "WARN: $*" >&2; FAIL=1; }
ok() { echo "OK: $*"; }

for h in luxero.win agro.luxero.win admin.luxero.win assets.luxero.win; do
  ip=$(dig +short A "$h" @1.1.1.1 | head -1)
  if [[ "$ip" == "$HETZNER_IP" ]]; then
    warn "$h resolves to Hetzner ($ip)"
  elif [[ "$ip" == "$HOSTINGER_IP" ]]; then
    ok "$h -> Hostinger"
  else
    warn "$h -> unexpected $ip"
  fi
done

ip=$(dig +short A "random-check-$(date +%s).luxero.win" @1.1.1.1 | head -1)
if [[ "$ip" == "$HOSTINGER_IP" ]]; then
  ok "wildcard *.luxero.win -> Hostinger"
elif [[ "$ip" == "$HETZNER_IP" ]]; then
  warn "wildcard still -> Hetzner"
fi

for f in /root/luxero-app.env /root/luxero-client.env /root/luxero-secrets.env; do
  if [[ -f "$f" ]] && grep -qE '167\.233|hetzner|staging\.luxero' "$f"; then
    warn "$f contains Hetzner/staging references"
  fi
done

if [[ -f /root/luxero-secrets.env ]] && ! grep -q '^RESEND_API_KEY=.' /root/luxero-secrets.env; then
  warn "RESEND_API_KEY missing from luxero-secrets.env (transactional email disabled)"
elif docker exec luxero_client printenv RESEND_API_KEY 2>/dev/null | grep -q .; then
  ok "client has RESEND_API_KEY"
else
  warn "luxero_client missing RESEND_API_KEY — run compose --force-recreate"
fi

if [[ -f /root/luxero-app.env ]] && grep -q '^SEND_EMAIL=false' /root/luxero-app.env; then
  warn "SEND_EMAIL=false in luxero-app.env (set true for production parity with Hetzner)"
fi

for c in luxero_client luxero_admin luxero_mongo; do
  if docker inspect "$c" &>/dev/null; then
    db=$(docker exec "$c" printenv DATABASE_URL 2>/dev/null || true)
    if [[ -n "$db" ]] && [[ "$db" != *"@mongo:"* ]]; then
      warn "$c DATABASE_URL is not Hostinger mongo: ${db/@*/@***}"
    else
      ok "$c uses local mongo"
    fi
  fi
done

if crontab -l 2>/dev/null | grep -qi hetzner; then
  warn "root crontab references Hetzner"
fi

if [[ "$FAIL" -eq 0 ]]; then
  echo "All checks passed — safe to decommission Hetzner for luxero.win product traffic."
  exit 0
fi
echo "Fix warnings before shutting down Hetzner."
exit 1
