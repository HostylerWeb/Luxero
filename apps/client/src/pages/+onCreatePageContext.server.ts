import { getServerSession } from "@luxero/auth-admin";
import { getEnv } from "@luxero/env/server";
import type { ApiResponse, ICart, PublicComplianceSettings, SessionUser } from "@luxero/types";
import { getDisplayName, getProfileInitials, getSessionCookiePrefix } from "@luxero/utils";
import type { PageContextServer } from "vike/types";
import { loadLocaleData, setLocaleData } from "@/lib/i18n";
import { detectLocale } from "@/lib/i18n/locale-detection";
import { serverFetch } from "@/lib/server-fetch";

const CLIENT_COOKIE_PREFIX = getSessionCookiePrefix(getEnv("APP_URL"), "client");
const SESSION_COOKIE_NAME = `__Secure-${CLIENT_COOKIE_PREFIX}.session_token`;

interface UserShell {
  user: SessionUser | null;
  displayName: string;
  initials: string;
}

async function emptyShell(): Promise<UserShell> {
  return { user: null, displayName: "", initials: "" };
}

async function loadUserShell(user: SessionUser, _cookie: string): Promise<UserShell> {
  const displayName = getDisplayName(
    { firstName: user.firstName, lastName: user.lastName },
    user.email
  );
  const initials = getProfileInitials({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  });

  return { user, displayName, initials };
}

function parseSessionTokens(cookieHeader: string): string[] {
  const tokens: string[] = [];
  for (const pair of cookieHeader.split(";")) {
    const trimmed = pair.trim();
    if (trimmed.startsWith(`${SESSION_COOKIE_NAME}=`)) {
      tokens.push(trimmed.slice(SESSION_COOKIE_NAME.length + 1));
    }
  }
  return tokens;
}

async function resolveBestSession(cookie: string): Promise<SessionUser | null> {
  const headers = new Headers();
  if (cookie) headers.set("cookie", cookie);

  // First attempt: pass the raw cookie header — Better Auth picks the first
  // matching session token. This handles the normal single-cookie case.
  const user = await getServerSession("client", headers);
  if (user) return user;

  // If getSession returned null but there are multiple session tokens (e.g. an
  // old revoked anonymous token + a new Google-authenticated token), try each
  // token individually. The browser may send both; Better Auth's internal
  // parsing picks the first one, which could be the stale one.
  const tokens = parseSessionTokens(cookie);
  if (tokens.length <= 1) return null;

  for (const token of tokens) {
    const h = new Headers();
    h.set("cookie", `${SESSION_COOKIE_NAME}=${token}`);
    try {
      const candidate = await getServerSession("client", h);
      if (candidate) {
        return candidate;
      }
    } catch {
      // Token failed, try the next one
    }
  }

  return null;
}

export async function onCreatePageContext(pageContext: PageContextServer) {
  const cookie = pageContext.headers?.cookie ?? "";

  let user: SessionUser | null = null;
  try {
    user = await resolveBestSession(cookie);
  } catch {
    user = null;
  }

  let cartInitialData: ApiResponse<ICart> | null = null;
  let complianceFeaturesData: ApiResponse<PublicComplianceSettings> | null = null;
  let defaultOgImageUrl: string | null = null;
  let referralOgImageUrl: string | null = null;
  let defaultTitle: string | null = null;
  let defaultDescription: string | null = null;

  await Promise.allSettled([
    serverFetch<PublicComplianceSettings>("/api/compliance-settings", {
      cookieHeader: cookie,
    }).then((res) => {
      complianceFeaturesData = res;
    }),
    serverFetch<{
      defaultOgImageUrl?: string;
      referralOgImageUrl?: string;
      defaultTitle?: string;
      defaultDescription?: string;
    }>("/api/seo-settings", { cookieHeader: cookie }).then((res) => {
      if (res?.data) {
        defaultOgImageUrl = res.data.defaultOgImageUrl ?? null;
        referralOgImageUrl = res.data.referralOgImageUrl ?? null;
        defaultTitle = res.data.defaultTitle ?? null;
        defaultDescription = res.data.defaultDescription ?? null;
      }
    }),
  ]);

  if (user) {
    try {
      cartInitialData = await serverFetch<ICart>("/api/cart", { cookieHeader: cookie });
    } catch {
      cartInitialData = null;
    }
  }

  const userShell = user ? await loadUserShell(user, cookie) : await emptyShell();

  const sidebarMatch = cookie.match(/sidebar_state=([^;]+)/);
  const sidebarDefaultOpen = sidebarMatch ? sidebarMatch[1] === "true" : true;

  const nonce = ((globalThis as Record<string, unknown>).__luxero_nonce as string | null) ?? null;

  if (!pageContext.locale) {
    pageContext.locale = detectLocale(cookie, pageContext.headers?.["accept-language"]);
  }

  const localeData = await loadLocaleData(pageContext.locale as string);
  setLocaleData(pageContext.locale as string, localeData);
  pageContext.localeData = localeData;

  Object.assign(pageContext, {
    user,
    cartInitialData,
    complianceFeaturesData,
    defaultOgImageUrl,
    referralOgImageUrl,
    defaultTitle,
    defaultDescription,
    userShell,
    sidebarDefaultOpen,
    nonce,
  });
}

declare global {
  namespace Vike {
    interface PageContext {
      user: SessionUser | null;
      cartInitialData: ApiResponse<ICart> | null;
      complianceFeaturesData: ApiResponse<PublicComplianceSettings> | null;
      defaultOgImageUrl: string | null;
      referralOgImageUrl: string | null;
      defaultTitle: string | null;
      defaultDescription: string | null;
      userShell: UserShell;
      sidebarDefaultOpen: boolean;
      nonce: string | null;
      locale: string;
      localeData: Record<string, unknown> | null;
    }
  }
}
