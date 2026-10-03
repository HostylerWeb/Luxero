"use client";

import React from "react";

const AR_MAP = {
  fade: "ar-fade",
  "fade-up": "ar-fade-up",
  scale: "ar-scale",
} as const;

export function AutoReveal({
  animation = "fade",
  delay = 0,
  children,
  className,
}: {
  animation?: "fade" | "fade-up" | "scale";
  delay?: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        animation: `${AR_MAP[animation]} 600ms cubic-bezier(0.32, 0.72, 0, 1) ${delay}ms both`,
      }}
    >
      {children}
    </div>
  );
}
