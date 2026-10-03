const KNOWN_ENV_TAGS = new Set(["staging", "agro", "prod", "production", "dev", "test"]);

export function getCookieEnvTag(appUrl: string): string | null {
  let host: string;
  try {
    host = new URL(appUrl).hostname;
  } catch {
    return null;
  }
  const labels = host.split(".");
  for (const label of labels) {
    if (KNOWN_ENV_TAGS.has(label)) {
      return label === "prod" || label === "production" ? null : label;
    }
  }
  return null;
}

export function getSessionCookiePrefix(appUrl: string, base: "client" | "admin"): string {
  const tag = getCookieEnvTag(appUrl);
  return tag ? `${base}-${tag}` : base;
}
