import { sign } from "./signature";
import { PAYTRIOT_HOSTED_URL, PAYTRIOT_POPUP_URL } from "./constants";
import type { GatewayConfig, GatewayOptions, GatewayRequest } from "./types";

function htmlentities(str: string | number): string {
  if (typeof str === "number") return str.toString();
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/'/g, "&#39;")
    .replace(/"/g, "&quot;");
}

function ordEntities(str: string): string {
  return str.replace(/[\x00-\x1f]/g, (match) => "&#" + match.codePointAt(0) + ";");
}

function fieldToHtml(name: string, value: unknown): string {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    let ret = "";
    for (const [nk, nv] of Object.entries(value as Record<string, unknown>)) {
      ret += fieldToHtml(`${name}[${nk}]`, nv);
    }
    return ret;
  }
  const encoded = ordEntities(htmlentities(String(value)));
  return `<input type="hidden" name="${name}" value="${encoded}" />\n`;
}

export class Gateway {
  hostedUrl: string;
  popupUrl: string;
  merchantID?: string;
  merchantSecret?: string;
  debugOn: boolean;

  constructor(config?: GatewayConfig) {
    this.hostedUrl = config?.hostedUrl ?? PAYTRIOT_HOSTED_URL;
    this.popupUrl = PAYTRIOT_POPUP_URL;
    this.merchantID = config?.merchantID;
    this.merchantSecret = config?.merchantSecret;
    this.debugOn = config?.debugOn ?? false;
  }

  private debug(message: string, ...args: unknown[]): void {
    if (this.debugOn) console.log(`[paytriot-gateway]`, message, ...args);
  }

  private prepareRequest(request: GatewayRequest): { secret: string } {
    if (!request) throw new Error("Request must be provided");

    if (!request.merchantID && this.merchantID) {
      request.merchantID = this.merchantID;
    }
    if (!request.merchantID) {
      throw new Error("Merchant ID or Alias must be provided");
    }

    let secret = "";
    if (request.merchantSecret) {
      secret = request.merchantSecret as string;
      delete request.merchantSecret;
    } else if (this.merchantSecret) {
      secret = this.merchantSecret;
    }

    delete request.responseCode;
    delete request.responseMessage;
    delete request.responseStatus;
    delete request.state;
    delete request.merchantAlias;
    delete request.merchantID2;
    delete request.hostedUrl;
    delete request.directUrl;

    if (!request.signature) {
      const dataClone: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(request)) {
        if (v !== undefined) dataClone[k] = v;
      }
      request.signature = sign(dataClone, secret);
    }

    return { secret };
  }

  /**
   * Generate the hosted payment form HTML.
   *
   * @param request  The request fields (merchantID, action, amount, etc.).
   * @param options  Optional HTML attributes for the form/submit button.
   * @returns  A complete `<form>` HTML string with hidden inputs.
   */
  hostedRequest(request: GatewayRequest, options: GatewayOptions = {}): string {
    this.debug("hostedRequest()", request, options);

    this.prepareRequest(request);

    // Log request fields (masking signature)
    const logFields: Record<string, string> = {};
    for (const [k, v] of Object.entries(request)) {
      if (k === "signature") {
        logFields[k] = `${String(v).slice(0, 16)}...`;
      } else if (k === "merchantSecret") {
        logFields[k] = "***";
      } else {
        logFields[k] = String(v).slice(0, 100);
      }
    }
    if (!("redirectURL" in request)) {
      throw new Error("redirectURL not set in request");
    }

    let ret = `<form method="post" ${options.formAttrs ?? ""} action="${htmlentities(this.hostedUrl)}">\n`;

    for (const [name, value] of Object.entries(request)) {
      if (value !== undefined) {
        ret += fieldToHtml(name, value);
      }
    }

    if (options.submitImage) {
      ret += `<input ${options.submitAttrs ?? ""} type="image" src="${htmlentities(options.submitImage)}" />\n`;
    } else if (options.submitHtml) {
      ret += `<button type="submit" ${options.submitAttrs ?? ""}>${options.submitHtml}</button>\n`;
    } else {
      ret += `<input ${options.submitAttrs ?? ""} type="submit" value="${htmlentities(options.submitText ?? "Pay Now")}" />\n`;
    }

    ret += "</form>\n";
    return ret;
  }

  /**
   * Generate signed fields for popup mode.
   *
   * Same signing logic as hostedRequest() but returns the raw field
   * key-value pairs instead of an HTML form string.
   *
   * @param request  The request fields (merchantID, action, amount, etc.).
   * @returns  A flat Record of field name → value for the SDK to consume.
   */
  getSignedFields(request: GatewayRequest): Record<string, string> {
    this.debug("getSignedFields()", request);

    this.prepareRequest(request);

    const fields: Record<string, string> = {};
    for (const [name, value] of Object.entries(request)) {
      if (value !== undefined) {
        fields[name] = String(value);
      }
    }

    return fields;
  }
}
