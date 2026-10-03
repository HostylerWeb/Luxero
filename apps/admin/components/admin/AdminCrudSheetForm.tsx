"use client";
import type { FormEventHandler, ReactNode } from "react";
import { useId } from "react";
import { cn } from "@/lib/utils";
import { AdminFormSheet } from "./AdminFormSheet";

interface AdminCrudSheetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingId: string | null;
  title: string;
  description?: string;
  isPending?: boolean;
  error?: string | null;
  footer?: ReactNode;
  className?: string;
  onClose?: () => void;
  size?: "default" | "wide";
  formId?: string;
  formClassName?: string;
  onSubmit: FormEventHandler<HTMLFormElement>;
  children: ReactNode;
}

function AdminCrudSheetForm({
  formId,
  formClassName,
  onSubmit,
  children,
  ...sheetProps
}: AdminCrudSheetFormProps) {
  const generatedFormId = useId().replace(/:/g, "");
  const resolvedFormId = formId ?? `admin-crud-form-${generatedFormId}`;

  return (
    <AdminFormSheet
      {...sheetProps}
      formId={resolvedFormId}
      formClassName={cn("flex flex-col gap-4", formClassName)}
      onSubmit={onSubmit}
    >
      {children}
    </AdminFormSheet>
  );
}

export type { AdminCrudSheetFormProps };
export { AdminCrudSheetForm };
