/** Public site origin for meta tags (SSR uses runtime APP_URL from page context). */
export function getPublicSiteOrigin(pageContext?: { siteOrigin?: string | null }): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  const fromContext = pageContext?.siteOrigin?.trim();
  if (fromContext) {
    return fromContext.replace(/\/$/, "");
  }
  const fromEnv = import.meta.env.PUBLIC_ENV__APP_URL;
  if (typeof fromEnv === "string" && fromEnv.trim() && !fromEnv.includes("localhost")) {
    return fromEnv.trim().replace(/\/$/, "");
  }
  return "https://luxero.win";
}
