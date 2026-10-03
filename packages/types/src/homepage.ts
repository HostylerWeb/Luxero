export type HomepageSectionId =
  | "hero"
  | "ending_soon"
  | "categories"
  | "winners"
  | "built_different"
  | "cta";

export interface HomepageSectionConfig {
  id: HomepageSectionId;
  enabled: boolean;
}

export interface HomepageLayoutSettings {
  _id: "homepage_layout_settings";
  sections: HomepageSectionConfig[];
}

export const DEFAULT_HOMEPAGE_SECTIONS: HomepageSectionConfig[] = [
  { id: "hero", enabled: true },
  { id: "ending_soon", enabled: true },
  { id: "categories", enabled: true },
  { id: "winners", enabled: true },
  { id: "built_different", enabled: true },
  { id: "cta", enabled: true },
];
