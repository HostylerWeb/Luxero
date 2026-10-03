"use client";

import { FeaturedCompetitionsSection } from "@/components/home/FeaturedCompetitionsSection";
import { PageActionButtons } from "@/components/layout/PageActionButtons";
import { useTranslation } from "@/lib/i18n";

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex flex-1 flex-col pt-14">
        <div className="mx-auto w-full max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
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
          <h1 className="mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground text-balance">
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
                  "data-umami-event": "not-found:go-back",
                },
                {
                  label: t("notFound.backToHome"),
                  href: "/",
                  variant: "gold",
                  "data-umami-event": "not-found:go-home",
                },
              ]}
            />
          </div>
        </div>
        <FeaturedCompetitionsSection className="pt-4" />
      </main>
    </div>
  );
}
