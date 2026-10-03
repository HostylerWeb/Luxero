import type { InstantPrizeCapacityResponse } from "@luxero/types";
import { Progress } from "@/components/ui/progress";

export function InstantPrizeCapacityPanel({
  capacity,
  isLoading,
}: {
  capacity?: InstantPrizeCapacityResponse | null;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-3 rounded-lg border border-gold/20 bg-gold/5 p-4">
        <div className="h-4 w-20 animate-pulse rounded bg-gold/10" />
        <div className="space-y-1">
          <div className="flex justify-between">
            <div className="h-4 w-48 animate-pulse rounded bg-muted-foreground/20" />
            <div className="h-4 w-16 animate-pulse rounded bg-muted-foreground/20" />
          </div>
          <div className="h-1.5 w-full animate-pulse rounded-full bg-muted-foreground/20" />
          <div className="h-4 w-32 animate-pulse rounded bg-muted-foreground/20" />
        </div>
        <div className="h-4 w-56 animate-pulse rounded bg-muted-foreground/20" />
        <div className="h-5 w-44 animate-pulse rounded bg-muted-foreground/20" />
        <div className="rounded-md border border-border/50 bg-background/50 p-2">
          <div className="h-4 w-32 animate-pulse rounded bg-muted-foreground/20" />
          <div className="mt-1 h-4 w-48 animate-pulse rounded bg-muted-foreground/20" />
        </div>
      </div>
    );
  }

  if (!capacity) return null;

  const slotPct =
    capacity.maxTickets > 0 ? Math.round((capacity.assignedSlots / capacity.maxTickets) * 100) : 0;

  return (
    <div className="space-y-3 rounded-lg border border-gold/20 bg-gold/5 p-4">
      <p className="text-xs font-medium text-foreground">Live capacity</p>

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Instant prize slots on this competition</span>
          <span>
            {capacity.assignedSlots} / {capacity.maxTickets}
          </span>
        </div>
        <Progress value={Math.min(slotPct, 100)} className="h-1.5" />
        <p className="text-xs text-muted-foreground">
          {capacity.remainingSlots} slot{capacity.remainingSlots === 1 ? "" : "s"} remaining
        </p>
      </div>

      <p className="text-xs text-muted-foreground">
        Pick pool: <span className="font-medium text-foreground">{capacity.availableTickets}</span>{" "}
        tickets available for new winning numbers
      </p>

      <p className="text-sm">
        You can add up to{" "}
        <span className="font-semibold text-gold">{capacity.maxAssignableQty}</span> slot
        {capacity.maxAssignableQty === 1 ? "" : "s"} right now
      </p>

      {capacity.linkedCompetition && (
        <div className="rounded-md border border-border/50 bg-background/50 p-2 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">{capacity.linkedCompetition.title}</p>
          <p>
            {capacity.linkedCompetition.availableTickets} linked tickets available ·{" "}
            {capacity.linkedCompetition.ticketsPerSlot} per winning slot
          </p>
        </div>
      )}
    </div>
  );
}
