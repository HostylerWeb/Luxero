export function buildSearchParams(
  params?: Record<string, string | number | boolean | undefined>
): string {
  if (!params) return "";
  const sp = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => [k, String(v)])
  );
  const s = sp.toString();
  return s ? `?${s}` : "";
}
