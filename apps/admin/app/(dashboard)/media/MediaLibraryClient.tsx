"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef } from "react";
import {
  type AssetSort,
  type AssetTypeFilter,
  type AssetView,
  MediaGrid,
} from "@/components/media";

export function MediaLibraryClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const prefix = searchParams.get("prefix") ?? "";
  const search = searchParams.get("search") ?? "";
  const type: AssetTypeFilter = (searchParams.get("type") as AssetTypeFilter | null) ?? "all";
  const sort: AssetSort = (searchParams.get("sort") as AssetSort | null) ?? "newest";
  const view: AssetView = (searchParams.get("view") as AssetView | null) ?? "grid";

  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  const updateUrl = useCallback(
    (next: {
      prefix?: string;
      search?: string;
      type?: AssetTypeFilter;
      sort?: AssetSort;
      view?: AssetView;
    }) => {
      const params = new URLSearchParams(searchParamsRef.current.toString());
      if (next.prefix !== undefined) {
        if (next.prefix) params.set("prefix", next.prefix);
        else params.delete("prefix");
      }
      if (next.search !== undefined) {
        if (next.search) params.set("search", next.search);
        else params.delete("search");
      }
      if (next.type !== undefined) {
        if (next.type !== "all") params.set("type", next.type);
        else params.delete("type");
      }
      if (next.sort !== undefined) {
        if (next.sort !== "newest") params.set("sort", next.sort);
        else params.delete("sort");
      }
      if (next.view !== undefined) {
        if (next.view !== "grid") params.set("view", next.view);
        else params.delete("view");
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router]
  );

  return (
    <MediaGrid
      layout="page"
      initialPrefix={prefix}
      initialSearch={search}
      initialType={type}
      initialSort={sort}
      initialView={view}
      previewable
      onStateChange={updateUrl}
    />
  );
}
