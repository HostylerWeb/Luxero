"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="font-display text-4xl font-bold text-[var(--color-gold)]">
        Something went wrong
      </h1>
      <p className="max-w-md text-[var(--color-muted)]">
        We encountered an unexpected error. Please try again or come back later.
      </p>
      <button
        onClick={reset}
        className="rounded-md bg-[var(--color-gold)] px-6 py-3 font-semibold text-black transition-opacity hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
