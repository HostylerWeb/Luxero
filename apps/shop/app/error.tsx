"use client";

import { TriangleAlert } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="flex size-16 items-center justify-center rounded-full border border-gold/20 bg-gold/10">
        <TriangleAlert className="size-8 text-gold" aria-hidden="true" />
      </div>
      <h1 className="mt-6 text-4xl font-bold text-gold">Something went wrong</h1>
      <p className="mt-3 max-w-md text-center text-muted-foreground">{error.message}</p>
      <button
        onClick={() => reset()}
        className={cn(buttonVariants({ variant: "default" }), "mt-8")}
      >
        Try Again
      </button>
    </div>
  );
}
