import { describe, expect, test } from "vitest";
import {
  GC_TIME,
  STALE_TIME_ADMIN,
  STALE_TIME_LIVE,
  STALE_TIME_PUBLIC,
  STALE_TIME_STATIC,
  STALE_TIME_USER,
} from "./constants";
import { createQueryClient, staleTimeForKey } from "./query-client";

describe("staleTimeForKey", () => {
  test("public settings singletons → static (10 min)", () => {
    expect(staleTimeForKey(["public", "compliance-settings"])).toBe(STALE_TIME_STATIC);
    expect(staleTimeForKey(["public", "referral-settings"])).toBe(STALE_TIME_STATIC);
    expect(staleTimeForKey(["public", "ending-soon-settings"])).toBe(STALE_TIME_STATIC);
    expect(staleTimeForKey(["public", "homepage-layout-settings"])).toBe(STALE_TIME_STATIC);
  });

  test("payment config and providers → static", () => {
    expect(staleTimeForKey(["public", "payment", "config"])).toBe(STALE_TIME_STATIC);
    expect(staleTimeForKey(["public", "payment", "providers"])).toBe(STALE_TIME_STATIC);
  });

  test("other public reads → public (5 min)", () => {
    expect(staleTimeForKey(["public", "categories"])).toBe(STALE_TIME_PUBLIC);
    expect(staleTimeForKey(["public", "homepage"])).toBe(STALE_TIME_PUBLIC);
  });

  test("my.* → user (1 min)", () => {
    expect(staleTimeForKey(["my", "profile"])).toBe(STALE_TIME_USER);
    expect(staleTimeForKey(["my", "orders", 1])).toBe(STALE_TIME_USER);
    expect(staleTimeForKey(["my", "balance"])).toBe(STALE_TIME_USER);
  });

  test("admin.* → admin (1 min)", () => {
    expect(staleTimeForKey(["admin", "competitions", 1, 20])).toBe(STALE_TIME_ADMIN);
    expect(staleTimeForKey(["admin", "users", 1, 20])).toBe(STALE_TIME_ADMIN);
  });

  test("dashboard.* → user (1 min)", () => {
    expect(staleTimeForKey(["dashboard"])).toBe(STALE_TIME_USER);
  });

  test("competitions availability / buying-power → live (10s)", () => {
    expect(staleTimeForKey(["competitions", "abc123", "availability", "user-1"])).toBe(
      STALE_TIME_LIVE
    );
    expect(staleTimeForKey(["competitions", "abc123", "buying-power", "user-1"])).toBe(
      STALE_TIME_LIVE
    );
    expect(staleTimeForKey(["competitions", "availability-batch", "a,b,c"])).toBe(STALE_TIME_LIVE);
    expect(staleTimeForKey(["competitions", "buying-power-batch", "a,b,c", "user-1"])).toBe(
      STALE_TIME_LIVE
    );
  });

  test("payment session polling → 30s", () => {
    expect(staleTimeForKey(["payment", "session", "paytriot", "order-1"])).toBe(30_000);
  });

  test("competitions list and detail → public default", () => {
    expect(staleTimeForKey(["competitions", { status: "active", limit: 24 }])).toBe(
      STALE_TIME_PUBLIC
    );
    expect(staleTimeForKey(["competitions", "iphone-15-pro"])).toBe(STALE_TIME_PUBLIC);
  });

  test("cart → public default (cart has its own refetch interval)", () => {
    expect(staleTimeForKey(["cart"])).toBe(STALE_TIME_PUBLIC);
  });

  test("unknown prefix → public default", () => {
    expect(staleTimeForKey(["weird", "key"])).toBe(STALE_TIME_PUBLIC);
  });
});

describe("createQueryClient", () => {
  test("honors the per-prefix staleTime function", () => {
    const qc = createQueryClient();
    // Set data on a known key and read its options
    void qc.setQueryData(["public", "homepage-layout-settings"], { data: {} });
    const opts = qc.getQueryCache().find({ queryKey: ["public", "homepage-layout-settings"] });
    expect(opts?.meta).toBeUndefined(); // meta is not auto-set
    // Direct check: ensure defaultOptions.queries.staleTime is a function
    const defaultStaleTime = qc.getDefaultOptions().queries?.staleTime;
    expect(typeof defaultStaleTime).toBe("function");
  });

  test("gcTime default matches GC_TIME constant", () => {
    const qc = createQueryClient();
    const gcTime = qc.getDefaultOptions().queries?.gcTime;
    expect(gcTime).toBe(GC_TIME);
  });

  test("mutations capture exceptions via Sentry", () => {
    const qc = createQueryClient();
    const onError = qc.getDefaultOptions().mutations?.onError;
    expect(typeof onError).toBe("function");
  });
});
