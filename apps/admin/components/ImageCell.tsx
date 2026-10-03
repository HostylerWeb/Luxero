import Image from "next/image";

interface ImageCellProps {
  src?: string | null;
  alt?: string;
  size?: string;
  className?: string;
}

const sizeMap = { sm: "size-10", md: "size-12", lg: "size-16", full: "size-full" } as const;

function ImageCell({ src, alt = "", size = "md", className }: ImageCellProps) {
  const imgSize = sizeMap[size as keyof typeof sizeMap] ?? "size-12";
  return src ? (
    <div className={`relative ${imgSize} rounded-md ${className ?? ""}`}>
      <Image src={src} alt={alt} fill className="rounded-md object-cover" sizes="40px" />
    </div>
  ) : (
    <div className={`${imgSize} rounded-md bg-muted ${className ?? ""}`} />
  );
}

export type { ImageCellProps };
export { ImageCell };
