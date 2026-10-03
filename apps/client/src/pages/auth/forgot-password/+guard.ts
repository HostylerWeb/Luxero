import type { PageContextServer } from "vike/types";
import { skipIfVerified } from "@/lib/guard";

export const guard = (pageContext: PageContextServer) => skipIfVerified(pageContext);
