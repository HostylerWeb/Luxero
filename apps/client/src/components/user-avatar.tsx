"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export interface UserAvatarProps {
  avatarUrl?: string | null;
  initials: string;
  alt?: string;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
}

export function UserAvatar({
  avatarUrl,
  initials,
  alt = "Profile picture",
  className,
  imageClassName,
  fallbackClassName,
}: UserAvatarProps) {
  return (
    <Avatar className={className}>
      {avatarUrl ? (
        <AvatarImage src={avatarUrl} alt={alt} className={cn("object-cover", imageClassName)} />
      ) : null}
      <AvatarFallback className={fallbackClassName}>{initials}</AvatarFallback>
    </Avatar>
  );
}
