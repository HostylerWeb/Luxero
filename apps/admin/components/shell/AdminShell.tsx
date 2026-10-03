"use client";

import type * as React from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { AppSidebar } from "./AppSidebar";
import { GlobalCommandMenu } from "./CommandMenu";
import { SiteHeader } from "./SiteHeader";

interface AdminShellProps {
  children: React.ReactNode;
  defaultSidebarOpen?: boolean;
}

export function AdminShell({ children, defaultSidebarOpen = true }: AdminShellProps) {
  return (
    <SidebarProvider defaultOpen={defaultSidebarOpen}>
      <AppSidebar />
      <SidebarInset className="min-w-0 overflow-hidden">
        <SiteHeader />
        <main className="flex min-w-0 flex-1 flex-col overflow-x-auto">{children}</main>
      </SidebarInset>
      <GlobalCommandMenu />
    </SidebarProvider>
  );
}
