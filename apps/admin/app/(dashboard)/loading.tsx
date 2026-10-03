import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex flex-1 flex-col gap-5 p-4 md:p-6 lg:p-8">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-8 w-48" shimmer />
            <Skeleton className="h-5 w-80" shimmer />
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-8 w-40" shimmer />
          <Skeleton className="h-8 w-32" shimmer />
          <Skeleton className="h-8 w-28" shimmer />
        </div>

        <div className="flex flex-col gap-2 rounded-lg border border-border bg-card/40 p-2">
          <div className="flex items-center gap-2 border-b border-border/60 px-2 pb-2">
            <Skeleton className="h-4 flex-1" shimmer />
            <Skeleton className="h-4 w-20" shimmer />
            <Skeleton className="h-4 w-20" shimmer />
            <Skeleton className="h-4 w-20" shimmer />
            <Skeleton className="h-4 w-20" shimmer />
          </div>
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="flex items-center gap-2 px-2 py-1.5">
              <Skeleton className="h-4 flex-1" shimmer />
              <Skeleton className="h-4 w-20" shimmer />
              <Skeleton className="h-4 w-20" shimmer />
              <Skeleton className="h-4 w-20" shimmer />
              <Skeleton className="h-4 w-20" shimmer />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
