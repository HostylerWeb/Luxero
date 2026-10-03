// Local utilities barrel — re-exports common helpers from @luxero/utils
// and the local cn() helper.
//
// Components that previously imported from "@/lib/utils" get:
//   - `cn` from local
//   - everything else from "@luxero/utils" (so formatCurrency, getDisplayName,
//     getMaxCartQuantity, SOCIAL_LINKS, etc. all work)

export * from "@luxero/utils";
export { cn } from "@/lib/cn";
