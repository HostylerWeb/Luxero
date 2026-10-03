"use client";
import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "../ui/textarea";

interface AdminTextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> {
  className?: string;
}

const AdminTextarea = forwardRef<HTMLTextAreaElement, AdminTextareaProps>(
  ({ className, ...props }, ref) => {
    return <Textarea ref={ref} className={cn("min-h-[100px] resize-none", className)} {...props} />;
  }
);

AdminTextarea.displayName = "AdminTextarea";

export type { AdminTextareaProps };
export { AdminTextarea };
