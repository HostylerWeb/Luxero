import { Skeleton } from "@/components/ui/skeleton";

export function CompetitionLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-deep)]">
      {/* Sticky header skeleton */}
      <div className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-white/10 bg-[var(--color-bg-deep)]/80 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-5xl items-center justify-between px-6">
          <Skeleton className="h-5 w-32 bg-white/10" />
          <Skeleton className="h-9 w-28 rounded-full bg-white/10" />
        </div>
      </div>

      {/* Hero skeleton */}
      <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 pt-14">
        <Skeleton className="h-6 w-24 rounded-full bg-white/10" />
        <Skeleton className="h-12 w-2/3 max-w-xl bg-white/10" />
        <Skeleton className="h-6 w-1/2 max-w-md bg-white/10" />
        <div className="mt-4 aspect-[16/9] w-full max-w-2xl overflow-hidden rounded-2xl">
          <Skeleton className="h-full w-full bg-white/10" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-12 w-36 rounded-full bg-white/10" />
          <Skeleton className="h-12 w-28 rounded-full bg-white/10" />
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 px-6 py-16 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 p-6"
          >
            <Skeleton className="h-8 w-24 bg-white/10" />
            <Skeleton className="h-4 w-16 bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  );
}
