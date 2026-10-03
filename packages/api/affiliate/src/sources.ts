export interface TrafficSource {
  code: string;
  name: string;
  landingParamHint: string;
}

export const TRAFFIC_SOURCES: TrafficSource[] = [
  { code: "at", name: "Adsterra", landingParamHint: "?source=at&clickid=##SUB_ID_SHORT(action)##" },
  { code: "fb", name: "Meta / Facebook", landingParamHint: "?source=fb&fbclid={fbclid}" },
  { code: "tt", name: "TikTok", landingParamHint: "?source=tt&ttclid={ttclid}" },
  { code: "gg", name: "Google Ads", landingParamHint: "?source=gg&gclid={gclid}" },
];

export function getTrafficSourceLabel(code: string | null | undefined): string {
  if (!code) return "Direct / unknown";
  return TRAFFIC_SOURCES.find((s) => s.code === code)?.name ?? code;
}
