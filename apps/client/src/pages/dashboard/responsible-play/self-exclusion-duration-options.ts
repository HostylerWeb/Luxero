import { USER_SELF_EXCLUSION_DURATIONS, type UserSelfExclusionDuration } from "@luxero/types";
import type { TranslationKey } from "@/lib/i18n";

const LABEL_KEYS: Record<UserSelfExclusionDuration, TranslationKey> = {
  "1week": "dashboard.responsiblePlay.exclusionOptions.oneWeek",
  "2weeks": "dashboard.responsiblePlay.exclusionOptions.twoWeeks",
  "1month": "dashboard.responsiblePlay.exclusionOptions.oneMonth",
  "2months": "dashboard.responsiblePlay.exclusionOptions.twoMonths",
  "3months": "dashboard.responsiblePlay.exclusionOptions.threeMonths",
  "6months": "dashboard.responsiblePlay.exclusionOptions.sixMonths",
  "1year": "dashboard.responsiblePlay.exclusionOptions.oneYear",
};

export const USER_SELF_EXCLUSION_OPTIONS = USER_SELF_EXCLUSION_DURATIONS.map((value) => ({
  value,
  labelKey: LABEL_KEYS[value],
}));

export const DEFAULT_USER_SELF_EXCLUSION_DURATION: UserSelfExclusionDuration = "1week";
