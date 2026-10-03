export function formatCurrency(amount: number, currency?: string) {
  const value = amount;
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency ?? "GBP",
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(dateString?: string) {
  if (!dateString) return "TBC";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(dateString));
}

export function formatWinnerName(displayName?: string, showFull?: boolean) {
  if (!displayName) return "Lucky winner";
  if (showFull) return displayName;
  const parts = displayName.split(" ");
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}
