"use client";

import { Handle, type NodeProps, Position } from "@xyflow/react";
import { CheckCircle2, Crosshair, Crown, Shield, User } from "lucide-react";
import { memo, useState } from "react";
import { cn } from "@/lib/utils";
import type { ReferralUserFlowNode, ReferralUserNodeData } from "../layout";

const toneRing: Record<ReferralUserNodeData["tone"], string> = {
  root: "border-amber-500/60 ring-2 ring-amber-500/30",
  active: "border-emerald-500/50",
  pending: "border-amber-500/40",
  inactive: "border-muted-foreground/30",
};

const toneBg: Record<ReferralUserNodeData["tone"], string> = {
  root: "bg-gradient-to-br from-amber-500/15 to-amber-500/5",
  active: "bg-gradient-to-br from-emerald-500/10 to-emerald-500/0",
  pending: "bg-gradient-to-br from-amber-500/10 to-amber-500/0",
  inactive: "bg-gradient-to-br from-muted/40 to-muted/20",
};

function hashString(value: string): number {
  let h = 5381;
  for (let i = 0; i < value.length; i++) {
    h = ((h << 5) + h) ^ value.charCodeAt(i);
  }
  return h >>> 0;
}

function Avatar({ name, email, url }: { name: string; email: string; url?: string }) {
  const [errored, setErrored] = useState(false);
  const seed = (url ? "" : `${name}|${email}`) + hashString(email).toString(16);
  const initials =
    name && name.length > 0
      ? name
          .split(/\s+/)
          .map((p) => p[0])
          .filter(Boolean)
          .slice(0, 2)
          .join("")
          .toUpperCase() ||
        email[0]?.toUpperCase() ||
        "?"
      : email[0]?.toUpperCase() || "?";

  if (url && !errored) {
    return (
      // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
      <img
        src={url}
        alt={name}
        referrerPolicy="no-referrer"
        onError={() => setErrored(true)}
        className="nodrag nopan h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-border"
      />
    );
  }
  void seed;
  return (
    <div className="nodrag nopan flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-[10px] font-semibold text-primary ring-1 ring-primary/20">
      {initials}
    </div>
  );
}

function RoleIcon({ data }: { data: ReferralUserNodeData }) {
  if (data.isAdmin) return <Shield className="h-2.5 w-2.5 text-primary" />;
  if (data.tone === "root") return <Crown className="h-2.5 w-2.5 text-amber-500" />;
  return <User className="h-2.5 w-2.5 text-muted-foreground" />;
}

function ReferralUserNodeInner({ data, selected }: NodeProps<ReferralUserFlowNode>) {
  const tone: ReferralUserNodeData["tone"] = data.tone;
  return (
    <article
      className={cn(
        "rfn-card relative flex flex-col gap-1.5 rounded-lg border bg-card px-2.5 py-2 text-card-foreground shadow-sm transition-shadow",
        toneRing[tone],
        toneBg[tone],
        selected && "ring-2 ring-primary/40",
        "hover:shadow-md"
      )}
      style={{ width: 240, height: 132 }}
      aria-label={`User ${data.displayName}`}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label={`Focus on ${data.displayName}`}
        className="rfn-focus-action nodrag nopan absolute right-1.5 top-1.5 inline-flex h-5 items-center gap-1 rounded border bg-background/95 px-1 text-[9px] font-medium text-foreground shadow-sm hover:bg-accent"
        onClick={(e) => {
          e.stopPropagation();
          window.dispatchEvent(
            new CustomEvent("referral-focus-node", {
              detail: { id: data.id, additive: e.shiftKey },
            })
          );
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          window.dispatchEvent(
            new CustomEvent("referral-focus-node", {
              detail: { id: data.id, additive: e.shiftKey },
            })
          );
        }}
      >
        <Crosshair className="h-2.5 w-2.5" />
        Focus
      </button>

      <Handle
        type="target"
        position={Position.Left}
        className="!h-1.5 !w-1.5 !border-2 !border-background !bg-muted-foreground/60"
      />

      <header className="flex items-center gap-2 pr-12">
        <Avatar name={data.displayName} email={data.email} url={undefined} />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 truncate text-[11px] font-semibold text-foreground">
            <RoleIcon data={data} />
            <span className="truncate">{data.displayName}</span>
          </p>
          <p className="truncate font-mono text-[10px] text-muted-foreground">{data.email}</p>
        </div>
      </header>

      <dl className="grid grid-cols-3 gap-2 border-t pt-1.5 text-[10px]">
        <div>
          <dt className="text-[9px] uppercase tracking-wide text-muted-foreground">Active</dt>
          <dd className="font-mono text-sm font-semibold leading-tight text-emerald-600">
            {data.activeRefereeCount}
          </dd>
        </div>
        <div>
          <dt className="text-[9px] uppercase tracking-wide text-muted-foreground">Total</dt>
          <dd className="font-mono text-sm font-semibold leading-tight">
            {data.totalRefereeCount}
          </dd>
        </div>
        <div>
          <dt className="text-[9px] uppercase tracking-wide text-muted-foreground">Tickets</dt>
          <dd className="font-mono text-sm font-semibold leading-tight text-amber-600">
            {data.ticketsMinted}
          </dd>
        </div>
      </dl>

      <div className="mt-auto flex items-center justify-between gap-1 text-[10px] text-muted-foreground">
        <span className="font-mono">{data.country ?? "—"}</span>
        <span className="flex items-center gap-1">
          {data.isVerified ? (
            <>
              <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />
              <span>verified</span>
            </>
          ) : (
            <span className="opacity-60">unverified</span>
          )}
        </span>
        {data.subscriptionStatus === "active" && (
          <span className="rounded bg-primary/15 px-1 py-px text-[9px] font-semibold text-primary">
            Sub
          </span>
        )}
        {data.tierBadge !== null && data.tierBadge > 0 && (
          <span className="rounded bg-emerald-500/15 px-1 py-px text-[9px] font-semibold text-emerald-600">
            T{data.tierBadge}
          </span>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!h-1.5 !w-1.5 !border-2 !border-background !bg-muted-foreground/60"
      />
    </article>
  );
}

export const ReferralUserNode = memo(ReferralUserNodeInner);
