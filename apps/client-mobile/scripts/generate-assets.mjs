import { readFileSync, writeFileSync } from "fs";
import sharp from "sharp";

const ROOT = new URL("..", import.meta.url).pathname;
const SVG = readFileSync(`${ROOT}public/app-icon.svg`, "utf-8");

const MIPS = `${ROOT}android/app/src/main/res`;

async function render(size) {
  let png = await sharp(Buffer.from(SVG)).resize(size, size).png().toBuffer();
  return sharp(png).flatten({ background: "#0f0f12" }).png().toBuffer();
}

async function renderSplash(width, height) {
  let png = await sharp(Buffer.from(SVG)).resize(width, height, { fit: "cover" }).png().toBuffer();
  return sharp(png).flatten({ background: "#0f0f12" }).png().toBuffer();
}

const SIZES = [
  [48, "mdpi"],
  [72, "hdpi"],
  [96, "xhdpi"],
  [144, "xxhdpi"],
  [192, "xxxhdpi"],
];

async function main() {
  // Base 1024px icon
  const icon1024 = await render(1024);
  writeFileSync(`${ROOT}public/app-icon-1024.png`, icon1024);
  console.log("✓ base icon 1024x1024");

  // Android full icons (ic_launcher.png, ic_launcher_round.png)
  for (const [sz, den] of SIZES) {
    const data = await render(sz);
    writeFileSync(`${MIPS}/mipmap-${den}/ic_launcher.png`, data);
    writeFileSync(`${MIPS}/mipmap-${den}/ic_launcher_round.png`, data);
  }
  console.log("✓ Android full icons");

  // Android foreground icons (adaptive) — same source, flattened onto dark
  for (const [sz, den] of SIZES) {
    const data = await render(sz);
    writeFileSync(`${MIPS}/mipmap-${den}/ic_launcher_foreground.png`, data);
  }
  console.log("✓ Android foreground icons");

  // iOS AppIcon (1024x1024)
  writeFileSync(
    `${ROOT}ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png`,
    icon1024,
  );
  console.log("✓ iOS AppIcon");

  // Splash screens — render from same SVG at splash proportions
  // iOS: 2732x2732
  const iosSplash = await renderSplash(2732, 2732);
  writeFileSync(
    `${ROOT}ios/App/App/Assets.xcassets/Splash.imageset/splash.png`,
    iosSplash,
  );
  console.log("✓ iOS splash");

  // Android: splash at 1440x2560 (typical) or 1080x1920
  const androidSplash = await renderSplash(1440, 2560);
  writeFileSync(`${ROOT}android/app/src/main/res/drawable/splash.png`, androidSplash);
  console.log("✓ Android splash");

  console.log("\n✅ All assets generated from app-icon.svg");
}

main().catch(console.error);
