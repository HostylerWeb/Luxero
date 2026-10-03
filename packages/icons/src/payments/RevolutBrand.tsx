import type React from "react";
import RevolutSvg from "./revolut-brand.svg";

interface RevolutBrandProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

export function RevolutBrand({ className = "w-6 h-6", ...props }: RevolutBrandProps) {
  return <img src={RevolutSvg} alt="" aria-hidden="true" className={className} {...props} />;
}
