import type { Stripe } from "@stripe/stripe-js";
import { loadStripe } from "@stripe/stripe-js/pure";

const stripePromises: Record<string, Promise<Stripe | null>> = {};

export function getStripePromise(publishableKey: string): Promise<Stripe | null> {
  if (typeof window === "undefined") {
    return Promise.resolve(null);
  }
  if (!stripePromises[publishableKey]) {
    stripePromises[publishableKey] = loadStripe(publishableKey);
  }
  return stripePromises[publishableKey];
}
