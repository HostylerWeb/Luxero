const AFFILIATE_COOKIE_PREFIX = "_aff_";
const MAX_AGE_DAYS = 30;

const AFFILIATE_PARAMS = [
  "clickid",
  "atclid",
  "subid_short",
  "source",
  "pubid",
  "zone",
  "payout",
  "campaignid",
  "device",
  "country",
  "creativeid",
  "ref",
] as const;

const AFFILIATE_PARAM_ALIASES: Record<string, string> = {
  atclid: "clickid",
  subid_short: "clickid",
};

function resolveCookieName(param: string): string {
  return AFFILIATE_PARAM_ALIASES[param] ?? param;
}

function setCookie(name: string, value: string, days: number): void {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${AFFILIATE_COOKIE_PREFIX}${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${AFFILIATE_COOKIE_PREFIX}${name}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1] ?? "") : null;
}

export function captureAffiliateParams(): void {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);

  for (const param of AFFILIATE_PARAMS) {
    const value = params.get(param) ?? "";
    if (value) {
      setCookie(resolveCookieName(param), value, MAX_AGE_DAYS);
    }
  }
}

export function getAffiliateClickId(): string | null {
  if (typeof window === "undefined") return null;
  return getCookie("clickid");
}

export function getAffiliateSource(): string | null {
  if (typeof window === "undefined") return null;
  return getCookie("source");
}

export function getAffiliateCookieHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const headers: Record<string, string> = {};
  const clickId = getCookie("clickid");
  if (clickId) headers["X-Affiliate-Clickid"] = clickId;
  const source = getCookie("source");
  if (source) headers["X-Affiliate-Source"] = source;
  return headers;
}

export function getAffiliateData(): Record<string, string> {
  if (typeof window === "undefined") return {};

  const data: Record<string, string> = {};
  for (const param of AFFILIATE_PARAMS) {
    const value = getCookie(resolveCookieName(param));
    if (value) {
      data[param] = value;
    }
  }
  return data;
}
