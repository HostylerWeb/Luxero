import type { Competition } from "./competitions";
import type { OrderItem } from "./orders";

export interface AdminCompetition {
  _id: string;
  slug: string;
  title: string;
  shortDescription?: string;
  description?: string;
  category?: string;
  isCashOnly?: boolean;
  requireSignIn?: boolean;
  status: Competition["status"];
  prizeValue: number;
  prizeImageUrl?: string;
  heroImageUrl?: string;
  ogImageUrl?: string;
  refOgImageUrl?: string;
  imageUrl?: string;
  landingPageVideoUrl?: string;
  landingPageVideoFramesPrefix?: string;
  landingPageVideoFrameCount?: number;
  landingPageVideoFps?: number;
  landingPageVideoMetadata?: import("./competitions").VideoSourceMetadata;
  prizeImages?: string[];
  ticketPrice: number;
  maxTickets: number;
  ticketsSold: number;
  winnerTicketNumber?: number;
  winnerId?: string;
  /** Reserved in cart / checkout */
  ticketsHeld?: number;
  /** Enriched from ticket pool — available pickable tickets */
  availableTickets?: number;
  maxTicketsPerUser: number;
  question?: string;
  questionOptions?: string[];
  correctAnswer?: number;
  drawDate?: string;
  isFeatured: boolean;
  displayOrder: number;
  originalPrice?: number;
  currency?: "GBP" | "EUR";
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrder {
  _id: string;
  orderNumber: number;
  userId: string;
  userFullName?: string;
  userEmail?: string;
  status: string;
  subtotal: number;
  discountAmount: number;
  total: number;
  promoCodeId?: string;
  referralBonusTickets: number;
  referralBalanceUsed: number;
  paidAt?: string;
  /**
   * Provider-agnostic session id. Reads from `Order.paypalOrderId` alias for
   * backward compatibility; new code should use `providerSessionId`.
   */
  providerSessionId?: string;
  items: OrderItem[];
  /** Number of OrderItems — populated in list responses instead of full items array */
  itemCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  _id: string;
  email: string;
  role?: "user" | "manager" | "admin";
  isAdmin: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  referralMultiplier?: number;
  referralCode?: string | null;
  referralCount?: number;
  referredByEmail?: string;
}

export interface AdminPromoCode {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderValue?: number;
  maxUses?: number;
  maxUsesPerUser?: number;
  validFrom?: string;
  validUntil?: string;
  isActive: boolean;
  guestEligible?: boolean;
  competitionId?: string;
  minTickets?: number;
  currentUses: number;
  usedBy?: string[];
}

export interface AdminCategory {
  _id: string;
  name: string;
  slug: string;
  label: string;
  iconName: string;
  description?: string;
  isActive: boolean;
  displayOrder: number;
  competitionCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCategoryPayload {
  name: string;
  slug: string;
  label?: string;
  iconName?: string;
  description?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export interface AdminShopCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface AdminShopCategoryPayload {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface AdminInstantPrize {
  _id: string;
  title: string;
  description?: string;
  value?: number;
  images: string[];
  isActive: boolean;
  type: "prize" | "competition_ticket";
  prizeCategory?: "cash" | "site_credit" | "physical";
  linkedCompetitionId?: string;
  linkedCompetition?: { title: string; imageUrl?: string; status?: string };
  ticketCount?: number;
  bonusAwardCount: number;
  competitionAssignmentCount: number;
}
