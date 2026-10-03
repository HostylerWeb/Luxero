import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../client";
import { STALE_TIME_ADMIN } from "../../constants";
import { queryKeys } from "../../keys";

export function useAdminConversionSettings() {
  return useQuery({
    queryKey: queryKeys.admin.conversionSettings(),
    queryFn: () => api.get("/api/admin/conversion-settings"),
    staleTime: STALE_TIME_ADMIN,
  });
}

export function useAdminConversionSettingsMutations() {
  const qc = useQueryClient();
  return {
    saveSettingsMutation: useMutation({
      mutationFn: (payload: Record<string, unknown>) =>
        api.put("/api/admin/conversion-settings", payload),
      onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.admin.conversionSettings() }),
    }),
  };
}
