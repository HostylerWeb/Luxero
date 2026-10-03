import Stripe from "stripe";
import { resolveStripeConfig, type StripeConfig } from "./config";
import type {
  StripeCheckoutSessionResponse,
  StripeErrorCode,
  StripePaymentIntentResponse,
  StripeRefundResponse,
  StripeWebhookEvent,
} from "./types";

export class StripeError extends Error {
  constructor(
    public readonly code: StripeErrorCode,
    message: string
  ) {
    super(message);
    this.name = "StripeError";
  }
}

export class StripeClient {
  private readonly stripe: Stripe;

  constructor(config: StripeConfig) {
    this.stripe = new Stripe(config.secretKey, {
      maxNetworkRetries: 2,
      timeout: 15000,
    } as Stripe.StripeConfig);
  }

  async createPaymentIntent(params: {
    amount: number;
    currency: string;
    metadata?: Record<string, string>;
  }): Promise<StripePaymentIntentResponse> {
    try {
      const intent = await this.stripe.paymentIntents.create({
        amount: params.amount,
        currency: params.currency,
        automatic_payment_methods: { enabled: true },
        metadata: params.metadata,
      });
      return {
        id: intent.id,
        clientSecret: intent.client_secret,
        status: intent.status,
        amount: intent.amount,
        currency: intent.currency,
        metadata: intent.metadata as Record<string, string> | undefined,
      };
    } catch (error) {
      throw translateStripeError(error);
    }
  }

  async createCheckoutSession(params: {
    amount: number;
    currency: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
  }): Promise<StripeCheckoutSessionResponse> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: params.currency,
              product_data: { name: "Shop Order" },
              unit_amount: params.amount,
            },
            quantity: 1,
          },
        ],
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        metadata: params.metadata,
      });
      return {
        id: session.id,
        url: session.url,
        paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
      };
    } catch (error) {
      throw translateStripeError(error);
    }
  }

  async retrievePaymentIntent(paymentIntentId: string): Promise<StripePaymentIntentResponse> {
    try {
      const intent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return {
        id: intent.id,
        clientSecret: intent.client_secret,
        status: intent.status,
        amount: intent.amount,
        currency: intent.currency,
        metadata: intent.metadata as Record<string, string> | undefined,
      };
    } catch (error) {
      throw translateStripeError(error);
    }
  }

  async cancelCheckoutSession(sessionId: string): Promise<void> {
    try {
      await this.stripe.checkout.sessions.expire(sessionId);
    } catch (error) {
      throw translateStripeError(error);
    }
  }

  async cancelPaymentIntent(paymentIntentId: string): Promise<StripePaymentIntentResponse> {
    try {
      const intent = await this.stripe.paymentIntents.cancel(paymentIntentId);
      return {
        id: intent.id,
        clientSecret: intent.client_secret,
        status: intent.status,
        amount: intent.amount,
        currency: intent.currency,
        metadata: intent.metadata as Record<string, string> | undefined,
      };
    } catch (error) {
      throw translateStripeError(error);
    }
  }

  async refundPaymentIntent(params: {
    paymentIntentId: string;
    amount?: number;
  }): Promise<StripeRefundResponse> {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: params.paymentIntentId,
        amount: params.amount,
      });
      return {
        id: refund.id,
        status: refund.status,
        amount: refund.amount,
      };
    } catch (error) {
      throw translateStripeError(error);
    }
  }

  async listWebhookEndpoints(): Promise<Stripe.Response<Stripe.ApiList<Stripe.WebhookEndpoint>>> {
    return this.stripe.webhookEndpoints.list({ limit: 100 });
  }

  async createWebhookEndpoint(params: {
    url: string;
    enabledEvents: string[];
  }): Promise<Stripe.Response<Stripe.WebhookEndpoint>> {
    return this.stripe.webhookEndpoints.create({
      url: params.url,
      enabled_events: params.enabledEvents,
      connect: false,
    } as Stripe.WebhookEndpointCreateParams);
  }

  async updateWebhookEndpoint(params: {
    id: string;
    enabledEvents: string[];
  }): Promise<Stripe.Response<Stripe.WebhookEndpoint>> {
    return this.stripe.webhookEndpoints.update(params.id, {
      enabled_events: params.enabledEvents,
    } as Stripe.WebhookEndpointUpdateParams);
  }

  async updatePaymentIntent(params: {
    paymentIntentId: string;
    metadata: Record<string, string>;
  }): Promise<StripePaymentIntentResponse> {
    try {
      const intent = await this.stripe.paymentIntents.update(params.paymentIntentId, {
        metadata: params.metadata,
      });
      return {
        id: intent.id,
        clientSecret: intent.client_secret,
        status: intent.status,
        amount: intent.amount,
        currency: intent.currency,
        metadata: intent.metadata as Record<string, string> | undefined,
      };
    } catch (error) {
      throw translateStripeError(error);
    }
  }

  async verifyWebhookSignature(
    rawBody: string | Buffer,
    signatureHeader: string,
    secret: string
  ): Promise<StripeWebhookEvent> {
    try {
      const event = await this.stripe.webhooks.constructEventAsync(
        rawBody,
        signatureHeader,
        secret
      );
      return {
        id: event.id,
        type: event.type,
        created: event.created,
        data: {
          object: event.data.object as unknown as Record<string, unknown>,
        },
        account: event.account,
        livemode: event.livemode,
        pending_webhooks: event.pending_webhooks,
        request: event.request
          ? {
              id: event.request.id ?? undefined,
              idempotency_key: event.request.idempotency_key ?? undefined,
            }
          : undefined,
      };
    } catch (error) {
      throw translateStripeError(error);
    }
  }
}

export function createStripeClient(config?: Partial<StripeConfig>): StripeClient {
  return new StripeClient(resolveStripeConfig(config));
}

function translateStripeError(error: unknown): StripeError {
  if (error instanceof StripeError) return error;

  const err = error as {
    type?: string;
    code?: string;
    statusCode?: number;
    message?: string;
  };

  const message = err.message ?? "Unknown Stripe error";

  if (err.type === "StripeAuthenticationError" || err.statusCode === 401) {
    return new StripeError("AUTH_FAILED", message);
  }
  if (err.type === "StripeRateLimitError" || err.statusCode === 429) {
    return new StripeError("RATE_LIMITED", message);
  }
  if (err.type === "StripeInvalidRequestError" || err.statusCode === 400) {
    if (err.code === "resource_missing" || err.statusCode === 404) {
      return new StripeError("INVALID_INTENT", message);
    }
    return new StripeError("INVALID_REQUEST", message);
  }
  if (err.type?.includes("SignatureVerification")) {
    return new StripeError("WEBHOOK_INVALID", message);
  }
  if (err.type?.includes("Timeout") || err.code === "ETIMEDOUT") {
    return new StripeError("TIMEOUT", message);
  }
  if (err.type?.includes("Connection")) {
    return new StripeError("NETWORK", message);
  }
  if (err.type === "StripeAPIError" && err.statusCode === 404) {
    return new StripeError("INVALID_INTENT", message);
  }

  return new StripeError("NETWORK", message);
}
