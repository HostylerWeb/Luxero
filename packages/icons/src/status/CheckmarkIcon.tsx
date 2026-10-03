import type React from "react";
import CheckmarkSvg from "./checkmark.svg";

interface CheckmarkIconProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

export function CheckmarkIcon({
  className = "w-8 h-8 text-green-500",
  ...props
}: CheckmarkIconProps) {
  return <img src={CheckmarkSvg} className={className} alt="" aria-hidden="true" {...props} />;
}
