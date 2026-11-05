# Hostinger production (luxero.win)

## One-command deploy on the VPS

After SSH to Hostinger as root:

```bash
bash /var/www/luxero/turborepo-main/deploy/scripts/hostinger-deploy-from-git.sh
```

This will:

1. `git pull origin main`
2. Re-apply `hostinger-cutover-luxero-win-env.sh` (luxero.win URLs)
3. **Rebuild** client, client-agro, admin, admin-agro, shop (with `source /root/luxero-*.env` so Turnstile and `PUBLIC_ENV__*` are baked into Vite/Next builds)
4. `docker compose up -d`

Always run deploy from the VPS after merging to `main` — do not rely on `docker compose up` alone after code changes.

## DNS must point at Hostinger (not Hetzner)

Traffic goes to whichever IP DNS returns. Hostinger apps **always** use Hostinger Mongo (`mongodb://…@mongo:27017/luxero`). If DNS still sends users to **167.233.52.87**, they checkout on **Hetzner** and admin on Hostinger will not see those orders.

From a machine with `CF_API_TOKEN` (Zone DNS Edit for luxero.win):

```bash
export CF_API_TOKEN='…'
bash deploy/scripts/cloudflare-point-to-hostinger.sh
```

Verify:

```bash
dig +short A luxero.win staging.luxero.win
# both should be 187.7.28.125
dig +short A build.coolify.luxero.win
# still 95.216.158.37 (unchanged)
```

## Catch-up orders after cutover

```bash
bash deploy/scripts/sync-recent-orders-hetzner-to-hostinger.sh
```
