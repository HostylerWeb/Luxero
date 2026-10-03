#!/usr/bin/env node
/**
 * Cold-load measurement script for the Vike client app.
 *
 * Navigates to the homepage on a fresh browser context, records when each
 * named UI element first appears in the DOM, and reports which elements
 * were not present in the initial SSR HTML (i.e. were added by client
 * hydration rather than the server-rendered page).
 *
 * Run:  node scripts/measure-cold-load.mjs
 */

import { chromium } from "playwright";

const URL = process.env.TARGET_URL ?? "http://localhost:3555/";
const POLL_MS = 16;
const TIMEOUT_MS = 10_000;

const SELECTORS = {
  "Header (header tag)": { css: "header" },
  "Footer (footer tag)": { css: "footer" },
  "Sign In button": { text: "Sign In" },
  "Sign Up button": { text: "Sign Up" },
  "Create Account button": { text: "Create Account" },
  "CategoryNav (sticky top-14)": { css: '[class*="sticky"][class*="top-14"]' },
  "CategoryNav link (first)": { css: '[class*="sticky"][class*="top-14"] a[href^="#"]' },
  "Hero section": { css: 'section:has(h1), [class*="hero"]' },
  "Winners section": { css: '[class*="winners"], [data-section-id="winners"]' },
  "Competition card (first)": { css: 'a[href^="/competitions/"]' },
  "Competition card grid": { css: '[class*="grid"]:has(a[href^="/competitions/"])' },
  "Category section (data-section-id)": { css: "[data-section-id]" },
  "Skeleton / loading placeholder": {
    css: '[class*="animate-pulse"], [class*="Skeleton"], [class*="skeleton"], [data-loading="true"]',
  },
  "UserMenu (logged-in indicator)": {
    css: '[data-testid="user-menu"], [aria-label*="account" i], [aria-label*="user" i]',
  },
};

const locatorFor = (page, sel) => {
  if (sel.css) return page.locator(sel.css).first();
  if (sel.text) return page.getByText(sel.text, { exact: false }).first();
  throw new Error("selector must have css or text");
};

const ms = (n) => Math.round(n);

const main = async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on("pageerror", (err) => consoleErrors.push(`pageerror: ${err.message}`));
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(`console.error: ${msg.text()}`);
  });

  const t0 = Date.now();
  const resp = await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 30_000 });
  const status = resp ? resp.status() : 0;
  const tDomContentLoaded = Date.now() - t0;

  const initialDom = {};
  for (const [name, sel] of Object.entries(SELECTORS)) {
    try {
      initialDom[name] = (await locatorFor(page, sel).count()) > 0;
    } catch {
      initialDom[name] = false;
    }
  }
  const tInitialDom = Date.now() - t0;

  const tFullyLoaded = await page.evaluate(
    () =>
      new Promise((resolve) => {
        if (document.readyState === "complete") return resolve(Date.now() - performance.timeOrigin);
        window.addEventListener("load", () => resolve(Date.now() - performance.timeOrigin), {
          once: true,
        });
      })
  );

  const found = {};
  for (const [name, present] of Object.entries(initialDom)) {
    if (present) found[name] = tInitialDom;
  }

  const pending = Object.keys(SELECTORS).filter((n) => !initialDom[n]);

  if (pending.length > 0) {
    const start = Date.now();
    while (pending.length > 0 && Date.now() - start < TIMEOUT_MS) {
      await page.waitForTimeout(POLL_MS);
      for (let i = pending.length - 1; i >= 0; i--) {
        const name = pending[i];
        const sel = SELECTORS[name];
        let present = false;
        try {
          present = (await locatorFor(page, sel).count()) > 0;
        } catch {
          present = false;
        }
        if (present) {
          found[name] = Date.now() - t0;
          pending.splice(i, 1);
        }
      }
    }
  }

  const finalDom = {};
  for (const [name, sel] of Object.entries(SELECTORS)) {
    try {
      finalDom[name] = (await locatorFor(page, sel).count()) > 0;
    } catch {
      finalDom[name] = false;
    }
  }

  const skeletonsFinal = await page.evaluate(
    () =>
      document.querySelectorAll(
        '[class*="animate-pulse"], [class*="Skeleton"], [class*="skeleton"], [data-loading="true"]'
      ).length
  );

  const perf = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0] ?? {};
    const paint = performance.getEntriesByType("paint");
    const fcp = paint.find((p) => p.name === "first-contentful-paint")?.startTime ?? null;
    return {
      domContentLoaded: nav.domContentLoadedEventEnd ?? null,
      domComplete: nav.domComplete ?? null,
      loadEvent: nav.loadEventEnd ?? null,
      firstContentfulPaint: fcp,
      responseEnd: nav.responseEnd ?? null,
      transferSize: nav.transferSize ?? null,
    };
  });

  const lazy = [];
  for (const [name, present] of Object.entries(finalDom)) {
    const appearedAt = found[name];
    if (present && appearedAt != null && appearedAt > tInitialDom) {
      lazy.push({
        name,
        appearedAtMs: appearedAt,
        deltaFromInitialDomMs: appearedAt - tInitialDom,
      });
    }
  }
  lazy.sort((a, b) => b.deltaFromInitialDomMs - a.deltaFromInitialDomMs);

  const never = [];
  for (const [name, present] of Object.entries(finalDom)) {
    if (!present) never.push(name);
  }

  const lines = [];
  const sep = (s = "─", n = 72) => lines.push(s.repeat(n));
  sep("═");
  lines.push("COLD-LOAD MEASUREMENT  (Vike client — /)");
  lines.push(`URL:                  ${URL}`);
  lines.push(`HTTP status:          ${status}`);
  sep();
  lines.push("Browser timing (perf API)");
  lines.push(`  DOMContentLoaded:   ${ms(perf.domContentLoaded ?? 0)} ms`);
  lines.push(`  DOM complete:       ${ms(perf.domComplete ?? 0)} ms`);
  lines.push(`  load event:         ${ms(perf.loadEvent ?? 0)} ms`);
  lines.push(
    `  First Contentful:   ${perf.firstContentfulPaint != null ? ms(perf.firstContentfulPaint) : "n/a"} ms`
  );
  lines.push(`  Response end:       ${ms(perf.responseEnd ?? 0)} ms`);
  lines.push(`  Transfer size:      ${perf.transferSize ?? "n/a"} bytes`);
  sep();
  lines.push("Wall-clock (Date.now deltas)");
  lines.push(`  DOMContentLoaded:   ${ms(tDomContentLoaded)} ms`);
  lines.push(`  Initial DOM check:  ${ms(tInitialDom)} ms (post-DCL)`);
  lines.push(`  Fully loaded:       ${ms(tFullyLoaded)} ms`);
  sep();
  lines.push("Element appearance");
  const inSsrCount = Object.values(initialDom).filter(Boolean).length;
  const inFinalCount = Object.values(finalDom).filter(Boolean).length;
  lines.push(
    `  Present in SSR HTML (at initialDom check): ${inSsrCount} / ${Object.keys(SELECTORS).length}`
  );
  lines.push(
    `  Present after polling:                     ${inFinalCount} / ${Object.keys(SELECTORS).length}`
  );
  lines.push(`  Skeleton/loading elements (final state):   ${skeletonsFinal}`);
  sep();
  if (lazy.length === 0) {
    lines.push("LAZY UI: none detected — all elements that appear are in the initial SSR HTML.");
  } else {
    lines.push(`LAZY UI (rendered after initial DOM, total ${lazy.length}):`);
    for (const item of lazy) {
      lines.push(
        `  +${String(ms(item.deltaFromInitialDomMs)).padStart(5)} ms  ${item.name}  (first seen at ${ms(item.appearedAtMs)} ms)`
      );
    }
  }
  sep();
  if (never.length === 0) {
    lines.push("NEVER RENDERED: none — all probed selectors are in the final DOM.");
  } else {
    lines.push(`NEVER RENDERED (${never.length}):`);
    for (const n of never) lines.push(`  - ${n}`);
  }
  sep();
  if (consoleErrors.length === 0) {
    lines.push("Console errors: none");
  } else {
    lines.push(`Console errors (${consoleErrors.length}):`);
    for (const e of consoleErrors.slice(0, 20)) lines.push(`  ${e}`);
  }
  sep("═");

  console.log(lines.join("\n"));

  await browser.close();
  process.exit(0);
};

main().catch((err) => {
  console.error("measure-cold-load failed:", err);
  process.exit(1);
});
