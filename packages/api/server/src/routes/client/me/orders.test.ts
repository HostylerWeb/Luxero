import { Types } from "mongoose";
import { describe, expect, test } from "vitest";
import { mapOrderItem } from "./orders";

describe("orders route contract mapping", () => {
  test("keeps populated competition contract for order items", () => {
    const competitionId = new Types.ObjectId();
    const mapped = mapOrderItem({
      competitionId: {
        _id: competitionId,
        title: "VIP Draw",
        prizeImageUrl: "https://img/comp.png",
      },
      quantity: 2,
    });

    expect(mapped.competitionId).toMatchObject({
      _id: competitionId.toString(),
      title: "VIP Draw",
      prizeImageUrl: "https://img/comp.png",
    });
  });

  test("falls back to imageUrl when prizeImageUrl is missing", () => {
    const competitionId = new Types.ObjectId();
    const mapped = mapOrderItem({
      competitionId: {
        _id: competitionId,
        title: "Cupra",
        imageUrl: "https://img/hero.png",
      },
      quantity: 1,
    });

    expect(mapped.competitionId).toMatchObject({
      prizeImageUrl: "https://img/hero.png",
    });
  });

  test("handles bare ObjectId competition id without crashing contract mapping", () => {
    const competitionId = new Types.ObjectId();
    const mapped = mapOrderItem({
      competitionId,
      quantity: 1,
    });

    expect(mapped.competitionId).toMatchObject({
      _id: competitionId.toString(),
    });
  });
});
