import type { Winner } from "@luxero/types";
import type { PageContextServer } from "vike/types";
import { serverFetch } from "@/lib/server-fetch";

async function jsonFetch<T>(path: string, cookie: string): Promise<T | null> {
  const res = await serverFetch<T>(path, { cookieHeader: cookie });
  return res?.data ?? null;
}

export async function data(pageContext: PageContextServer) {
  const cookie = pageContext.headers?.cookie ?? "";

  const winners = await jsonFetch<Winner[]>("/api/winners", cookie);

  return {
    winners: winners ?? [],
  };
}

export type Data = Awaited<ReturnType<typeof data>>;
