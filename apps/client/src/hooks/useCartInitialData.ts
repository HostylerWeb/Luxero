"use client";

import { usePageContext } from "vike-react/usePageContext";

export function useCartInitialData<T>(): T | undefined {
  const ctx = usePageContext();
  return (ctx as unknown as Record<string, unknown>).cartInitialData as T | undefined;
}
