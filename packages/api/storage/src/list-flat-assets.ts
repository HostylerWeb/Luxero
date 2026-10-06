import { buildAssetUrl, listStorageDelimiterPage, type S3Asset } from "./s3";

const FRAME_PREFIX = "frames/";
const FLAT_ROOTS = ["uploads/", "prizes/", "landing-videos/", "avatars/", "og-images/"] as const;

export interface FlatAssetsCursor {
  rootIndex: number;
  queue: string[];
  listCursor?: string;
}

function encodeFlatCursor(cursor: FlatAssetsCursor): string {
  return Buffer.from(JSON.stringify(cursor)).toString("base64url");
}

function decodeFlatCursor(raw: string | undefined): FlatAssetsCursor | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as FlatAssetsCursor;
    if (typeof parsed.rootIndex !== "number" || !Array.isArray(parsed.queue)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function isFrameKey(key: string): boolean {
  return key.startsWith(FRAME_PREFIX) || key.includes("/frames/");
}

function assetFromKey(key: string, size: number, lastModified?: Date): S3Asset {
  return {
    key,
    size,
    lastModified: lastModified ?? new Date(0),
    url: buildAssetUrl(key),
  };
}

function matchesSearch(key: string, search?: string): boolean {
  if (!search) return true;
  return key.toLowerCase().includes(search.toLowerCase());
}

export async function listFlatAssetsPage(
  limit: number,
  cursorToken?: string,
  search?: string
): Promise<{ assets: S3Asset[]; nextCursor: string | undefined }> {
  let state: FlatAssetsCursor = decodeFlatCursor(cursorToken) ?? {
    rootIndex: 0,
    queue: [FLAT_ROOTS[0]],
  };

  const collected: S3Asset[] = [];

  while (collected.length < limit && state.rootIndex < FLAT_ROOTS.length) {
    if (state.queue.length === 0) {
      state.rootIndex += 1;
      if (state.rootIndex >= FLAT_ROOTS.length) break;
      state.queue = [FLAT_ROOTS[state.rootIndex]!];
      state.listCursor = undefined;
      continue;
    }

    const prefix = state.queue[state.queue.length - 1]!;
    const page = await listStorageDelimiterPage(prefix, Math.max(limit * 4, 100), state.listCursor);

    for (const file of page.files) {
      if (isFrameKey(file.key)) continue;
      if (!matchesSearch(file.key, search)) continue;
      collected.push(assetFromKey(file.key, file.size, file.lastModified));
      if (collected.length >= limit) break;
    }

    if (collected.length >= limit) {
      state.listCursor = page.nextCursor;
      break;
    }

    if (page.nextCursor) {
      state.listCursor = page.nextCursor;
      continue;
    }

    for (const folder of page.folders) {
      if (!isFrameKey(folder) && !state.queue.includes(folder)) {
        state.queue.push(folder);
      }
    }

    state.queue.pop();
    state.listCursor = undefined;
  }

  const nextCursor =
    state.rootIndex >= FLAT_ROOTS.length && state.queue.length === 0 && !state.listCursor
      ? undefined
      : encodeFlatCursor(state);

  return { assets: collected.slice(0, limit), nextCursor };
}
