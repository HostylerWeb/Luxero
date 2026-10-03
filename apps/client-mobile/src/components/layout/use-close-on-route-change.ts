"use client";

import { useEffect } from "react";

export function useCloseOnRouteChange(onClose: () => void) {
  useEffect(() => {
    const handleRouteChange = () => onClose();
    window.addEventListener("popstate", handleRouteChange);
    return () => window.removeEventListener("popstate", handleRouteChange);
  }, [onClose]);
}
