export interface ProviderDisplayInfo {
  id: string;
  name: string;
  description: string;
  badge?: string;
}

export const providerDisplayMap: Record<string, ProviderDisplayInfo> = {
  local: {
    id: "local",
    name: "Test mode",
    description: "Complete order without payment (development only)",
    badge: "Dev only",
  },

  paytriot: {
    id: "paytriot",
    name: "Card Payment",
    description: "Pay securely by debit/credit card via Paytriot.",
    badge: "New",
  },

  stripe: {
    id: "stripe",
    name: "Card",
    description: "Pay securely by credit/debit card via Stripe.",
    badge: "Fast & secure",
  },
};
