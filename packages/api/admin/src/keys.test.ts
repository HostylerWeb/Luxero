import { describe, expect, test } from "vitest";
import { queryKeys } from "./keys";

describe("queryKeys smoke", () => {
  test("competitions keys are stable for cache invalidation", () => {
    expect(queryKeys.competitions.all({ category: "cars" })).toEqual([
      "competitions",
      { category: "cars" },
    ]);
    expect(queryKeys.competitions.featured()).toEqual(["competitions", "featured"]);
    expect(queryKeys.competitions.detail("luxury-car")).toEqual(["competitions", "luxury-car"]);
    expect(queryKeys.competitions.availability("507f1f77bcf86cd799439011")).toEqual([
      "competitions",
      "507f1f77bcf86cd799439011",
      "availability",
    ]);
  });

  test("my wins keys support checkout success invalidation", () => {
    expect(queryKeys.my.wins()).toEqual(["my", "wins"]);
    expect(queryKeys.my.instantPrizeWins()).toEqual(["my", "instant-prize-wins"]);
    expect(queryKeys.my.instantPrizeWinsByIds("a,b")).toEqual([
      "my",
      "instant-prize-wins",
      "by-ids",
      "a,b",
    ]);
    expect(queryKeys.my.entriesBase()).toEqual(["my", "entries"]);
    expect(queryKeys.my.ordersBase()).toEqual(["my", "orders"]);
  });
});
