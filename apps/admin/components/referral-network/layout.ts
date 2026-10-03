import { type Edge, type Node } from "@xyflow/react";

export const REFERRAL_NODE_WIDTH = 240;
export const REFERRAL_NODE_HEIGHT = 132;

export type ReferralLayoutDirection = "LR" | "TB";

export interface ReferralUserNodeData extends Record<string, unknown> {
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  isVerified: boolean;
  isAdmin: boolean;
  activeRefereeCount: number;
  totalRefereeCount: number;
  ticketsMinted: number;
  totalSpentGBP: number;
  isRoot: boolean;
  tierBadge: number | null;
  avatarSeed: string;
  tone: "root" | "active" | "pending" | "inactive";
  subscriptionStatus: "active" | "cancelled" | "none";
  lastActiveAt?: string;
}

export interface ReferralUserFlowNode extends Node<ReferralUserNodeData, "referralUser"> {}

export interface ReferralPurchaseEdgeData extends Record<string, unknown> {
  purchasedAt: string;
  purchaseAmountGBP: number;
  ticketsAwarded: number;
  orderNumber?: number;
  isActive: boolean;
  edgeKind: "referral_purchase" | "signup_only";
}

export type ReferralPurchaseEdge = Edge<ReferralPurchaseEdgeData, "referralPurchase">;
