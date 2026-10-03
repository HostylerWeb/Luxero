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
  console.log("[AuthGuard] requireAuth", {
    path: pageContext.urlParsed.pathname,
    userEmail: user?.email?.substring(0, 15) ?? null,
    isAnonymous: user?.isAnonymous ?? null,
    returnTo,
  });
  if (user?.isAnonymous !== false) {
    const loginPath = returnTo
      ? `/auth/login?returnTo=${encodeURIComponent(returnTo)}`
      : "/auth/login";
    const dest = localeHref(loginPath, pageContext);
    console.log("[AuthGuard] requireAuth → redirect", { to: dest, reason: "anonymous/no user" });
    throw redirect(dest);
  }
  console.log("[AuthGuard] requireAuth → pass");
}

export function requireVerified(pageContext: PageContextServer): void {
  const { user } = pageContext;
  console.log("[AuthGuard] requireVerified", {
    path: pageContext.urlParsed.pathname,
    userEmail: user?.email?.substring(0, 15) ?? null,
    isAnonymous: user?.isAnonymous ?? null,
    emailVerified: user?.emailVerified ?? null,
  });
  if (user?.isAnonymous !== false) {
    const dest = localeHref("/auth/login", pageContext);
    console.log("[AuthGuard] requireVerified → redirect", {
      to: dest,
      reason: "anonymous/no user",
    });
    throw redirect(dest);
  }
  if (user.emailVerified !== true && user.email) {
    const verifyPath = `/auth/verify?email=${encodeURIComponent(user.email)}&returnTo=${localeHref("/dashboard", pageContext)}`;
    console.log("[AuthGuard] requireVerified → redirect", {
      to: verifyPath,
      reason: "email not verified",
    });
    throw redirect(verifyPath);
  }
  console.log("[AuthGuard] requireVerified → pass");
}

export function skipIfVerified(pageContext: PageContextServer): void {
  const { user } = pageContext;
  console.log("[AuthGuard] skipIfVerified", {
    path: pageContext.urlParsed.pathname,
    userEmail: user?.email?.substring(0, 15) ?? null,
    isAnonymous: user?.isAnonymous ?? null,
    emailVerified: user?.emailVerified ?? null,
  });
  if (user && user.isAnonymous === false && user.emailVerified) {
    const dest = localeHref("/dashboard", pageContext);
    console.log("[AuthGuard] skipIfVerified → redirect", {
      to: dest,
      reason: "already verified",
    });
    throw redirect(dest);
  }
  console.log("[AuthGuard] skipIfVerified → pass");
}

export function skipIfAuthenticated(pageContext: PageContextServer): void {
  const { user, urlParsed } = pageContext;
  console.log("[AuthGuard] skipIfAuthenticated", {
    path: urlParsed.pathname,
    userEmail: user?.email?.substring(0, 15) ?? null,
    isAnonymous: user?.isAnonymous ?? null,
    emailVerified: user?.emailVerified ?? null,
  });
  if (user?.isAnonymous !== false) {
    console.log("[AuthGuard] skipIfAuthenticated → pass (anonymous)");
    return;
  }
  if (user.emailVerified) {
    const returnTo = sanitizeReturnTo(urlParsed.search.returnTo as string | undefined);
    const dest = localeHref(returnTo ?? "/dashboard", pageContext);
    console.log("[AuthGuard] skipIfAuthenticated → redirect", { to: dest, reason: "authed" });
    throw redirect(dest);
  }
  console.log("[AuthGuard] skipIfAuthenticated → pass");
}
