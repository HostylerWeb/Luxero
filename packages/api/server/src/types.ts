import "hono";

declare module "hono" {
  interface ContextVariableMap {
    requestId: string;
    user: import("./lib/auth").AuthUser | null;
    session: import("./lib/auth").AuthSessionData | null;
    userId: string | null;
    email: string | null;
    isAdmin: boolean;
    origin: string;
    body: unknown;
    query: unknown;
    nonce: string;
  }
}
