import {
  DEFAULT_MEDIA_CONVERTER_SETTINGS,
  MediaConverterSettings,
  type IMediaConverterSettings,
} from "@luxero/api-db/models/MediaConverterSettings";
import dbConnect from "@luxero/api-infra/db";
import { ErrorCodes } from "@luxero/api-infra/error-codes";
import { error, success } from "@luxero/api-infra/response";
import { captureRouteError } from "@luxero/api-infra/sentry";
import { requireAdmin } from "@luxero/api-server/middleware/auth";
import {
  invalidateMediaConverterSettingsCache,
} from "@luxero/api-server/lib/media-converter/settings";
import { adminMediaConverterSettingsUpdateSchema } from "@luxero/api-validation";
import { Hono } from "hono";

const app = new Hono();

app.use("*", requireAdmin);

app.get("/", async (c) => {
  try {
    await dbConnect();
    const settings = await MediaConverterSettings.findById("media_converter_settings").lean();
    return success(c, settings ?? DEFAULT_MEDIA_CONVERTER_SETTINGS);
  } catch (err: unknown) {
    captureRouteError(err, {
      requestId: c.get("requestId"),
      path: c.req.path,
      userId: c.get("userId") ?? null,
      operation: "admin.mediaConverterSettings.get",
    });
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

app.put("/", async (c) => {
  try {
    const body = await c.req.json();
    await dbConnect();

    const parsed = adminMediaConverterSettingsUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return error(c, ErrorCodes.VALIDATION_ERROR, "Invalid media converter settings", 400);
    }

    const updates: Record<string, unknown> = {};
    const data = parsed.data;

    if (typeof data.addonEnabled === "boolean") {
      updates.addonEnabled = data.addonEnabled;
    }

    if (data.image) {
      for (const field of ["enabled", "quality", "maxWidth", "maxHeight"] as const) {
        const v = data.image[field];
        if (typeof v === "number" || typeof v === "boolean") {
          updates[`image.${field}`] = v;
        }
      }
      if (data.image.scopes) {
        for (const [scope, enabled] of Object.entries(data.image.scopes)) {
          if (typeof enabled === "boolean") {
            updates[`image.scopes.${scope}`] = enabled;
          }
        }
      }
    }

    if (data.video) {
      for (const field of ["enabled", "quality", "maxWidth", "preserveAudio"] as const) {
        const v = data.video[field];
        if (typeof v === "number" || typeof v === "boolean") {
          updates[`video.${field}`] = v;
        }
      }
      if (data.video.scopes) {
        for (const [scope, enabled] of Object.entries(data.video.scopes)) {
          if (typeof enabled === "boolean") {
            updates[`video.scopes.${scope}`] = enabled;
          }
        }
      }
    }

    const settings = await MediaConverterSettings.findByIdAndUpdate(
      "media_converter_settings",
      { $set: updates },
      { upsert: true, returnDocument: "after" }
    ).lean<IMediaConverterSettings>();

    invalidateMediaConverterSettingsCache();

    return success(c, settings ?? DEFAULT_MEDIA_CONVERTER_SETTINGS);
  } catch (err: unknown) {
    captureRouteError(err, {
      requestId: c.get("requestId"),
      path: c.req.path,
      userId: c.get("userId") ?? null,
      operation: "admin.mediaConverterSettings.put",
    });
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

export default app;
