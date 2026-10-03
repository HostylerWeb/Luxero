import { forwardRef, type ImgHTMLAttributes } from "react";

type NextImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  alt: string;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  width?: number;
  height?: number;
  unoptimized?: boolean;
};

const Image = forwardRef<HTMLImageElement, NextImageProps>(
  ({ src, alt, fill, priority, quality, sizes, width, height, style, ...props }, ref) => {
    const mergedStyle: React.CSSProperties = {
      ...(fill
        ? { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }
        : {}),
      ...style,
    };

    return (
      <img
        ref={ref}
        src={src}
        alt={alt}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        style={mergedStyle}
        {...props}
      />
    );
  }
);

Image.displayName = "Image";

export default Image;
export type { NextImageProps as ImageProps };
