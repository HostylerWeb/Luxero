"use client";

import { useWinners } from "@luxero/api-client";

import { ArrowRight, Calendar, List, MapPin, Ticket, Trophy } from "@luxero/icons";
import type { Winner } from "@luxero/types";
import { cn, formatDate, getDisplayName, withAssetCacheVersion } from "@luxero/utils";
import { useEffect, useRef, useState } from "react";
import { useData } from "vike-react/useData";
import { GoldOutlineButton } from "@/components/buttons";
import { Link } from "@/components/Link";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber, useTranslation } from "@/lib/i18n";
import { CompetitionEntryListDialog } from "@/components/winners/CompetitionEntryListDialog";
import { Button } from "@/components/ui/button";
import type { Data } from "./+data";

type EntryDialogState = {
  competitionId: string;
  competitionTitle: string;
  highlightTicketNumbers: number[];
  winnerDisplayName: string;
};

function getCompetitionIdObject(winner: Winner) {
  return typeof winner.competitionId === "object" && winner.competitionId !== null
    ? winner.competitionId
    : null;
}

function getCompetitionTitle(winner: Winner): string {
  const comp = getCompetitionIdObject(winner);
  if (comp?.title) return comp.title;
  return winner.competitionTitle ?? winner.competition?.title ?? "";
}

function getWinnerCompetitionId(winner: Winner): string | null {
  if (typeof winner.competitionId === "string" && winner.competitionId.trim()) {
    return winner.competitionId.trim();
  }
  const comp = getCompetitionIdObject(winner);
  if (comp?._id) return comp._id;
  return null;
}

type PopulatedWinnerUser = {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatarUrl?: string;
};

function getPopulatedWinnerUser(winner: Winner): PopulatedWinnerUser | null {
  const userId = winner.userId as string | PopulatedWinnerUser;
  if (typeof userId === "object" && userId !== null) {
    return userId;
  }
  return null;
}

function getCompetitionImageForWinner(winner: Winner): string | undefined {
  const comp = getCompetitionIdObject(winner);
  return (
    winner.prizeImageUrl?.trim() ||
    comp?.prizeImageUrl?.trim() ||
    comp?.imageUrl?.trim() ||
    winner.competition?.prizeImageUrl?.trim() ||
    winner.competition?.imageUrl?.trim() ||
    undefined
  );
}

function WinnerAvatar({ winner, className }: { winner: Winner; className?: string }) {
  const userObj = getPopulatedWinnerUser(winner);
  const profileRaw = winner.avatarUrl?.trim() || userObj?.avatarUrl?.trim();
  const competitionRaw = getCompetitionImageForWinner(winner);

  const src = profileRaw
    ? withAssetCacheVersion(profileRaw)
    : competitionRaw
      ? withAssetCacheVersion(competitionRaw)
      : undefined;

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-br from-gold/20 to-gold/5",
        className
      )}
    >
      {src ? (
        <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <Trophy className="h-6 w-6 text-gold/50 sm:h-7 sm:w-7" />
      )}
    </div>
  );
}

function WinnerCard({
  winner,
  featured = false,
  onSeeEntries,
}: {
  winner: Winner;
  featured?: boolean;
  onSeeEntries?: () => void;
}) {
  const { t, locale } = useTranslation();
  const userObj = getPopulatedWinnerUser(winner);
  const displayName =
    winner.displayName ||
    getDisplayName(
      {
        firstName: userObj?.firstName ?? undefined,
        lastName: userObj?.lastName ?? undefined,
      },
      userObj?.email ?? ""
    ) ||
    t("staticPages.winners.anonymousWinner");
  const competitionTitle = getCompetitionTitle(winner);
  const drawnDate = formatDate(winner.drawnAt);
  const competitionId = getWinnerCompetitionId(winner);
  const showEntriesButton = Boolean(competitionId && onSeeEntries);

  return (
    <article className="group relative overflow-hidden rounded-[1.5rem] transition-transform duration-300 hover:-translate-y-0.5">
      <div
        className={cn(
          "rounded-[1.5rem] p-1.5 ring-1 transition-colors duration-500",
          featured ? "bg-gold/10 ring-gold/25" : "bg-white/5 ring-white/10 hover:ring-gold/25"
        )}
      >
        <div className="overflow-hidden rounded-[calc(1.5rem-0.375rem)] bg-card">
          <div className="flex flex-col p-4 sm:p-5 lg:p-6">
            <div className="mb-4 flex items-center gap-3">
              <WinnerAvatar winner={winner} className="h-12 w-12 sm:h-14 sm:w-14" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-bold text-foreground sm:text-xl md:text-2xl">
                  {displayName}
                </p>
                {winner.location ? (
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground sm:text-sm">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{winner.location}</span>
                  </p>
                ) : null}
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-gold/10 bg-gradient-to-br from-gold/5 to-transparent p-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("staticPages.winners.prizeWon")}
                </p>
                <p className="mt-1 text-base font-semibold leading-snug text-foreground sm:text-lg">
                  {winner.prizeTitle || competitionTitle || t("staticPages.winners.luxuryPrize")}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground sm:text-sm">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 shrink-0 text-gold/80" />
                  {drawnDate}
                </span>
                {winner.ticketNumber > 0 ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Ticket className="h-3.5 w-3.5 shrink-0 text-gold/80" />
                    {t("staticPages.winners.ticketNumber")}
                    {formatNumber(winner.ticketNumber, locale)}
                  </span>
                ) : null}
              </div>
            </div>

            {winner.testimonial ? (
              <blockquote className="mt-4 border-l-2 border-gold/30 pl-4 text-sm italic leading-relaxed text-muted-foreground sm:text-base">
                &ldquo;{winner.testimonial}&rdquo;
              </blockquote>
            ) : null}

            {showEntriesButton ? (
              <div className="mt-4">
                <Button
                  type="button"
                  variant="gold"
                  size="sm"
                  className="w-full"
                  onClick={onSeeEntries}
                  data-umami-event="winners:see-entries"
                  data-umami-event-competition={competitionId ?? undefined}
                >
                  <List className="mr-2 h-4 w-4" />
                  {t("staticPages.winners.seeEntries")}
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function WinnersEmptyState() {
  const { t } = useTranslation();
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-gold/15 bg-gradient-to-br from-gold/5 via-card to-card px-6 py-14 text-center sm:px-10 sm:py-16">
      <div className="pointer-events-none absolute -left-16 top-0 h-48 w-48 rounded-full bg-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-48 w-48 rounded-full bg-gold/10 blur-3xl" />

      <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-gold/20 bg-card">
        <Trophy className="h-10 w-10 text-gold/70" />
      </div>

      <h2 className="relative text-2xl font-bold text-foreground sm:text-3xl">
        {t("staticPages.winners.winnersComing")}
      </h2>
      <p className="relative mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        {t("staticPages.winners.winnersComingDesc")}
      </p>

      <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <GoldOutlineButton asChild size="lg">
          <Link href="/competitions" data-umami-event="winners:browse-competitions">
            {t("staticPages.winners.browseLiveComps")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </GoldOutlineButton>
        <GoldOutlineButton asChild size="lg">
          <Link href="/auth/sign-up" data-umami-event="winners:create-account">
            {t("staticPages.winners.createFreeAccount")}
          </Link>
        </GoldOutlineButton>
      </div>
    </div>
  );
}

export default function Page() {
  const { t, locale } = useTranslation();
  const data = useData<Data>();

  const {
    data: winnersResponse,
    isLoading,
    isError: winnersError,
    refetch: refetchWinners,
  } = useWinners(50, { initialData: { data: data?.winners ?? [] } });
  const winners = winnersResponse?.data ?? [];

  const [entryDialog, setEntryDialog] = useState<EntryDialogState | null>(null);
  const consumedEntriesQuery = useRef(false);

  function openEntryDialog(winner: Winner) {
    const competitionId = getWinnerCompetitionId(winner);
    if (!competitionId) return;
    const userObj = getPopulatedWinnerUser(winner);
    const displayName =
      winner.displayName ||
      getDisplayName(
        {
          firstName: userObj?.firstName ?? undefined,
          lastName: userObj?.lastName ?? undefined,
        },
        userObj?.email ?? ""
      ) ||
      t("staticPages.winners.anonymousWinner");
    setEntryDialog({
      competitionId,
      competitionTitle: getCompetitionTitle(winner),
      highlightTicketNumbers: winner.ticketNumber > 0 ? [winner.ticketNumber] : [],
      winnerDisplayName: displayName,
    });
  }

  useEffect(() => {
    if (consumedEntriesQuery.current || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const entriesCompId = params.get("entries")?.trim();
    if (!entriesCompId) {
      consumedEntriesQuery.current = true;
      return;
    }
    if (isLoading) return;

    consumedEntriesQuery.current = true;
    params.delete("entries");
    const nextSearch = params.toString();
    const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}`;
    window.history.replaceState({}, "", nextUrl);

    const match = winners.find((w) => getWinnerCompetitionId(w) === entriesCompId);
    if (match) {
      openEntryDialog(match);
      return;
    }

    setEntryDialog({
      competitionId: entriesCompId,
      competitionTitle: t("staticPages.entries.heading"),
      highlightTicketNumbers: [],
      winnerDisplayName: "",
    });
  }, [isLoading, winners, t]);

  const hasError = winnersError;
  const hasWinnerData = winners.length > 0;
  const showHero = !isLoading && hasWinnerData;

  return (
    <div className="luxero-container-wide pb-10 animate-fade-in">
      {showHero ? (
        <section className="relative overflow-hidden py-8 sm:py-12 lg:py-16">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-gold/10 to-transparent" />

          <div className="relative text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {t("staticPages.winners.heading")}{" "}
              <span className="text-gold">{t("staticPages.winners.subheading")}</span>
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-lg">
              {t("staticPages.winners.heroDesc")}
            </p>
          </div>
        </section>
      ) : null}

      {hasError && (
        <div className="mb-10 text-center">
          <p className="text-muted-foreground">{t("staticPages.winners.unableToLoad")}</p>
          <button
            type="button"
            onClick={() => {
              refetchWinners();
            }}
            data-umami-event="winners:retry"
            className="mt-2 text-xs text-muted-foreground/60 hover:text-gold transition-colors"
          >
            {t("common.tapToRetry")}
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="mb-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-72 rounded-[1.5rem]" shimmer />
          ))}
        </div>
      ) : winners.length > 0 ? (
        <div className="mb-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 animate-fade-in-stagger">
          {winners.map((winner, index) => (
            <WinnerCard
              key={winner._id}
              winner={winner}
              featured={index === 0}
              onSeeEntries={() => openEntryDialog(winner)}
            />
          ))}
        </div>
      ) : !hasError ? (
        <div className={cn("mb-12", !showHero && "pt-8 sm:pt-10")}>
          <WinnersEmptyState />
        </div>
      ) : null}

      <section className="relative overflow-hidden rounded-[2rem]">
        <div className="rounded-[2rem] bg-gradient-to-r from-gold/5 to-gold/10 p-1.5 ring-1 ring-gold/20">
          <div className="rounded-[calc(2rem-0.375rem)] bg-card px-6 py-10 text-center sm:px-12 sm:py-12">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              {t("staticPages.winners.couldYouBeNext")}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
              {t("staticPages.winners.couldYouBeNextDesc")}
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <GoldOutlineButton asChild size="lg">
                <Link href="/competitions">
                  {t("staticPages.winners.viewLiveComps")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </GoldOutlineButton>
              <GoldOutlineButton asChild size="lg">
                <Link href="/auth/sign-up">{t("staticPages.winners.signUpFree")}</Link>
              </GoldOutlineButton>
            </div>
          </div>
        </div>
      </section>

      <CompetitionEntryListDialog
        open={entryDialog != null}
        onOpenChange={(open) => {
          if (!open) setEntryDialog(null);
        }}
        competitionId={entryDialog?.competitionId ?? ""}
        competitionTitle={entryDialog?.competitionTitle ?? ""}
        highlightTicketNumbers={entryDialog?.highlightTicketNumbers ?? []}
        winnerDisplayName={entryDialog?.winnerDisplayName}
      />
    </div>
  );
}
