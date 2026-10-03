"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { navigate, prefetch } from "vike/client/router";
import { usePageContext } from "vike-react/usePageContext";

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children?: ReactNode;
};

export function Link({ href, children, target, onMouseEnter, ...props }: LinkProps) {
  const pageContext = usePageContext();
  const locale = pageContext.locale ?? "en";

  const isExternal =
    target === "_blank" ||
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:");

  // Prepend locale to internal URLs (unless they already have the prefix or are root-relative for external)
  const localizedHref =
    !isExternal && href.startsWith("/") && !href.startsWith(`/${locale}/`) && href !== `/${locale}`
      ? `/${locale}${href}`
      : href;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isExternal) return;
    e.preventDefault();
    void navigate(localizedHref);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isExternal && localizedHref) {
      void prefetch(localizedHref);
    }
    onMouseEnter?.(e);
  };

  return (
    <a
      href={localizedHref}
      target={target}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      {...props}
    >
      {children}
    </a>
  );
}
