"use client";

import { cn, withAssetCacheVersion } from "@luxero/utils";
import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export interface UserAvatarProps {
  avatarUrl?: string | null;
  initials: string;
  alt?: string;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
  /** When set, busts browser cache only when profile/competition metadata changes. */
  cacheVersion?: string | number | Date | null;
  /** Load image immediately (profile hero, header). */
  priority?: boolean;
}

export function UserAvatar({
  avatarUrl,
  initials,
  alt = "Profile picture",
  className,
  imageClassName,
  fallbackClassName,
  cacheVersion,
  priority = false,
}: UserAvatarProps) {
  const src = useMemo(
    () => withAssetCacheVersion(avatarUrl, cacheVersion),
    [avatarUrl, cacheVersion]
  );

  return (
    <Avatar className={className}>
      {src ? (
        <AvatarImage
          src={src}
          alt={alt}
          className={cn("object-cover", imageClassName)}
          loading={priority ? "eager" : undefined}
          fetchPriority={priority ? "high" : undefined}
        />
      ) : null}
      <AvatarFallback className={fallbackClassName}>{initials}</AvatarFallback>
    </Avatar>
  );
}
