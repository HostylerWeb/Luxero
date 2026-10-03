"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function PaytriotRedirectInner() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") ?? "";
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError("Missing order ID");
      return;
    }

    let cancelled = false;

    async function submit() {
      try {
        const res = await fetch(`/api/payments/paytriot/form?orderId=${orderId}`);
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error((json as any)?.message ?? "Failed to load payment form");
        }
        const json = await res.json();
        const formHtml = (json.data as any)?.formHtml as string;
        if (!formHtml) {
          throw new Error("Payment form not found");
        }

        if (cancelled) return;
        const container = document.getElementById("paytriot-form-container");
        if (!container) throw new Error("Container element not found");
        container.innerHTML = formHtml;
        const form = container.querySelector("form");
        if (!form) throw new Error("Form element not found");
        form.submit();
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to submit payment");
      }
    }

    submit();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (error) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-xl font-bold text-destructive">Payment Error</h1>
          <p className="text-muted-foreground">{error}</p>
          <a href="/checkout?payment=failed" className="text-sm underline">
            Return to checkout
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-muted-foreground">Redirecting to secure payment page...</p>
        <div id="paytriot-form-container" className="hidden" />
      </div>
    </main>
  );
}

export default function PaytriotRedirectPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[60vh] items-center justify-center">
          <p>Loading...</p>
        </main>
      }
    >
      <PaytriotRedirectInner />
    </Suspense>
  );
}
