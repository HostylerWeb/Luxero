import type { Entry } from "./competitions";
import type { Order } from "./orders";
import type { PaytriotOrderMetadata } from "./payments";

export interface MeOrderItemCompetitionRef {
  _id: string;
  title?: string;
  prizeImageUrl?: string;
  slug?: string;
}

export interface MeOrderItemDto {
  _id: string;
  competitionId: string | MeOrderItemCompetitionRef;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  ticketNumbers?: number[];
  answerIndex?: number;
  createdAt?: string;
}

export type MeOrderDto = Omit<Order, "items"> & {
  items: MeOrderItemDto[];
};

export interface MeOrderInstantPrizeDto {
  _id: string;
  title: string;
  description?: string;
  images?: string[];
  value?: number;
  type?: "prize" | "competition_ticket";
  linkedCompetitionId?: string;
  linkedCompetitionSlug?: string;
  ticketCount?: number;
}

export interface MeOrderEntryInstantPrizeWinDto {
  _id: string;
  ticketNumber: number;
  claimed: boolean;
  claimedAt?: string;
  wonAt: string;
  competitionInstantPrizeId: MeOrderInstantPrizeDto;
  grantedTicketIds: string[];
  /** @deprecated use grantedTicketIds */
  grantedEntryIds?: string[];
}

export type MeOrderDetailEntryDto = Entry & {
  instantPrizeWins?: MeOrderEntryInstantPrizeWinDto[];
};

export type MeOrderDetailDto = MeOrderDto & {
  entries: MeOrderDetailEntryDto[];
  /**
   * Provider-specific metadata persisted on the order during webhook
   * processing. For Paytriot orders this includes the
   * `fulfillmentFailedAfterCapture` flag and the full Paytriot error
   * context used by the success page's defense-in-depth check.
   */
  metadata?: PaytriotOrderMetadata | Record<string, unknown>;
};

export interface CompetitionEntryStats {
  competitionId: string;
  totalTickets: number;
  prizeWins: number;
}

export interface MyEntriesStats {
  totalTickets: number;
  activeTickets: number;
  competitionCount: number;
  prizeWins: number;
  /** Ticket `_id` values for competition draw wins — used for per-ticket outcome styling. */
  drawWinnerEntryIds: string[];
  /** Per-competition ticket counts — fetched separately from the paginated entries list. */
  byCompetition: CompetitionEntryStats[];
}

export interface MyInstantPrizeWinDto {
  _id: string;
  ticketNumber: number;
  claimed: boolean;
  claimedAt?: string;
  wonAt: string;
  prize: {
    title: string;
    description: string;
    image: string;
    value: number;
  };
  prizeType: "prize" | "competition_ticket";
  linkedCompetitionTitle?: string;
  linkedCompetitionSlug?: string;
  linkedCompetitionId?: string;
  grantedTicketIds: string[];
  /** @deprecated use grantedTicketIds */
  grantedEntryIds?: string[];
}

export interface MyBonusAwardWinDto {
  _id: string;
  ticketNumber: number;
  claimed: boolean;
  claimedAt?: string;
  wonAt: string;
  prize: {
    title: string;
    description: string;
    image: string;
    value: number;
  };
  competition: {
    _id: string;
    title: string;
    slug: string;
    drawDate?: string;
  };
}
