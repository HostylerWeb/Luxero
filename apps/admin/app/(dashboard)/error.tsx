"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-20">
      <div className="flex size-14 items-center justify-center rounded-full border border-destructive/20 bg-destructive/10">
        <AlertTriangle className="size-7 text-destructive" aria-hidden="true" />
      </div>
      <h2 className="mt-6 text-xl font-bold text-foreground">Something went wrong</h2>
      <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <Button onClick={() => reset()} className="mt-6">
        Try again
      </Button>
    </div>
  );
}
