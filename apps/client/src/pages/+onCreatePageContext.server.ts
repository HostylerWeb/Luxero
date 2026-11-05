import { getServerSession } from "@luxero/auth-admin";
import { resolveBestSessionFromCookieHeader } from "@luxero/auth-admin/resolve-best-session";
import { getEnv } from "@luxero/env/server";
import type {
  ApiResponse,
  ICart,
  Profile,
  PublicComplianceSettings,
  SessionUser,
} from "@luxero/types";
import { getDisplayName, getProfileInitials } from "@luxero/utils";
import type { PageContextServer } from "vike/types";
import { loadLocaleData, setLocaleData } from "@/lib/i18n";
import { detectLocale } from "@/lib/i18n/locale-detection";
import { serverFetch } from "@/lib/server-fetch";

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

export async function onCreatePageContext(pageContext: PageContextServer) {
  const cookie = pageContext.headers?.cookie ?? "";

  let user: SessionUser | null = null;
  let authCookie = cookie;
  try {
    const resolved = await resolveBestSessionFromCookieHeader("client", cookie);
    user = resolved.user;
    authCookie = resolved.authCookie;
  } catch {
    user = null;
  }

  let cartInitialData: ApiResponse<ICart> | null = null;
  let profileInitialData: ApiResponse<Profile> | null = null;
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

  if (user && !user.isAnonymous) {
    const [cartResult, profileResult] = await Promise.allSettled([
      serverFetch<ICart>("/api/cart", { cookieHeader: authCookie }),
      serverFetch<Profile>("/api/me/profile", { cookieHeader: authCookie }),
    ]);
    if (cartResult.status === "fulfilled") {
      cartInitialData = cartResult.value;
    }
    if (profileResult.status === "fulfilled") {
      profileInitialData = profileResult.value;
    }
  }

  const userShell = user ? await loadUserShell(user, cookie) : await emptyShell();

  const sidebarMatch = cookie.match(/sidebar_state=([^;]+)/);
  const sidebarDefaultOpen = sidebarMatch ? sidebarMatch[1] === "true" : true;

  const nonce = ((globalThis as Record<string, unknown>).__luxero_nonce as string | null) ?? null;

  const siteOrigin = getEnv("APP_URL")?.trim().replace(/\/$/, "") ?? null;

  if (!pageContext.locale) {
    pageContext.locale = detectLocale(cookie, pageContext.headers?.["accept-language"]);
  }

  const localeData = await loadLocaleData(pageContext.locale as string);
  setLocaleData(pageContext.locale as string, localeData);
  pageContext.localeData = localeData;

  Object.assign(pageContext, {
    user,
    authCookie,
    cartInitialData,
    profileInitialData,
    complianceFeaturesData,
    defaultOgImageUrl,
    referralOgImageUrl,
    defaultTitle,
    defaultDescription,
    userShell,
    sidebarDefaultOpen,
    nonce,
    siteOrigin,
  });
}

declare global {
  namespace Vike {
    interface PageContext {
      user: SessionUser | null;
      /** Prefer this over raw Cookie for authenticated serverFetch calls. */
      authCookie: string;
      cartInitialData: ApiResponse<ICart> | null;
      profileInitialData: ApiResponse<Profile> | null;
      complianceFeaturesData: ApiResponse<PublicComplianceSettings> | null;
      defaultOgImageUrl: string | null;
      referralOgImageUrl: string | null;
      defaultTitle: string | null;
      defaultDescription: string | null;
      userShell: UserShell;
      sidebarDefaultOpen: boolean;
      nonce: string | null;
      siteOrigin: string | null;
      locale: string;
      localeData: Record<string, unknown> | null;
    }
  }
}
