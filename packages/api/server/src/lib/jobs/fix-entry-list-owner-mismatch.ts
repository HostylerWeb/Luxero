#!/usr/bin/env bun
/**
 * Repair sold tickets whose ownerId does not match the order buyer (public entry
 * list showed "Anonymous" when the profile row was missing or orphaned).
 *
 * Usage:
 *   bun run packages/api/server/src/lib/jobs/fix-entry-list-owner-mismatch.ts --dry-run
 *   bun run packages/api/server/src/lib/jobs/fix-entry-list-owner-mismatch.ts --apply
 */

import { Order, Profile, Ticket } from "@luxero/api-db/models";
import { CH, invalidateByChannelSafe } from "@luxero/api-infra/cache";
import dbConnect from "@luxero/api-infra/db";

function parseArgs(): { dryRun: boolean } {
  const apply = process.argv.includes("--apply");
  return { dryRun: !apply };
}

async function main(): Promise<void> {
  const { dryRun } = parseArgs();
  console.log(`[fix-entry-list-owner-mismatch] dryRun=${dryRun}`);
  await dbConnect();

  const soldWithOrder = await Ticket.find({
    status: "sold",
    orderId: { $exists: true, $ne: null },
  })
    .select("_id number ownerId orderId entryFirstName")
    .lean();

  let fixed = 0;
  for (const ticket of soldWithOrder) {
    const order = await Order.findById(ticket.orderId).select("userId").lean();
    if (!order?.userId) continue;

    const buyerId = order.userId;
    const ownerMatches = ticket.ownerId?.equals(buyerId);
    const buyerProfile = await Profile.findById(buyerId)
      .select("firstName lastName showLastName deletedAt")
      .lean();
    if (buyerProfile?.deletedAt) continue;

    const needsOwnerFix = !ownerMatches;
    const needsNameSnapshot =
      !ticket.entryFirstName && Boolean(buyerProfile?.firstName?.trim());
    if (!needsOwnerFix && !needsNameSnapshot) continue;

    const update: Record<string, unknown> = { ownerId: buyerId };
    if (buyerProfile?.firstName) {
      update.entryFirstName = buyerProfile.firstName;
      update.entryLastName = buyerProfile.lastName ?? undefined;
      update.entryShowLastName = buyerProfile.showLastName ?? true;
    }

    console.log(
      `[fix] ticket #${ticket.number} ${ticket._id} owner ${ticket.ownerId?.toString() ?? "null"} → buyer ${buyerId.toString()}`
    );

    if (!dryRun) {
      await Ticket.updateOne({ _id: ticket._id }, { $set: update });
    }
    fixed++;
  }

  if (!dryRun && fixed > 0) {
    await invalidateByChannelSafe(CH.entries).catch(() => {});
  }

  console.log(`[fix-entry-list-owner-mismatch] ${dryRun ? "would fix" : "fixed"} ${fixed} ticket(s)`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
