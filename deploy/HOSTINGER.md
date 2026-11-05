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

**`CF_API_TOKEN`** is the **Cloudflare API token** you created under *My Profile → API Tokens* (the same `cfut_…` value you use as `Authorization: Bearer …` in the verify curl). It is **not** your Cloudflare account password. Store it only in your shell or a secrets file — never commit it.

The script moves product DNS to Hostinger, points `*.luxero.win` at Hostinger, and **deletes staging** records (`staging.luxero.win`, `*.staging.luxero.win`, etc.).

```bash
export CF_API_TOKEN='cfut_…'   # your token
bash deploy/scripts/cloudflare-point-to-hostinger.sh
```

Verify:

```bash
dig +short A luxero.win
# 187.7.28.125
dig +short A staging.luxero.win
# (no answer — staging removed)
dig +short A randomname.luxero.win
# 187.7.28.125 (wildcard)
dig +short A build.coolify.luxero.win
# 95.216.158.37 (unchanged — build server)
```

## Catch-up orders after cutover

```bash
bash deploy/scripts/sync-recent-orders-hetzner-to-hostinger.sh
```
