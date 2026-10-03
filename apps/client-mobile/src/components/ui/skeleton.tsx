import { cn } from "@/lib/utils";

interface SkeletonProps extends React.ComponentProps<"div"> {
  shimmer?: boolean;
}

function Skeleton({ className, shimmer = false, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(
        "rounded-md border border-[var(--gold)]/25 bg-[var(--gold)]/8 skeleton-default",
        shimmer && "skeleton-shimmer",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
