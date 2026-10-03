export const SUPPORTED_LOCALES = ["en", "ro"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const LOCALE_PREFIXES: Record<Locale, string> = {
  en: "/en",
  ro: "/ro",
};
export const localeDefault: Locale = "en";
