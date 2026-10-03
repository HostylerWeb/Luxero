/**
 * Cache get / set primitives with single-flight stampede protection.
 *
 * Pattern:
 *  1. GET key
 *     a. HIT  → return parsed value
 *     b. MISS → try to acquire a fetch lock (SET NX EX 5)
 *        - Acquired: run compute(), SET key with TTL, return
 *        - Not acquired: poll key briefly (50ms, 100ms, 200ms, 400ms, max 5s)
 *          once it appears, return. On timeout, fall through to compute().
 *
 * All operations fail open — if Redis is down, compute() is called directly.
 */

import type { Redis } from "ioredis";
import { getRedis, isCacheEnabled } from "./redis";

export interface CachedEnvelope<T> {
  value: T;
  storedAt: number;
  ttlMs: number;
}

export interface GetOrComputeOptions<T> {
  key: string;
  ttlSeconds: number;
  compute: () => Promise<T>;
  /** Optional: bypass the single-flight lock (use for cheap computes) */
  noLock?: boolean;
  /** Lock TTL in ms (default 5000) */
  lockTtlMs?: number;
  /** Max wait time for another worker to populate the key (default 5000ms) */
  waitTtlMs?: number;
}

const LOCK_PREFIX = "lock:";
const BACKOFFS_MS = [50, 100, 200, 400, 800];

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function tryAcquireLock(redis: Redis, key: string, ttlMs: number): Promise<boolean> {
  try {
    const res = await redis.set(`${LOCK_PREFIX}${key}`, "1", "PX", ttlMs, "NX");
    return res === "OK";
  } catch {
    return false;
  }
}

export async function getOrCompute<T>(opts: GetOrComputeOptions<T>): Promise<T> {
  const { key, ttlSeconds, compute } = opts;
  if (!isCacheEnabled()) {
    return compute();
  }
  const redis = await getRedis();
  if (!redis) {
    return compute();
  }
  const ttlMs = ttlSeconds * 1000;
  const lockTtlMs = opts.lockTtlMs ?? 5000;
  const waitTtlMs = opts.waitTtlMs ?? 5000;

  try {
    const raw = await redis.get(key);
    if (raw) {
      try {
        const envelope = JSON.parse(raw) as CachedEnvelope<T>;
        return envelope.value;
      } catch {
        // Corrupt entry; fall through and rebuild.
      }
    }
  } catch {
    return compute();
  }

  if (opts.noLock) {
    return rebuildAndStore(redis, key, ttlMs, compute);
  }

  const acquired = await tryAcquireLock(redis, key, lockTtlMs);
  if (acquired) {
    return rebuildAndStore(redis, key, ttlMs, compute, true);
  }

  // Another worker is rebuilding. Poll briefly.
  const deadline = Date.now() + waitTtlMs;
  for (const delay of BACKOFFS_MS) {
    if (Date.now() > deadline) break;
    await sleep(delay);
    try {
      const raw = await redis.get(key);
      if (raw) {
        const envelope = JSON.parse(raw) as CachedEnvelope<T>;
        return envelope.value;
      }
    } catch {
      // keep polling
    }
  }

  return rebuildAndStore(redis, key, ttlMs, compute);
}

async function rebuildAndStore<T>(
  redis: Redis,
  key: string,
  ttlMs: number,
  compute: () => Promise<T>,
  releaseLock = false
): Promise<T> {
  try {
    const value = await compute();
    const envelope: CachedEnvelope<T> = { value, storedAt: Date.now(), ttlMs };
    try {
      await redis.set(key, JSON.stringify(envelope), "PX", ttlMs);
    } catch {
      // Write failed but value is fine — return it.
    }
    return value;
  } finally {
    if (releaseLock) {
      try {
        await redis.del(`${LOCK_PREFIX}${key}`);
      } catch {
        // best-effort
      }
    }
  }
}

export async function cacheGetRaw<T>(key: string): Promise<T | null> {
  if (!isCacheEnabled()) return null;
  const redis = await getRedis();
  if (!redis) return null;
  try {
    const raw = await redis.get(key);
    if (!raw) return null;
    const envelope = JSON.parse(raw) as CachedEnvelope<T>;
    return envelope.value;
  } catch {
    return null;
  }
}

export async function cacheSetRaw<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  if (!isCacheEnabled()) return;
  const redis = await getRedis();
  if (!redis) return;
  const envelope: CachedEnvelope<T> = {
    value,
    storedAt: Date.now(),
    ttlMs: ttlSeconds * 1000,
  };
  try {
    await redis.set(key, JSON.stringify(envelope), "PX", ttlSeconds * 1000);
  } catch {
    // best-effort
  }
}
