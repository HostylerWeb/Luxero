import { describe, expect, test } from "vitest";
import { normalizeAnswerIndex } from "./answer-index";

describe("normalizeAnswerIndex", () => {
  test("returns 0 when questionOptions is empty or missing", () => {
    expect(normalizeAnswerIndex(-1)).toBe(0);
    expect(normalizeAnswerIndex(3)).toBe(0);
    expect(normalizeAnswerIndex(-1, [])).toBe(0);
    expect(normalizeAnswerIndex(undefined, [])).toBe(0);
  });

  test("returns valid index within options", () => {
    expect(normalizeAnswerIndex(0, ["A", "B"])).toBe(0);
    expect(normalizeAnswerIndex(1, ["A", "B"])).toBe(1);
  });

  test("clamps negative and out-of-range indices to 0", () => {
    expect(normalizeAnswerIndex(-1, ["A", "B"])).toBe(0);
    expect(normalizeAnswerIndex(2, ["A", "B"])).toBe(0);
    expect(normalizeAnswerIndex(99, ["A"])).toBe(0);
  });

  test("defaults undefined to 0 then validates", () => {
    expect(normalizeAnswerIndex(undefined, ["A", "B"])).toBe(0);
  });
});
