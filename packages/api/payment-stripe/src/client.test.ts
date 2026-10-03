import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock("stripe", () => {
  const mocks = {
    mockPaymentIntents: { create: vi.fn(), retrieve: vi.fn(), cancel: vi.fn(), update: vi.fn() },
    mockRefunds: { create: vi.fn() },
    mockWebhookEndpoints: { list: vi.fn(), create: vi.fn(), update: vi.fn() },
    mockConstructEventAsync: vi.fn(),
  };
  class MockStripe {
    static Stripe = MockStripe;
    paymentIntents = mocks.mockPaymentIntents;
    refunds = mocks.mockRefunds;
    webhookEndpoints = mocks.mockWebhookEndpoints;
    webhooks = { constructEventAsync: mocks.mockConstructEventAsync };
  }
  return { default: MockStripe, ...mocks };
});

import { createStripeClient, StripeClient, StripeError } from "./client";

const stripeModule = await import("stripe");
type MockDefs = {
  mockPaymentIntents: {
    create: ReturnType<typeof vi.fn>;
    retrieve: ReturnType<typeof vi.fn>;
    cancel: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  mockRefunds: { create: ReturnType<typeof vi.fn> };
  mockWebhookEndpoints: {
    list: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  mockConstructEventAsync: ReturnType<typeof vi.fn>;
};
const { mockPaymentIntents, mockRefunds, mockWebhookEndpoints, mockConstructEventAsync } =
  stripeModule as unknown as MockDefs;

afterEach(() => {
  vi.clearAllMocks();
});

function createTestClient() {
  return new StripeClient({ secretKey: "sk_test_mock" });
}

describe("StripeClient", () => {
  test("createPaymentIntent returns mapped response", async () => {
    const client = createTestClient();

    mockPaymentIntents.create.mockResolvedValueOnce({
      id: "pi_123",
      client_secret: "pi_123_secret",
      status: "requires_payment_method",
      amount: 2000,
      currency: "GBP",
      metadata: { orderId: "ord_1" },
    });

    const result = await client.createPaymentIntent({
      amount: 2000,
      currency: "GBP",
      metadata: { orderId: "ord_1" },
    });

    expect(result.id).toBe("pi_123");
    expect(result.clientSecret).toBe("pi_123_secret");
    expect(result.status).toBe("requires_payment_method");
    expect(result.amount).toBe(2000);
    expect(result.currency).toBe("GBP");
    expect(result.metadata?.orderId).toBe("ord_1");
  });

  test("retrievePaymentIntent returns mapped response", async () => {
    const client = createTestClient();

    mockPaymentIntents.retrieve.mockResolvedValueOnce({
      id: "pi_456",
      client_secret: "pi_456_secret",
      status: "succeeded",
      amount: 5000,
      currency: "USD",
      metadata: {},
    });

    const result = await client.retrievePaymentIntent("pi_456");
    expect(result.id).toBe("pi_456");
    expect(result.status).toBe("succeeded");
  });

  test("cancelPaymentIntent returns cancelled intent", async () => {
    const client = createTestClient();

    mockPaymentIntents.cancel.mockResolvedValueOnce({
      id: "pi_789",
      client_secret: null,
      status: "canceled",
      amount: 1500,
      currency: "GBP",
      metadata: {},
    });

    const result = await client.cancelPaymentIntent("pi_789");
    expect(result.status).toBe("canceled");
  });

  test("refundPaymentIntent returns refund response", async () => {
    const client = createTestClient();

    mockRefunds.create.mockResolvedValueOnce({
      id: "re_123",
      status: "succeeded",
      amount: 2000,
    });

    const result = await client.refundPaymentIntent({
      paymentIntentId: "pi_123",
      amount: 2000,
    });

    expect(result.id).toBe("re_123");
    expect(result.status).toBe("succeeded");
    expect(result.amount).toBe(2000);
  });

  test("verifyWebhookSignature passes with correct secret", async () => {
    const client = createTestClient();

    mockConstructEventAsync.mockResolvedValueOnce({
      id: "evt_1",
      type: "payment_intent.succeeded",
      created: 1700000000,
      data: { object: { id: "pi_1" } },
      account: undefined,
      livemode: false,
      pending_webhooks: 0,
      request: { id: "req_1", idempotency_key: "ik_1" },
    });

    const result = await client.verifyWebhookSignature(
      JSON.stringify({ id: "evt_1" }),
      "sig_header",
      "whsec_test"
    );

    expect(result.id).toBe("evt_1");
    expect(result.type).toBe("payment_intent.succeeded");
  });

  test("verifyWebhookSignature throws WEBHOOK_INVALID with wrong secret", async () => {
    const client = createTestClient();

    const sigError = new Error("Signature verification failed");
    sigError.name = "StripeSignatureVerificationError";
    (sigError as unknown as Record<string, unknown>).type = "StripeSignatureVerificationError";
    mockConstructEventAsync.mockRejectedValue(sigError);

    await expect(client.verifyWebhookSignature("{}", "bad_sig", "wrong_secret")).rejects.toThrow(
      StripeError
    );

    await expect(client.verifyWebhookSignature("{}", "bad_sig", "wrong_secret")).rejects.toThrow(
      "Signature verification failed"
    );
  });

  test("translates authentication error to StripeError", async () => {
    const client = createTestClient();

    const authError = new Error("Invalid API Key");
    (authError as unknown as Record<string, unknown>).type = "StripeAuthenticationError";
    (authError as unknown as Record<string, unknown>).statusCode = 401;
    mockPaymentIntents.create.mockRejectedValue(authError);

    await expect(client.createPaymentIntent({ amount: 1000, currency: "GBP" })).rejects.toThrow(
      StripeError
    );
  });

  test("translates rate limit error", async () => {
    const client = createTestClient();

    const rateError = new Error("Too many requests");
    (rateError as unknown as Record<string, unknown>).type = "StripeRateLimitError";
    (rateError as unknown as Record<string, unknown>).statusCode = 429;
    mockPaymentIntents.retrieve.mockRejectedValue(rateError);

    const err = await client.retrievePaymentIntent("pi_1").catch((e: unknown) => e);
    expect(err).toBeInstanceOf(StripeError);
    expect((err as StripeError).code).toBe("RATE_LIMITED");
  });

  test("translates signature verification error in webhook", async () => {
    const client = createTestClient();

    const sigError = new Error("Bad signature");
    (sigError as unknown as Record<string, unknown>).type = "StripeSignatureVerificationError";
    mockConstructEventAsync.mockRejectedValue(sigError);

    const err = await client.verifyWebhookSignature("{}", "bad", "secret").catch((e: unknown) => e);
    expect(err).toBeInstanceOf(StripeError);
    expect((err as StripeError).code).toBe("WEBHOOK_INVALID");
  });

  test("listWebhookEndpoints calls stripe API", async () => {
    const client = createTestClient();

    mockWebhookEndpoints.list.mockResolvedValueOnce({
      data: [{ id: "we_1", url: "https://example.com/hooks" }],
    });

    const result = await client.listWebhookEndpoints();
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe("we_1");
  });

  test("createWebhookEndpoint calls stripe API", async () => {
    const client = createTestClient();

    mockWebhookEndpoints.create.mockResolvedValueOnce({
      id: "we_new",
      url: "https://example.com/hooks",
      status: "enabled",
    });

    const result = await client.createWebhookEndpoint({
      url: "https://example.com/hooks",
      enabledEvents: ["payment_intent.succeeded"],
    });

    expect(result.id).toBe("we_new");
  });

  test("updateWebhookEndpoint calls stripe API with enabled_events", async () => {
    const client = createTestClient();

    mockWebhookEndpoints.update.mockResolvedValueOnce({
      id: "we_existing",
      url: "https://example.com/hooks",
      status: "enabled",
      enabled_events: ["checkout.session.completed"],
    });

    const result = await client.updateWebhookEndpoint({
      id: "we_existing",
      enabledEvents: ["checkout.session.completed"],
    });

    expect(result.id).toBe("we_existing");
    expect(mockWebhookEndpoints.update).toHaveBeenCalledWith("we_existing", {
      enabled_events: ["checkout.session.completed"],
    });
  });

  test("updatePaymentIntent maps the updated intent", async () => {
    const client = createTestClient();

    mockPaymentIntents.update.mockResolvedValueOnce({
      id: "pi_123",
      client_secret: "pi_123_secret",
      status: "requires_payment_method",
      amount: 2000,
      currency: "GBP",
      metadata: { orderId: "ord_1" },
    });

    const result = await client.updatePaymentIntent({
      paymentIntentId: "pi_123",
      metadata: { orderId: "ord_1" },
    });

    expect(result.id).toBe("pi_123");
    expect(result.metadata?.orderId).toBe("ord_1");
    expect(mockPaymentIntents.update).toHaveBeenCalledWith("pi_123", {
      metadata: { orderId: "ord_1" },
    });
  });

  test("translates network error to StripeError", async () => {
    const client = createTestClient();

    const netError = new Error("Connection reset");
    (netError as unknown as Record<string, unknown>).type = "StripeConnectionError";
    mockPaymentIntents.create.mockRejectedValue(netError);

    await expect(client.createPaymentIntent({ amount: 1000, currency: "GBP" })).rejects.toThrow(
      StripeError
    );
  });
});

describe("createStripeClient", () => {
  test("returns a StripeClient instance", () => {
    const client = createStripeClient({ secretKey: "sk_test_foo" });
    expect(client).toBeInstanceOf(StripeClient);
  });
});
