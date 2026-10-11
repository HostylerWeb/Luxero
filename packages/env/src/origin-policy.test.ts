import { afterEach, describe, expect, it } from "vitest";
import {
  buildOriginAllowRegexes,
  isAllowedRequestOrigin,
  resetOriginPolicyCache,
} from "./origin-policy";

describe("origin-policy", () => {
  afterEach(() => {
    delete process.env.APP_URL;
    delete process.env.ORIGIN_ALLOW_HOST_SUFFIXES;
    resetOriginPolicyCache();
  });

  it("allows luxero.win subdomains via suffix regex", () => {
    expect(isAllowedRequestOrigin("https://admin.luxero.win")).toBe(true);
    expect(isAllowedRequestOrigin("https://assets.staging.luxero.win")).toBe(true);
  });

  it("allows hstgr.cloud subdomains via suffix regex", () => {
    expect(isAllowedRequestOrigin("https://admin.srv2011364.hstgr.cloud")).toBe(true);
    expect(isAllowedRequestOrigin("https://assets.srv2011364.hstgr.cloud")).toBe(true);
  });

  it("rejects arbitrary external origins", () => {
    expect(isAllowedRequestOrigin("https://evil.example")).toBe(false);
  });

  it("allows exact origins from APP_URL env", () => {
    process.env.APP_URL = "https://custom.example.net";
    resetOriginPolicyCache();
    expect(isAllowedRequestOrigin("https://custom.example.net")).toBe(true);
    expect(isAllowedRequestOrigin("https://www.custom.example.net")).toBe(true);
  });

  it("extends suffix list from ORIGIN_ALLOW_HOST_SUFFIXES", () => {
    process.env.ORIGIN_ALLOW_HOST_SUFFIXES = "mybrand.io";
    const patterns = buildOriginAllowRegexes();
    expect(patterns.some((re) => re.test("https://app.mybrand.io"))).toBe(true);
  });
});
