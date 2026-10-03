"use client";
import React, { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";
import {
  calcSceneProgress,
  parseDuration,
  registerScene,
  scrollTracker,
  updateSceneProgress,
  useKinoStore,
} from "./store";

interface SceneProps {
  duration: string;
  pin?: boolean;
  children: ReactNode | ((progress: number) => ReactNode);
  className?: string;
  style?: CSSProperties;
}

export function Scene({ duration, pin = true, children, className, style }: SceneProps) {
  const spacerRef = useRef<HTMLDivElement>(null);
  const sceneId = useRef(`scene-${React.useId()}`);
  const [progress, setProgress] = useState(0);
  const offsetTopRef = useRef<number | null>(null);

  useEffect(() => {
    const id = sceneId.current;
    const unregister = registerScene(id);

    return () => {
      unregister();
    };
  }, []);

  useEffect(() => {
    const viewportHeight = window.innerHeight;
    const durationPx = parseDuration(duration, viewportHeight);
    const effectiveDuration = pin ? Math.max(1, durationPx - viewportHeight) : durationPx;

    const calculateOffsetTop = () => {
      if (!spacerRef.current) return;
      const scrollY = window.scrollY;
      const rect = spacerRef.current.getBoundingClientRect();
      offsetTopRef.current = rect.top + scrollY;
    };

    calculateOffsetTop();

    const onResize = () => {
      offsetTopRef.current = null;
      calculateOffsetTop();
    };

    window.addEventListener("resize", onResize, { passive: true });

    const onTick = () => {
      if (offsetTopRef.current === null) {
        calculateOffsetTop();
      }
      if (offsetTopRef.current === null) return;

      const scrollY = useKinoStore.getState().scrollY;
      const p = calcSceneProgress(scrollY, offsetTopRef.current, effectiveDuration);
      setProgress(p);
      updateSceneProgress(sceneId.current, p);
    };

    const unsubscribe = scrollTracker.subscribe(onTick);
    return () => {
      unsubscribe();
      window.removeEventListener("resize", onResize);
    };
  }, [duration, pin]);

  const spacerStyle: CSSProperties = {
    position: "relative",
    height: duration,
  };

  const stickyStyle: CSSProperties = pin
    ? {
        position: "sticky",
        top: 0,
        overflow: "hidden",
      }
    : {};

  const resolvedChildren = typeof children === "function" ? children(progress) : children;

  return (
    <div ref={spacerRef} style={spacerStyle} className={className}>
      <div style={{ ...stickyStyle, ...style }} className="scene-sticky">
        {resolvedChildren}
      </div>
    </div>
  );
}
