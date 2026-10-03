import type React from "react";
import { ApplePayBrand } from "./ApplePayBrand";
import { GooglePayBrand } from "./GooglePayBrand";
import { MastercardBrand } from "./MastercardBrand";
import { VisaBrand } from "./VisaBrand";

export const CARD_BRANDS = ["visa", "mastercard", "google-pay", "apple-pay"] as const;
export type CardBrand = (typeof CARD_BRANDS)[number];

export const CARD_BRAND_COMPONENT: Record<CardBrand, React.ComponentType<React.ImgHTMLAttributes<HTMLImageElement>>> = {
  visa: VisaBrand,
  mastercard: MastercardBrand,
  "google-pay": GooglePayBrand,
  "apple-pay": ApplePayBrand,
};
