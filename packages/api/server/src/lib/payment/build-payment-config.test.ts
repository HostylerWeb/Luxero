import { describe, expect, test } from "vitest";
import { buildPublicPaymentConfig } from "./build-payment-config";
import { mapInternalCapabilitiesToPublic } from "./capabilities";

describe("mapInternalCapabilitiesToPublic", () => {
  test("maps checkout/refunds/webhooks/subscriptions to canonical UI keys", () => {
    expect(
      mapInternalCapabilitiesToPublic({
        checkout: true,
        webhooks: true,
        refunds: false,
        subscriptions: true,
      })
    ).toEqual({
      canCapture: true,
      canUseButtons: true,
      canUseCardFields: true,
      canRefund: false,
      canUseWebhooks: true,
      canUseSubscriptions: true,
    });
  });
});

describe("buildPublicPaymentConfig", () => {
  test("local method is not emitted in the config", () => {
    const config = buildPublicPaymentConfig({
      methods: [
        { provider: "local", enabled: true, environment: "sandbox" },
        {
          provider: "paytriot",
          enabled: true,
          environment: "sandbox",
          sandboxCredentials: { clientId: "sb-client" },
        },
      ],
    });

    expect(config.local).toBeUndefined();
    expect(config.paytriot).toBeDefined();
  });

  test("stripe method is emitted with publishable key and environment flag", () => {
    const config = buildPublicPaymentConfig({
      methods: [
        {
          provider: "stripe",
          enabled: true,
          environment: "live",
          liveCredentials: { publishableKey: "pk_live_db" },
        },
      ],
      stripePublishableKeyEnv: "pk_live_env",
      stripeEnvironmentEnv: "live",
    });

    expect(config.stripe).toEqual({
      publishableKey: "pk_live_env",
      environment: "live",
      capabilities: mapInternalCapabilitiesToPublic({
        checkout: true,
        webhooks: true,
        refunds: true,
        subscriptions: false,
      }),
    });
  });

  test("stripe falls back to DB credentials and defaults to sandbox-derived environment", () => {
    const config = buildPublicPaymentConfig({
      methods: [
        {
          provider: "stripe",
          enabled: true,
          environment: "sandbox",
          sandboxCredentials: { publishableKey: "pk_test_db" },
        },
      ],
    });

    expect(config.stripe).toEqual({
      publishableKey: "pk_test_db",
      environment: "test",
      capabilities: mapInternalCapabilitiesToPublic({
        checkout: true,
        webhooks: true,
        refunds: true,
        subscriptions: false,
      }),
    });
  });

  test("disabled stripe method is not emitted", () => {
    const config = buildPublicPaymentConfig({
      methods: [{ provider: "stripe", enabled: false, environment: "sandbox" }],
    });

    expect(config.stripe).toBeUndefined();
  });
});
