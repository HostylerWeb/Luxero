"use client";
import * as React from "react";

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, onCheckedChange, onChange, ...props }, ref) => {
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    }

    return (
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          ref={ref}
          type="checkbox"
          className="sr-only peer"
          onChange={handleChange}
          {...props}
        />
        <div
          className={`
            peer h-6 w-11 rounded-full bg-border/50
            peer-checked:bg-gold/80 peer-checked:after:translate-x-full
            after:content-[''] after:absolute after:top-0.5 after:left-0.5
            after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
            peer-hover:bg-border/70 peer-focus:ring-2 peer-focus:ring-gold/30
            transition-colors
            ${className ?? ""}
          `}
        />
      </label>
    );
  }
);
Switch.displayName = "Switch";

export { Switch };
