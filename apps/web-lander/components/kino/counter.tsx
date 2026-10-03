"use client";
import { useEffect, useState } from "react";
import { clamp, EASINGS, lerp, useKinoStore } from "./store";

interface CounterProps {
  from: number;
  to: number;
  at?: number;
  span?: number;
  format?: (value: number) => string;
  easing?: string | ((t: number) => number);
  progress?: number;
  className?: string;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mql.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return reduced;
}

function resolveEasing(easing?: string | ((t: number) => number)) {
  if (typeof easing === "function") return easing;
  if (typeof easing === "string" && EASINGS[easing]) return EASINGS[easing];
  return EASINGS["ease-out"];
}

function isInteger(n: number): boolean {
  return Number.isInteger(n);
}

const defaultFormat = (n: number): string => n.toLocaleString();

export function Counter({
  from,
  to,
  at = 0,
  span = 0.3,
  format = defaultFormat,
  easing,
  progress: progressProp,
  className,
}: CounterProps) {
  const pageProgress = useKinoStore((s) => s.progress);
  const progress = progressProp ?? pageProgress;
  const reducedMotion = usePrefersReducedMotion();
  const easingFn = resolveEasing(easing);

  if (reducedMotion && progress >= at) {
    return <span className={className}>{format(to)}</span>;
  }

  const rawT = span > 0 ? (progress - at) / span : progress >= at ? 1 : 0;
  const t = clamp(rawT, 0, 1);
  const easedT = easingFn(t);
  let value = lerp(from, to, easedT);

  if (isInteger(from) && isInteger(to)) {
    value = Math.round(value);
  }

  return <span className={className}>{format(value)}</span>;
}
