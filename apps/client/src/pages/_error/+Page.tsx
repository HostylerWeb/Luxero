"use client";

import { NotFoundView } from "@/components/NotFoundView";
import { ServerErrorView } from "@/components/ServerErrorView";
import { usePageContext } from "vike-react/usePageContext";

function isNotFoundPage(pageContext: ReturnType<typeof usePageContext>): boolean {
  if (pageContext.is404 === true) return true;
  if (pageContext.abortStatusCode === 404) return true;
  return false;
}

function resolveErrorMessage(abortReason: unknown): string | undefined {
  if (abortReason && typeof abortReason === "object" && "message" in abortReason) {
    const msg = String((abortReason as { message: unknown }).message).trim();
    return msg || undefined;
  }
  if (typeof abortReason === "string") {
    const msg = abortReason.trim();
    return msg || undefined;
  }
  return undefined;
}

export default function ErrorPage() {
  const pageContext = usePageContext();

  if (isNotFoundPage(pageContext)) {
    return <NotFoundView />;
  }

  return <ServerErrorView message={resolveErrorMessage(pageContext.abortReason)} />;
}
