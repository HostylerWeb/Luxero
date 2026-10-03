"use client";

import { ChevronLeft } from "@luxero/icons";
import { Outlet, useNavigate } from "react-router-dom";
import { LuxeroLogo } from "@/components/LuxeroLogo";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";

export function AuthLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center h-12 px-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="size-9 rounded-full text-muted-foreground hover:text-foreground active:scale-95 touch-manipulation"
          aria-label="Back"
        >
          <ChevronLeft className="size-5" />
        </Button>
        <LuxeroLogo className="h-5 w-auto text-gold mx-auto -ml-9" />
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-12">
        <Outlet />
      </main>
    </div>
  );
}
