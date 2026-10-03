import { hasPaytriotEnvCredentials } from "./ensure-paytriot-payment-method";
import { hasStripeEnvCredentials } from "./ensure-stripe-payment-method";

export function hasProviderEnvCredentials(provider: string): boolean {
  if (provider === "paytriot") return hasPaytriotEnvCredentials();
  if (provider === "stripe") return hasStripeEnvCredentials();
  if (provider === "local") return true;
  return false;
}
