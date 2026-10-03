"use client";

import { useEffect, useState } from "react";
import { providerDisplayMap } from "./provider-display";

interface PaymentProvider {
  id: string;
  name: string;
  enabled: boolean;
  isDefault: boolean;
}

interface PaymentMethodSelectorProps {
  selected: string;
  onSelect: (providerId: string) => void;
}

export function PaymentMethodSelector({ selected, onSelect }: PaymentMethodSelectorProps) {
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/payments/providers")
      .then((res) => res.json())
      .then((data) => {
        const all = (data.data ?? []) as PaymentProvider[];
        const enabled = all.filter((p) => p.enabled);
        setProviders(enabled);
        if (!enabled.find((p) => p.id === selected) && enabled.length > 0) {
          const preferred = enabled.find((p) => p.isDefault) ?? enabled[0];
          onSelect(preferred.id);
        }
      })
      .catch(() => setProviders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold mb-3">Payment Method</h3>
        <div className="h-12 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold mb-3">Payment Method</h3>
        <p className="text-sm text-muted-foreground">No payment methods available.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="text-sm font-semibold mb-3">Payment Method</h3>
      <div className="space-y-2">
        {providers.map((provider) => {
          const info = providerDisplayMap[provider.id];
          return (
            <label
              key={provider.id}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                selected === provider.id
                  ? "border-gold bg-gold/5"
                  : "border-border hover:border-gold/40"
              }`}
            >
              <input
                type="radio"
                name="payment-provider"
                value={provider.id}
                checked={selected === provider.id}
                onChange={() => onSelect(provider.id)}
                className="size-4 accent-gold"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{info?.name ?? provider.name}</span>
                  {info?.badge ? (
                    <span className="rounded-full bg-gold/10 px-2 py-0.5 text-[10px] font-semibold text-gold">
                      {info.badge}
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground">{info?.description ?? ""}</p>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
