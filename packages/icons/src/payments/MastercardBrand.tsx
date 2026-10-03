import type React from "react";
import MastercardSvg from "./cc-flat/mastercard.svg";

interface BrandProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

export function MastercardBrand({ className = "w-6 h-6", ...props }: BrandProps) {
  return <img src={MastercardSvg} alt="" aria-hidden="true" className={className} {...props} />;
}
