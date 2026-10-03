import { useEffect, useMemo, useState } from "react";
import { cn, formatDate } from "@/lib/utils";

const variantClasses = {
  default: "text-foreground",
  relative: "text-muted-foreground",
  compact: "text-sm text-foreground",
} as const;

interface DateCellProps extends React.ComponentProps<"span"> {
  value: Date | string | null | undefined;
  relative?: boolean;
  variant?: "default" | "relative" | "compact";
}

function DateCell({
  value,
  relative = false,
  variant = "default",
  className,
  ...props
}: DateCellProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const date = useMemo(() => {
    if (!value) return null;
    const d = typeof value === "string" ? new Date(value) : value;
    if (Number.isNaN(d.getTime())) return null;
    return d;
  }, [value]);

  const { formatted, isShowingRelative } = useMemo(() => {
    if (!date) {
      return { formatted: "--", isShowingRelative: false };
    }

    if (!mounted) {
      return { formatted: formatDate(date), isShowingRelative: false };
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    const isFuture = diffMs < 0;
    const showRelative = relative || Math.abs(diffDays) <= 7;

    if (!showRelative) {
      return { formatted: formatDate(date), isShowingRelative: false };
    }

    if (isFuture) {
      const absDiffDays = Math.abs(diffDays);
      if (absDiffDays === 0) {
        const diffHours = Math.abs(Math.floor(diffMs / (1000 * 60 * 60)));
        if (diffHours === 0) {
          const diffMinutes = Math.abs(Math.floor(diffMs / (1000 * 60)));
          return {
            formatted: diffMinutes <= 1 ? "in less than a minute" : `in ${diffMinutes} min`,
            isShowingRelative: true,
          };
        }
        return {
          formatted: diffHours === 1 ? "in 1 hour" : `in ${diffHours} hours`,
          isShowingRelative: true,
        };
      }
      if (absDiffDays === 1) {
        return { formatted: "tomorrow", isShowingRelative: true };
      }
      if (absDiffDays < 7) {
        return { formatted: `in ${absDiffDays} days`, isShowingRelative: true };
      }
      return { formatted: formatDate(date), isShowingRelative: false };
    }

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return {
          formatted: diffMinutes <= 1 ? "just now" : `${diffMinutes} min ago`,
          isShowingRelative: true,
        };
      }
      return {
        formatted: diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`,
        isShowingRelative: true,
      };
    }
    if (diffDays === 1) {
      return { formatted: "yesterday", isShowingRelative: true };
    }
    if (diffDays < 7) {
      return { formatted: `${diffDays} days ago`, isShowingRelative: true };
    }
    return { formatted: formatDate(date), isShowingRelative: false };
  }, [date, mounted, relative]);

  const isEmpty = !date;

  return (
    <span
      className={cn(
        variantClasses[isShowingRelative ? "relative" : variant],
        isEmpty && "text-muted-foreground",
        className
      )}
      title={date ? formatDate(date) : undefined}
      {...props}
    >
      {formatted}
    </span>
  );
}

export type { DateCellProps };
export { DateCell };
