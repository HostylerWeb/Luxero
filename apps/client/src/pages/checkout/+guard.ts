import { redirect } from "vike/abort";
import type { PageContextServer } from "vike/types";

function localeHref(path: string, pageContext: PageContextServer): string {
  const locale = (pageContext.locale as string) ?? "en";
  return `/${locale}${path.startsWith("/") ? path : `/${path}`}`;
}

export const guard = (pageContext: PageContextServer) => {
  const { user } = pageContext;
  const loginUrl = localeHref(
    `/auth/login?returnTo=${localeHref("/checkout", pageContext)}`,
    pageContext
  );
  if (user === null || user === undefined) {
    throw redirect(loginUrl);
  }

  const complianceSettings = pageContext.complianceFeaturesData as {
    data?: { guestCheckoutEnabled?: boolean };
  } | null;
  if (user.isAnonymous !== false && complianceSettings?.data?.guestCheckoutEnabled === false) {
    throw redirect(loginUrl);
  }
};
