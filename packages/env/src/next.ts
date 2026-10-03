import type { EnvKey } from "./types";

const DEFAULTS: Partial<Record<EnvKey, string>> = {
  APP_URL: "http://localhost:3222",
  ADMIN_URL: "http://localhost:3222",
  FRONTEND_URL: "http://localhost:3111",
  LOGIN_URL: "/auth/login",
  SENTRY_ENVIRONMENT: "development",
};

export function getEnv<T extends string = string>(key: EnvKey, fallback?: T): T {
  const nextKey = `NEXT_PUBLIC_${key}`;
  const env = process.env as Record<string, string | undefined>;
  const val = (env[nextKey] || fallback) ?? DEFAULTS[key] ?? "";
  return val as T;
}

export function getBool(key: EnvKey, fallback = false): boolean {
  const nextKey = `NEXT_PUBLIC_${key}`;
  const env = process.env as Record<string, string | undefined>;
  const val = env[nextKey];
  if (val === "true" || val === "1") return true;
  return fallback;
}

export function getNum(key: EnvKey, fallback?: number): number {
  const val = getEnv(key);
  if (!val && fallback !== undefined) return fallback;
  const parsed = parseInt(val, 10);
  return Number.isNaN(parsed) ? (fallback ?? 0) : parsed;
}

export type { EnvKey } from "./types";
