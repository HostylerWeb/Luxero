export interface PaymentProcessor {
  id: string;
  name: string;
  capabilities: {
    checkout: boolean;
    webhooks: boolean;
    refunds: boolean;
    subscriptions: boolean;
  };
}

export const paymentProcessors: PaymentProcessor[] = [
  {
    id: "local",
    name: "Local Dev",
    capabilities: {
      checkout: true,
      webhooks: false,
      refunds: false,
      subscriptions: false,
    },
  },
  {
    id: "paytriot",
    name: "Paytriot",
    capabilities: {
      checkout: true,
      webhooks: true,
      refunds: false,
      subscriptions: false,
    },
  },
  {
    id: "stripe",
    name: "Stripe",
    capabilities: {
      checkout: true,
      webhooks: true,
      refunds: true,
      subscriptions: false,
    },
  },
];
