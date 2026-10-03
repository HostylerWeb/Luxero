// Local cn() helper — combines clsx and tailwind-merge.
// Mirrors the one in @luxero/utils but lives locally to avoid an extra
// import boundary in component files.
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
