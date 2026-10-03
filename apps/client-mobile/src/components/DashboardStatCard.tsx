import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

type Variant = "gold" | "emerald" | "purple";

interface DashboardStatCardProps {
  title?: string;
  value?: string | number;
  subtitle?: string;
  subValue?: string;
  icon: React.ElementType;
  variant?: Variant;
  isLoading?: boolean;
  isHero?: boolean;
  compact?: boolean;
}

const variantAccent: Record<Variant, string> = {
  gold: "border-l-primary/50",
  emerald: "border-l-success/50",
  purple: "border-l-chart-4/50",
};

const variantIcon: Record<Variant, string> = {
  gold: "text-primary border-primary/20 bg-primary/5",
  emerald: "text-success border-success/20 bg-success/5",
  purple: "text-chart-4 border-chart-4/20 bg-chart-4/5",
};

function DashboardStatCard({
  title,
  value,
  subtitle,
  subValue,
  icon: Icon,
  variant = "gold",
  isLoading = false,
  isHero = false,
  compact = false,
}: DashboardStatCardProps) {
  const { t } = useTranslation();
  const headerClass = compact
    ? "flex flex-row items-center justify-between gap-1.5 px-3 pt-3 pb-0.5"
    : "flex flex-row items-center justify-between gap-2 px-4 pt-3.5 pb-1";
  const contentClass = compact ? "px-3 pt-0 pb-3" : "px-4 pt-0 pb-3.5";
  const iconBoxClass = compact ? "size-6 [&_svg]:size-3" : "size-7 [&_svg]:size-3.5";
  const valueClass = compact ? "text-lg sm:text-xl" : isHero ? "text-2xl" : "text-xl";

  return (
    <Card
      className={cn(
        "min-w-0 w-full gap-0 border-border/70 border-l-2 py-0 shadow-sm transition-colors hover:border-border",
        variantAccent[variant],
        isHero && "lg:col-span-2"
      )}
    >
      {isLoading ? (
        <>
          <CardHeader className={headerClass}>
            <Skeleton className={cn("h-3", compact ? "w-14" : "w-20")} shimmer />
            <Skeleton className={cn("rounded-md", iconBoxClass)} shimmer />
          </CardHeader>
          <CardContent className={cn("flex flex-col gap-2", contentClass)}>
            <Skeleton className={cn("w-3/5", compact ? "h-6" : "h-7")} shimmer />
            <Skeleton className="h-3 w-2/5" shimmer />
          </CardContent>
        </>
      ) : (
        <>
          <CardHeader className={headerClass}>
            <p
              className={cn(
                "min-w-0 text-xs font-medium text-muted-foreground",
                compact && "truncate whitespace-nowrap"
              )}
            >
              {title}
            </p>
            <div
              className={cn(
                "flex shrink-0 items-center justify-center rounded-md border",
                iconBoxClass,
                variantIcon[variant]
              )}
            >
              <Icon aria-hidden="true" />
            </div>
          </CardHeader>
          <CardContent className={contentClass}>
            <p
              className={cn(
                "font-mono font-semibold tabular-nums tracking-tight text-foreground",
                valueClass
              )}
            >
              {value ?? t("dashboard.statFallback")}
            </p>
            {subtitle ? (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {subValue ? (
                  <>
                    <span className="font-medium text-foreground">{subValue}</span> {subtitle}
                  </>
                ) : (
                  subtitle
                )}
              </p>
            ) : null}
          </CardContent>
        </>
      )}
    </Card>
  );
}

export type { DashboardStatCardProps };
export { DashboardStatCard };
