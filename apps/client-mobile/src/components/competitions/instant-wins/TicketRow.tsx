"use client";

import { TicketCard } from "@/components/shared/TicketCard";
import { PRIZE_TICKET_CARD_WIDTH } from "@/components/shared/ticketCardShared";
import { buildTicketCards, ROW_GAP, ROW_HEIGHT, TICKET_COL_GAP } from "./index";
import type { TicketRowProps } from "./types";

interface TicketRowComponentProps extends TicketRowProps {
  index: number;
  style: React.CSSProperties;
  ticketsPerRow?: number;
  ticketWidth?: number;
}

export function TicketRow({
  index,
  style,
  prize,
  ticketsPerRow = 3,
  ticketWidth = PRIZE_TICKET_CARD_WIDTH,
}: TicketRowComponentProps) {
  const startPosition = index * ticketsPerRow;
  const cards = buildTicketCards(prize, ticketsPerRow, startPosition);

  return (
    <div
      style={{
        ...style,
        height: ROW_HEIGHT,
        marginTop: index > 0 ? ROW_GAP : 0,
        display: "flex",
        justifyContent: "flex-start",
        gap: TICKET_COL_GAP,
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        paddingLeft: TICKET_COL_GAP,
        paddingRight: TICKET_COL_GAP,
      }}
    >
      {cards.map(({ ticketNumber, state, winnerName, position }) => (
        <div
          key={ticketNumber}
          className="w-[125px] min-[400px]:w-[150px] lg:w-[170px]"
          style={{ width: ticketWidth, flexShrink: 0 }}
        >
          <TicketCard
            variant="prize"
            ticketNumber={ticketNumber}
            state={state}
            winnerName={winnerName}
            prizeTitle={prize.instantPrize.title}
            linkedCompetitionTitle={
              prize.instantPrize.type === "competition_ticket"
                ? prize.instantPrize.linkedCompetition?.title
                : undefined
            }
            linkedCompetitionSlug={
              prize.instantPrize.type === "competition_ticket"
                ? prize.instantPrize.linkedCompetition?.slug
                : undefined
            }
            linkedCompetitionId={
              prize.instantPrize.type === "competition_ticket"
                ? (prize.instantPrize.linkedCompetitionId ??
                  prize.instantPrize.linkedCompetition?.id)
                : undefined
            }
            position={position}
            explicitHeight={ROW_HEIGHT}
          />
        </div>
      ))}
      {Array.from({ length: ticketsPerRow - cards.length }).map((_, i) => (
        <div key={`empty-${i}`} />
      ))}
    </div>
  );
}
