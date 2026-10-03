import { describe, expect, test } from "vitest";
import {
  buildContextualActionHref,
  contextualErrorAction,
  isSafeReturnToPath,
} from "./contextual-action-href";
import {
  CONTEXTUAL_ERROR_DEFINITIONS,
  FRONTEND_CONTEXTUAL_ERRORS,
} from "./contextual-error-definitions";
import { resolveContextualError } from "./contextual-errors";

describe("buildContextualActionHref", () => {
  test("adds focus, reason, returnTo, and tab query params", () => {
    expect(
      buildContextualActionHref("/dashboard/responsible-play", {
        focus: "spend-limit",
        reason: "PERSONAL_SPEND_LIMIT_EXCEEDED",
        returnTo: "/checkout",
      })
    ).toBe(
      "/dashboard/responsible-play?focus=spend-limit&reason=PERSONAL_SPEND_LIMIT_EXCEEDED&returnTo=%2Fcheckout"
    );
  });

  test("preserves existing query params on base href", () => {
    expect(
      buildContextualActionHref("/dashboard/profile?tab=personal", {
        focus: "dateOfBirth",
        reason: "AGE_VERIFICATION_REQUIRED",
      })
    ).toBe("/dashboard/profile?tab=personal&focus=dateOfBirth&reason=AGE_VERIFICATION_REQUIRED");
  });

  test("rejects unsafe returnTo paths", () => {
    expect(
      buildContextualActionHref("/cart", {
        focus: "items",
        returnTo: "//evil.example",
      })
    ).toBe("/cart?focus=items");
  });
});

describe("isSafeReturnToPath", () => {
  test("allows relative in-app paths", () => {
    expect(isSafeReturnToPath("/checkout")).toBe(true);
    expect(isSafeReturnToPath("/cart?focus=wallet")).toBe(true);
  });

  test("blocks protocol-relative and external paths", () => {
    expect(isSafeReturnToPath("//evil.example")).toBe(false);
    expect(isSafeReturnToPath("https://evil.example")).toBe(false);
  });
});

describe("contextual error action hrefs", () => {
  test("spend limit errors deep-link to spend-limit with returnTo", () => {
    const error = resolveContextualError("PERSONAL_SPEND_LIMIT_EXCEEDED");
    expect(error.action?.href).toContain("focus=spend-limit");
    expect(error.action?.href).toContain("reason=PERSONAL_SPEND_LIMIT_EXCEEDED");
    expect(error.action?.href).toContain("returnTo=%2Fcheckout");
  });

  test("age verification deep-links to profile personal tab and dateOfBirth", () => {
    const error = FRONTEND_CONTEXTUAL_ERRORS.ageVerificationRequired;
    expect(error.action?.href).toContain("tab=personal");
    expect(error.action?.href).toContain("focus=dateOfBirth");
    expect(error.action?.href).toContain("reason=AGE_VERIFICATION_REQUIRED");
  });

  test("cart errors include wallet or items focus", () => {
    expect(CONTEXTUAL_ERROR_DEFINITIONS.TICKETS_UNAVAILABLE.action?.href).toContain("focus=items");
    expect(CONTEXTUAL_ERROR_DEFINITIONS.INSTANT_WIN_CREDIT_CARD_BLOCKED.action?.href).toContain(
      "focus=items"
    );
  });

  test("contextualErrorAction exposes focus and reason metadata", () => {
    const action = contextualErrorAction("/cart", "Review cart", {
      focus: "wallet",
      reason: "INSUFFICIENT_BALANCE",
    });
    expect(action.href).toContain("focus=wallet");
    expect(action.focus).toBe("wallet");
    expect(action.reason).toBe("INSUFFICIENT_BALANCE");
  });
});
