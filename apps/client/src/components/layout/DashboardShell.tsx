"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardLayout } from "./DashboardLayout";
import { HEADER_HEIGHT, MARQUEE_HEIGHT } from "./header-layout";

interface DashboardShellProps {
  children: React.ReactNode;
  defaultOpen: boolean;
}

export function DashboardShell({ children, defaultOpen }: DashboardShellProps) {
  const offsetTop = `calc(${HEADER_HEIGHT} + ${MARQUEE_HEIGHT})`;
  const sidebarHeight = `calc(100svh - ${HEADER_HEIGHT} - ${MARQUEE_HEIGHT})`;
  return (
    <TooltipProvider>
      <SidebarProvider
        defaultOpen={defaultOpen}
        style={
          {
            "--header-height": `calc(${HEADER_HEIGHT} + ${MARQUEE_HEIGHT})`,
            "--sidebar-offset-top": offsetTop,
            "--sidebar-height": sidebarHeight,
          } as React.CSSProperties
        }
      >
        <div
          className="flex min-h-0 w-full overflow-hidden"
          style={{ height: `calc(100svh - ${HEADER_HEIGHT} - ${MARQUEE_HEIGHT})` }}
        >
          <DashboardLayout>{children}</DashboardLayout>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
