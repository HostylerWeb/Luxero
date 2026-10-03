"use client";

import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import type { StripePaymentElementOptions } from "@stripe/stripe-js";
import { useCallback, useRef, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency, useTranslation } from "@/lib/i18n";

interface StripeCheckoutUIProps {
  environment: "test" | "live";
  sessionId: string;
  orderId: string;
  total: number;
  onSuccess: () => void;
  onProcessingChange?: (processing: boolean) => void;
  onResetSession?: () => void;
}

export function StripeCheckoutUI({
  environment,
  sessionId,
  orderId,
  total,
  onSuccess,
  onProcessingChange,
  onResetSession,
}: StripeCheckoutUIProps) {
  const { t, locale } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const [isElementReady, setIsElementReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const processingRef = useRef(false);

  const setProcessingState = useCallback(
    (processing: boolean) => {
      setIsProcessing(processing);
      onProcessingChange?.(processing);
    },
    [onProcessingChange]
  );

  const handleSubmit = useCallback(async () => {
    if (!stripe || !elements || processingRef.current) return;

    processingRef.current = true;
    setProcessingState(true);
    setErrorMessage(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setProcessingState(false);
      processingRef.current = false;
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?provider=stripe&session_id=${sessionId}&order_id=${orderId}`,
      },
      redirect: "if_required",
    });

    if (error) {
      setProcessingState(false);
      processingRef.current = false;
      setErrorMessage(error.message ?? t("checkout.paymentError"));
      return;
    }

    onSuccess();
  }, [stripe, elements, sessionId, orderId, onSuccess, setProcessingState, t]);

  const paymentElementOptions: StripePaymentElementOptions = {
    layout: "tabs",
    wallets: {
      applePay: "auto",
      googlePay: "auto",
    },
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{environment === "live" ? "Live" : "Test"} mode</Badge>
      </div>

      {errorMessage ? (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      {loadError ? (
        <div className="flex flex-col gap-3">
          <Alert variant="destructive">
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              setLoadError(null);
              onResetSession?.();
            }}
            data-testid="stripe-resume-session-button"
          >
            {t("checkout.startNewPaymentSession")}
          </Button>
        </div>
      ) : null}

      <PaymentElement
        options={paymentElementOptions}
        onReady={() => setIsElementReady(true)}
        onLoadError={(event) => {
          setLoadError(event.error?.message ?? t("checkout.paymentFormLoadError"));
        }}
      />

      <Button
        onClick={handleSubmit}
        disabled={!stripe || !elements || !isElementReady || isProcessing}
        className="w-full"
        size="lg"
        data-testid="stripe-pay-button"
        data-umami-event="checkout:stripe-pay"
        data-umami-event-amount={total.toFixed(2)}
      >
        {isProcessing ? (
          <span className="flex items-center gap-2">
            <Spinner size="sm" />
            {t("checkout.processingPayment")}
          </span>
        ) : (
          <span className="flex items-center gap-2">
            {t("checkout.payWithCard", { amount: formatCurrency(total, locale) })}
          </span>
        )}
      </Button>
    </div>
  );
}
