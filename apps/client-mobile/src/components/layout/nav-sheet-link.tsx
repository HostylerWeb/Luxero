"use client";

import type { ComponentProps, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { localeHref, useTranslation } from "@/lib/i18n";
import { useOptionalSheetNav, useSheetNav } from "./sheet-nav-context";

type NavSheetLinkProps = {
  href: string;
  className?: string;
  children?: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
};

export function NavSheetLink({ href: _href, onClick, ...props }: NavSheetLinkProps) {
  const navigate = useNavigate();
  const sheetNav = useOptionalSheetNav();
  const { locale } = useTranslation();
  const localized = localeHref(_href, locale);

  return (
    <a
      href={localized}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || !sheetNav) return;

        event.preventDefault();
        navigate(localized);
      }}
    />
  );
}

export function NavSheetNavLink({ href: _href, onClick, ...props }: NavSheetLinkProps) {
  const navigate = useNavigate();
  const sheetNav = useOptionalSheetNav();
  const { locale } = useTranslation();
  const localized = localeHref(_href, locale);

  return (
    <a
      href={localized}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || !sheetNav) return;

        event.preventDefault();
        navigate(localized);
      }}
    />
  );
}

export function NavSheetActionButton({
  href: _href,
  children,
  onClick,
  ...props
}: ComponentProps<typeof Button> & { href: string }) {
  const { navigateFromSheet } = useSheetNav();
  const { locale } = useTranslation();
  const localized = localeHref(_href, locale);

  return (
    <Button
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        navigateFromSheet(localized);
      }}
    >
      {children}
    </Button>
  );
}
