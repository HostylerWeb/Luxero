import { Balance, BalanceTransaction, CashbackSettings, Order, Profile } from "@luxero/api-db/models";
import { isDuplicateKeyError } from "@luxero/api-infra/mongo-errors";
import { creditSiteCreditForPrizeWin } from "@luxero/api-tickets/credit-site-credit-for-prize-win";
import type { CashbackPaymentMethod } from "@luxero/types";
import { Types } from "mongoose";
import {
  cashbackAmount,
  cashbackOrderQualifies,
  isCashbackPaymentMethod,
} from "./cashback-eligibility";

function resolvePaidMethod(order: {
  provider?: string | null;
  total: number;
  metadata?: Record<string, unknown> | null;
}): CashbackPaymentMethod | null {
  const siteCreditApplied = Number(order.metadata?.siteCreditApplied ?? 0);
  if (order.provider === "stripe" || order.provider === "paytriot") return order.provider;
  if (siteCreditApplied > 0 && order.total <= siteCreditApplied + 0.001) return "site_credit";
  return null;
}

export async function applyOrderCashback(orderId: string): Promise<{ credited: boolean; amount: number }> {
  const order = await Order.findById(orderId);
  if (!order || order.status !== "completed") {
    return { credited: false, amount: 0 };
  }
  if (order.metadata?.cashbackCredited === true) {
    return { credited: false, amount: Number(order.metadata?.cashbackAmount ?? 0) };
  }

  const settings = await CashbackSettings.findById("cashback_settings").lean();
  if (!settings?.addonEnabled) return { credited: false, amount: 0 };

  const method = resolvePaidMethod(order);
  if (!method || !isCashbackPaymentMethod(method)) return { credited: false, amount: 0 };

  const profile = await Profile.findById(order.userId).select("createdAt isGuestCheckout").lean();
  if (!profile?.createdAt || order.isGuestCheckout || profile.isGuestCheckout) {
    return { credited: false, amount: 0 };
  }

  const priorCompletedOrders = await Order.countDocuments({
    userId: order.userId,
    status: { $in: ["completed", "refunded"] },
    _id: { $ne: order._id },
  });

  const paidAt = order.paidAt ?? order.createdAt;
  const qualifies = cashbackOrderQualifies({
    enabled: settings.addonEnabled,
    percent: settings.percent,
    mode: settings.mode,
    firstOrderCount: settings.firstOrderCount,
    periodDays: settings.periodDays,
    paymentMethods: settings.paymentMethods,
    method,
    priorCompletedOrders,
    accountCreatedAt: new Date(profile.createdAt),
    orderPaidAt: new Date(paidAt),
  });
  if (!qualifies) return { credited: false, amount: 0 };

  const amount = cashbackAmount(order.total, settings.percent);
  if (amount <= 0) return { credited: false, amount: 0 };

  const result = await creditSiteCreditForPrizeWin({
    userId: order.userId,
    amount,
    idempotencyKey: `cashback:${order._id.toString()}`,
    note: `Cashback ${settings.percent}% on order ${order.orderNumber}`,
    type: "cashback_credit",
  });

  await Order.updateOne(
    { _id: order._id },
    {
      $set: {
        "metadata.cashbackCredited": true,
        "metadata.cashbackAmount": amount,
        "metadata.cashbackPercent": settings.percent,
      },
    }
  );

  return { credited: result.credited, amount };
}

export async function reverseOrderCashback(orderId: string): Promise<void> {
  const order = await Order.findById(orderId).select("userId metadata").lean();
  const amount = Number(order?.metadata?.cashbackAmount ?? 0);
  if (!order || order.metadata?.cashbackCredited !== true || amount <= 0) return;
  if (order.metadata?.cashbackReversed === true) return;

  const userOid = new Types.ObjectId(String(order.userId));
  const idempotencyKey = `cashback-reversal:${order._id.toString()}`;
  const existing = await BalanceTransaction.findOne({ userId: userOid, idempotencyKey }).lean();
  if (existing) {
    await Order.updateOne({ _id: order._id }, { $set: { "metadata.cashbackReversed": true } });
    return;
  }

  const balance = await Balance.findOne({ userId: userOid });
  const balanceBefore = balance?.available ?? 0;
  const updated = await Balance.findOneAndUpdate(
    { userId: userOid },
    { $inc: { available: -amount } },
    { returnDocument: "after" }
  );
  if (!updated) return;

  try {
    await BalanceTransaction.create({
      userId: userOid,
      type: "admin_debit",
      amount,
      balanceBefore,
      balanceAfter: updated.available,
      status: "completed",
      orderId: order._id,
      note: "Cashback reversed after refund",
      idempotencyKey,
    });
  } catch (err: unknown) {
    if (!isDuplicateKeyError(err)) {
      await Balance.findOneAndUpdate({ userId: userOid }, { $inc: { available: amount } });
      throw err;
    }
  }

  await Order.updateOne({ _id: order._id }, { $set: { "metadata.cashbackReversed": true } });
}
