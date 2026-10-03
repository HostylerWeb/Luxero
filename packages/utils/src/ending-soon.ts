export const DEFAULT_ENDING_SOON_DAYS_THRESHOLD = 7;
export const DEFAULT_ENDING_SOON_TICKETS_THRESHOLD = 20;

import { getAvailableTickets, getMaxTickets, getTicketsSold } from "./competition";

export interface EndingSoonCompetition {
  status: string;
  endDate?: string | Date;
  drawDate?: string | Date;
  maxTickets?: number;
  totalTickets?: number;
  ticketsSold?: number;
  soldTickets?: number;
  ticketsHeld?: number;
  availableTickets?: number;
}

export type EndingSoonCombineMode = "and" | "or";
export type EndingSoonTicketsMetric = "remaining" | "sold";

export interface EndingSoonSettings {
  endingSoonDaysThreshold?: number;
  endingSoonTicketsThreshold?: number;
  endingSoonCombineMode?: EndingSoonCombineMode;
  endingSoonTimeEnabled?: boolean;
  endingSoonTicketsEnabled?: boolean;
  endingSoonTicketsMetric?: EndingSoonTicketsMetric;
}

export interface ResolvedEndingSoonSettings {
  daysThreshold: number;
  ticketsThreshold: number;
  combineMode: EndingSoonCombineMode;
  timeEnabled: boolean;
  ticketsEnabled: boolean;
  ticketsMetric: EndingSoonTicketsMetric;
}

export function getCompetitionEndDate(
  competition: EndingSoonCompetition
): string | Date | undefined {
  return competition.drawDate ?? competition.endDate;
}

export function resolveEndingSoonSettings(
  settings?: EndingSoonSettings | null
): ResolvedEndingSoonSettings {
  return {
    daysThreshold: settings?.endingSoonDaysThreshold ?? DEFAULT_ENDING_SOON_DAYS_THRESHOLD,
    ticketsThreshold: settings?.endingSoonTicketsThreshold ?? DEFAULT_ENDING_SOON_TICKETS_THRESHOLD,
    combineMode: settings?.endingSoonCombineMode ?? "or",
    timeEnabled: settings?.endingSoonTimeEnabled ?? true,
    ticketsEnabled: settings?.endingSoonTicketsEnabled ?? true,
    ticketsMetric: settings?.endingSoonTicketsMetric ?? "remaining",
  };
}

export function isEndingSoonCompetition(
  competition: EndingSoonCompetition,
  settings: ResolvedEndingSoonSettings,
  now = Date.now()
): boolean {
  if (competition.status !== "active") return false;

  const maxTickets = getMaxTickets(competition);
  const ticketsLeft = getAvailableTickets(competition);
  const ticketsSold = getTicketsSold(competition);
  const daysCutoff = now + settings.daysThreshold * 24 * 60 * 60 * 1000;
  const endDate = getCompetitionEndDate(competition);
  const endsWithinDays = endDate ? new Date(endDate).getTime() <= daysCutoff : false;

  const conditions: boolean[] = [];

  if (settings.timeEnabled) {
    conditions.push(endsWithinDays);
  }

  if (settings.ticketsEnabled && maxTickets > 0) {
    const ticketPct =
      settings.ticketsMetric === "sold"
        ? (ticketsSold / maxTickets) * 100
        : (ticketsLeft / maxTickets) * 100;
    const ticketMatch =
      settings.ticketsMetric === "sold"
        ? ticketPct >= settings.ticketsThreshold
        : ticketPct <= settings.ticketsThreshold;
    conditions.push(ticketMatch);
  }

  if (conditions.length === 0) return false;

  return settings.combineMode === "and" ? conditions.every(Boolean) : conditions.some(Boolean);
}

function getDaysLeft(competition: EndingSoonCompetition, now: number): number {
  const endDate = getCompetitionEndDate(competition);
  if (!endDate) return 999;
  return (new Date(endDate).getTime() - now) / (1000 * 60 * 60 * 24);
}

function getTicketUrgencyComponent(
  competition: EndingSoonCompetition,
  settings: ResolvedEndingSoonSettings
): number {
  const maxTickets = getMaxTickets(competition);
  if (maxTickets <= 0 || settings.ticketsThreshold <= 0) return 0;

  if (settings.ticketsMetric === "sold") {
    const soldPct = (getTicketsSold(competition) / maxTickets) * 100;
    return (100 - soldPct) / settings.ticketsThreshold;
  }

  const remainingPct = (getAvailableTickets(competition) / maxTickets) * 100;
  return remainingPct / settings.ticketsThreshold;
}

function getUrgencyScore(
  competition: EndingSoonCompetition,
  settings: ResolvedEndingSoonSettings,
  now: number
): number {
  let score = 0;

  if (settings.timeEnabled && settings.daysThreshold > 0) {
    score += getDaysLeft(competition, now) / settings.daysThreshold;
  }

  if (settings.ticketsEnabled) {
    score += getTicketUrgencyComponent(competition, settings);
  }

  return score;
}

export function compareEndingSoonUrgency(
  a: EndingSoonCompetition,
  b: EndingSoonCompetition,
  settings: ResolvedEndingSoonSettings,
  now = Date.now()
): number {
  return getUrgencyScore(a, settings, now) - getUrgencyScore(b, settings, now);
}

export function filterEndingSoonCompetitions<T extends EndingSoonCompetition>(
  competitions: T[],
  settings?: EndingSoonSettings | null,
  options?: { now?: number; limit?: number }
): T[] {
  const resolved = resolveEndingSoonSettings(settings);
  const now = options?.now ?? Date.now();
  const filtered = competitions
    .filter((c) => isEndingSoonCompetition(c, resolved, now))
    .sort((a, b) => compareEndingSoonUrgency(a, b, resolved, now));

  return options?.limit !== undefined ? filtered.slice(0, options.limit) : filtered;
}
