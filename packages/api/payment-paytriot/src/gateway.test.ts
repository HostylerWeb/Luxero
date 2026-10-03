import { describe, it, expect } from "vitest";
import { Gateway } from "./gateway";

function stripWhitespace(html: string): string {
  return html.replace(/\s+/g, " ");
}

describe("Gateway", () => {
  it("generates a form with hidden inputs", () => {
    const gw = new Gateway({
      hostedUrl: "https://gateway.paytriot.co.uk/paymentform/",
      merchantID: "105630",
      merchantSecret: "secret",
    });

    const html = gw.hostedRequest({
      merchantID: "105630",
      action: "SALE",
      amount: 1000,
      countryCode: 826,
      currencyCode: 826,
      redirectURL: "https://example.com/return",
    });

    expect(html).toContain("<form");
    expect(html).toContain("action=\"https://gateway.paytriot.co.uk/paymentform/\"");
    expect(html).toContain("name=\"merchantID\"");
    expect(html).toContain("name=\"signature\"");
    expect(html).toContain("type=\"submit\"");
  });

  it("includes all provided fields as hidden inputs", () => {
    const gw = new Gateway({
      merchantID: "105630",
      merchantSecret: "secret",
    });

    const html = gw.hostedRequest({
      merchantID: "105630",
      action: "SALE",
      amount: 500,
      countryCode: 826,
      currencyCode: 826,
      redirectURL: "https://example.com/return",
      transactionUnique: "order-123",
      orderRef: "INV-001",
      customerEmail: "test@example.com",
    });

    expect(html).toContain("name=\"merchantID\"");
    expect(html).toContain("name=\"transactionUnique\"");
    expect(html).toContain("name=\"orderRef\"");
    expect(html).toContain("name=\"customerEmail\"");
    expect(html).toContain("value=\"test@example.com\"");
  });

  it("generates a signature field", () => {
    const gw = new Gateway({
      merchantID: "105630",
      merchantSecret: "test-secret",
    });

    const html = gw.hostedRequest({
      merchantID: "105630",
      action: "SALE",
      amount: 100,
      countryCode: 826,
      currencyCode: 826,
      redirectURL: "https://example.com/return",
    });

    const match = html.match(/name="signature" value="([^"]+)"/);
    expect(match).not.toBeNull();
    expect(match![1]!.length).toBe(128);
  });

  it("throws if merchantID is missing", () => {
    const gw = new Gateway({ merchantSecret: "secret" });
    expect(() =>
      gw.hostedRequest({
        action: "SALE",
        amount: 100,
        countryCode: 826,
        currencyCode: 826,
        redirectURL: "https://example.com/return",
      }),
    ).toThrow("Merchant ID");
  });

  it("throws if redirectURL is missing", () => {
    const gw = new Gateway({ merchantID: "105630", merchantSecret: "secret" });
    expect(() =>
      gw.hostedRequest({
        merchantID: "105630",
        action: "SALE",
        amount: 100,
        countryCode: 826,
        currencyCode: 826,
      }),
    ).toThrow("redirectURL");
  });

  it("accepts custom submit text", () => {
    const gw = new Gateway({ merchantID: "105630", merchantSecret: "secret" });
    const html = gw.hostedRequest(
      {
        merchantID: "105630",
        action: "SALE",
        amount: 100,
        countryCode: 826,
        currencyCode: 826,
        redirectURL: "https://example.com/return",
      },
      { submitText: "Pay Now" },
    );
    expect(html).toContain("Pay Now");
  });

  it("accepts custom form attributes", () => {
    const gw = new Gateway({ merchantID: "105630", merchantSecret: "secret" });
    const html = gw.hostedRequest(
      {
        merchantID: "105630",
        action: "SALE",
        amount: 100,
        countryCode: 826,
        currencyCode: 826,
        redirectURL: "https://example.com/return",
      },
      { formAttrs: 'id="payment-form" class="hidden"' },
    );
    expect(html).toContain('id="payment-form"');
  });

  it("includes statementNarrative fields in the form", () => {
    const gw = new Gateway({ merchantID: "105630", merchantSecret: "secret" });
    const html = gw.hostedRequest({
      merchantID: "105630",
      action: "SALE",
      amount: 100,
      countryCode: 826,
      currencyCode: 826,
      redirectURL: "https://example.com/return",
      statementNarrative1: "Paytrio*Ukcomp",
      statementNarrative2: "02038841611",
    });

    expect(html).toContain("name=\"statementNarrative1\"");
    expect(html).toContain("value=\"Paytrio*Ukcomp\"");
    expect(html).toContain("name=\"statementNarrative2\"");
    expect(html).toContain("value=\"02038841611\"");
  });

  it("escapes HTML entities in field values", () => {
    const gw = new Gateway({ merchantID: "105630", merchantSecret: "secret" });
    const html = gw.hostedRequest({
      merchantID: "105630",
      action: "SALE",
      amount: 100,
      countryCode: 826,
      currencyCode: 826,
      redirectURL: "https://example.com/return?name=test&key=val",
    });

    expect(html).toContain("&amp;");
    expect(html).not.toContain("&name=");
  });
});
