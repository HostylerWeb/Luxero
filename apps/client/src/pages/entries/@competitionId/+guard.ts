import { redirect } from "vike/abort";
import type { PageContextServer } from "vike/types";

function localeHref(path: string, pageContext: PageContextServer): string {
  const locale = (pageContext.locale as string) ?? "en";
  if (path.startsWith(`/${locale}/`) || path === `/${locale}`) return path;
  return `/${locale}${path.startsWith("/") ? path : `/${path}`}`;
}

export function guard(pageContext: PageContextServer) {
  const competitionId = pageContext.routeParams?.competitionId;
  if (!competitionId) return;

  const dest = `${localeHref("/entries", pageContext)}?list=${encodeURIComponent(String(competitionId))}`;
  throw redirect(dest);
}
