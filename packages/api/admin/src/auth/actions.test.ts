import { describe, expect, test } from "vitest";
import {
  getAuthErrorMessage,
  isOtpRecoveryError,
  isUnverifiedEmailSignInError,
  normalizeAuthEmail,
} from "./actions";

describe("normalizeAuthEmail", () => {
  test("trims and lowercases", () => {
    expect(normalizeAuthEmail("  User@Example.COM  ")).toBe("user@example.com");
  });
});

describe("getAuthErrorMessage", () => {
  test("maps OTP error codes to user-facing copy", () => {
    expect(getAuthErrorMessage({ code: "OTP_EXPIRED" })).toContain("expired");
    expect(getAuthErrorMessage({ code: "INVALID_OTP" })).toContain("isn't valid");
    expect(getAuthErrorMessage({ code: "TOO_MANY_ATTEMPTS" })).toContain("Too many tries");
    expect(getAuthErrorMessage({ code: "EMAIL_NOT_VERIFIED" })).toContain("verify your email");
  });
});

describe("isUnverifiedEmailSignInError", () => {
  test("detects code and message variants", () => {
    expect(isUnverifiedEmailSignInError({ code: "EMAIL_NOT_VERIFIED" })).toBe(true);
    expect(isUnverifiedEmailSignInError({ message: "Email not verified" })).toBe(true);
    expect(isUnverifiedEmailSignInError({ code: "INVALID_OTP" })).toBe(false);
  });
});

describe("isOtpRecoveryError", () => {
  test("matches expired and invalid OTP codes", () => {
    expect(isOtpRecoveryError({ code: "OTP_EXPIRED" })).toBe(true);
    expect(isOtpRecoveryError({ code: "INVALID_OTP" })).toBe(true);
    expect(isOtpRecoveryError({ code: "TOO_MANY_ATTEMPTS" })).toBe(false);
  });
});
