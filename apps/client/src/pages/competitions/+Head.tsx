import { translate } from "@/lib/i18n";

export function Head() {
  return <meta name="description" content={translate("competitions.listing.description")} />;
}
