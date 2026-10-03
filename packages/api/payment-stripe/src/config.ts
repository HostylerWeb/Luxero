export interface StripeConfig {
  secretKey: string;
  publishableKey?: string;
  webhookSecret?: string;
  environment?: "test" | "live";
}

export function getStripeEnvironmentFromEnv(): "test" | "live" {
  const env = (process.env.STRIPE_ENVIRONMENT ?? "test").toLowerCase();
  return env === "live" ? "live" : "test";
}

export function resolveStripeConfig(overrides?: Partial<StripeConfig>): StripeConfig {
  const environment = overrides?.environment ?? getStripeEnvironmentFromEnv();

  let secretKey: string;
  if (overrides?.secretKey) {
    secretKey = overrides.secretKey;
  } else if (environment === "live") {
    secretKey = process.env.STRIPE_LIVE_SECRET_KEY ?? "";
  } else {
    secretKey = process.env.STRIPE_TEST_SECRET_KEY ?? "";
  }

  if (!secretKey) {
    secretKey = process.env.STRIPE_SECRET_KEY ?? "";
  }

  return {
    secretKey,
    publishableKey: overrides?.publishableKey ?? process.env.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: overrides?.webhookSecret ?? process.env.STRIPE_WEBHOOK_SECRET,
    environment,
  };
}
