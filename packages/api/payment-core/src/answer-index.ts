/**
 * Normalize cart/checkout answerIndex against competition questionOptions.
 * Returns 0 when there is no quiz; clamps invalid indices to 0.
 */
export function normalizeAnswerIndex(
  answerIndex: number | undefined,
  questionOptions?: string[]
): number {
  const optionCount = questionOptions?.length ?? 0;
  if (optionCount === 0) return 0;
  const idx = answerIndex ?? 0;
  if (idx < 0 || idx >= optionCount) return 0;
  return idx;
}
