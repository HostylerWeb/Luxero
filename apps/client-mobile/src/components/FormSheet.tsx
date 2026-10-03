"use client";

import { Loader2 } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/utils";

import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";

export interface FormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  submitDisabled?: boolean;
  hideFooter?: boolean;
  size?: "default" | "wide" | "xl";
  onSubmit?: (event: React.SyntheticEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
  footerExtra?: React.ReactNode;
  contentClassName?: string;
}

const sizeClasses = {
  default: "sm:max-w-md",
  wide: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
} as const;

export function FormSheet({
  open,
  onOpenChange,
  title,
  description,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  isSubmitting = false,
  submitDisabled = false,
  hideFooter = false,
  size = "default",
  onSubmit,
  children,
  footerExtra,
  contentClassName,
}: FormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn(
          "flex w-full flex-col gap-0 overflow-hidden p-0",
          sizeClasses[size],
          contentClassName
        )}
      >
        <form onSubmit={onSubmit} className="flex h-full flex-col overflow-hidden">
          <SheetHeader className="border-b border-border/60 px-6 py-4">
            <SheetTitle>{title}</SheetTitle>
            {description ? <SheetDescription>{description}</SheetDescription> : null}
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

          {!hideFooter ? (
            <SheetFooter className="border-t border-border/60 bg-muted/20 px-6 py-3">
              {footerExtra}
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                {cancelLabel}
              </Button>
              <Button type="submit" disabled={submitDisabled || isSubmitting}>
                {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
                {submitLabel}
              </Button>
            </SheetFooter>
          ) : null}
        </form>
      </SheetContent>
    </Sheet>
  );
}
