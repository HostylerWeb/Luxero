import { useEffect } from "react";
import { prefetch } from "vike/client/router";

const ROUTES = ["/competitions", "/how-it-works", "/winners", "/entries"] as const;

export function RoutePrefetcherIsland() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    for (const route of ROUTES) {
      void prefetch(route);
    }
  }, []);

  return null;
}
