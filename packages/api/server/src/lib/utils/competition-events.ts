import { EventEmitter } from "node:events";

export interface CompetitionUpdateEvent {
  competitionId: string;
  slug: string;
  ticketsSold: number;
  ticketsHeld: number;
  maxTickets: number;
  available: number;
}

const bus = new EventEmitter();
bus.setMaxListeners(200);

export function emitCompetitionUpdate(data: CompetitionUpdateEvent): void {
  bus.emit("competition-update", data);
}

export function onCompetitionUpdate(cb: (data: CompetitionUpdateEvent) => void): () => void {
  bus.on("competition-update", cb);
  return () => {
    bus.off("competition-update", cb);
  };
}
