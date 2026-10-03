"use client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@luxero/api-admin";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LuxeroLogo, LuxeroLogoSquare } from "@/components/LuxeroLogo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

import { type NavItem } from "@/config/adminNavigation";
import { prefetchAdminRoute } from "@/hooks/admin-prefetch";
import { filterNavGroups } from "@/lib/nav-permissions";

import { NavUser } from "./NavUser";

function navSlug(href: string): string {
  if (href === "/") return "dashboard";
  return href.replace(/^\//, "").replace(/\//g, "-");
}

function NavLinkRow({ item }: { item: NavItem }) {
  const pathname = usePathname() ?? "";
  const queryClient = useQueryClient();
  const Icon = item.icon;
  const isActive =
    pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));

  const handlePointerEnter = () => {
    prefetchAdminRoute(item.href, queryClient);
  };

  const umamiEvent = `nav:${navSlug(item.href)}`;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
        {item.target === "_blank" ? (
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            onPointerEnter={handlePointerEnter}
            data-umami-event={umamiEvent}
          >
            <Icon />
            <span>{item.label}</span>
          </a>
        ) : (
          <Link href={item.href} onPointerEnter={handlePointerEnter} data-umami-event={umamiEvent}>
            <Icon />
            <span>{item.label}</span>
          </Link>
        )}
      </SidebarMenuButton>
      {item.badge != null ? <SidebarMenuBadge>{item.badge}</SidebarMenuBadge> : null}
    </SidebarMenuItem>
  );
}

export function AppSidebar() {
  const { role } = useAuth();
  const navGroups = filterNavGroups(role);

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link
              href="/"
              data-umami-event="nav:logo-home"
              className="flex h-12 w-full items-center gap-2 overflow-hidden rounded-md px-2 text-sm transition-colors hover:bg-sidebar-accent group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:p-2"
            >
              <LuxeroLogoSquare className="size-7 shrink-0 text-sidebar-primary hidden group-data-[state=collapsed]:block" />
              <LuxeroLogo className="w-[120px] h-auto shrink-0 text-sidebar-primary block group-data-[state=collapsed]:hidden" />
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-1.5">
        {navGroups.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <NavLinkRow key={item.href} item={item} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
