import { describe, expect, test } from "vitest";
import sharp from "sharp";
import {
  assertAvatarBytesMatchMime,
  AvatarUploadValidationError,
  detectAvatarFormat,
  normalizeAvatarMime,
  validateAvatarFileMeta,
} from "./process-upload";

describe("validateAvatarFileMeta", () => {
  test("rejects null byte in filename", () => {
    const file = new File([new Uint8Array([1])], "evil.php\0.png", { type: "image/png" });
    expect(() => validateAvatarFileMeta(file)).toThrow(AvatarUploadValidationError);
  });

  test("rejects disallowed mime", () => {
    const file = new File([new Uint8Array([1])], "x.svg", { type: "image/svg+xml" });
    expect(() => validateAvatarFileMeta(file)).toThrow(/Only JPEG/);
  });

  test("accepts png with matching extension", () => {
    const file = new File([new Uint8Array([1])], "photo.png", { type: "image/png" });
    expect(() => validateAvatarFileMeta(file)).not.toThrow();
  });
});

describe("detectAvatarFormat", () => {
  test("detects png magic bytes", async () => {
    const png = await sharp({
      create: { width: 2, height: 2, channels: 3, background: { r: 255, g: 0, b: 0 } },
    })
      .png()
      .toBuffer();
    expect(detectAvatarFormat(new Uint8Array(png))).toBe("png");
  });

  test("rejects non-image bytes", () => {
    expect(detectAvatarFormat(new Uint8Array([0x3c, 0x3f, 0x70, 0x68]))).toBeNull();
  });
});

describe("assertAvatarBytesMatchMime", () => {
  test("rejects mime/content mismatch", async () => {
    const png = await sharp({
      create: { width: 2, height: 2, channels: 3, background: { r: 0, g: 0, b: 255 } },
    })
      .png()
      .toBuffer();
    expect(() => assertAvatarBytesMatchMime(new Uint8Array(png), "image/jpeg")).toThrow(
      /does not match/
    );
  });

  test("accepts matching png", async () => {
    const png = await sharp({
      create: { width: 2, height: 2, channels: 3, background: { r: 0, g: 255, b: 0 } },
    })
      .png()
      .toBuffer();
    expect(assertAvatarBytesMatchMime(new Uint8Array(png), "image/png")).toBe("png");
  });
});

describe("processAvatarUploadBytes", () => {
  test("returns webp key and bytes for valid png", async () => {
    const png = await sharp({
      create: { width: 4, height: 4, channels: 3, background: { r: 10, g: 20, b: 30 } },
    })
      .png()
      .toBuffer();

    const { processAvatarUploadBytes } = await import("./process-upload");
    const userId = "507f1f77bcf86cd799439011";
    const result = await processAvatarUploadBytes(userId, new Uint8Array(png), "image/png");

    expect(result.contentType).toBe("image/webp");
    expect(result.key).toMatch(new RegExp(`^avatars/${userId}/\\d+-[a-z0-9]+\\.webp$`));
    expect(result.bytes.length).toBeGreaterThan(0);
    expect(detectAvatarFormat(result.bytes)).toBe("webp");
  });
});
