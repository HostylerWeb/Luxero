import crypto from "node:crypto";

/**
 * Sort fields by ASCII key order ascending.
 */
function ksort(data: Record<string, unknown>): Record<string, unknown> {
  const keys = Object.keys(data).sort((a, b) => (a > b ? 1 : a < b ? -1 : 0));
  const ret: Record<string, unknown> = {};
  for (const k of keys) {
    ret[k] = data[k];
  }
  return ret;
}

/**
 * URL-encode a string per RFC 1738 (matches Paytriot).
 *
 * Paytriot uses PHP `urlencode()` for query strings, which percent-encodes
 * more characters than JavaScript's `encodeURIComponent`:
 *  - Spaces become `+`
 *  - `*` is encoded as `%2A`
 *  - `~` is encoded as `%7E`
 *  - All other reserved chars are percent-encoded
 *
 * Without these substitutions, our hash diverges from Paytriot's whenever
 * the request contains `*` (e.g. statementNarrative1=Paytrio*Ukcomp).
 */
function urlencode(str: string): string {
  return encodeURIComponent(str)
    .replace(/!/g, "%21")
    .replace(/'/g, "%27")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29")
    .replace(/\*/g, "%2A")
    .replace(/~/g, "%7E")
    .replace(/%20/g, "+");
}

/**
 * Build a URL-encoded query string from key/value pairs (RFC 1738).
 */
function httpBuildQuery(data: Record<string, unknown>): string {
  const parts: string[] = [];

  for (const [key, val] of Object.entries(data)) {
    if (val === true || val === false) {
      parts.push(urlencode(key) + "=" + (val === true ? "1" : "0"));
    } else if (val === null || val === undefined) {
      continue;
    } else if (typeof val === "object" && !Array.isArray(val)) {
      for (const [nk, nv] of Object.entries(val as Record<string, unknown>)) {
        if (nv !== null && nv !== undefined) {
          const v = typeof nv === "boolean" ? (nv ? "1" : "0") : String(nv);
          parts.push(urlencode(`${key}[${nk}]`) + "=" + urlencode(v));
        }
      }
    } else if (typeof val !== "function") {
      parts.push(urlencode(key) + "=" + urlencode(String(val)));
    }
  }

  return parts.join("&");
}

/**
 * Parse a URL-encoded query string into key/value pairs.
 */
export function httpParseQuery(str: string): Record<string, unknown> {
  const ret: Record<string, unknown> = {};
  const params = String(str)
    .replace(/^&/, "")
    .replace(/&$/, "")
    .split("&");

  for (const param of params) {
    const eq = param.indexOf("=");
    if (eq === -1) continue;
    let key = param.slice(0, eq);
    let val = param.length > eq + 1 ? param.slice(eq + 1) : "";
    key = decodeURIComponent(key.replace(/\+/g, "%20"));
    val = decodeURIComponent(val.replace(/\+/g, "%20"));
    if (key.includes("__proto__") || key.includes("constructor") || key.includes("prototype")) {
      continue;
    }
    ret[key] = val;
  }
  return ret;
}

/**
 * Fields that must be excluded from signature calculation.
 */
const SIGNATURE_EXCLUDE = new Set(["signature"]);

/**
 * Compute a Paytriot SHA-512 signature.
 *
 * Process:
 *  1. Sort fields by ASCII key order (ascending).
 *  2. Build URL-encoded query string (RFC 1738, spaces as '+').
 *  3. Normalise line endings: %0D%0A / %0A%0D / %0D → %0A.
 *  4. Append the merchant secret (no separator).
 *  5. SHA-512 hash.
 *
 * @param data  The request or response fields. The `signature` field is excluded automatically.
 * @param secret  The merchant secret key.
 * @param partial  Optional comma-separated field names or array for partial signing.
 */
export function sign(
  data: Record<string, unknown>,
  secret: string,
  partial?: string | string[],
): string {
  let signData: Record<string, unknown> = {};

  if (partial) {
    const fieldList = Array.isArray(partial) ? partial : partial.split(",");
    signData = Object.fromEntries(
      Object.entries(data).filter(([k]) => fieldList.includes(k)),
    );
  } else {
    signData = Object.fromEntries(
      Object.entries(data).filter(
        ([k, v]) => !SIGNATURE_EXCLUDE.has(k) && v !== undefined && v !== null,
      ),
    );
  }

  signData = ksort(signData);
  let str = httpBuildQuery(signData);
  str = str.replace(/%0D%0A|%0A%0D|%0D/gi, "%0A");
  str = str + secret;

  const hash = crypto.createHash("sha512").update(str, "utf-8").digest("hex");

  if (partial) {
    const fieldStr = Array.isArray(partial) ? partial.join(",") : partial;
    return `${hash}|${fieldStr}`;
  }

  return hash;
}

/**
 * Verify a Paytriot response signature.
 *
 * @param response  The parsed response fields.
 * @param secret  The merchant secret key.
 * @returns `true` if the signature is valid.
 * @throws If the signature is missing or invalid.
 */
export function verifyResponse(
  response: Record<string, unknown>,
  secret: string,
): boolean {
  if (typeof response.responseCode === "undefined") {
    throw new Error("Invalid response from Payment Gateway");
  }

  const receivedSig = (response.signature as string) ?? "";
  if (!secret && receivedSig) {
    throw new Error("Incorrectly signed response from Payment Gateway (1)");
  }
  if (secret && !receivedSig) {
    throw new Error("Incorrectly signed response from Payment Gateway (2)");
  }
  if (!receivedSig) {
    return true;
  }

  let fieldsFilter: string | undefined;

  const hasPipe = receivedSig.includes("|");

  if (hasPipe) {
    const bar = receivedSig.indexOf("|");
    response.signature = receivedSig.slice(0, bar);
    fieldsFilter = receivedSig.slice(bar + 1);
  }

  const dataToVerify = { ...response };
  dataToVerify.signature = undefined;

  const expectedSig = sign(dataToVerify, secret, fieldsFilter);

  const receivedSigLength = (response.signature as string).length;
  if (expectedSig.length !== receivedSigLength) {
    throw new Error("Incorrectly signed response from Payment Gateway");
  }
  if (!crypto.timingSafeEqual(Buffer.from(expectedSig), Buffer.from(response.signature as string))) {
    throw new Error("Incorrectly signed response from Payment Gateway");
  }

  return true;
}

/**
 * Map Paytriot response codes to user-friendly messages.
 */
export function classifyPaytriotError(
  responseCode: number,
  responseMessage?: string,
): { code: string; userMessage: string } {
  const map: Record<number, { code: string; userMessage: string }> = {
    2: { code: "CARD_REFERRED", userMessage: "Card referred. Please try again or use a different card." },
    4: { code: "CARD_DECLINED_KEEP", userMessage: "Card declined. Please keep the card and try again." },
    5: { code: "CARD_DECLINED", userMessage: "Card was declined. Please use a different payment method." },
    30: { code: "GATEWAY_ERROR", userMessage: responseMessage ?? "A gateway error occurred. Please try again." },
    65792: { code: "3DS_IN_PROGRESS", userMessage: "3-D Secure verification is in progress. Please complete the challenge or try again." },
    65793: { code: "3DS_UNKNOWN_ERROR", userMessage: "An unknown 3-D Secure error occurred. Please try again or use a different card." },
    65794: { code: "3DS_NOT_AVAILABLE", userMessage: "3-D Secure is not enabled on this merchant account. Please contact support." },
    65795: { code: "3DS_NOT_REQUIRED", userMessage: "3-D Secure is not required for this card. Please try again." },
    65796: { code: "3DS_REQUIRED", userMessage: "Your card requires 3-D Secure verification. Please complete the authentication or use a different card." },
    65797: { code: "3DS_ENROLMENT_ERROR", userMessage: "Could not verify 3-D Secure enrolment for this card. Please try again or use a different card." },
    65800: { code: "3DS_AUTH_ERROR", userMessage: "3-D Secure authentication could not be completed. Please try again or use a different card." },
    65802: { code: "3DS_AUTH_REQUIRED", userMessage: "3-D Secure authentication is required for this card. Please complete the verification." },
    65803: { code: "3DS_AUTH_FAILED", userMessage: "3-D Secure authentication failed. Please try again or use a different payment method." },
    65539: { code: "INVALID_CREDENTIALS", userMessage: "Invalid merchant credentials. Contact support." },
    65540: { code: "IP_NOT_AUTHORIZED", userMessage: "Request from unauthorized IP address." },
    65541: { code: "ACTION_NOT_ALLOWED", userMessage: "This action is not allowed for your account." },
    65544: { code: "MALFORMED_REQUEST", userMessage: "Request could not be processed. Please try again." },
    65554: { code: "DUPLICATE_REQUEST", userMessage: "This transaction has already been processed." },
    65557: { code: "IP_BLOCKED", userMessage: "Your IP address has been blocked. Contact support." },
    65561: { code: "CARD_TYPE_NOT_SUPPORTED", userMessage: "This card type is not supported." },
    65566: { code: "TEST_CARD_LIVE", userMessage: "Test card used on live account." },
    66049: { code: "MISSING_MERCHANT_ID", userMessage: "Merchant ID is missing." },
    66055: { code: "MISSING_ACTION", userMessage: "Transaction action is missing." },
    66056: { code: "MISSING_AMOUNT", userMessage: "Transaction amount is missing." },
    66074: { code: "MISSING_REDIRECT_URL", userMessage: "Redirect URL is missing." },
    66087: { code: "MISSING_SIGNATURE", userMessage: "Request signature is missing." },
    66311: { code: "INVALID_ACTION", userMessage: "Invalid transaction action." },
    66312: { code: "INVALID_AMOUNT", userMessage: "Invalid transaction amount." },
    66343: { code: "INVALID_SIGNATURE", userMessage: "Invalid request signature." },
  };

  return (
    map[responseCode] ?? {
      code: "PAYMENT_FAILED",
      userMessage: responseMessage ?? "Payment could not be processed. Please try again.",
    }
  );
}
