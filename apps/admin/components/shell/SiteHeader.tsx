"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { CommandMenuTrigger } from "./CommandMenu";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ml-1.5 size-8" data-umami-event="nav:sidebar-toggle" />
      </div>
      <div className="flex items-center gap-2">
        <CommandMenuTrigger data-umami-event="nav:command-menu-open" />
        <ThemeToggle
          className="size-8 border border-border bg-transparent"
          data-umami-event="nav:theme-toggle"
        />
      </div>
    </header>
  );
}
