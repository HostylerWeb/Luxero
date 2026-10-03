export function ProgressBar({ percentage }: { percentage: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
      <div
        className="h-full rounded-full bg-gradient-to-r from-[var(--color-gold)] to-amber-400 transition-all duration-700 ease-[var(--ease-premium)]"
        style={{ width: `${Math.min(100, percentage)}%` }}
      />
    </div>
  );
}
