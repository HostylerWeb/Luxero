import { Balance } from "@luxero/api-db/models";
import { Types } from "mongoose";

export async function resolveSiteCreditForCheckout(params: {
  userId: string;
  cartTotal: number;
  applySiteCredit: boolean;
}): Promise<{ siteCreditApplied: number; gatewayTotal: number }> {
  const cartTotal = Math.max(0, params.cartTotal);
  if (!params.applySiteCredit || cartTotal <= 0) {
    return { siteCreditApplied: 0, gatewayTotal: cartTotal };
  }

  const balance = await Balance.findOne({ userId: new Types.ObjectId(params.userId) })
    .select("available")
    .lean();
  const available = balance?.available ?? 0;
  const siteCreditApplied = Math.min(available, cartTotal);
  const gatewayTotal = Math.max(0, cartTotal - siteCreditApplied);
  return { siteCreditApplied, gatewayTotal };
}
