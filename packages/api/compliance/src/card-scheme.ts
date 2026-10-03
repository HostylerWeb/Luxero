/** Credit schemes counted toward £250 cap and blocked on instant-win carts. */
export const CREDIT_SCHEME_IDS = [1, 3, 4, 6, 8, 11] as const;

/** Debit schemes (not subject to credit cap). */
export const DEBIT_SCHEME_IDS = [7, 10, 15, 16, 17] as const;

const CREDIT_SCHEME_NAMES: Record<number, string> = {
  1: "AMEX",
  3: "Diners",
  4: "Discover",
  6: "JCB",
  8: "MasterCard",
  11: "VISA",
};

export type CardFundingType = "credit" | "debit" | "unknown";

export function classifyCardScheme(schemeId: number): CardFundingType {
  if ((CREDIT_SCHEME_IDS as readonly number[]).includes(schemeId)) return "credit";
  if ((DEBIT_SCHEME_IDS as readonly number[]).includes(schemeId)) return "debit";
  return "unknown";
}

export function getDisabledCreditCardSchemes(): Array<{
  cardSchemeId: number;
  cardSchemeName: string;
}> {
  return CREDIT_SCHEME_IDS.map((cardSchemeId) => ({
    cardSchemeId,
    cardSchemeName: CREDIT_SCHEME_NAMES[cardSchemeId] ?? `Scheme ${cardSchemeId}`,
  }));
}

export function isCreditCardScheme(schemeId: number): boolean {
  return classifyCardScheme(schemeId) === "credit";
}
