# Hostinger production (luxero.win)

Production runs entirely on the Hostinger VPS (`187.7.28.125`): Docker apps, Caddy, MinIO, MongoDB (`luxero` + `agro`). **Hetzner is not part of runtime** — only optional one-time scripts under `deploy/scripts/migration/`.

## GitHub deploy key (VPS → `HostylerWeb/Luxero`)

The VPS pulls with a **read-only deploy key** (not your personal SSH key):

| Item | Location |
|------|-----------|
| Private key | `/root/.ssh/github_luxero_deploy` (mode `600`, do not copy off-server) |
| SSH alias | `github-luxero` in `/root/.ssh/config` |
| Git remote | `git@github-luxero:HostylerWeb/Luxero.git` in `/var/www/luxero/turborepo-main` |
| GitHub | Repo → **Settings → Deploy keys** → “Hostinger VPS (187.7.28.125) deploy” (read-only) |

**One-time setup (already done on prod):**

```bash
# On VPS as root
ssh-keygen -t ed25519 -C "hostinger-luxero-deploy" -f /root/.ssh/github_luxero_deploy -N ""
# Paste github_luxero_deploy.pub in GitHub → Luxero → Settings → Deploy keys (read-only)

cat >>/root/.ssh/config <<'EOF'
Host github-luxero
  HostName github.com
  User git
  IdentityFile /root/.ssh/github_luxero_deploy
  IdentitiesOnly yes
EOF

git -C /var/www/luxero/turborepo-main remote set-url origin git@github-luxero:HostylerWeb/Luxero.git
ssh -T github-luxero   # expect: "Hi HostylerWeb/Luxero! You've successfully authenticated..."
git -C /var/www/luxero/turborepo-main fetch origin main
```

Use **read-only** unless the VPS must push (normally it should not). Each deploy key can only attach to **one** repo — correct for Luxero-only access.

## Deploy after `git pull`

```bash
bash /var/www/luxero/turborepo-main/deploy/scripts/hostinger-deploy-from-git.sh
```

Rebuilds client/admin with `source /root/luxero-*.env` so Turnstile and `PUBLIC_ENV__*` stay correct.

## Verify no Hetzner dependency (before powering off Hetzner)

On the VPS:

```bash
bash /var/www/luxero/turborepo-main/deploy/scripts/verify-hostinger-independence.sh
```

## DNS (Cloudflare)

Use your **API token** (`CF_API_TOKEN` = the `cfut_…` Bearer token from Cloudflare → API Tokens):

```bash
export CF_API_TOKEN='cfut_…'
bash deploy/scripts/cloudflare-point-to-hostinger.sh
```

This points product DNS + `*.luxero.win` to Hostinger and **deletes staging DNS records**.

Check:

```bash
dig +short A luxero.win @1.1.1.1          # 187.7.28.125
dig +short A foo.luxero.win @1.1.1.1      # 187.7.28.125
dig +short A build.coolify.luxero.win @1.1.1.1  # 95.216.158.37 (build server — stays)
```

## Shut down Hetzner (operator checklist)

1. Run `verify-hostinger-independence.sh` — all OK.
2. Copy any secrets still only on Hetzner (e.g. `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `RESEND_API_KEY`, Stripe) into `/root/luxero-secrets.env`, set `SEND_EMAIL=true` in `/root/luxero-app.env`, then **`docker compose up -d --force-recreate`** client/admin/shop (restart alone does not reload `env_file`).
3. **Transactional email** uses [Resend](https://resend.com) (`RESEND_API_KEY` in `luxero-secrets.env`), not Spaceship SMTP. Spaceship is for domain mailboxes / MX; the website sends via Resend. Confirm `luxero.win` is verified in the Resend dashboard and `from` addresses match admin **Email settings** (default `contact@luxero.win`).
4. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), OAuth client **Authorized redirect URIs** must include:
   - `https://luxero.win/api/auth/callback/google`
   - `https://admin.luxero.win/api/auth/callback/google`
   - (Agro if used) `https://agro.luxero.win/api/auth/callback/google`
5. Stop Luxero Coolify apps on **167.233.52.87** (main + agro + staging).
6. Optional final backup of Hetzner Mongo, then stop Mongo containers.
7. Power off / cancel Hetzner VPS when satisfied.
8. Remove `167.233.52.87` from `ssh.txt` / personal notes; rotate any secrets that only lived on Hetzner.

**Do not** run migration sync scripts after Hetzner is off.

## Why an order once missed admin

Hostinger apps **always** used Hostinger Mongo. A checkout hit **Hetzner’s website** because **DNS** still sent some hostnames to `167.233.52.87`, not because `DATABASE_URL` pointed at Hetzner.
