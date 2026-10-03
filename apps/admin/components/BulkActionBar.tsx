"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export interface BulkActionItem {
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
  disabled?: boolean;
}

interface BulkActionBarProps {
  selectedCount: number;
  actions: BulkActionItem[];
  children?: ReactNode;
}

export function BulkActionBar({ selectedCount, actions, children }: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg border">
      <span className="text-sm text-muted-foreground font-medium whitespace-nowrap">
        {selectedCount} selected
      </span>
      <div className="flex gap-1">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant={action.variant ?? "outline"}
            size="sm"
            onClick={action.onClick}
            disabled={action.disabled}
          >
            {action.label}
          </Button>
        ))}
      </div>
      {children}
    </div>
  );
}
