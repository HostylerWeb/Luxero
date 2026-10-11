import { ErrorCodes } from "@luxero/api-infra/error-codes";
import { error } from "@luxero/api-infra/response";
import { isAllowedRequestOrigin } from "@luxero/env/origin-policy";
import type { MiddlewareHandler } from "hono";

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

const SKIP_PATH_PREFIXES = [
  "/api/payments/webhook/",
  "/api/payments/paytriot/return",
  "/api/auth",
  "/api/auth-setup",
  "/api/auth-emergency",
  "/api/internal/jobs",
];

const LUXERO_CLIENT_HEADER = "x-luxero-client";

function shouldSkipCsrf(path: string): boolean {
  return SKIP_PATH_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export function csrfProtection(): MiddlewareHandler {
  return async (c, next) => {
    if (!MUTATING.has(c.req.method)) return next();

    const path = c.req.path;
    if (shouldSkipCsrf(path)) return next();

    const secFetchSite = c.req.header("sec-fetch-site");
    if (secFetchSite === "cross-site") {
      return error(c, ErrorCodes.FORBIDDEN, "Cross-site request blocked", 403);
    }

    const origin = c.req.header("origin");
    if (origin) {
      if (!isAllowedRequestOrigin(origin)) {
        return error(c, ErrorCodes.FORBIDDEN, "Origin not allowed", 403);
      }
    } else {
      if (secFetchSite === "none") {
        return error(c, ErrorCodes.FORBIDDEN, "Cross-site request blocked", 403);
      }
      const sameSite =
        secFetchSite === "same-origin" || secFetchSite === "same-site";
      const clientMarker = c.req.header(LUXERO_CLIENT_HEADER);
      if (!sameSite && clientMarker !== "1") {
        return error(c, ErrorCodes.FORBIDDEN, "Origin verification required", 403);
      }
    }

    const contentType = (c.req.header("content-type") ?? "").toLowerCase();
    const contentLength = c.req.header("content-length");
    const hasBody = contentLength !== "0" && contentLength !== undefined && contentLength !== "";

    if (
      hasBody &&
      !contentType.includes("application/json") &&
      !contentType.includes("multipart/form-data") &&
      !contentType.includes("application/x-www-form-urlencoded")
    ) {
      return error(c, ErrorCodes.VALIDATION_ERROR, "Unsupported Content-Type", 415);
    }

    return next();
  };
}
