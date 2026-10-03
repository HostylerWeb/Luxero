"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

export function useConsumeQueryParams(keys: string[]): void {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const consumedRef = useRef(false);

  useEffect(() => {
    if (consumedRef.current) return;
    if (!searchParams) return;
    if (!keys.some((k) => searchParams.has(k))) return;

    consumedRef.current = true;
    const next = new URLSearchParams(searchParams);
    for (const k of keys) next.delete(k);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [searchParams, keys, pathname, router]);
}
