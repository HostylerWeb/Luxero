export interface GatewayConfig {
  hostedUrl?: string;
  merchantID?: string;
  merchantSecret?: string;
  debugOn?: boolean;
}

export interface GatewayRequest extends Record<string, unknown> {
  merchantID?: string;
  merchantSecret?: string;
  signature?: string;
  action?: string;
  amount?: number;
  countryCode?: number;
  currencyCode?: number;
  redirectURL?: string;
  callbackURL?: string;
  transactionUnique?: string;
  type?: number;
  remoteAddress?: string;
  threeDSRedirectURL?: string;
  statementNarrative1?: string;
  statementNarrative2?: string;
}

export interface GatewayOptions {
  formAttrs?: string;
  submitAttrs?: string;
  submitImage?: string;
  submitHtml?: string;
  submitText?: string;
}

export interface PaytriotResponse {
  responseCode: number;
  responseMessage?: string;
  amount?: number;
  transactionID?: string;
  transactionUnique?: string;
  xref?: string;
  state?: string;
  timestamp?: string;
  authorisationCode?: string;
  amountReceived?: number;
  cardTypeCode?: string;
  cardType?: string;
  cardSchemeCode?: string;
  cardScheme?: string;
  cardNumberMask?: string;
  cardIssuer?: string;
  cardIssuerCountry?: string;
  cardIssuerCountryCode?: string;
  orderRef?: string;
  avscv2Enabled?: string;
  avscv2ResponseCode?: string;
  avscv2ResponseMessage?: string;
  cv2Check?: string;
  addressCheck?: string;
  postcodeCheck?: string;
  threeDSEnabled?: string;
  threeDSEnrolled?: string;
  threeDSAuthenticated?: string;
  threeDSXID?: string;
  threeDSECI?: string;
  threeDSCAVV?: string;
  threeDSCAVVAlgorithm?: string;
  threeDSErrorCode?: string;
  threeDSErrorDescription?: string;
  avscv2AuthEntity?: string;
  referralPhone?: string;
  paymentMethod?: string;
  riskCheckEnabled?: string;
  surchargeEnabled?: string;
  vcsResponseCode?: string;
  vcsResponseMessage?: string;
  threeDSDetails?: Record<string, string>;
  signature?: string;
}

export interface PaytriotCredentials {
  merchantId: string;
  merchantSecret: string;
  environment: "sandbox" | "live";
  statementNarrative1?: string;
  statementNarrative2?: string;
}
