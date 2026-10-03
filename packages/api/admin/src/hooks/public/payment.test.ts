import { describe, expect, test } from "vitest";
import { parsePaymentConfigPayload, parseStripeConfig } from "./payment";

describe("parsePaymentConfigPayload", () => {
  test("returns undefined for non-object payloads", () => {
    expect(parsePaymentConfigPayload(null)).toBeUndefined();
    expect(parsePaymentConfigPayload(undefined)).toBeUndefined();
    expect(parsePaymentConfigPayload("string")).toBeUndefined();
    expect(parsePaymentConfigPayload(42)).toBeUndefined();
    expect(parsePaymentConfigPayload(true)).toBeUndefined();
  });

  test("returns the inner config when payload has a config field", () => {
    const innerConfig = { provider: "stripe", enabled: true };
    expect(parsePaymentConfigPayload({ config: innerConfig })).toEqual(innerConfig);
  });

  test("returns the payload as-is when it has no config wrapper", () => {
    const rawConfig = { provider: "paytriot", enabled: false };
    expect(parsePaymentConfigPayload(rawConfig)).toEqual(rawConfig);
  });

  test("ignores empty config field and falls back to payload", () => {
    const rawConfig = { provider: "local", enabled: true };
    expect(parsePaymentConfigPayload({ config: null, ...rawConfig })).toEqual({
      config: null,
      ...rawConfig,
    });
  });

  test("passes through a stripe public config in the envelope", () => {
    const innerConfig = {
      stripe: {
        publishableKey: "pk_test_xxx",
        environment: "test",
        capabilities: { canUseCardFields: true },
      },
    };
    expect(parsePaymentConfigPayload({ config: innerConfig })).toEqual(innerConfig);
  });
});

describe("parseStripeConfig", () => {
  test("extracts stripe from the parsed config", () => {
    expect(
      parseStripeConfig({
        config: {
          stripe: {
            publishableKey: "pk_live_xxx",
            environment: "live",
            capabilities: { canCapture: true },
          },
        },
      })
    ).toEqual({
      publishableKey: "pk_live_xxx",
      environment: "live",
      capabilities: { canCapture: true },
    });
  });

  test("returns undefined when stripe is absent", () => {
    expect(parseStripeConfig({ config: { paytriot: { environment: "sandbox" } } })).toBeUndefined();
    expect(parseStripeConfig(null)).toBeUndefined();
  });
});
