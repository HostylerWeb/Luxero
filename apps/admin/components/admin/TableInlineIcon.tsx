import type { ReactNode } from "react";

interface TableInlineIconProps {
  icon?: ReactNode;
  label?: string;
  children?: ReactNode;
  className?: string;
}

function TableInlineIcon({ icon, label, children, className }: TableInlineIconProps) {
  return (
    <span className={`inline-flex items-center gap-1 ${className ?? ""}`}>
      {icon ? <span className="size-4 shrink-0 text-muted-foreground">{icon}</span> : null}
      <span>{label ?? children}</span>
    </span>
  );
}

export type { TableInlineIconProps };
export { TableInlineIcon };
