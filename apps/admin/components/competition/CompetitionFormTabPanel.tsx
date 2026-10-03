import type { ReactNode } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

function CompetitionFormTabPanel({ children }: { children: ReactNode }) {
  return (
    <ScrollArea className="h-full max-h-[calc(100dvh-12.5rem)]">
      <div className="px-6 py-5">{children}</div>
    </ScrollArea>
  );
}

export { CompetitionFormTabPanel };
