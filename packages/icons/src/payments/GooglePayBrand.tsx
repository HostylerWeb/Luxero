import type React from "react";
import GooglePaySvg from "./cc-flat/google-pay.svg";

interface BrandProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

export function GooglePayBrand({ className = "w-6 h-6", ...props }: BrandProps) {
  return <img src={GooglePaySvg} alt="" aria-hidden="true" className={className} {...props} />;
}
