import type { ClientSession } from "mongoose";

export interface RefundRollbackDeps {
  findOrderById: (id: string) => Promise<any>;
  releaseTickets: (
    orderId: string,
    session?: ClientSession
  ) => Promise<{ releasedCount: number; competitionId: string }[]>;
  decrementCompetitionTicketsSold: (
    competitionId: string,
    count: number,
    session?: ClientSession
  ) => Promise<void>;
  rollbackProfileStats: (
    userId: string,
    totalSpent: number,
    totalEntries: number,
    session?: ClientSession
  ) => Promise<void>;
  restoreReferralWallet: (userId: string, amount: number, session?: ClientSession) => Promise<void>;
  releasePromoCode: (code: string, userId: string, session?: ClientSession) => Promise<void>;
  createBalanceRefundTransaction: (
    userId: string,
    orderId: string,
    amount: number
  ) => Promise<void>;
  removeInstantPrizeWins: (orderId: string, session?: ClientSession) => Promise<void>;
  invalidateReferralPurchase?: (orderId: string) => Promise<void>;
  createAuditLog: (params: {
    actorId: string | null;
    targetUserId: string;
    action: string;
    reason: string;
    before: Record<string, unknown>;
    after: Record<string, unknown>;
    source: "user" | "admin";
  }) => Promise<void>;
  invalidateUserCache: (userId: string) => Promise<void>;
}

export async function rollbackOrderRefund(
  orderId: string,
  userId: string,
  actorId: string | null,
  reason: string,
  deps: RefundRollbackDeps,
  session?: ClientSession
): Promise<{ success: boolean; error?: string }> {
  const order = await deps.findOrderById(orderId);
  if (!order) return { success: false, error: "Order not found" };

  const metadata = (order.metadata ?? {}) as Record<string, unknown>;

  const before = { status: order.status };
  const after = { status: "refunded", refundProcessedAt: new Date().toISOString() };

  try {
    const released = await deps.releaseTickets(orderId, session);

    for (const r of released) {
      if (r.releasedCount > 0) {
        await deps.decrementCompetitionTicketsSold(r.competitionId, r.releasedCount, session);
      }
    }

    const totalSpent = order.total ?? 0;
    const totalEntries = order.items?.reduce((s: number, i: any) => s + (i.quantity ?? 0), 0) ?? 0;
    if (totalSpent > 0 || totalEntries > 0) {
      await deps.rollbackProfileStats(userId, totalSpent, totalEntries, session);
    }

    const referralBalanceUsed = order.referralBalanceUsed ?? 0;
    if (referralBalanceUsed > 0) {
      await deps.restoreReferralWallet(userId, referralBalanceUsed, session);
    }

    const promoCode = metadata.promoCode as string | undefined;
    if (promoCode) {
      await deps.releasePromoCode(promoCode, userId, session);
    }

    if (totalSpent > 0) {
      const provider = String(order.provider ?? "");
      const paidViaCardGateway = provider === "paytriot" || provider === "stripe";
      if (!paidViaCardGateway) {
        await deps.createBalanceRefundTransaction(userId, orderId, totalSpent);
      }
    }

    await deps.removeInstantPrizeWins(orderId, session);

    if (deps.invalidateReferralPurchase) {
      await deps.invalidateReferralPurchase(orderId);
    }

    await deps.createAuditLog({
      actorId,
      targetUserId: userId,
      action: "order_refund_rollback",
      reason: reason || "Order refunded via admin action",
      before,
      after,
      source: "admin",
    });

    await deps.invalidateUserCache(userId);

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
