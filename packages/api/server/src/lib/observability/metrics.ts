type CounterName =
  | "payment.session.created"
  | "payment.session.completed"
  | "payment.session.failed"
  | "payment.captured"
  | "payment.refunded"
  | "webhook.received"
  | "webhook.duplicate"
  | "webhook.processed"
  | "webhook.error"
  | "order.fulfilled"
  | "order.failed"
  | "order.refunded"
  | "order.admin_status_change";

const counters = new Map<CounterName, number>();

export function incrementCounter(name: CounterName, by = 1): void {
  counters.set(name, (counters.get(name) ?? 0) + by);
}

export function getCounters(): Record<string, number> {
  return Object.fromEntries(counters.entries());
}

export function resetCounters(): void {
  counters.clear();
}
