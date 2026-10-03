import * as Sentry from "@sentry/react";
import { QueryClient } from "@tanstack/react-query";
import {
  GC_TIME,
  STALE_TIME_ADMIN,
  STALE_TIME_LIVE,
  STALE_TIME_PUBLIC,
  STALE_TIME_STATIC,
  STALE_TIME_USER,
} from "./constants";

export function handleMutationError(err: unknown): string {
  Sentry.captureException(err, { tags: { domain: "web.mutation" } });
  if (err instanceof Error) return err.message;
  return "An unexpected error occurred";
}

/**
 * Tier-based `staleTime` based on the query key prefix.
 *
 * - `["public", ...]`         → static-ish public reads (5 min)
 * - `["public", ...] static`  → ultra-static (payment-config, compliance, etc.) (10 min)
 * - `["my", ...]`             → per-user, real-time (1 min)
 * - `["my", ...] live`        → per-user, real-time polling (10s)
 * - `["admin", ...]`          → admin views (1 min)
 * - `["competitions", id, "availability"|"buying-power"]`  → live (10s)
 * - `["payment", "session", ...]` → checkout polling (30s)
 * - everything else            → 30s (sensible default)
 *
 * Hooks can still override via the `staleTime` option on a per-query basis.
 */
export function staleTimeForKey(queryKey: readonly unknown[]): number {
  const first = queryKey[0];

  if (first === "public") {
    const second = queryKey[1];
    // Ultra-static singleton settings
    if (
      second === "compliance-settings" ||
      second === "referral-settings" ||
      second === "ending-soon-settings" ||
      second === "homepage-layout-settings"
    ) {
      return STALE_TIME_STATIC;
    }
    // Payment config is genuinely static (provider list + creds summary)
    if (second === "payment" && queryKey[2] === "config") {
      return STALE_TIME_STATIC;
    }
    if (second === "payment" && queryKey[2] === "providers") {
      return STALE_TIME_STATIC;
    }
    return STALE_TIME_PUBLIC;
  }

  if (first === "my") return STALE_TIME_USER;
  if (first === "admin") return STALE_TIME_ADMIN;
  if (first === "dashboard") return STALE_TIME_USER;

  // Live data: per-competition availability / buying-power (10s)
  if (
    first === "competitions" &&
    typeof queryKey[2] === "string" &&
    (queryKey[2] === "availability" || queryKey[2] === "buying-power")
  ) {
    return STALE_TIME_LIVE;
  }
  if (first === "competitions" && queryKey[1] === "availability-batch") {
    return STALE_TIME_LIVE;
  }
  if (first === "competitions" && queryKey[1] === "buying-power-batch") {
    return STALE_TIME_LIVE;
  }

  // Payment session polling (30s)
  if (first === "payment" && queryKey[1] === "session") {
    return 30_000;
  }

  // Default (catches ["competitions"] list, ["categories"], ["winners"], etc.)
  return STALE_TIME_PUBLIC;
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Tier-based staleTime based on query key prefix. Hooks can override.
        staleTime: ({ queryKey }) => staleTimeForKey(queryKey),
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        gcTime: GC_TIME,
        retry: false,
      },
      mutations: {
        onError: (err) => {
          Sentry.captureException(err, { tags: { domain: "web.mutation" } });
        },
      },
    },
  });
}

let _queryClient: QueryClient | null = null;

export function setGlobalQueryClient(client: QueryClient): void {
  _queryClient = client;
}

export function getGlobalQueryClient(): QueryClient {
  if (!_queryClient) {
    throw new Error("QueryClient not initialized. Ensure QueryProvider is mounted.");
  }
  return _queryClient;
}
