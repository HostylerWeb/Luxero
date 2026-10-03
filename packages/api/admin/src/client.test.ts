import { describe, expect, it } from "vitest";
import {
  API_ADMIN_INSTANT_PRIZE_ASSIGN_TIMEOUT_MS,
  API_CHECKOUT_TIMEOUT_MS,
  adminInstantPrizeAssignPostOptions,
  checkoutRequestOptions,
} from "./client";

describe("request timeout presets", () => {
  it("checkout uses 60s timeout without timeout retries", () => {
    expect(checkoutRequestOptions.timeout).toBe(API_CHECKOUT_TIMEOUT_MS);
    expect(checkoutRequestOptions.retries).toBe(1);
    expect(checkoutRequestOptions.retryOnTimeout).toBe(false);
  });

  it("admin instant prize assign POST disables retries", () => {
    expect(adminInstantPrizeAssignPostOptions.timeout).toBe(
      API_ADMIN_INSTANT_PRIZE_ASSIGN_TIMEOUT_MS
    );
    expect(adminInstantPrizeAssignPostOptions.retries).toBe(0);
  });
});
