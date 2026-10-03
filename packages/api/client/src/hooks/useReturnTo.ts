import { buildAuthCallbackUrl, sanitizeReturnTo } from "../referral/redirect";

export function useReturnToSearchParam(
  fallback = "/dashboard",
  searchParams?: URLSearchParams | null
) {
  const sp =
    searchParams ??
    new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const raw = sp?.get("returnTo");
  const returnTo = sanitizeReturnTo(raw);
  const callbackURL = buildAuthCallbackUrl(raw, fallback);
  return { raw, returnTo, callbackURL };
}
