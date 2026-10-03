import type React from "react";
import ApplePaySvg from "./cc-flat/apple-pay.svg";

interface BrandProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

export function ApplePayBrand({ className = "w-6 h-6", ...props }: BrandProps) {
  return <img src={ApplePaySvg} alt="" aria-hidden="true" className={className} {...props} />;
}
