import { Profile } from "@luxero/api-db/models";
import dbConnect from "@luxero/api-infra/db";
import { ErrorCodes } from "@luxero/api-infra/error-codes";
import { error, success } from "@luxero/api-infra/response";
import { captureRouteError } from "@luxero/api-infra/sentry";
import { requireSession } from "@luxero/api-server/middleware/auth";
import {
  deleteAvatarIfOwned,
  getAuthUserImage,
  hasGoogleAccount,
} from "@luxero/api-storage/avatar-storage";
import { buildAssetUrl, uploadFile } from "@luxero/api-storage/s3";
import { Hono } from "hono";

const app = new Hono();

const MAX_FILE_SIZE = 2 * 1024 * 1024;

app.use("*", requireSession);

function rejectAnonymous(c: Parameters<typeof requireSession>[0]) {
  const user = c.get("user");
  if (user?.isAnonymous) {
    return error(c, ErrorCodes.FORBIDDEN, "Please sign in to manage your profile picture", 403);
  }
  return null;
}

function getExtFromFile(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName)) return fromName;

  const subtype = file.type.split("/")[1]?.toLowerCase();
  if (subtype === "jpeg") return "jpg";
  if (subtype === "svg+xml") return "svg";
  if (subtype) return subtype.replace("+xml", "");
  return "jpg";
}

app.post("/", async (c) => {
  try {
    const denied = rejectAnonymous(c);
    if (denied) return denied;

    const userId = c.get("userId")!;
    const formData = await c.req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return error(c, ErrorCodes.MISSING_PARAMS, "file is required", 400);
    }

    if (!file.type.startsWith("image/")) {
      return error(c, ErrorCodes.VALIDATION_ERROR, "Only image files are allowed", 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return error(c, ErrorCodes.VALIDATION_ERROR, "File too large. Max 2MB.", 400);
    }

    await dbConnect();

    const ext = getExtFromFile(file);
    const random = Math.random().toString(36).slice(2);
    const key = `avatars/${userId}/${Date.now()}-${random}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    await uploadFile(key, new Uint8Array(arrayBuffer), file.type);

    // Delete old avatar only after new one is uploaded successfully
    const existing = await Profile.findById(userId).select("avatarUrl").lean();
    if (existing?.avatarUrl) {
      await deleteAvatarIfOwned(existing.avatarUrl).catch((err) =>
        console.error("Failed to delete old avatar:", err)
      );
    }

    const avatarUrl = buildAssetUrl(key);
    const profile = await Profile.findByIdAndUpdate(
      userId,
      { avatarUrl },
      { returnDocument: "after" }
    ).lean();

    if (!profile) {
      return error(c, ErrorCodes.NOT_FOUND, "Profile not found", 404);
    }

    return success(c, profile);
  } catch (err: unknown) {
    captureRouteError(err, {
      requestId: c.get("requestId"),
      path: c.req.path,
      userId: c.get("userId") ?? null,
      operation: "avatar.upload",
    });
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

app.delete("/", async (c) => {
  try {
    const denied = rejectAnonymous(c);
    if (denied) return denied;

    const userId = c.get("userId")!;
    await dbConnect();

    const existing = await Profile.findById(userId).select("avatarUrl").lean();
    if (existing?.avatarUrl) {
      await deleteAvatarIfOwned(existing.avatarUrl);
    }

    const profile = await Profile.findByIdAndUpdate(
      userId,
      { $unset: { avatarUrl: 1 } },
      { returnDocument: "after" }
    ).lean();

    if (!profile) {
      return error(c, ErrorCodes.NOT_FOUND, "Profile not found", 404);
    }

    return success(c, profile);
  } catch (err: unknown) {
    captureRouteError(err, {
      requestId: c.get("requestId"),
      path: c.req.path,
      userId: c.get("userId") ?? null,
      operation: "avatar.delete",
    });
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

app.post("/import-google", async (c) => {
  try {
    const denied = rejectAnonymous(c);
    if (denied) return denied;

    const userId = c.get("userId")!;
    await dbConnect();

    const linked = await hasGoogleAccount(userId);
    if (!linked) {
      return error(c, ErrorCodes.FORBIDDEN, "Connect a Google account first", 403);
    }

    const image = await getAuthUserImage(userId);
    if (!image) {
      return error(c, ErrorCodes.NOT_FOUND, "No Google profile picture available", 404);
    }

    const profile = await Profile.findByIdAndUpdate(
      userId,
      { avatarUrl: image },
      { returnDocument: "after" }
    ).lean();

    if (!profile) {
      return error(c, ErrorCodes.NOT_FOUND, "Profile not found", 404);
    }

    return success(c, profile);
  } catch (err: unknown) {
    captureRouteError(err, {
      requestId: c.get("requestId"),
      path: c.req.path,
      userId: c.get("userId") ?? null,
      operation: "avatar.importGoogle",
    });
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

export default app;
