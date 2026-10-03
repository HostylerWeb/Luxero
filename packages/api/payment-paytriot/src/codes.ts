export enum PaytriotErrorCategory {
  SUCCESS = "SUCCESS",

  CARD_REFERRED = "CARD_REFERRED",
  CARD_DECLINED_KEEP = "CARD_DECLINED_KEEP",
  CARD_DECLINED = "CARD_DECLINED",
  GATEWAY_ERROR = "GATEWAY_ERROR",

  TRANSACTION_IN_PROGRESS = "TRANSACTION_IN_PROGRESS",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  IP_NOT_AUTHORIZED = "IP_NOT_AUTHORIZED",
  ACTION_NOT_ALLOWED = "ACTION_NOT_ALLOWED",
  REQUEST_MISMATCH = "REQUEST_MISMATCH",
  REQUEST_AMBIGUOUS = "REQUEST_AMBIGUOUS",
  REQUEST_MALFORMED = "REQUEST_MALFORMED",
  SUSPENDED_MERCHANT = "SUSPENDED_MERCHANT",
  CURRENCY_NOT_SUPPORTED = "CURRENCY_NOT_SUPPORTED",
  TAX_DISCOUNT_AMBIGUOUS = "TAX_DISCOUNT_AMBIGUOUS",
  DATABASE_ERROR = "DATABASE_ERROR",
  PAYMENT_PROCESSOR_COMM_ERROR = "PAYMENT_PROCESSOR_COMM_ERROR",
  PAYMENT_PROCESSOR_ERROR = "PAYMENT_PROCESSOR_ERROR",
  INTERNAL_GATEWAY_COMM_ERROR = "INTERNAL_GATEWAY_COMM_ERROR",
  INTERNAL_GATEWAY_ERROR = "INTERNAL_GATEWAY_ERROR",
  ENCRYPTION_ERROR = "ENCRYPTION_ERROR",
  DUPLICATE_REQUEST = "DUPLICATE_REQUEST",
  SETTLEMENT_ERROR = "SETTLEMENT_ERROR",
  AVS_CV2_NOT_SUPPORTED = "AVS_CV2_NOT_SUPPORTED",
  IP_BLOCKED = "IP_BLOCKED",
  PRIMARY_IP_BLOCKED = "PRIMARY_IP_BLOCKED",
  SECONDARY_IP_BLOCKED = "SECONDARY_IP_BLOCKED",
  CARD_TYPE_NOT_SUPPORTED = "CARD_TYPE_NOT_SUPPORTED",
  UNSUPPORTED_AUTHORISATION = "UNSUPPORTED_AUTHORISATION",
  REQUEST_NOT_SUPPORTED = "REQUEST_NOT_SUPPORTED",
  REQUEST_EXPIRED = "REQUEST_EXPIRED",
  REQUEST_RETRY = "REQUEST_RETRY",
  TEST_CARD_ON_LIVE = "TEST_CARD_ON_LIVE",
  CARD_COUNTRY_NOT_SUPPORTED = "CARD_COUNTRY_NOT_SUPPORTED",
  PAYMENT_TYPE_NOT_SUPPORTED = "PAYMENT_TYPE_NOT_SUPPORTED",

  THREE_DS_IN_PROGRESS = "THREE_DS_IN_PROGRESS",
  THREE_DS_UNKNOWN = "THREE_DS_UNKNOWN",
  THREE_DS_NOT_AVAILABLE = "THREE_DS_NOT_AVAILABLE",
  THREE_DS_AUTH_ERROR = "THREE_DS_AUTH_ERROR",
  THREE_DS_AUTH_REQUIRED = "THREE_DS_AUTH_REQUIRED",
  THREE_DS_AUTH_FAILED = "THREE_DS_AUTH_FAILED",

  MISSING_REQUEST = "MISSING_REQUEST",
  MISSING_MERCHANT_ID = "MISSING_MERCHANT_ID",
  MISSING_ACTION = "MISSING_ACTION",
  MISSING_AMOUNT = "MISSING_AMOUNT",
  MISSING_CURRENCY = "MISSING_CURRENCY",
  MISSING_CARD_NUMBER = "MISSING_CARD_NUMBER",
  MISSING_CARD_EXPIRY = "MISSING_CARD_EXPIRY",
  MISSING_CARD_CVV = "MISSING_CARD_CVV",
  MISSING_CUSTOMER_ADDRESS = "MISSING_CUSTOMER_ADDRESS",
  MISSING_CUSTOMER_POSTCODE = "MISSING_CUSTOMER_POSTCODE",
  MISSING_COUNTRY_CODE = "MISSING_COUNTRY_CODE",
  MISSING_REDIRECT_URL = "MISSING_REDIRECT_URL",
  MISSING_SIGNATURE = "MISSING_SIGNATURE",
  MISSING_FIELD = "MISSING_FIELD",

  INVALID_REQUEST = "INVALID_REQUEST",
  INVALID_MERCHANT_ID = "INVALID_MERCHANT_ID",
  INVALID_ACTION = "INVALID_ACTION",
  INVALID_AMOUNT = "INVALID_AMOUNT",
  INVALID_CURRENCY = "INVALID_CURRENCY",
  INVALID_CARD_NUMBER = "INVALID_CARD_NUMBER",
  INVALID_CARD_EXPIRY_DATE = "INVALID_CARD_EXPIRY_DATE",
  INVALID_CARD_EXPIRY_MONTH = "INVALID_CARD_EXPIRY_MONTH",
  INVALID_CARD_EXPIRY_YEAR = "INVALID_CARD_EXPIRY_YEAR",
  INVALID_CARD_CVV = "INVALID_CARD_CVV",
  INVALID_SIGNATURE = "INVALID_SIGNATURE",
  INVALID_CUSTOMER_INFO = "INVALID_CUSTOMER_INFO",
  INVALID_CURRENCY_CODE = "INVALID_CURRENCY_CODE",
  INVALID_COUNTRY_CODE = "INVALID_COUNTRY_CODE",
  INVALID_DUPLICATE_DELAY = "INVALID_DUPLICATE_DELAY",
  INVALID_FIELD = "INVALID_FIELD",

  CVV_FAILED = "CVV_FAILED",
  ADDRESS_FAILED = "ADDRESS_FAILED",
  POSTCODE_FAILED = "POSTCODE_FAILED",
  AVS_FAILED = "AVS_FAILED",

  VELOCITY_CONTROLLED = "VELOCITY_CONTROLLED",
  CONFIG_ERROR = "CONFIG_ERROR",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",

  /**
   * Card was charged successfully by the gateway, but our internal order
   * fulfillment (ticket reservation, profile stats, etc.) failed AFTER the
   * capture. Distinct from SUCCESS — the customer was charged but has no
   * tickets. Always wasCharged=true. Requires manual ops intervention
   * (refund or re-fulfillment).
   */
  FULFILLMENT_FAILED = "FULFILLMENT_FAILED",
}

export const CHARGED_STATES = new Set(["approved", "captured", "tendered", "accepted"]);

export interface PaytriotErrorInfo {
  category: PaytriotErrorCategory;
  responseCode: number;
  responseMessage?: string;
  title: string;
  description: string;
  recommendedAction: "retry" | "different_card" | "contact_bank" | "contact_support" | "try_again";
  wasCharged: boolean;
  severity: "info" | "warning" | "error" | "critical";
  referralPhone?: string;
  avsFailure?: {
    cv2Check?: string;
    addressCheck?: string;
    postcodeCheck?: string;
    avsResponseMessage?: string;
  };
  threeDSFailure?: {
    enrolled?: string;
    authenticated?: string;
    errorCode?: string;
    errorDescription?: string;
  };
  vcsDetails?: { code?: string; message?: string };
  isConfigError: boolean;
}

export interface PaytriotErrorInput {
  responseCode: number;
  responseMessage?: string;
  cv2Check?: string;
  addressCheck?: string;
  postcodeCheck?: string;
  avsResponseMessage?: string;
  threeDSEnrolled?: string;
  threeDSAuthenticated?: string;
  threeDSErrorCode?: string;
  threeDSErrorDescription?: string;
  state?: string;
  referralPhone?: string;
  vcsResponseCode?: string;
  vcsResponseMessage?: string;
}

interface BaseInfo {
  title: string;
  description: string;
  recommendedAction: PaytriotErrorInfo["recommendedAction"];
  severity: PaytriotErrorInfo["severity"];
  isConfigError: boolean;
}

/**
 * Common acquirer-level decline codes that the Paytriot gateway returns
 * for card declines by the issuing bank. These fall outside Paytriot's
 * vendor-specific 65xxx range and would otherwise map to UNKNOWN_ERROR.
 *
 * @see https://docs.paytriot.com/response-codes
 */
export const ACQUIRER_DECLINE_CODES: Record<number, PaytriotErrorCategory> = {
  51: PaytriotErrorCategory.CARD_DECLINED, // Insufficient funds
  54: PaytriotErrorCategory.CARD_DECLINED, // Expired card
  55: PaytriotErrorCategory.CARD_DECLINED, // Incorrect PIN
  57: PaytriotErrorCategory.CARD_DECLINED, // Transaction not permitted
  58: PaytriotErrorCategory.CARD_DECLINED, // Transaction not permitted (terminal)
  61: PaytriotErrorCategory.CARD_DECLINED, // Exceeds withdrawal limit
  62: PaytriotErrorCategory.CARD_DECLINED, // Restricted card
  65: PaytriotErrorCategory.CARD_DECLINED, // Exceeds withdrawal frequency
  // 75–79: PIN retries exceeded — CARD_DECLINED
  75: PaytriotErrorCategory.CARD_DECLINED,
  76: PaytriotErrorCategory.CARD_DECLINED,
  77: PaytriotErrorCategory.CARD_DECLINED,
  78: PaytriotErrorCategory.CARD_DECLINED,
  79: PaytriotErrorCategory.CARD_DECLINED,
};

/**
 * Strip internal error-code prefixes from user-facing messages.
 * Fulfillment failures carry codes like `TICKETS_SOLD_OUT:` or
 * `MAX_TICKETS_PER_USER_EXCEEDED:` which are infrastructure-level
 * signals that should never reach the customer.
 *
 * Returns null when nothing meaningful remains after stripping
 * (safe to skip the URL param).
 */
export function sanitizeUserMessage(msg: string | null): string | null {
  if (!msg) return null;
  const cleaned = msg.replace(/^[A-Z][A-Z_0-9]+:\s*/, "").trim();
  return cleaned || null;
}

const BASE: Record<PaytriotErrorCategory, BaseInfo> = {
  [PaytriotErrorCategory.SUCCESS]: {
    title: "Payment successful",
    description: "Your payment was successful and your tickets are now active.",
    recommendedAction: "retry",
    severity: "info",
    isConfigError: false,
  },

  [PaytriotErrorCategory.CARD_REFERRED]: {
    title: "Card referred — please call your bank",
    description:
      "Your card couldn't be processed automatically. Please call your bank to authorize this payment.",
    recommendedAction: "contact_bank",
    severity: "warning",
    isConfigError: false,
  },
  [PaytriotErrorCategory.CARD_DECLINED]: {
    title: "Card declined",
    description: "Your card was declined. Please try a different card or contact your bank.",
    recommendedAction: "contact_bank",
    severity: "error",
    isConfigError: false,
  },
  [PaytriotErrorCategory.CARD_DECLINED_KEEP]: {
    title: "Card declined",
    description:
      "Your card was declined. Please contact your bank — this card cannot be accepted again.",
    recommendedAction: "contact_bank",
    severity: "error",
    isConfigError: false,
  },
  [PaytriotErrorCategory.GATEWAY_ERROR]: {
    title: "Temporary error",
    description: "Your payment couldn't be completed due to a temporary issue. Please try again.",
    recommendedAction: "retry",
    severity: "error",
    isConfigError: false,
  },
  [PaytriotErrorCategory.TRANSACTION_IN_PROGRESS]: {
    title: "Transaction in progress",
    description: "Your payment is still being processed. Please try again.",
    recommendedAction: "retry",
    severity: "warning",
    isConfigError: false,
  },
  [PaytriotErrorCategory.INVALID_CREDENTIALS]: {
    title: "Payment provider error",
    description: "We couldn't process your payment. Our team has been notified.",
    recommendedAction: "contact_support",
    severity: "critical",
    isConfigError: true,
  },
  [PaytriotErrorCategory.IP_NOT_AUTHORIZED]: {
    title: "Payment provider error",
    description: "We couldn't process your payment. Our team has been notified.",
    recommendedAction: "contact_support",
    severity: "critical",
    isConfigError: true,
  },
  [PaytriotErrorCategory.ACTION_NOT_ALLOWED]: {
    title: "Already processed",
    description: "This transaction has already been processed. Please contact support.",
    recommendedAction: "contact_support",
    severity: "warning",
    isConfigError: false,
  },
  [PaytriotErrorCategory.REQUEST_MISMATCH]: {
    title: "Payment details mismatch",
    description: "The payment details don't match. Please try again.",
    recommendedAction: "retry",
    severity: "error",
    isConfigError: false,
  },
  [PaytriotErrorCategory.REQUEST_AMBIGUOUS]: {
    title: "Ambiguous request",
    description: "The payment request was unclear. Please contact support.",
    recommendedAction: "contact_support",
    severity: "error",
    isConfigError: false,
  },
  [PaytriotErrorCategory.REQUEST_MALFORMED]: {
    title: "Bad request",
    description: "The payment request was invalid. Please contact support.",
    recommendedAction: "contact_support",
    severity: "error",
    isConfigError: false,
  },
  [PaytriotErrorCategory.SUSPENDED_MERCHANT]: {
    title: "Service temporarily unavailable",
    description: "Our payment service is temporarily unavailable. Please try again later.",
    recommendedAction: "try_again",
    severity: "error",
    isConfigError: true,
  },
  [PaytriotErrorCategory.CURRENCY_NOT_SUPPORTED]: {
    title: "Currency not supported",
    description: "Your currency isn't supported. Please try a different card or contact support.",
    recommendedAction: "contact_support",
    severity: "warning",
    isConfigError: false,
  },
  [PaytriotErrorCategory.TAX_DISCOUNT_AMBIGUOUS]: {
    title: "Configuration error",
    description: "We couldn't process your payment. Our team has been notified.",
    recommendedAction: "contact_support",
    severity: "critical",
    isConfigError: true,
  },
  [PaytriotErrorCategory.DATABASE_ERROR]: {
    title: "Temporary error",
    description:
      "Your payment couldn't be completed due to a temporary issue. Please try again later.",
    recommendedAction: "retry",
    severity: "error",
    isConfigError: false,
  },
  [PaytriotErrorCategory.PAYMENT_PROCESSOR_COMM_ERROR]: {
    title: "Temporary error",
    description: "Your payment couldn't be completed due to a temporary issue. Please try again.",
    recommendedAction: "retry",
    severity: "error",
    isConfigError: false,
  },
  [PaytriotErrorCategory.PAYMENT_PROCESSOR_ERROR]: {
    title: "Temporary error",
    description: "Your payment couldn't be completed due to a temporary issue. Please try again.",
    recommendedAction: "retry",
    severity: "error",
    isConfigError: false,
  },
  [PaytriotErrorCategory.INTERNAL_GATEWAY_COMM_ERROR]: {
    title: "Temporary error",
    description: "Your payment couldn't be completed due to a temporary issue. Please try again.",
    recommendedAction: "retry",
    severity: "error",
    isConfigError: false,
  },
  [PaytriotErrorCategory.INTERNAL_GATEWAY_ERROR]: {
    title: "Temporary error",
    description: "Your payment couldn't be completed due to a temporary issue. Please try again.",
    recommendedAction: "retry",
    severity: "error",
    isConfigError: false,
  },
  [PaytriotErrorCategory.ENCRYPTION_ERROR]: {
    title: "Temporary error",
    description:
      "Your payment couldn't be completed due to a temporary issue. Please try again later.",
    recommendedAction: "retry",
    severity: "error",
    isConfigError: false,
  },
  [PaytriotErrorCategory.DUPLICATE_REQUEST]: {
    title: "Duplicate payment",
    description: "It looks like you tried to pay twice. We've only charged once.",
    recommendedAction: "contact_support",
    severity: "warning",
    isConfigError: false,
  },
  [PaytriotErrorCategory.SETTLEMENT_ERROR]: {
    title: "Settlement error",
    description:
      "Your payment was authorized but not settled. Our team has been notified. Reference:",
    recommendedAction: "contact_support",
    severity: "error",
    isConfigError: false,
  },
  [PaytriotErrorCategory.AVS_CV2_NOT_SUPPORTED]: {
    title: "Verification not supported",
    description:
      "Your card doesn't support address verification. You may need to use a different card.",
    recommendedAction: "different_card",
    severity: "warning",
    isConfigError: false,
  },
  [PaytriotErrorCategory.IP_BLOCKED]: {
    title: "Payment provider error",
    description: "We couldn't process your payment. Our team has been notified.",
    recommendedAction: "contact_support",
    severity: "critical",
    isConfigError: true,
  },
  [PaytriotErrorCategory.PRIMARY_IP_BLOCKED]: {
    title: "Payment provider error",
    description: "We couldn't process your payment. Our team has been notified.",
    recommendedAction: "contact_support",
    severity: "critical",
    isConfigError: true,
  },
  [PaytriotErrorCategory.SECONDARY_IP_BLOCKED]: {
    title: "Payment provider error",
    description: "We couldn't process your payment. Our team has been notified.",
    recommendedAction: "contact_support",
    severity: "critical",
    isConfigError: true,
  },
  [PaytriotErrorCategory.CARD_TYPE_NOT_SUPPORTED]: {
    title: "Card type not supported",
    description: "This card type isn't supported. Please try a different card.",
    recommendedAction: "different_card",
    severity: "warning",
    isConfigError: false,
  },
  [PaytriotErrorCategory.UNSUPPORTED_AUTHORISATION]: {
    title: "Authorization not supported",
    description: "This type of authorization isn't supported. Please contact support.",
    recommendedAction: "contact_support",
    severity: "warning",
    isConfigError: false,
  },
  [PaytriotErrorCategory.REQUEST_NOT_SUPPORTED]: {
    title: "Request not supported",
    description: "This request isn't supported by your payment provider. Please contact support.",
    recommendedAction: "contact_support",
    severity: "error",
    isConfigError: false,
  },
  [PaytriotErrorCategory.REQUEST_EXPIRED]: {
    title: "Session expired",
    description: "Your payment session expired. Please try again.",
    recommendedAction: "retry",
    severity: "warning",
    isConfigError: false,
  },
  [PaytriotErrorCategory.REQUEST_RETRY]: {
    title: "Please try again",
    description: "Your payment couldn't be completed. Please try again.",
    recommendedAction: "retry",
    severity: "warning",
    isConfigError: false,
  },
  [PaytriotErrorCategory.TEST_CARD_ON_LIVE]: {
    title: "Payment provider error",
    description: "We couldn't process your payment. Our team has been notified.",
    recommendedAction: "contact_support",
    severity: "critical",
    isConfigError: true,
  },
  [PaytriotErrorCategory.CARD_COUNTRY_NOT_SUPPORTED]: {
    title: "Country not supported",
    description: "Cards from your country aren't supported. Please contact support.",
    recommendedAction: "contact_support",
    severity: "warning",
    isConfigError: false,
  },
  [PaytriotErrorCategory.PAYMENT_TYPE_NOT_SUPPORTED]: {
    title: "Payment type not supported",
    description: "This payment type isn't supported. Please try a different card.",
    recommendedAction: "different_card",
    severity: "warning",
    isConfigError: false,
  },

  [PaytriotErrorCategory.THREE_DS_IN_PROGRESS]: {
    title: "3-D Secure in progress",
    description: "3-D Secure authentication is in progress. Please try again.",
    recommendedAction: "retry",
    severity: "warning",
    isConfigError: false,
  },
  [PaytriotErrorCategory.THREE_DS_UNKNOWN]: {
    title: "3-D Secure error",
    description: "3-D Secure verification failed. Please try again or use a different card.",
    recommendedAction: "retry",
    severity: "error",
    isConfigError: false,
  },
  [PaytriotErrorCategory.THREE_DS_NOT_AVAILABLE]: {
    title: "3-D Secure unavailable",
    description: "3-D Secure isn't available for your card. Try a different card.",
    recommendedAction: "different_card",
    severity: "warning",
    isConfigError: false,
  },
  [PaytriotErrorCategory.THREE_DS_AUTH_ERROR]: {
    title: "3-D Secure authentication error",
    description:
      "3-D Secure authentication couldn't be completed. Please try again or use a different card.",
    recommendedAction: "retry",
    severity: "error",
    isConfigError: false,
  },
  [PaytriotErrorCategory.THREE_DS_AUTH_REQUIRED]: {
    title: "3-D Secure authentication required",
    description: "3-D Secure authentication is required. Please retry to authenticate.",
    recommendedAction: "retry",
    severity: "error",
    isConfigError: false,
  },
  [PaytriotErrorCategory.THREE_DS_AUTH_FAILED]: {
    title: "3-D Secure authentication failed",
    description:
      "3-D Secure authentication failed. Please try again or use a different payment method.",
    recommendedAction: "retry",
    severity: "error",
    isConfigError: false,
  },

  [PaytriotErrorCategory.MISSING_REQUEST]: {
    title: "Payment provider error",
    description: "We couldn't process your payment. Our team has been notified.",
    recommendedAction: "contact_support",
    severity: "critical",
    isConfigError: true,
  },
  [PaytriotErrorCategory.MISSING_MERCHANT_ID]: {
    title: "Payment provider error",
    description: "We couldn't process your payment. Our team has been notified.",
    recommendedAction: "contact_support",
    severity: "critical",
    isConfigError: true,
  },
  [PaytriotErrorCategory.MISSING_ACTION]: {
    title: "Payment provider error",
    description: "We couldn't process your payment. Our team has been notified.",
    recommendedAction: "contact_support",
    severity: "critical",
    isConfigError: true,
  },
  [PaytriotErrorCategory.MISSING_AMOUNT]: {
    title: "Payment provider error",
    description: "We couldn't process your payment. Our team has been notified.",
    recommendedAction: "contact_support",
    severity: "critical",
    isConfigError: true,
  },
  [PaytriotErrorCategory.MISSING_CURRENCY]: {
    title: "Payment provider error",
    description: "We couldn't process your payment. Our team has been notified.",
    recommendedAction: "contact_support",
    severity: "critical",
    isConfigError: true,
  },
  [PaytriotErrorCategory.MISSING_CARD_NUMBER]: {
    title: "Payment provider error",
    description: "We couldn't process your payment. Our team has been notified.",
    recommendedAction: "contact_support",
    severity: "critical",
    isConfigError: true,
  },
  [PaytriotErrorCategory.MISSING_CARD_EXPIRY]: {
    title: "Payment provider error",
    description: "We couldn't process your payment. Our team has been notified.",
    recommendedAction: "contact_support",
    severity: "critical",
    isConfigError: true,
  },
  [PaytriotErrorCategory.MISSING_CARD_CVV]: {
    title: "Payment provider error",
    description: "We couldn't process your payment. Our team has been notified.",
    recommendedAction: "contact_support",
    severity: "critical",
    isConfigError: true,
  },
  [PaytriotErrorCategory.MISSING_CUSTOMER_ADDRESS]: {
    title: "Payment provider error",
    description: "We couldn't process your payment. Our team has been notified.",
    recommendedAction: "contact_support",
    severity: "critical",
    isConfigError: true,
  },
  [PaytriotErrorCategory.MISSING_CUSTOMER_POSTCODE]: {
    title: "Payment provider error",
    description: "We couldn't process your payment. Our team has been notified.",
    recommendedAction: "contact_support",
    severity: "critical",
    isConfigError: true,
  },
  [PaytriotErrorCategory.MISSING_COUNTRY_CODE]: {
    title: "Payment provider error",
    description: "We couldn't process your payment. Our team has been notified.",
    recommendedAction: "contact_support",
    severity: "critical",
    isConfigError: true,
  },
  [PaytriotErrorCategory.MISSING_REDIRECT_URL]: {
    title: "Payment provider error",
    description: "We couldn't process your payment. Our team has been notified.",
    recommendedAction: "contact_support",
    severity: "critical",
    isConfigError: true,
  },
  [PaytriotErrorCategory.MISSING_SIGNATURE]: {
    title: "Payment provider error",
    description: "We couldn't process your payment. Our team has been notified.",
    recommendedAction: "contact_support",
    severity: "critical",
    isConfigError: true,
  },
  [PaytriotErrorCategory.MISSING_FIELD]: {
    title: "Payment provider error",
    description: "We couldn't process your payment. Our team has been notified.",
    recommendedAction: "contact_support",
    severity: "critical",
    isConfigError: true,
  },

  [PaytriotErrorCategory.INVALID_REQUEST]: {
    title: "Payment provider error",
    description: "We couldn't process your payment. Our team has been notified.",
    recommendedAction: "contact_support",
    severity: "critical",
    isConfigError: true,
  },
  [PaytriotErrorCategory.INVALID_MERCHANT_ID]: {
    title: "Payment provider error",
    description: "We couldn't process your payment. Our team has been notified.",
    recommendedAction: "contact_support",
    severity: "critical",
    isConfigError: true,
  },
  [PaytriotErrorCategory.INVALID_ACTION]: {
    title: "Payment provider error",
    description: "We couldn't process your payment. Our team has been notified.",
    recommendedAction: "contact_support",
    severity: "critical",
    isConfigError: true,
  },
  [PaytriotErrorCategory.INVALID_AMOUNT]: {
    title: "Payment provider error",
    description: "We couldn't process your payment. Our team has been notified.",
    recommendedAction: "contact_support",
    severity: "critical",
    isConfigError: true,
  },
  [PaytriotErrorCategory.INVALID_CURRENCY]: {
    title: "Payment provider error",
    description: "We couldn't process your payment. Our team has been notified.",
    recommendedAction: "contact_support",
    severity: "critical",
    isConfigError: true,
  },
  [PaytriotErrorCategory.INVALID_CARD_NUMBER]: {
    title: "Invalid card number",
    description: "The card number you entered is invalid. Please check and try again.",
    recommendedAction: "retry",
    severity: "warning",
    isConfigError: false,
  },
  [PaytriotErrorCategory.INVALID_CARD_EXPIRY_DATE]: {
    title: "Card expired or invalid",
    description: "The card expiry date you entered is invalid. Please check and try again.",
    recommendedAction: "retry",
    severity: "warning",
    isConfigError: false,
  },
  [PaytriotErrorCategory.INVALID_CARD_EXPIRY_MONTH]: {
    title: "Invalid expiry month",
    description: "The card expiry month you entered is invalid. Please check and try again.",
    recommendedAction: "retry",
    severity: "warning",
    isConfigError: false,
  },
  [PaytriotErrorCategory.INVALID_CARD_EXPIRY_YEAR]: {
    title: "Invalid expiry year",
    description: "The card expiry year you entered is invalid. Please check and try again.",
    recommendedAction: "retry",
    severity: "warning",
    isConfigError: false,
  },
  [PaytriotErrorCategory.INVALID_CARD_CVV]: {
    title: "Invalid security code",
    description: "The security code (CVV) you entered is invalid. Please check and try again.",
    recommendedAction: "retry",
    severity: "warning",
    isConfigError: false,
  },
  [PaytriotErrorCategory.INVALID_SIGNATURE]: {
    title: "Payment provider error",
    description: "We couldn't process your payment. Our team has been notified.",
    recommendedAction: "contact_support",
    severity: "critical",
    isConfigError: true,
  },
  [PaytriotErrorCategory.INVALID_CUSTOMER_INFO]: {
    title: "Invalid customer info",
    description: "Some payment details you entered are invalid. Please check and try again.",
    recommendedAction: "retry",
    severity: "warning",
    isConfigError: false,
  },
  [PaytriotErrorCategory.INVALID_CURRENCY_CODE]: {
    title: "Payment provider error",
    description: "The payment currency is invalid. Please contact support.",
    recommendedAction: "contact_support",
    severity: "critical",
    isConfigError: true,
  },
  [PaytriotErrorCategory.INVALID_COUNTRY_CODE]: {
    title: "Invalid country code",
    description: "The country code is invalid. Please contact support.",
    recommendedAction: "contact_support",
    severity: "warning",
    isConfigError: false,
  },
  [PaytriotErrorCategory.INVALID_DUPLICATE_DELAY]: {
    title: "Payment provider error",
    description: "We couldn't process your payment. Our team has been notified.",
    recommendedAction: "contact_support",
    severity: "critical",
    isConfigError: true,
  },
  [PaytriotErrorCategory.INVALID_FIELD]: {
    title: "Payment provider error",
    description: "We couldn't process your payment. Our team has been notified.",
    recommendedAction: "contact_support",
    severity: "critical",
    isConfigError: true,
  },

  [PaytriotErrorCategory.CVV_FAILED]: {
    title: "Security code didn't match",
    description:
      "The security code (CVV) you entered doesn't match what your bank has. Please check and try again.",
    recommendedAction: "retry",
    severity: "warning",
    isConfigError: false,
  },
  [PaytriotErrorCategory.ADDRESS_FAILED]: {
    title: "Billing address didn't match",
    description:
      "Your billing address doesn't match what your bank has on file. Please update your address or try a different card.",
    recommendedAction: "retry",
    severity: "warning",
    isConfigError: false,
  },
  [PaytriotErrorCategory.POSTCODE_FAILED]: {
    title: "Postcode didn't match",
    description:
      "Your postcode doesn't match what your bank has on file. Please update your postcode or try a different card.",
    recommendedAction: "retry",
    severity: "warning",
    isConfigError: false,
  },
  [PaytriotErrorCategory.AVS_FAILED]: {
    title: "Address verification failed",
    description:
      "Your address and security code didn't match. Please update your billing details or try a different card.",
    recommendedAction: "retry",
    severity: "warning",
    isConfigError: false,
  },

  [PaytriotErrorCategory.VELOCITY_CONTROLLED]: {
    title: "Too many attempts",
    description: "Too many payment attempts. Please wait a few minutes and try again.",
    recommendedAction: "try_again",
    severity: "warning",
    isConfigError: false,
  },
  [PaytriotErrorCategory.CONFIG_ERROR]: {
    title: "Payment provider error",
    description: "We couldn't process your payment. Our team has been notified.",
    recommendedAction: "contact_support",
    severity: "critical",
    isConfigError: true,
  },
  [PaytriotErrorCategory.INTERNAL_ERROR]: {
    title: "Temporary error",
    description: "Your payment couldn't be completed due to a temporary issue. Please try again.",
    recommendedAction: "retry",
    severity: "error",
    isConfigError: false,
  },
  [PaytriotErrorCategory.UNKNOWN_ERROR]: {
    title: "Payment failed",
    description:
      "Something went wrong with your payment. Your card has not been charged. Please try again or contact support.",
    recommendedAction: "contact_support",
    severity: "error",
    isConfigError: false,
  },

  [PaytriotErrorCategory.FULFILLMENT_FAILED]: {
    title: "Order processing failed",
    description:
      "We've received your payment but couldn't process your order. Our team has been notified and will resolve this. Your card has been charged — please don't retry until you've been contacted.",
    recommendedAction: "contact_support",
    severity: "error",
    isConfigError: false,
  },
};

function categoryFromCode(code: number): PaytriotErrorCategory {
  if (code === 0) return PaytriotErrorCategory.SUCCESS;
  if (code === 2) return PaytriotErrorCategory.CARD_REFERRED;
  if (code === 4) return PaytriotErrorCategory.CARD_DECLINED_KEEP;
  if (code === 5) return PaytriotErrorCategory.CARD_DECLINED;
  if (code === 30) return PaytriotErrorCategory.GATEWAY_ERROR;

  if (code >= 65536 && code <= 65591) {
    return (
      {
        65536: PaytriotErrorCategory.TRANSACTION_IN_PROGRESS,
        65539: PaytriotErrorCategory.INVALID_CREDENTIALS,
        65540: PaytriotErrorCategory.IP_NOT_AUTHORIZED,
        65541: PaytriotErrorCategory.ACTION_NOT_ALLOWED,
        65542: PaytriotErrorCategory.REQUEST_MISMATCH,
        65543: PaytriotErrorCategory.REQUEST_AMBIGUOUS,
        65544: PaytriotErrorCategory.REQUEST_MALFORMED,
        65545: PaytriotErrorCategory.SUSPENDED_MERCHANT,
        65546: PaytriotErrorCategory.CURRENCY_NOT_SUPPORTED,
        65547: PaytriotErrorCategory.TAX_DISCOUNT_AMBIGUOUS,
        65548: PaytriotErrorCategory.DATABASE_ERROR,
        65549: PaytriotErrorCategory.PAYMENT_PROCESSOR_COMM_ERROR,
        65550: PaytriotErrorCategory.PAYMENT_PROCESSOR_ERROR,
        65551: PaytriotErrorCategory.INTERNAL_GATEWAY_COMM_ERROR,
        65552: PaytriotErrorCategory.INTERNAL_GATEWAY_ERROR,
        65553: PaytriotErrorCategory.ENCRYPTION_ERROR,
        65554: PaytriotErrorCategory.DUPLICATE_REQUEST,
        65555: PaytriotErrorCategory.SETTLEMENT_ERROR,
        65556: PaytriotErrorCategory.AVS_CV2_NOT_SUPPORTED,
        65557: PaytriotErrorCategory.IP_BLOCKED,
        65558: PaytriotErrorCategory.PRIMARY_IP_BLOCKED,
        65559: PaytriotErrorCategory.SECONDARY_IP_BLOCKED,
        65561: PaytriotErrorCategory.CARD_TYPE_NOT_SUPPORTED,
        65562: PaytriotErrorCategory.UNSUPPORTED_AUTHORISATION,
        65563: PaytriotErrorCategory.REQUEST_NOT_SUPPORTED,
        65564: PaytriotErrorCategory.REQUEST_EXPIRED,
        65565: PaytriotErrorCategory.REQUEST_RETRY,
        65566: PaytriotErrorCategory.TEST_CARD_ON_LIVE,
        65567: PaytriotErrorCategory.CARD_COUNTRY_NOT_SUPPORTED,
        65568: PaytriotErrorCategory.PAYMENT_TYPE_NOT_SUPPORTED,
      }[code] ?? PaytriotErrorCategory.INTERNAL_ERROR
    );
  }

  if (code >= 65792 && code <= 66047) {
    return (
      {
        65792: PaytriotErrorCategory.THREE_DS_IN_PROGRESS,
        65793: PaytriotErrorCategory.THREE_DS_UNKNOWN,
        65794: PaytriotErrorCategory.THREE_DS_NOT_AVAILABLE,
        65800: PaytriotErrorCategory.THREE_DS_AUTH_ERROR,
        65802: PaytriotErrorCategory.THREE_DS_AUTH_REQUIRED,
        65803: PaytriotErrorCategory.THREE_DS_AUTH_FAILED,
      }[code] ?? PaytriotErrorCategory.THREE_DS_UNKNOWN
    );
  }

  if (code >= 66048 && code <= 66303) {
    return (
      {
        66048: PaytriotErrorCategory.MISSING_REQUEST,
        66049: PaytriotErrorCategory.MISSING_MERCHANT_ID,
        66055: PaytriotErrorCategory.MISSING_ACTION,
        66056: PaytriotErrorCategory.MISSING_AMOUNT,
        66057: PaytriotErrorCategory.MISSING_CURRENCY,
        66058: PaytriotErrorCategory.MISSING_CARD_NUMBER,
        66059: PaytriotErrorCategory.MISSING_CARD_EXPIRY,
        66060: PaytriotErrorCategory.MISSING_CARD_EXPIRY,
        66064: PaytriotErrorCategory.MISSING_CARD_CVV,
        66065: PaytriotErrorCategory.MISSING_CUSTOMER_ADDRESS,
        66066: PaytriotErrorCategory.MISSING_CUSTOMER_ADDRESS,
        66067: PaytriotErrorCategory.MISSING_CUSTOMER_POSTCODE,
        66068: PaytriotErrorCategory.MISSING_CUSTOMER_ADDRESS,
        66070: PaytriotErrorCategory.MISSING_COUNTRY_CODE,
        66074: PaytriotErrorCategory.MISSING_REDIRECT_URL,
        66087: PaytriotErrorCategory.MISSING_SIGNATURE,
        66160: PaytriotErrorCategory.MISSING_CARD_EXPIRY,
      }[code] ?? PaytriotErrorCategory.MISSING_FIELD
    );
  }

  if (code >= 66304 && code <= 66559) {
    return (
      {
        66304: PaytriotErrorCategory.INVALID_REQUEST,
        66305: PaytriotErrorCategory.INVALID_MERCHANT_ID,
        66311: PaytriotErrorCategory.INVALID_ACTION,
        66312: PaytriotErrorCategory.INVALID_AMOUNT,
        66313: PaytriotErrorCategory.INVALID_CURRENCY,
        66314: PaytriotErrorCategory.INVALID_CARD_NUMBER,
        66315: PaytriotErrorCategory.INVALID_CARD_EXPIRY_MONTH,
        66316: PaytriotErrorCategory.INVALID_CARD_EXPIRY_YEAR,
        66320: PaytriotErrorCategory.INVALID_CARD_CVV,
        66321: PaytriotErrorCategory.INVALID_CUSTOMER_INFO,
        66322: PaytriotErrorCategory.INVALID_CUSTOMER_INFO,
        66323: PaytriotErrorCategory.INVALID_CUSTOMER_INFO,
        66324: PaytriotErrorCategory.INVALID_CUSTOMER_INFO,
        66325: PaytriotErrorCategory.INVALID_CUSTOMER_INFO,
        66326: PaytriotErrorCategory.INVALID_COUNTRY_CODE,
        66334: PaytriotErrorCategory.INVALID_DUPLICATE_DELAY,
        66343: PaytriotErrorCategory.INVALID_SIGNATURE,
        66416: PaytriotErrorCategory.INVALID_CARD_EXPIRY_DATE,
        66417: PaytriotErrorCategory.INVALID_CARD_EXPIRY_DATE,
      }[code] ?? PaytriotErrorCategory.INVALID_FIELD
    );
  }

  if (code in ACQUIRER_DECLINE_CODES) {
    return ACQUIRER_DECLINE_CODES[code]!;
  }

  return PaytriotErrorCategory.UNKNOWN_ERROR;
}

function buildAvsFailure(
  cv2Check?: string,
  addressCheck?: string,
  postcodeCheck?: string,
  avsResponseMessage?: string
): PaytriotErrorInfo["avsFailure"] | undefined {
  const result: PaytriotErrorInfo["avsFailure"] = {};
  let hasFailure = false;

  if (
    cv2Check &&
    cv2Check !== "not known" &&
    cv2Check !== "not checked" &&
    cv2Check !== "matched"
  ) {
    result.cv2Check = cv2Check;
    hasFailure = true;
  }
  if (
    addressCheck &&
    addressCheck !== "not known" &&
    addressCheck !== "not checked" &&
    addressCheck !== "matched"
  ) {
    result.addressCheck = addressCheck;
    hasFailure = true;
  }
  if (
    postcodeCheck &&
    postcodeCheck !== "not known" &&
    postcodeCheck !== "not checked" &&
    postcodeCheck !== "matched"
  ) {
    result.postcodeCheck = postcodeCheck;
    hasFailure = true;
  }
  if (avsResponseMessage) {
    result.avsResponseMessage = avsResponseMessage;
    hasFailure = true;
  }

  return hasFailure ? result : undefined;
}

function buildThreeDSFailure(
  enrolled?: string,
  authenticated?: string,
  errorCode?: string,
  errorDescription?: string
): PaytriotErrorInfo["threeDSFailure"] | undefined {
  if (!enrolled && !authenticated && !errorCode && !errorDescription) return undefined;
  return { enrolled, authenticated, errorCode, errorDescription };
}

export function getPaytriotErrorInfo(input: PaytriotErrorInput): PaytriotErrorInfo {
  const {
    responseCode,
    responseMessage,
    cv2Check,
    addressCheck,
    postcodeCheck,
    avsResponseMessage,
    threeDSEnrolled,
    threeDSAuthenticated,
    threeDSErrorCode,
    threeDSErrorDescription,
    state,
    referralPhone,
    vcsResponseCode,
    vcsResponseMessage,
  } = input;

  if (responseCode === 0) {
    const base = BASE[PaytriotErrorCategory.SUCCESS];
    return {
      category: PaytriotErrorCategory.SUCCESS,
      responseCode,
      responseMessage,
      title: base.title,
      description: base.description,
      recommendedAction: base.recommendedAction,
      wasCharged: state ? CHARGED_STATES.has(state) : true,
      severity: base.severity,
      isConfigError: base.isConfigError,
      referralPhone,
      vcsDetails:
        vcsResponseCode != null
          ? { code: vcsResponseCode, message: vcsResponseMessage }
          : undefined,
    };
  }

  if (vcsResponseCode != null) {
    const base = BASE[PaytriotErrorCategory.VELOCITY_CONTROLLED];
    return {
      category: PaytriotErrorCategory.VELOCITY_CONTROLLED,
      responseCode,
      responseMessage: vcsResponseMessage,
      title: base.title,
      description: base.description,
      recommendedAction: base.recommendedAction,
      wasCharged: false,
      severity: base.severity,
      isConfigError: base.isConfigError,
      vcsDetails: { code: vcsResponseCode, message: vcsResponseMessage },
    };
  }

  if (responseCode === 5) {
    const avsFailure = buildAvsFailure(cv2Check, addressCheck, postcodeCheck, avsResponseMessage);
    if (avsFailure) {
      let category: PaytriotErrorCategory;
      if (avsFailure.cv2Check && !avsFailure.addressCheck && !avsFailure.postcodeCheck) {
        category = PaytriotErrorCategory.CVV_FAILED;
      } else if (avsFailure.addressCheck && !avsFailure.cv2Check && !avsFailure.postcodeCheck) {
        category = PaytriotErrorCategory.ADDRESS_FAILED;
      } else if (avsFailure.postcodeCheck && !avsFailure.cv2Check && !avsFailure.addressCheck) {
        category = PaytriotErrorCategory.POSTCODE_FAILED;
      } else {
        category = PaytriotErrorCategory.AVS_FAILED;
      }
      const base = BASE[category];
      return {
        category,
        responseCode,
        responseMessage,
        title: base.title,
        description: base.description,
        recommendedAction: base.recommendedAction,
        wasCharged: false,
        severity: base.severity,
        isConfigError: base.isConfigError,
        avsFailure,
      };
    }
  }

  const category = categoryFromCode(responseCode);
  const base = BASE[category];

  return {
    category,
    responseCode,
    responseMessage,
    title: base.title,
    description: base.description,
    recommendedAction: base.recommendedAction,
    wasCharged: state ? CHARGED_STATES.has(state) : false,
    severity: base.severity,
    isConfigError: base.isConfigError,
    referralPhone,
    threeDSFailure: buildThreeDSFailure(
      threeDSEnrolled,
      threeDSAuthenticated,
      threeDSErrorCode,
      threeDSErrorDescription
    ),
  };
}

/**
 * Returns the error info for an order where the card was charged successfully
 * by the gateway (responseCode=0) but our own fulfillment pipeline failed
 * AFTER capture. Always wasCharged=true; the customer was charged.
 *
 * Use this in the webhook handler when `order.status === "failed"` or
 * `order.metadata.fulfillmentFailedAfterCapture === true` to override the
 * default SUCCESS category — so downstream consumers (admin tools,
 * getSessionStatus polling, success page URL builder) don't see a "payment
 * successful" status for a failed order.
 */
export function getFulfillmentFailedErrorInfo(params: {
  responseMessage?: string;
  referralPhone?: string;
} = {}): PaytriotErrorInfo {
  const base = BASE[PaytriotErrorCategory.FULFILLMENT_FAILED];
  return {
    category: PaytriotErrorCategory.FULFILLMENT_FAILED,
    responseCode: 0,
    responseMessage: params.responseMessage,
    title: base.title,
    description: base.description,
    recommendedAction: base.recommendedAction,
    wasCharged: true,
    severity: base.severity,
    isConfigError: base.isConfigError,
    referralPhone: params.referralPhone,
  };
}
