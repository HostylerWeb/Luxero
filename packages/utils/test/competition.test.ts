import { describe, expect, test } from "vitest";
import {
  clampCartQuantity,
  formatMaxTicketsReason,
  getAvailableTickets,
  getGrantedTicketIds,
  getMaxCartQuantity,
  getMaxPurchasable,
  getProgress,
  getTicketsTaken,
} from "../src/competition";

describe("competition ticket helpers", () => {
  test("getAvailableTickets subtracts sold and held from max", () => {
    const comp = { maxTickets: 100, ticketsSold: 50, ticketsHeld: 10 };
    expect(getAvailableTickets(comp)).toBe(40);
    expect(getTicketsTaken(comp)).toBe(60);
  });

  test("getAvailableTickets prefers API-enriched availableTickets", () => {
    const comp = { maxTickets: 100, ticketsSold: 50, ticketsHeld: 10, availableTickets: 35 };
    expect(getAvailableTickets(comp)).toBe(35);
  });

  test("progress from taken aligns with remaining from available", () => {
    const comp = { maxTickets: 100, ticketsSold: 50, ticketsHeld: 10 };
    const taken = getTicketsTaken(comp);
    const remaining = getAvailableTickets(comp);
    const progress = getProgress(taken, comp.maxTickets!);
    expect(taken + remaining).toBe(100);
    expect(progress).toBe(60);
  });

  test("getGrantedTicketIds prefers grantedTicketIds over grantedEntryIds", () => {
    expect(getGrantedTicketIds({ grantedTicketIds: ["a"], grantedEntryIds: ["b"] })).toEqual(["a"]);
    expect(getGrantedTicketIds({ grantedEntryIds: ["legacy"] })).toEqual(["legacy"]);
    expect(getGrantedTicketIds({})).toEqual([]);
  });

  test("getMaxCartQuantity caps by pool and personal limits", () => {
    expect(
      getMaxCartQuantity({
        liveAvailable: 50,
        maxPerUser: 10,
        userOwned: 8,
        currentInCart: 1,
      })
    ).toBe(2);

    expect(
      getMaxCartQuantity({
        liveAvailable: 5598,
        maxPerUser: 1000,
        userOwned: 0,
        currentInCart: 599,
      })
    ).toBe(1000);

    expect(
      getMaxCartQuantity({
        liveAvailable: 100,
        maxPerUser: 1000,
        userOwned: 0,
        currentInCart: 599,
      })
    ).toBe(699);
  });

  test("getMaxPurchasable returns remaining addable tickets", () => {
    expect(
      getMaxPurchasable({
        liveAvailable: 50,
        maxPerUser: 10,
        userOwned: 8,
        currentInCart: 1,
      })
    ).toBe(1);

    expect(
      getMaxPurchasable({
        liveAvailable: 5598,
        maxPerUser: 1000,
        userOwned: 0,
        currentInCart: 599,
      })
    ).toBe(401);

    expect(
      getMaxPurchasable({
        liveAvailable: 100,
        maxPerUser: 1000,
        userOwned: 1000,
        currentInCart: 0,
      })
    ).toBe(0);

    expect(
      getMaxPurchasable({
        liveAvailable: 0,
        maxPerUser: 10,
        userOwned: 0,
        currentInCart: 0,
      })
    ).toBe(0);
  });

  test("clampCartQuantity enforces absolute cart maximum", () => {
    const limits = {
      liveAvailable: 5598,
      maxPerUser: 1000,
      userOwned: 0,
      currentInCart: 599,
    };
    expect(clampCartQuantity(1200, limits)).toEqual({
      quantity: 1000,
      wasClamped: true,
      maxCartQuantity: 1000,
    });
    expect(clampCartQuantity(800, limits)).toEqual({
      quantity: 800,
      wasClamped: false,
      maxCartQuantity: 1000,
    });
  });

  test("formatMaxTicketsReason pluralises ticket count", () => {
    expect(formatMaxTicketsReason(10, 10)).toContain("10 tickets");
    expect(formatMaxTicketsReason(1, 1)).toContain("1 ticket");
  });
});
