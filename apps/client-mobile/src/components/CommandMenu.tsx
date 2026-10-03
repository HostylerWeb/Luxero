"use client";

import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "./ui/command";

export interface CommandMenuItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  onSelect?: () => void;
  keywords?: string[];
  shortcut?: string;
}

export interface CommandMenuGroup {
  heading: string;
  items: CommandMenuItem[];
}

export interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: CommandMenuGroup[];
  placeholder?: string;
  emptyMessage?: string;
}

export function CommandMenu({
  open,
  onOpenChange,
  groups,
  placeholder = "Search commands…",
  emptyMessage = "No results found.",
}: CommandMenuProps) {
  const navigate = useNavigate();
  const runItem = React.useCallback(
    (item: CommandMenuItem) => {
      onOpenChange(false);
      if (item.onSelect) {
        item.onSelect();
        return;
      }
      if (item.href) {
        navigate(item.href);
      }
    },
    [onOpenChange, navigate]
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder={placeholder} />
      <CommandList>
        <CommandEmpty>{emptyMessage}</CommandEmpty>
        {groups.map((group, idx) => (
          <React.Fragment key={group.heading}>
            {idx > 0 ? <CommandSeparator /> : null}
            <CommandGroup heading={group.heading}>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.id}
                    value={`${item.label} ${item.keywords?.join(" ") ?? ""}`}
                    onSelect={() => runItem(item)}
                  >
                    {Icon ? <Icon className="mr-2 size-4 text-muted-foreground" /> : null}
                    <span>{item.label}</span>
                    {item.shortcut ? <CommandShortcut>{item.shortcut}</CommandShortcut> : null}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </React.Fragment>
        ))}
      </CommandList>
    </CommandDialog>
  );
}

/** Hook to bind ⌘K / Ctrl+K to open a command palette. */
export function useCommandMenuShortcut(onTrigger: () => void, enabled = true): void {
  React.useEffect(() => {
    if (!enabled) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        onTrigger();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onTrigger, enabled]);
}
