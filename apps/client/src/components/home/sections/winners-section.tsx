import type { Winner } from "@luxero/types";
import { takeRecentWinners } from "@/lib/home-winners";
import { WinnersShowcase } from "../WinnersShowcase";

export function WinnersSection({ winners }: { winners: Winner[] }) {
  return <WinnersShowcase winners={takeRecentWinners(winners)} />;
}
