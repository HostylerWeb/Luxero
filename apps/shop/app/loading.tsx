export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="size-10 animate-spin rounded-full border-4 border-gold/30 border-t-gold" />
      <p className="mt-4 text-sm text-muted-foreground">Loading&hellip;</p>
    </div>
  );
}
