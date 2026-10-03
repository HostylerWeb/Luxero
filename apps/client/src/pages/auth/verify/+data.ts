import type { PageContextServer } from "vike/types";

function normalizeAuthEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function data(pageContext: PageContextServer) {
  const {
    email: rawEmail,
    code: rawCode,
    verifyFailed: rawVerifyFailed,
  } = pageContext.urlParsed.search;

  const email = rawEmail ? normalizeAuthEmail(rawEmail) : null;
  const code =
    typeof rawCode === "string" && rawCode.length === 6 && /^\d{6}$/.test(rawCode) ? rawCode : null;
  const verifyFailed = rawVerifyFailed === "1";

  return { email, code, verifyFailed };
}

export type Data = Awaited<ReturnType<typeof data>>;
