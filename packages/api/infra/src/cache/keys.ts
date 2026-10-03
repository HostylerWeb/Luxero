/**
 * Invalidation channels — type-safe constants for the cache bus.
 *
 * Every admin mutation, background job, and webhook should call
 * `invalidateByChannel(CH.<name>, payload)` AFTER the database write
 * commits. The cache layer fans the channel out to all matching keys.
 *
 * The "user" channel is special: it's parameterized by `userId`.
 * Use `invalidateUser(userId)` for that.
 */
export const CH = {
  competitionAvailability: "competition.availability",
  competitionBuyingPower: "competition.buying-power",
  /** All competitions variants: list, detail, featured, categories, availability */
  competitions: "competitions",
  competitionsAvailabilityBatch: "competitions.availability-batch",
  competitionsBuyingPowerBatch: "competitions.buying-power-batch",
  /** Per-slug competition detail (e.g. `cache:public:pub:competition:abc-iphone:detail`) */
  competitionDetail: "competition.detail",
  /** Featured competitions list */
  competitionFeatured: "competition.featured",
  /** Competition categories list */
  competitionCategories: "competition.categories",
  /** All winners list + stats */
  winners: "winners",
  /** Per-competition winners */
  winnersByCompetition: "winners.by-competition",
  /** Categories list (the public /api/categories endpoint) */
  categories: "categories",
  shopCategories: "shop.categories",
  shopProduct: "shop.product",
  shopProducts: "shop.products",
  /** Singleton homepage layout settings */
  homepageLayoutSettings: "settings.homepage_layout_settings",
  /** Singleton ending-soon settings */
  endingSoonSettings: "settings.ending_soon_settings",
  /** Singleton referral settings */
  referralSettings: "settings.referral_settings",
  /** Singleton compliance settings */
  complianceSettings: "settings.compliance_settings",
  /** Singleton SEO settings */
  seoSettings: "settings.seo_settings",
  /** Singleton conversion tracking settings */
  conversionSettings: "settings.conversion_settings",
  /** Payment providers list */
  paymentProviders: "payment.providers",
  /** Payment config (public) */
  paymentConfig: "payment.config",
  /** Stats (already in-process cached, but added for invalidation) */
  stats: "stats",
  /** Public entries list (per competition) */
  entries: "entries",
  /** Landing-page composite (used by the lander app) */
  landingPage: "landing-page",
  /** Per-user data — invalidate by userId */
  user: "user",
  /** Bonus award assignments (per competition) */
  bonusAwardAssignments: "bonus-award-assignments",
  /** Bonus award templates */
  bonusAwardTemplates: "bonus-award-templates",
  /** Bonus award win entries */
  bonusAwardWins: "bonus-awards.wins",
  /** Competition instant prizes per competition (public list) */
  instantPrizes: "competition.instant-prizes",
} as const;

export type ChannelName = (typeof CH)[keyof typeof CH];

/**
 * Glob patterns for SCAN MATCH. The first `cache:*` segment matches any
 * namespace (dev/staging/prod). Each pattern is namespace-agnostic.
 *
 * The `[^:]+` regex segment is used where we need a wildcard that doesn't
 * cross `:` (so e.g. the `competitions` channel matches `competitions:list`
 * but not `competitions-categories:list`).
 */
export const CHANNEL_PATTERNS: Record<ChannelName, string> = {
  [CH.competitionAvailability]: "cache:*:public:pub:competition:availability:*",
  [CH.competitionBuyingPower]: "cache:*:user:*:competition:buying-power:*",
  [CH.competitions]: "cache:*:public:pub:competitions:*",
  [CH.competitionsAvailabilityBatch]: "cache:*:public:pub:competitions:availability-batch*",
  [CH.competitionsBuyingPowerBatch]: "cache:*:user:*:competitions:buying-power-batch*",
  [CH.competitionDetail]: "cache:*:public:pub:competition:detail:*",
  [CH.competitionFeatured]: "cache:*:public:pub:competitions:featured",
  [CH.competitionCategories]: "cache:*:public:pub:competitions:categories*",
  [CH.winners]: "cache:*:public:pub:winners:*",
  [CH.winnersByCompetition]: "cache:*:public:pub:winners:competition:*",
  [CH.categories]: "cache:*:public:pub:categories*",
  [CH.shopCategories]: "cache:*:public:pub:shop:categories*",
  [CH.shopProduct]: "cache:*:public:pub:shop:product:*",
  [CH.shopProducts]: "cache:*:public:pub:shop:products*",
  [CH.homepageLayoutSettings]: "cache:*:public:pub:settings:homepage_layout_settings*",
  [CH.endingSoonSettings]: "cache:*:public:pub:settings:ending_soon_settings*",
  [CH.referralSettings]: "cache:*:public:pub:settings:referral_settings*",
  [CH.complianceSettings]: "cache:*:public:pub:settings:compliance_settings*",
  [CH.seoSettings]: "cache:*:public:pub:settings:seo_settings*",
  [CH.conversionSettings]: "cache:*:public:pub:settings:conversion_settings*",
  [CH.paymentProviders]: "cache:*:public:pub:payments:providers",
  [CH.paymentConfig]: "cache:*:public:pub:payment:config*",
  [CH.stats]: "cache:*:public:pub:stats*",
  [CH.entries]: "cache:*:public:pub:entries:*",
  [CH.landingPage]: "cache:*:public:pub:landing-page:*",
  [CH.user]: "cache:*:user:*:*",
  [CH.bonusAwardAssignments]: "cache:*:public:pub:competition:bonus-awards:*",
  [CH.bonusAwardTemplates]: "cache:*:public:pub:bonus-award-templates:*",
  [CH.bonusAwardWins]: "cache:*:public:pub:competition:bonus-award-wins:*",
  [CH.instantPrizes]: "cache:*:public:pub:competition:instant-prizes:*",
};
