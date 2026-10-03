"use client";

import { BaseEdge, EdgeLabelRenderer, type EdgeProps, getBezierPath } from "@xyflow/react";
import { Ticket } from "lucide-react";
import { memo } from "react";
import { cn } from "@/lib/utils";
import type { ReferralPurchaseEdge } from "../layout";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const gbpFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 2,
});

function ReferralPurchaseEdgeInner({
  id,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  markerEnd,
  style,
  data,
  selected,
}: EdgeProps<ReferralPurchaseEdge>) {
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const isSignup = data?.edgeKind === "signup_only";
  const isActive = data?.isActive === true;
  const ticketsAwarded = data?.ticketsAwarded ?? 0;
  const amount = data?.purchaseAmountGBP ?? 0;
  const purchasedAt = data?.purchasedAt;

  return (
    <>
      {isSignup ? (
        <BaseEdge
          id={id}
          path={path}
          markerEnd={markerEnd}
          style={{
            stroke: "var(--muted-foreground)",
            strokeWidth: selected ? 2.5 : 1.5,
            strokeDasharray: "4 4",
            opacity: 0.7,
            ...style,
          }}
        />
      ) : (
        <BaseEdge
          id={id}
          path={path}
          markerEnd={markerEnd}
          style={{
            stroke: isActive ? "rgb(16, 185, 129)" : "var(--muted-foreground)",
            strokeWidth: selected ? 3 : isActive ? 2.5 : 1.75,
            strokeDasharray: isActive ? undefined : "6 4",
            opacity: isActive ? 1 : 0.8,
            ...style,
          }}
        />
      )}

      {/* Invisible wider hit-target for easier clicking */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={16}
        className="react-flow__edge-interaction"
      />

      {!isSignup && (
        <EdgeLabelRenderer>
          <div
            className={cn(
              "nodrag nopan pointer-events-none w-fit flex flex-col items-center rounded-md border bg-background/95 px-2 py-1 text-[10px] leading-tight shadow-sm backdrop-blur transition-all duration-150",
              isActive
                ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
                : "border-muted-foreground/30 text-muted-foreground",
              selected && "ring-2 ring-primary/40 scale-105"
            )}
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
          >
            {purchasedAt && (
              <span className="font-mono uppercase tracking-wide text-[9px]">
                {dateFormatter.format(new Date(purchasedAt))}
              </span>
            )}
            <span className="font-semibold">{gbpFormatter.format(amount)}</span>
            {ticketsAwarded > 0 && (
              <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400">
                <Ticket className="h-2.5 w-2.5" />+{ticketsAwarded}
              </span>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export const ReferralPurchaseEdgeComponent = memo(ReferralPurchaseEdgeInner);
