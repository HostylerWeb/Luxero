import { getComplianceSettings, toPublicComplianceSettings } from "@luxero/api-compliance/settings";
import dbConnect from "@luxero/api-infra/db";
import { ErrorCodes } from "@luxero/api-infra/error-codes";
import { error, success } from "@luxero/api-infra/response";
import { redisCacheRoute } from "@luxero/api-server/middleware/cache";
import { Hono } from "hono";

const app = new Hono();

app.get(
  "/",
  redisCacheRoute({
    route: "settings:compliance_settings:public",
    scope: "public",
    ttlSeconds: 300,
  }),
  async (c) => {
    try {
      await dbConnect();
      const settings = await getComplianceSettings();
      return success(c, toPublicComplianceSettings(settings));
    } catch (err: unknown) {
      console.error("Error fetching public compliance settings:", err);
      return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
    }
  }
);

export default app;
