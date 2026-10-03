import { Profile, ReferralPurchase, ReferralSettings } from "@luxero/api-db/models";
import dbConnect from "@luxero/api-infra/db";
import { ErrorCodes } from "@luxero/api-infra/error-codes";
import { error, success } from "@luxero/api-infra/response";
import {
  countUniqueActiveReferrers,
  getActiveReferrerDistribution,
  getTopActiveReferrers,
} from "@luxero/api-referrals/leaderboard";
import { requireManager } from "@luxero/api-server/middleware/auth";
import { Hono } from "hono";

const app = new Hono();
app.use("*", requireManager);

// GET /api/admin/referral-stats/distribution
app.get("/distribution", async (c) => {
  try {
    await dbConnect();
    const settings = await ReferralSettings.findById("referral_settings").lean();
    const tiers = (settings?.tiers ?? []) as Array<{ threshold: number; tickets: number }>;
    const boundaries = tiers.map((t) => t.threshold);

    const includeDeleted = c.req.query("includeDeleted") === "true";
    const result = await getActiveReferrerDistribution(boundaries, { includeDeleted });
    return success(c, { tiers: result.boundaries, buckets: result.buckets });
  } catch (err: unknown) {
    console.error("Error fetching referral distribution:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

// GET /api/admin/referral-stats/summary
app.get("/summary", async (c) => {
  try {
    await dbConnect();
    const totalReferrers = await countUniqueActiveReferrers();
    const awardAgg = await ReferralPurchase.aggregate([
      { $match: { deletedAt: null } },
      {
        $group: {
          _id: null,
          totalAwarded: { $sum: "$ticketsAwarded" },
          totalPurchases: { $sum: 1 },
        },
      },
    ]);
    const walletBalances = await Profile.aggregate([
      { $match: { referralTierAwardedTickets: { $gt: 0 } } },
      {
        $group: {
          _id: null,
          totalInWallets: { $sum: "$referralTierAwardedTickets" },
          usersWithBalance: { $sum: 1 },
        },
      },
    ]);
    const minted = awardAgg[0]?.totalAwarded ?? 0;
    const inWallets = walletBalances[0]?.totalInWallets ?? 0;
    const redeemed = minted - inWallets;
    return success(c, {
      totalReferrers,
      ticketsMinted: minted,
      ticketsRedeemed: Math.max(0, redeemed),
      ticketsInWallets: inWallets,
      burnRate: minted > 0 ? Math.round((redeemed / minted) * 100) : 0,
      purchasesRecorded: awardAgg[0]?.totalPurchases ?? 0,
      usersWithWalletBalance: walletBalances[0]?.usersWithBalance ?? 0,
      activeReferralPurchases: await ReferralPurchase.countDocuments({
        deletedAt: null,
        ticketsAwarded: { $gt: 0 },
      }),
    });
  } catch (err: unknown) {
    console.error("Error fetching referral summary:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

// GET /api/admin/referral-stats/top-referrers
app.get("/top-referrers", async (c) => {
  try {
    await dbConnect();
    const limit = Math.min(Number(c.req.query("limit")) || 20, 100);
    const includeDeleted = c.req.query("includeDeleted") === "true";
    const top = await getTopActiveReferrers({ limit, includeDeleted });
    return success(c, top);
  } catch (err: unknown) {
    console.error("Error fetching top referrers:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

// GET /api/admin/referral-stats/timeseries
app.get("/timeseries", async (c) => {
  try {
    await dbConnect();
    const days = Math.min(Number(c.req.query("days")) || 30, 365);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const pipeline = [
      {
        $match: { ticketsAwardedAt: { $gte: since }, ticketsAwarded: { $gt: 0 }, deletedAt: null },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$ticketsAwardedAt" } },
          tickets: { $sum: "$ticketsAwarded" },
          purchases: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 as 1 | -1 } },
    ];
    const results = await ReferralPurchase.aggregate(pipeline);
    return success(
      c,
      results.map((r) => ({ date: r._id, tickets: r.tickets, purchases: r.purchases }))
    );
  } catch (err: unknown) {
    console.error("Error fetching referral timeseries:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

export default app;
