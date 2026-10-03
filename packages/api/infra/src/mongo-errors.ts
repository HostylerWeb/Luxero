export function isDuplicateKeyError(err: unknown): boolean {
  if (err && typeof err === "object" && "code" in err && (err as { code: number }).code === 11000) {
    return true;
  }

  if (err instanceof Error && err.message.includes("duplicate key")) {
    return true;
  }

  return false;
}
