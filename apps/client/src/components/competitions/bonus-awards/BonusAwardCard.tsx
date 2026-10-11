"use client";

import type { PublicBonusAwardEntry, PublicBonusAwardWinDTO } from "@luxero/types";
import { cn, formatTicketNumber } from "@luxero/utils";
import { CheckIcon, Star } from "lucide-react";
import { CORNER_BADGE_CLASS, TICKET_CARD_SHELL_CLASS } from "@/components/shared/ticketCardShared";
import { formatCurrency, formatNumber, useTranslation } from "@/lib/i18n";

const BONUS_CARD_HEIGHT = 132;

interface BonusAwardCardProps {
  award: PublicBonusAwardEntry;
  wins: PublicBonusAwardWinDTO[];
  ticketsToGo: number;
  isNext?: boolean;
}

export function BonusAwardCard({ award, wins, ticketsToGo, isNext = false }: BonusAwardCardProps) {
  const { t, locale } = useTranslation();
  const isWon = wins.length > 0;
  const isReached = isWon || !!award.assignment.firedAt;
  const firstWin = wins[0];
  const milestonePct = award.assignment.milestonePct;
  const value = award.bonusAward.value;

  const prizeLabel =
    value != null && value > 0
      ? t("competitions.bonusAwards.cashPrize", { value: formatCurrency(value, locale) })
      : award.bonusAward.title;

  const winnerName = isWon ? (firstWin!.displayName ?? t("competitions.bonusAwards.winner")) : null;

  const statusLine = isWon
    ? winnerName
    : isNext
      ? ticketsToGo === 1
        ? t("competitions.bonusAwards.ticketsToGoOne")
        : t("competitions.bonusAwards.ticketsToGo", { count: formatNumber(ticketsToGo, locale) })
      : isReached
        ? t("competitions.bonusAwards.milestoneComplete")
        : ticketsToGo === 1
          ? t("competitions.bonusAwards.ticketsToGoOne")
          : t("competitions.bonusAwards.ticketsToGo", { count: formatNumber(ticketsToGo, locale) });

  const badge = isWon ? (
    <span
      className={cn(
        CORNER_BADGE_CLASS,
        "h-6 min-h-6 text-[10px] [&>svg]:size-3",
        "bg-gold text-black flex items-center justify-center gap-0.5"
      )}
    >
      <CheckIcon className="size-3" />
      {t("competitions.bonusAwards.reached")}
    </span>
  ) : (
    <span
      className={cn(
        CORNER_BADGE_CLASS,
        "h-6 min-h-6 text-[10px] [&>svg]:size-3",
        "flex items-center justify-center gap-1",
        isNext
          ? "bg-gold/90 text-black"
          : "bg-white/10 text-white/90 border-b border-white/15"
      )}
    >
      <Star className={cn("size-3", isNext ? "text-black fill-black" : "text-gold fill-gold")} />
      {t("competitions.bonusAwards.milestonePct", { percent: milestonePct })}
    </span>
  );

  return (
    <div
      className={cn(
        TICKET_CARD_SHELL_CLASS,
        "pt-8 pb-3 justify-between gap-1.5",
        isWon
          ? "border-gold/35 bg-card shadow-[0_0_0_1px_rgba(201,168,76,0.15)]"
          : isNext
            ? "border-gold/40 bg-gold/5 ring-1 ring-gold/25"
            : "border-white/10 bg-white/[0.03] hover:border-white/20",
        !isWon && !isNext && "opacity-95"
      )}
      style={{ minHeight: BONUS_CARD_HEIGHT }}
    >
      <span
        className={cn(
          "w-full px-0.5 text-center text-xs font-medium leading-snug line-clamp-2",
          isWon ? "text-gold/90" : isNext ? "text-gold" : "text-muted-foreground"
        )}
      >
        {statusLine}
      </span>

      <span
        className={cn(
          "w-full px-0.5 text-center font-bold leading-tight line-clamp-2",
          isWon ? "text-gold text-base" : "text-foreground text-sm sm:text-base"
        )}
      >
        {prizeLabel}
      </span>

      {isWon && firstWin ? (
        <span className="w-full text-center text-sm font-bold tabular-nums text-gold">
          #{formatTicketNumber(firstWin.ticketNumber)}
        </span>
      ) : (
        <span className="h-4 w-full" aria-hidden />
      )}

      {badge}
    </div>
  );
}
