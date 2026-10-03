export type StripeErrorCode =
  | "AUTH_FAILED"
  | "INVALID_INTENT"
  | "CAPTURE_FAILED"
  | "WEBHOOK_INVALID"
  | "NETWORK"
  | "TIMEOUT"
  | "RATE_LIMITED"
  | "INVALID_REQUEST";

export interface StripePaymentIntentResponse {
  id: string;
  clientSecret: string | null;
  status: string;
  amount: number;
  currency: string;
  metadata?: Record<string, string>;
}

export interface StripeCheckoutSessionResponse {
  id: string;
  url: string | null;
  paymentIntentId: string | null;
}

export interface StripeRefundResponse {
  id: string;
  status: string | null;
  amount: number;
}

export interface StripeWebhookEvent {
  id: string;
  type: string;
  created: number;
  data: {
    object: Record<string, unknown>;
  };
  account?: string;
  livemode: boolean;
  pending_webhooks: number;
  request?: {
    id?: string;
    idempotency_key?: string;
  };
}
