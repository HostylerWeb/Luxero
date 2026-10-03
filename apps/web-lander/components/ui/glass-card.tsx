import * as React from "react";

import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "gold" | "surface";
  glow?: boolean;
}

export function GlassCard({
  children,
  className,
  variant = "default",
  glow = false,
}: GlassCardProps) {
  return (
    <div
      className={cn(
        // Structure
        "relative overflow-hidden",
        "rounded-2xl sm:rounded-3xl",
        // Glass fill
        "bg-[var(--glass-bg)]",
        // Backdrop
        "backdrop-blur-24",
        // Border
        "border border-[var(--glass-border)]",
        // Inner top-edge highlight
        "before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/10",
        // Transition
        "transition-all duration-[var(--duration-base)] ease-[var(--ease-luxury)]",
        // Glow on hover
        glow &&
          "hover:shadow-[0_0_40px_var(--color-gold-glow)] hover:border-[var(--color-gold)]/30",
        // Variant
        variant === "gold" && "border-[var(--color-gold)]/20 bg-[var(--color-gold)]/5",
        variant === "surface" && "bg-[var(--color-surface)]/80",
        className
      )}
    >
      {children}
    </div>
  );
}
