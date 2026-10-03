import dbConnect from "@luxero/api-infra/db";
import { ErrorCodes } from "@luxero/api-infra/error-codes";
import { error, success } from "@luxero/api-infra/response";
import { getReferralMindmap, type ReferralMindmapOptions } from "@luxero/api-referrals/mindmap";
import { requireManager } from "@luxero/api-server/middleware/auth";
import { Hono } from "hono";

const app = new Hono();
app.use("*", requireManager);

// GET /api/admin/referral-mindmap?rootUserId=...&depth=5&includeInactive=true&includeDeleted=false
app.get("/", async (c) => {
  try {
    await dbConnect();
    const rootUserId = c.req.query("rootUserId");
    const depthRaw = c.req.query("depth");
    const includeInactive = c.req.query("includeInactive") === "true";
    const includeDeleted = c.req.query("includeDeleted") === "true";
    const depth = depthRaw ? Math.min(Math.max(Number(depthRaw), 1), 8) : 5;

    const opts: ReferralMindmapOptions = {
      depth,
      includeInactive,
      includeDeleted,
    };
    if (rootUserId && rootUserId.length > 0) opts.rootUserId = rootUserId;

    const result = await getReferralMindmap(opts);
    return success(c, result);
  } catch (err: unknown) {
    console.error("Error fetching referral mindmap:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

export default app;
