/**
 * Local "bypass" provider config. There is no third party — the local SDK is
 * an in-process helper that creates session tokens and dispatches synchronous
 * fulfilment. Used in non-production environments only.
 */
export interface LocalConfig {
  /** Always `"sandbox"` for local — there is no live environment. */
  environment: "sandbox";
  /** Whether the runtime is allowed to enable the bypass (e.g. NODE_ENV != production). */
  enabled: boolean;
  /** Optional override for the session id prefix (default: `"local_"`). */
  sessionIdPrefix?: string;
}

/**
 * Result of a local "create session" call. The local bypass has no redirect;
 * the FE navigates to `/checkout/success?provider=local&session_id=...` directly.
 */
export interface LocalSessionResult {
  sessionId: string;
  orderId: string;
  status: "pending" | "completed";
}

export type LocalErrorCode =
  | "LOCAL_BYPASS_DISABLED"
  | "LOCAL_INVALID_AMOUNT"
  | "LOCAL_INVALID_ORDER_ID";

export class LocalError extends Error {
  constructor(
    public readonly code: LocalErrorCode,
    message: string
  ) {
    super(message);
    this.name = "LocalError";
  }
}
