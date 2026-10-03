"use client";

import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

import { Button } from "./ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Skeleton } from "./ui/skeleton";

export interface AsyncComboboxOption {
  value: string;
  label: string;
  description?: string;
  badge?: { label: string; variant: "default" | "success" | "warning" | "muted" };
}

export interface AsyncComboboxProps {
  value?: string;
  onValueChange: (value: string) => void;
  queryKey: string;
  fetchOptions: (search: string) => Promise<AsyncComboboxOption[]>;
  placeholder?: string;
  emptyMessage?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
  /** Resolve label for the selected value when it's not in the list (for edit mode). */
  resolveLabel?: (value: string) => Promise<string | null> | string | null;
  /** Allow clearing the selection */
  clearable?: boolean;
  /** Custom icon to show on the trigger when no selection */
  icon?: React.ReactNode;
}

const badgeStyles: Record<string, string> = {
  default: "border-border text-muted-foreground",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400",
  warning:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-400",
  muted: "border-muted-foreground/20 text-muted-foreground/60",
};

function ComboboxSkeleton() {
  return (
    <div className="space-y-1.5 p-2">
      {[82, 64, 90].map((width, i) => (
        <div key={i} className="flex items-center gap-2 px-2 py-2.5">
          <Skeleton shimmer className="size-4 shrink-0 rounded" />
          <div className="flex-1 space-y-1.5">
            <Skeleton shimmer className={cn("h-3.5 rounded", `w-[${width}%]`)} />
            <Skeleton shimmer className="h-2.5 w-2/5 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AsyncCombobox({
  value,
  onValueChange,
  queryKey,
  fetchOptions,
  placeholder = "Select\u2026",
  emptyMessage = "No results found.",
  searchPlaceholder = "Search\u2026",
  disabled,
  className,
  resolveLabel,
  clearable = false,
  icon,
}: AsyncComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [resolvedLabel, setResolvedLabel] = React.useState<string | null>(null);
  const [resolvedBadge, setResolvedBadge] = React.useState<
    AsyncComboboxOption["badge"] | undefined
  >(undefined);

  const { data: options = [], isLoading } = useQuery<AsyncComboboxOption[]>({
    queryKey: [queryKey, search],
    queryFn: () => fetchOptions(search),
    staleTime: 10_000,
    enabled: open || !!search,
  });

  const selectedOption = React.useMemo(
    () => options.find((o) => o.value === value),
    [options, value]
  );

  React.useEffect(() => {
    if (!value || !resolveLabel) return;
    if (selectedOption) {
      setResolvedLabel(selectedOption.label);
      setResolvedBadge(selectedOption.badge);
      return;
    }
    Promise.resolve(resolveLabel(value)).then((label) => {
      if (label) setResolvedLabel(label);
    });
  }, [value, selectedOption, resolveLabel]);

  const selectedLabel = selectedOption?.label ?? resolvedLabel ?? "";
  const selectedBadge = selectedOption?.badge ?? resolvedBadge;

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue === value ? "" : selectedValue);
    setOpen(false);
    setSearch("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange("");
    setSearch("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "group relative flex h-10 w-full items-center justify-between px-3 text-left font-normal transition-all duration-200",
            "hover:border-foreground/30 data-[state=open]:border-foreground/30 data-[state=open]:ring-1 data-[state=open]:ring-foreground/10",
            value ? "text-foreground" : "text-muted-foreground",
            className
          )}
        >
          <span className="flex min-w-0 flex-1 items-center gap-2">
            {value && selectedBadge ? (
              <span
                className={cn(
                  "inline-flex shrink-0 items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider",
                  badgeStyles[selectedBadge.variant]
                )}
              >
                {selectedBadge.label}
              </span>
            ) : icon ? (
              <span className="shrink-0 text-muted-foreground/50">{icon}</span>
            ) : null}
            <span className="truncate text-sm">
              {selectedLabel || <span className="text-muted-foreground/60">{placeholder}</span>}
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-0.5">
            {clearable && value && (
              <span
                role="button"
                tabIndex={-1}
                onClick={handleClear}
                className="flex size-4 items-center justify-center rounded-sm text-muted-foreground/40 opacity-0 transition-all hover:text-foreground group-hover:opacity-60 group-data-[state=open]:opacity-60"
              >
                <X className="size-3.5" />
              </span>
            )}
            <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground/70" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) min-w-72 overflow-hidden rounded-lg border p-0 shadow-lg"
        align="start"
        sideOffset={4}
      >
        <Command shouldFilter={false} className="overflow-visible">
          <div className="flex items-center gap-2 border-b px-3">
            <Search className="size-4 shrink-0 text-muted-foreground/50" />
            <CommandInput
              placeholder={searchPlaceholder}
              value={search}
              onValueChange={setSearch}
              className="h-10 border-0 bg-transparent px-0 text-sm outline-none placeholder:text-muted-foreground/40 focus:ring-0"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="shrink-0 rounded-sm p-0.5 text-muted-foreground/40 hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          <CommandList className="max-h-64">
            {isLoading ? (
              <ComboboxSkeleton />
            ) : options.length === 0 ? (
              <CommandEmpty className="flex flex-col items-center gap-2 py-8">
                <Search className="size-8 text-muted-foreground/20" />
                <span className="text-sm text-muted-foreground/60">{emptyMessage}</span>
              </CommandEmpty>
            ) : (
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                    className="flex items-center gap-2.5 px-3 py-2.5 aria-selected:bg-accent"
                  >
                    <span
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded-sm border transition-all",
                        value === option.value
                          ? "border-foreground bg-foreground text-background"
                          : "border-border opacity-0 group-hover:opacity-30"
                      )}
                    >
                      {value === option.value && <Check className="size-3" />}
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">{option.label}</span>
                        {option.badge && (
                          <span
                            className={cn(
                              "inline-flex shrink-0 items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider",
                              badgeStyles[option.badge.variant]
                            )}
                          >
                            {option.badge.label}
                          </span>
                        )}
                      </div>
                      {option.description ? (
                        <span className="truncate text-xs text-muted-foreground/60">
                          {option.description}
                        </span>
                      ) : null}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
