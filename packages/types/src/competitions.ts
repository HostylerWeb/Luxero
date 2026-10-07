export interface VideoSourceMetadata {
  source: {
    width: number;
    height: number;
    fps: number;
    duration: number;
    codec: string;
    size: number;
  };
  extraction: {
    fps: number;
    width: number;
    height: number;
    quality: number;
    totalFrames: number;
  };
}

export interface Competition {
  id: string;
  _id?: string;
  title: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  category?: string;
  isCashOnly?: boolean;
  status: "active" | "draft" | "paused" | "ended" | "pending_draw" | "drawn" | "cancelled";
  ticketPrice: number;
  price?: number;
  originalPrice?: number;
  imageUrl?: string;
  landingPageVideoUrl?: string;
  landingPageVideoFramesPrefix?: string;
  landingPageVideoFrameCount?: number;
  landingPageVideoFps?: number;
  landingPageVideoMetadata?: VideoSourceMetadata;
  prizeImageUrl?: string;
  prizeImages?: string[];
  prizeImagesSource?: string;
  prizeImagesRemote?: string[];
  prizeSpecifications?: Record<string, unknown>;
  drawDate?: string | Date;
  endDate?: string | Date;
  startDate?: string | Date;
  prizeValue: number;
  maxTickets: number;
  ticketsSold?: number;
  /** Reserved in cart / checkout — not counted as sold */
  ticketsHeld?: number;
  /** Pickable tickets remaining in the pool */
  availableTickets?: number;
  /** Share of pool consumed (sold + held), 0–100 */
  percentageTaken?: number;
  totalTickets?: number;
  soldTickets?: number;
  maxTicketsPerUser?: number;
  isFeatured?: boolean;
  displayOrder?: number;
  isHeroFeatured?: boolean;
  heroDisplayOrder?: number;
  heroImageUrl?: string;
  ogImageUrl?: string;
  refOgImageUrl?: string;
  question?: string;
  questionOptions?: string[];
  correctAnswer?: number;
  requireSignIn?: boolean;
  isReferralReward?: boolean;
  currency: string;
  winnerId?: string;
  winnerTicketNumber?: number;
  winnerAnnouncedAt?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

/** API lean document before client-side field normalization */
export type RawCompetitionResponse = Partial<Competition> & {
  _id?: string;
  price?: number;
  totalTickets?: number;
  soldTickets?: number;
};

export interface CompetitionDetail extends Competition {
  longDescription?: string;
  terms?: string;
  faq?: string;
}

export type TicketStatus = "available" | "reserved" | "sold" | "held";

export interface Entry {
  _id: string;
  id?: string;
  competitionId:
    | string
    | {
        _id: string;
        slug?: string;
        title?: string;
        prizeImageUrl?: string;
        imageUrl?: string;
        status?: string;
        drawDate?: string;
        maxTickets?: number;
        ticketsSold?: number;
      };
  competitionTitle?: string;
  orderId?: string;
  entryNumber: number;
  ticketNumber?: number;
  quantity: number;
  answerIndex?: number;
  answerCorrect?: boolean;
  instantPrizeWinId?: string;
  drawDate?: string;
  createdAt: string;
}

export interface Winner {
  _id: string;
  id?: string;
  competitionId:
    | string
    | {
        _id: string;
        title?: string;
        imageUrl?: string;
        prizeImageUrl?: string;
        slug?: string;
      };
  competitionTitle?: string;
  competitionSlug?: string;
  userId: string;
  email?: string;
  entryId?: string;
  ticketNumber: number;
  prizeTitle?: string;
  prizeValue?: number;
  prizeImageUrl?: string;
  displayName?: string;
  location?: string;
  testimonial?: string;
  winnerPhotoUrl?: string;
  /** Public profile photo when the winner is linked to a user account. */
  avatarUrl?: string | null;
  showFullName: boolean;
  claimed?: boolean;
  claimedAt?: string;
  drawnAt: string;
  createdAt?: string;
  competition?: {
    title?: string;
    prizeImageUrl?: string;
    imageUrl?: string;
  };
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  label: string;
  iconName: string;
  description?: string;
  isActive: boolean;
  displayOrder?: number;
}

export interface PromoCode {
  id: string;
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
}

export interface IShippingAddress {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postcode?: string;
  country?: string;
}

export interface InstantPrizeWin {
  _id: string;
  competitionInstantPrizeId: string;
  userId: string;
  entryId: string;
  ticketNumber: number;
  claimed: boolean;
  claimedAt?: string;
  shippingAddress?: IShippingAddress;
  wonAt: string;
  grantedTicketIds: string[];
  /** @deprecated use grantedTicketIds */
  grantedEntryIds?: string[];
  createdAt: string;
}

export interface CompetitionInstantPrize {
  id: string;
  competitionId: string;
  competitionTitle?: string;
  instantPrizeId: string;
  instantPrize: {
    title: string;
    description?: string;
    images: string[];
    value?: number;
    isActive: boolean;
    type?: "prize" | "competition_ticket";
    prizeCategory?: "cash" | "site_credit" | "physical";
    linkedCompetitionId?: string;
    linkedCompetition?: { title: string; imageUrl?: string };
    ticketCount?: number;
  };
  winningEntryNumbers: number[];
  quantity: number;
  claimedCount: number;
  grantedTicketIds?: string[];
  /** @deprecated use grantedTicketIds */
  grantedEntryIds?: string[];
  isArchived?: boolean;
  sortOrder?: number;
  createdAt?: string;
}

/** Admin list row — omits grantedTicketIds and uses nested instantPrize (no instantPrizeId). */
export interface AdminCompetitionInstantPrizeListItem {
  id: string;
  competitionId: string;
  instantPrizeId?: string;
  competitionTitle: string;
  instantPrize: {
    title: string;
    description?: string;
    images: string[];
    value?: number;
    type?: "prize" | "competition_ticket";
    prizeCategory?: "cash" | "site_credit" | "physical";
    linkedCompetitionId?: string;
    ticketCount?: number;
  };
  winningEntryNumbers: number[];
  quantity: number;
  claimedCount: number;
  isArchived: boolean;
  sortOrder?: number;
  createdAt?: string;
}

/** Admin assign/PATCH response — compact shape without populated instantPrize. */
export interface AdminCompetitionInstantPrizeAssignResult {
  id: string;
  competitionId: string;
  instantPrizeId: string;
  winningEntryNumbers: number[];
  quantity: number;
  claimedCount: number;
  isArchived: boolean;
  sortOrder?: number;
}

export interface CreateCompetitionInstantPrizePayload {
  competitionId: string;
  instantPrizeId: string;
  quantity: number;
  winningEntryNumbers?: number[];
}

export interface UpdateCompetitionInstantPrizePayload {
  quantity?: number;
  absolute?: boolean;
  linkedCompetitionId?: string;
  ticketCount?: number;
  prizeTitle?: string;
  prizeValue?: number;
  prizeCategory?: "cash" | "site_credit" | "physical";
  regenerateWinningNumbers?: boolean;
}

export interface InstantPrizeCapacityLinkedCompetition {
  id: string;
  title: string;
  availableTickets: number;
  ticketsPerSlot: number;
}

export interface InstantPrizeCapacityResponse {
  maxTickets: number;
  assignedSlots: number;
  remainingSlots: number;
  availableTickets: number;
  maxAssignableQty: number;
  maxQty: number;
  linkedAvailable?: number;
  linkedMaxSlots?: number;
  linkedCompetition?: InstantPrizeCapacityLinkedCompetition;
  requestedQuantity?: number;
  quantityValid?: boolean;
  quantityMessage?: string;
}

export interface InstantPrizeCapacityParams {
  competitionId: string;
  instantPrizeId?: string;
  quantity?: number;
  linkedCompetitionId?: string;
  ticketCount?: number;
  excludeCipId?: string;
}

export interface WinnerEntry {
  ticketNumber: number;
  userFullName: string;
}

export interface CompetitionInstantPrizePublicDTO {
  id: string;
  instantPrize: {
    title: string;
    description?: string;
    images: string[];
    value?: number;
    type?: "prize" | "competition_ticket";
    linkedCompetitionId?: string;
    linkedCompetition?: { id?: string; title: string; slug?: string; imageUrl?: string };
  };
  winningEntryNumbers: number[];
  winnerEntries: WinnerEntry[];
  quantity: number;
  claimedCount: number;
  isArchived?: boolean;
  sortOrder?: number;
}
