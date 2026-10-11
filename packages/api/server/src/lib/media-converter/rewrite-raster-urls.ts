/**
 * Rewrite stored asset URLs from raster extensions to WebP after media-converter bulk jobs.
 * Matches paths under /luxero-assets/ only (avoids touching unrelated strings).
 */

const LUXERO_ASSET_RASTER_RE =
  /(\/luxero-assets\/[^"'\\\s]+?)\.(png|jpe?g)(?=["'\\\s]|$|\?)/gi;

export function rewriteLuxeroAssetRasterUrls(text: string): string {
  if (!text || typeof text !== "string") return text;
  return text.replace(LUXERO_ASSET_RASTER_RE, "$1.webp");
}

export function serializedDocumentHasRasterAssetUrls(serialized: string): boolean {
  LUXERO_ASSET_RASTER_RE.lastIndex = 0;
  return LUXERO_ASSET_RASTER_RE.test(serialized);
}

export function rewriteLuxeroAssetRasterUrlsInSerialized(serialized: string): string {
  return rewriteLuxeroAssetRasterUrls(serialized);
}
