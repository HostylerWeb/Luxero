import { redirect } from "vike/abort";
import type { PageContextServer } from "vike/types";

export default function ReferralPage({ code }: { code: string }) {
  throw redirect(`/?ref=${code}`);
}

export const guard = (pageContext: PageContextServer) => {
  const locale = (pageContext.locale as string) ?? "en";
  const code = pageContext.routeParams?.code;
  if (code) {
    throw redirect(`/${locale}/?ref=${code}`);
  }
};
