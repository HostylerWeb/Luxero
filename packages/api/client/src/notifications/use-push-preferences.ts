"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "../client";

export type NotificationType = "marketing" | "system" | "draw_result" | "promotional" | "reminder";

export const NOTIFICATION_TYPES: NotificationType[] = [
  "marketing",
  "system",
  "draw_result",
  "promotional",
  "reminder",
];

export const DEFAULT_PREFERENCES: Record<NotificationType, boolean> = {
  marketing: true,
  system: true,
  draw_result: true,
  promotional: true,
  reminder: true,
};

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  marketing: "Marketing",
  system: "System",
  draw_result: "Draw Results",
  promotional: "Promotional",
  reminder: "Reminders",
};

export const NOTIFICATION_TYPE_DESCRIPTIONS: Record<NotificationType, string> = {
  marketing: "New competitions and offers",
  system: "Account and order updates",
  draw_result: "Competition draw results",
  promotional: "Special promotions and bonuses",
  reminder: "Event reminders and deadlines",
};

export interface UsePushPreferencesResult {
  preferences: Record<NotificationType, boolean>;
  isLoading: boolean;
  isUpdating: boolean;
  updatePreference: (type: NotificationType, value: boolean) => Promise<void>;
}

export function usePushPreferences(): UsePushPreferencesResult {
  const [preferences, setPreferences] =
    useState<Record<NotificationType, boolean>>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await api.get<{ data: { preferences: Record<string, boolean> } }>(
          "/api/push/preferences"
        );
        if (!cancelled && res.data?.data?.preferences) {
          setPreferences((prev) => ({ ...prev, ...res.data.data.preferences }));
        }
      } catch {
        // Use defaults if fetch fails
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const updatePreference = useCallback(async (type: NotificationType, value: boolean) => {
    setIsUpdating(true);
    setPreferences((prev) => ({ ...prev, [type]: value }));
    try {
      await api.patch("/api/push/preferences", { [type]: value });
    } catch (err) {
      setPreferences((prev) => ({ ...prev, [type]: !value }));
      console.error("[PushPreferences] failed to update:", err);
    } finally {
      setIsUpdating(false);
    }
  }, []);

  return { preferences, isLoading, isUpdating, updatePreference };
}
