"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import {
  DEFAULT_FOCUS_STATE,
  type FocusState,
  parseFocusFromUrl,
  serializeFocusToUrl,
} from "./focus";

export interface UseFocusStateApi {
  focus: FocusState;
  setFocus: (next: Partial<FocusState>) => void;
  setFocusedNodes: (ids: string[]) => void;
  addFocusedNode: (id: string) => void;
  toggleFocusedNode: (id: string) => void;
  setRadius: (radius: number) => void;
  setDirection: (direction: FocusState["direction"]) => void;
  toggleFilter: (key: FocusState["filters"][number]) => void;
  clearFilters: () => void;
  clearFocus: () => void;
  resetAll: () => void;
  isFocused: (id: string) => boolean;
  hasAnyFocus: boolean;
}

export function useFocusState(): UseFocusStateApi {
  const router = useRouter();
  const searchParams = useSearchParams();

  const focus = useMemo(
    () => parseFocusFromUrl(new URLSearchParams(searchParams.toString())),
    [searchParams]
  );

  const updateUrl = useCallback(
    (next: FocusState) => {
      const merged = serializeFocusToUrl(next, new URLSearchParams(searchParams.toString()));
      const qs = merged.toString();
      const url = `/referrals/network${qs ? `?${qs}` : ""}`;
      router.replace(url, { scroll: false });
    },
    [router, searchParams]
  );

  const setFocus = useCallback(
    (partial: Partial<FocusState>) => updateUrl({ ...focus, ...partial }),
    [focus, updateUrl]
  );

  const setFocusedNodes = useCallback(
    (ids: string[]) => updateUrl({ ...focus, focusedNodeIds: ids }),
    [focus, updateUrl]
  );

  const addFocusedNode = useCallback(
    (id: string) => {
      if (focus.focusedNodeIds.includes(id)) return;
      updateUrl({ ...focus, focusedNodeIds: [...focus.focusedNodeIds, id] });
    },
    [focus, updateUrl]
  );

  const toggleFocusedNode = useCallback(
    (id: string) => {
      const has = focus.focusedNodeIds.includes(id);
      updateUrl({
        ...focus,
        focusedNodeIds: has
          ? focus.focusedNodeIds.filter((x) => x !== id)
          : [...focus.focusedNodeIds, id],
      });
    },
    [focus, updateUrl]
  );

  const setRadius = useCallback(
    (radius: number) => updateUrl({ ...focus, radius }),
    [focus, updateUrl]
  );
  const setDirection = useCallback(
    (direction: FocusState["direction"]) => updateUrl({ ...focus, direction }),
    [focus, updateUrl]
  );

  const toggleFilter = useCallback(
    (key: FocusState["filters"][number]) => {
      const has = focus.filters.includes(key);
      updateUrl({
        ...focus,
        filters: has ? focus.filters.filter((x) => x !== key) : [...focus.filters, key],
      });
    },
    [focus, updateUrl]
  );

  const clearFilters = useCallback(() => updateUrl({ ...focus, filters: [] }), [focus, updateUrl]);

  const clearFocus = useCallback(
    () => updateUrl({ ...focus, focusedNodeIds: [] }),
    [focus, updateUrl]
  );

  const resetAll = useCallback(() => updateUrl(DEFAULT_FOCUS_STATE), [updateUrl]);

  const isFocused = useCallback(
    (id: string) => focus.focusedNodeIds.includes(id),
    [focus.focusedNodeIds]
  );

  const hasAnyFocus = focus.focusedNodeIds.length > 0 || focus.filters.length > 0;

  return {
    focus,
    setFocus,
    setFocusedNodes,
    addFocusedNode,
    toggleFocusedNode,
    setRadius,
    setDirection,
    toggleFilter,
    clearFilters,
    clearFocus,
    resetAll,
    isFocused,
    hasAnyFocus,
  };
}
