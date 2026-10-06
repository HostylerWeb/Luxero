import { redirect } from "vike/abort";
import type { PageContextServer } from "vike/types";

function localeHref(path: string, pageContext: PageContextServer): string {
  const locale = (pageContext.locale as string) ?? "en";
  return `/${locale}${path.startsWith("/") ? path : `/${path}`}`;
}

export function getPathname(pageContext: PageContextServer): string {
  const urlLogical = (pageContext as any).urlLogical as string | undefined;
  if (urlLogical) {
    const qsIndex = urlLogical.indexOf("?");
    return qsIndex >= 0 ? urlLogical.slice(0, qsIndex) : urlLogical;
  }
  return pageContext.urlParsed.pathname;
}

export function sanitizeReturnTo(path: string | undefined | null): string | null {
  if (!path) return null;
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  if (path.startsWith("/auth/")) return null;
  return path;
}

export function requireAuth(pageContext: PageContextServer, returnTo?: string): void {
  const { user } = pageContext;
  if (user?.isAnonymous !== false) {
    const loginPath = returnTo
      ? `/auth/login?returnTo=${encodeURIComponent(returnTo)}`
      : "/auth/login";
    const dest = localeHref(loginPath, pageContext);
    throw redirect(dest);
  }
}

export function requireVerified(pageContext: PageContextServer): void {
  const { user } = pageContext;
  if (user?.isAnonymous !== false) {
    const dest = localeHref("/auth/login", pageContext);
    throw redirect(dest);
  }
  if (user.emailVerified !== true && user.email) {
    const verifyPath = `/auth/verify?email=${encodeURIComponent(user.email)}&returnTo=${localeHref("/dashboard", pageContext)}`;
    throw redirect(verifyPath);
  }
}

export function skipIfVerified(pageContext: PageContextServer): void {
  const { user } = pageContext;
  if (user && user.isAnonymous === false && user.emailVerified) {
    const dest = localeHref("/dashboard", pageContext);
    throw redirect(dest);
  }
}

export function skipIfAuthenticated(pageContext: PageContextServer): void {
  const { user, urlParsed } = pageContext;
  if (user?.isAnonymous !== false) {
    return;
  }
  if (user.emailVerified) {
    const returnTo = sanitizeReturnTo(urlParsed.search.returnTo as string | undefined);
    const dest = localeHref(returnTo ?? "/dashboard", pageContext);
    throw redirect(dest);
  }
}
