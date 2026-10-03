export interface EntryCompetitionsSummary {
  totalEntries: number;
  competitionCount: number;
  activeCount: number;
  drawnCount: number;
}

export interface GroupedRow<T> {
  _id: string;
  key: string;
  count: number;
  items: T[];
}

export type PaginationSummary =
  | EntryCompetitionsSummary
  | import("./referrals").AdminReferralSummary;

export interface ApiResponse<T> {
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    pages?: number;
    hasMore?: boolean;
    nextCursor?: string;
    summary?: PaginationSummary;
  };
}

export interface ShuffleConfig {
  domainSize: number;
  rounds?: number;
}

export interface ShuffleResult {
  tickets: number[];
  skipped: number;
}
