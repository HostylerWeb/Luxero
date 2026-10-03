import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    NREUM?: {
      setCurrentRouteName?: (name: string) => void;
      addPageAction?: (name: string, attributes: { routeName: string }) => void;
    };
  }
}

export function RouteChangeTracker() {
  const location = useLocation();
  const previousPathRef = useRef<string | null>(null);

  useEffect(() => {
    const currentPath = location.pathname + location.search + location.hash;
    if (currentPath !== previousPathRef.current) {
      previousPathRef.current = currentPath;
      if (typeof window !== "undefined" && window.NREUM) {
        window.NREUM.setCurrentRouteName?.(currentPath);
        window.NREUM.addPageAction?.("pageView", { routeName: currentPath });
      }
    }
  }, [location]);

  return null;
}
