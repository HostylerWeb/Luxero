"use client";

import { useEffect, useState } from "react";

export function CountdownTimer({ targetDate }: { targetDate?: string }) {
  const [remaining, setRemaining] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    if (!targetDate) return;
    const target = new Date(targetDate).getTime();
    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      setRemaining({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (!remaining) return null;

  return (
    <div className="flex gap-3 sm:gap-5">
      {["days", "hours", "minutes", "seconds"].map((unit) => (
        <div key={unit} className="flex flex-col items-center">
          <span className="font-mono text-xl font-bold text-white sm:text-2xl tabular-nums">
            {String(remaining[unit]).padStart(2, "0")}
          </span>
          <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">
            {unit}
          </span>
        </div>
      ))}
    </div>
  );
}
