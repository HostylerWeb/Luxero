"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface QualitySliderFieldProps {
  id: string;
  label: string;
  description?: string;
  value: number;
  min?: number;
  max?: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}

export function QualitySliderField({
  id,
  label,
  description,
  value,
  min = 1,
  max = 100,
  disabled,
  onChange,
}: QualitySliderFieldProps) {
  const clamped = Math.min(max, Math.max(min, value));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <Label htmlFor={id}>{label}</Label>
          {description ? <p className="mt-1 text-xs text-muted-foreground">{description}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          <Input
            id={`${id}-number`}
            type="number"
            min={min}
            max={max}
            disabled={disabled}
            value={clamped}
            onChange={(e) => {
              const n = Number.parseInt(e.target.value, 10);
              if (Number.isFinite(n)) onChange(Math.min(max, Math.max(min, n)));
            }}
            className="h-9 w-20 tabular-nums"
          />
          <span className="text-sm text-muted-foreground">%</span>
        </div>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        disabled={disabled}
        value={clamped}
        onChange={(e) => onChange(Number.parseInt(e.target.value, 10))}
        className="h-2 w-full cursor-pointer accent-[var(--gold)] disabled:cursor-not-allowed disabled:opacity-50"
      />
      <div className="flex justify-between text-[10px] uppercase tracking-wide text-muted-foreground">
        <span>Smaller file</span>
        <span>Higher quality</span>
      </div>
    </div>
  );
}
