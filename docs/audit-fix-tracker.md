# Audit fix tracker

Status: **TODO** | **IN PROGRESS** | **DONE** | **WONTFIX** (with reason)

Last updated: 2026-10-02 — **Pass 5 product review (code fixes complete)**

See also: [audits.md](./audits.md) · [platform-audit-pass4.md](./platform-audit-pass4.md)

---

## Pass 4 — Critical / High

| ID | Status | Notes |
|----|--------|-------|
| P4-C1 | DONE | `isLocalPaymentAllowed()` gates balance top-up |
| P4-H1 | DONE | No wallet credit on Paytriot/Stripe admin refund rollback |
| P4-H2 | DONE | `blockCardPayment` + instant-win ban at checkout session |
| P4-H3 | DONE | Env forces local off in DB; admin PATCH blocked; public `/providers` |
| P4-H4 | DONE | Shop `local` checkout gated |
| P4-H5 | DONE | `assertSafeOutboundUrl` in affiliate tracker |

## Pass 4 — Medium / Low

| ID | Status | Notes |
|----|--------|-------|
| P4-M1–M15 | DONE | See prior rows in git history; jobs, email retry, cart spend, compliance, push auth, web-lander URL, PaymentAttempt TTL |
| P4-L1 | DONE | `/api/competitions/stream` publishes `competition-update` SSE (not heartbeat-only) |
| P4-L2 | DONE | Draw job logs SLA warn for `pending_draw` >7 days |
| P4-L3 | DONE | Guest caps documented in `compliance-checks.ts` |
| P4-L4 | DONE | SMTP send retries (same as Resend backoff) in `packages/api/email/src/client.ts` |
| P4-L5 | DONE | Shop confirmation email metadata + rethrow |
| P4-L6 | DONE | `metadata.type: balance_top_up` excluded from spend/order analytics |
| P4-L7 | DONE | Push 410/404 removes subscription document |
| P4-L8 | DONE | Withdraw: verified email, self-exclusion, daily Redis velocity cap |
| P4-L9 | DONE | Admin refund `ComplianceAuditLog` + `pspRefundRequired` / wallet flags |

## Pass 3 — Promo

| ID | Status | Notes |
|----|--------|-------|
| M23 | DONE | Admin UI + API Zod `maxUsesPerUser` |
| H8–H10 | DONE | `validatePromoCode(userId)`; reserve open-ended dates |
| M15–M16 | DONE | Model/schema; PaymentAttempt TTL; per-user promo enforcement |
| M24 | DONE | `POST /api/admin/promo-codes/:id/release-usage` + audit log |

## Client audit (code-fixable)

| ID | Status | Notes |
|----|--------|-------|
| C1 | DONE | Auth log redaction |
| C2 | DONE | Same as P4-C1 balance top-up gate |
| H1 | DONE | Fixed `trusted-origins.ts` allowlist (no dynamic Origin) |
| H2 | DONE | Contact rate limit |
| H3 | DONE | Redis fail-closed in prod for limiters |
| H4 | DONE | Production CSP `script-src` uses nonce (no `unsafe-inline`) |
| H5 | DONE | Mobile `VITE_API_URL` required in prod; dev defaults `127.0.0.1:3555` |
| H7 | DONE | `publicFeedRateLimit` on `/api/entries` and `/api/winners` |
| H8–H10 | DONE | Pass 3 promo stack |

## Admin audit (code-fixable)

| ID | Status | Notes |
|----|--------|-------|
| C1 | DONE | E2E creds from env |
| M23 / M24 | DONE | Promo per-user + admin release usage |
| H1 (trusted origins) | DONE | Shared with client H1 |

## Database audit (code-fixable)

| ID | Status | Notes |
|----|--------|-------|
| C1 | DONE | `auth-user-sync` for role/email |
| M15–M16 | DONE | Promo per-user + PaymentAttempt retention |

## Ops / infra (documented — not app code)

| Item | Status | Notes |
|------|--------|-------|
| Mongo TLS, SCRAM, network isolation | OPS | [database-audit.md](./database-audit.md) §C2 |
| Separate job vs emergency secret | OPS | [admin-audit.md](./admin-audit.md) §H3 |
| Production cron for internal jobs | OPS | Schedule `cleanup-abandoned-orders`, `retry-order-confirmation-emails`, `check-bonus-awards`, etc. |
| Capacitor device auth matrix | OPS | [client-audit.md](./client-audit.md) §H6 |
| Cashflows payment adapter | PRODUCT | [client-audit.md](./client-audit.md) §M19 |

---

## Pass 5 — product flows (2026-10-02)

| ID | Status | Notes |
|----|--------|-------|
| P5-H1 | DONE | Wallet apply: per-user check uses owned + cart qty only |
| P5-H2 | DONE | Checkout rejects over-limit qty; recomputes cash subtotal |
| P5-H3 | DONE | Checkout passes `cartItems` into promo resolution |
| P5-H4 | DONE | Cart % promo / totals use cash (post-wallet) subtotal |
| P5-H5 | DONE | Referral auto-apply skips when user already has a promo |
| P5-H6 | DONE | Cart discount recalc matches checkout (single discount + promo fallback) |
| P5-H7 | DONE | Stripe / Paytriot reuse requires matching order total |
| P5-H8 | DONE | Guest checkout per-user cap uses `orderUserId` |
| P5-H9 | DONE | Checkout / availability use `isOpenForTicketSales` |
| P5-H10 | DONE | Draw job: sales close on earliest date; `pending_draw` waits for drawDate |
| P5-H11 | DONE | Guest merge reassigns `Ticket.ownerId` to new profile |
| P5-H12 | DONE | Partial hold rolls back only attempted numbers for that CIP |
| P5-H13 | WONTFIX | Held tickets intentionally excluded from progress bars |
| P5-H14 | DONE | Category filter no longer reuses unfiltered `initialData` |
| P5-H15 | DONE | Competition list requests `limit=100` |
| P5-H16 | DONE | `requireSignIn` mapped; guest sign-in gate on detail page |
| P5-H17 | DONE | Instant-prize editor keeps existing quantity when capacity loads |
| P5-M1 | DONE | Promo release removes one `usedBy` entry per release |
| P5-M2 | DONE | Shared sales-close / countdown via `competition-sales` + utils helper |
| P5-M3 | DONE | Cap includes pending/processing order line quantities |
| P5-M4 | DONE | Guest competition page loads cart for limits |
| P5-M5 | DONE | `formatDateTime` uses `Europe/London` |
| P5-M6 | DONE | Orders infinite query seeds `meta.hasMore` from SSR |
| P5-M7 | DONE | Orders filter auto-fetches next pages when no matches in loaded set |
| P5-M8 | DONE | Failed/refunded orders link to checkout success detail |

**Remaining code TODOs:** none for Pass 5. Ops/product rows above are unchanged.
