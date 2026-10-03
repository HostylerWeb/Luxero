import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorDisplayProps {
  message?: string;
  /** If provided, renders a reload button that navigates to the URL */
  retryHref?: string;
}

export function ErrorDisplay({ message, retryHref }: ErrorDisplayProps) {
  const detail = message ?? "Something went wrong while loading this competition.";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--color-bg-deep)] px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 ring-1 ring-red-500/30">
        <AlertCircle className="h-7 w-7 text-red-400" />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold text-white">Unable to load competition</h1>
        <p className="max-w-sm text-sm leading-relaxed text-white/50">{detail}</p>
      </div>

      {retryHref && (
        <a href={retryHref}>
          <Button variant="outline" className="gap-2 border-white/20 text-white hover:bg-white/10">
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        </a>
      )}
    </div>
  );
}
