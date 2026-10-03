/**
 * Local "bypass" provider has no external webhooks. The `verifyLocalWebhook`
 * function is a no-op pass-through that always returns the parsed body
 * unchanged. It exists for parity with the other SDKs' `webhooks.ts` modules
 * so the host adapter can dispatch uniformly.
 */
export function verifyLocalWebhook(body: string): { raw: string; verified: true } {
  return { raw: body, verified: true };
}

/**
 * Parse a local webhook body. Local doesn't send webhooks, but a route may
 * still accept POSTs from internal cron / health checks. Returns the raw
 * string and a `verified: true` flag for parity.
 */
export function parseLocalWebhook(body: string): { raw: string; verified: true } {
  return verifyLocalWebhook(body);
}
