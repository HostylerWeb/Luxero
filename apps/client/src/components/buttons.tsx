import type { ComponentProps } from "react";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";

type ButtonProps = ComponentProps<typeof Button>;

export function GoldButton(props: ButtonProps) {
  return <Button variant="gold" {...props} />;
}

export function GoldOutlineButton({ className, ...props }: ButtonProps) {
  return <Button variant="outlineGold" className={className} {...props} />;
}

export function GoldGhostButton({ size = "sm", ...props }: ButtonProps) {
  return <Button variant="ghost" size={size} {...props} />;
}

export function GoldIconButton(props: ButtonProps) {
  return <Button variant="ghost" size="icon" {...props} />;
}

export function LoadingSpinner({
  className,
  size = "sm",
}: {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
}) {
  return <Spinner size={size} className={className} aria-hidden />;
}
