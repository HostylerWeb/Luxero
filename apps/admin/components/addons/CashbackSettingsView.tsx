"use client";

import { PageShell } from "@/components/PageShell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { useAdminCashbackSettings, useAdminCashbackSettingsMutations } from "@luxero/api-admin";
import {
  CASHBACK_PAYMENT_METHOD_LABELS,
  CASHBACK_PAYMENT_METHODS,
  type CashbackMode,
  type CashbackPaymentMethod,
  type CashbackSettings,
  DEFAULT_CASHBACK_SETTINGS,
} from "@luxero/types";
import { Save } from "@luxero/icons";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const MODE_OPTIONS: { value: CashbackMode; title: string; description: string }[] = [
  {
    value: "first_order",
    title: "First order only",
    description: "Cashback on the customer’s first completed order.",
  },
  {
    value: "first_n_orders",
    title: "First few orders",
    description: "Cashback on the first N completed orders.",
  },
  {
    value: "period",
    title: "For a period after signup",
    description: "Cashback on every order placed within a number of days after the account was created.",
  },
  {
    value: "all",
    title: "Every order",
    description: "Cashback on all completed orders, with no time limit.",
  },
];

export function CashbackSettingsView() {
  const { data, isLoading, isError } = useAdminCashbackSettings();
  const { saveSettingsMutation } = useAdminCashbackSettingsMutations();
  const [form, setForm] = useState<CashbackSettings>(DEFAULT_CASHBACK_SETTINGS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!data?.data || hydrated) return;
    setForm({
      ...DEFAULT_CASHBACK_SETTINGS,
      ...data.data,
      paymentMethods: data.data.paymentMethods ?? [],
    });
    setHydrated(true);
  }, [data?.data, hydrated]);

  function toggleMethod(method: CashbackPaymentMethod, checked: boolean) {
    setForm((prev) => ({
      ...prev,
      paymentMethods: checked
        ? [...new Set([...prev.paymentMethods, method])]
        : prev.paymentMethods.filter((item) => item !== method),
    }));
  }

  async function handleSave() {
    try {
      await saveSettingsMutation.mutateAsync({
        addonEnabled: form.addonEnabled,
        percent: Number(form.percent) || 0,
        paymentMethods: form.paymentMethods,
        mode: form.mode,
        firstOrderCount: Math.max(1, Number(form.firstOrderCount) || 1),
        periodDays: Math.max(1, Number(form.periodDays) || 1),
      });
      toast.success("Cashback settings saved.");
    } catch {
      toast.error("Could not save cashback settings.");
    }
  }

  return (
    <PageShell
      title="Cashback"
      description="Credit a percentage of a completed order to the customer’s site credit wallet."
      actions={
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" asChild>
            <Link href="/addons">Back to addons</Link>
          </Button>
          <Button type="button" onClick={() => void handleSave()} disabled={isLoading || saveSettingsMutation.isPending}>
            <Save className="size-4" />
            Save settings
          </Button>
        </div>
      }
    >
      {isError ? (
        <Alert variant="destructive">
          <AlertTitle>Could not load settings</AlertTitle>
          <AlertDescription>Refresh the page or try again in a moment.</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Addon</CardTitle>
          <CardDescription>
            When this is on, a qualifying completed order credits site credit automatically. Guest checkouts are skipped.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="cashback-enabled">Enable cashback</Label>
            <Switch
              id="cashback-enabled"
              checked={form.addonEnabled}
              onCheckedChange={(checked) => setForm((prev) => ({ ...prev, addonEnabled: checked }))}
            />
          </div>
          <div className="max-w-xs space-y-2">
            <Label htmlFor="cashback-percent">Cashback percent</Label>
            <Input
              id="cashback-percent"
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={form.percent}
              onChange={(event) => setForm((prev) => ({ ...prev, percent: Number(event.target.value) }))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Supported payment methods</CardTitle>
          <CardDescription>
            Cashback applies only when the order was paid with one of the methods you select. A mixed payment uses the card or Paytriot method.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {CASHBACK_PAYMENT_METHODS.map((method) => (
            <label key={method} className="flex items-center gap-3 text-sm">
              <Checkbox
                checked={form.paymentMethods.includes(method)}
                onCheckedChange={(checked) => toggleMethod(method, checked === true)}
              />
              {CASHBACK_PAYMENT_METHOD_LABELS[method]}
            </label>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>When cashback applies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={form.mode}
            onValueChange={(value) => setForm((prev) => ({ ...prev, mode: value as CashbackMode }))}
            className="gap-3"
          >
            {MODE_OPTIONS.map((option) => (
              <label key={option.value} className="flex items-start gap-3 rounded-md border p-3">
                <RadioGroupItem value={option.value} className="mt-1" />
                <span>
                  <span className="block text-sm font-medium">{option.title}</span>
                  <span className="block text-xs text-muted-foreground">{option.description}</span>
                </span>
              </label>
            ))}
          </RadioGroup>
          {form.mode === "first_n_orders" ? (
            <div className="max-w-xs space-y-2">
              <Label htmlFor="cashback-count">Number of orders</Label>
              <Input
                id="cashback-count"
                type="number"
                min={1}
                value={form.firstOrderCount}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, firstOrderCount: Number(event.target.value) }))
                }
              />
            </div>
          ) : null}
          {form.mode === "period" ? (
            <div className="max-w-xs space-y-2">
              <Label htmlFor="cashback-days">Days after signup</Label>
              <Input
                id="cashback-days"
                type="number"
                min={1}
                value={form.periodDays}
                onChange={(event) => setForm((prev) => ({ ...prev, periodDays: Number(event.target.value) }))}
              />
            </div>
          ) : null}
        </CardContent>
      </Card>
    </PageShell>
  );
}
