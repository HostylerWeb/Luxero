import { ShieldX } from "lucide-react";
import { GoldOutlineButton } from "@/components/buttons";
import { Link } from "@/components/Link";
import { BackButton } from "@/components/shared/BackButton";
import { useTranslation } from "@/lib/i18n";

export default function AccessDeniedPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-1 items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl py-16 text-center">
        <div className="mb-8">
          <div className="mb-6 inline-flex size-16 items-center justify-center rounded-full bg-red-500/10">
            <ShieldX className="size-8 text-red-400" />
          </div>
          <h1 className="mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground text-balance">
            {t("accessDenied.heading")}
          </h1>
          <p className="text-lg text-muted-foreground">{t("accessDenied.description")}</p>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <BackButton />
          <GoldOutlineButton asChild size="lg">
            <Link href="/" data-umami-event="access-denied:go-home">
              {t("accessDenied.backToHome")}
            </Link>
          </GoldOutlineButton>
        </div>
      </div>
    </div>
  );
}
