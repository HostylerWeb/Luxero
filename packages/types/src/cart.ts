/** Client payload for adding an item to cart — display fields are enriched server-side. */
export interface CartItemInput {
  competitionId: string;
  quantity: number;
  answerIndex?: number;
}

export interface CartWalletTicket {
  competitionId: string;
  quantity: number;
}

/** Enriched cart item returned by the API (joined from Competition). */
export interface CartItem {
  competitionId: string;
  competitionTitle: string;
  competitionSlug: string;
  price: number;
  quantity: number;
  answerIndex: number;
  imageUrl?: string;
  maxTicketsPerUser: number;
  walletQty?: number;
  paidQty?: number;
}

export interface ICartItem extends CartItem {}

export interface CartAdjustment {
  competitionId: string;
  competitionTitle: string;
  previousQuantity: number;
  adjustedQuantity: number;
  available: number;
  maxPerUser: number;
  reason: "availability" | "max_per_user" | "wallet_reclamp" | "competition_ended";
  message: string;
  /** Stable id for client-side dismissal; format: `${reason}:${competitionId}` */
  id: string;
}

export interface ICart {
  id: string;
  cartVersion: number;
  items: ICartItem[];
  walletTicketsByCompetition?: CartWalletTicket[];
  walletBalance?: number;
  promoCode?: string;
  referralCode?: string;
  discountAmount: number;
  discountType: "percentage" | "fixed" | null;
  promoCodeGuestEligible?: boolean;
  promoDiscountPercent?: number;
  referralDiscountAmount?: number;
  referralDiscountPercent?: number;
  referralLocked?: boolean;
  referredByCode?: string;
  subtotal: number;
  monetarySubtotal?: number;
  walletTicketSavings?: number;
  total: number;
  walletTicketsTotal?: number;
  autoAdjustments?: CartAdjustment[];
  discountRequiresAuth?: boolean;
  /** Clamped set of wallet ticket allocations the server actually applied to the cart. */
  reclampedAllocations?: CartWalletTicket[];
}
