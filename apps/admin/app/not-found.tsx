import { FileQuestion } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4">
      <div className="flex size-16 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
        <FileQuestion className="size-8 text-primary" aria-hidden="true" />
      </div>
      <h1 className="mt-6 text-5xl font-bold tabular-nums text-primary">404</h1>
      <p className="mt-3 text-lg text-muted-foreground">Page not found</p>
      <p className="mt-1 max-w-md text-center text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Button asChild className="mt-8">
        <Link href="/">Go to Dashboard</Link>
      </Button>
    </div>
  );
}
