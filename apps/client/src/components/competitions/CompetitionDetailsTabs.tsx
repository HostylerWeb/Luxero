"use client";

import type { RefObject } from "react";
import type { PublicBonusAwardEntry, PublicBonusAwardWinDTO } from "@luxero/types";
import { BonusAwardsSection } from "@/components/competitions/bonus-awards";
import { InstantWinsSection } from "@/components/competitions/instant-wins";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type CompetitionDetailsTab = "description" | "instant-wins" | "milestones";

interface CompetitionDetailsTabsProps {
  description: string;
  competitionId: string;
  bonusAwards: PublicBonusAwardEntry[];
  bonusAwardWins: PublicBonusAwardWinDTO[];
  soldTickets: number;
  maxTickets: number;
  instantPrizesLoading: boolean;
  hasInstantPrizes: boolean;
  value: CompetitionDetailsTab;
  onValueChange: (value: CompetitionDetailsTab) => void;
  sectionRef?: RefObject<HTMLDivElement | null>;
}

const tabTriggerClass =
  "h-10 rounded-lg border border-transparent px-2 text-xs font-semibold sm:px-3 sm:text-sm data-[state=active]:border-gold/40 data-[state=active]:bg-gold/15 data-[state=active]:text-gold data-[state=active]:shadow-none";

export function CompetitionDetailsTabs({
  description,
  competitionId,
  bonusAwards,
  bonusAwardWins,
  soldTickets,
  maxTickets,
  instantPrizesLoading,
  hasInstantPrizes,
  value,
  onValueChange,
  sectionRef,
}: CompetitionDetailsTabsProps) {
  const { t } = useTranslation();

  const showMilestones = bonusAwards.length > 0 || bonusAwardWins.length > 0;
  const showInstant = instantPrizesLoading || hasInstantPrizes;
  const tabCount = 1 + (showInstant ? 1 : 0) + (showMilestones ? 1 : 0);

  if (tabCount <= 1) {
    return (
      <div ref={sectionRef} id="competition-details-tabs" className="mt-8 scroll-mt-24">
        <div className="relative overflow-hidden rounded-xl lg:rounded-[2rem]">
          <div className="p-1 lg:p-1.5 rounded-xl lg:rounded-[2rem] bg-white/5 ring-1 ring-white/10">
            <div className="rounded-[calc(1.25rem-0.25rem)] lg:rounded-[calc(2rem-0.375rem)] bg-card p-4 lg:p-8">
              <p className="text-sm lg:text-base text-foreground leading-relaxed whitespace-pre-wrap">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={sectionRef} id="competition-details-tabs" className="mt-8 scroll-mt-24">
      <div className="relative overflow-hidden rounded-xl lg:rounded-[2rem]">
        <div className="p-1 lg:p-1.5 rounded-xl lg:rounded-[2rem] bg-white/5 ring-1 ring-white/10">
          <div className="rounded-[calc(1.25rem-0.25rem)] lg:rounded-[calc(2rem-0.375rem)] bg-card p-3 lg:p-6">
            <Tabs
              value={value}
              onValueChange={(v) => onValueChange(v as CompetitionDetailsTab)}
              className="gap-4 lg:gap-5"
            >
              <TabsList
                className={cn(
                  "grid h-auto w-full gap-2 rounded-xl border border-gold/15 bg-muted/40 p-1.5",
                  tabCount === 2 && "grid-cols-2",
                  tabCount === 3 && "grid-cols-3"
                )}
                aria-label={t("competitions.detail.detailsTabsAria")}
              >
                <TabsTrigger
                  value="description"
                  className={tabTriggerClass}
                  data-umami-event="competition:details-tab"
                  data-umami-event-tab="description"
                >
                  {t("competitions.detail.detailsTabDescription")}
                </TabsTrigger>
                {showInstant ? (
                  <TabsTrigger
                    value="instant-wins"
                    className={tabTriggerClass}
                    data-umami-event="competition:details-tab"
                    data-umami-event-tab="instant-wins"
                  >
                    {t("competitions.detail.detailsTabInstantWins")}
                  </TabsTrigger>
                ) : null}
                {showMilestones ? (
                  <TabsTrigger
                    value="milestones"
                    className={tabTriggerClass}
                    data-umami-event="competition:details-tab"
                    data-umami-event-tab="milestones"
                  >
                    {t("competitions.detail.detailsTabMilestones")}
                  </TabsTrigger>
                ) : null}
              </TabsList>

              <TabsContent value="description" className="mt-0">
                <p className="text-sm lg:text-base text-foreground leading-relaxed whitespace-pre-wrap">
                  {description}
                </p>
              </TabsContent>

              {showInstant ? (
                <TabsContent value="instant-wins" id="instant-wins" className="mt-0">
                  {instantPrizesLoading ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {[1, 2].map((i) => (
                          <Skeleton key={i} className="h-32 rounded-xl" shimmer />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <InstantWinsSection competitionId={competitionId} embedded />
                  )}
                </TabsContent>
              ) : null}

              {showMilestones ? (
                <TabsContent value="milestones" id="bonus-draws" className="mt-0">
                  <BonusAwardsSection
                    awards={bonusAwards}
                    wins={bonusAwardWins}
                    ticketsSold={soldTickets}
                    maxTickets={maxTickets}
                    embedded
                  />
                </TabsContent>
              ) : null}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
