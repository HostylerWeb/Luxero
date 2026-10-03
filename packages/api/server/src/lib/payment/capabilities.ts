import type {
  PaymentProviderCapabilities,
  PaymentProviderInternalCapabilities,
} from "@luxero/types";

export function mapInternalCapabilitiesToPublic(
  internal: PaymentProviderInternalCapabilities
): PaymentProviderCapabilities {
  return {
    canCapture: internal.checkout,
    canUseButtons: internal.checkout,
    canUseCardFields: internal.checkout,
    canRefund: internal.refunds,
    canUseWebhooks: internal.webhooks,
    canUseSubscriptions: internal.subscriptions,
  };
}
