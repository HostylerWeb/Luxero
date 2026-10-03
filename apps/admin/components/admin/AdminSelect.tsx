"use client";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface AdminSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface AdminSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: AdminSelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
}

const AdminSelect = forwardRef<HTMLButtonElement, AdminSelectProps>(
  (
    {
      value,
      onValueChange,
      options,
      placeholder = "Select...",
      className,
      disabled,
      required,
      name,
    },
    ref
  ) => {
    return (
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        name={name}
        required={required}
      >
        <SelectTrigger ref={ref} className={cn("w-full", className)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
);

AdminSelect.displayName = "AdminSelect";

export type { AdminSelectOption, AdminSelectProps };
export { AdminSelect };
