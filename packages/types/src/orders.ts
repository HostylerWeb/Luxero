export interface OrderMetadata {
  needsReview?: boolean;
  needsReviewReason?: string;
}

export interface Order {
  _id: string;
  id?: string;
  orderNumber: number;
  status: "pending" | "processing" | "completed" | "failed" | "refunded";
  subtotal: number;
  discountAmount: number;
  total: number;
  promoCodeId?: string;
  referralBonusTickets: number;
  referralBalanceUsed: number;
  /**
   * Provider-agnostic session id (replaces the misnamed `paypalOrderId`).
   * One slot per order, written by the provider adapter during `createSession`.
   * Aliases `paypalOrderId` in the Mongoose schema for backward compatibility.
   */
  providerSessionId?: string;
  /**
   * The payment provider that owns this order. Set by the adapter during
   * `createSession`. Used by admin routes to dispatch refunds/retries without
   * string-magic prefix sniffing.
   */
  provider?: "local" | "stripe" | "paytriot";
  paidAt?: string;
  createdAt: string;
  items?: Array<{
    _id: string;
    competitionId: string;
    competitionTitle?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    ticketNumbers?: number[];
    answerIndex?: number;
    createdAt?: string;
  }>;
}

export interface OrderItem {
  _id: string;
  orderId: string;
  competitionId: string;
  competitionTitle?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  ticketNumbers?: number[];
  answerIndex?: number;
}
