import { contextualErrorAction } from "./contextual-action-href";
import type { ContextualErrorAction } from "./contextual-errors-types";

export const CONTEXTUAL_ERROR_ROUTES = {
  profile: "/dashboard/profile",
  responsiblePlay: "/dashboard/responsible-play",
  tickets: "/dashboard/tickets",
  orders: "/dashboard/orders",
  cart: "/cart",
  entries: "/winners",
  competitions: "/competitions",
  verify: "/auth/verify",
  contact: "/contact",
} as const;

interface ContextualErrorDefinition {
  message: string;
  action?: ContextualErrorAction;
}

function cartAction(focus: "items" | "wallet", reason: string, label = "Review cart") {
  return contextualErrorAction(label, CONTEXTUAL_ERROR_ROUTES.cart, { focus, reason });
}

function responsiblePlayAction(
  focus: string,
  reason: string,
  label: string,
  returnTo = "/checkout"
) {
  return contextualErrorAction(label, CONTEXTUAL_ERROR_ROUTES.responsiblePlay, {
    focus,
    reason,
    returnTo,
  });
}

function profileDobAction(reason: string, returnTo = "/checkout") {
  return contextualErrorAction("Add date of birth", CONTEXTUAL_ERROR_ROUTES.profile, {
    tab: "personal",
    focus: "dateOfBirth",
    reason,
    returnTo,
  });
}

export const CONTEXTUAL_ERROR_DEFINITIONS: Record<string, ContextualErrorDefinition> = {
  CHECKOUT_ERROR: {
    message: "Unable to create checkout session. Please try again.",
  },
  SESSION_ERROR: {
    message: "Unable to verify payment status. Please check your orders.",
    action: contextualErrorAction("View orders", CONTEXTUAL_ERROR_ROUTES.orders),
  },
  PAYMENT_DISABLED: {
    message: "Payments are currently disabled. Please try again later.",
  },
  PROVIDER_UNAVAILABLE: {
    message:
      "This payment method is temporarily unavailable. Please try another option or try again later.",
  },
  TICKETS_UNAVAILABLE: {
    message: "Some tickets are no longer available. Please modify your cart.",
    action: cartAction("items", "TICKETS_UNAVAILABLE"),
  },
  TICKETS_SOLD_OUT: {
    message: "Some tickets are no longer available. Please modify your cart.",
    action: cartAction("items", "TICKETS_SOLD_OUT"),
  },
  MAX_TICKETS_PER_USER_EXCEEDED: {
    message: "You have reached the maximum number of tickets allowed for this competition.",
    action: contextualErrorAction("View your tickets", CONTEXTUAL_ERROR_ROUTES.tickets),
  },
  MAX_TICKETS_EXCEEDED: {
    message: "You have reached the maximum number of tickets allowed for this competition.",
    action: contextualErrorAction("View your tickets", CONTEXTUAL_ERROR_ROUTES.tickets),
  },
  VALIDATION_ERROR: {
    message: "One or more items in your cart are no longer available.",
    action: cartAction("items", "VALIDATION_ERROR"),
  },
  INTERNAL_ERROR: {
    message: "Something went wrong on our end. Please try again.",
  },
  ORDER_ALREADY_CAPTURED: {
    message: "This order has already been processed.",
    action: contextualErrorAction("View orders", CONTEXTUAL_ERROR_ROUTES.orders),
  },
  AMOUNT_MISMATCH: {
    message: "Order amount mismatch. Please refresh your cart and try again.",
    action: cartAction("items", "AMOUNT_MISMATCH", "Refresh cart"),
  },
  PAYMENT_FAILED: {
    message: "Payment could not be processed. Please try again.",
  },
  PAYMENT_DECLINED: {
    message: "Your payment was declined. Please try a different card or payment method.",
  },
  PAYMENT_SOURCE_INFO_DECLINED: {
    message: "Your payment source was declined. Please try a different card or payment method.",
  },
  AGE_VERIFICATION_REQUIRED: {
    message:
      "Age verification is required before checkout. Please confirm your date of birth in your profile.",
    action: profileDobAction("AGE_VERIFICATION_REQUIRED"),
  },
  CREDIT_CARD_LIMIT_EXCEEDED: {
    message:
      "This payment would exceed your monthly credit card spend limit. Try a debit card or digital wallet.",
    action: responsiblePlayAction(
      "credit-card-limit",
      "CREDIT_CARD_LIMIT_EXCEEDED",
      "View credit card limit"
    ),
  },
  PERSONAL_SPEND_LIMIT_EXCEEDED: {
    message:
      "This purchase would exceed your personal spend limit. Update Responsible Play settings to continue.",
    action: responsiblePlayAction(
      "spend-limit",
      "PERSONAL_SPEND_LIMIT_EXCEEDED",
      "Update spend limit"
    ),
  },
  ACCOUNT_SELF_EXCLUDED: {
    message: "Your account is self-excluded and cannot place orders during this period.",
    action: responsiblePlayAction(
      "self-exclusion",
      "ACCOUNT_SELF_EXCLUDED",
      "View self-exclusion status"
    ),
  },
  INSTANT_WIN_CREDIT_CARD_BLOCKED: {
    message:
      "Credit cards cannot be used when instant-win competitions are in your cart. Use debit, Apple Pay, or Google Pay.",
    action: cartAction("items", "INSTANT_WIN_CREDIT_CARD_BLOCKED"),
  },
  VERIFICATION_REQUIRED: {
    message: "Please verify your email address before continuing.",
    action: contextualErrorAction("Verify email", CONTEXTUAL_ERROR_ROUTES.verify, {
      returnTo: "/checkout",
    }),
  },
  CART_ITEMS_CHANGED: {
    message: "Some items in your cart are no longer available. Please review your cart.",
    action: cartAction("items", "CART_ITEMS_CHANGED"),
  },
  ZERO_SUBTOTAL_DISABLED: {
    message: "Your order total is £0.00. Add at least one paid ticket to continue.",
    action: cartAction("items", "ZERO_SUBTOTAL_DISABLED", "Add a paid ticket"),
  },
  MINIMUM_ORDER_NOT_MET: {
    message: "This order is below the minimum order value. Add more tickets to continue.",
    action: cartAction("items", "MINIMUM_ORDER_NOT_MET", "Add more tickets"),
  },
  UNAUTHORIZED: {
    message: "Please sign in to continue.",
  },
};

export const FRONTEND_CONTEXTUAL_ERRORS = {
  ageVerificationRequired: {
    message:
      "Age verification is required before checkout. Please add your date of birth in your profile.",
    code: "AGE_VERIFICATION_REQUIRED",
    action: profileDobAction("AGE_VERIFICATION_REQUIRED"),
  },
  spendLimitRequired: {
    message: "Please set a monthly spend limit in Responsible Play before your next purchase.",
    code: "FRONTEND_SPEND_LIMIT_REQUIRED",
    action: responsiblePlayAction(
      "spend-limit",
      "FRONTEND_SPEND_LIMIT_REQUIRED",
      "Set spend limit"
    ),
  },
  cartTicketsUnavailable: {
    message: "Some tickets are no longer available. Please adjust your cart.",
    code: "TICKETS_UNAVAILABLE",
    action: cartAction("items", "TICKETS_UNAVAILABLE"),
  },
  providerUnavailable: {
    message:
      "This payment method is temporarily unavailable. Please try another option or try again later.",
    code: "PROVIDER_UNAVAILABLE",
  },
} satisfies Record<string, { message: string; code?: string; action?: ContextualErrorAction }>;
