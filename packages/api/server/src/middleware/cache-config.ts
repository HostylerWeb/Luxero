/**
 * Per-route cache configuration.
 *
 * Each entry maps a `route` (stable identifier) to TTL + scope.
 * Use `getCacheConfig("competitions.list")` from a Hono route handler.
 *
 * Note: this is a starter set for PR1. PR2 will populate all public
 * common routes with their full TTL + scope + invalidation channel
 * configuration.
 */

import type { CacheRouteConfig } from "./cache";

const CONFIGS: Record<string, CacheRouteConfig> = {
  "homepage-layout-settings": {
    route: "settings:homepage_layout_settings",
    scope: "public",
    ttlSeconds: 300,
  },
  "homepage-layout-settings:public": {
    route: "settings:homepage_layout_settings:public",
    scope: "public",
    ttlSeconds: 300,
  },
};

export function getCacheConfig(route: string): CacheRouteConfig | undefined {
  return CONFIGS[route];
}

export function registerCacheConfig(route: string, config: CacheRouteConfig): void {
  CONFIGS[route] = config;
}

export function listCacheRoutes(): string[] {
  return Object.keys(CONFIGS);
}
