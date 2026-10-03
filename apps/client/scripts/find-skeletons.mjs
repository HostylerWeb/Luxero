import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

page.on("console", (msg) => {
  if (msg.type() === "error" || msg.type() === "warn") {
    console.log(`[${msg.type()}] ${msg.text()}`);
  }
});

await page.goto("http://localhost:3555/", { waitUntil: "networkidle" });

const skeletons = await page.evaluate(() => {
  const els = document.querySelectorAll(
    '[class*="animate-pulse"], [class*="Skeleton"], [class*="skeleton"], [data-loading="true"]'
  );
  return Array.from(els).map((el) => ({
    tag: el.tagName.toLowerCase(),
    classes: el.className,
    textContent: el.textContent?.substring(0, 100),
    parent: el.parentElement?.className?.substring(0, 100),
    parentParent: el.parentElement?.parentElement?.className?.substring(0, 100),
    rect: el.getBoundingClientRect(),
  }));
});

console.log("\n=== Skeleton elements ===");
console.log(JSON.stringify(skeletons, null, 2));

const dataSectionInfo = await page.evaluate(() => {
  const sections = document.querySelectorAll("[data-section-id]");
  return Array.from(sections).map((s) => ({
    id: s.getAttribute("data-section-id"),
    classes: s.className,
    textPreview: s.textContent?.substring(0, 80),
  }));
});
console.log("\n=== Data sections ===");
console.log(JSON.stringify(dataSectionInfo, null, 2));

await browser.close();
