import { describe, expect, test } from "vitest";
import { formatTierLabel, resolveTierTickets } from "./referral-tier-math";
import {
  calculateTierGrant,
  DEFAULT_TIERS,
  findCurrentTier,
  findNextTier,
  getReferralActivityWindowEnd,
  previewTierLadder,
  sortTiers,
} from "./tier-ladder";
import type { ReferralTier } from "./types";

describe("tier-ladder", () => {
  describe("sortTiers", () => {
    test("sorts tiers by threshold ascending", () => {
      const input: ReferralTier[] = [
        { threshold: 10, tickets: 5 },
        { threshold: 5, tickets: 2 },
        { threshold: 15, tickets: 10 },
      ];
      const sorted = sortTiers(input);
      expect(sorted.map((t) => t.threshold)).toEqual([5, 10, 15]);
    });

    test("does not mutate the input array", () => {
      const input: ReferralTier[] = [
        { threshold: 10, tickets: 5 },
        { threshold: 5, tickets: 2 },
      ];
      sortTiers(input);
      expect(input[0].threshold).toBe(10);
    });
  });

  describe("findCurrentTier", () => {
    const tiers = DEFAULT_TIERS;

    test("returns null for count below first threshold", () => {
      expect(findCurrentTier(0, tiers)).toBeNull();
      expect(findCurrentTier(4, tiers)).toBeNull();
    });

    test("returns tier when count exactly matches threshold", () => {
      const tier = findCurrentTier(5, tiers);
      expect(tier).not.toBeNull();
      expect(tier!.tickets).toBe(2);
    });

    test("returns the highest matching tier", () => {
      const tier = findCurrentTier(15, tiers);
      expect(tier).not.toBeNull();
      expect(tier!.tickets).toBe(10);

      const tier2 = findCurrentTier(20, tiers);
      expect(tier2).not.toBeNull();
      expect(tier2!.tickets).toBe(10);
    });

    test("returns correct mid-range tier", () => {
      const tier = findCurrentTier(10, tiers);
      expect(tier).not.toBeNull();
      expect(tier!.tickets).toBe(5);
    });

    test("returns null for empty tiers array", () => {
      expect(findCurrentTier(5, [])).toBeNull();
    });

    test("handles unsorted input", () => {
      const unsorted: ReferralTier[] = [
        { threshold: 15, tickets: 10 },
        { threshold: 5, tickets: 2 },
      ];
      expect(findCurrentTier(10, unsorted)?.tickets).toBe(2);
    });
  });

  describe("findNextTier", () => {
    const tiers = DEFAULT_TIERS;

    test("returns first tier when count is 0", () => {
      expect(findNextTier(0, tiers)?.threshold).toBe(5);
    });

    test("returns next tier when count is between thresholds", () => {
      expect(findNextTier(7, tiers)?.threshold).toBe(10);
    });

    test("returns null when count is above max threshold", () => {
      expect(findNextTier(20, tiers)).toBeNull();
    });
  });

  describe("resolveTierTickets", () => {
    const tiers = DEFAULT_TIERS;

    test("returns 0 for count below first threshold", () => {
      expect(resolveTierTickets(0, tiers)).toBe(0);
      expect(resolveTierTickets(4, tiers)).toBe(0);
    });

    test("returns correct ticket count for each tier", () => {
      expect(resolveTierTickets(5, tiers)).toBe(2);
      expect(resolveTierTickets(10, tiers)).toBe(5);
      expect(resolveTierTickets(15, tiers)).toBe(10);
    });

    test("returns max tier tickets for counts above max", () => {
      expect(resolveTierTickets(100, tiers)).toBe(10);
    });

    test("returns 0 for empty tiers", () => {
      expect(resolveTierTickets(5, [])).toBe(0);
    });
  });

  describe("calculateTierGrant", () => {
    const tiers = DEFAULT_TIERS;

    test("returns 0 tickets when below first threshold", () => {
      const result = calculateTierGrant({
        validActiveReferees: 3,
        tiers,
        profileMultiplier: 1,
        calculusMethod: "net",
      });
      expect(result.tickets).toBe(0);
      expect(result.tier).toBeNull();
    });

    test("calculates grant with multiplier", () => {
      const result = calculateTierGrant({
        validActiveReferees: 10,
        tiers,
        profileMultiplier: 1.5,
        calculusMethod: "net",
      });
      expect(result.tickets).toBe(8); // round(5 * 1.5) = 8
      expect(result.tier?.tickets).toBe(5);
      expect(result.effectiveRate).toBe(7.5);
    });

    test("handles per-tier multiplierOverride", () => {
      const customTiers: ReferralTier[] = [
        { threshold: 5, tickets: 2, multiplierOverride: 3 },
        { threshold: 10, tickets: 5 },
      ];
      const result = calculateTierGrant({
        validActiveReferees: 5,
        tiers: customTiers,
        profileMultiplier: 1,
        calculusMethod: "net",
      });
      expect(result.tickets).toBe(6); // 2 * 3 = 6
    });

    test("uses profileMultiplier when tier has no override", () => {
      const customTiers: ReferralTier[] = [
        { threshold: 5, tickets: 2, multiplierOverride: null },
        { threshold: 10, tickets: 5 },
      ];
      // At 10+ referees with max tier = 10:5 tickets
      const result = calculateTierGrant({
        validActiveReferees: 10,
        tiers: customTiers,
        profileMultiplier: 2,
        calculusMethod: "net",
      });
      expect(result.tickets).toBe(10); // 5 * 2 = 10
    });

    test("handles multiplier = 0", () => {
      const result = calculateTierGrant({
        validActiveReferees: 10,
        tiers,
        profileMultiplier: 0,
        calculusMethod: "net",
      });
      expect(result.tickets).toBe(0);
    });

    test("rounds up correctly", () => {
      const result = calculateTierGrant({
        validActiveReferees: 10,
        tiers,
        profileMultiplier: 2.5,
        calculusMethod: "net",
      });
      expect(result.tickets).toBe(13); // round(5 * 2.5) = 13
    });
  });

  describe("formatTierLabel", () => {
    const tiers = DEFAULT_TIERS;

    test("returns empty string when below all thresholds", () => {
      expect(formatTierLabel(0, tiers)).toBe("");
    });

    test("formats the matching tier with label", () => {
      const label = formatTierLabel(7, tiers);
      expect(label).toContain("2 tickets tier");
      expect(label).toContain("5+");
    });

    test("uses custom label if set", () => {
      const customTiers: ReferralTier[] = [{ threshold: 5, tickets: 2, label: "Bronze" }];
      const label = formatTierLabel(7, customTiers);
      expect(label).toContain("Bronze");
    });
  });

  describe("getReferralActivityWindowEnd", () => {
    test("adds N days to the date", () => {
      const start = new Date("2026-01-01T00:00:00.000Z");
      const end = getReferralActivityWindowEnd(start, 30);
      expect(end.toISOString()).toBe("2026-01-31T00:00:00.000Z");
    });
  });

  describe("previewTierLadder", () => {
    const tiers = DEFAULT_TIERS;

    test("returns previews for example counts", () => {
      const previews = previewTierLadder(tiers, [0, 5, 10, 20], 1, "net");
      expect(previews).toHaveLength(4);
      expect(previews[0].isReached).toBe(false);
      expect(previews[0].effectiveTickets).toBe(0);
      expect(previews[1].isReached).toBe(true);
      expect(previews[1].effectiveTickets).toBe(2);
      expect(previews[2].effectiveTickets).toBe(5);
      expect(previews[3].effectiveTickets).toBe(10);
    });

    test("applies multiplier to effective tickets", () => {
      const previews = previewTierLadder(tiers, [5, 10], 2, "net");
      expect(previews[0].effectiveTickets).toBe(4); // 2 * 2
      expect(previews[1].effectiveTickets).toBe(10); // 5 * 2
    });

    test("marks the highest reached tier as current", () => {
      const previews = previewTierLadder(tiers, [12], 1, "net");
      expect(previews[0].isCurrent).toBe(true);
    });
  });
});
