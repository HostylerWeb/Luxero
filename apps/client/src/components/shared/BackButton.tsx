"use client";

import { GoldOutlineButton } from "@/components/buttons";
import { useTranslation } from "@/lib/i18n";

export function BackButton() {
  const { t } = useTranslation();
  return (
    <GoldOutlineButton
      onClick={() => window.history.back()}
      size="lg"
      type="button"
      data-umami-event="access-denied:go-back"
    >
      {t("common.goBack")}
    </GoldOutlineButton>
  );
}
