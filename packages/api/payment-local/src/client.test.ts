import { afterEach, describe, expect, test } from "vitest";
import { createLocalClient, LocalClient } from "./client";
import { getLocalEnabledFromEnv, hasLocalEnvCredentials } from "./env";
import { LocalError } from "./types";

const originalEnv: Record<string, string | undefined> = {};

function setEnv(name: string, value: string | undefined): void {
  originalEnv[name] = process.env[name];
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
}

afterEach(() => {
  for (const [name, value] of Object.entries(originalEnv)) {
    if (value === undefined) {
      delete process.env[name];
    } else {
      process.env[name] = value;
    }
  }
});

describe("LocalClient", () => {
  test("createSessionId returns local_-prefixed id", () => {
    const client = new LocalClient({ environment: "sandbox", enabled: true });
    const id = client.createSessionId();
    expect(id.startsWith("local_")).toBe(true);
    expect(id.length).toBeGreaterThan("local_".length);
  });

  test("validateAmount rejects non-positive", () => {
    const client = new LocalClient({ environment: "sandbox", enabled: true });
    expect(() => client.validateAmount(0)).toThrow(LocalError);
    expect(() => client.validateAmount(-1)).toThrow(LocalError);
    expect(() => client.validateAmount(Number.NaN)).toThrow(LocalError);
  });

  test("validateAmount accepts positive numbers", () => {
    const client = new LocalClient({ environment: "sandbox", enabled: true });
    expect(() => client.validateAmount(10)).not.toThrow();
    expect(() => client.validateAmount(0.01)).not.toThrow();
  });

  test("resolveSession throws on non-local prefix", () => {
    const client = new LocalClient({ environment: "sandbox", enabled: true });
    expect(() => client.resolveSession("gc_abc")).toThrow(LocalError);
    expect(() => client.resolveSession("paypal_123")).toThrow(LocalError);
  });

  test("resolveSession returns completed for local_ prefix", () => {
    const client = new LocalClient({ environment: "sandbox", enabled: true });
    const result = client.resolveSession("local_xyz");
    expect(result.status).toBe("completed");
  });

  test("voidSession returns success: true", async () => {
    const client = new LocalClient({ environment: "sandbox", enabled: true });
    const result = await client.voidSession("local_xyz");
    expect(result.success).toBe(true);
  });

  test("testConnection returns success when enabled", async () => {
    const client = new LocalClient({ environment: "sandbox", enabled: true });
    const result = await client.testConnection();
    expect(result.success).toBe(true);
  });

  test("testConnection returns failure when disabled", async () => {
    const client = new LocalClient({ environment: "sandbox", enabled: false });
    const result = await client.testConnection();
    expect(result.success).toBe(false);
    expect(result.error).toContain("disabled");
  });
});

describe("createLocalClient", () => {
  test("returns a LocalClient instance", () => {
    const client = createLocalClient({ enabled: true });
    expect(client).toBeInstanceOf(LocalClient);
  });

  test("defaults to enabled when no config given", () => {
    const client = createLocalClient();
    expect(client).toBeInstanceOf(LocalClient);
  });
});

describe("env helpers", () => {
  test("hasLocalEnvCredentials is always true", () => {
    setEnv("ENABLE_LOCAL_PAYMENT_METHOD", undefined);
    expect(hasLocalEnvCredentials()).toBe(true);
  });

  test("getLocalEnabledFromEnv respects explicit override", () => {
    setEnv("ENABLE_LOCAL_PAYMENT_METHOD", "true");
    setEnv("NODE_ENV", "production");
    expect(getLocalEnabledFromEnv()).toBe(true);

    setEnv("ENABLE_LOCAL_PAYMENT_METHOD", "false");
    expect(getLocalEnabledFromEnv()).toBe(false);
  });

  test("getLocalEnabledFromEnv defaults to true outside production", () => {
    setEnv("ENABLE_LOCAL_PAYMENT_METHOD", undefined);
    setEnv("NODE_ENV", "development");
    expect(getLocalEnabledFromEnv()).toBe(true);
  });

  test("getLocalEnabledFromEnv defaults to false in production without override", () => {
    setEnv("ENABLE_LOCAL_PAYMENT_METHOD", undefined);
    setEnv("NODE_ENV", "production");
    expect(getLocalEnabledFromEnv()).toBe(false);
  });
});
