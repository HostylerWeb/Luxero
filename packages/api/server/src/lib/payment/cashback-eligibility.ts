import type { CashbackMode, CashbackPaymentMethod } from "@luxero/types";

const DAY_MS = 24 * 60 * 60 * 1000;

export function cashbackOrderQualifies(input: {
  enabled: boolean;
  percent: number;
  mode: CashbackMode;
  firstOrderCount: number;
  periodDays: number;
  paymentMethods: readonly string[];
  method: string;
  priorCompletedOrders: number;
  accountCreatedAt: Date;
  orderPaidAt: Date;
}): boolean {
  if (!input.enabled || input.percent <= 0) return false;
  if (!input.paymentMethods.includes(input.method)) return false;

  switch (input.mode) {
    case "first_order":
      return input.priorCompletedOrders === 0;
    case "first_n_orders":
      return input.priorCompletedOrders < Math.max(1, input.firstOrderCount);
    case "period": {
      const windowEnd = input.accountCreatedAt.getTime() + Math.max(1, input.periodDays) * DAY_MS;
      return input.orderPaidAt.getTime() <= windowEnd;
    }
    case "all":
      return true;
    default:
      return false;
  }
}

export function cashbackAmount(orderTotal: number, percent: number): number {
  if (orderTotal <= 0 || percent <= 0) return 0;
  const orderPence = Math.round(orderTotal * 100);
  const cashbackPence = Math.round((orderPence * percent) / 100);
  return cashbackPence / 100;
}

export function isCashbackPaymentMethod(value: string): value is CashbackPaymentMethod {
  return value === "stripe" || value === "paytriot" || value === "site_credit";
}
