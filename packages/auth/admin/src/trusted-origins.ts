import { expandAppUrlToOrigins, readOriginCandidatesFromEnv } from "@luxero/env/origin-policy";

/** Fixed Better Auth origin allowlist — never mirror arbitrary `Origin` headers (client/admin H1). */
export function getStaticTrustedOrigins(appUrl: string): string[] {
  const origins = new Set<string>(expandAppUrlToOrigins(appUrl));

  for (const candidate of readOriginCandidatesFromEnv()) {
    for (const origin of expandAppUrlToOrigins(candidate)) {
      origins.add(origin);
    }
  }

  return [...origins];
}

export function createTrustedOriginsResolver(appUrl: string) {
  const allowed = getStaticTrustedOrigins(appUrl);
  return (_request?: Request) => allowed;
}
