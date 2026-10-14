import type { ContactInfoCard } from "./content-types";
import { LEGAL_SITE_NAME } from "./legal";
import { resolveContent } from "./locales";
import {
  COMPANY_ADDRESS as COMPANY_ADDRESS_RO,
  COMPANY_NAME as COMPANY_NAME_RO,
  COMPANY_NUMBER as COMPANY_NUMBER_RO,
} from "./ro/contact";

export const CONTACT_EMAIL = "contact@luxero.win";
export const COMPANY_NAME = "LUXERO COMPETITIONS LTD";
export const COMPANY_NUMBER = "Company No. SC888260 (Scotland)";
export const COMPANY_ADDRESS = "107 Dalriada Crescent, Motherwell, ML1 3XT, Scotland";
export const CONTACT_PHONE = "+44 744 328 9228";
export const CONTACT_PHONE_HOURS = "Mon–Fri, 9am–5pm GMT";

export const contactHero = {
  title: "Get in Touch",
  subtitle: "Have a question or need help? We'd love to hear from you.",
};

export const contactFooterNote =
  "We respond within 24 hours on business days (Mon–Fri, 9am–5pm GMT).";

export type PostalEntryCompanyDetails = {
  postalDisplayName: string;
  companyRegistration: string;
  defaultAddress: string;
};

/** Company name, number, and address for postal entry (same source as contact page). */
export function getPostalEntryCompanyDetails(locale: string): PostalEntryCompanyDetails {
  const companyName = resolveContent(locale, COMPANY_NAME, COMPANY_NAME_RO);
  const companyNumber = resolveContent(locale, COMPANY_NUMBER, COMPANY_NUMBER_RO);
  const defaultAddress = resolveContent(locale, COMPANY_ADDRESS, COMPANY_ADDRESS_RO);

  return {
    postalDisplayName: LEGAL_SITE_NAME,
    companyRegistration: `${companyName} — ${companyNumber}`,
    defaultAddress,
  };
}

export const CONTACT_INFO_CARDS: Omit<ContactInfoCard, "icon">[] = [
  {
    label: "Email",
    value: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
    subvalue: null,
  },
  {
    label: "Phone",
    value: CONTACT_PHONE,
    href: "tel:+447443289228",
    subvalue: CONTACT_PHONE_HOURS,
  },
  {
    label: "Address",
    value: COMPANY_ADDRESS,
    href: null,
    subvalue: null,
  },
  {
    label: "Registered",
    value: COMPANY_NAME,
    subvalue: COMPANY_NUMBER,
    href: null,
  },
];
