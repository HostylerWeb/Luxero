"use client";

import { deriveComplianceFeatures } from "@luxero/api-client";
import { usePageContext } from "vike-react/usePageContext";
import { GoldOutlineButton } from "@/components/buttons";
import { PostalEntryInstructions } from "@/components/competitions/PostalEntryInstructions";
import { Link } from "@/components/Link";
import { useTranslation } from "@/lib/i18n";
import { useRouter } from "@/lib/navigation";

export default function FreePostalEntryPage() {
  const { t } = useTranslation();
  const pageContext = usePageContext();
  const features = deriveComplianceFeatures(pageContext.complianceFeaturesData?.data, false);
  const router = useRouter();

  if (!features.postalProminence) {
    router.replace("/competitions");
    return null;
  }

  const postalAddressOverride = features.postalEntryAddress.trim() || undefined;

  return (
    <div className="luxero-container-narrow pb-8">
      <div className="py-5 lg:py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-balance">
            {t("staticPages.freePostalEntry.heading")}
          </h1>
          <p className="text-xl text-muted-foreground">
            {t("staticPages.freePostalEntry.subtitle")}
          </p>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] mb-8">
          <div className="p-1.5 rounded-[2rem] bg-white/5 ring-1 ring-white/10">
            <div className="rounded-[calc(2rem-0.375rem)] bg-card p-6 sm:p-8">
              <PostalEntryInstructions postalAddressOverride={postalAddressOverride} />
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <GoldOutlineButton size="lg" asChild>
            <Link href="/competitions">{t("staticPages.freePostalEntry.browseCompetitions")}</Link>
          </GoldOutlineButton>
        </div>
      </div>
    </div>
  );
}
