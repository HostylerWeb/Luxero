import { ShopCategory } from "@luxero/api-db/models";
import dbConnect from "@luxero/api-infra/db";
import { ErrorCodes } from "@luxero/api-infra/error-codes";
import { error, success } from "@luxero/api-infra/response";
import { captureRouteError } from "@luxero/api-infra/sentry";
import { createLogger } from "@luxero/api-logger";
import { redisCacheRoute } from "@luxero/api-server/middleware/cache";
import { Hono } from "hono";

const log = createLogger("shop-categories");
const app = new Hono({ strict: false });

app.get(
  "/",
  redisCacheRoute({
    route: "shop:categories",
    scope: "public",
    ttlSeconds: 300,
  }),
  async (c) => {
    try {
      log.debug("fetching shop categories");
      await dbConnect();

      const categories = await ShopCategory.find({ isActive: true, deletedAt: null })
        .sort({ sortOrder: -1 })
        .lean();

      return success(c, categories);
    } catch (err: unknown) {
      log.error("Error fetching shop categories:", err);
      captureRouteError(err, {
        requestId: c.get("requestId"),
        path: c.req.path,
        userId: c.get("userId") ?? null,
        operation: "shop.categories.get",
      });
      return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
    }
  }
);

export default app;
