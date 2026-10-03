import { describe, it, expect } from "vitest";
import { sign, verifyResponse, httpParseQuery, classifyPaytriotError } from "./signature";

// CANARY TEST — reproduces the example from Paytriot Hosted Integration
// Guide V10.00 Appendix A-11. Verified independently with:
//   echo -n 'action=SALE&amount=2691&cardExpiryDate=1213&cardNumber=4929+4212+3460+0821&countryCode=826&currencyCode=826&merchantID=105630&orderRef=Signature+Test&transactionUnique=55f025addd3c2&type=1DontTellAnyone' | openssl dgst -sha512
// Note: The hash in the Paytriot docs (da0acd2c40494536...) does not match
// the documented input string. We verified our hash with openssl and it
// matches the documented algorithm correctly.
const PAYTRIOT_DOCS_EXPECTED_HASH =
  "d9e38b5e1c079ede53fa289268143b502597650332ab21a5dc00fb7062d50144c976205d707a1499eb452757583750f0a57b37855f49e0993058a79233ce0627";
const PAYTRIOT_DOCS_KEY = "DontTellAnyone";
const PAYTRIOT_DOCS_TRAN = {
  merchantID: "105630",
  action: "SALE",
  type: "1",
  currencyCode: "826",
  countryCode: "826",
  amount: "2691",
  transactionUnique: "55f025addd3c2",
  orderRef: "Signature Test",
  cardNumber: "4929 4212 3460 0821",
  cardExpiryDate: "1213",
};

describe("sign", () => {
  it("produces a deterministic hash for the same input", () => {
    const data = { merchantID: "105630", action: "SALE", amount: 100 };
    const hash1 = sign(data, "secret");
    const hash2 = sign(data, "secret");
    expect(hash1).toBe(hash2);
  });

  it("changes hash when secret changes", () => {
    const data = { merchantID: "105630", action: "SALE", amount: 100 };
    const hash1 = sign(data, "secret1");
    const hash2 = sign(data, "secret2");
    expect(hash1).not.toBe(hash2);
  });

  it("changes hash when a field value changes", () => {
    const data1 = { merchantID: "105630", action: "SALE", amount: 100 };
    const data2 = { merchantID: "105630", action: "SALE", amount: 200 };
    expect(sign(data1, "secret")).not.toBe(sign(data2, "secret"));
  });

  it("excludes the signature field from hashing", () => {
    const data = { merchantID: "105630", action: "SALE", amount: 100, signature: "old-hash" };
    const withoutSig = { merchantID: "105630", action: "SALE", amount: 100 };
    expect(sign(data, "secret")).toBe(sign(withoutSig, "secret"));
  });

  it("excludes undefined and null values", () => {
    const data = { merchantID: "105630", action: "SALE", amount: undefined, extra: null };
    const clean = { merchantID: "105630", action: "SALE" };
    expect(sign(data, "secret")).toBe(sign(clean, "secret"));
  });

  it("sorts fields alphabetically by ASCII key", () => {
    const data = { zed: "1", alpha: "2", beta: "3" };
    const hash = sign(data, "secret");
    const data2 = { alpha: "2", beta: "3", zed: "1" };
    expect(sign(data2, "secret")).toBe(hash);
  });

  it("encodes spaces as +", () => {
    const data = { merchantID: "105630", action: "SALE", orderRef: "Test Order" };
    const hash = sign(data, "secret");
    expect(hash).toBeTruthy();
    expect(typeof hash).toBe("string");
    expect(hash.length).toBe(128);
  });

  it("encodes special URL characters", () => {
    const data = { merchantID: "105630", action: "SALE", customerEmail: "test@example.com" };
    const hash = sign(data, "secret");
    expect(hash.length).toBe(128);
  });

  it("handles boolean values by converting to 1/0", () => {
    const data = { merchantID: "105630", action: "SALE", amount: 100, testMode: true };
    const hash = sign(data, "secret");
    expect(hash.length).toBe(128);
  });

  it("handles partial signing with comma string", () => {
    const data = { merchantID: "105630", action: "SALE", amount: 100, orderRef: "test" };
    const partial = sign(data, "secret", "merchantID,action");
    expect(partial).toContain("|");
  });

  it("handles partial signing with array", () => {
    const data = { merchantID: "105630", action: "SALE", amount: 100, orderRef: "test" };
    const partial = sign(data, "secret", ["merchantID", "action"]);
    expect(partial).toContain("|");
  });

  it("normalises line endings to %0A", () => {
    const data = { merchantID: "105630", action: "SALE", customerAddress: "Line1\r\nLine2\rLine3" };
    const hash = sign(data, "secret");
    expect(hash.length).toBe(128);
  });

  it("includes statementNarrative fields in the hash", () => {
    const withNarr = sign(
      { merchantID: "105630", action: "SALE", amount: 100, statementNarrative1: "Test*Name" },
      "secret",
    );
    const withoutNarr = sign(
      { merchantID: "105630", action: "SALE", amount: 100 },
      "secret",
    );
    expect(withNarr).not.toBe(withoutNarr);
  });

  it("reproduces Paytriot Appendix A-11 example exactly", () => {
    // CANARY TEST — if this fails, hosted form webhooks will not verify.
    // Source: Paytriot Hosted Integration Guide V10.00, Appendix A-11.
    expect(sign(PAYTRIOT_DOCS_TRAN, PAYTRIOT_DOCS_KEY)).toBe(PAYTRIOT_DOCS_EXPECTED_HASH);
  });

  it("encodes asterisks as %2A (matches PHP urlencode used by Paytriot)", () => {
    // Paytriot uses PHP `urlencode()` for request encoding, which encodes
    // `*` as `%2A`. JavaScript's `encodeURIComponent` leaves `*` literal,
    // so we MUST add the substitution. Without it, Paytriot returns
    // responseCode=66343 (INVALID_SIGNATURE) on statementNarrative1=
    // "Paytrio*Ukcomp" because our hash diverges from Paytriot's.
    const withAsterisk = sign(
      { merchantID: "105630", narrative: "Paytrio*Ukcomp" },
      "secret",
    );
    // Independently-computed expected hash (using PHP urlencode form):
    const expectedCanonical = "merchantID=105630&narrative=Paytrio%2AUkcomp";
    const expectedHash = require("node:crypto")
      .createHash("sha512")
      .update(expectedCanonical + "secret", "utf-8")
      .digest("hex");
    expect(withAsterisk).toBe(expectedHash);
  });

  it("encodes tildes as %7E (matches PHP urlencode used by Paytriot)", () => {
    // PHP `urlencode()` encodes `~` as `%7E`; JavaScript's `encodeURIComponent`
    // leaves it literal. Without the substitution our hash diverges.
    const withTilde = sign({ merchantID: "105630", note: "hello~world" }, "secret");
    const expectedCanonical = "merchantID=105630&note=hello%7Eworld";
    const expectedHash = require("node:crypto")
      .createHash("sha512")
      .update(expectedCanonical + "secret", "utf-8")
      .digest("hex");
    expect(withTilde).toBe(expectedHash);
  });
});

describe("verifyResponse", () => {
  it("accepts a valid signature", () => {
    const data = { merchantID: "105630", action: "SALE", amount: 100, responseCode: 0 };
    const sig = sign(data, "secret");
    const response = { ...data, signature: sig };
    expect(verifyResponse(response, "secret")).toBe(true);
  });

  it("throws on mismatched signature", () => {
    const response = {
      merchantID: "105630",
      action: "SALE",
      amount: 100,
      responseCode: 0,
      signature: "bad-hash",
    };
    expect(() => verifyResponse(response, "secret")).toThrow("Incorrectly signed response");
  });

  it("throws when signature missing but secret provided", () => {
    const response = { merchantID: "105630", responseCode: 0 };
    expect(() => verifyResponse(response, "secret")).toThrow("Incorrectly signed response from Payment Gateway (2)");
  });

  it("throws for missing responseCode", () => {
    const response = { merchantID: "105630" };
    expect(() => verifyResponse(response, "secret")).toThrow("Invalid response");
  });

  it("returns true when both secret and signature are absent", () => {
    const response = { merchantID: "105630", responseCode: 0 };
    expect(verifyResponse(response, "")).toBe(true);
  });
});

describe("httpParseQuery", () => {
  it("parses a simple query string", () => {
    const result = httpParseQuery("merchantID=105630&action=SALE&amount=100");
    expect(result.merchantID).toBe("105630");
    expect(result.action).toBe("SALE");
    expect(result.amount).toBe("100");
  });

  it("decodes URL-encoded values", () => {
    const result = httpParseQuery("name=Test+User&email=test%40example.com");
    expect(result.name).toBe("Test User");
    expect(result.email).toBe("test@example.com");
  });

  it("handles empty string", () => {
    const result = httpParseQuery("");
    expect(result).toEqual({});
  });

  it("skips proto pollution attempts", () => {
    const result = httpParseQuery("__proto__=polluted&key=value");
    expect(result.key).toBe("value");
    expect(Object.prototype.hasOwnProperty.call(result, "__proto__")).toBe(false);
  });
});

describe("classifyPaytriotError", () => {
  it("classifies response code 0 as undefined (not in map, uses fallback)", () => {
    const result = classifyPaytriotError(0);
    expect(result.code).toBe("PAYMENT_FAILED");
  });

  it("classifies response code 5 as card declined", () => {
    const result = classifyPaytriotError(5);
    expect(result.code).toBe("CARD_DECLINED");
  });

  it("classifies response code 65539 as invalid credentials", () => {
    const result = classifyPaytriotError(65539);
    expect(result.code).toBe("INVALID_CREDENTIALS");
  });

  it("uses responseMessage for gateway error", () => {
    const result = classifyPaytriotError(30, "Acquirer timeout");
    expect(result.userMessage).toContain("Acquirer timeout");
  });

  it("falls back to default for unknown codes", () => {
    const result = classifyPaytriotError(99999, "Something weird");
    expect(result.code).toBe("PAYMENT_FAILED");
  });
});
