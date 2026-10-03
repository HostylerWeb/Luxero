// globalSetup.ts - runs once before all test files.
//
// Spins up an in-memory MongoDB (mongodb-memory-server) so tests that
// exercise the full Mongoose / Better Auth / route stack can hit a real
// database instead of erroring with "uri undefined" or "buffering timed
// out". The URI is exposed via DATABASE_URL before any test module is
// imported so config files that read process.env at module-load time
// see it.

import { MongoMemoryServer } from "mongodb-memory-server";

export async function setup() {
  const server = await MongoMemoryServer.create();
  const uri = server.getUri();

  // Make the URI available to every test via env. Config files that read
  // process.env.DATABASE_URL at module-load time (e.g. runtime-config.ts)
  // will pick it up on first import.
  process.env.DATABASE_URL = uri;
  process.env.BETTER_AUTH_SECRET ||= "test-secret-please-do-not-use-in-production";
  process.env.NEXT_PUBLIC_APP_URL ||= "http://localhost:3111";
  process.env.NODE_ENV = "test";

  // Return a teardown that vitest will call when the test run ends.
  return async () => {
    await server.stop();
  };
}
