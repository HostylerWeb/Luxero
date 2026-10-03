import type React from "react";
import ErrorSvg from "./error-x.svg";

interface ErrorIconProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

export function ErrorIcon({ className = "w-8 h-8 text-red-500", ...props }: ErrorIconProps) {
  return <img src={ErrorSvg} className={className} alt="" aria-hidden="true" {...props} />;
}
