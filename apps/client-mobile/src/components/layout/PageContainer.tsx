import { cn } from "@luxero/utils";
import type { ElementType, ReactNode } from "react";

const containerVariants = {
  wide: "luxero-container-wide",
  feature: "luxero-container-feature",
  medium: "luxero-container-medium",
  content: "luxero-container-content",
  narrow: "luxero-container-narrow",
  auth: "luxero-container-auth",
} as const;

export type PageContainerVariant = keyof typeof containerVariants;

export const pageContainerClass = (variant: PageContainerVariant = "wide") =>
  containerVariants[variant];

interface PageContainerProps {
  variant?: PageContainerVariant;
  as?: ElementType;
  className?: string;
  children: ReactNode;
}

export function PageContainer({
  variant = "wide",
  as: Tag = "div",
  className,
  children,
}: PageContainerProps) {
  return <Tag className={cn(containerVariants[variant], className)}>{children}</Tag>;
}
