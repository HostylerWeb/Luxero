"use client";

import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export function DashboardMobileContent() {
  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={false}>
        <div className="flex-1 w-full">
          <Outlet />
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
