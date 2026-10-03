# Platform audit — pass 4 (full domain sweep)

**Date:** 2026-10-02  
**Scope:** End-to-end product surfaces — orders, checkout, payments, wallets, promos, email, competitions, draws, instant/bonus wins, referrals, affiliate, compliance, profile, admin ops, shop, push, jobs, web-lander, database retention.  
**Method:** Static review of `packages/api/server`, `packages/api/tickets`, `packages/api/compliance`, `packages/api/payment-core`, `packages/api/referrals`, `packages/api/affiliate`, `packages/api/email`, `apps/admin`, `apps/client`, `apps/client-mobile`, `apps/web-lander`, `apps/shop`. Builds on [admin-audit.md](./admin-audit.md), [client-audit.md](./client-audit.md), [database-audit.md](./database-audit.md) (including pass 3 promo items).

**Related:** Promo/coupon specifics remain in pass 3 sections (admin **M23–M24**, client **H8–H10**, database **M15–M16**).

---

## Coverage checklist

| Domain | Documented in pass 4 | Prior audit refs |
|--------|----------------------|------------------|
| Orders (create, pending, failed, abandoned, refund) | §Orders | DB H3–H4; admin exports M13 |
| Order confirmation email | §Email | — |
| Coupons / promo codes | Pass 3 | M23, H8–H10, M15–M16 |
| Cart & checkout pricing | §Cart | client L5 |
| Payments (Paytriot, Stripe, local) | §Payments | client M19 Cashflows gap |
| Cash wallet top-up / withdraw | §Wallet | — |
| Competitions & ticket counts | §Competitions | DB tickets; admin M21 undraw |
| Draws & Draw Studio | §Competitions | admin H7–H8 |
| Instant wins | §Compliance | proposal scope |
| Bonus awards | §Jobs | client M5 |
| Winners & fulfilment | §Admin | admin M22 |
| User profile / `me/*` | §Profile | DB C1 identity |
| Guest checkout & merge | §Profile / §Compliance | client L5 |
| Referrals & tiers | §Referrals | DB referral indexes |
| Affiliate postbacks / CAPI | §Referrals | — |
| Compliance (spend, exclusion, age) | §Compliance | DB compliance |
| Admin users / RBAC / bulk | §Admin | admin C1, M14; DB C1 |
| Admin competitions CRUD | §Admin | admin M2 |
| Admin orders & refunds | §Admin | — |
| Exports & search | §Admin | admin M13 |
| Promo admin UI | Pass 3 | M23–M24 |
| Shop API & checkout | §Shop | client M8 |
| Push subscriptions | §Notifications | — |
| Email / SMTP / templates | §Email | admin email settings |
| Media library | §Admin | admin M18 |
| Internal jobs / cron | §Jobs | admin H3; client M5 |
| web-lander | §Web-lander | client M21 |
| client-mobile parity | §Web-lander | client M10–M15 |
| MongoDB TTL / retention | §Database | database H3–H7 |
| Auth / sessions | §Auth | client C1, H1 |

---

## Critical

### P4-C1 — Local balance top-up credits wallet without real payment

**Where:** `POST /api/balance/top-up` → `createLocalBalanceTopUpSession` (`packages/api/server/src/routes/client/balance.ts`, `lib/payment/providers/local.ts`).

**Issue:** Route only accepts `provider: "local"`. Local top-up completes synchronously (completed order + balance credit) with no hosted gateway. Any authenticated user can mint wallet balance if the route is reachable in production.

**Recommendation:** Disable in production; require Paytriot/Stripe top-up; gate with `ENABLE_LOCAL_PAYMENT_METHOD` and non-customer roles only in dev.

---

## High

### P4-H1 — Admin order “refund” credits wallet; no PSP refund

**Where:** Admin order status → `refunded` → `rollbackOrderRefund` (`packages/api/payment-core/src/order-refund-rollback.ts`, `routes/admin/orders.ts`).

**Issue:** Rollback voids tickets and may credit **site wallet** for full `order.total` without calling Paytriot/Stripe refund APIs. Card customers can keep the charge and receive spendable credit.

**Recommendation:** Provider refund first; wallet credit only for wallet-funded portion; separate “void tickets” from “return money”.

---

### P4-H2 — Instant-win credit-card ban not enforced at payment session

**Where:** `assertComplianceForCheckout(..., blockCardPayment: false)` always (`routes/client/payments.ts` ~439).

**Issue:** Compliance settings can enable instant-win card block in UI/hints, but checkout never passes `blockCardPayment: true`, so `INSTANT_WIN_CREDIT_CARD_BLOCKED` is not applied at session create.

**Recommendation:** Set flag from compliance settings when ban enabled and cart has instant-win SKUs.

---

### P4-H3 — `local` payment provider can be enabled in DB while env says off

**Where:** `ensure-local-payment-method.ts`, admin `payment-methods` PATCH, public `payment-config`.

**Issue:** Admin can enable `local` in Mongo after seed; checkout and shop paths honor DB `enabled`, bypassing card capture (competition zero-balance/local and shop paid inline).

**Recommendation:** Hard-block `local` in production in adapter allowlist and public config regardless of DB toggle.

---

### P4-H4 — Shop checkout with `local` marks paid without gateway

**Where:** `routes/client/shop/checkout.ts`.

**Issue:** Same class as competition local bypass: inventory decremented, confirmation email sent, order `paid`.

**Recommendation:** Disallow `local` for shop in production.

---

### P4-H5 — Affiliate conversion postbacks: SSRF risk on admin URLs

**Where:** `packages/api/affiliate/src/tracker.ts`, `fire-order-conversion.ts`.

**Issue:** Server-side `fetch` to URLs from conversion settings (interpolated query). Compromised staff or malicious template can probe internal networks from API host.

**Recommendation:** HTTPS allowlist, block private IP ranges, optional outbound proxy.

---

## Medium — Orders & cart

### P4-M1 — Abandoned-order job does not release `reservedSpend`

**Where:** `lib/jobs/cleanup-abandoned-orders.ts` vs `markOrderFailed` in `order-helpers.ts`.

**Issue:** Job sets `failed`, voids session, may release promo — but not monthly spend reservation taken at checkout. Users appear over limit without completing purchase.

**Recommendation:** Reuse `markOrderFailed` or call `releaseReservedSpend`.

---

### P4-M2 — Abandoned cleanup ignores stale `processing` orders

**Where:** `cleanup-abandoned-orders.ts` (pending only); `ticketing-anomaly-checks.ts` (detect only).

**Issue:** Stuck `processing` after provider/webhook issues is logged but not auto-failed or released.

**Recommendation:** Threshold-based remediation job + alerts.

---

### P4-M3 — Order confirmation email failure is silent

**Where:** `lib/orders.ts` / fulfillment deps — `sendOrderConfirmationEmail` catch+log only.

**Issue:** Order can be `completed` with no confirmation email and no retry queue.

**Recommendation:** Persist `emailSentAt` / failure reason; retry job (like operational mail elsewhere).

---

### P4-M4 — Cart abandon does not release spend reservation

**Where:** Compliance reserve at payment session; cart TTL soft-delete (`cleanup-abandoned-orders`).

**Issue:** Combined with P4-M1: user reserves spend, never pays, limits stuck until month rollover.

**Recommendation:** Release on cart clear, session failure, and abandoned order paths.

---

## Medium — Compliance

### P4-M5 — Monthly card spend limit uses full cart total

**Where:** `payments.ts` `projectedCreditSpend: cartTotal`; `compliance-checks.ts`.

**Issue:** Wallet/promo-funded portions still count as projected card spend for cap checks.

**Recommendation:** Use payable card amount from pricing breakdown.

---

### P4-M6 — Shop checkout skips compliance stack

**Where:** `routes/client/shop/checkout.ts` — no `assertComplianceForCheckout`.

**Issue:** Self-exclusion and spend limits not applied to merchandise checkout.

**Recommendation:** Shared gate or documented exclusion with sign-off.

---

### P4-M7 — Wallet withdrawal allowed under self-exclusion

**Where:** `routes/client/balance.ts` withdraw — no `assertNotEffectivelySelfExcluded`.

**Issue:** Excluded users cannot buy tickets but can request cash wallet withdrawal (policy gap).

**Recommendation:** Align with responsible play policy; audit-log exceptions.

---

## Medium — Referrals & payments ops

### P4-M8 — Admin refund does not invalidate `ReferralPurchase`

**Where:** `order-refund-rollback.ts` vs `recordReferralPurchase` on fulfill.

**Issue:** Refunded referee orders can still count toward referrer tiers and rewards.

**Recommendation:** Mark purchase invalid; recompute tiers; claw back tickets per policy.

---

### P4-M9 — Balance top-up double-reads request body

**Where:** `balance.ts` — `validateBody` then `c.req.json()` for `provider`.

**Issue:** Second read can fail on some runtimes; defaults to `local`.

**Recommendation:** Use `c.get("body")` only; extend schema with `provider`.

---

### P4-M10 — Ticketing anomaly job auto-fixes counters without audit

**Where:** `lib/jobs/ticketing-anomaly-checks.ts`.

**Issue:** Drift on `ticketsSold` / `ticketsHeld` repaired silently — masks allocation bugs.

**Recommendation:** Alert-first; optional fix behind flag; compliance audit entry.

---

### P4-M11 — Bonus-award interval duplicates per API instance

**Where:** `bootstrap.ts` `setInterval` + `check-bonus-awards.ts`.

**Issue:** Multiple containers each run milestone checks every 5 minutes (extends client M5).

**Recommendation:** Single cron via `/api/internal/jobs` only.

---

### P4-M12 — Push subscribe allows unauthenticated writes

**Where:** `routes/common/push-subscriptions.ts` — no `requireSession`.

**Issue:** Junk subscriptions and DB noise; `userId` may be null.

**Recommendation:** Require session; rate-limit by IP.

---

### P4-M13 — Profile name sync may use wrong Better Auth user key

**Where:** `routes/client/me/profile.ts` — `updateOne({ _id: ObjectId(userId) })`.

**Issue:** Auth `user` rows often use string `_id` (DB L9 / C1 family). Display names may not sync to session user.

**Recommendation:** Use adapter update or string `_id` consistently.

---

### P4-M14 — web-lander CTA URL vs API base env mismatch

**Where:** `apps/web-lander/lib/config.ts` (`getFrontendUrl`) vs `lib/api.ts` (`getApiBaseUrl` chain).

**Issue:** SSR data can work while “Enter competition” links point at wrong host if only `CLIENT_APP_URL` is set.

**Recommendation:** Single env resolver for CTAs and API.

---

### P4-M15 — `PaymentAttempt` TTL (90d) vs chargeback window

**Where:** `packages/api/db/src/models/PaymentAttempt.ts`.

**Issue:** Attempt forensics (declines, 3DS metadata) expire before some disputes complete.

**Recommendation:** Archive or disable TTL in production.

---

## Low

### P4-L1 — SSE `/api/competitions/stream` is heartbeat-only

**Where:** `routes/common/competitions.ts`.

**Issue:** No sold-count or status events; product may imply live updates.

**Recommendation:** Publish events from fulfillment or remove SSE from UX docs.

---

### P4-L2 — Draw-due job only sets `pending_draw`

**Where:** `check-competitions-for-draw.ts`.

**Issue:** No automatic winner pick; ops must finish in admin/Draw Studio.

**Recommendation:** Alerts on aged `pending_draw`; document SLA.

---

### P4-L3 — Guest spend caps hardcoded (£100 / £500)

**Where:** `compliance-checks.ts`.

**Issue:** Not in admin `ComplianceSettings` unlike other knobs.

**Recommendation:** Settings-driven or documented constants.

---

### P4-L4 — SMTP send single-attempt (Resend has retry)

**Where:** `packages/api/email/src/client.ts`.

**Issue:** Transient SMTP failures lose transactional mail in-request.

**Recommendation:** Shared retry/queue with order confirmation (P4-M3).

---

### P4-L5 — Shop order confirmation email `.catch(() => {})`

**Where:** `shop/checkout.ts`, shop branches in `payments.ts`.

**Issue:** Paid shop orders with no email audit trail.

**Recommendation:** Same as P4-M3 for `ShopOrder`.

---

### P4-L6 — Wallet top-up uses competition `Order` model

**Where:** `local.ts` balance top-up session.

**Issue:** Top-ups inflate order analytics and interact with order TTL policies (DB angle).

**Recommendation:** Dedicated ledger-only flow.

---

### P4-L7 — Push preferences `updateMany` without stale endpoint cleanup

**Where:** `push-subscriptions.ts`.

**Issue:** Multiple devices; dead endpoints stay active until send fails.

**Recommendation:** Prune on 410 Gone from web-push.

---

### P4-L8 — No step-up auth for high-value wallet mutations

**Where:** `balance.ts` top-up/withdraw.

**Issue:** Stolen session can move money without re-verify.

**Recommendation:** Velocity limits or MFA for withdraw.

---

### P4-L9 — Admin refund audit timing vs rollback partial failure

**Where:** `routes/admin/orders.ts` refund branch.

**Issue:** Audit relies on rollback helper; unclear UI state if rollback partial.

**Recommendation:** Single admin audit record with PSP reference.

---

## Recommended triage (pass 4)

1. **P4-C1 / P4-H3 / P4-H4** — Remove or lock down `local` provider in production (wallet + shop + competitions).  
2. **P4-H1** — Admin refund vs real PSP refund.  
3. **P4-H2** — Instant-win card block at checkout.  
4. **P4-H5** — Affiliate URL SSRF hardening.  
5. **P4-M1 / P4-M4** — Spend reservation + abandoned order cleanup.  
6. **P4-M3 / P4-L4 / P4-L5** — Outbound email reliability.  
7. **P4-M8** — Referral tier integrity on refund.  
8. Pass 3 promo items (**M23**, **H8–H10**) — product + validate/reserve parity.

---

## Key file index (pass 4)

| Area | Path |
|------|------|
| Checkout compliance | `packages/api/server/src/routes/client/payments.ts` |
| Cart / discounts | `packages/api/server/src/routes/client/cart.ts`, `packages/api/tickets/src/resolve-discount.ts` |
| Orders admin | `packages/api/server/src/routes/admin/orders.ts` |
| Refund rollback | `packages/api/payment-core/src/order-refund-rollback.ts` |
| Abandoned orders | `packages/api/server/src/lib/jobs/cleanup-abandoned-orders.ts` |
| Local provider | `packages/api/server/src/lib/payment/providers/local.ts` |
| Balance | `packages/api/server/src/routes/client/balance.ts` |
| Shop checkout | `packages/api/server/src/routes/client/shop/checkout.ts` |
| Affiliate fire | `packages/api/server/src/lib/payment/fire-order-conversion.ts` |
| Profile | `packages/api/server/src/routes/client/me/profile.ts` |
| Push | `packages/api/server/src/routes/common/push-subscriptions.ts` |
| Jobs | `packages/api/server/src/bootstrap.ts`, `lib/jobs/*.ts` |
| web-lander | `apps/web-lander/lib/config.ts`, `lib/api.ts` |

---

*Next pass: runtime E2E on checkout/refund paths, production Mongo + payment config review, Capacitor device matrix.*
