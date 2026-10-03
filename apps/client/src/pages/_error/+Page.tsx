"use client";

import { usePageContext } from "vike-react/usePageContext";
import { GoldButton } from "@/components/buttons";
import { useTranslation } from "@/lib/i18n";

export default function Page() {
  const { t } = useTranslation();
  const ctx = usePageContext();
  const { abortReason } = ctx;
  const message =
    abortReason && typeof abortReason === "object" && "message" in abortReason
      ? String(abortReason.message)
      : typeof abortReason === "string"
        ? abortReason
        : t("errorBoundary.unexpectedError");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gold text-balance">
        {t("errorBoundary.somethingWentWrong")}
      </h1>
      <p className="max-w-md text-muted-foreground">{message}</p>
      <GoldButton onClick={() => window.location.reload()} data-umami-event="error:reload">
        {t("errorBoundary.tryAgain")}
      </GoldButton>
    </div>
  );
}
