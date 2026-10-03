/**
 * Static map of admin paths to display metadata for breadcrumbs.
 * Dynamic / detail pages override via a `BreadcrumbsOverride` slot in the page.
 */

export interface PageMetaEntry {
  title: string;
  parent?: string;
  group?: string;
}

export const pageMeta: Record<string, PageMetaEntry> = {
  "/": { title: "Dashboard" },

  "/competitions": { title: "Competitions", group: "Catalogue" },
  "/instant-prizes": { title: "Instant Prizes", group: "Catalogue" },
  "/bonus-awards": { title: "Bonus Awards", group: "Catalogue" },
  "/categories": { title: "Categories", group: "Catalogue" },

  "/shop/products": { title: "Products", group: "Shop" },
  "/shop/categories": { title: "Shop Categories", group: "Shop" },
  "/shop/orders": { title: "Shop Orders", group: "Shop" },

  "/orders": { title: "Orders", group: "Sales" },
  "/promo-codes": { title: "Promo Codes", group: "Sales" },

  "/users": { title: "Users", group: "People" },
  "/referrals": { title: "Referrals", group: "People" },
  "/referrals/network": { title: "Referral Network", parent: "/referrals", group: "People" },

  "/winners": { title: "Winners", group: "Fulfilment" },
  "/instant-prize-wins": { title: "Instant Prize Wins", group: "Fulfilment" },
  "/bonus-awards/wins": { title: "Bonus Award Wins", parent: "/bonus-awards", group: "Fulfilment" },
  "/bonus-awards/fires": { title: "Bonus Award Fires", parent: "/bonus-awards", group: "Fulfilment" },

  "/media": { title: "Media Library", group: "Library" },

  "/livestream/draws": { title: "Livestream Draws", group: "Livestream" },
  "/livestream/draws/full": {
    title: "Draw Studio",
    parent: "/livestream/draws",
    group: "Livestream",
  },

  "/payment-methods": { title: "Payment Methods", group: "Configuration" },
  "/homepage-layout": { title: "Homepage Layout", group: "Configuration" },
  "/compliance-settings": { title: "Compliance", group: "Configuration" },
  "/email-settings": { title: "Email Settings", group: "Configuration" },
  "/notifications": { title: "Notifications", group: "Configuration" },
  "/notifications/subscriptions": { title: "Push Subscriptions", group: "Configuration" },
  "/seo-settings": { title: "SEO Settings", group: "Configuration" },
  "/conversion-tracking": { title: "Conversion Tracking", group: "Configuration" },

  "/auth/access-denied": { title: "Access Denied" },
  "/sentry-debug": { title: "Sentry Debug" },
};
