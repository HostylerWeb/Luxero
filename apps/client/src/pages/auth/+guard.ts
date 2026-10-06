import { redirect } from "vike/abort";
import type { PageContextServer } from "vike/types";
import { sanitizeReturnTo } from "@/lib/guard";

function localeHref(path: string, pageContext: PageContextServer): string {
  const locale = (pageContext.locale as string) ?? "en";
  return `/${locale}${path.startsWith("/") ? path : `/${path}`}`;
}

export const guard = (pageContext: PageContextServer) => {
  const { user, urlParsed } = pageContext;

  if (!user || user.isAnonymous) {
    return;
  }
  if (!user.emailVerified && urlParsed.pathname === "/auth/verify") {
    return;
  }

  const returnTo = sanitizeReturnTo(urlParsed.search.returnTo as string | undefined);
  const dest = localeHref(returnTo ?? "/dashboard", pageContext);
  throw redirect(dest);
};
