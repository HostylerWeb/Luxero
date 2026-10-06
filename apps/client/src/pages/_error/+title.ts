import type { PageContext } from "vike/types";

export default function title(pageContext: PageContext): string {
  if (pageContext.is404 === true || pageContext.abortStatusCode === 404) {
    return "Page not found | Luxero";
  }
  return "Something went wrong | Luxero";
}
