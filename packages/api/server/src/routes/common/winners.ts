import { Profile, Winner } from "@luxero/api-db/models";
import dbConnect from "@luxero/api-infra/db";
import { ErrorCodes } from "@luxero/api-infra/error-codes";
import { parsePagination } from "@luxero/api-infra/pagination";
import { error, paginated, success } from "@luxero/api-infra/response";
import { captureRouteError } from "@luxero/api-infra/sentry";
import { redisCacheRoute } from "@luxero/api-server/middleware/cache";
import { publicFeedRateLimit } from "@luxero/api-server/middleware/rate-limit";
import { Hono } from "hono";

const app = new Hono();

app.use("*", publicFeedRateLimit());

app.get(
  "/",
  redisCacheRoute({
    route: "winners:list",
    scope: "public",
    ttlSeconds: 60,
  }),
  async (c) => {
    try {
      const { limit, page, skip } = parsePagination(c);
      await dbConnect();

      const [winners, total] = await Promise.all([
        Winner.find()
          .populate("competitionId", "title imageUrl prizeImageUrl slug")
          .sort({ drawnAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Winner.countDocuments().maxTimeMS(5000),
      ]);

      const userIds = winners
        .map((w) => w.userId)
        .filter(Boolean)
        .filter((id): id is NonNullable<typeof id> => !!id);
      const profiles =
        userIds.length > 0
          ? await Profile.find({ _id: { $in: userIds } })
              .select("firstName lastName email")
              .lean()
          : [];
      const profileMap = new Map(profiles.map((p) => [p._id.toString(), p]));

      const headCheck = async (url: string): Promise<boolean> => {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 2000);
          const res = await fetch(url, { method: "HEAD", signal: controller.signal });
          clearTimeout(timer);
          return res.status !== 404;
        } catch {
          return true;
        }
      };

      for (const winner of winners) {
        if (!winner.displayName && winner.userId) {
          const profile = profileMap.get(winner.userId.toString());
          if (profile) {
            winner.displayName =
              profile.firstName && profile.lastName
                ? `${profile.firstName} ${profile.lastName}`
                : profile.firstName
                  ? profile.firstName
                  : profile.email?.split("@")[0] || "Winner";
          }
        }

        const comp = winner.competitionId as
          | { imageUrl?: string | null; prizeImageUrl?: string | null }
          | null
          | undefined;
        if (comp && typeof comp === "object") {
          if (comp.prizeImageUrl && !(await headCheck(comp.prizeImageUrl))) {
            comp.prizeImageUrl = null;
          }
          if (comp.imageUrl && !(await headCheck(comp.imageUrl))) {
            comp.imageUrl = null;
          }
        }
      }

      return paginated(c, winners, total, page, limit);
    } catch (err: unknown) {
      console.error("Error fetching winners:", err);
      captureRouteError(err, {
        requestId: c.get("requestId"),
        path: c.req.path,
        userId: c.get("userId") ?? null,
        operation: "winners.list",
      });
      return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
    }
  }
);

app.get(
  "/competition/:competitionId",
  redisCacheRoute({
    route: "winners:by-competition",
    scope: "public",
    ttlSeconds: 60,
    resourceIdResolver: (c) => c.req.param("competitionId"),
  }),
  async (c) => {
    try {
      const competitionId = c.req.param("competitionId");
      await dbConnect();

      const winners = await Winner.find({ competitionId })
        .populate("userId", "firstName lastName avatarUrl")
        .lean();

      return success(c, winners);
    } catch (err: unknown) {
      console.error("Error fetching competition winners:", err);
      captureRouteError(err, {
        requestId: c.get("requestId"),
        path: c.req.path,
        userId: c.get("userId") ?? null,
        operation: "winners.byCompetition",
      });
      return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
    }
  }
);

app.get(
  "/stats",
  redisCacheRoute({
    route: "winners:stats",
    scope: "public",
    ttlSeconds: 60,
  }),
  async (c) => {
    try {
      await dbConnect();

      const winnersCount = await Winner.countDocuments().maxTimeMS(5000);
      const prizeAgg = await Winner.aggregate([
        { $match: { deletedAt: null } },
        { $group: { _id: null, total: { $sum: "$prizeValue" } } },
      ]).exec();

      return success(c, {
        totalWinners: winnersCount,
        totalPrizeValue: prizeAgg[0]?.total || 0,
        totalWinnersAllTime: winnersCount,
      });
    } catch (err: unknown) {
      console.error("Error fetching winner stats:", err);
      captureRouteError(err, {
        requestId: c.get("requestId"),
        path: c.req.path,
        userId: c.get("userId") ?? null,
        operation: "winners.stats",
      });
      return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
    }
  }
);

export default app;
