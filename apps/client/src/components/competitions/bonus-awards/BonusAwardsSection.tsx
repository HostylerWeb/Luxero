"use client";

import { ChevronDown, Sparkles, Star } from "@luxero/icons";
import type { PublicBonusAwardEntry, PublicBonusAwardWinDTO } from "@luxero/types";
import { useMemo, useState } from "react";
import { GoldOutlineButton } from "@/components/buttons";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatNumber, useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { BonusAwardCard } from "./BonusAwardCard";

const COLLAPSE_AFTER = 10;
const UPCOMING_PREVIEW = 8;

interface BonusAwardsSectionProps {
  awards: PublicBonusAwardEntry[];
  wins: PublicBonusAwardWinDTO[];
  ticketsSold: number;
  maxTickets: number;
}

type EnrichedAward = {
  award: PublicBonusAwardEntry;
  awardWins: PublicBonusAwardWinDTO[];
  milestonePct: number;
  ticketsToGo: number;
  isWon: boolean;
  isReached: boolean;
  prizeLabel: string;
};

export function BonusAwardsSection({
  awards,
  wins,
  ticketsSold,
  maxTickets,
}: BonusAwardsSectionProps) {
  const { t, locale } = useTranslation();
  const [showAll, setShowAll] = useState(false);

  const winsByMilestone = useMemo(() => {
    const map = new Map<number, PublicBonusAwardWinDTO[]>();
    for (const win of wins) {
      const key = win.milestonePct;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(win);
    }
    return map;
  }, [wins]);

  const enriched = useMemo((): EnrichedAward[] => {
    return awards
      .map((award) => {
        const milestonePct = award.assignment.milestonePct;
        const threshold = Math.floor((maxTickets * milestonePct) / 100);
        const ticketsToGo = Math.max(0, threshold - ticketsSold);
        const awardWins = winsByMilestone.get(milestonePct) ?? [];
        const isWon = awardWins.length > 0;
        const isReached = isWon || !!award.assignment.firedAt;
        const value = award.bonusAward.value;
        const prizeLabel =
          value != null && value > 0
            ? t("competitions.bonusAwards.cashPrize", {
                value: formatCurrency(value, locale),
              })
            : award.bonusAward.title;
        return {
          award,
          awardWins,
          milestonePct,
          ticketsToGo,
          isWon,
          isReached,
          prizeLabel,
        };
      })
      .sort((a, b) => a.milestonePct - b.milestonePct);
  }, [awards, winsByMilestone, maxTickets, ticketsSold, t, locale]);

  const totalFired = awards.filter((a) => a.assignment.firedAt).length;
  const totalWon = awards.reduce((s, a) => s + (a.assignment.wonCount ?? 0), 0);
  const soldPct = maxTickets > 0 ? Math.min(100, (ticketsSold / maxTickets) * 100) : 0;

  const nextUpcoming = enriched.find((row) => !row.isReached);
  const nextMilestonePct = nextUpcoming?.milestonePct ?? 100;

  const visibleRows = useMemo(() => {
    if (showAll || enriched.length <= COLLAPSE_AFTER) return enriched;
    const reached = enriched.filter((r) => r.isReached);
    const upcoming = enriched.filter((r) => !r.isReached);
    const preview = upcoming.slice(0, UPCOMING_PREVIEW);
    const ids = new Set([...reached, ...preview].map((r) => r.award.assignment._id));
    return enriched.filter((r) => ids.has(r.award.assignment._id));
  }, [enriched, showAll]);

  if (awards.length === 0 && wins.length === 0) return null;

  return (
    <div className="space-y-5 overflow-x-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-gold/15 bg-gradient-to-r from-gold/5 via-card/80 to-card/80 p-4 sm:p-5">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/15 ring-1 ring-gold/20 sm:h-11 sm:w-11">
            <Star className="h-5 w-5 text-gold" />
          </div>
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-foreground sm:text-xl">
                {t("competitions.bonusAwards.heading")}
              </h3>
              {totalFired > 0 ? (
                <Badge className="border-gold/25 bg-gold/10 text-gold">
                  {t("competitions.bonusAwards.milestoneReached", {
                    count: totalFired,
                  })}
                </Badge>
              ) : null}
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              {awards.length > 0
                ? totalWon > 0
                  ? t("competitions.bonusAwards.awardedSoFar", {
                      count: totalWon,
                    })
                  : t("competitions.bonusAwards.configured", {
                      count: awards.length,
                    })
                : t("competitions.bonusAwards.noBonusDraws")}
            </p>
          </div>
        </div>
        {awards.length > 0 ? (
          <div className="hidden items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-gold/80 sm:flex">
            <Sparkles className="h-3.5 w-3.5" />
            {t("competitions.bonusAwards.autoAwarded")}
          </div>
        ) : null}
      </div>

      {nextUpcoming && maxTickets > 0 ? (
        <div
          className="rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/12 via-card to-card p-5 sm:p-6 space-y-4"
          aria-labelledby="bonus-next-heading"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0 space-y-1">
              <p
                id="bonus-next-heading"
                className="text-xs font-semibold uppercase tracking-wider text-gold"
              >
                {t("competitions.bonusAwards.nextBonusDraw")}
              </p>
              <p className="text-2xl font-bold text-foreground sm:text-3xl">
                {nextUpcoming.prizeLabel}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("competitions.bonusAwards.nextBonusDrawDesc", {
                  percent: nextUpcoming.milestonePct,
                })}
              </p>
            </div>
            <div className="sm:text-right shrink-0">
              <p className="text-3xl font-bold tabular-nums text-gold">
                {formatNumber(nextUpcoming.ticketsToGo, locale)}
              </p>
              <p className="text-xs text-muted-foreground">
                {nextUpcoming.ticketsToGo === 1
                  ? t("competitions.bonusAwards.ticketsToGoOne")
                  : t("competitions.bonusAwards.ticketsToGoLabel")}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {t("competitions.bonusAwards.salesProgressSold", {
                  percent: soldPct.toFixed(1),
                })}
              </span>
              <span>
                {t("competitions.bonusAwards.salesProgressTarget", {
                  percent: nextMilestonePct,
                })}
              </span>
            </div>
            <div className="relative h-2.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-gold/70 to-gold transition-[width] duration-500"
                style={{ width: `${soldPct}%` }}
              />
              <div
                className="absolute top-0 bottom-0 w-1 -translate-x-1/2 rounded-full bg-white/90 shadow-sm"
                style={{ left: `${nextMilestonePct}%` }}
                title={t("competitions.bonusAwards.milestonePct", {
                  percent: nextMilestonePct,
                })}
              />
            </div>
          </div>
        </div>
      ) : null}

      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
        role="list"
        aria-label={t("competitions.bonusAwards.heading")}
      >
        {visibleRows.map((row) => {
          const isNext =
            !!nextUpcoming && row.award.assignment._id === nextUpcoming.award.assignment._id;
          return (
            <div key={row.award.assignment._id} role="listitem" className="min-w-0">
              <BonusAwardCard
                award={row.award}
                wins={row.awardWins}
                ticketsToGo={row.ticketsToGo}
                isNext={isNext && !row.isReached}
              />
            </div>
          );
        })}
      </div>

      {enriched.length > COLLAPSE_AFTER ? (
        <div className="flex justify-center">
          <GoldOutlineButton
            type="button"
            size="sm"
            className="gap-2"
            onClick={() => setShowAll((v) => !v)}
            aria-expanded={showAll}
          >
            {showAll
              ? t("competitions.bonusAwards.showFewer")
              : t("competitions.bonusAwards.showAllMilestones", {
                  count: enriched.length,
                })}
            <ChevronDown className={cn("size-4 transition-transform", showAll && "rotate-180")} />
          </GoldOutlineButton>
        </div>
      ) : null}
    </div>
  );
}
