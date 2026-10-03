import type {
  ComplianceFeatures,
  ResponsiblePlaySectionFeatureKey,
} from "../hooks/public/compliance-features";
import { contextualErrorAction } from "./contextual-action-href";
import { CONTEXTUAL_ERROR_ROUTES } from "./contextual-error-definitions";
import { resolveContextualError } from "./contextual-errors";
import type { ContextualError } from "./contextual-errors-types";

const SUPPORT_CONTACT_ACTION = contextualErrorAction(
  "Contact support",
  CONTEXTUAL_ERROR_ROUTES.contact
);

const ERROR_FEATURE_REQUIREMENTS: Partial<
  Record<string, ResponsiblePlaySectionFeatureKey | "ageVerification">
> = {
  AGE_VERIFICATION_REQUIRED: "ageVerification",
  CREDIT_CARD_LIMIT_EXCEEDED: "creditCardCap",
  PERSONAL_SPEND_LIMIT_EXCEEDED: "personalSpendLimits",
  FRONTEND_SPEND_LIMIT_REQUIRED: "personalSpendLimits",
  ACCOUNT_SELF_EXCLUDED: "selfExclusion",
};

function isFeatureEnabled(
  features: ComplianceFeatures,
  key: ResponsiblePlaySectionFeatureKey | "ageVerification"
): boolean {
  return Boolean(features[key]);
}

export function applyComplianceFeaturesToContextualError(
  error: ContextualError,
  features: ComplianceFeatures
): ContextualError {
  if (!error.action || !error.code) return error;

  const featureKey = ERROR_FEATURE_REQUIREMENTS[error.code];
  if (!featureKey || isFeatureEnabled(features, featureKey)) return error;

  return {
    ...error,
    action: SUPPORT_CONTACT_ACTION,
  };
}

export function resolveContextualErrorWithCompliance(
  code: string | null | undefined,
  features: ComplianceFeatures,
  apiMessage?: string | null
): ContextualError {
  return applyComplianceFeaturesToContextualError(
    resolveContextualError(code, apiMessage),
    features
  );
}
