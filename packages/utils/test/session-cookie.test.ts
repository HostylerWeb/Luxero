import { describe, expect, it } from "vitest";
import { getCookieEnvTag, getSessionCookiePrefix } from "../src/session-cookie";

describe("getCookieEnvTag", () => {
  it("returns null for production apex hosts", () => {
    expect(getCookieEnvTag("https://luxero.win")).toBeNull();
    expect(getCookieEnvTag("https://admin.luxero.win")).toBeNull();
    expect(getCookieEnvTag("https://app.luxero.win")).toBeNull();
    expect(getCookieEnvTag("https://www.luxero.win")).toBeNull();
  });

  it("returns the tag for staging/agro subdomains", () => {
    expect(getCookieEnvTag("https://staging.luxero.win")).toBe("staging");
    expect(getCookieEnvTag("https://agro.luxero.win")).toBe("agro");
    expect(getCookieEnvTag("https://admin.staging.luxero.win")).toBe("staging");
    expect(getCookieEnvTag("https://admin.agro.luxero.win")).toBe("agro");
    expect(getCookieEnvTag("https://shop.staging.luxero.win")).toBe("staging");
  });

  it("returns null for invalid urls and localhost", () => {
    expect(getCookieEnvTag("not a url")).toBeNull();
    expect(getCookieEnvTag("")).toBeNull();
    expect(getCookieEnvTag("http://localhost:3222")).toBeNull();
  });
});

describe("getSessionCookiePrefix", () => {
  it("keeps the base prefix for production", () => {
    expect(getSessionCookiePrefix("https://luxero.win", "client")).toBe("client");
    expect(getSessionCookiePrefix("https://admin.luxero.win", "admin")).toBe("admin");
  });

  it("appends the env tag for non-production hosts", () => {
    expect(getSessionCookiePrefix("https://staging.luxero.win", "client")).toBe("client-staging");
    expect(getSessionCookiePrefix("https://agro.luxero.win", "client")).toBe("client-agro");
    expect(getSessionCookiePrefix("https://admin.staging.luxero.win", "admin")).toBe(
      "admin-staging"
    );
  });
});
