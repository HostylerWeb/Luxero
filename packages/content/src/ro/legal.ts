import { LUXERO_LEGAL_ENTITY } from "../legal/company-entity.ts";

export const LEGAL_SITE_NAME = "Luxero Competitions";

export const termsIntro = {
  title: "Terms & Conditions",
  lastUpdated: "5 noiembrie 2026",
  companyName: LUXERO_LEGAL_ENTITY.name,
  companyNumber: LUXERO_LEGAL_ENTITY.numberLabelRo,
  registeredOffice: LUXERO_LEGAL_ENTITY.registeredOffice,
  website: "www.luxero.win",
  pageSubtitle: "Prize draws, postal entries, instant wins and consumer protections",
  contactLine: "contact@luxero.win   |   +44 744 3289228   |   www.luxero.win",
};

export const privacyIntro = {
  title: "Politica de Confidențialitate",
  lastUpdated: "noiembrie 2026",
  dataController: LUXERO_LEGAL_ENTITY.name,
};

export const cookiePolicyIntro = {
  title: "Politica Cookie-urilor",
  lastUpdated: "Mai 2026",
};

export { cookiePolicySections } from "./legal/cookie-policy-sections";
export { privacySections } from "./legal/privacy-sections";
export { termsSections } from "../legal/terms-sections-render";
