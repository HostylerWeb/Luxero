"use client";
import { useEffect, useState } from "react";
import { useKinoStore } from "./store";

/**
 * Subscribe to page-level scroll progress (0→1).
 * Uses the global Zustand store driven by ScrollTracker.
 */
export function useScrollProgress(): number {
  return useKinoStore((s) => s.progress);
}

/**
 * Returns true if the user prefers reduced motion.
 * Caches the result in state to avoid re-renders on every media-query change.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mql.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return reduced;
}

/**
 * Returns true when running on the client (not during SSR).
 */
export function useIsClient(): boolean {
  const [client, setClient] = useState(false);
  useEffect(() => setClient(true), []);
  return client;
}
