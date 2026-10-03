export function getDefaultBirthDate(minAge = 18): Date {
  const date = new Date();
  date.setFullYear(date.getFullYear() - minAge);
  date.setHours(12, 0, 0, 0);
  return date;
}

/** Latest calendar date that still satisfies minAge (inclusive). */
export function getLatestAllowedBirthDate(minAge = 18): Date {
  const date = new Date();
  date.setFullYear(date.getFullYear() - minAge);
  date.setHours(23, 59, 59, 999);
  return date;
}

export function isDobAtLeastMinAge(dateOfBirth: string, minAge: number): boolean {
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return false;

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age >= minAge;
}

export function formatDateIso(date: Date): string {
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseIsoDate(value: string): Date | undefined {
  if (!value) return undefined;
  const parsed = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}
