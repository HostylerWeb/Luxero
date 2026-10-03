import type { CompetitionFormState } from "./types";

export type CompetitionFormTab =
  | "details"
  | "prize"
  | "images"
  | "instant-prizes"
  | "milestones"
  | "options"
  | "tickets";

export interface ValidationErrors {
  [key: string]: string;
}

export interface ValidationResult {
  error: string;
  tab: CompetitionFormTab;
}

export function validateCompetitionForm(form: CompetitionFormState): ValidationResult | null {
  if (!form.title.trim()) return { error: "Title is required", tab: "details" };
  if (form.ticketPrice < 0) return { error: "Ticket price cannot be negative", tab: "prize" };
  if (form.maxTickets <= 0) return { error: "Max tickets must be greater than 0", tab: "prize" };
  if (!form.drawDate) return { error: "Draw date is required", tab: "prize" };
  return null;
}
