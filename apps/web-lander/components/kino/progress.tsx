"use client";
import React from "react";
import { useKinoStore } from "./store";

type ProgressType = "bar" | "dots" | "ring";
type ProgressPosition = "top" | "bottom" | "left" | "right";

interface ProgressProps {
  type?: ProgressType;
  position?: ProgressPosition;
  color?: string;
  trackColor?: string;
  progress?: number;
  dotCount?: number;
  ringSize?: number;
  height?: number;
  className?: string;
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function BarProgress({
  progress,
  position,
  color,
  trackColor,
  height,
}: {
  progress: number;
  position: ProgressPosition;
  color: string;
  trackColor: string;
  height?: number;
}) {
  const isHorizontal = position === "top" || position === "bottom";
  const h = height ?? 3;

  const trackStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 9999,
    backgroundColor: trackColor,
    ...(position === "top" && { top: 0, left: 0, right: 0, height: `${h}px` }),
    ...(position === "bottom" && { bottom: 0, left: 0, right: 0, height: `${h}px` }),
    ...(position === "left" && { top: 0, left: 0, bottom: 0, width: `${h}px` }),
    ...(position === "right" && { top: 0, right: 0, bottom: 0, width: `${h}px` }),
  };

  const fillStyle: React.CSSProperties = {
    backgroundColor: color,
    transition: "width 100ms linear, height 100ms linear",
    ...(isHorizontal
      ? { height: "100%", width: `${progress * 100}%` }
      : { width: "100%", height: `${progress * 100}%` }),
  };

  return (
    <div style={trackStyle}>
      <div style={fillStyle} />
    </div>
  );
}

function DotsProgress({
  progress,
  position,
  color,
  trackColor,
  dotCount,
}: {
  progress: number;
  position: ProgressPosition;
  color: string;
  trackColor: string;
  dotCount: number;
}) {
  const isVertical = position === "left" || position === "right";
  const activeIndex = Math.min(Math.floor(progress * dotCount), dotCount - 1);

  const containerStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 9999,
    display: "flex",
    flexDirection: isVertical ? "column" : "row",
    gap: "8px",
    alignItems: "center",
    ...(position === "top" && { top: "12px", left: "50%", transform: "translateX(-50%)" }),
    ...(position === "bottom" && { bottom: "12px", left: "50%", transform: "translateX(-50%)" }),
    ...(position === "left" && { left: "12px", top: "50%", transform: "translateY(-50%)" }),
    ...(position === "right" && { right: "12px", top: "50%", transform: "translateY(-50%)" }),
  };

  return (
    <div style={containerStyle}>
      {Array.from({ length: dotCount }, (_, i) => {
        const isActive = i <= activeIndex;
        const dotStyle: React.CSSProperties = {
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          backgroundColor: isActive ? color : trackColor,
          transition: "background-color 200ms ease",
        };
        return <div key={`dot-${i}`} style={dotStyle} />;
      })}
    </div>
  );
}

function RingProgress({
  progress,
  position,
  color,
  trackColor,
  ringSize,
}: {
  progress: number;
  position: ProgressPosition;
  color: string;
  trackColor: string;
  ringSize: number;
}) {
  const strokeWidth = 3;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  const containerStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 9999,
    ...(position === "top" && { top: "12px", right: "12px" }),
    ...(position === "bottom" && { bottom: "12px", right: "12px" }),
    ...(position === "left" && { top: "12px", left: "12px" }),
    ...(position === "right" && { top: "12px", right: "12px" }),
  };

  return (
    <div style={containerStyle}>
      <svg
        width={ringSize}
        height={ringSize}
        viewBox={`0 0 ${ringSize} ${ringSize}`}
        style={{ transform: "rotate(-90deg)" }}
      >
        <title>Scroll progress</title>
        <circle
          cx={ringSize / 2}
          cy={ringSize / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={ringSize / 2}
          cy={ringSize / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 100ms linear" }}
        />
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Bar sub-component (used as <Progress.Bar />)
// ---------------------------------------------------------------------------

interface BarProps {
  className?: string;
}

function Bar({ className }: BarProps) {
  const progress = useKinoStore((s) => s.progress);
  return (
    <div
      className={className}
      style={{
        height: "100%",
        width: `${progress * 100}%`,
        transition: "width 100ms linear",
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Progress component
// ---------------------------------------------------------------------------

export function Progress({
  type = "bar",
  position = "top",
  color = "#3b82f6",
  trackColor = "transparent",
  progress: progressProp,
  dotCount = 5,
  ringSize = 48,
  height = 3,
  className,
  children,
}: ProgressProps) {
  const pageProgress = useKinoStore((s) => s.progress);
  const progress = progressProp ?? pageProgress;

  const sharedProps = { progress, position, color, trackColor, height };

  return (
    <div className={className}>
      {type === "bar" && <BarProgress {...sharedProps} />}
      {type === "dots" && <DotsProgress {...sharedProps} dotCount={dotCount} />}
      {type === "ring" && <RingProgress {...sharedProps} ringSize={ringSize} />}
      {type === "bar" && children}
    </div>
  );
}

Progress.Bar = Bar;
