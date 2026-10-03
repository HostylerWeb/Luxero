import type { PageContextServer } from "vike/types";
import { getPathname, requireAuth } from "@/lib/guard";

const PROTECTED_PREFIXES = ["/dashboard"];

export const guard = (pageContext: PageContextServer) => {
  const pathname = getPathname(pageContext);
  if (PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    requireAuth(pageContext, pathname);
  }
};
