import type { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface AdminCompactCardProps {
  title?: ReactNode;
  description?: ReactNode;
  icon?: React.ElementType;
  accent?: boolean;
  children?: ReactNode;
  className?: string;
}

export function AdminCompactCard({
  title,
  description,
  icon: Icon,
  accent,
  children,
  className,
}: AdminCompactCardProps) {
  return (
    <Card
      className={cn(
        "gap-0 border-border/70 py-0 shadow-sm",
        accent && "border-gold/25 bg-gold/[0.03]",
        className
      )}
    >
      <CardHeader className="gap-1 px-4 pb-2 pt-4">
        {Icon ? <Icon className="size-4 text-muted-foreground" /> : null}
        {title ? <div className="text-sm font-semibold text-foreground">{title}</div> : null}
        {description ? (
          <div className="min-h-10 text-xs text-muted-foreground">{description}</div>
        ) : null}
      </CardHeader>
      {children ? <CardContent className="px-4 pb-4 pt-0">{children}</CardContent> : null}
    </Card>
  );
}
