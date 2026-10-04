"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { FieldDescription, FieldLabel } from "@/components/ui/field";

const PREVIEW_COUNT = 16;

export function WinningTicketNumbersDisplay({
  numbers,
  claimedCount,
}: {
  numbers: number[];
  claimedCount: number;
}) {
  const [showAll, setShowAll] = useState(false);

  const preview = useMemo(() => numbers.slice(0, PREVIEW_COUNT), [numbers]);
  const unclaimedCount = Math.max(0, numbers.length - claimedCount);

  if (numbers.length === 0) {
    return (
      <div className="rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground">
        No winning ticket numbers yet. Save the prize or use Regenerate to assign random numbers.
      </div>
    );
  }

  const visible = showAll ? numbers : preview;
  const hiddenCount = numbers.length - preview.length;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <FieldLabel className="mb-0">Winning ticket numbers on this competition</FieldLabel>
        <span className="text-xs text-muted-foreground">
          {numbers.length.toLocaleString()} total · {claimedCount.toLocaleString()} already won ·{" "}
          {unclaimedCount.toLocaleString()} still to be found
        </span>
      </div>
      <div
        className={
          showAll
            ? "max-h-40 overflow-y-auto rounded-md border bg-muted/20 p-2 font-mono text-xs leading-relaxed"
            : "rounded-md border bg-muted/20 p-2 font-mono text-xs leading-relaxed"
        }
      >
        {visible.join(", ")}
        {!showAll && hiddenCount > 0 ? (
          <span className="text-muted-foreground"> … +{hiddenCount.toLocaleString()} more</span>
        ) : null}
      </div>
      {numbers.length > PREVIEW_COUNT ? (
        <Button
          type="button"
          variant="link"
          size="sm"
          className="h-auto px-0 text-xs"
          onClick={() => setShowAll((v) => !v)}
        >
          {showAll ? "Show less" : `Show all ${numbers.length.toLocaleString()} numbers`}
        </Button>
      ) : null}
      <FieldDescription>
        These are ticket numbers on <strong>this</strong> competition that trigger an instant win.
        Regenerate picks new random numbers for wins not yet claimed.
      </FieldDescription>
    </div>
  );
}
