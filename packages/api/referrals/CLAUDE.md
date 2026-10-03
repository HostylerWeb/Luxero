# @luxero/api-referrals

Referral program logic: tier math, award processing, ticket validation, and email notifications.

## Source of truth

`luxero-api/packages/referrals/src` — synced to this repo.

## Key modules

| File | Responsibility |
|------|---------------|
| `referral.ts` | Core referral queries & validation |
| `referral-award.ts` | Award tickets for qualifying referrals |
| `referral-tier-math.ts` | Tier calculation & rate computation |
| `referral-ticket-validation.ts` | Validate ticket award conditions |
| `referral-emails.ts` | Referral-related email dispatch via `@luxero/api-email` |
| `referral-defaults.ts` | Default referral settings |

## Integration

- Referral codes tracked via cookies (`@luxero/utils` referral helpers)
- Awards processed during order fulfillment (`@luxero/api-payment-core`)
- Emails sent through `@luxero/api-email`
