import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg font-semibold",
} as const;

interface PriceCellProps extends React.ComponentProps<"span"> {
  value: number | null | undefined;
  currency?: string;
  size?: "sm" | "md" | "lg";
}

function PriceCell({ value, currency = "GBP", size = "md", className, ...props }: PriceCellProps) {
  if (value == null) {
    return (
      <span
        className={cn(
          sizeClasses[size],
          "text-muted-foreground font-medium tabular-nums",
          className
        )}
        {...props}
      >
        --
      </span>
    );
  }

  const formatted = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  return (
    <span className={cn(sizeClasses[size], "font-medium tabular-nums", className)} {...props}>
      {formatted}
    </span>
  );
}

export type { PriceCellProps };
export { PriceCell };
