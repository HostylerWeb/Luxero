export function resolveContent<T>(locale: string, enContent: T, roContent?: T): T {
  if (locale === "ro" && roContent !== undefined) return roContent;
  return enContent;
}
