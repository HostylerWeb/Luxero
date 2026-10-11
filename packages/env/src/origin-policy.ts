/**
 * Deployment origin policy — single source for CORS, CSRF, CSP extras, Better Auth, and Next image hosts.
 *
 * Override host suffixes: ORIGIN_ALLOW_HOST_SUFFIXES=example.com,example.net (comma-separated)
 * Extra exact origins (Better Auth + allowlist): AUTH_TRUSTED_ORIGINS_EXTRA=https://a.example,https://b.example
 *
 * URL-shaped env vars (APP_URL, S3_ENDPOINT, ASSET_BASE_URL, etc.) are listed in DEPLOYMENT_ORIGIN_ENV_KEYS.
 */

/** Primary public product domain (Hetzner production). Hostinger phase uses *.hstgr.cloud via env URLs + suffix list. */
export const PRIMARY_PRODUCT_HOST = "luxero.win";

/** Default HTTPS host suffixes matched by origin regex (any subdomain). Extend with ORIGIN_ALLOW_HOST_SUFFIXES. */
export const DEFAULT_ORIGIN_HOST_SUFFIXES: readonly string[] = [
  PRIMARY_PRODUCT_HOST,
  "hstgr.cloud",
];

/** Env vars read to build exact origin allowlists (CORS, CSRF, CSP, auth). */
export const DEPLOYMENT_ORIGIN_ENV_KEYS = [
  "APP_URL",
  "ADMIN_URL",
  "SHOP_URL",
  "PUBLIC_ENV__APP_URL",
  "PUBLIC_ENV__ADMIN_URL",
  "STAGING_APP_URL",
  "S3_ENDPOINT",
  "ASSET_BASE_URL",
  "NEXT_PUBLIC_ASSET_BASE_URL",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_FRONTEND_URL",
  "NEXT_PUBLIC_SHOP_URL",
] as const;

export function getPrimaryPlatformOrigins(): string[] {
  const h = PRIMARY_PRODUCT_HOST;
  return [
    `https://${h}`,
    `https://www.${h}`,
    `https://staging.${h}`,
    `https://assets.${h}`,
    `https://assets.staging.${h}`,
  ];
}

export function parseOriginHostSuffixes(): string[] {
  const fromEnv = process.env.ORIGIN_ALLOW_HOST_SUFFIXES
    ?.split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return [...new Set([...DEFAULT_ORIGIN_HOST_SUFFIXES, ...(fromEnv ?? [])])];
}

function escapeRegexHostSuffix(suffix: string): string {
  return suffix.replace(/\./g, "\\.");
}

/** Regexes for allowed `Origin` header values (CSRF + CORS). */
export function buildOriginAllowRegexes(suffixes = parseOriginHostSuffixes()): RegExp[] {
  const regexes: RegExp[] = [
    /^https?:\/\/localhost(:\d+)?$/,
    /^capacitor:\/\/localhost(:\d+)?$/,
  ];
  for (const suffix of suffixes) {
    const esc = escapeRegexHostSuffix(suffix);
    regexes.push(new RegExp(`^https://(?:[a-z0-9-]+\\.)*${esc}(:\\d+)?$`, "i"));
  }
  return regexes;
}

export function readOriginCandidatesFromEnv(): string[] {
  const candidates: string[] = [];
  for (const key of DEPLOYMENT_ORIGIN_ENV_KEYS) {
    const v = process.env[key]?.trim();
    if (v) candidates.push(v.replace(/\/$/, ""));
  }
  const extra = process.env.AUTH_TRUSTED_ORIGINS_EXTRA?.trim();
  if (extra) {
    for (const part of extra.split(",")) {
      const o = part.trim().replace(/\/$/, "");
      if (o) candidates.push(o);
    }
  }
  return candidates;
}

/** Expand one app/base URL into exact origins (apex, www, local aliases). Used by Better Auth trusted origins. */
export function expandAppUrlToOrigins(base: string): string[] {
  const origins = new Set<string>();
  const normalized = base.replace(/\/$/, "");
  if (normalized) origins.add(normalized);

  try {
    const parsed = new URL(normalized);
    const host = parsed.hostname;
    const portSuffix = parsed.port ? `:${parsed.port}` : "";
    if (host.startsWith("www.")) {
      origins.add(`${parsed.protocol}//${host.slice(4)}${portSuffix}`);
    } else {
      origins.add(`${parsed.protocol}//www.${host}${portSuffix}`);
    }
    if (host === "localhost" || host === "127.0.0.1") {
      origins.add(`http://localhost${portSuffix}`);
      origins.add(`http://127.0.0.1${portSuffix}`);
    }
  } catch {
    // ignore malformed URL
  }

  origins.add("capacitor://localhost");
  origins.add("http://localhost");
  origins.add("http://127.0.0.1");

  return [...origins];
}

export function getDeploymentOriginSet(): Set<string> {
  const set = new Set<string>();
  for (const raw of readOriginCandidatesFromEnv()) {
    for (const origin of expandAppUrlToOrigins(raw)) {
      set.add(origin);
    }
  }
  return set;
}

let deploymentOriginCache: Set<string> | null = null;

function deploymentOrigins(): Set<string> {
  if (!deploymentOriginCache) {
    deploymentOriginCache = getDeploymentOriginSet();
  }
  return deploymentOriginCache;
}

/** Test helper — env changes require a new process in production. */
export function resetOriginPolicyCache(): void {
  deploymentOriginCache = null;
}

export function isAllowedRequestOrigin(origin: string): boolean {
  if (buildOriginAllowRegexes().some((re) => re.test(origin))) return true;
  return deploymentOrigins().has(origin);
}

/** Hono `cors({ origin })` — missing Origin is allowed (same-origin / non-CORS clients). */
export function resolveCorsOrigin(origin: string | undefined): string | null {
  if (!origin) return origin ?? null;
  return isAllowedRequestOrigin(origin) ? origin : null;
}

/** Space-prefixed CSP fragment: platform asset/app hosts + deployment env origins. */
export function getCspAssetOriginsClause(): string {
  const set = new Set<string>(getPrimaryPlatformOrigins());
  for (const o of deploymentOrigins()) {
    set.add(o);
  }
  return set.size ? ` ${[...set].join(" ")}` : "";
}

export function getAssetHostnameAllowlist(): string[] {
  const hosts = new Set<string>();
  for (const origin of getPrimaryPlatformOrigins()) {
    try {
      hosts.add(new URL(origin).hostname);
    } catch {
      /* ignore */
    }
  }
  for (const raw of readOriginCandidatesFromEnv()) {
    try {
      const url = raw.startsWith("http") ? raw : `https://${raw}`;
      hosts.add(new URL(url).hostname);
    } catch {
      /* ignore */
    }
  }
  return [...hosts];
}

export type NextImageRemotePattern = {
  protocol: "https" | "http";
  hostname: string;
  port?: string;
  pathname?: string;
};

export function getNextAssetRemotePatterns(): NextImageRemotePattern[] {
  const patterns: NextImageRemotePattern[] = getAssetHostnameAllowlist().map((hostname) => ({
    protocol: "https",
    hostname,
  }));
  patterns.push(
    { protocol: "http", hostname: "localhost", port: "9011", pathname: "/luxero-assets/**" },
    { protocol: "http", hostname: "127.0.0.1", port: "9011", pathname: "/luxero-assets/**" }
  );
  return patterns;
}
