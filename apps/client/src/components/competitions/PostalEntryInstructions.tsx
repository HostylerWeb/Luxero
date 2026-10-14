"use client";

import { getPostalEntryCompanyDetails } from "@luxero/content/contact";
import { AlertCircle, Check } from "@luxero/icons";
import { type TranslationKey, useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function formatPostalAddress(address: string): string[] {
  return address
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

type PostalEntryInstructionsProps = {
  /** Admin compliance override; falls back to @luxero/content/contact company address. */
  postalAddressOverride?: string;
  competitionTitle?: string;
  competitionQuestion?: string | null;
  className?: string;
};

export function PostalEntryInstructions({
  postalAddressOverride,
  competitionTitle,
  competitionQuestion,
  className,
}: PostalEntryInstructionsProps) {
  const { t, locale } = useTranslation();
  const company = getPostalEntryCompanyDetails(locale);
  const postalAddress = postalAddressOverride?.trim() || company.defaultAddress;
  const addressLines = formatPostalAddress(postalAddress);

  return (
    <div className={cn("space-y-4 lg:space-y-5 text-sm text-white", className)}>
      <p className="leading-relaxed">{t("staticPages.freePostalEntry.intro")}</p>

      {competitionTitle ? (
        <div className="rounded-xl border border-gold/25 bg-gold/5 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-gold">
            {t("competitions.detail.postalCompetitionLabel")}
          </p>
          <p className="mt-1 font-semibold text-white leading-snug">{competitionTitle}</p>
          {competitionQuestion ? (
            <>
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-gold/90">
                {t("competitions.detail.postalQuestionLabel")}
              </p>
              <p className="mt-1 text-white leading-snug">{competitionQuestion}</p>
            </>
          ) : null}
        </div>
      ) : null}

      <div className="rounded-xl border border-gold/20 bg-gradient-to-br from-gold/10 to-gold/5 p-4">
        <h3 className="font-semibold text-white mb-2">{t("staticPages.freePostalEntry.sendTo")}</h3>
        <p className="font-medium text-white leading-relaxed">
          {company.postalDisplayName}
          <br />
          {addressLines.map((line, i) => (
            <span key={i}>
              {line}
              <br />
            </span>
          ))}
        </p>
        <p className="text-xs text-white/90 mt-2">{company.companyRegistration}</p>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-white">{t("staticPages.freePostalEntry.includeHeading")}</h3>
        <ul className="space-y-2">
          {(
            t("staticPages.freePostalEntry.includeItems" as TranslationKey) as unknown as string[]
          ).map((item) => (
            <li key={item} className="flex items-start gap-2 text-white">
              <Check className="mt-0.5 size-4 shrink-0 text-gold" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3">
        <p className="text-white font-medium flex items-start gap-2 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
          {t("staticPages.freePostalEntry.warning")}
        </p>
      </div>

      <div className="space-y-3 text-white leading-relaxed">
        {(
          t("staticPages.freePostalEntry.terms" as TranslationKey) as unknown as string[]
        ).map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}
