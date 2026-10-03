"use client";
import * as Sentry from "@sentry/react";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

type AspectRatio = "video" | "square" | "portrait" | "wide";

const aspectClasses: Record<AspectRatio, string> = {
  video: "aspect-video",
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  wide: "aspect-[16/9]",
};

interface ImagePreviewProps {
  src?: string;
  alt?: string;
  className?: string;
  aspectRatio?: AspectRatio;
}

function FallbackPlaceholder({ aspectRatio }: { aspectRatio: AspectRatio }) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted",
        aspectClasses[aspectRatio],
        aspectRatio === "square"
          ? "border-2 border-dashed border-gold/30 rounded-lg min-h-[48px] min-w-[48px]"
          : "border-2 border-dashed border-gold/30 rounded-xl"
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className={cn("text-gold/40", aspectRatio === "square" ? "h-6 w-6" : "h-8 w-8")}
      >
        <title>Image not available</title>
        <rect x={3} y={3} width={18} height={18} rx={2} />
        <circle cx={9} cy={9} r={2} />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      </svg>
      <span
        className={cn("text-[9px] font-medium text-gold/40", aspectRatio === "square" && "sr-only")}
      >
        No image
      </span>
    </div>
  );
}

export { ZoomableImageGallery } from "@/components/zoomable-image-gallery";

export function ImagePreview({
  src,
  alt = "",
  className,
  aspectRatio = "video",
}: ImagePreviewProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-gradient-to-br from-gold/10 to-gold/5 ring-1 ring-gold/20",
        aspectClasses[aspectRatio],
        className
      )}
    >
      {src && !imgError ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover transition-transform duration-300 hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, 50vw"
          crossOrigin="anonymous"
          onError={() => {
            Sentry.captureMessage("[ImagePreview] failed to load", {
              level: "warning",
              extra: { src },
            });
            setImgError(true);
          }}
        />
      ) : (
        <FallbackPlaceholder aspectRatio={aspectRatio} />
      )}
    </div>
  );
}
