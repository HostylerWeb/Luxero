import { formatCurrency } from "@/lib/i18n";

export function isCashOnly(c: { isCashOnly?: boolean }): boolean {
  return c.isCashOnly === true;
}

export function getPrizeDisplayLabel(
  c: { isCashOnly?: boolean; prizeValue: number },
  options?: { t?: (key: string) => string; locale?: string; currency?: string }
): string | null {
  const t = options?.t ?? ((key: string) => key);
  const locale = options?.locale ?? "en";
  const currency = options?.currency ?? "GBP";
  if (c.isCashOnly === true) return t("competitions.detail.taxFree");
  if (!c.prizeValue || c.prizeValue <= 0) return null;
  return `${formatCurrency(c.prizeValue, locale, currency)} ${t("competitions.detail.cashAlternative")}`;
}
