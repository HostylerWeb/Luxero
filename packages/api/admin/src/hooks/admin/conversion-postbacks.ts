import { useQuery } from "@tanstack/react-query";
import { api } from "../../client";
import { STALE_TIME_ADMIN } from "../../constants";
import { queryKeys } from "../../keys";

export interface ConversionPostbackLogRow {
  _id: string;
  eventType: "signup" | "purchase";
  trackerId: string;
  trackerName: string;
  url: string;
  method: "GET" | "POST";
  status: number | null;
  ok: boolean;
  error: string | null;
  clickId: string | null;
  source: string | null;
  userId: string | null;
  email: string | null;
  amount: number | null;
  payout: number | null;
  currency: string | null;
  orderId: string | null;
  transactionId: string | null;
  createdAt: string;
}

export interface ConversionPostbackSummaryRow {
  source: string | null;
  eventType: "signup" | "purchase";
  count: number;
  totalAmount: number;
}

export interface AdminConversionPostbacksParams {
  page?: number;
  limit?: number;
  eventType?: string;
  source?: string;
  trackerId?: string;
  status?: string;
  days?: string;
}

export function useAdminConversionPostbacks(params: AdminConversionPostbacksParams = {}) {
  const filters = {
    eventType: params.eventType,
    source: params.source,
    trackerId: params.trackerId,
    status: params.status,
    days: params.days,
  };
  return useQuery({
    queryKey: queryKeys.admin.conversionPostbacks(filters),
    queryFn: () =>
      api.get("/api/admin/conversion-postbacks", {
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 20,
          ...Object.fromEntries(
            Object.entries(filters).filter(([, v]) => v !== undefined && v !== "")
          ),
        },
      }),
    staleTime: STALE_TIME_ADMIN,
  });
}

export function useAdminConversionPostbacksSummary(days = 30) {
  return useQuery({
    queryKey: queryKeys.admin.conversionPostbacksSummary(days),
    queryFn: () => api.get("/api/admin/conversion-postbacks/summary", { params: { days } }),
    staleTime: STALE_TIME_ADMIN,
  });
}
