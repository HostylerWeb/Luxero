import { Balance, BalanceTransaction } from "@luxero/api-db/models";
import type { ClientSession } from "mongoose";
import { Types } from "mongoose";

export async function debitSiteCreditForOrder(params: {
  userId: string;
  orderId: string;
  amount: number;
  session?: ClientSession;
}): Promise<void> {
  const amount = params.amount;
  if (amount <= 0) return;

  const orderOid = new Types.ObjectId(params.orderId);
  let existingQuery = BalanceTransaction.findOne({
    orderId: orderOid,
    type: "purchase",
    status: "completed",
  });
  if (params.session) existingQuery = existingQuery.session(params.session);
  const existing = await existingQuery;
  if (existing) return;

  const userOid = new Types.ObjectId(params.userId);
  const sessionOpts = params.session ? { session: params.session } : {};

  let balanceQuery = Balance.findOne({ userId: userOid });
  if (params.session) balanceQuery = balanceQuery.session(params.session);
  const balance = await balanceQuery;
  const available = balance?.available ?? 0;
  if (available < amount) {
    throw new Error("INSUFFICIENT_SITE_CREDIT");
  }

  const balanceBefore = available;
  const balanceAfter = balanceBefore - amount;

  const updated = await Balance.findOneAndUpdate(
    { userId: userOid, available: { $gte: amount } },
    { $inc: { available: -amount } },
    { returnDocument: "after", ...sessionOpts }
  );
  if (!updated) {
    throw new Error("INSUFFICIENT_SITE_CREDIT");
  }

  await BalanceTransaction.create(
    [
      {
        userId: userOid,
        type: "purchase",
        amount,
        balanceBefore,
        balanceAfter,
        status: "completed",
        orderId: orderOid,
      },
    ],
    sessionOpts
  );
}
