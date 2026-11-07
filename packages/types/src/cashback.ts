export const CASHBACK_PAYMENT_METHODS = ["stripe", "paytriot", "site_credit"] as const;

export type CashbackPaymentMethod = (typeof CASHBACK_PAYMENT_METHODS)[number];

export type CashbackMode = "first_order" | "first_n_orders" | "period" | "all";

export interface CashbackSettings {
  _id: "cashback_settings";
  addonEnabled: boolean;
  percent: number;
  paymentMethods: CashbackPaymentMethod[];
  mode: CashbackMode;
  /** Used when mode is first_n_orders. Includes the first order, so 1 matches first_order. */
  firstOrderCount: number;
  /** Used when mode is period. Days after the account was created. */
  periodDays: number;
}

export const DEFAULT_CASHBACK_SETTINGS: CashbackSettings = {
  _id: "cashback_settings",
  addonEnabled: false,
  percent: 0,
  paymentMethods: [],
  mode: "first_order",
  firstOrderCount: 1,
  periodDays: 30,
};

export const CASHBACK_PAYMENT_METHOD_LABELS: Record<CashbackPaymentMethod, string> = {
  stripe: "Card (Stripe)",
  paytriot: "Paytriot",
  site_credit: "Site credit",
};
