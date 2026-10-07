export type PaymentProviderId = "local" | "paytriot" | "stripe";

export type PaymentStatus = "pending" | "processing" | "completed" | "failed";

export interface ShippingAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postcode: string;
  country?: string;
}

export interface CreateSessionParams {
  items: Array<{
    competitionId: string;
    quantity: number;
    paidQty?: number;
    walletQty?: number;
    answerIndex: number;
  }>;
  userId: string;
  userEmail: string;
  subtotal: number;
  discount: number;
  promoCode?: string;
  promoCodeId?: string;
  discountType?: string;
  promoDiscountPercent?: number;

  referralCode?: string;
  referralBonusTickets?: number;
  referralBalanceUsed?: number;
  frontendUrl: string;

  userPhone?: string;

  firstName?: string;

  lastName?: string;

  shippingAddress?: ShippingAddress;

  idempotencyKey?: string;

  cartId?: string;

  /** True when the buyer is an anonymous guest user. */
  isGuestCheckout?: boolean;

  /** The real email the customer provided at checkout (for guest orders). */
  orderEmail?: string;

  /** Client IP address for fraud scoring. Read from x-forwarded-for / x-real-ip. */
  remoteAddress?: string;

  /** Checkout UI mode: hosted redirect or popup overlay. */
  checkoutMode?: "hosted" | "popup";

  /** GBP site credit applied toward this checkout (charged via gateway separately). */
  siteCreditApplied?: number;
}

export interface CreateSessionResult {
  sessionId: string;
  orderId: string;
  redirectUrl?: string;

  approvalUrl?: string;
  formHtml?: string;
  fields?: Record<string, string>;
  gatewayUrl?: string;
}

export interface WebhookResult {
  eventType: string;
  sessionId: string;
  status: PaymentStatus;
  orderId?: string;
}

export interface PaymentSessionStatus {
  status: PaymentStatus;
  orderId?: string;

  errorCode?: string;

  errorMessage?: string;

  errorTitle?: string;

  recommendedAction?: "retry" | "different_card" | "contact_bank" | "contact_support" | "try_again";

  wasCharged?: boolean;

  /** Order was captured but internal fulfillment failed after capture. */
  fulfillmentFailed?: boolean;
}

/**
 * Contract every payment provider adapter must implement.
 *
 * Note: balance top-up is intentionally NOT part of this interface. Top-up is
 * a separate concern (single payment method — `local` — drives it via
 * `POST /api/balance/top-up`) and is invoked from its own route handler, not
 * the generic checkout flow. Keeping it off the adapter contract prevents
 * non-local adapters from having to stub `createBalanceTopUpSession` with a
 * "not implemented" throw.
 */
export interface PaymentProviderAdapter {
  readonly id: PaymentProviderId;
  createSession(params: CreateSessionParams): Promise<CreateSessionResult>;
  captureSession(sessionId: string, userId?: string): Promise<PaymentSessionStatus>;
  handleWebhook(body: string, sig: string | null | undefined): Promise<WebhookResult>;
  getSessionStatus(sessionId: string, userId?: string): Promise<PaymentSessionStatus>;
  testCredentials(
    environment: "sandbox" | "live",
    clientIdOverride?: string,
    secretOverride?: string
  ): Promise<{ success: boolean; error?: string }>;
  voidSession(sessionId: string): Promise<{ success: boolean; error?: string }>;
}
