"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const BUILD_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || null;
const POLL_MS = 30_000;
const RETRY_MS = 500;

async function fetchApiVersion(): Promise<string | null> {
  try {
    const res = await fetch("/api/version", { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data = (await res.json()) as { sha?: string };
    return data.sha ?? null;
  } catch {
    return null;
  }
}

export function useBuildVersion(): { isUpdating: boolean } {
  const reloading = useRef(false);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [isUpdating, setIsUpdating] = useState(false);

  const retryReload = useCallback(() => {
    retryTimer.current = setTimeout(async () => {
      const sha = await fetchApiVersion();
      if (sha !== null) {
        window.location.reload();
      } else {
        retryReload();
      }
    }, RETRY_MS);
  }, []);

  const check = useCallback(async () => {
    if (reloading.current || !BUILD_VERSION) return;
    const apiSha = await fetchApiVersion();
    if (apiSha && apiSha !== BUILD_VERSION) {
      reloading.current = true;
      setIsUpdating(true);
      retryReload();
    }
  }, [retryReload]);

  useEffect(() => {
    check();
    const id = setInterval(check, POLL_MS);
    return () => clearInterval(id);
  }, [check]);

  useEffect(() => {
    const onChange = () => {
      if (document.visibilityState === "visible") check();
    };
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, [check]);

  useEffect(() => {
    return () => {
      if (retryTimer.current) clearTimeout(retryTimer.current);
    };
  }, []);

  return { isUpdating };
}
