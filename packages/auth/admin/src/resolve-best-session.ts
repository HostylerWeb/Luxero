import { getEnv } from "@luxero/env/server";
import type { SessionUser } from "@luxero/types";
import { getSessionCookiePrefix } from "@luxero/utils";
import type { ServerAuthKind } from "./server-session";
import { getAdminAuth } from "./admin-auth";
import { getClientAuth } from "./client-auth";

export function getClientSessionCookieName(): string {
  const prefix = getSessionCookiePrefix(getEnv("APP_URL"), "client");
  return `__Secure-${prefix}.session_token`;
}

export function getAdminSessionCookieName(): string {
  const prefix = getSessionCookiePrefix(getEnv("APP_URL"), "admin");
  return `__Secure-${prefix}.session_token`;
}

function sessionCookieName(kind: ServerAuthKind): string {
  return kind === "admin" ? getAdminSessionCookieName() : getClientSessionCookieName();
}

export function parseSessionTokens(cookieHeader: string, cookieName: string): string[] {
  const tokens: string[] = [];
  for (const pair of cookieHeader.split(";")) {
    const trimmed = pair.trim();
    if (trimmed.startsWith(`${cookieName}=`)) {
      tokens.push(trimmed.slice(cookieName.length + 1));
    }
  }
  return tokens;
}

type AuthSessionResult = {
  user: SessionUser;
  session: Record<string, unknown>;
};

export type ResolvedBestSession = {
  user: SessionUser | null;
  authCookie: string;
  session: AuthSessionResult | null;
};

async function getAuth(kind: ServerAuthKind) {
  return kind === "admin" ? getAdminAuth() : getClientAuth();
}

/**
 * When multiple session_token cookies exist (e.g. guest + signed-in), Better Auth's
 * default getSession may pick the anonymous one. Prefer the first non-anonymous session.
 */
export async function resolveBestAuthSession(
  kind: ServerAuthKind,
  cookieHeader: string
): Promise<AuthSessionResult | null> {
  const resolved = await resolveBestSessionFromCookieHeader(kind, cookieHeader);
  return resolved.session;
}

export async function resolveBestSessionFromCookieHeader(
  kind: ServerAuthKind,
  cookieHeader: string
): Promise<ResolvedBestSession> {
  const empty: ResolvedBestSession = { user: null, authCookie: cookieHeader, session: null };
  if (!cookieHeader.trim()) return empty;

  const auth = await getAuth(kind);
  const cookieName = sessionCookieName(kind);
  const tokens = parseSessionTokens(cookieHeader, cookieName);

  if (tokens.length > 1) {
    let anonymousFallback: { session: AuthSessionResult; token: string } | null = null;

    for (const token of tokens) {
      const authCookie = `${cookieName}=${token}`;
      const h = new Headers();
      h.set("cookie", authCookie);
      try {
        const candidate = await auth.api.getSession({ headers: h });
        if (!candidate?.user) continue;
        const user = candidate.user as SessionUser;
        if (!user.isAnonymous) {
          return {
            user,
            authCookie,
            session: candidate as AuthSessionResult,
          };
        }
        if (!anonymousFallback) {
          anonymousFallback = { session: candidate as AuthSessionResult, token };
        }
      } catch {
        // try next token
      }
    }

    if (anonymousFallback) {
      return {
        user: anonymousFallback.session.user,
        authCookie: `${cookieName}=${anonymousFallback.token}`,
        session: anonymousFallback.session,
      };
    }
    return empty;
  }

  const h = new Headers();
  h.set("cookie", cookieHeader);
  const session = await auth.api.getSession({ headers: h });
  if (!session?.user) return empty;
  return {
    user: session.user as SessionUser,
    authCookie: cookieHeader,
    session: session as AuthSessionResult,
  };
}
