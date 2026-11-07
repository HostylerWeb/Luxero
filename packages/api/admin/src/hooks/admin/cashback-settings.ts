import type { ApiResponse, CashbackSettings } from "@luxero/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../client";
import { STALE_TIME_ADMIN } from "../../constants";
import { queryKeys } from "../../keys";

export function useAdminCashbackSettings() {
  return useQuery<ApiResponse<CashbackSettings>>({
    queryKey: queryKeys.admin.cashbackSettings(),
    queryFn: () => api.get("/api/admin/cashback-settings"),
    staleTime: STALE_TIME_ADMIN,
  });
}

export function useAdminCashbackSettingsMutations() {
  const qc = useQueryClient();
  const saveSettingsMutation = useMutation({
    mutationFn: (payload: Partial<CashbackSettings>) =>
      api.put("/api/admin/cashback-settings", payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.cashbackSettings() });
    },
  });
  return { saveSettingsMutation };
}
