import { localAdapter } from "./local";
import { paymentProcessors } from "./payments-processors";
import { paytriotAdapter } from "./paytriot";
import { stripeAdapter } from "./stripe";
import type { PaymentProviderAdapter, PaymentProviderId } from "./types";

export * from "./types";
export { paymentProcessors };

const adapters: Record<PaymentProviderId, PaymentProviderAdapter> = {
  local: localAdapter,
  paytriot: paytriotAdapter,
  stripe: stripeAdapter,
};

export function getAdapter(id: PaymentProviderId): PaymentProviderAdapter {
  const adapter = adapters[id];
  if (!adapter) throw new Error(`Unknown payment provider: ${id}`);
  return adapter;
}
