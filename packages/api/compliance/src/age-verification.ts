export function calculateAgeFromDob(dob: Date, referenceDate = new Date()): number {
  let age = referenceDate.getFullYear() - dob.getFullYear();
  const monthDiff = referenceDate.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

export function isDobMeetsMinAge(dob: Date, minAge: number): boolean {
  return calculateAgeFromDob(dob) >= minAge;
}

export function parseDateOfBirthInput(value: string): Date | null {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

export type DateOfBirthProfileUpdate = {
  dateOfBirth: Date;
  isAgeVerified?: boolean;
  ageVerifiedAt?: Date | null;
  ageVerificationMethod?: "dob" | "admin" | "provider" | null;
};

export async function buildDateOfBirthProfileUpdate(
  dateOfBirthInput: string,
  settingsLoader: () => Promise<{
    masterEnabled: boolean;
    ageVerificationEnabled: boolean;
    ageVerificationMinAge: number;
  }> = async () => {
    const { getComplianceSettings } = await import("./settings");
    return getComplianceSettings();
  }
): Promise<DateOfBirthProfileUpdate | null> {
  const dob = parseDateOfBirthInput(dateOfBirthInput);
  if (!dob) return null;

  const settings = await settingsLoader();
  if (!settings.masterEnabled || !settings.ageVerificationEnabled) {
    return { dateOfBirth: dob };
  }

  const meetsMinAge = isDobMeetsMinAge(dob, settings.ageVerificationMinAge);
  return {
    dateOfBirth: dob,
    isAgeVerified: meetsMinAge,
    ageVerifiedAt: meetsMinAge ? new Date() : null,
    ageVerificationMethod: meetsMinAge ? "dob" : null,
  };
}
