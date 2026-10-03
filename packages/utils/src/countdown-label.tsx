import type { ReactNode } from "react";
import { cn } from "./cn";
import type { TimeLeft } from "./competition";

export interface CountdownLabelProps {
  timeLeft: TimeLeft | null;
  /** Optional target date used to render an "Ended" state when timeLeft is null. */
  endDate?: string | null;
  size?: "sm" | "lg";
  icon?: ReactNode;
  className?: string;
}

const TEXT_SIZE_CLASSES = {
  sm: "text-xs @lg/card:text-sm",
  lg: "text-4xl",
} as const;

const ICON_SIZE_CLASSES = {
  sm: "size-3",
  lg: "size-7",
} as const;

const GAP_CLASSES = {
  sm: "gap-1.5",
  lg: "gap-3",
} as const;

function formatTimeSegment(timeLeft: TimeLeft): string {
  const hh = String(timeLeft.hours).padStart(2, "0");
  const mm = String(timeLeft.minutes).padStart(2, "0");
  const ss = String(timeLeft.seconds).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function renderIcon(icon: ReactNode | undefined, size: "sm" | "lg"): ReactNode {
  if (icon == null) return null;
  return <span className={cn("shrink-0", ICON_SIZE_CLASSES[size])}>{icon}</span>;
}

export function CountdownLabel({
  timeLeft,
  endDate,
  size = "sm",
  icon,
  className,
}: CountdownLabelProps) {
  if (!timeLeft) {
    if (endDate) {
      return (
        <div
          role="timer"
          aria-label="Draw ended"
          className={cn(
            "inline-flex items-center tabular-nums text-muted-foreground",
            GAP_CLASSES[size],
            className
          )}
        >
          {renderIcon(icon, size)}
          <span className={cn("font-semibold", TEXT_SIZE_CLASSES[size])}>Ended</span>
        </div>
      );
    }
    return null;
  }

  const daysPrefix = timeLeft.days > 0 ? `${timeLeft.days}d ` : "";
  const summary = `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m`;

  const containerClasses = cn(
    "inline-flex items-center text-gold tabular-nums",
    GAP_CLASSES[size],
    className
  );

  return (
    <div
      role="timer"
      aria-label={`Time until draw: ${summary}`}
      className={containerClasses}
      suppressHydrationWarning
    >
      {renderIcon(icon, size)}
      <span className={cn("font-semibold", TEXT_SIZE_CLASSES[size])} suppressHydrationWarning>
        {daysPrefix}
        {formatTimeSegment(timeLeft)}
      </span>
    </div>
  );
}
