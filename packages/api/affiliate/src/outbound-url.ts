import { timingSafeEqual } from "node:crypto";
import { isIP } from "node:net";

const BLOCKED_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);

function normalizeHostname(hostname: string): string {
  return hostname.toLowerCase().replace(/^\[|\]$/g, "");
}

function isPrivateIp(hostname: string): boolean {
  const host = normalizeHostname(hostname);
  if (!isIP(host)) return false;
  if (host === "::1") return true;
  if (host.startsWith("10.")) return true;
  if (host.startsWith("192.168.")) return true;
  if (host.startsWith("127.")) return true;
  if (host.startsWith("169.254.")) return true;
  if (host.startsWith("100.")) {
    const second = Number(host.split(".")[1]);
    if (second >= 64 && second <= 127) return true;
  }
  const parts = host.split(".").map(Number);
  if (parts[0] === 172 && parts[1]! >= 16 && parts[1]! <= 31) return true;
  if (host.includes(":")) {
    const lower = host.toLowerCase();
    if (lower.startsWith("fc") || lower.startsWith("fd") || lower.startsWith("fe80")) return true;
  }
  return false;
}

/** SSRF guard for admin-configured affiliate postback URLs. */
export function assertSafeOutboundUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("Invalid postback URL");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Postback URL must use http or https");
  }
  const host = normalizeHostname(url.hostname);
  if (BLOCKED_HOSTS.has(host) || host.endsWith(".local") || isPrivateIp(host)) {
    throw new Error("Postback URL host is not allowed");
  }
  if (isIP(host)) {
    throw new Error("Postback URL must use a hostname, not a literal IP");
  }
  return url;
}
