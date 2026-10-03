import { useEffect, useState } from "react";

export const ADMIN_SEARCH_DEBOUNCE_MS = 350;

export function useDebouncedValue<T>(value: T, delay = ADMIN_SEARCH_DEBOUNCE_MS): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
