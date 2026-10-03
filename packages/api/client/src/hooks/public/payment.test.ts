import { describe, expect, it } from "vitest";
import { parsePaymentConfigPayload, parseStripeConfig } from "./payment";

describe("parsePaymentConfigPayload", () => {
  it("reads canonical config envelope", () => {
    expect(
      parsePaymentConfigPayload({
        config: {
          paytriot: {
            clientId: "sb-client",
            environment: "sandbox",
            capabilities: { canCapture: true },
          },
        },
      })
    ).toEqual({
      paytriot: {
        clientId: "sb-client",
        environment: "sandbox",
        capabilities: { canCapture: true },
      },
    });
  });

  it("falls back to legacy flat payload shape", () => {
    expect(
      parsePaymentConfigPayload({
        paytriot: {
          clientId: "legacy-client",
          environment: "live",
        },
      })
    ).toEqual({
      paytriot: {
        clientId: "legacy-client",
        environment: "live",
      },
    });
  });

  it("passes through a stripe config in the canonical envelope", () => {
    expect(
      parsePaymentConfigPayload({
        config: {
          stripe: {
            publishableKey: "pk_test_xxx",
            environment: "test",
            capabilities: { canUseCardFields: true },
          },
        },
      })
    ).toEqual({
      stripe: {
        publishableKey: "pk_test_xxx",
        environment: "test",
        capabilities: { canUseCardFields: true },
      },
    });
  });

  it("passes through a legacy flat stripe config", () => {
    expect(
      parsePaymentConfigPayload({
        stripe: {
          publishableKey: "pk_live_xxx",
          environment: "live",
          capabilities: { canUseCardFields: true },
        },
      })
    ).toEqual({
      stripe: {
        publishableKey: "pk_live_xxx",
        environment: "live",
        capabilities: { canUseCardFields: true },
      },
    });
  });
});

describe("parseStripeConfig", () => {
  it("extracts stripe from the parsed config", () => {
    expect(
      parseStripeConfig({
        config: {
          stripe: {
            publishableKey: "pk_test_xxx",
            environment: "test",
            capabilities: { canCapture: true, canUseCardFields: true },
          },
        },
      })
    ).toEqual({
      publishableKey: "pk_test_xxx",
      environment: "test",
      capabilities: { canCapture: true, canUseCardFields: true },
    });
  });

  it("returns undefined when stripe is absent", () => {
    expect(parseStripeConfig({ config: { paytriot: { environment: "sandbox" } } })).toBeUndefined();
    expect(parseStripeConfig(null)).toBeUndefined();
  });
});
