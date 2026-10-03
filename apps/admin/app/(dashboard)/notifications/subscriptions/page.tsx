"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { PushSubscriptionTable } from "@/components/notifications/PushSubscriptionTable";
import { PageShell } from "@/components/PageShell";
import { Input } from "@/components/ui/input";

export default function PushSubscriptionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";

  const [searchValue, setSearchValue] = useState(search);
  const [data, setData] = useState<{ items: unknown[]; total?: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const params = new URLSearchParams({ page: String(page), search });
    fetch(`/api/admin/notifications/subscriptions?${params.toString()}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`GET failed: ${res.status}`);
        return res.json() as Promise<{ items: unknown[]; total?: number }>;
      })
      .then((res) => {
        setData(res);
      })
      .catch(() => {
        setData(null);
      })
      .finally(() => setIsLoading(false));
  }, [page, search]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams);
        if (value) {
          params.set("search", value);
        } else {
          params.delete("search");
        }
        params.set("page", "1");
        router.push(`/notifications/subscriptions?${params.toString()}`);
      }, 300);
    },
    [router, searchParams]
  );

  const handleDeactivate = useCallback((id: string) => {
    fetch(`/api/admin/notifications/subscriptions/${id}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then(() => {
        setData((prev) =>
          prev
            ? {
                ...prev,
                items: (prev.items as Array<{ _id: string; active?: boolean }>).map((s) =>
                  s._id === id ? { ...s, active: false } : s
                ),
              }
            : prev
        );
      })
      .catch(() => {});
  }, []);

  const handlePageChange = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams);
      params.set("page", String(newPage));
      router.push(`/notifications/subscriptions?${params.toString()}`);
    },
    [router, searchParams]
  );

  const subscriptions = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <PageShell
      title="Push Subscriptions"
      description="Manage all active and inactive push notification subscriptions."
    >
      <div className="flex items-center gap-4 mb-6">
        <Input
          placeholder="Search by user or device..."
          value={searchValue}
          onChange={(e) => {
            handleSearchChange(e.target.value);
          }}
          className="max-w-sm"
        />
      </div>

      <PushSubscriptionTable
        subscriptions={
          subscriptions as Array<{
            _id: string;
            endpoint: string;
            userAgent?: string;
            active: boolean;
            createdAt: string;
            userId?: { _id: string; email?: string; firstName?: string; lastName?: string } | null;
          }>
        }
        onDeactivate={handleDeactivate}
        isLoading={isLoading}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            disabled={page <= 1}
            onClick={() => handlePageChange(page - 1)}
            className="rounded-md px-3 py-1 text-sm border disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => handlePageChange(page + 1)}
            className="rounded-md px-3 py-1 text-sm border disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </PageShell>
  );
}
