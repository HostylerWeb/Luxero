"use client";

import { CheckIcon, LaptopIcon, Lightbulb, LightbulbOff } from "lucide-react";
import { type TranslationKey, useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useTheme } from "./ThemeProvider";
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

type ThemeToggleProps = {
  className?: string;
  align?: "start" | "center" | "end";
  sideOffset?: number;
};

function getThemeOptions(
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
) {
  return [
    {
      value: "light" as Theme,
      label: t("theme.light"),
      icon: Lightbulb,
      iconClassName: "fill-current",
    },
    { value: "dark" as Theme, label: t("theme.dark"), icon: LightbulbOff },
    { value: "system" as Theme, label: t("theme.system"), icon: LaptopIcon },
  ];
}

export function ThemeToggle({ className, align = "end", sideOffset = 8 }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { t } = useTranslation();
  const ActiveIcon = resolvedTheme === "dark" ? LightbulbOff : Lightbulb;
  const THEMES = getThemeOptions(t);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("rounded-full", className)}
          aria-label={t("theme.toggle")}
          data-umami-event="theme:toggle-open"
        >
          <ActiveIcon
            data-icon="inline-start"
            className={resolvedTheme === "dark" ? undefined : "fill-current"}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} sideOffset={sideOffset} className="w-40">
        <DropdownMenuLabel>{t("theme.theme")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {THEMES.map((themeOption) => (
          <DropdownMenuItem
            key={themeOption.value}
            onClick={() => setTheme(themeOption.value)}
            data-umami-event="theme:select"
            data-umami-event-theme={themeOption.value}
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
