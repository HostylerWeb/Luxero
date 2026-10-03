"use client";

import { useTranslation } from "@/lib/i18n";
import { DashboardListViewModeToggle } from "./DashboardListViewModeToggle";
import type { WinViewMode } from "./win-view-mode";

interface WinViewModeToggleProps {
  value: WinViewMode;
  onChange: (mode: WinViewMode) => void;
  className?: string;
}

export function WinViewModeToggle({ value, onChange, className }: WinViewModeToggleProps) {
  const { t } = useTranslation();
  return (
    <DashboardListViewModeToggle
      value={value}
      onChange={onChange}
      ariaLabel={t("dashboard.wins.instantWinsAria")}
      className={className}
    />
  );
}
