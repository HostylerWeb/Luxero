import { describe, expect, test } from "vitest";
import {
  ACQUIRER_DECLINE_CODES,
  CHARGED_STATES,
  getFulfillmentFailedErrorInfo,
  getPaytriotErrorInfo,
  PaytriotErrorCategory,
  sanitizeUserMessage,
} from "./codes";

function info(code: number, opts?: { msg?: string; state?: string; avs?: Record<string, string>; referralPhone?: string }) {
  return getPaytriotErrorInfo({
    responseCode: code,
    responseMessage: opts?.msg,
    state: opts?.state,
    cv2Check: opts?.avs?.cv2Check,
    addressCheck: opts?.avs?.addressCheck,
    postcodeCheck: opts?.avs?.postcodeCheck,
    avsResponseMessage: opts?.avs?.avsResponseMessage,
    referralPhone: opts?.referralPhone,
  });
}

const acq = PaytriotErrorCategory;
const KNOWN_CODES: Array<{ code: number; cat: PaytriotErrorCategory; title: string; charged: boolean; config?: boolean }> = [
  { code: 0, cat: acq.SUCCESS, title: "Payment successful", charged: true },
  { code: 2, cat: acq.CARD_REFERRED, title: "Card referred — please call your bank", charged: false },
  { code: 4, cat: acq.CARD_DECLINED_KEEP, title: "Card declined", charged: false },
  { code: 5, cat: acq.CARD_DECLINED, title: "Card declined", charged: false },
  { code: 30, cat: acq.GATEWAY_ERROR, title: "Temporary error", charged: false },
  { code: 65539, cat: acq.INVALID_CREDENTIALS, title: "Payment provider error", charged: false, config: true },
  { code: 65540, cat: acq.IP_NOT_AUTHORIZED, title: "Payment provider error", charged: false, config: true },
  { code: 65541, cat: acq.ACTION_NOT_ALLOWED, title: "Already processed", charged: false },
  { code: 65543, cat: acq.REQUEST_AMBIGUOUS, title: "Ambiguous request", charged: false },
  { code: 65544, cat: acq.REQUEST_MALFORMED, title: "Bad request", charged: false },
  { code: 65545, cat: acq.SUSPENDED_MERCHANT, title: "Service temporarily unavailable", charged: false, config: true },
  { code: 65546, cat: acq.CURRENCY_NOT_SUPPORTED, title: "Currency not supported", charged: false },
  { code: 65554, cat: acq.DUPLICATE_REQUEST, title: "Duplicate payment", charged: false },
  { code: 65556, cat: acq.AVS_CV2_NOT_SUPPORTED, title: "Verification not supported", charged: false },
  { code: 65557, cat: acq.IP_BLOCKED, title: "Payment provider error", charged: false, config: true },
  { code: 65561, cat: acq.CARD_TYPE_NOT_SUPPORTED, title: "Card type not supported", charged: false },
  { code: 65564, cat: acq.REQUEST_EXPIRED, title: "Session expired", charged: false },
  { code: 65565, cat: acq.REQUEST_RETRY, title: "Please try again", charged: false },
  { code: 65566, cat: acq.TEST_CARD_ON_LIVE, title: "Payment provider error", charged: false, config: true },
  { code: 65567, cat: acq.CARD_COUNTRY_NOT_SUPPORTED, title: "Country not supported", charged: false },
  { code: 65792, cat: acq.THREE_DS_IN_PROGRESS, title: "3-D Secure in progress", charged: false },
  { code: 65794, cat: acq.THREE_DS_NOT_AVAILABLE, title: "3-D Secure unavailable", charged: false },
  { code: 65800, cat: acq.THREE_DS_AUTH_ERROR, title: "3-D Secure authentication error", charged: false },
  { code: 65803, cat: acq.THREE_DS_AUTH_FAILED, title: "3-D Secure authentication failed", charged: false },
  { code: 66049, cat: acq.MISSING_MERCHANT_ID, title: "Payment provider error", charged: false, config: true },
  { code: 66055, cat: acq.MISSING_ACTION, title: "Payment provider error", charged: false, config: true },
  { code: 66056, cat: acq.MISSING_AMOUNT, title: "Payment provider error", charged: false, config: true },
  { code: 66064, cat: acq.MISSING_CARD_CVV, title: "Payment provider error", charged: false, config: true },
  { code: 66087, cat: acq.MISSING_SIGNATURE, title: "Payment provider error", charged: false, config: true },
  { code: 66057, cat: acq.MISSING_CURRENCY, title: "Payment provider error", charged: false, config: true },
  { code: 66311, cat: acq.INVALID_ACTION, title: "Payment provider error", charged: false, config: true },
  { code: 66312, cat: acq.INVALID_AMOUNT, title: "Payment provider error", charged: false, config: true },
  { code: 66314, cat: acq.INVALID_CARD_NUMBER, title: "Invalid card number", charged: false },
  { code: 66315, cat: acq.INVALID_CARD_EXPIRY_MONTH, title: "Invalid expiry month", charged: false },
  { code: 66320, cat: acq.INVALID_CARD_CVV, title: "Invalid security code", charged: false },
  { code: 66343, cat: acq.INVALID_SIGNATURE, title: "Payment provider error", charged: false, config: true },
  { code: 66416, cat: acq.INVALID_CARD_EXPIRY_DATE, title: "Card expired or invalid", charged: false },
];

describe("codes.ts", () => {
  test("success is info severity and charged", () => {
    const r = info(0, { state: "captured" });
    expect(r.category).toBe(acq.SUCCESS);
    expect(r.severity).toBe("info");
    expect(r.wasCharged).toBe(true);
  });

  test("success with no state defaults to charged", () => {
    const r = info(0);
    expect(r.wasCharged).toBe(true);
  });

  test("success with unknown state still charged", () => {
    const r = info(0, { state: "received" });
    expect(r.wasCharged).toBe(false);
  });

  KNOWN_CODES.forEach(({ code, cat, title, charged, config }) => {
    test(`code ${code} maps to ${cat}`, () => {
      const r = info(code, { msg: "test", state: "declined" });
      expect(r.category).toBe(cat);
      expect(r.title).toBe(title);
      if (!charged) expect(r.wasCharged).toBe(false);
      if (config) expect(r.isConfigError).toBe(true);
      if (!cat.startsWith("SUCCESS")) {
        expect(r.recommendedAction).toBeDefined();
        expect(r.severity === "info" || r.severity === "warning" || r.severity === "error" || r.severity === "critical").toBe(true);
      }
    });
  });

  test("card referred includes referralPhone", () => {
    const r = info(2, { referralPhone: "+441234567890" });
    expect(r.referralPhone).toBe("+441234567890");
  });

  test("code 5 with cv2Check=not matched -> CVV_FAILED", () => {
    const r = info(5, { avs: { cv2Check: "not matched" } });
    expect(r.category).toBe(acq.CVV_FAILED);
    expect(r.avsFailure?.cv2Check).toBe("not matched");
  });

  test("code 5 with addressCheck=not matched -> ADDRESS_FAILED", () => {
    const r = info(5, { avs: { addressCheck: "not matched" } });
    expect(r.category).toBe(acq.ADDRESS_FAILED);
  });

  test("code 5 with postcodeCheck=not matched -> POSTCODE_FAILED", () => {
    const r = info(5, { avs: { postcodeCheck: "not matched" } });
    expect(r.category).toBe(acq.POSTCODE_FAILED);
  });

  test("code 5 with multiple AVS failures -> AVS_FAILED", () => {
    const r = info(5, { avs: { cv2Check: "not matched", addressCheck: "not matched" } });
    expect(r.category).toBe(acq.AVS_FAILED);
  });

  test("code 5 with all matched stays CARD_DECLINED", () => {
    const r = info(5, { avs: { cv2Check: "matched", addressCheck: "matched", postcodeCheck: "matched" } });
    expect(r.category).toBe(acq.CARD_DECLINED);
  });

  test("state=captured -> wasCharged=true", () => {
    expect(CHARGED_STATES.has("captured")).toBe(true);
    expect(CHARGED_STATES.has("approved")).toBe(true);
    expect(CHARGED_STATES.has("tendered")).toBe(true);
    expect(CHARGED_STATES.has("accepted")).toBe(true);
    expect(CHARGED_STATES.has("received")).toBe(false);
    expect(CHARGED_STATES.has("declined")).toBe(false);
  });

  test("VCS takes priority over other codes", () => {
    const r = getPaytriotErrorInfo({
      responseCode: 5,
      vcsResponseCode: "5",
      vcsResponseMessage: "Declined by velocity control",
    });
    expect(r.category).toBe(acq.VELOCITY_CONTROLLED);
    expect(r.vcsDetails?.code).toBe("5");
  });

  test("unmapped code -> UNKNOWN_ERROR", () => {
    const r = info(99999);
    expect(r.category).toBe(acq.UNKNOWN_ERROR);
  });

  test("config errors have critical severity", () => {
    const r = info(65539);
    expect(r.severity).toBe("critical");
    expect(r.isConfigError).toBe(true);
  });
});

describe("getFulfillmentFailedErrorInfo", () => {
  test("returns FULFILLMENT_FAILED with charged=true and contact_support", () => {
    const r = getFulfillmentFailedErrorInfo();
    expect(r.category).toBe(PaytriotErrorCategory.FULFILLMENT_FAILED);
    expect(r.wasCharged).toBe(true);
    expect(r.recommendedAction).toBe("contact_support");
    expect(r.severity).toBe("error");
    expect(r.isConfigError).toBe(false);
    expect(r.title).toBe("Order processing failed");
    expect(r.description).toContain("received your payment");
    expect(r.description).toContain("card has been charged");
  });

  test("includes referralPhone when provided", () => {
    const r = getFulfillmentFailedErrorInfo({ referralPhone: "+441234567890" });
    expect(r.referralPhone).toBe("+441234567890");
  });

  test("includes responseMessage when provided", () => {
    const r = getFulfillmentFailedErrorInfo({
      responseMessage: "TICKETS_SOLD_OUT:Only 0 tickets available",
    });
    expect(r.responseMessage).toBe("TICKETS_SOLD_OUT:Only 0 tickets available");
  });

  test("getPaytriotErrorInfo with responseCode=0 still returns SUCCESS (backward compat)", () => {
    const r = getPaytriotErrorInfo({ responseCode: 0, state: "captured" });
    expect(r.category).toBe(PaytriotErrorCategory.SUCCESS);
    expect(r.category).not.toBe(PaytriotErrorCategory.FULFILLMENT_FAILED);
  });
});

describe("ACQUIRER_DECLINE_CODES", () => {
  const topCodes = [51, 54, 55, 57, 58, 61, 62, 65];

  test.each(topCodes)("responseCode=%i maps to CARD_DECLINED", (code) => {
    expect(ACQUIRER_DECLINE_CODES[code]).toBe(PaytriotErrorCategory.CARD_DECLINED);
  });

  test("extends to PIN retry limit codes 75-79", () => {
    for (let code = 75; code <= 79; code++) {
      expect(ACQUIRER_DECLINE_CODES[code]).toBe(PaytriotErrorCategory.CARD_DECLINED);
    }
  });

  test.each(topCodes)("getPaytriotErrorInfo(responseCode=%i) returns wasCharged=false and CARD_DECLINED", (code) => {
    const r = getPaytriotErrorInfo({ responseCode: code });
    expect(r.category).toBe(PaytriotErrorCategory.CARD_DECLINED);
    expect(r.wasCharged).toBe(false);
    expect(r.severity).toBe("error");
  });

  test("responseCode=51 (insufficient funds) returns the correct title", () => {
    const r = getPaytriotErrorInfo({ responseCode: 51 });
    expect(r.title).toBe("Card declined");
  });
});

describe("sanitizeUserMessage", () => {
  test("strips TICKETS_SOLD_OUT prefix", () => {
    expect(sanitizeUserMessage("TICKETS_SOLD_OUT:Only 0 tickets available")).toBe(
      "Only 0 tickets available"
    );
  });

  test("strips MAX_TICKETS_PER_USER_EXCEEDED prefix", () => {
    expect(
      sanitizeUserMessage(
        "MAX_TICKETS_PER_USER_EXCEEDED:You can only purchase 5 tickets for this competition"
      )
    ).toBe("You can only purchase 5 tickets for this competition");
  });

  test("strips ORDER_FULFILLMENT_FAILED prefix", () => {
    expect(sanitizeUserMessage("ORDER_FULFILLMENT_FAILED:Something broke")).toBe(
      "Something broke"
    );
  });

  test("returns null for null input", () => {
    expect(sanitizeUserMessage(null)).toBeNull();
  });

  test("returns null for empty string", () => {
    expect(sanitizeUserMessage("")).toBeNull();
  });

  test("passes through normal messages", () => {
    expect(sanitizeUserMessage("Insufficient funds. Please use a different card.")).toBe(
      "Insufficient funds. Please use a different card."
    );
  });

  test("returns null when only prefix remains", () => {
    expect(sanitizeUserMessage("PREFIX_ONLY:")).toBeNull();
  });

  test("handles message without prefix", () => {
    expect(sanitizeUserMessage("Your card was declined")).toBe("Your card was declined");
  });
});
