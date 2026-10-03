import { describe, expect, test, vi } from "vitest";
import { type RefundRollbackDeps, rollbackOrderRefund } from "./order-refund-rollback";

function createMockDeps(overrides?: Partial<RefundRollbackDeps>): RefundRollbackDeps {
  return {
    findOrderById: vi.fn(),
    releaseTickets: vi.fn(async () => []),
    decrementCompetitionTicketsSold: vi.fn(),
    rollbackProfileStats: vi.fn(),
    restoreReferralWallet: vi.fn(),
    releasePromoCode: vi.fn(),
    createBalanceRefundTransaction: vi.fn(),
    removeInstantPrizeWins: vi.fn(),
    createAuditLog: vi.fn(),
    invalidateUserCache: vi.fn(),
    ...overrides,
  };
}

describe("rollbackOrderRefund", () => {
  test("returns error if order not found", async () => {
    const deps = createMockDeps({ findOrderById: vi.fn(async () => null) });
    const result = await rollbackOrderRefund("order123", "user123", "admin1", "test", deps);
    expect(result).toEqual({ success: false, error: "Order not found" });
  });

  test("returns success (idempotent) if order already has refundProcessedAt", async () => {
    const deps = createMockDeps({
      findOrderById: vi.fn(async () => ({
        _id: "order123",
        status: "refunded",
        total: 100,
        items: [{ quantity: 5 }],
        metadata: { refundProcessedAt: "2024-01-01T00:00:00.000Z" },
      })),
    });
    const result = await rollbackOrderRefund("order123", "user123", "admin1", "test", deps);
    expect(result).toEqual({ success: true });
  });

  test("performs full rollback for a completed order", async () => {
    const releaseTickets = vi.fn(async () => [{ competitionId: "comp1", releasedCount: 5 }]);
    const decrementCompetitionTicketsSold = vi.fn();
    const rollbackProfileStats = vi.fn();
    const restoreReferralWallet = vi.fn();
    const releasePromoCode = vi.fn();
    const createBalanceRefundTransaction = vi.fn();
    const removeInstantPrizeWins = vi.fn();
    const createAuditLog = vi.fn();
    const invalidateUserCache = vi.fn();

    const deps = createMockDeps({
      findOrderById: vi.fn(async () => ({
        _id: "order123",
        status: "completed",
        total: 100,
        referralBalanceUsed: 20,
        items: [{ quantity: 5 }],
        metadata: { promoCode: "PROMO10" },
      })),
      releaseTickets,
      decrementCompetitionTicketsSold,
      rollbackProfileStats,
      restoreReferralWallet,
      releasePromoCode,
      createBalanceRefundTransaction,
      removeInstantPrizeWins,
      createAuditLog,
      invalidateUserCache,
    });

    const result = await rollbackOrderRefund(
      "order123",
      "user123",
      "admin1",
      "Refund reason",
      deps
    );

    expect(result).toEqual({ success: true });
    expect(releaseTickets).toHaveBeenCalledWith("order123", undefined);
    expect(decrementCompetitionTicketsSold).toHaveBeenCalledWith("comp1", 5, undefined);
    expect(rollbackProfileStats).toHaveBeenCalledWith("user123", 100, 5, undefined);
    expect(restoreReferralWallet).toHaveBeenCalledWith("user123", 20, undefined);
    expect(releasePromoCode).toHaveBeenCalledWith("PROMO10", "user123", undefined);
    expect(createBalanceRefundTransaction).toHaveBeenCalledWith("user123", "order123", 100);
    expect(removeInstantPrizeWins).toHaveBeenCalledWith("order123", undefined);
    expect(createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: "admin1",
        targetUserId: "user123",
        action: "order_refund_rollback",
        reason: "Refund reason",
        source: "admin",
      })
    );
    expect(invalidateUserCache).toHaveBeenCalledWith("user123");
  });

  test("skips optional steps when values are zero/empty", async () => {
    const rollbackProfileStats = vi.fn();
    const restoreReferralWallet = vi.fn();
    const releasePromoCode = vi.fn();
    const createBalanceRefundTransaction = vi.fn();

    const deps = createMockDeps({
      findOrderById: vi.fn(async () => ({
        _id: "order123",
        status: "completed",
        total: 0,
        referralBalanceUsed: 0,
        items: [],
        metadata: {},
      })),
      releaseTickets: vi.fn(async () => []),
      rollbackProfileStats,
      restoreReferralWallet,
      releasePromoCode,
      createBalanceRefundTransaction,
    });

    const result = await rollbackOrderRefund("order123", "user123", "admin1", "", deps);

    expect(result).toEqual({ success: true });
    expect(rollbackProfileStats).not.toHaveBeenCalled();
    expect(restoreReferralWallet).not.toHaveBeenCalled();
    expect(releasePromoCode).not.toHaveBeenCalled();
    expect(createBalanceRefundTransaction).not.toHaveBeenCalled();
  });

  test("returns error when deps throw", async () => {
    const deps = createMockDeps({
      findOrderById: vi.fn(async () => ({
        _id: "order123",
        status: "completed",
        total: 100,
        items: [{ quantity: 1 }],
        metadata: {},
      })),
      releaseTickets: vi.fn(async () => {
        throw new Error("DB error");
      }),
    });

    const result = await rollbackOrderRefund("order123", "user123", "admin1", "test", deps);
    expect(result).toEqual({ success: false, error: "DB error" });
  });
});
