import { Types } from "mongoose";
import { describe, expect, test, vi } from "vitest";
import {
  getItemsFromOrder,
  grantInstantPrizeWinsForAssignedNumbers,
  processBalanceTopUp,
} from "./order-fulfillment";

describe("getItemsFromOrder", () => {
  test("parses items JSON from order metadata", () => {
    const items = getItemsFromOrder({
      metadata: {
        items: JSON.stringify([
          { competitionId: "507f1f77bcf86cd799439011", quantity: 3, answerIndex: 1 },
          { competitionId: "507f1f77bcf86cd799439012", quantity: 1, answerIndex: 0 },
        ]),
      },
    });

    expect(items).toEqual([
      { competitionId: "507f1f77bcf86cd799439011", quantity: 3, answerIndex: 1 },
      { competitionId: "507f1f77bcf86cd799439012", quantity: 1, answerIndex: 0 },
    ]);
  });

  test("returns empty array when metadata has no competitionIds", () => {
    expect(getItemsFromOrder({})).toEqual([]);
    expect(getItemsFromOrder({ metadata: {} })).toEqual([]);
  });

  test("throws when competitionIds present but items missing", () => {
    expect(() =>
      getItemsFromOrder({
        metadata: { competitionIds: "507f1f77bcf86cd799439011" },
      })
    ).toThrow(/getItemsFromOrder: metadata.items is missing/);
  });

  test("throws for invalid items JSON", () => {
    expect(() => getItemsFromOrder({ metadata: { items: "not-json" } })).toThrow(
      /metadata.items is not valid JSON/
    );
  });
});

describe("grantInstantPrizeWinsForAssignedNumbers", () => {
  test("creates wins and reconciles claimedCount for referral-like grants", async () => {
    const competitionId = new Types.ObjectId().toString();
    const entryId = new Types.ObjectId().toString();
    const cipId = new Types.ObjectId();
    const createdWinId = new Types.ObjectId();

    const checkInstantWins = vi.fn(async () => [
      {
        competitionInstantPrizeId: cipId,
        entryNumber: 7,
        winIndex: 0,
        instantPrize: { title: "Free Prize", images: ["https://img"], value: 50 },
        prizeType: "prize" as const,
        linkedCompetitionId: undefined,
        ticketCount: undefined,
      },
    ]);
    const createInstantPrizeWin = vi.fn(async () => ({ _id: createdWinId }));
    const updateCompetitionInstantPrizeClaimedCount = vi.fn(async () => {});

    const deps = {
      checkInstantWins,
      createInstantPrizeWin,
      updateCompetitionInstantPrizeClaimedCount,
      findCipById: vi.fn(async () => null),
      transferHeldTicketsToOwner: vi.fn(async () => []),
      updateInstantPrizeWinGrantedTickets: vi.fn(async () => {}),
      markInstantPrizeWinClaimed: vi.fn(async () => {}),
    } as unknown as Parameters<typeof grantInstantPrizeWinsForAssignedNumbers>[0]["deps"];

    const emailItems = await grantInstantPrizeWinsForAssignedNumbers({
      userId: new Types.ObjectId().toString(),
      assignedNumbers: [{ competitionId, ticketNumbers: [7], entryIds: [entryId] }],
      deps,
      logPrefix: "Referral",
      competitionTitles: new Map([[competitionId, "Comp A"]]),
    });

    expect(checkInstantWins).toHaveBeenCalledTimes(1);
    expect(createInstantPrizeWin).toHaveBeenCalledTimes(1);
    expect(updateCompetitionInstantPrizeClaimedCount).toHaveBeenCalledWith(cipId, undefined);
    expect(emailItems).toEqual([
      {
        prizeTitle: "Free Prize",
        prizeImage: "https://img",
        prizeValue: 50,
        ticketNumber: 7,
        competitionName: "Comp A",
      },
    ]);
  });

  test("transfers held linked tickets for competition-ticket prizes", async () => {
    const competitionId = new Types.ObjectId().toString();
    const linkedCompetitionId = new Types.ObjectId();
    const cipId = new Types.ObjectId();
    const grantedTicketId = new Types.ObjectId().toString();
    const createdWinId = new Types.ObjectId();

    const deps = {
      checkInstantWins: vi.fn(async () => [
        {
          competitionInstantPrizeId: cipId,
          entryNumber: 11,
          winIndex: 0,
          instantPrize: { title: "5 Bonus Tickets" },
          prizeType: "competition_ticket" as const,
          linkedCompetitionId,
          ticketCount: 1,
        },
      ]),
      createInstantPrizeWin: vi.fn(async () => ({ _id: createdWinId })),
      updateCompetitionInstantPrizeClaimedCount: vi.fn(async () => {}),
      findCipById: vi.fn(async () => ({
        _id: cipId,
        competitionInstantPrizeId: cipId,
        winningEntryNumbers: [11],
        grantedTicketIds: [new Types.ObjectId()],
      })),
      transferHeldTicketsToOwner: vi.fn(async () => [grantedTicketId]),
      updateInstantPrizeWinGrantedTickets: vi.fn(async () => {}),
      markInstantPrizeWinClaimed: vi.fn(async () => {}),
    } as unknown as Parameters<typeof grantInstantPrizeWinsForAssignedNumbers>[0]["deps"];

    await grantInstantPrizeWinsForAssignedNumbers({
      userId: new Types.ObjectId().toString(),
      assignedNumbers: [
        { competitionId, ticketNumbers: [11], entryIds: [new Types.ObjectId().toString()] },
      ],
      deps,
      logPrefix: "Referral",
    });

    expect(deps.transferHeldTicketsToOwner).toHaveBeenCalledTimes(1);
    expect(deps.updateInstantPrizeWinGrantedTickets).toHaveBeenCalledTimes(1);
    expect(deps.markInstantPrizeWinClaimed).toHaveBeenCalledWith(createdWinId, undefined);
  });
});

describe("processBalanceTopUp", () => {
  test("throws when updateBalance returns null", async () => {
    const deps = {
      updateBalance: vi.fn(async () => null),
      updateBalanceTransaction: vi.fn(async () => {}),
    };

    await expect(
      processBalanceTopUp({
        orderId: new Types.ObjectId().toString(),
        userId: new Types.ObjectId().toString(),
        total: 100,
        transactionId: new Types.ObjectId().toString(),
        logPrefix: "Test",
        deps,
      })
    ).rejects.toThrow(/Balance top-up failed/);

    expect(deps.updateBalance).toHaveBeenCalledTimes(1);
    expect(deps.updateBalanceTransaction).not.toHaveBeenCalled();
  });

  test("updates balance transaction when balance update succeeds", async () => {
    const deps = {
      updateBalance: vi.fn(async () => ({ available: 500 })),
      updateBalanceTransaction: vi.fn(async () => {}),
    };
    const transactionId = new Types.ObjectId().toString();

    await processBalanceTopUp({
      orderId: new Types.ObjectId().toString(),
      userId: new Types.ObjectId().toString(),
      total: 100,
      transactionId,
      logPrefix: "Test",
      deps,
    });

    expect(deps.updateBalance).toHaveBeenCalledTimes(1);
    expect(deps.updateBalanceTransaction).toHaveBeenCalledWith(
      new Types.ObjectId(transactionId),
      "completed",
      500,
      undefined
    );
  });

  test("skips transaction update when no transactionId provided", async () => {
    const deps = {
      updateBalance: vi.fn(async () => ({ available: 500 })),
      updateBalanceTransaction: vi.fn(async () => {}),
    };

    await processBalanceTopUp({
      orderId: new Types.ObjectId().toString(),
      userId: new Types.ObjectId().toString(),
      total: 100,
      logPrefix: "Test",
      deps,
    });

    expect(deps.updateBalance).toHaveBeenCalledTimes(1);
    expect(deps.updateBalanceTransaction).not.toHaveBeenCalled();
  });
});
