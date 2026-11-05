# One-time Hetzner → Hostinger migration (not used at runtime)

These scripts require SSH to **167.233.52.87** and were used to clone Mongo and catch up orders during cutover.

**Production on Hostinger does not call Hetzner.** After Hetzner is shut down, keep these only for archival reference or delete the folder.

Scripts:

- `sync-mongo-hetzner-main-to-hostinger.sh` — full `test` → `luxero` restore (destructive `--drop`)
- `sync-mongo-hetzner-agro-to-hostinger.sh` — Agro DB
- `sync-recent-orders-hetzner-to-hostinger.sh` — incremental orders/tickets (post-cutover safety net)
