"use client";
import { useEffect, useRef, useState } from "react";

interface CompetitionUpdateEvent {
  competitionId: string;
  slug: string;
  ticketsSold: number;
  ticketsHeld: number;
  maxTickets: number;
  available: number;
}

export function useCompetitionStream(competitionId: string | undefined): {
  liveAvailable: number | null;
} {
  const [liveAvailable, setLiveAvailable] = useState<number | null>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!competitionId) return;
    if (esRef.current) return;

    const es = new EventSource("/api/competitions/stream", { withCredentials: true });
    esRef.current = es;

    es.addEventListener("competition-update", (e: Event) => {
      try {
        const data = JSON.parse((e as MessageEvent).data) as CompetitionUpdateEvent;
        if (data.competitionId === competitionId) {
          setLiveAvailable(data.available);
        }
      } catch {
        // ignore parse errors
      }
    });

    es.onerror = () => {
      es.close();
      esRef.current = null;
    };

    return () => {
      es.close();
      esRef.current = null;
      setLiveAvailable(null);
    };
  }, [competitionId]);

  return { liveAvailable };
}
