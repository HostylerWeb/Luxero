/** Normalize email for auth API calls (trim + lowercase). */
export function normalizeAuthEmail(email: string): string {
  return email.trim().toLowerCase();
}
