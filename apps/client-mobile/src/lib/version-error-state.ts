const STORAGE_KEY = "v_err_state";

interface ErrorEntry {
  count: number;
}

interface State {
  version: string;
  errors: Record<string, ErrorEntry>;
}

function readState(): State | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as State) : null;
  } catch {
    return null;
  }
}

function writeState(state: State): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota */
  }
}

export function hashError(error: unknown): string {
  if (!(error instanceof Error)) return `unknown:${String(error)}`;
  const stack = (error.stack || "")
    .split("\n")
    .slice(0, 4)
    .map((l) => l.replace(/:\d+:\d+/g, "").trim())
    .join("\n");
  const str = `${error.name}:${error.message}:${stack}`;
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

export function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.name === "ChunkLoadError" ||
    error.message.includes("Failed to fetch dynamically imported module") ||
    error.message.includes("Loading chunk") ||
    error.message.includes("Importing a module script failed")
  );
}

const CHUNK_ERROR_MARKER = "__chunk__";

export function shouldReloadOnError(
  errorHash: string,
  buildVersion: string,
  maxRetries = 2
): boolean {
  const state = readState();

  if (!state || state.version !== buildVersion) {
    writeState({
      version: buildVersion,
      errors: { [errorHash]: { count: 1 } },
    });
    return true;
  }

  const entry = state.errors[errorHash];
  if (!entry || entry.count < maxRetries) {
    state.errors[errorHash] = { count: (entry?.count ?? 0) + 1 };
    writeState(state);
    return true;
  }

  return false;
}

export function shouldAlwaysReload(errorHash: string): boolean {
  return errorHash === CHUNK_ERROR_MARKER;
}
