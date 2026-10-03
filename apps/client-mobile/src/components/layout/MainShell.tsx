"use client";

import { useCallback, useState } from "react";
import { Outlet } from "react-router-dom";
import { HeaderMobileNavProvider } from "./header-mobile-nav";
import { MobileBottomNav } from "./MobileBottomNav";
import { MobileTopBar } from "./MobileTopBar";
import { MoreSheet } from "./MoreSheet";

export function MainShell() {
  const [moreOpen, setMoreOpen] = useState(false);

  const handleMorePress = useCallback(() => {
    setMoreOpen(true);
  }, []);

  return (
    <HeaderMobileNavProvider>
      <div className="h-screen bg-background flex flex-col">
        <MobileTopBar />
        <main className="flex-1 pt-12 pb-16 overflow-y-auto">
          <Outlet />
        </main>
        <MobileBottomNav onMorePress={handleMorePress} />
        <MoreSheet open={moreOpen} onOpenChange={setMoreOpen} />
      </div>
    </HeaderMobileNavProvider>
  );
}
