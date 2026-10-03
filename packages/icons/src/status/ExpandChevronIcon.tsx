import type React from "react";
import ExpandChevronSvg from "./expand-chevron.svg";

interface ExpandChevronIconProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

export function ExpandChevronIcon({ className = "w-4 h-4", ...props }: ExpandChevronIconProps) {
  return <img src={ExpandChevronSvg} className={className} alt="" aria-hidden="true" {...props} />;
}
