import type { ContextualError } from "@luxero/api-client";
import { resolveContextualErrorFromUnknown } from "@luxero/api-client";
import { toast } from "sonner";
import { ContextualErrorMessage } from "@/components/ContextualErrorMessage";

export function showContextualErrorToast(error: unknown, fallback: string) {
  const resolved = resolveContextualErrorFromUnknown(error, fallback);
  toast.error(<ContextualErrorMessage error={resolved} />);
}

export function showContextualError(resolved: ContextualError) {
  toast.error(<ContextualErrorMessage error={resolved} />);
}
