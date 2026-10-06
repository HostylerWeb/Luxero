import { describe, expect, test } from "vitest";
import { replaceKeyExtension, resolveScopeFromKey } from "./scope";

describe("resolveScopeFromKey", () => {
  test("maps storage prefixes to scopes", () => {
    expect(resolveScopeFromKey("uploads/a.png")).toBe("media_library");
    expect(resolveScopeFromKey("prizes/slug/x.jpg")).toBe("competition_prizes");
    expect(resolveScopeFromKey("landing-videos/id/v.mp4")).toBe("landing_videos");
    expect(resolveScopeFromKey("avatars/user/x.jpg")).toBe("avatars");
    expect(resolveScopeFromKey("og-images/x.png")).toBe("og_images");
    expect(resolveScopeFromKey("frames/comp/frame.jpg")).toBeNull();
  });
});

describe("replaceKeyExtension", () => {
  test("swaps file extension", () => {
    expect(replaceKeyExtension("uploads/photo.JPG", "webp")).toBe("uploads/photo.webp");
    expect(replaceKeyExtension("landing-videos/id/v.mp4", "webm")).toBe(
      "landing-videos/id/v.webm"
    );
  });
});
