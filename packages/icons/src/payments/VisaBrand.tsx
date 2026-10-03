import type React from "react";
import VisaSvg from "./cc-flat/visa.svg";

interface BrandProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

export function VisaBrand({ className = "w-6 h-6", ...props }: BrandProps) {
  return <img src={VisaSvg} alt="" aria-hidden="true" className={className} {...props} />;
}
