const REFERRAL_COOKIE_NAME = "ref_code";
const REFERRAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export function setReferralCookieOptions(refCode: string): {
  name: string;
  value: string;
  path: string;
  sameSite: "lax";
  secure: true;
  expires: number;
} {
  const maxAge = REFERRAL_COOKIE_MAX_AGE;
  const expires = Date.now() + maxAge * 1000;
  return {
    name: REFERRAL_COOKIE_NAME,
    value: refCode,
    path: "/",
    sameSite: "lax",
    secure: true,
    expires,
  };
}

/** Legacy string-based setter for environments without CookieStore (server-side) */
export function setReferralCookie(refCode: string): string {
  const maxAge = REFERRAL_COOKIE_MAX_AGE;
  return `${REFERRAL_COOKIE_NAME}=${refCode}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

export function getReferralCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(";").map((c) => c.trim());
  for (const cookie of cookies) {
    const [name, value] = cookie.split("=");
    if (name === REFERRAL_COOKIE_NAME) return value ?? null;
  }
  return null;
}

export function getReferralCodeFromCookie(): string | null {
  const doc = (globalThis as typeof globalThis & { document?: { cookie?: string } }).document;
  const cookie = doc?.cookie;
  if (!cookie) return null;
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${REFERRAL_COOKIE_NAME}=([^;]*)`));
  return match ? (match[1] ?? null) : null;
}

export { REFERRAL_COOKIE_NAME };
