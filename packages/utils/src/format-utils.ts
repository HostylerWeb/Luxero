const locale = "en-GB";

export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(
    locale,
    options ?? { day: "2-digit", month: "long", year: "numeric" }
  ).format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/London",
  }).format(d);
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = Date.now();
  const diffMs = d.getTime() - now;
  const absDiffMs = Math.abs(diffMs);
  const seconds = Math.floor(absDiffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return "just now";

  const future = diffMs > 0;
  if (minutes < 60)
    return future
      ? `in ${minutes} minute${minutes !== 1 ? "s" : ""}`
      : `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  if (hours < 24)
    return future
      ? `in ${hours} hour${hours !== 1 ? "s" : ""}`
      : `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  if (days < 7)
    return future
      ? `in ${days} day${days !== 1 ? "s" : ""}`
      : `${days} day${days !== 1 ? "s" : ""} ago`;
  if (weeks < 5)
    return future
      ? `in ${weeks} week${weeks !== 1 ? "s" : ""}`
      : `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
  if (months < 12)
    return future
      ? `in ${months} month${months !== 1 ? "s" : ""}`
      : `${months} month${months !== 1 ? "s" : ""} ago`;
  return future
    ? `in ${years} year${years !== 1 ? "s" : ""}`
    : `${years} year${years !== 1 ? "s" : ""} ago`;
}

export function formatNumber(n: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(locale, options).format(n);
}

export function formatCurrency(
  n: number,
  currencyOrOptions?: string | { currency?: string; fromPence?: boolean }
): string {
  let currency = "GBP";
  let fromPence = false;
  if (typeof currencyOrOptions === "string") {
    currency = currencyOrOptions;
  } else if (currencyOrOptions) {
    currency = currencyOrOptions.currency ?? "GBP";
    fromPence = currencyOrOptions.fromPence ?? false;
  }
  const amount = fromPence ? n / 100 : n;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercentage(n: number, decimals?: number): string {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    maximumFractionDigits: decimals ?? 1,
  }).format(n);
}

export function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
}
