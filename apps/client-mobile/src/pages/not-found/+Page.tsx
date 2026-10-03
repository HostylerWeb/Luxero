"use client";

import { PageActionButtons } from "@/components/layout/PageActionButtons";
import { useTranslation } from "@/lib/i18n";

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="h-full overflow-y-auto flex flex-col justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 inline-flex size-16 items-center justify-center rounded-full bg-destructive/10">
          <svg
            className="size-8 text-destructive"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-foreground text-balance">
          {t("notFound.heading")}
        </h1>
        <p className="text-lg text-muted-foreground">{t("notFound.description")}</p>
        <div className="mt-8">
          <PageActionButtons
            actions={[
              {
                label: t("notFound.goBack"),
                onClick: () => window.history.back(),
                variant: "outline",
              },
              {
                label: t("notFound.backToHome"),
                href: "/",
                variant: "gold",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
