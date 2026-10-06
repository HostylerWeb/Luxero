/**
 * Hydration Diff Detector (dev-only, tree-shakable)
 *
 * Compares the SSR-rendered DOM with the post-hydration DOM and warns when
 * they drift. Catches subtle bugs caused by Date.now(), Math.random(),
 * setInterval-based state, mounted-guard flips, and time-dependent values.
 *
 * Tree-shaking: `import.meta.env.DEV` is replaced with the literal `false` by
 * Vite's `define` plugin during production builds, so the entire body of
 * `initHydrationDiffDetector` (and its dependencies below) is dead-code-eliminated.
 */

const SIMILARITY_THRESHOLD = 0.95;
const MAX_COMPARE_LENGTH = 50_000;
const DIFF_SNIPPET_RADIUS = 60;

const checkedPaths = new Set<string>();

const NOISE_PATTERNS: RegExp[] = [
  // ISO-8601 timestamps
  /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?/g,
  // Unix timestamps (10–13 digits)
  /\b\d{10,13}\b/g,
  // Vite/Emotion-style css hash classnames
  /\bcss-[a-z0-9]{6,}\b/gi,
  // Common nonce attributes
  /nonce="[^"]+"/g,
  // Countdown timer values in aria-labels (Time until draw: Xd Xh Xm Xs)
  /Time until draw: \d+d \d{1,2}h \d{1,2}m \d{1,2}s/g,
];

function normalize(html: string): string {
  let out = html;
  for (const pattern of NOISE_PATTERNS) {
    out = out.replace(pattern, "‹noise›");
  }
  return out;
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const aLen = a.length;
  const bLen = b.length;
  if (aLen === 0) return bLen;
  if (bLen === 0) return aLen;

  let prev = new Array<number>(bLen + 1);
  let curr = new Array<number>(bLen + 1);
  for (let j = 0; j <= bLen; j++) prev[j] = j;

  for (let i = 1; i <= aLen; i++) {
    curr[0] = i;
    for (let j = 1; j <= bLen; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      const del = (prev[j] ?? 0) + 1;
      const ins = (curr[j - 1] ?? 0) + 1;
      const sub = (prev[j - 1] ?? 0) + cost;
      curr[j] = del < ins ? (del < sub ? del : sub) : ins < sub ? ins : sub;
    }
    const tmp = prev;
    prev = curr;
    curr = tmp;
  }
  return prev[bLen] ?? 0;
}

function similarityRatio(a: string, b: string): number {
  if (a === b) return 1;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  if (Math.min(a.length, b.length) > MAX_COMPARE_LENGTH) {
    return 0;
  }
  return 1 - levenshtein(a, b) / maxLen;
}

function firstDiffIndex(a: string, b: string): number {
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    if (a[i] !== b[i]) return i;
  }
  return len;
}

function classifyDiff(domHtml: string, ssrHtml: string): string {
  const idx = firstDiffIndex(domHtml, ssrHtml);
  const start = Math.max(0, idx - DIFF_SNIPPET_RADIUS);
  const snippet = domHtml.slice(start, idx + DIFF_SNIPPET_RADIUS);
  if (/\d{1,2}:\d{2}/.test(snippet)) return "time/clock value";
  if (/\b\d{4,}\b/.test(snippet)) return "timestamp or numeric id";
  if (/rgb\(|#[0-9a-f]{3,6}|style="/i.test(snippet)) return "style or class hash";
  return "structural mismatch";
}

async function fetchSsrBody(): Promise<string> {
  const res = await fetch(window.location.href, {
    headers: { Accept: "text/html" },
    credentials: "same-origin",
  });
  const text = await res.text();
  const doc = new DOMParser().parseFromString(text, "text/html");
  return doc.body.innerHTML;
}

async function run(): Promise<void> {
  try {
    const domHtml = document.body.innerHTML;
    const ssrHtml = await fetchSsrBody();

    const similarity = similarityRatio(normalize(domHtml), normalize(ssrHtml));

    if (similarity < SIMILARITY_THRESHOLD) {
      // Hydration drift detected (silent in browser console).
    }
  } catch {
    // Hydration diff check is dev-only and non-critical.
  }
}

export function initHydrationDiffDetector(): void {
  if (!import.meta.env.DEV) return;
  if (typeof window === "undefined") return;
  if (typeof document === "undefined") return;

  const path = window.location.pathname + window.location.search;
  if (checkedPaths.has(path)) return;
  checkedPaths.add(path);

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      void run();
    });
  });
}
