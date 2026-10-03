import type { PageContextServer } from "vike/types";
import { requireVerified } from "@/lib/guard";

export const guard = (pageContext: PageContextServer) => requireVerified(pageContext);
