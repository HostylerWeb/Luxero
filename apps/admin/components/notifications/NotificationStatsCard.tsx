"use client";

import { Card, CardContent } from "@/components/ui/card";

interface NotificationStatsCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}

export function NotificationStatsCard({ label, value, icon }: NotificationStatsCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold">{value}</span>
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
      </CardContent>
    </Card>
  );
}
