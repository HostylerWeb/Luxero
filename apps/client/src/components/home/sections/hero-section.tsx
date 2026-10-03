import type { Competition } from "@luxero/types";
import { HeroSlider } from "../HeroSlider";

export function HeroSection({ competitions }: { competitions: Competition[] }) {
  return <HeroSlider competitions={competitions} />;
}
