import type { PageContextServer } from "vike/types";
import { skipIfVerified } from "@/lib/guard";

export const guard = (pageContext: PageContextServer) => {
  console.log("[AuthGuard] /auth/login/page-guard", {
    path: pageContext.urlParsed.pathname,
    returnTo: pageContext.urlParsed.search.returnTo ?? null,
    userEmail: pageContext.user?.email?.substring(0, 15) ?? null,
  });
  return skipIfVerified(pageContext);
};
