"use client";

import * as React from "react";

interface CommandMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

const CommandMenuContext = React.createContext<CommandMenuContextValue | null>(null);

export function CommandMenuProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const toggle = React.useCallback(() => setOpen((v) => !v), []);
  const value = React.useMemo(() => ({ open, setOpen, toggle }), [open, toggle]);
  return <CommandMenuContext.Provider value={value}>{children}</CommandMenuContext.Provider>;
}

export function useCommandMenu(): CommandMenuContextValue {
  const ctx = React.useContext(CommandMenuContext);
  if (!ctx) {
    throw new Error("useCommandMenu must be used within CommandMenuProvider");
  }
  return ctx;
}
