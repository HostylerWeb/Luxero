import { SeoSettings } from "@luxero/api-db/models";
import dbConnect from "@luxero/api-infra/db";
import { ErrorCodes } from "@luxero/api-infra/error-codes";
import { error, success } from "@luxero/api-infra/response";
import { redisCacheRoute } from "@luxero/api-server/middleware/cache";
import { Hono } from "hono";

const app = new Hono();

app.get(
  "/",
  redisCacheRoute({
    route: "settings:seo_settings:public",
    scope: "public",
    ttlSeconds: 300,
  }),
  async (c) => {
    try {
      await dbConnect();
      const settings = await SeoSettings.findById("seo_settings").lean();
      return success(c, settings ?? null);
    } catch (err: unknown) {
      console.error("Error fetching public SEO settings:", err);
      return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
    }
  }
);

export default app;
