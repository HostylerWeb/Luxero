"use client";

import { useEffect } from "react";

export function ScrollLockFix() {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const html = document.documentElement;
    const body = document.body;

    const previousGutter = html.style.scrollbarGutter;
    html.style.setProperty("scrollbar-gutter", "stable");

    const resetBodyOffsets = () => {
      if (body.hasAttribute("data-scroll-locked")) {
        body.style.setProperty("margin-right", "0", "important");
        body.style.setProperty("padding-right", "0", "important");
      } else {
        body.style.removeProperty("margin-right");
        body.style.removeProperty("padding-right");
      }
    };

    const obs = new MutationObserver(resetBodyOffsets);
    obs.observe(body, {
      attributes: true,
      attributeFilter: ["data-scroll-locked", "style"],
    });

    resetBodyOffsets();

    return () => {
      obs.disconnect();
      if (previousGutter) {
        html.style.setProperty("scrollbar-gutter", previousGutter);
      } else {
        html.style.removeProperty("scrollbar-gutter");
      }
      body.style.removeProperty("margin-right");
      body.style.removeProperty("padding-right");
    };
  }, []);

  return null;
}
