import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "../ui/alert";

interface AdminDataTableTemplateProps {
  filters?: ReactNode;
  table: ReactNode;
  error?: ReactNode;
  className?: string;
  tableClassName?: string;
}

function AdminDataTableTemplate({
  filters,
  table,
  error,
  className,
  tableClassName,
}: AdminDataTableTemplateProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {filters ? <div>{filters}</div> : null}
      <div className={cn("min-w-0", tableClassName)}>{table}</div>
    </div>
  );
}

export type { AdminDataTableTemplateProps };
export { AdminDataTableTemplate };
