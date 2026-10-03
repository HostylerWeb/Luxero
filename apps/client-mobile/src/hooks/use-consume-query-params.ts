"use client";
import { useEffect, useRef } from "react";

export function useConsumeQueryParams(keys: string[]): void {
  const consumedRef = useRef(false);

  useEffect(() => {
    if (consumedRef.current) return;
    const searchParams =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search)
        : new URLSearchParams();
    if (!keys.some((k) => searchParams.has(k))) return;

    consumedRef.current = true;
    const next = new URLSearchParams(searchParams);
    for (const k of keys) next.delete(k);
    const qs = next.toString();
    const pathname = window.location.pathname;
    window.history.replaceState({}, "", qs ? `${pathname}?${qs}` : pathname);
    window.dispatchEvent(new Event("popstate"));
  }, [keys]);
}
