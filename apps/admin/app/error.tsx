"use client";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold text-gold mb-4">Something went wrong</h1>
      <p className="text-muted-foreground mb-8">{error.message}</p>
      <button
        onClick={() => reset()}
        className="inline-flex items-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground"
      >
        Try again
      </button>
    </div>
  );
}
