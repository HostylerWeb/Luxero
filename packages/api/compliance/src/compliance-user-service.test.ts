import { describe, expect, test } from "vitest";
import { calculateAgeFromDob, isDobMeetsMinAge, parseDateOfBirthInput } from "./age-verification";
import {
  CREDIT_SCHEME_IDS,
  classifyCardScheme,
  getDisabledCreditCardSchemes,
  isCreditCardScheme,
} from "./card-scheme";
import {
  resolveEffectiveSelfExclusion,
  resolveSelfExclusionUntil,
} from "./compliance-user-service";

describe("age-verification", () => {
  describe("calculateAgeFromDob", () => {
    test("computes full years between dob and reference date", () => {
      const dob = new Date("1990-01-01");
      const ref = new Date("2026-01-01");
      expect(calculateAgeFromDob(dob, ref)).toBe(36);
    });

    test("subtracts one year when birthday has not occurred yet in the reference year", () => {
      const dob = new Date("1990-12-31");
      const ref = new Date("2026-06-01");
      expect(calculateAgeFromDob(dob, ref)).toBe(35);
    });

    test("treats same-day birthday as the birthday", () => {
      const dob = new Date("2000-06-03");
      const ref = new Date("2026-06-03");
      expect(calculateAgeFromDob(dob, ref)).toBe(26);
    });
  });

  describe("isDobMeetsMinAge", () => {
    test("returns true for adults", () => {
      const dob = new Date("1990-01-01");
      const _ref = new Date("2026-01-01");
      expect(isDobMeetsMinAge(dob, 18)).toBe(true);
    });

    test("returns false for minors", () => {
      const dob = new Date("2010-01-01");
      const _ref = new Date("2026-01-01");
      expect(isDobMeetsMinAge(dob, 18)).toBe(false);
    });
  });

  describe("parseDateOfBirthInput", () => {
    test("parses valid ISO date strings", () => {
      expect(parseDateOfBirthInput("1990-01-01")).toEqual(new Date("1990-01-01"));
    });

    test("returns null for invalid input", () => {
      expect(parseDateOfBirthInput("not-a-date")).toBeNull();
    });
  });
});

describe("card-scheme", () => {
  test("classifyCardScheme returns 'credit' for credit scheme ids", () => {
    for (const id of CREDIT_SCHEME_IDS) {
      expect(classifyCardScheme(id)).toBe("credit");
    }
  });

  test("classifyCardScheme returns 'debit' for debit scheme ids", () => {
    expect(classifyCardScheme(7)).toBe("debit");
    expect(classifyCardScheme(10)).toBe("debit");
    expect(classifyCardScheme(15)).toBe("debit");
  });

  test("classifyCardScheme returns 'unknown' for unrecognised scheme ids", () => {
    expect(classifyCardScheme(99)).toBe("unknown");
    expect(classifyCardScheme(0)).toBe("unknown");
  });

  test("isCreditCardScheme agrees with classifyCardScheme", () => {
    for (const id of CREDIT_SCHEME_IDS) {
      expect(isCreditCardScheme(id)).toBe(true);
    }
    expect(isCreditCardScheme(7)).toBe(false);
  });

  test("getDisabledCreditCardSchemes returns the full list with human names", () => {
    const result = getDisabledCreditCardSchemes();
    expect(result).toHaveLength(CREDIT_SCHEME_IDS.length);
    for (const entry of result) {
      expect(entry.cardSchemeName).toBeTruthy();
    }
  });
});

describe("self-exclusion resolution", () => {
  describe("resolveSelfExclusionUntil", () => {
    test("returns a date ~6 months in the future for 6months", () => {
      const result = resolveSelfExclusionUntil("6months", 6);
      expect(result).toBeInstanceOf(Date);
      const monthsAhead = (result!.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30);
      expect(monthsAhead).toBeGreaterThanOrEqual(5.9);
      expect(monthsAhead).toBeLessThanOrEqual(6.2);
    });

    test("returns null for permanent exclusion", () => {
      expect(resolveSelfExclusionUntil("permanent", 6)).toBeNull();
    });
  });

  describe("resolveEffectiveSelfExclusion", () => {
    test("returns effective:false when selfExcluded is false", () => {
      const result = resolveEffectiveSelfExclusion({
        selfExcluded: false,
        selfExcludedUntil: null,
      });
      expect(result.effective).toBe(false);
    });

    test("returns effective:true and isPermanent:true for null until", () => {
      const result = resolveEffectiveSelfExclusion({
        selfExcluded: true,
        selfExcludedUntil: null,
      });
      expect(result.effective).toBe(true);
      expect(result.isPermanent).toBe(true);
    });

    test("returns effective:true for future until date", () => {
      const future = new Date(Date.now() + 1000 * 60 * 60 * 24);
      const result = resolveEffectiveSelfExclusion({
        selfExcluded: true,
        selfExcludedUntil: future,
      });
      expect(result.effective).toBe(true);
      expect(result.isPermanent).toBe(false);
      expect(result.until).toBe(future);
    });

    test("returns effective:false for past until date", () => {
      const past = new Date(Date.now() - 1000 * 60 * 60 * 24);
      const result = resolveEffectiveSelfExclusion({
        selfExcluded: true,
        selfExcludedUntil: past,
      });
      expect(result.effective).toBe(false);
    });
  });
});
