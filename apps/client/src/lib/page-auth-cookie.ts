import type { PageContextServer } from "vike/types";

/** Cookie header for authenticated internal API calls during SSR. */
export function getPageAuthCookie(pageContext: PageContextServer): string {
  const ctx = pageContext as PageContextServer & { authCookie?: string };
  return ctx.authCookie ?? pageContext.headers?.cookie ?? "";
}
