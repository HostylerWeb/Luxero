export type CompetitionStatus =
  | "active"
  | "draft"
  | "paused"
  | "ended"
  | "pending_draw"
  | "drawn"
  | "cancelled";

export type CompetitionCurrency = "GBP" | "EUR";

export interface CompetitionImage {
  url: string;
  roles: ("primary" | "hero" | "og" | "ref")[];
}

export interface CompetitionFormState {
  title: string;
  subtitle: string;
  status: CompetitionStatus;
  ticketPrice: number;
  hasOriginalPrice: boolean;
  originalPrice: number;
  maxTickets: number;
  drawDate: string;
  description: string;
  imageUrl: string;
  categoryId: string;
  name: string;
  label: string;
  iconName: string;
  slug: string;
  shortDescription: string;
  category: string;
  isCashOnly: boolean;
  requireSignIn: boolean;
  prizeValue: number;
  maxTicketsPerUser: number;
  question: string;
  questionOptions: string[];
  correctAnswer: number;
  images: CompetitionImage[];
  isFeatured: boolean;
  displayOrder: number;
  currency: CompetitionCurrency;
}

export interface CompetitionSettingsFormState {
  endingSoonThreshold?: number;
  endingSoonDaysThreshold: string;
  endingSoonTicketsThreshold: string;
  endingSoonCombineMode: "or" | "and";
  endingSoonTimeEnabled: boolean;
  endingSoonTicketsEnabled: boolean;
  endingSoonTicketsMetric: "remaining" | "sold";
}

function getDefaultDrawDate(): string {
  const date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function getDefaultForm(): CompetitionFormState {
  return {
    title: "",
    subtitle: "",
    status: "draft" as CompetitionStatus,
    ticketPrice: 0,
    hasOriginalPrice: false,
    originalPrice: 0,
    maxTickets: 0,
    drawDate: getDefaultDrawDate(),
    description: "",
    imageUrl: "",
    categoryId: "",
    name: "",
    label: "",
    iconName: "",
    slug: "",
    shortDescription: "",
    category: "",
    isCashOnly: false,
    requireSignIn: false,
    prizeValue: 0,
    maxTicketsPerUser: 0,
    question: "",
    questionOptions: [],
    correctAnswer: -1,
    images: [],
    isFeatured: false,
    displayOrder: 0,
    currency: "GBP",
  };
}

export const DEFAULT_FORM = getDefaultForm();

export const STATUS_OPTIONS = [
  { value: "draft" as const, label: "Draft" },
  { value: "active" as const, label: "Active" },
  { value: "paused" as const, label: "Paused" },
  { value: "ended" as const, label: "Ended" },
  { value: "drawn" as const, label: "Drawn" },
  { value: "cancelled" as const, label: "Cancelled" },
];

export const FILTER_STATUS_OPTIONS = [
  { value: "all" as const, label: "All" },
  { value: "need_draw" as const, label: "Need Draw" },
  ...STATUS_OPTIONS,
];
