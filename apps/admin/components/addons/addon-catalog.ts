import type { ComponentType } from "react";
import { Film, Wallet } from "@luxero/icons";

export type AddonCatalogStatus = "available" | "coming_soon";

export interface AddonCatalogEntry {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  status: AddonCatalogStatus;
  tags: string[];
}

export const ADDON_CATALOG: AddonCatalogEntry[] = [
  {
    id: "media-converter",
    title: "Media converter",
    description:
      "Optimize uploads on the way to storage: WebP for images, WebM for videos, with quality and scope controls.",
    href: "/addons/media-converter",
    icon: Film,
    status: "available",
    tags: ["Images", "Video", "CDN"],
  },
  {
    id: "cashback",
    title: "Cashback",
    description:
      "Credit a percentage of a qualifying order to the customer’s site credit wallet.",
    href: "/addons/cashback",
    icon: Wallet,
    status: "available",
    tags: ["Site credit", "First order", "Payments"],
  },
];

export function getAddonById(id: string): AddonCatalogEntry | undefined {
  return ADDON_CATALOG.find((a) => a.id === id);
}
