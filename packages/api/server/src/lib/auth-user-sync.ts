import type { Db } from "mongodb";

/** Better Auth `user` rows use string `_id` (same as Profile id); legacy queries used `{ id }`. */
export function authUserFilter(userId: string): { $or: Array<{ _id: string } | { id: string }> } {
  return { $or: [{ _id: userId }, { id: userId }] };
}

export async function updateAuthUserFields(
  db: Db,
  userId: string,
  fields: Record<string, unknown>
): Promise<void> {
  await db.collection("user").updateOne(authUserFilter(userId), { $set: fields });
}

export async function updateManyAuthUserFields(
  db: Db,
  userIds: string[],
  fields: Record<string, unknown>
): Promise<void> {
  await db
    .collection("user")
    .updateMany({ $or: [{ _id: { $in: userIds } }, { id: { $in: userIds } }] }, { $set: fields });
}
