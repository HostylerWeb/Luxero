import type { ApiResponse, MediaConverterSettings } from "@luxero/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../client";
import { STALE_TIME_ADMIN } from "../../constants";
import { queryKeys } from "../../keys";

export function useAdminMediaConverterSettings() {
  return useQuery<ApiResponse<MediaConverterSettings>>({
    queryKey: queryKeys.admin.mediaConverterSettings(),
    queryFn: () => api.get("/api/admin/media-converter-settings"),
    staleTime: STALE_TIME_ADMIN,
  });
}

export function useAdminMediaConverterSettingsMutations() {
  const qc = useQueryClient();

  const saveSettingsMutation = useMutation({
    mutationFn: (payload: Partial<MediaConverterSettings>) =>
      api.put("/api/admin/media-converter-settings", payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.mediaConverterSettings() });
    },
  });

  return { saveSettingsMutation };
}
