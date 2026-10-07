import { AssetImage } from "@/components/AssetImage";

interface ImageCellProps {
  src?: string | null;
  alt?: string;
  size?: string;
  className?: string;
}

const sizeMap = { xs: "size-8", sm: "size-10", md: "size-12", lg: "size-16", full: "size-full" } as const;

function ImageCell({ src, alt = "", size = "md", className }: ImageCellProps) {
  const imgSize = sizeMap[size as keyof typeof sizeMap] ?? "size-12";
  return src ? (
    <div className={`${imgSize} shrink-0 overflow-hidden rounded-md ${className ?? ""}`}>
      <AssetImage src={src} alt={alt} className="h-full w-full rounded-md object-cover" />
    </div>
  ) : (
    <div className={`${imgSize} rounded-md bg-muted ${className ?? ""}`} />
  );
}

export type { ImageCellProps };
export { ImageCell };
