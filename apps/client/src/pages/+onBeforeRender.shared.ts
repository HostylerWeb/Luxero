import type { PageContext } from "vike/types";
import { loadLocaleData, setLocaleData } from "@/lib/i18n";

export async function onBeforeRender(pageContext: PageContext) {
  const locale = pageContext.locale ?? "en";
  const localeData = await loadLocaleData(locale);
  setLocaleData(locale, localeData);
  return {
    pageContext: {
      localeData,
    },
  };
}
