interface StripePanelProps {
  isSubmitting?: boolean;
  errorMessage?: string;
}

export function StripePanel({ isSubmitting = false, errorMessage = "" }: StripePanelProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
      {isSubmitting ? (
        <span className="text-foreground">Redirecting to payment…</span>
      ) : (
        "You will be redirected to Stripe&apos;s secure checkout page to complete your payment."
      )}
      {errorMessage ? <p className="mt-2 text-destructive">{errorMessage}</p> : null}
    </div>
  );
}
