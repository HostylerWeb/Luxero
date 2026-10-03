import dbConnect from "@luxero/api-infra/db";
import { ErrorCodes } from "@luxero/api-infra/error-codes";
import { error, success } from "@luxero/api-infra/response";
import { createLogger } from "@luxero/api-logger";
import { getHomepageLayoutSettings } from "@luxero/api-server/lib/settings/homepage-layout-settings";
import { redisCacheRoute } from "@luxero/api-server/middleware/cache";
import { Hono } from "hono";

const log = createLogger("homepage-layout-settings");
const app = new Hono();

app.get(
  "/",
  redisCacheRoute({
    route: "settings:homepage_layout_settings",
    scope: "public",
    ttlSeconds: 300,
  }),
  async (c) => {
    try {
      log.debug("fetching homepage layout settings");
      await dbConnect();

      const settings = await getHomepageLayoutSettings();
      return success(c, settings);
    } catch (err: unknown) {
      log.error("Error fetching homepage layout settings:", err);
      return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
    }
  }
);

export default app;
