import { writeComplianceAuditLog } from "@luxero/api-compliance/compliance-user-service";
import { Profile } from "@luxero/api-db/models";
import dbConnect from "@luxero/api-infra/db";
import { ErrorCodes } from "@luxero/api-infra/error-codes";
import { error, success } from "@luxero/api-infra/response";
import { captureRouteError } from "@luxero/api-infra/sentry";
import { getRequiredUserId, requireAdmin } from "@luxero/api-server/middleware/auth";
import { adminUserProfilePatchSchema } from "@luxero/api-validation";
import { Hono } from "hono";

const app = new Hono();

app.use("*", requireAdmin);

const PROFILE_FIELDS = [
  "firstName",
  "lastName",
  "phone",
  "addressLine1",
  "addressLine2",
  "city",
  "postcode",
  "country",
  "marketingConsent",
  "dateOfBirth",
] as const;

function snapshotProfileFields(profile: Record<string, unknown>): Record<string, unknown> {
  const snapshot: Record<string, unknown> = {};
  for (const field of PROFILE_FIELDS) {
    const value = profile[field];
    if (value instanceof Date) {
      snapshot[field] = value.toISOString();
    } else {
      snapshot[field] = value ?? null;
    }
  }
  return snapshot;
}

app.patch("/:id/profile", async (c) => {
  try {
    const targetUserId = c.req.param("id");
    const actorId = getRequiredUserId(c);
    const body = await c.req.json();
    await dbConnect();

    const parsed = adminUserProfilePatchSchema.safeParse(body);
    if (!parsed.success) {
      return error(c, ErrorCodes.VALIDATION_ERROR, "Invalid profile update request", 400);
    }

    const profile = await Profile.findById(targetUserId);
    if (!profile) {
      return error(c, ErrorCodes.NOT_FOUND, "Profile not found", 404);
    }

    const { reason, dateOfBirth, ...fields } = parsed.data;
    const updates: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }

    if (dateOfBirth !== undefined) {
      updates.dateOfBirth = new Date(dateOfBirth);
    }

    if (Object.keys(updates).length === 0) {
      return error(c, ErrorCodes.VALIDATION_ERROR, "No profile fields to update", 400);
    }

    const before = snapshotProfileFields(profile.toObject() as unknown as Record<string, unknown>);

    await Profile.findByIdAndUpdate(targetUserId, { $set: updates });
    const updated = await Profile.findById(targetUserId).lean();
    if (!updated) {
      return error(c, ErrorCodes.NOT_FOUND, "Profile not found", 404);
    }

    await writeComplianceAuditLog({
      actorId,
      targetUserId,
      action: "update_profile",
      reason,
      before,
      after: snapshotProfileFields(updated as unknown as Record<string, unknown>),
      source: "admin",
    });

    return success(c, updated);
  } catch (err: unknown) {
    captureRouteError(err, {
      requestId: c.get("requestId"),
      path: c.req.path,
      userId: c.get("userId") ?? null,
      operation: "admin.userProfile.update",
    });
    console.error("Error updating user profile:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

export default app;
