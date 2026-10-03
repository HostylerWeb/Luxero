"use client";

import { Loader2Icon } from "lucide-react";
import { useBuildVersion } from "@/hooks/useBuildVersion";

export function BuildVersionWatcher() {
  const { isUpdating } = useBuildVersion();
  if (!isUpdating) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4 bg-black/60 backdrop-blur-sm">
      <Loader2Icon className="size-10 animate-spin text-white" />
      <p className="text-lg font-medium text-white">Updating application</p>
    </div>
  );
}
