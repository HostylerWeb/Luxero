import type { ContactInfoCard } from "../content-types";

export const CONTACT_EMAIL = "contact@luxero.win";
export const COMPANY_NAME = "LUXERO COMPETITIONS LTD";
export const COMPANY_NUMBER = "Nr. Înreg. SC888260 (Scoția)";
export const COMPANY_ADDRESS = "107 Dalriada Crescent, Motherwell, ML1 3XT, Scotland";
export const CONTACT_PHONE = "+44 744 328 9228";
export const CONTACT_PHONE_HOURS = "Lun–Vin, 9:00–17:00 GMT";

export const contactHero = {
  title: "Ia legătura",
  subtitle: "Ai o întrebare sau ai nevoie de ajutor? Am fi încântați să auzim de la tine.",
};

export const contactFooterNote =
  "Răspundem în maxim 24 de ore în zilele lucrătoare (Lun–Vin, 9:00–17:00 GMT).";

export const CONTACT_INFO_CARDS: Omit<ContactInfoCard, "icon">[] = [
  {
    label: "Email",
    value: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
    subvalue: null,
  },
  {
    label: "Telefon",
    value: CONTACT_PHONE,
    href: "tel:+447443289228",
    subvalue: CONTACT_PHONE_HOURS,
  },
  {
    label: "Adresă",
    value: COMPANY_ADDRESS,
    href: null,
    subvalue: null,
  },
  {
    label: "Înregistrat",
    value: COMPANY_NAME,
    subvalue: COMPANY_NUMBER,
    href: null,
  },
];
