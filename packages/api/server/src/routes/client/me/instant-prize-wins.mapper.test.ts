import { describe, expect, test } from "vitest";
import { mapInstantPrizeWin } from "./instant-prize-wins.mapper";

describe("instant-prize-wins route mapper contracts", () => {
  test("maps prize win with flattened instant prize payload", () => {
    const mapped = mapInstantPrizeWin(
      {
        _id: "507f1f77bcf86cd799439011",
        ticketNumber: 42,
        claimed: false,
        wonAt: "2026-05-01T12:00:00.000Z",
        grantedTicketIds: ["507f1f77bcf86cd799439012"],
        competitionInstantPrizeId: {
          _id: "507f1f77bcf86cd799439013",
          instantPrizeId: {
            title: "Luxury Hamper",
            description: "Premium prize",
            images: ["https://img/prize.png"],
            value: 250,
            type: "prize",
          },
        },
      },
      new Map()
    );

    expect(mapped).toMatchObject({
      _id: "507f1f77bcf86cd799439011",
      ticketNumber: 42,
      claimed: false,
      prizeType: "prize",
      prize: {
        title: "Luxury Hamper",
        description: "Premium prize",
        image: "https://img/prize.png",
        value: 250,
      },
      grantedTicketIds: ["507f1f77bcf86cd799439012"],
    });
  });

  test("auto-claims competition-ticket wins and resolves linked competition title", () => {
    const mapped = mapInstantPrizeWin(
      {
        _id: "507f1f77bcf86cd799439014",
        ticketNumber: 7,
        claimed: false,
        wonAt: "2026-05-01T12:00:00.000Z",
        grantedTicketIds: ["507f1f77bcf86cd799439015"],
        competitionInstantPrizeId: {
          instantPrizeId: {
            title: "Bonus Entries",
            images: [],
            type: "competition_ticket",
            linkedCompetitionId: "507f1f77bcf86cd799439016",
            ticketCount: 5,
          },
        },
      },
      new Map([
        ["507f1f77bcf86cd799439016", { title: "Summer Mega Draw", slug: "summer-mega-draw" }],
      ])
    );

    expect(mapped).toMatchObject({
      claimed: true,
      claimedAt: "2026-05-01T12:00:00.000Z",
      prizeType: "competition_ticket",
      linkedCompetitionId: "507f1f77bcf86cd799439016",
      linkedCompetitionTitle: "Summer Mega Draw",
      linkedCompetitionSlug: "summer-mega-draw",
    });
  });
});
