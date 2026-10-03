import { translate } from "@/lib/i18n";

export default (pageContext: { locale?: string }): string => {
  const locale = pageContext.locale ?? "en";
  return translate("checkout.meta.title", undefined, locale);
};
