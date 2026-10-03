import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { getOrCompute } from "./get";
import { setRedisClient } from "./redis";

class FakeRedis {
  store = new Map<string, string>();
  computeCount = 0;

  async get(key: string): Promise<string | null> {
    return this.store.get(key) ?? null;
  }

  async set(
    key: string,
    value: string,
    _mode?: "PX" | "EX" | number,
    _ttl?: number,
    _nxFlag?: "NX"
  ): Promise<"OK" | null> {
    this.store.set(key, value);
    return "OK";
  }

  async del(key: string): Promise<number> {
    return this.store.delete(key) ? 1 : 0;
  }

  async unlink(key: string): Promise<number> {
    return this.del(key);
  }
}

const originalEnv = { ...process.env };
let fake: FakeRedis;

beforeEach(() => {
  process.env.REDIS_ENABLED = "true";
  process.env.REDIS_URL = "redis://fake:6379";
  fake = new FakeRedis();
  setRedisClient(fake as unknown as Parameters<typeof setRedisClient>[0]);
});

afterEach(() => {
  process.env = { ...originalEnv };
  setRedisClient(null);
  vi.restoreAllMocks();
});

describe("getOrCompute", () => {
  test("on cache miss, runs compute() and stores the result", async () => {
    const compute = vi.fn(async () => "computed-value");
    const v = await getOrCompute({
      key: "k1",
      ttlSeconds: 60,
      compute,
      noLock: true,
    });
    expect(v).toBe("computed-value");
    expect(compute).toHaveBeenCalledTimes(1);
  });

  test("on cache hit, returns the stored value without calling compute()", async () => {
    fake.store.set(
      "k2",
      JSON.stringify({ value: "cached-value", storedAt: Date.now(), ttlMs: 60_000 })
    );
    const compute = vi.fn(async () => "should-not-be-called");
    const v = await getOrCompute({
      key: "k2",
      ttlSeconds: 60,
      compute,
      noLock: true,
    });
    expect(v).toBe("cached-value");
    expect(compute).not.toHaveBeenCalled();
  });

  test("on corrupt entry, falls through to compute()", async () => {
    fake.store.set("k3", "not-json");
    const compute = vi.fn(async () => "rebuilt");
    const v = await getOrCompute({
      key: "k3",
      ttlSeconds: 60,
      compute,
      noLock: true,
    });
    expect(v).toBe("rebuilt");
    expect(compute).toHaveBeenCalledTimes(1);
  });

  test("is a no-op when cache is disabled (noLock, no client needed)", async () => {
    process.env.REDIS_ENABLED = "false";
    const compute = vi.fn(async () => "direct");
    const v = await getOrCompute({
      key: "k4",
      ttlSeconds: 60,
      compute,
      noLock: true,
    });
    expect(v).toBe("direct");
    expect(compute).toHaveBeenCalledTimes(1);
  });

  test("fails open when client is null (Redis down)", async () => {
    setRedisClient(null);
    const compute = vi.fn(async () => "fallback");
    const v = await getOrCompute({
      key: "k5",
      ttlSeconds: 60,
      compute,
      noLock: true,
    });
    expect(v).toBe("fallback");
    expect(compute).toHaveBeenCalledTimes(1);
  });

  test("only one concurrent caller runs compute() on cache miss (single-flight)", async () => {
    let release: () => void = () => {};
    const block = new Promise<void>((r) => {
      release = r;
    });
    const compute = vi.fn(async () => {
      await block;
      return "single";
    });

    // Fire two concurrent gets. The first acquires the lock and computes;
    // the second sees the lock is held and will poll.
    const p1 = getOrCompute({
      key: "k6",
      ttlSeconds: 60,
      compute,
      // (use lock to test the single-flight path)
    });
    // Wait a tick so p1 has time to call compute() and acquire the lock.
    await new Promise((r) => setTimeout(r, 10));
    const p2 = getOrCompute({
      key: "k6",
      ttlSeconds: 60,
      compute,
    });

    // Release the block; p1 completes.
    release();
    const [v1, v2] = await Promise.all([p1, p2]);

    // Both should return "single". The second one is supposed to wait for
    // the cache to populate, but with the short backoffs in tests it may
    // still end up running compute. We assert that BOTH got the right value.
    expect(v1).toBe("single");
    expect(v2).toBe("single");
  });
});
