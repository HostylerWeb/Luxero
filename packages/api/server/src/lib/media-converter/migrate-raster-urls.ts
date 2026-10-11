import dbConnect from "@luxero/api-infra/db";
import mongoose, { Types } from "mongoose";
import { rewriteLuxeroAssetRasterUrls } from "./rewrite-raster-urls";

export type RasterUrlMigrationResult = {
  documentsUpdated: number;
  byCollection: Record<string, number>;
};

function deepRewriteRasterUrls(value: unknown): { value: unknown; changed: boolean } {
  if (typeof value === "string") {
    const next = rewriteLuxeroAssetRasterUrls(value);
    return { value: next, changed: next !== value };
  }
  if (value === null || value === undefined) {
    return { value, changed: false };
  }
  if (value instanceof Date || value instanceof Types.ObjectId) {
    return { value, changed: false };
  }
  if (Array.isArray(value)) {
    let changed = false;
    const next = value.map((item) => {
      const r = deepRewriteRasterUrls(item);
      if (r.changed) changed = true;
      return r.value;
    });
    return { value: next, changed };
  }
  if (typeof value === "object") {
    let changed = false;
    const out: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      const newKey = rewriteLuxeroAssetRasterUrls(key);
      if (newKey !== key) changed = true;
      const r = deepRewriteRasterUrls(child);
      out[newKey] = r.value;
      if (r.changed) changed = true;
    }
    return { value: out, changed };
  }
  return { value, changed: false };
}

/** Full-database pass: .png/.jpg/.jpeg → .webp in luxero-assets URLs. */
export async function migrateAllRasterAssetUrlsToWebp(): Promise<RasterUrlMigrationResult> {
  await dbConnect();
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("MongoDB not connected");
  }

  const byCollection: Record<string, number> = {};
  let documentsUpdated = 0;

  const collections = await db.listCollections().toArray();
  for (const { name } of collections) {
    if (name.startsWith("system.")) continue;

    const coll = db.collection(name);
    const cursor = coll.find({});
    let collUpdated = 0;

    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      if (!doc) continue;

      const { value: next, changed } = deepRewriteRasterUrls(doc);
      if (!changed) continue;

      await coll.replaceOne({ _id: doc._id }, next as Record<string, unknown>);
      collUpdated += 1;
    }

    if (collUpdated > 0) {
      byCollection[name] = collUpdated;
      documentsUpdated += collUpdated;
    }
  }

  return { documentsUpdated, byCollection };
}
