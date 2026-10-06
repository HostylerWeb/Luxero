"use client";

import type { MediaConverterScope } from "@/components/addons/media-converter-types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ScopeTogglesProps {
  labels: Record<MediaConverterScope, string>;
  scopes: Record<MediaConverterScope, boolean>;
  disabled?: boolean;
  onToggle: (scope: MediaConverterScope, checked: boolean) => void;
}

const SCOPE_ORDER: MediaConverterScope[] = [
  "media_library",
  "competition_prizes",
  "landing_videos",
  "avatars",
  "og_images",
];

export function ScopeToggles({ labels, scopes, disabled, onToggle }: ScopeTogglesProps) {
  return (
    <ul className="flex flex-col gap-3">
      {SCOPE_ORDER.map((scope) => {
        const id = `scope-${scope}`;
        const label = labels[scope];
        const muted = label.includes("not applicable");
        return (
          <li key={scope} className="flex items-start gap-3">
            <Checkbox
              id={id}
              checked={scopes[scope]}
              disabled={disabled || muted}
              onCheckedChange={(checked) => onToggle(scope, checked === true)}
            />
            <Label
              htmlFor={id}
              className={`cursor-pointer text-sm font-normal leading-snug ${muted ? "text-muted-foreground" : ""}`}
            >
              {label}
            </Label>
          </li>
        );
      })}
    </ul>
  );
}
