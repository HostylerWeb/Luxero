import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../client";
import { STALE_TIME_ADMIN } from "../../constants";
import { queryKeys } from "../../keys";

interface SeoSettingsShape {
  defaultOgImageUrl?: string;
  defaultTitle: string;
  defaultDescription: string;
}

export function useAdminSeoSettings() {
  return useQuery({
    queryKey: queryKeys.admin.seoSettings(),
    queryFn: () => api.get("/api/admin/seo-settings"),
    staleTime: STALE_TIME_ADMIN,
  });
}

export function useAdminSeoSettingsMutations() {
  const qc = useQueryClient();
  return {
    saveSettingsMutation: useMutation({
      mutationFn: (payload: Partial<SeoSettingsShape>) =>
        api.put("/api/admin/seo-settings", payload),
      onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.admin.seoSettings() }),
    }),
  };
}
