export default function StudioLoading() {
  return (
    <div className="flex h-dvh w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="size-12 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Preparing draw studio…</p>
      </div>
    </div>
  );
}
