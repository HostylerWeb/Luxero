import { describe, expect, it } from "vitest";
import { rewriteLuxeroAssetRasterUrls } from "./rewrite-raster-urls";

describe("rewriteLuxeroAssetRasterUrls", () => {
  it("rewrites png/jpeg in luxero-assets URLs", () => {
    const url =
      "https://assets.example/luxero-assets/prizes/foo/abc.png";
    expect(rewriteLuxeroAssetRasterUrls(url)).toBe(
      "https://assets.example/luxero-assets/prizes/foo/abc.webp"
    );
    expect(rewriteLuxeroAssetRasterUrls(url.replace(".png", ".JPEG"))).toContain(".webp");
  });

  it("leaves webp unchanged", () => {
    const url =
      "https://assets.example/luxero-assets/prizes/foo/abc.webp";
    expect(rewriteLuxeroAssetRasterUrls(url)).toBe(url);
  });

  it("does not rewrite unrelated png strings", () => {
    expect(rewriteLuxeroAssetRasterUrls("file.png")).toBe("file.png");
  });
});
