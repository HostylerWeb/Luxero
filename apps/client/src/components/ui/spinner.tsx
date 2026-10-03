import { Loader2Icon } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const spinnerSizes = {
  xs: "size-3",
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
  xl: "size-8",
} as const;

type SpinnerSize = keyof typeof spinnerSizes;

interface SpinnerProps extends ComponentProps<"svg"> {
  size?: SpinnerSize;
}

function Spinner({ className, size, "aria-hidden": ariaHidden, ...props }: SpinnerProps) {
  return (
    <Loader2Icon
      role={ariaHidden ? undefined : "status"}
      aria-label={ariaHidden ? undefined : "Loading"}
      aria-busy={ariaHidden ? undefined : true}
      aria-hidden={ariaHidden}
      className={cn(
        "shrink-0 text-gold animate-spin",
        size ? spinnerSizes[size] : "size-4",
        className
      )}
      {...props}
    />
  );
}

export type { SpinnerProps, SpinnerSize };
export { Spinner, spinnerSizes };
