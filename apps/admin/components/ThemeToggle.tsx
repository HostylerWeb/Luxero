"use client";

import { CheckIcon, LaptopIcon, Lightbulb, LightbulbOff } from "lucide-react";
import { useTheme } from "next-themes";
import type * as React from "react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

type Theme = "light" | "dark" | "system";

type ThemeToggleProps = React.ComponentPropsWithoutRef<typeof Button> & {
  className?: string;
  align?: "start" | "center" | "end";
  sideOffset?: number;
};

const THEMES: Array<{
  value: Theme;
  label: string;
  icon: React.ComponentType<{ className?: string; "data-icon"?: string }>;
  iconClassName?: string;
}> = [
  { value: "light", label: "Light", icon: Lightbulb, iconClassName: "fill-current" },
  { value: "dark", label: "Dark", icon: LightbulbOff },
  { value: "system", label: "System", icon: LaptopIcon },
];

export function ThemeToggle({
  className,
  align = "end",
  sideOffset = 8,
  ...props
}: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false);
  const { theme, resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const ActiveIcon = isDark ? LightbulbOff : Lightbulb;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("rounded-full", className)}
          aria-label="Toggle theme"
          {...props}
        >
          {mounted ? (
            <ActiveIcon data-icon="inline-start" className={isDark ? undefined : "fill-current"} />
          ) : (
            <div className="size-5" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} sideOffset={sideOffset} className="w-40">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {THEMES.map((themeOption) => (
          <DropdownMenuItem
            key={themeOption.value}
            onClick={() => setTheme(themeOption.value)}
            className="flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <themeOption.icon
                data-icon="inline-start"
                className={cn("text-muted-foreground", themeOption.iconClassName)}
              />
              {themeOption.label}
            </span>
            {theme === themeOption.value ? <CheckIcon data-icon="inline-end" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
