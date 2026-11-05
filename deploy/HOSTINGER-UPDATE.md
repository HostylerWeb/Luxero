# How to update luxero.win on Hostinger (correct workflow)

**Server:** `root@187.7.28.125` (SSH key `~/.ssh/id_ed25519`)  
**Code on VPS:** `/var/www/luxero/turborepo-main`  
**Compose:** `/var/www/luxero/deploy/docker-compose.hostinger.yml`  
**Env (never commit):** `/root/luxero-app.env`, `/root/luxero-client.env`, `/root/luxero-admin.env`, `/root/luxero-shop.env`, `/root/luxero-secrets.env`

See also: [HOSTINGER.md](./HOSTINGER.md) (DNS, secrets, Hetzner cutover), [ssh.txt](../ssh.txt) (hosts and SSH).

---

## ✅ Normal production deploy (always prefer this)

1. **Commit and push** changes to GitHub (`HostylerWeb/Luxero`, branch `main`).
2. **On the VPS as root:**

```bash
bash /var/www/luxero/turborepo-main/deploy/scripts/hostinger-deploy-from-git.sh
```

That script:

- `git pull` on `/var/www/luxero/turborepo-main` (via deploy key `github-luxero`)
- Runs `hostinger-cutover-luxero-win-env.sh` (luxero.win URLs in env files)
- **`source`s `/root/luxero-app.env` (+ per-app env)** before `docker compose build` so baked `PUBLIC_ENV__*` / Turnstile keys are not empty
- Rebuilds **client, client-agro, admin, admin-agro, shop, web-lander** and `docker compose up -d`

**Expect ~2–5 minutes per app** for Docker builds; total deploy can take **15–30 minutes** if everything rebuilds. That is normal.

### Rebuild only one app (after you know what changed)

```bash
cd /var/www/luxero/deploy
set -a
source /root/luxero-app.env
source /root/luxero-client.env   # or admin.env / shop.env as needed
source /root/luxero-secrets.env
export NEXT_PUBLIC_TURNSTILE_SITE_KEY="${PUBLIC_ENV__TURNSTILE_SITE_KEY:-}"
export PUBLIC_ENV__APP_URL="${PUBLIC_ENV__APP_URL:-https://luxero.win}"
export PUBLIC_ENV__ADMIN_URL="${PUBLIC_ENV__ADMIN_URL:-https://admin.luxero.win}"
export PUBLIC_ENV__STRIPE_PUBLISHABLE_KEY="${PUBLIC_ENV__STRIPE_PUBLISHABLE_KEY:-}"
export PUBLIC_ENV__PAYMENT_BYPASS="${PUBLIC_ENV__PAYMENT_BYPASS:-false}"
set +a

docker compose -f docker-compose.hostinger.yml build client
docker compose -f docker-compose.hostinger.yml up -d --force-recreate client
```

| If you changed… | Rebuild / recreate |
|-----------------|-------------------|
| `apps/client` (storefront, API in same container) | `client` (and `client-agro` only if Agro should match) |
| `apps/admin` | `admin` (+ `admin-agro` if needed) |
| `apps/shop` | `shop` |
| `packages/content`, legal copy only (already on disk via git pull) | Often **client** only (content is bundled at build) |
| `/root/luxero-*.env` or `/root/luxero-secrets.env` | **`up -d --force-recreate`** affected services — **`restart` does not reload `env_file`** |
| Stripe / Google / Resend secrets | Edit `/root/luxero-secrets.env`, set vars in `luxero-app.env` if needed, **recreate** `client` + `admin` |

---

## ⚠️ Emergency hotfix from a dev machine (no git push yet)

Use **only changed paths** — never sync the whole repo.

**Do not** run:

```bash
# WRONG — local tree is ~12GB; rsync can run 30+ minutes and is fragile
rsync -az --delete /var/www/luxero/turborepo-main/ root@187.7.28.125:/var/www/luxero/turborepo-main/
```

**Do** copy explicit files, then rebuild the affected service on the VPS (same `docker compose build` block as above):

```bash
# Example: from your machine (adjust paths)
RSYNC_SSH='ssh -i ~/.ssh/id_ed25519 -o IdentitiesOnly=yes'
REMOTE=root@187.7.28.125:/var/www/luxero/turborepo-main

rsync -az apps/client/src/pages/dashboard/+data.ts "$REMOTE/apps/client/src/pages/dashboard/+data.ts" -e "$RSYNC_SSH"
# …other changed files only…
```

Then SSH in and **`docker compose build` + `up -d --force-recreate`** for the relevant service.

After testing, **commit and push** so the VPS matches git on the next normal deploy.

---

## Env and secrets checklist

- **Production URLs:** `luxero.win`, `admin.luxero.win`, `assets.luxero.win`, etc. — maintained by `hostinger-cutover-luxero-win-env.sh`.
- **Secrets:** `/root/luxero-secrets.env` (Mongo, Redis, Google OAuth, Resend, Stripe, …). Copy from Hetzner only when missing; never commit.
- **Client build args:** `PUBLIC_ENV__STRIPE_PUBLISHABLE_KEY`, Turnstile, `PUBLIC_ENV__APP_URL` must be set in the shell **before** `docker compose build client` (the deploy script does this).
- **`CROSS_SUBDOMAIN_COOKIES`:** keep **`false`** on the main `luxero.win` client unless you need shared cookies with `shop.` / `admin.` subdomains. Setting `true` without a full subdomain cookie audit can **break Google OAuth** (PKCE state cookies not returned on callback — login “refreshes” and clears session).
- **Payment bypass:** `PUBLIC_ENV__PAYMENT_BYPASS=false` in production.

---

## Verify after deploy

```bash
curl -sI https://luxero.win/en | head -1
docker compose -f /var/www/luxero/deploy/docker-compose.hostinger.yml ps
bash /var/www/luxero/turborepo-main/deploy/scripts/verify-hostinger-independence.sh
```

---

## Prestige Prizes is a different site

**prestigeprizes.co.uk** deploys to **Krystal** (`185.194.90.37:722`, user `presti14`) — not Hostinger. See `/var/www/prestigeprizes/ssh.txt`.
