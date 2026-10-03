import type { AffiliateEventType, GoogleAnalyticsConfig } from "./types";

const GA4_EVENT_MAP: Record<AffiliateEventType, string> = {
  signup: "sign_up",
  purchase: "purchase",
};

export function sendGA4Event(
  config: GoogleAnalyticsConfig,
  eventType: AffiliateEventType,
  data: {
    userId: string;
    email?: string;
    amount?: number;
    currency?: string;
    orderId?: string;
  }
): void {
  if (!config.enabled || !config.measurementId || !config.events[eventType]) return;

  const eventName = GA4_EVENT_MAP[eventType];

  const params: Record<string, string | number> = {
    engagement_time_msec: 1,
  };

  if (data.amount !== undefined) params.value = data.amount;
  if (data.currency) params.currency = data.currency;
  if (data.orderId) params.transaction_id = data.orderId;
  if (data.email) params.email = data.email;

  const body = {
    client_id: data.userId,
    user_id: data.userId,
    events: [{ name: eventName, params }],
  };

  const searchParams = new URLSearchParams({
    measurement_id: config.measurementId,
  });
  if (config.apiSecret) {
    searchParams.set("api_secret", config.apiSecret);
  }

  void (async () => {
    try {
      const res = await fetch(
        `https://www.google-analytics.com/mp/collect?${searchParams.toString()}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      if (!res.ok) {
        const text = await res.text().catch(() => "<unreadable>");
        console.warn(
          JSON.stringify({
            event: "affiliate.ga4_failed",
            eventType,
            status: res.status,
            body: text.slice(0, 500),
            timestamp: new Date().toISOString(),
          })
        );
      }
    } catch (err) {
      console.warn("[affiliate] GA4 event failed:", err);
    }
  })();
}
