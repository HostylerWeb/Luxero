import type { Winner } from "@luxero/types";
import { WinnersShowcase } from "../WinnersShowcase";

export function WinnersSection({ winners }: { winners: Winner[] }) {
  return <WinnersShowcase winners={winners} />;
}
