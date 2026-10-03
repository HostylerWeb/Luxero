"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { type PageMetaEntry, pageMeta } from "@/config/pageMeta";

interface Crumb {
  href: string;
  title: string;
  isLast: boolean;
}

function findLongestPrefix(pathname: string): string | null {
  let current = pathname;
  while (current !== "/" && current !== "") {
    if (pageMeta[current]) return current;
    const idx = current.lastIndexOf("/");
    current = idx <= 0 ? "/" : current.slice(0, idx);
  }
  return pageMeta["/"] ? "/" : null;
}

function buildCrumbs(pathname: string): Crumb[] {
  const chain: string[] = [];

  // 1. Exact match — walk the parent chain verbatim.
  // 2. Otherwise, use longest-prefix fallback so dynamic detail routes
  //    (e.g. /competitions/abc-123) still resolve to their parent crumb.
  const exact = pageMeta[pathname];
  if (exact) {
    let current: string | undefined = pathname;
    while (current) {
      chain.unshift(current);
      const entry: PageMetaEntry | undefined = pageMeta[current];
      current = entry?.parent;
    }
  } else {
    const prefix = findLongestPrefix(pathname);
    if (prefix) {
      let current: string | undefined = prefix;
      while (current) {
        chain.unshift(current);
        const entry: PageMetaEntry | undefined = pageMeta[current];
        current = entry?.parent;
      }
      chain.push(pathname);
    } else {
      chain.push(pathname);
    }
  }

  // Always include the root "Dashboard" if not already in the chain
  if (chain[0] !== "/") chain.unshift("/");

  return chain.map((href, idx) => {
    const entry = pageMeta[href];
    let title: string;
    if (entry?.title) {
      title = entry.title;
    } else if (href === pathname) {
      title = "Item";
    } else {
      title = "Page";
    }
    return {
      href,
      title,
      isLast: idx === chain.length - 1,
    };
  });
}

export function Breadcrumbs() {
  const pathname = usePathname() ?? "/";
  const crumbs = buildCrumbs(pathname);

  if (crumbs.length <= 1) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb) => (
          <Fragment key={crumb.href}>
            <BreadcrumbItem>
              {crumb.isLast ? (
                <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={crumb.href}>{crumb.title}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {!crumb.isLast ? <BreadcrumbSeparator /> : null}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
