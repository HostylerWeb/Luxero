import { FileQuestion } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4">
      <div className="flex size-16 items-center justify-center rounded-full border border-gold/20 bg-gold/10">
        <FileQuestion className="size-8 text-gold" aria-hidden="true" />
      </div>
      <h1 className="mt-6 text-5xl font-bold tabular-nums text-gold">404</h1>
      <p className="mt-3 text-lg text-muted-foreground">Page not found</p>
      <p className="mt-1 max-w-md text-center text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/" className={cn(buttonVariants({ variant: "default" }), "mt-8")}>
        Go Home
      </Link>
    </div>
  );
}
