export interface PushPayload {
  title: string;
  body: string;
  type?: NotificationType;
  url?: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: { action: string; title: string; icon?: string }[];
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
}

export interface PushTarget {
  userId?: string | string[];
  subscriptionId?: string | string[];
}

export interface SendPushOptions extends PushTarget {
  scheduledAt?: Date;
  onSent?: (subId: string) => void;
  onFailed?: (subId: string, error: Error) => void;
}

export interface SendPushResult {
  sentCount: number;
  failedCount: number;
  totalTargeted: number;
  details: { subscriptionId: string; status: "sent" | "failed"; error?: string }[];
}

export type NotificationType = "marketing" | "system" | "draw_result" | "promotional" | "reminder";

export const DEFAULT_ICON = "/icons/icon-192x192.svg";
export const BATCH_SIZE = 50;
export const BATCH_INTERVAL_MS = 500;
