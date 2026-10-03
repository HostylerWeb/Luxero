import type { NavHomepageSection } from "@luxero/utils";
import { CategoryNav } from "../CategoryNav";

export function CategoryNavSection({
  navSections,
  defaultActiveSection,
}: {
  navSections: NavHomepageSection[];
  defaultActiveSection: string;
}) {
  if (navSections.length === 0) return null;

  return <CategoryNav navSections={navSections} defaultActiveSection={defaultActiveSection} />;
}
