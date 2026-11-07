import {
  CashbackSettings,
  DEFAULT_CASHBACK_SETTINGS,
  type ICashbackSettings,
} from "@luxero/api-db/models/CashbackSettings";
import dbConnect from "@luxero/api-infra/db";
import { ErrorCodes } from "@luxero/api-infra/error-codes";
import { error, success } from "@luxero/api-infra/response";
import { captureRouteError } from "@luxero/api-infra/sentry";
import { requireAdmin } from "@luxero/api-server/middleware/auth";
import { adminCashbackSettingsUpdateSchema } from "@luxero/api-validation";
import { Hono } from "hono";

const app = new Hono();

app.use("*", requireAdmin);

app.get("/", async (c) => {
  try {
    await dbConnect();
    const settings = await CashbackSettings.findById("cashback_settings").lean();
    return success(c, settings ?? DEFAULT_CASHBACK_SETTINGS);
  } catch (err: unknown) {
    captureRouteError(err, {
      requestId: c.get("requestId"),
      path: c.req.path,
      userId: c.get("userId") ?? null,
      operation: "admin.cashbackSettings.get",
    });
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

app.put("/", async (c) => {
  try {
    const body = await c.req.json();
    await dbConnect();
    const parsed = adminCashbackSettingsUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return error(c, ErrorCodes.VALIDATION_ERROR, "Invalid cashback settings", 400);
    }

    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(parsed.data)) {
      if (value !== undefined) updates[key] = value;
    }

    const settings = await CashbackSettings.findByIdAndUpdate(
      "cashback_settings",
      { $set: updates },
      { upsert: true, returnDocument: "after" }
    ).lean<ICashbackSettings>();

    return success(c, settings ?? DEFAULT_CASHBACK_SETTINGS);
  } catch (err: unknown) {
    captureRouteError(err, {
      requestId: c.get("requestId"),
      path: c.req.path,
      userId: c.get("userId") ?? null,
      operation: "admin.cashbackSettings.put",
    });
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

export default app;
