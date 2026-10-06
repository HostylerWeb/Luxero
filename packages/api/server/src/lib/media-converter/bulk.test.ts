import { describe, expect, test } from "vitest";
import { resolveScopeFromKey } from "./scope";

describe("media-converter bulk scope", () => {
  test("maps storage prefixes to scopes", () => {
    expect(resolveScopeFromKey("uploads/foo.png")).toBe("media_library");
    expect(resolveScopeFromKey("prizes/slug/a.jpg")).toBe("competition_prizes");
    expect(resolveScopeFromKey("landing-videos/id/v.mp4")).toBe("landing_videos");
  });
});
