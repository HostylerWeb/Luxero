"use client";

import { useEffect, useState } from "react";
import { getTicketListViewportCap } from "./ticketCardShared";

export function useTicketListViewportHeight(): number {
  const [cap, setCap] = useState(() => getTicketListViewportCap());

  useEffect(() => {
    const update = () => setCap(getTicketListViewportCap(window.innerHeight));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return cap;
}
