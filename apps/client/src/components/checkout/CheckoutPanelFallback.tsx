import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";

export function CheckoutPanelFallback() {
  const { t } = useTranslation();
  return (
    <div
      className="flex min-h-[12rem] flex-col justify-center gap-3"
      role="status"
      aria-busy="true"
      aria-label={t("checkout.loadingPaymentForm")}
    >
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}
