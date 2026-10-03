import { ApiResponseError } from "../client";
import type { ComplianceFeatures } from "../hooks/public/compliance-features";
import { applyComplianceFeaturesToContextualError } from "./contextual-error-compliance";
import { CONTEXTUAL_ERROR_DEFINITIONS } from "./contextual-error-definitions";
import { resolveContextualError, resolveContextualErrorFromUnknown } from "./contextual-errors";

export {
  CONTEXTUAL_ERROR_ROUTES,
  FRONTEND_CONTEXTUAL_ERRORS,
  parsePrefixedErrorMessage,
  resolveContextualError,
  resolveContextualErrorFromUnknown,
} from "./contextual-errors";
export type { ContextualError, ContextualErrorAction } from "./contextual-errors-types";

export const PAYMENT_ERROR_MESSAGES: Record<string, string> = Object.fromEntries(
  Object.entries(CONTEXTUAL_ERROR_DEFINITIONS).map(([code, definition]) => [
    code,
    definition.message,
  ])
);

export function getPaymentErrorMessage(err: unknown, fallback: string): string {
  return resolveContextualErrorFromUnknown(err, fallback).message;
}

export function getPaymentContextualError(
  err: unknown,
  fallback: string,
  features?: ComplianceFeatures
) {
  if (err instanceof ApiResponseError) {
    const resolved = resolveContextualError(err.code, err.message);
    return features ? applyComplianceFeaturesToContextualError(resolved, features) : resolved;
  }
  const resolved = resolveContextualErrorFromUnknown(err, fallback);
  return features ? applyComplianceFeaturesToContextualError(resolved, features) : resolved;
}
