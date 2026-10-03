import { describe, expect, test } from "vitest";
import { isEndingSoonCompetition, resolveEndingSoonSettings } from "../src/ending-soon";

const now = new Date("2026-05-27T12:00:00Z").getTime();

function activeCompetition(overrides: Record<string, unknown> = {}) {
  return {
    status: "active",
    endDate: "2026-05-29T12:00:00Z",
    maxTickets: 100,
    ticketsSold: 85,
    availableTickets: 15,
    ...overrides,
  };
}

describe("resolveEndingSoonSettings", () => {
  test("applies defaults for new fields", () => {
    expect(resolveEndingSoonSettings(null)).toEqual({
      daysThreshold: 7,
      ticketsThreshold: 20,
      combineMode: "or",
      timeEnabled: true,
      ticketsEnabled: true,
      ticketsMetric: "remaining",
    });
  });
});

describe("isEndingSoonCompetition", () => {
  test("OR mode matches when either condition is true", () => {
    const settings = resolveEndingSoonSettings({
      endingSoonCombineMode: "or",
      endingSoonTimeEnabled: true,
      endingSoonTicketsEnabled: true,
      endingSoonTicketsThreshold: 20,
      endingSoonTicketsMetric: "remaining",
    });

    expect(isEndingSoonCompetition(activeCompetition(), settings, now)).toBe(true);
    expect(
      isEndingSoonCompetition(
        activeCompetition({ endDate: "2026-06-30T12:00:00Z", availableTickets: 15 }),
        settings,
        now
      )
    ).toBe(true);
    expect(
      isEndingSoonCompetition(
        activeCompetition({ endDate: "2026-06-30T12:00:00Z", availableTickets: 80 }),
        settings,
        now
      )
    ).toBe(false);
  });

  test("AND mode requires all enabled conditions", () => {
    const settings = resolveEndingSoonSettings({
      endingSoonCombineMode: "and",
      endingSoonTimeEnabled: true,
      endingSoonTicketsEnabled: true,
      endingSoonTicketsThreshold: 20,
      endingSoonTicketsMetric: "remaining",
    });

    expect(isEndingSoonCompetition(activeCompetition(), settings, now)).toBe(true);
    expect(
      isEndingSoonCompetition(
        activeCompetition({ endDate: "2026-06-30T12:00:00Z", availableTickets: 15 }),
        settings,
        now
      )
    ).toBe(false);
  });

  test("sold metric uses tickets sold percentage", () => {
    const settings = resolveEndingSoonSettings({
      endingSoonCombineMode: "or",
      endingSoonTimeEnabled: false,
      endingSoonTicketsEnabled: true,
      endingSoonTicketsThreshold: 80,
      endingSoonTicketsMetric: "sold",
    });

    expect(
      isEndingSoonCompetition(
        activeCompetition({
          endDate: "2026-06-30T12:00:00Z",
          ticketsSold: 85,
          availableTickets: 15,
        }),
        settings,
        now
      )
    ).toBe(true);
    expect(
      isEndingSoonCompetition(
        activeCompetition({
          endDate: "2026-06-30T12:00:00Z",
          ticketsSold: 50,
          availableTickets: 50,
        }),
        settings,
        now
      )
    ).toBe(false);
  });

  test("respects disabled conditions", () => {
    const settings = resolveEndingSoonSettings({
      endingSoonCombineMode: "or",
      endingSoonTimeEnabled: false,
      endingSoonTicketsEnabled: false,
    });

    expect(isEndingSoonCompetition(activeCompetition(), settings, now)).toBe(false);
  });
});
