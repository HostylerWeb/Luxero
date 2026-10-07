import type { ReactNode } from "react";

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqCategory {
  id: string;
  name: string;
}

export interface HowItWorksStep {
  stepNumber: number;
  title: string;
  description: string;
  icon: string;
}

export interface HowItWorksAltPath {
  title: string;
  description: string;
  icon: string;
  href: string;
}

export interface ContentFeature {
  title: string;
  description: string;
  icon: string;
}

export interface ContactInfoCard {
  label: string;
  value: string;
  href: string | null;
  subvalue: string | null;
}

export interface HomeFeature {
  id: string;
  title: string;
  description: string;
  icon: "Shield" | "Zap" | "Users";
  variant: "featured" | "side";
  badges?: { label: string; color: "green" | "gold" }[];
}

export interface AboutWhyChooseItem {
  title: string;
  description: string;
}

export interface AboutSection {
  id: string;
  title: string;
  icon: string;
  iconClass?: string;
  paragraphs?: string[];
  whyChooseItems?: AboutWhyChooseItem[];
  listItems?: string[];
  companyInfo?: {
    name: string;
    number: string;
    address: string;
    email: string;
  };
  responsibleGambling?: {
    intro: string;
    items: { text: string; link?: { href: string; label: string } }[];
  };
}

export interface LegalSection {
  id: string;
  title: string;
  content: ReactNode;
}
