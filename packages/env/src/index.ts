export * from "./server";

export const FRAMEWORK: "vike" | "next" = (() => {
  try {
    if (
      typeof import.meta !== "undefined" &&
      (import.meta as { env?: Record<string, string> }).env?.VITE_FRAMEWORK
    ) {
      return (import.meta as { env?: Record<string, string> }).env!.VITE_FRAMEWORK as
        | "vike"
        | "next";
    }
  } catch {}
  try {
    if (typeof process !== "undefined" && process.env?.FRAMEWORK) {
      return process.env.FRAMEWORK as "vike" | "next";
    }
  } catch {}
  return "next";
})();

export type { EnvKey } from "./types";
