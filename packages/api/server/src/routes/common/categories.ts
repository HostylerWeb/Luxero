import { Category } from "@luxero/api-db/models";
import dbConnect from "@luxero/api-infra/db";
import { ErrorCodes } from "@luxero/api-infra/error-codes";
import { error, success } from "@luxero/api-infra/response";
import { captureRouteError } from "@luxero/api-infra/sentry";
import { createLogger } from "@luxero/api-logger";
import { redisCacheRoute } from "@luxero/api-server/middleware/cache";
import { Hono } from "hono";

const log = createLogger("categories");
const app = new Hono();

app.get(
  "/",
  redisCacheRoute({
    route: "categories:all",
    scope: "public",
    ttlSeconds: 300,
  }),
  async (c) => {
    try {
      log.debug("fetching categories");
      await dbConnect();

      const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 }).lean();

      return success(c, categories);
    } catch (err: unknown) {
      log.error("Error fetching categories:", err);
      captureRouteError(err, {
        requestId: c.get("requestId"),
        path: c.req.path,
        userId: c.get("userId") ?? null,
        operation: "categories.get",
      });
      return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
    }
  }
);

export default app;
