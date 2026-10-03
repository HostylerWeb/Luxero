import type { EdgeTypes, NodeTypes } from "@xyflow/react";
import { ReferralPurchaseEdgeComponent } from "./edges/ReferralPurchaseEdge";
import { ReferralUserNode } from "./nodes/ReferralUserNode";

export const referralNodeTypes: NodeTypes = {
  referralUser: ReferralUserNode as unknown as NodeTypes[string],
};

export const referralEdgeTypes: EdgeTypes = {
  referralPurchase: ReferralPurchaseEdgeComponent as unknown as EdgeTypes[string],
};
