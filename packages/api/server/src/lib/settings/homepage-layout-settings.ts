import { HomepageLayoutSettings } from "@luxero/api-db/models";
import type { IHomepageLayoutSettings } from "@luxero/api-db/models/HomepageLayoutSettings";
import { DEFAULT_HOMEPAGE_SECTIONS } from "@luxero/types";

export const DEFAULT_HOMEPAGE_LAYOUT_SETTINGS: IHomepageLayoutSettings = {
  _id: "homepage_layout_settings",
  sections: DEFAULT_HOMEPAGE_SECTIONS,
};

export async function getHomepageLayoutSettings(): Promise<IHomepageLayoutSettings> {
  const settings = await HomepageLayoutSettings.findById("homepage_layout_settings").lean();
  if (!settings) {
    return DEFAULT_HOMEPAGE_LAYOUT_SETTINGS;
  }
  return {
    ...DEFAULT_HOMEPAGE_LAYOUT_SETTINGS,
    ...settings,
    sections: settings.sections?.length ? settings.sections : DEFAULT_HOMEPAGE_SECTIONS,
  };
}
