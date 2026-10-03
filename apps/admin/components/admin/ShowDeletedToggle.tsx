"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface ShowDeletedToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  id?: string;
  className?: string;
  umamiEvent?: string;
}

export function ShowDeletedToggle({
  checked,
  onCheckedChange,
  label = "Show deleted",
  id = "show-deleted",
  className,
  umamiEvent,
}: ShowDeletedToggleProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-center gap-2 text-sm text-muted-foreground",
        className
      )}
      {...(umamiEvent ? { "data-umami-event": umamiEvent } : {})}
    >
      <Checkbox id={id} checked={checked} onCheckedChange={(v) => onCheckedChange(!!v)} />
      {label}
    </label>
  );
}
