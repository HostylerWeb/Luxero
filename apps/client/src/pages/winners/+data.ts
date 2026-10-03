import type { Winner } from "@luxero/types";
import type { PageContextServer } from "vike/types";
import { serverFetch } from "@/lib/server-fetch";

async function jsonFetch<T>(path: string, cookie: string): Promise<T | null> {
  const res = await serverFetch<T>(path, { cookieHeader: cookie });
  return res?.data ?? null;
}

export async function data(pageContext: PageContextServer) {
  const cookie = pageContext.headers?.cookie ?? "";

  const [winners, stats] = await Promise.all([
    jsonFetch<Winner[]>("/api/winners", cookie),
    jsonFetch<{ totalWinners: number; totalPrizeValue: number; totalWinnersAllTime: number }>(
      "/api/winners/stats",
      cookie
    ),
  ]);

  return {
    winners: winners ?? [],
    stats: stats ?? null,
  };
}

export type Data = Awaited<ReturnType<typeof data>>;
