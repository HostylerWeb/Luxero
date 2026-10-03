"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { navigate } from "vike/client/router";
import { usePageContext } from "vike-react/usePageContext";
import { localeHref } from "@/lib/i18n";

type SheetNavContextValue = {
  isExiting: boolean;
  navigateFromSheet: (to: string) => void;
};

const SheetNavContext = createContext<SheetNavContextValue | null>(null);

export function useSheetNav() {
  const context = useContext(SheetNavContext);
  if (!context) {
    throw new Error("useSheetNav must be used within SheetNavProvider");
  }
  return context;
}

export function useOptionalSheetNav() {
  return useContext(SheetNavContext);
}

export function SheetNavProvider({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (open) {
      setIsExiting(false);
    }
  }, [open]);

  const pageContext = usePageContext();
  const locale = (pageContext.locale as string) ?? "en";

  const navigateFromSheet = useCallback(
    (to: string) => {
      setIsExiting(true);
      onClose();
      navigate(localeHref(to, locale), { overwriteLastHistoryEntry: true });
    },
    [onClose, locale]
  );

  const value = useMemo(
    () => ({
      isExiting,
      navigateFromSheet,
    }),
    [isExiting, navigateFromSheet]
  );

  return <SheetNavContext.Provider value={value}>{children}</SheetNavContext.Provider>;
}
