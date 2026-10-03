import type { PageContextServer } from "vike/types";

export async function data(pageContext: PageContextServer) {
  const { email, code } = pageContext.urlParsed.search;
  return { email: email ?? "", code: code ?? "" };
}

export type Data = Awaited<ReturnType<typeof data>>;
