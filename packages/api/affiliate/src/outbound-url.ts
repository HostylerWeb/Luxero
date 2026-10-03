import { isIP } from "node:net";

const BLOCKED_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);

function isPrivateIp(hostname: string): boolean {
  if (!isIP(hostname)) return false;
  if (hostname.startsWith("10.")) return true;
  if (hostname.startsWith("192.168.")) return true;
  if (hostname.startsWith("127.")) return true;
  const parts = hostname.split(".").map(Number);
  if (parts[0] === 172 && parts[1]! >= 16 && parts[1]! <= 31) return true;
  if (hostname.includes(":")) {
    const lower = hostname.toLowerCase();
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
  const host = url.hostname.toLowerCase();
  if (BLOCKED_HOSTS.has(host) || host.endsWith(".local") || isPrivateIp(host)) {
    throw new Error("Postback URL host is not allowed");
  }
  return url;
}
