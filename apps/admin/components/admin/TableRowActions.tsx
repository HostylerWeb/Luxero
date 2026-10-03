import type { ReactNode } from "react";

interface TableRowActionsProps {
  children?: ReactNode;
}

function TableRowActions({ children }: TableRowActionsProps) {
  return <div className="flex items-center gap-1">{children}</div>;
}

export type { TableRowActionsProps };
export { TableRowActions };
