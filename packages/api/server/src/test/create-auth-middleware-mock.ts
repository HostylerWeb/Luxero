import { vi } from "vitest";

type Middleware = (c: unknown, next: () => Promise<void>) => Promise<void>;

const passThrough: Middleware = async (_c, next) => {
  await next();
};

/** Full auth middleware stub so partial route mocks do not break other tests in the same run. */
export function createAuthMiddlewareMock(overrides: Record<string, unknown> = {}) {
  return {
    isPublicRoute: () => false,
    resolveSession: vi.fn(async () => {}),
    sessionMiddleware: passThrough,
    requireSession: passThrough,
    requireVerifiedUser: passThrough,
    getRequiredUserId: () => "test-user-id",
    auth: passThrough,
    requireAdmin: passThrough,
    ...overrides,
  };
}
