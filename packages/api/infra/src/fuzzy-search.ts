const ESCAPE = /[.*+?^${}()|[\]\\]/g;

export function escapeRegex(str: string): string {
  return str.replace(ESCAPE, "\\$&");
}

export function singleCharGapRegex(str: string): string {
  const safe = escapeRegex(str);
  return safe.split("").join(".?");
}

export function substringRegex(str: string): string {
  return escapeRegex(str);
}

export function typoRegex(str: string): string {
  if (str.length < 2) return escapeRegex(str);

  const parts: string[] = [];
  const n = str.length;

  for (let i = 0; i <= n; i++) {
    const pattern = `${str.slice(0, i)}.${str.slice(i)}`;
    parts.push(pattern);
  }

  for (let i = 0; i < n; i++) {
    const pattern = str.slice(0, i) + str.slice(i + 1);
    parts.push(pattern);
  }

  for (let i = 0; i < n - 1; i++) {
    const pattern = str.slice(0, i) + str[i + 1] + str[i] + str.slice(i + 2);
    parts.push(pattern);
  }

  parts.push(escapeRegex(str));

  return parts.join("|");
}
