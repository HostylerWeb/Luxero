import { AuthProvider, QueryProvider } from "@luxero/api-client";
import type { PublicComplianceSettings, SessionUser } from "@luxero/types";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { usePageContext } from "vike-react/usePageContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { HeaderMobileNavProvider } from "@/components/layout/header-mobile-nav";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PwaInstallPrompt } from "@/components/layout/PwaInstallPrompt";
import { RoutePrefetcher } from "@/components/layout/RoutePrefetcher";
import { ReferralRefGateIsland } from "@/components/providers/ReferralRefGateIsland";
import { ScrollLockFix } from "@/components/ScrollLockFix";
import { ThemeProvider } from "@/components/ThemeProvider";
import { initHydrationDiffDetector } from "@/lib/hydration-diff-detector";
import { LocaleProvider } from "@/lib/i18n";

export default function Layout({
  children,
  user,
}: {
  children: React.ReactNode;
  user: SessionUser | null;
}) {
  const pageContext = usePageContext();
  const complianceData = (
    pageContext as { complianceFeaturesData?: { data?: PublicComplianceSettings } }
  ).complianceFeaturesData;
  const guestCheckoutEnabled = complianceData?.data?.guestCheckoutEnabled;

  useEffect(() => {
    initHydrationDiffDetector();
  }, []);

  return (
    <ErrorBoundary>
      <LocaleProvider locale={pageContext.locale ?? "en"}>
        <ThemeProvider defaultTheme="dark" storageKey="luxero-theme">
          <AuthProvider initialUser={user} guestCheckoutEnabled={guestCheckoutEnabled}>
            <QueryProvider>
              <ReferralRefGateIsland />
              <ScrollLockFix />
              <HeaderMobileNavProvider>
                <PublicLayout>{children}</PublicLayout>
                <PwaInstallPrompt />
                <RoutePrefetcher />
                <Toaster position="bottom-right" />
              </HeaderMobileNavProvider>
            </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </LocaleProvider>
    </ErrorBoundary>
  );
}
