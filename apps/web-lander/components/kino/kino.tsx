"use client";
import { type ReactNode, useEffect } from "react";
import { scrollTracker } from "./store";

interface KinoProps {
  children: ReactNode;
}

export function Kino({ children }: KinoProps) {
  useEffect(() => {
    scrollTracker.start();
    return () => scrollTracker.stop();
  }, []);

  return <>{children}</>;
}
