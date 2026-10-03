import { redirect } from "vike/abort";
import type { PageContextServer } from "vike/types";
import { sanitizeReturnTo } from "@/lib/guard";

function localeHref(path: string, pageContext: PageContextServer): string {
  const locale = (pageContext.locale as string) ?? "en";
  return `/${locale}${path.startsWith("/") ? path : `/${path}`}`;
}

export const guard = (pageContext: PageContextServer) => {
  const { user, urlParsed } = pageContext;
  console.log("[AuthGuard] /auth/*", {
    path: urlParsed.pathname,
    search: urlParsed.search,
    userEmail: user?.email?.substring(0, 15) ?? null,
    isAnonymous: user?.isAnonymous ?? null,
    emailVerified: user?.emailVerified ?? null,
    returnTo: urlParsed.search.returnTo ?? null,
  });

  if (!user || user.isAnonymous) {
    console.log("[AuthGuard] /auth/* → pass through (anonymous/no user)");
    return;
  }
  if (!user.emailVerified && urlParsed.pathname === "/auth/verify") {
    console.log("[AuthGuard] /auth/* → pass through (unverified on verify)");
    return;
  }

  const returnTo = sanitizeReturnTo(urlParsed.search.returnTo as string | undefined);
  const dest = localeHref(returnTo ?? "/dashboard", pageContext);
  console.log("[AuthGuard] /auth/* → redirect", { to: dest, reason: "authed user on /auth" });
  throw redirect(dest);
};
