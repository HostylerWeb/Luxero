import type { ReactNode } from "react";
import type { LegalSection } from "../content-types";
import { termsSectionsData } from "./terms-sections-data.ts";

function TermsSectionBody({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className="space-y-3 text-muted-foreground">
      {paragraphs.map((paragraph, index) => (
        <p key={`${index}-${paragraph.slice(0, 32)}`}>{paragraph}</p>
      ))}
    </div>
  );
}

export const termsSections: LegalSection[] = termsSectionsData.map((section) => ({
  id: section.id,
  title: section.title,
  content: <TermsSectionBody paragraphs={section.paragraphs} />,
}));
