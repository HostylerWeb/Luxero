export interface PayPalErrorResult {
  code: string;
  userMessage: string;
  rawError?: unknown;
}

export function classifyPayPalError(data: unknown): PayPalErrorResult {
  const issue =
    (data as { details?: Array<{ issue?: string }>; name?: string })?.details?.[0]?.issue ??
    (data as { name?: string })?.name ??
    "";

  const map: Record<string, PayPalErrorResult> = {
    INSUFFICIENT_FUNDS: {
      code: "INSUFFICIENT_FUNDS",
      userMessage: "Insufficient funds. Please use a different payment method.",
    },
    PAYER_CANNOT_PAY: {
      code: "PAYMENT_DECLINED",
      userMessage: "Payment could not be completed with this PayPal account.",
    },
    CARD_REJECTED: {
      code: "CARD_REJECTED",
      userMessage: "Card was declined by your bank. Please try a different card.",
    },
    EXPIRED_CARD: {
      code: "CARD_EXPIRED",
      userMessage: "Your card has expired. Please use a different card.",
    },
    AMOUNT_MISMATCH: {
      code: "AMOUNT_MISMATCH",
      userMessage: "Order amount mismatch. Please refresh your cart.",
    },
    ORDER_ALREADY_CAPTURED: {
      code: "ORDER_ALREADY_CAPTURED",
      userMessage: "This order has already been processed.",
    },
    INSTRUMENT_DECLINED: {
      code: "PAYMENT_DECLINED",
      userMessage: "Payment method was declined. Please try a different method.",
    },
    INVALID_ACCOUNT: {
      code: "INVALID_PAYMENT_ACCOUNT",
      userMessage: "PayPal account issue. Please update your account.",
    },
    TRANSACTION_REFUSED: {
      code: "TRANSACTION_REFUSED",
      userMessage: "Transaction was refused. Please try a different payment method.",
    },
    PAYMENT_SOURCE_INFO_DECLINED: {
      code: "PAYMENT_SOURCE_INFO_DECLINED",
      userMessage: "Payment source information was declined. Please update your payment method.",
    },
    PAYMENT_SOURCE_CANNOT_BE_CHARGED: {
      code: "PAYMENT_SOURCE_CANNOT_BE_CHARGED",
      userMessage: "This payment method cannot be charged. Please use a different method.",
    },
  };

  return (
    map[issue] ?? {
      code: "PAYMENT_FAILED",
      userMessage: "Payment could not be processed. Please try again.",
      rawError: data,
    }
  );
}
