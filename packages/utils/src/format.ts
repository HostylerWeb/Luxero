/**
 * Formats a ticket/entry number as a 5-digit zero-padded string.
 * Example: 1 → "00001", 42 → "00042", 12345 → "12345"
 */
export function formatTicketNumber(n: number): string {
  return String(n).padStart(5, "0");
}

export function getProfileInitials(profile: {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
}): string {
  if (profile.firstName) {
    return [profile.firstName, profile.lastName]
      .filter(Boolean)
      .map((name) => name![0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  return profile.email?.[0]?.toUpperCase() ?? "?";
}

export function getDisplayName(
  profile: { firstName?: string | null; lastName?: string | null } | null,
  email: string
): string {
  if (profile?.firstName)
    return (
      `${profile.firstName}${profile.lastName ? ` ${profile.lastName}` : ""}`.trim() || "Anonymous"
    );
  const prefix = email.split("@")[0];
  return prefix || "Anonymous";
}

/**
 * Formats an order number as a 12-digit zero-padded string for uniform
 * cross-surface display. Order numbers are timestamp-based (~12 digits);
 * padding guarantees consistent width in tables, emails, and dashboards.
 * Example: 1747864800847 → "1747864800847", 728119 → "000000728119"
 */
export function formatOrderNumber(n: number): string {
  return String(n).padStart(12, "0");
}
