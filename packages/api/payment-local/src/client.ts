import { randomUUID } from "node:crypto";
import { type LocalConfig, LocalError, type LocalSessionResult } from "./types";

/**
 * Local "bypass" provider client. Mirrors the shape of the other SDK clients
 * but is in-process — no HTTP, no third party. Methods generate session ids,
 * validate inputs, and return the shapes the host adapter expects.
 *
 * The bypass is enabled in non-production by default. The host adapter is
 * responsible for the actual order creation / fulfilment dispatch — this
 * client only handles the SDK-shaped surface.
 */
export class LocalClient {
  constructor(private readonly config: LocalConfig) {}

  /**
   * Generate a session id for the local bypass. Format: `local_<uuid-hex>`.
   * Matches the prefix the rest of the codebase uses to detect local orders.
   */
  createSessionId(): string {
    const prefix = this.config.sessionIdPrefix ?? "local_";
    return `${prefix}${randomUUID().replace(/-/g, "")}`;
  }

  /**
   * Validate a checkout amount. Local has no real payment, but we still
   * reject non-positive amounts to catch bad input early.
   */
  validateAmount(amount: number): void {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new LocalError("LOCAL_INVALID_AMOUNT", `Invalid checkout amount: ${amount}`);
    }
  }

  /**
   * Resolve a local session to its order. The local bypass stores the
   * session id on the order's `providerSessionId` field; this helper
   * validates the shape.
   */
  resolveSession(sessionId: string): { orderId: string; status: LocalSessionResult["status"] } {
    if (!sessionId.startsWith("local_")) {
      throw new LocalError(
        "LOCAL_INVALID_ORDER_ID",
        `Session id "${sessionId}" is not a local session`
      );
    }
    return { orderId: sessionId, status: "completed" };
  }

  /**
   * No-op. The local bypass has nothing to void. Returned for parity with
   * the other adapters' `voidSession()`.
   */
  async voidSession(_sessionId: string): Promise<{ success: boolean; error?: string }> {
    return { success: true };
  }

  /**
   * Best-effort credentials test. Local has no credentials; always returns
   * `success: true` if the bypass is enabled, `success: false` otherwise.
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.config.enabled) {
      return { success: false, error: "Local bypass is disabled" };
    }
    return { success: true };
  }
}

export interface CreateLocalClientConfig {
  enabled?: boolean;
  sessionIdPrefix?: string;
}

export function createLocalClient(config: CreateLocalClientConfig = {}): LocalClient {
  return new LocalClient({
    environment: "sandbox",
    enabled: config.enabled ?? true,
    sessionIdPrefix: config.sessionIdPrefix,
  });
}
