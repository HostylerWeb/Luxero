import type { SessionUser } from "@luxero/types";
import { resolveBestAuthSession } from "./resolve-best-session";

export type ServerAuthKind = "client" | "admin";

type HeaderSource = Headers | Request | (() => Headers | Promise<Headers>);

async function resolveHeaders(source?: HeaderSource): Promise<Headers> {
  if (!source) return new Headers();
  if (typeof source === "function") return source();
  if (source instanceof Request) return source.headers;
  return source;
}

export async function getServerSession(
  kind: ServerAuthKind = "client",
  headerSource?: HeaderSource
): Promise<SessionUser | null> {
  const h = await resolveHeaders(headerSource);
  const cookie = h.get("cookie") ?? "";
  const session = await resolveBestAuthSession(kind, cookie);
  return session?.user ?? null;
}

export async function getServerAuthSession(
  kind: ServerAuthKind = "client",
  headerSource?: HeaderSource
) {
  const h = await resolveHeaders(headerSource);
  const cookie = h.get("cookie") ?? "";
  return resolveBestAuthSession(kind, cookie);
}

export async function requireServerAdmin(headerSource?: HeaderSource): Promise<SessionUser> {
  const user = await getServerSession("admin", headerSource);
  if (!user) {
    throw new Error("[Auth] No session — redirect to login");
  }
  if (user.role !== "admin" && user.role !== "manager") {
    throw new Error("[Auth] Not staff — redirect to access-denied");
  }
  return user;
}
