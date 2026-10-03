import { liftSelfExclusion } from "@luxero/api-compliance/compliance-user-service";
import { Profile, SelfExclusionOverrideRequest } from "@luxero/api-db/models";
import { sendEmail } from "@luxero/api-email";
import { getEmailConfig } from "@luxero/api-email/config";
import { SelfExclusionOverrideActionEmail } from "@luxero/api-email/templates/self-exclusion-override-action";
import { ComplianceError } from "@luxero/api-errors";
import dbConnect from "@luxero/api-infra/db";
import { getCurrentContext } from "@luxero/api-infra/env";
import { ErrorCodes } from "@luxero/api-infra/error-codes";
import { error, success } from "@luxero/api-infra/response";
import { captureRouteError } from "@luxero/api-infra/sentry";
import { sendPushNotification } from "@luxero/api-server/lib/push";
import { requireAdmin } from "@luxero/api-server/middleware/auth";
import { processOverrideRequestSchema } from "@luxero/api-validation";
import { getEnv } from "@luxero/env/server";
import { render } from "@react-email/render";
import { Hono } from "hono";

const app = new Hono();

app.use("*", requireAdmin);

// GET / — list all self-excluded users with their override request (if any)
app.get("/", async (c) => {
  try {
    await dbConnect();

    const selfExcludedProfiles = await Profile.find({
      selfExcluded: true,
    })
      .select("email firstName lastName selfExcludedAt selfExcludedUntil")
      .sort({ selfExcludedAt: -1 })
      .lean();

    const userIds = selfExcludedProfiles.map((p) => p._id);

    const overrideRequests = await SelfExclusionOverrideRequest.find({
      userId: { $in: userIds },
    })
      .sort({ createdAt: -1 })
      .lean();

    const requestMap = new Map<string, (typeof overrideRequests)[0]>();
    for (const req of overrideRequests) {
      const key = req.userId.toString();
      if (!requestMap.has(key)) {
        requestMap.set(key, req);
      }
    }

    const data = selfExcludedProfiles.map((profile) => {
      const req = requestMap.get(profile._id.toString());
      return {
        userId: profile._id.toString(),
        email: profile.email,
        firstName: profile.firstName ?? "",
        lastName: profile.lastName ?? "",
        selfExcludedAt: profile.selfExcludedAt?.toISOString() ?? new Date().toISOString(),
        selfExcludedUntil: profile.selfExcludedUntil?.toISOString() ?? null,
        isPermanent: !profile.selfExcludedUntil,
        overrideRequest: req
          ? {
              _id: req._id.toString(),
              status: req.status as "pending" | "approved" | "rejected",
              userReason: req.userReason,
              createdAt: req.createdAt.toISOString(),
            }
          : null,
      };
    });

    return success(c, data);
  } catch (err: unknown) {
    if (err instanceof ComplianceError) {
      return error(c, err.code, err.message, err.status);
    }
    captureRouteError(err, {
      requestId: c.get("requestId"),
      path: c.req.path,
      userId: c.get("userId") ?? null,
      operation: "admin.selfExclusionOverrides.list",
    });
    console.error("Error listing self-excluded users:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

// PATCH /:userId/process — approve or reject an override request
app.patch("/:userId/process", async (c) => {
  try {
    const targetUserId = c.req.param("userId");
    const actorId = c.get("userId")!;
    const body = await c.req.json();
    await dbConnect();

    const parsed = processOverrideRequestSchema.safeParse(body);
    if (!parsed.success) {
      return error(
        c,
        ErrorCodes.VALIDATION_ERROR,
        parsed.error.issues.map((e) => e.message).join(", "),
        400
      );
    }

    const { action, adminNote } = parsed.data;

    const request = await SelfExclusionOverrideRequest.findOne({
      userId: targetUserId,
      status: "pending",
    }).lean();

    if (!request) {
      return error(c, ErrorCodes.NOT_FOUND, "No pending override request found", 404);
    }

    const profile = await Profile.findById(targetUserId).select("email firstName lastName").lean();

    if (!profile) {
      return error(c, ErrorCodes.NOT_FOUND, "Profile not found", 404);
    }

    const clientUrl = getEnv("CLIENT_APP_URL")?.trim() || getCurrentContext().frontendUrl;
    const userEmail = profile.email;
    const userName = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "there";

    async function sendOverrideEmail(
      action: "approved" | "rejected",
      recipientEmail: string
    ): Promise<{ emailSent: boolean; emailError?: string }> {
      if (!recipientEmail) {
        return { emailSent: false, emailError: "User has no email address" };
      }
      try {
        const emailSettings = await getEmailConfig();
        const emailHtml = await render(
          SelfExclusionOverrideActionEmail({
            userName,
            action,
            adminNote: adminNote ?? undefined,
            settings: emailSettings,
            frontendUrl: clientUrl,
          })
        );
        const result = await sendEmail({
          to: recipientEmail,
          subject:
            action === "approved"
              ? "Your self-exclusion has been lifted — Luxero"
              : "Your override request has been reviewed — Luxero",
          html: emailHtml,
        });
        if (!result.success) {
          console.error(
            `Failed to send self-exclusion ${action} email to ${recipientEmail}:`,
            result.error
          );
          return { emailSent: false, emailError: result.error || "Email send failed" };
        }
        return { emailSent: true };
      } catch (emailErr) {
        console.error(`Failed to send self-exclusion ${action} email:`, emailErr);
        return {
          emailSent: false,
          emailError: emailErr instanceof Error ? emailErr.message : "Email send error",
        };
      }
    }

    let emailStatus: { emailSent: boolean; emailError?: string } = { emailSent: true };

    if (action === "approve") {
      await liftSelfExclusion(targetUserId, {
        actorId,
        reason: request.userReason,
        source: "admin",
        acknowledgePermanent: true,
        onLifted: (uid) => {
          void sendPushNotification(
            {
              title: "Self-exclusion lifted",
              body: "Your self-exclusion has been lifted by an admin.",
              type: "system",
              url: "/dashboard",
              tag: `self-exclusion-${uid}`,
            },
            { userId: uid }
          ).catch(() => {});
        },
      });

      await SelfExclusionOverrideRequest.findByIdAndUpdate(request._id, {
        $set: {
          status: "approved",
          processedBy: actorId,
          adminNote: adminNote ?? null,
          processedAt: new Date(),
        },
      });

      emailStatus = await sendOverrideEmail("approved", userEmail);
    } else {
      await SelfExclusionOverrideRequest.findByIdAndUpdate(request._id, {
        $set: {
          status: "rejected",
          processedBy: actorId,
          adminNote: adminNote ?? null,
          processedAt: new Date(),
        },
      });

      emailStatus = await sendOverrideEmail("rejected", userEmail);
    }

    return success(c, { processed: true, ...emailStatus });
  } catch (err: unknown) {
    if (err instanceof ComplianceError) {
      return error(c, err.code, err.message, err.status);
    }
    captureRouteError(err, {
      requestId: c.get("requestId"),
      path: c.req.path,
      userId: c.get("userId") ?? null,
      operation: "admin.selfExclusionOverrides.process",
    });
    console.error("Error processing override request:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

export default app;
