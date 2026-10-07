import { ArrowRight, Calendar, Sparkles, Trophy } from "@luxero/icons";
import type { Winner } from "@luxero/types";
import { cn, getPublicWinnerImageUrl, withAssetCacheVersion } from "@luxero/utils";
import { useState } from "react";
import { GoldOutlineButton } from "@/components/buttons";
import { Link } from "@/components/Link";
import { LuxeroDialog } from "@/components/luxero-dialog";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, useTranslation } from "@/lib/i18n";
import { formatDate } from "@/lib/utils";

function getCompetitionTitle(w: Winner): string {
  if (typeof w.competitionId === "object" && w.competitionId !== null) {
    return w.competitionId.title ?? "";
  }
  return w.competitionTitle ?? w.competition?.title ?? "";
}

function getWinnerImage(w: Winner): string | undefined {
  return getPublicWinnerImageUrl(w);
}

type MappedWinner = {
  id: string;
  name: string;
  initials: string;
  prize: string;
  prizeValue: number;
  imageUrl: string | undefined;
  profileAvatarUrl: string | undefined;
  testimonial?: string;
  competitionTitle: string;
  winDate: string;
};

function WinnerThumb({
  winner,
  failedImages,
  onFail,
  onOpen,
  t,
  locale,
}: {
  winner: MappedWinner;
  failedImages: Set<string>;
  onFail: (id: string) => void;
  onOpen: (id: string) => void;
  t: ReturnType<typeof useTranslation>["t"];
  locale: string;
}) {
  const hasImage = winner.imageUrl && !failedImages.has(winner.id);

  return (
    <button
      type="button"
      onClick={() => onOpen(winner.id)}
      aria-label={t("home.winners.viewImage", { name: winner.name })}
      data-umami-event="home:winners-thumbnail-click"
      data-umami-event-winner={winner.id}
      className="group relative shrink-0 snap-start cursor-pointer text-left w-[7.25rem] sm:w-[8.5rem] md:w-auto"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-gold/15 bg-card shadow-sm transition-colors duration-300 hover:border-gold/35 md:aspect-square md:rounded-2xl">
        {hasImage ? (
          <img
            src={winner.imageUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 120px, 20vw"
            loading="lazy"
            onError={() => onFail(winner.id)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gold/15 to-gold/5">
            <Trophy className="h-8 w-8 text-gold/40 md:h-10 md:w-10" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-2 pt-8 md:hidden">
          <p className="truncate text-[11px] font-semibold text-white">{winner.name}</p>
        </div>
        {winner.prizeValue > 0 ? (
          <div className="absolute right-1.5 top-1.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-gold backdrop-blur-sm md:right-2 md:top-2 md:px-2 md:text-xs">
            {formatCurrency(winner.prizeValue, locale)}
          </div>
        ) : null}
        <div className="absolute inset-0 hidden items-end bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:flex">
          <div className="text-white">
            <p className="text-sm font-semibold">{winner.name}</p>
            <p className="line-clamp-2 text-xs text-gray-300">{winner.competitionTitle}</p>
          </div>
        </div>
      </div>
    </button>
  );
}

function FeaturedWinnerCard({
  winner,
  failedImages,
  failedProfileAvatars,
  onFail,
  onProfileAvatarFail,
  onOpen,
  t,
  locale,
}: {
  winner: MappedWinner;
  failedImages: Set<string>;
  failedProfileAvatars: Set<string>;
  onFail: (id: string) => void;
  onProfileAvatarFail: (id: string) => void;
  onOpen: (id: string) => void;
  t: ReturnType<typeof useTranslation>["t"];
  locale: string;
}) {
  const hasPrizeImage = winner.imageUrl && !failedImages.has(winner.id);
  const hasProfileAvatar =
    winner.profileAvatarUrl && !failedProfileAvatars.has(winner.id);
  const prizeValueLabel =
    winner.prizeValue > 0 ? formatCurrency(winner.prizeValue, locale) : null;
  const drawnLabel = t("home.winners.wonOn", { date: formatDate(winner.winDate) });

  return (
    <article className="group mb-8 sm:mb-10 md:mb-12">
      <div className="rounded-2xl p-px ring-1 ring-gold/20 bg-gradient-to-br from-gold/15 via-gold/5 to-transparent shadow-lg shadow-gold/5">
        <div className="overflow-hidden rounded-[calc(1rem-1px)] bg-card">
          <div className="grid md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <button
              type="button"
              onClick={() => onOpen(winner.id)}
              aria-label={t("home.winners.viewImage", { name: winner.name })}
              data-umami-event="home:winners-featured-click"
              className="relative min-h-[9.5rem] cursor-zoom-in overflow-hidden bg-gradient-to-br from-gold/10 to-background text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold/60 sm:min-h-[11rem] md:min-h-[15rem]"
            >
              {hasPrizeImage ? (
                <img
                  src={winner.imageUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  loading="eager"
                  onError={() => onFail(winner.id)}
                />
              ) : (
                <div className="flex h-full min-h-[inherit] items-center justify-center">
                  <Trophy className="h-14 w-14 text-gold/35" />
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/10 md:bg-gradient-to-r md:from-black/50 md:via-transparent md:to-transparent" />
              <Badge className="absolute left-3 top-3 z-10 border-0 bg-gold text-primary-foreground shadow-md">
                <Sparkles className="mr-1 h-3 w-3" />
                {t("home.winners.latestWinner")}
              </Badge>
              {prizeValueLabel ? (
                <div className="absolute bottom-3 left-3 rounded-full border border-gold/35 bg-black/55 px-2.5 py-1 text-xs font-bold text-gold backdrop-blur-sm sm:text-sm">
                  {prizeValueLabel}
                </div>
              ) : null}
            </button>

            <div className="flex flex-col justify-center gap-3 p-4 sm:p-5 md:gap-4 md:p-6 lg:p-8">
              <div className="flex items-center gap-3">
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-gold/25 bg-gold/10 sm:h-12 sm:w-12">
                  {hasProfileAvatar ? (
                    <img
                      src={winner.profileAvatarUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={() => onProfileAvatarFail(winner.id)}
                    />
                  ) : hasPrizeImage ? (
                    <img src={winner.imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-sm font-bold text-gold">
                      {winner.initials}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-sans text-base font-bold text-foreground sm:text-lg md:text-xl">
                    {winner.name}
                  </h3>
                  {winner.competitionTitle ? (
                    <p className="truncate text-xs text-muted-foreground sm:text-sm">
                      {winner.competitionTitle}
                    </p>
                  ) : null}
                </div>
                <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold sm:flex">
                  <Trophy className="h-4 w-4 text-primary-foreground" />
                </div>
              </div>

              <div className="rounded-xl border border-gold/10 bg-gradient-to-br from-gold/[0.07] to-transparent px-3 py-2.5 sm:px-4 sm:py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">
                  {t("home.winners.prizeLabel")}
                </p>
                <p className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-foreground sm:text-base md:text-lg">
                  {winner.prize}
                </p>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
                  <Calendar className="h-3.5 w-3.5 shrink-0 text-gold/80" />
                  {drawnLabel}
                </p>
              </div>

              {winner.testimonial ? (
                <blockquote className="line-clamp-2 border-l-2 border-gold/30 pl-3 text-xs italic leading-relaxed text-muted-foreground sm:line-clamp-3 sm:text-sm md:text-[0.9375rem]">
                  &ldquo;{winner.testimonial}&rdquo;
                </blockquote>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export function WinnersShowcase({ winners: winnersRaw }: { winners: Winner[] }) {
  const { t, locale } = useTranslation();
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [failedProfileAvatars, setFailedProfileAvatars] = useState<Set<string>>(new Set());
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);

  function mapWinner(w: Winner): MappedWinner {
    const name = w.displayName || t("home.winners.anonymousWinner");
    const profileRaw = w.avatarUrl?.trim();
    return {
      id: w._id || w.id || "",
      name,
      initials: name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
      prize: w.prizeTitle || t("home.winners.luxuryPrize"),
      prizeValue: w.prizeValue || 0,
      imageUrl: getWinnerImage(w),
      profileAvatarUrl: profileRaw ? withAssetCacheVersion(profileRaw) : undefined,
      testimonial: w.testimonial,
      competitionTitle: getCompetitionTitle(w),
      winDate: w.drawnAt || new Date().toISOString(),
    };
  }

  const winners = winnersRaw.map(mapWinner);

  function openLightbox(winnerId: string) {
    const winner = winners.find((w) => w.id === winnerId);
    if (!winner?.imageUrl) return;
    setLightboxImages([winner.imageUrl]);
    setLightboxOpen(true);
  }

  function markImageFailed(id: string) {
    setFailedImages((prev) => new Set(prev).add(id));
  }

  function markProfileAvatarFailed(id: string) {
    setFailedProfileAvatars((prev) => new Set(prev).add(id));
  }

  if (winners.length === 0) return null;

  const featuredWinner = winners[0];
  if (!featuredWinner) return null;
  const otherWinners = winners.slice(1, 6);

  return (
    <section className="relative overflow-hidden border-y border-gold/10 bg-gradient-to-br from-gold/5 via-background to-gold/5 py-10 sm:py-16 md:py-20 lg:py-24">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-0 left-1/4 h-72 w-72 rounded-full bg-gold/10 blur-3xl sm:h-96 sm:w-96" />
      <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-gold/10 blur-3xl sm:h-96 sm:w-96" />

      <div className="luxero-container-wide relative z-10">
        <div className="mb-8 text-center sm:mb-10 md:mb-12">
          <div className="mb-3 flex items-center justify-center gap-2 sm:mb-4 sm:gap-3">
            <Trophy className="h-6 w-6 text-gold sm:h-8 sm:w-8" />
            <h2 className="font-sans text-2xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              <span className="text-gold">{t("home.winners.heading")}</span>
            </h2>
            <Sparkles className="h-5 w-5 text-gold/60 sm:h-6 sm:w-6" />
          </div>
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground sm:text-lg">
            {t("home.winners.subtitle")}
          </p>
        </div>

        <FeaturedWinnerCard
          winner={featuredWinner}
          failedImages={failedImages}
          failedProfileAvatars={failedProfileAvatars}
          onFail={markImageFailed}
          onProfileAvatarFail={markProfileAvatarFailed}
          onOpen={openLightbox}
          t={t}
          locale={locale}
        />

        {otherWinners.length > 0 ? (
          <div className="mb-8 sm:mb-10">
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:mb-4 md:text-left">
              {t("home.winners.recentWinners")}
            </p>
            <div
              className={cn(
                "-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 snap-x snap-mandatory scrollbar-thin md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-5 xl:grid-cols-5"
              )}
            >
              {otherWinners.map((winner) => (
                <WinnerThumb
                  key={winner.id}
                  winner={winner}
                  failedImages={failedImages}
                  onFail={markImageFailed}
                  onOpen={openLightbox}
                  t={t}
                  locale={locale}
                />
              ))}
            </div>
          </div>
        ) : null}

        <div className="text-center">
          <GoldOutlineButton asChild size="lg">
            <Link href="/winners" data-umami-event="home:winners-view-all">
              {t("home.winners.viewAll")}
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </GoldOutlineButton>
        </div>
      </div>

      <LuxeroDialog
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        mode="fullscreen"
        images={lightboxImages}
        currentIndex={0}
        onIndexChange={() => {}}
      />
    </section>
  );
}
