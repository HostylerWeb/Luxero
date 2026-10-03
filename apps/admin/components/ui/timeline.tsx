import * as React from "react";
import { cn } from "@/lib/utils";

type TimelineElement = React.ElementRef<"ol">;
type TimelineProps = React.ComponentPropsWithoutRef<"ol"> & {
  ref?: React.Ref<TimelineElement>;
};

function Timeline({ className, ref, ...props }: TimelineProps) {
  return (
    <ol
      ref={ref}
      data-slot="timeline"
      className={cn("relative flex flex-col gap-4 border-s ps-6", className)}
      {...props}
    />
  );
}

type TimelineItemElement = React.ElementRef<"li">;
type TimelineItemProps = React.ComponentPropsWithoutRef<"li"> & {
  ref?: React.Ref<TimelineItemElement>;
};

function TimelineItem({ className, ref, ...props }: TimelineItemProps) {
  return (
    <li
      ref={ref}
      data-slot="timeline-item"
      className={cn("relative flex flex-col gap-1", className)}
      {...props}
    />
  );
}

type TimelineDotElement = React.ElementRef<"span">;
type TimelineDotProps = React.ComponentPropsWithoutRef<"span"> & {
  ref?: React.Ref<TimelineDotElement>;
  tone?: "neutral" | "success" | "warning" | "destructive" | "info";
};

function TimelineDot({ className, ref, tone = "neutral", ...props }: TimelineDotProps) {
  const toneClasses = {
    neutral: "border-muted-foreground/40 bg-background text-muted-foreground",
    success: "border-emerald-500/60 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    warning: "border-amber-500/60 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    destructive: "border-red-500/60 bg-red-500/10 text-red-600 dark:text-red-400",
    info: "border-sky-500/60 bg-sky-500/10 text-sky-600 dark:text-sky-400",
  } as const;
  return (
    <span
      ref={ref}
      data-slot="timeline-dot"
      className={cn(
        "absolute -start-[33px] top-1 inline-flex h-6 w-6 items-center justify-center rounded-full border-2",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}

type TimelineContentElement = React.ElementRef<"div">;
type TimelineContentProps = React.ComponentPropsWithoutRef<"div"> & {
  ref?: React.Ref<TimelineContentElement>;
};

function TimelineContent({ className, ref, ...props }: TimelineContentProps) {
  return (
    <div
      ref={ref}
      data-slot="timeline-content"
      className={cn("flex flex-col gap-1 text-sm", className)}
      {...props}
    />
  );
}

type TimelineTimeElement = React.ElementRef<"time">;
type TimelineTimeProps = React.ComponentPropsWithoutRef<"time"> & {
  ref?: React.Ref<TimelineTimeElement>;
};

function TimelineTime({ className, ref, ...props }: TimelineTimeProps) {
  return (
    <time
      ref={ref}
      data-slot="timeline-time"
      className={cn(
        "font-mono text-[11px] uppercase tracking-wide text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

type TimelineTitleElement = React.ElementRef<"p">;
type TimelineTitleProps = React.ComponentPropsWithoutRef<"p"> & {
  ref?: React.Ref<TimelineTitleElement>;
};

function TimelineTitle({ className, ref, ...props }: TimelineTitleProps) {
  return (
    <p
      ref={ref}
      data-slot="timeline-title"
      className={cn("font-medium leading-tight", className)}
      {...props}
    />
  );
}

type TimelineDescriptionElement = React.ElementRef<"p">;
type TimelineDescriptionProps = React.ComponentPropsWithoutRef<"p"> & {
  ref?: React.Ref<TimelineDescriptionElement>;
};

function TimelineDescription({ className, ref, ...props }: TimelineDescriptionProps) {
  return (
    <p
      ref={ref}
      data-slot="timeline-description"
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Timeline,
  TimelineContent,
  TimelineDescription,
  TimelineDot,
  TimelineItem,
  TimelineTime,
  TimelineTitle,
};
