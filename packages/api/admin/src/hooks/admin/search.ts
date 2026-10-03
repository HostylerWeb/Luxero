"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "../../client";
import { queryKeys } from "../../keys";

export interface SearchResultItem {
  id: string;
  label: string;
  description: string;
  url: string;
  type: string;
  detailUrl?: string;
  badge?: string;
}

export interface SearchResultGroup {
  type: string;
  label: string;
  searchUrl: string;
  items: SearchResultItem[];
}

export interface SearchResponse {
  results: SearchResultGroup[];
}

export function useAdminSearch(q: string) {
  const trimmed = q.trim();
  return useQuery({
    queryKey: queryKeys.admin.search(trimmed),
    queryFn: () => api.get<SearchResponse>(`/api/admin/search?q=${encodeURIComponent(trimmed)}`),
    enabled: trimmed.length >= 2,
    staleTime: 30_000,
    retry: 1,
  });
}
