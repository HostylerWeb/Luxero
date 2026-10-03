export const DEFAULT_AGGREGATE_MAX_TIME_MS = 15_000;
export const DEFAULT_COUNT_MAX_TIME_MS = 15_000;

export function defaultAggregateOptions(maxTimeMS = DEFAULT_AGGREGATE_MAX_TIME_MS): {
  maxTimeMS: number;
} {
  return { maxTimeMS };
}

export function defaultCountMaxTimeMS(maxTimeMS = DEFAULT_COUNT_MAX_TIME_MS): number {
  return maxTimeMS;
}
