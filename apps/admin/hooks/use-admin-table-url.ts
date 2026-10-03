import type { PaginationState, Updater, VisibilityState } from "@tanstack/react-table";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ADMIN_SEARCH_DEBOUNCE_MS, useDebouncedValue } from "./use-debounced-value";

export { ADMIN_SEARCH_DEBOUNCE_MS, useDebouncedValue };

export interface ExtraFilterConfig {
  param: string;
  defaultValue?: string;
}

export interface ColumnSearchField {
  param: string;
  defaultValue?: string;
}

export interface UseAdminTableURLOptions {
  searchParam?: string;
  groupByParam?: string;
  filterParam?: string;
  extraFilters?: ExtraFilterConfig[];
  columnSearchFields?: ColumnSearchField[];
  defaultSearch?: string;
  defaultGroupBy?: string;
  defaultFilter?: string;
  defaultPageSize?: number;
}

export interface UseAdminTableURLResult {
  searchInput: string;
  debouncedSearch: string;
  onSearchChange: (value: string) => void;
  columnSearch: Record<string, string>;
  debouncedColumnSearch: Record<string, string>;
  onColumnSearchChange: (field: string, value: string) => void;
  groupBy: string | undefined;
  setGroupBy: (value: string | undefined) => void;
  filterValue: string;
  setFilterValue: (value: string) => void;
  extraFilterValues: Record<string, string>;
  setExtraFilterValue: (key: string, value: string) => void;
  pagination: PaginationState;
  setPagination: (updater: Updater<PaginationState>) => void;
  resetAll: () => void;
}

function parseColumnSearchParams(
  searchParams: URLSearchParams,
  fields: ColumnSearchField[]
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const field of fields) {
    const val = searchParams.get(`search[${field.param}]`) ?? field.defaultValue ?? "";
    if (val) result[field.param] = val;
  }
  return result;
}

export function useAdminTableURL(options: UseAdminTableURLOptions = {}): UseAdminTableURLResult {
  const {
    searchParam = "search",
    groupByParam = "groupBy",
    filterParam = "status",
    extraFilters = [],
    columnSearchFields = [],
    defaultSearch = "",
    defaultGroupBy = "",
    defaultFilter = "all",
    defaultPageSize = 10,
  } = options;

  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(searchParams.get(searchParam) ?? defaultSearch);
  const debouncedSearch = useDebouncedValue(searchInput, ADMIN_SEARCH_DEBOUNCE_MS);

  const [columnSearch, setColumnSearch] = useState<Record<string, string>>(() =>
    parseColumnSearchParams(searchParams, columnSearchFields)
  );
  const debouncedColumnSearch = useDebouncedValue(columnSearch, ADMIN_SEARCH_DEBOUNCE_MS);

  const debouncedSearchRef = useRef(debouncedSearch);
  debouncedSearchRef.current = debouncedSearch;

  const urlSearch = searchParams.get(searchParam) ?? defaultSearch;
  useEffect(() => {
    if (urlSearch !== debouncedSearchRef.current) setSearchInput(urlSearch);
  }, [urlSearch]);

  const prevSearchRef = useRef(debouncedSearch);
  const prevColSearchRef = useRef(debouncedColumnSearch);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) params.set(searchParam, debouncedSearch);
    else params.delete(searchParam);
    for (const field of columnSearchFields) {
      const val = debouncedColumnSearch[field.param];
      if (val) params.set(`search[${field.param}]`, val);
      else params.delete(`search[${field.param}]`);
    }
    const _nextParams = params.toString();
    const searchChanged =
      debouncedSearch !== prevSearchRef.current ||
      JSON.stringify(debouncedColumnSearch) !== JSON.stringify(prevColSearchRef.current);
    prevSearchRef.current = debouncedSearch;
    prevColSearchRef.current = debouncedColumnSearch;
    if (!searchChanged) return;
    params.delete("page");
    const newUrl = `?${params.toString()}`;
    if (newUrl === window.location.search) return;
    router.replace(newUrl, { scroll: false });
  }, [debouncedSearch, debouncedColumnSearch, searchParam, columnSearchFields, router]);

  const groupBy = (searchParams.get(groupByParam) ?? defaultGroupBy) || undefined;
  const filterValue = searchParams.get(filterParam) ?? defaultFilter;

  const extraFilterValues = useMemo(() => {
    const result: Record<string, string> = {};
    for (const f of extraFilters) {
      result[f.param] = searchParams.get(f.param) ?? f.defaultValue ?? "all";
    }
    return result;
  }, [searchParams, extraFilters]);

  const urlPage = Number(searchParams.get("page") ?? "1");
  const urlPageSize = Number(searchParams.get("pageSize") ?? defaultPageSize);
  const pageIndex = Number.isFinite(urlPage) && urlPage > 0 ? urlPage - 1 : 0;
  const pageSize = Number.isFinite(urlPageSize) && urlPageSize > 0 ? urlPageSize : defaultPageSize;
  const pagination = useMemo<PaginationState>(
    () => ({ pageIndex, pageSize }),
    [pageIndex, pageSize]
  );

  const onSearchChange = useCallback((value: string) => setSearchInput(value), []);
  const onColumnSearchChange = useCallback((field: string, value: string) => {
    setColumnSearch((prev) => ({ ...prev, [field]: value }));
  }, []);

  const setGroupBy = useCallback(
    (value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== defaultGroupBy) params.set(groupByParam, value);
      else params.delete(groupByParam);
      params.delete("page");
      const newUrl = `?${params.toString()}`;
      if (newUrl === window.location.search) return;
      router.replace(newUrl, { scroll: false });
    },
    [searchParams, groupByParam, defaultGroupBy, router]
  );

  const setFilterValue = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== defaultFilter) params.set(filterParam, value);
      else params.delete(filterParam);
      params.delete("page");
      const newUrl = `?${params.toString()}`;
      if (newUrl === window.location.search) return;
      router.replace(newUrl, { scroll: false });
    },
    [searchParams, filterParam, defaultFilter, router]
  );

  const setExtraFilterValue = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") params.set(key, value);
      else params.delete(key);
      params.delete("page");
      const newUrl = `?${params.toString()}`;
      if (newUrl === window.location.search) return;
      router.replace(newUrl, { scroll: false });
    },
    [searchParams, router]
  );

  const setPagination = useCallback(
    (updater: Updater<PaginationState>) => {
      const prevPage = Number(searchParams.get("page") ?? "1");
      const prevPageSizeRaw = Number(searchParams.get("pageSize") ?? defaultPageSize);
      const current: PaginationState = {
        pageIndex: Number.isFinite(prevPage) && prevPage > 0 ? prevPage - 1 : 0,
        pageSize:
          Number.isFinite(prevPageSizeRaw) && prevPageSizeRaw > 0
            ? prevPageSizeRaw
            : defaultPageSize,
      };
      const updated = typeof updater === "function" ? updater(current) : updater;
      const params = new URLSearchParams(searchParams.toString());
      const newPage = updated.pageIndex + 1;
      if (newPage <= 1) params.delete("page");
      else params.set("page", String(newPage));
      if (updated.pageSize === defaultPageSize) params.delete("pageSize");
      else params.set("pageSize", String(updated.pageSize));
      const newUrl = `?${params.toString()}`;
      if (newUrl === window.location.search) return;
      router.replace(newUrl, { scroll: false });
    },
    [searchParams, defaultPageSize, router]
  );

  const resetAll = useCallback(() => {
    setSearchInput(defaultSearch);
    setColumnSearch({});
  }, [defaultSearch]);

  return {
    searchInput,
    debouncedSearch,
    onSearchChange,
    columnSearch,
    debouncedColumnSearch,
    onColumnSearchChange,
    groupBy,
    setGroupBy,
    filterValue,
    setFilterValue,
    extraFilterValues,
    setExtraFilterValue,
    pagination,
    setPagination,
    resetAll,
  };
}

export function useColumnVisibility(
  allColumnIds: string[],
  paramName = "cols"
): {
  columnVisibility: VisibilityState;
  onColumnVisibilityChange: (updater: Updater<VisibilityState>) => void;
} {
  const searchParams = useSearchParams();

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => {
    const cols = searchParams.get(paramName);
    if (!cols) return {};
    const visible = new Set(cols.split(","));
    const state: VisibilityState = {};
    for (const id of allColumnIds) {
      if (!visible.has(id)) state[id] = false;
    }
    return state;
  });

  const updateURL = useCallback(
    (next: VisibilityState) => {
      const visibleCols = allColumnIds.filter((id) => next[id] !== false);
      const params = new URLSearchParams(searchParams.toString());
      if (visibleCols.length === allColumnIds.length) {
        params.delete(paramName);
      } else {
        params.set(paramName, visibleCols.join(","));
      }
      const newUrl = `?${params.toString()}`;
      if (newUrl === window.location.search) return;
      window.history.replaceState(null, "", newUrl);
    },
    [searchParams, allColumnIds, paramName]
  );

  const onColumnVisibilityChange = useCallback(
    (updater: Updater<VisibilityState>) => {
      setColumnVisibility((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        updateURL(next);
        return next;
      });
    },
    [updateURL]
  );

  return { columnVisibility, onColumnVisibilityChange };
}
