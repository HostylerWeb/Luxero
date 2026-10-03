import { cn } from "@/lib/utils";

export const LUXERO_LOGO_FONT = "'Plus Jakarta Sans', system-ui, sans-serif";

interface LuxeroLogoBaseProps {
  className?: string;
  "aria-label"?: string;
  "aria-hidden"?: boolean;
}

export interface LuxeroLogoProps extends LuxeroLogoBaseProps {}

export function LuxeroLogo({
  className,
  "aria-label": ariaLabel = "Luxero",
  "aria-hidden": ariaHidden,
}: LuxeroLogoProps) {
  return (
    <svg
      viewBox="0 0 100 28"
      className={className}
      aria-label={ariaHidden ? undefined : ariaLabel}
      aria-hidden={ariaHidden}
      role={ariaHidden ? undefined : "img"}
    >
      <text
        x="50"
        y="22"
        textAnchor="middle"
        fontFamily={LUXERO_LOGO_FONT}
        fontWeight="700"
        fontSize="20"
        fill="currentColor"
        letterSpacing="0.2"
      >
        Luxero
      </text>
    </svg>
  );
}

export interface LuxeroLogoSquareProps extends LuxeroLogoBaseProps {}

export function LuxeroLogoSquare({
  className,
  "aria-label": ariaLabel = "Luxero",
  "aria-hidden": ariaHidden,
}: LuxeroLogoSquareProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-label={ariaHidden ? undefined : ariaLabel}
      aria-hidden={ariaHidden}
      role={ariaHidden ? undefined : "img"}
    >
      <rect
        x="1"
        y="1"
        width="30"
        height="30"
        rx="6"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.5"
      />
      <text
        x="16"
        y="22"
        textAnchor="middle"
        fontFamily={LUXERO_LOGO_FONT}
        fontWeight="700"
        fontSize="16"
        fill="currentColor"
      >
        L
      </text>
    </svg>
  );
}

export interface LogoSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const spinnerSizes = {
  sm: "h-5 w-auto",
  md: "h-8 w-auto",
  lg: "h-12 w-auto",
} as const;

export function LogoSpinner({ className, size = "md" }: LogoSpinnerProps) {
  return (
    <LuxeroLogo
      className={cn(spinnerSizes[size], "text-gold animate-logo-pulse", className)}
      aria-hidden
    />
  );
}
