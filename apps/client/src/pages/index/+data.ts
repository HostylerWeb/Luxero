import type { Category, Competition, HomepageLayoutSettings, Winner } from "@luxero/types";
import type { EndingSoonSettings } from "@luxero/utils";
import type { PageContextServer } from "vike/types";
import { serverFetch } from "@/lib/server-fetch";

async function jsonFetch<T>(path: string, cookie: string): Promise<T | null> {
  const res = await serverFetch<T>(path, { cookieHeader: cookie });
  return res?.data ?? null;
}

export async function data(pageContext: PageContextServer) {
  const cookie = pageContext.headers?.cookie ?? "";

  const [
    featured,
    layoutSettings,
    categories,
    competitions,
    allCompetitions,
    endingSoonSettings,
    winners,
  ] = await Promise.all([
    jsonFetch<Competition[]>("/api/competitions/featured", cookie),
    jsonFetch<HomepageLayoutSettings>("/api/homepage-layout-settings", ""),
    jsonFetch<Category[]>("/api/competitions/categories", ""),
    jsonFetch<Competition[]>("/api/competitions?limit=24", ""),
    jsonFetch<Competition[]>("/api/competitions?limit=100", ""),
    jsonFetch<EndingSoonSettings>("/api/ending-soon-settings", ""),
    jsonFetch<Winner[]>("/api/winners?limit=5", ""),
  ]);

  return {
    featuredCompetitions: featured ?? [],
    layoutSettings: layoutSettings ?? null,
    categories: categories ?? [],
    competitions: competitions ?? [],
    allCompetitions: allCompetitions ?? [],
    endingSoonSettings: endingSoonSettings ?? null,
    winners: winners ?? [],
  };
}

export type Data = Awaited<ReturnType<typeof data>>;
