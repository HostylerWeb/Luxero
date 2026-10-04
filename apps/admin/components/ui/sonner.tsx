"use client";

import type { CSSProperties } from "react";
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const toastStyleVars = {
  "--normal-bg": "var(--sonner-normal-bg)",
  "--normal-bg-hover": "var(--sonner-normal-bg-hover)",
  "--normal-text": "var(--sonner-normal-text)",
  "--normal-border": "var(--sonner-normal-border)",
  "--normal-border-hover": "var(--sonner-normal-border-hover)",
  "--success-bg": "var(--sonner-success-bg)",
  "--success-border": "var(--sonner-success-border)",
  "--success-text": "var(--sonner-success-text)",
  "--error-bg": "var(--sonner-error-bg)",
  "--error-border": "var(--sonner-error-border)",
  "--error-text": "var(--sonner-error-text)",
  "--warning-bg": "var(--sonner-warning-bg)",
  "--warning-border": "var(--sonner-warning-border)",
  "--warning-text": "var(--sonner-warning-text)",
  "--info-bg": "var(--sonner-info-bg)",
  "--info-border": "var(--sonner-info-border)",
  "--info-text": "var(--sonner-info-text)",
  "--border-radius": "var(--radius-lg)",
  "--width": "22rem",
  "--gap": "0.625rem",
} as CSSProperties;

const toastClassNames = {
  toast:
    "group toast !font-sans !shadow-md !border !backdrop-blur-sm [&_[data-icon]]:!text-current",
  title: "!text-sm !font-semibold !leading-snug !text-foreground",
  description: "!text-sm !leading-snug !text-muted-foreground",
  closeButton:
    "!border-border !bg-secondary/80 !text-muted-foreground hover:!bg-secondary hover:!text-foreground !transition-colors",
  actionButton:
    "!bg-primary !text-primary-foreground !border-0 !font-medium hover:!opacity-90",
  cancelButton:
    "!bg-secondary !text-secondary-foreground !border-border !font-medium hover:!opacity-90",
  success: "!text-success [&_[data-icon]]:!text-success",
  error: "!text-destructive [&_[data-icon]]:!text-destructive",
  warning: "!text-warning [&_[data-icon]]:!text-warning",
  info: "!text-primary [&_[data-icon]]:!text-primary",
  loading: "[&_[data-icon]]:!text-primary",
} satisfies NonNullable<ToasterProps["toastOptions"]>["classNames"];

function Toaster({ ...props }: ToasterProps) {
  const { resolvedTheme } = useTheme();

  return (
    <Sonner
      theme={resolvedTheme === "light" ? "light" : "dark"}
      className="toaster group"
      position="bottom-right"
      closeButton
      visibleToasts={4}
      duration={4500}
      offset={{ bottom: "1.25rem", right: "1.25rem" }}
      icons={{
        success: <CircleCheckIcon className="size-4 shrink-0" aria-hidden />,
        info: <InfoIcon className="size-4 shrink-0" aria-hidden />,
        warning: <TriangleAlertIcon className="size-4 shrink-0" aria-hidden />,
        error: <OctagonXIcon className="size-4 shrink-0" aria-hidden />,
        loading: <Loader2Icon className="size-4 shrink-0 animate-spin" aria-hidden />,
      }}
      style={toastStyleVars}
      toastOptions={{
        classNames: toastClassNames,
      }}
      {...props}
    />
  );
}

export { Toaster };
