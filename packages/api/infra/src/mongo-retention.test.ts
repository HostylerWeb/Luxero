import { describe, expect, it } from "vitest";
import {
  orderCompletedTtlSeconds,
  orderFailedTtlSeconds,
  orderPendingTtlSeconds,
  shouldSyncIndexesOnStartup,
} from "./mongo-retention";

describe("mongo-retention", () => {
  it("defaults completed TTL to ~7 years", () => {
    const prev = process.env.MONGODB_ORDER_COMPLETED_TTL_DAYS;
    delete process.env.MONGODB_ORDER_COMPLETED_TTL_DAYS;
    expect(orderCompletedTtlSeconds()).toBe(2555 * 24 * 60 * 60);
    if (prev !== undefined) process.env.MONGODB_ORDER_COMPLETED_TTL_DAYS = prev;
  });

  it("disables completed TTL when days is 0", () => {
    const prev = process.env.MONGODB_ORDER_COMPLETED_TTL_DAYS;
    process.env.MONGODB_ORDER_COMPLETED_TTL_DAYS = "0";
    expect(orderCompletedTtlSeconds()).toBe(0);
    if (prev !== undefined) process.env.MONGODB_ORDER_COMPLETED_TTL_DAYS = prev;
    else delete process.env.MONGODB_ORDER_COMPLETED_TTL_DAYS;
  });

  it("defaults failed TTL to 180 days", () => {
    const prev = process.env.MONGODB_ORDER_FAILED_TTL_DAYS;
    delete process.env.MONGODB_ORDER_FAILED_TTL_DAYS;
    expect(orderFailedTtlSeconds()).toBe(180 * 24 * 60 * 60);
    if (prev !== undefined) process.env.MONGODB_ORDER_FAILED_TTL_DAYS = prev;
  });

  it("defaults pending TTL to 7 days", () => {
    const prev = process.env.MONGODB_ORDER_PENDING_TTL_DAYS;
    delete process.env.MONGODB_ORDER_PENDING_TTL_DAYS;
    expect(orderPendingTtlSeconds()).toBe(7 * 24 * 60 * 60);
    if (prev !== undefined) process.env.MONGODB_ORDER_PENDING_TTL_DAYS = prev;
  });

  it("sync indexes on startup by default", () => {
    const prev = process.env.MONGODB_SYNC_INDEXES_ON_STARTUP;
    delete process.env.MONGODB_SYNC_INDEXES_ON_STARTUP;
    expect(shouldSyncIndexesOnStartup()).toBe(true);
    if (prev !== undefined) process.env.MONGODB_SYNC_INDEXES_ON_STARTUP = prev;
  });
});
