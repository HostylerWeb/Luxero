import type React from "react";
import XBrandSvg from "./x-brand.svg";

interface XBrandIconProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

export function XBrandIcon({ className = "w-4 h-4", ...props }: XBrandIconProps) {
  return <img src={XBrandSvg} className={className} aria-label="X" {...props} />;
}
