"use client";
import type { FormEventHandler, ReactNode } from "react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "../ui/sheet";

interface AdminFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingId: string | null;
  title: string;
  description?: string;
  isPending?: boolean;
  error?: string | null;
  footer?: ReactNode;
  className?: string;
  formId?: string;
  formClassName?: string;
  onSubmit?: FormEventHandler<HTMLFormElement>;
  children: ReactNode;
  onClose?: () => void;
  size?: "default" | "wide";
}

function AdminFormSheet({
  open,
  onOpenChange,
  editingId,
  title,
  description,
  isPending,
  error,
  footer,
  className,
  formId,
  formClassName,
  onSubmit,
  children,
  onClose,
  size = "default",
}: AdminFormSheetProps) {
  const isEdit = !!editingId;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const prevOpenRef = useRef(open);

  useEffect(() => {
    if (prevOpenRef.current && !open) {
      onCloseRef.current?.();
    }
    prevOpenRef.current = open;
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        {...(description ? {} : { "aria-describedby": undefined })}
        className={cn(
          "flex flex-col bg-card border-l border-gold/20 overflow-hidden p-0",
          size === "wide" ? "sm:max-w-3xl" : "sm:max-w-xl",
          "h-screen w-full sm:w-[90vw] sm:max-w-2xl",
          className
        )}
      >
        <div className="h-1 w-full bg-gradient-to-r from-gold-light via-gold to-gold-dark flex-shrink-0" />

        <div className="px-6 py-5 border-b border-gold/10 flex-shrink-0">
          <div className="flex items-center justify-between pr-8">
            <div>
              <SheetTitle className="text-xl font-bold text-foreground">
                {isEdit ? `Edit ${title}` : `New ${title}`}
              </SheetTitle>
              {description && (
                <SheetDescription className="text-muted-foreground text-sm mt-0.5">
                  {description}
                </SheetDescription>
              )}
            </div>
          </div>
        </div>

        {onSubmit ? (
          <form
            id={formId}
            onSubmit={onSubmit}
            className={cn("flex flex-col flex-1 overflow-hidden", formClassName)}
          >
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}
              {children}
            </div>

            <div className="px-6 py-5 border-t border-gold/10 bg-card/50 flex-shrink-0">
              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-gold hover:bg-gold-dark text-black font-semibold disabled:opacity-50"
                >
                  {isPending ? "Saving..." : isEdit ? `Update ${title}` : `Create ${title}`}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                  className="border-gold/20 text-foreground hover:bg-gold/10 hover:text-foreground"
                >
                  Cancel
                </Button>
                {footer}
              </div>
            </div>
          </form>
        ) : (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}
              {children}
            </div>

            <div className="px-6 py-5 border-t border-gold/10 bg-card/50 flex-shrink-0">
              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  disabled={isPending}
                  form={formId}
                  className="bg-gold hover:bg-gold-dark text-black font-semibold disabled:opacity-50"
                >
                  {isPending ? "Saving..." : isEdit ? `Update ${title}` : `Create ${title}`}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                  className="border-gold/20 text-foreground hover:bg-gold/10 hover:text-foreground"
                >
                  Cancel
                </Button>
                {footer}
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

export type { AdminFormSheetProps };
export { AdminFormSheet };
