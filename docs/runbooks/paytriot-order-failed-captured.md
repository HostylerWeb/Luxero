# Paytriot: Order Failed After Successful Capture

## Problem

Paytriot confirms the transaction succeeded (Auth Code, status `Captured`, Acquirer Response `00`),
but our system shows `payment=unknown` or `order.status = "failed"` and the user received no tickets.

## Root Cause

The `finalizeSuccessfulOrder()` function calls `processOrderFulfillment()`, which can throw when:

- The competition is no longer `status: "active"` (most likely)
- The competition was soft-deleted
- Ticket numbers ran out due to a race
- `metadata.items` is missing or corrupted
- Referral wallet balance is insufficient

Before the fix (commit `6c9ddbf0`), a fulfillment throw propagated all the way up to the
`/paytriot/return` route handler's catch block, which redirected the user to
`payment=unknown`. The order was left as `status: "failed"` in the DB, but Paytriot
had already captured the payment.

After the fix, fulfillment failures are caught gracefully:
- The order is set to `status: "failed"` with `metadata.fulfillmentFailedAfterCapture: true`
- The error details are persisted in `metadata.fulfillmentError`
- A `payment=captured-but-not-fulfilled` query param is set on the redirect
- The user sees an appropriate message on the success page
- A Sentry error is captured

## Identifying Affected Orders

Run on the production MongoDB:

```js
// Orders where Paytriot captured but fulfillment failed
db.orders.find({
  "metadata.fulfillmentFailedAfterCapture": true,
  provider: "paytriot",
}).sort({ createdAt: -1 });

// Orders where Paytriot captured but fulfillment failed (pre-fix, missing the sentinel)
// These will have status: "failed" + paytriotAuthCode present (money captured but no tickets)
db.orders.find({
  status: "failed",
  provider: "paytriot",
  "metadata.paytriotAuthCode": { $exists: true },
  "metadata.fulfillmentFailedAfterCapture": { $ne: true },
}).sort({ createdAt: -1 });
```

## Manual Recovery

For each affected order:

1. **Verify the payment was captured** — Check Paytriot MMS system for the `xref`
   (stored in `metadata.paytriotXref`). Confirm status is `Captured`.

2. **Decide: Refund or Re-fulfill?**
   - If the competition is still active → re-fulfill the order manually (update
     `status` to `pending` and trigger fulfillment via the admin panel).
   - If the competition has ended → refund via Paytriot MMS and mark the
     order as `status: "refunded"` in the admin panel.

3. **Mark the order in our DB**:
   ```js
   db.orders.updateOne(
     { _id: ObjectId("<orderId>") },
     { $set: { status: "refunded", "metadata.refundedVia": "manual_runbook" } }
   );
   ```

## Prevention

- Pre-flight validation in `createSession` (B2 fix) checks competition status
  and ticket availability before allowing the user to proceed to Paytriot.
- The non-throwing catch block (B1 fix) ensures even if the race occurs,
  the user sees a clear message and the order is correctly marked.
- Monitor `payment.fulfillment_failed` log events and Sentry for recurrence.

## Reference

- Order model: `packages/api/db/src/models/Order.ts`
- Fulfillment: `packages/api/server/src/lib/payment/finalize-successful-order.ts`
- Competition status check: `packages/api/payment-core/src/order-fulfillment.ts:478`
- Paytriot adapter: `packages/api/server/src/lib/payment/providers/paytriot.ts`
- Return handler: `packages/api/server/src/routes/client/payments.ts:565-660`
