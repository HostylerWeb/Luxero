"use client";

import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown } from "lucide-react";
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

export interface AsyncComboboxOption {
  value: string;
  label: string;
  description?: string;
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
}

export function AsyncCombobox({
  value,
  onValueChange,
  queryKey,
  fetchOptions,
  placeholder = "Select…",
  emptyMessage = "No results found.",
  searchPlaceholder = "Search…",
  disabled,
  className,
  resolveLabel,
}: AsyncComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [resolvedLabel, setResolvedLabel] = React.useState<string | null>(null);

  const { data: options = [], isLoading } = useQuery<AsyncComboboxOption[]>({
    queryKey: [queryKey, search],
    queryFn: () => fetchOptions(search),
    staleTime: 10_000,
    enabled: open || !!search,
  });

  // Resolve label for initial value not present in current options
  React.useEffect(() => {
    if (!value || !resolveLabel) return;
    const inOptions = options.find((o) => o.value === value);
    if (inOptions) {
      setResolvedLabel(inOptions.label);
      return;
    }
    Promise.resolve(resolveLabel(value)).then((label) => {
      if (label) setResolvedLabel(label);
    });
  }, [value, options, resolveLabel]);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? resolvedLabel ?? "";

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue === value ? "" : selectedValue);
    setOpen(false);
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
          className={cn("w-full justify-between font-normal", className)}
        >
          <span className="truncate">
            {selectedLabel || <span className="text-muted-foreground">{placeholder}</span>}
          </span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] min-w-72 p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder={searchPlaceholder} value={search} onValueChange={setSearch} />
          <CommandList>
            {isLoading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">Loading…</div>
            ) : options.length === 0 ? (
              <CommandEmpty>{emptyMessage}</CommandEmpty>
            ) : (
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      {option.description ? (
                        <span className="text-xs text-muted-foreground">{option.description}</span>
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
