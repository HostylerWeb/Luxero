"use client";

import type { ComponentProps, ReactNode } from "react";
import { navigate } from "vike/client/router";
import { usePageContext } from "vike-react/usePageContext";
import { Button } from "@/components/ui/button";
import { localeHref } from "@/lib/i18n";
import { useOptionalSheetNav, useSheetNav } from "./sheet-nav-context";

type NavSheetLinkProps = {
  href: string;
  className?: string;
  children?: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
};

export function NavSheetLink({ href: _href, onClick, ...props }: NavSheetLinkProps) {
  const sheetNav = useOptionalSheetNav();
  const pageContext = usePageContext();
  const locale = (pageContext.locale as string) ?? "en";
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
  const sheetNav = useOptionalSheetNav();
  const pageContext = usePageContext();
  const locale = (pageContext.locale as string) ?? "en";
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
  const pageContext = usePageContext();
  const locale = (pageContext.locale as string) ?? "en";
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
