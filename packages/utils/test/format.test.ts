import { describe, expect, test } from "vitest";
import { formatOrderNumber } from "../src/format";

describe("formatOrderNumber", () => {
  test("zero-pads short numbers to 12 digits", () => {
    expect(formatOrderNumber(728119)).toBe("000000728119");
    expect(formatOrderNumber(1)).toBe("000000000001");
  });

  test("does not pad numbers already at or above 12 digits", () => {
    expect(formatOrderNumber(1747864800847)).toBe("1747864800847");
    expect(formatOrderNumber(99999999999999)).toBe("99999999999999");
  });

  test("handles zero", () => {
    expect(formatOrderNumber(0)).toBe("000000000000");
  });

  test("propagates non-finite values as the literal digits", () => {
    // Math: padStart preserves the string form of the input. NaN → "NaN".
    // Callers must guard with Number.isFinite before invoking.
    expect(formatOrderNumber(Number.NaN)).toBe("000000000NaN");
  });
});
