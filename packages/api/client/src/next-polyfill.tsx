"use client";

export type SafeRouter = {
  push: (url: string) => void;
  replace: (url: string) => void;
  back: () => void;
  forward: () => void;
  refresh: () => void;
  prefetch: () => void;
};

export function createSafeRouter(): SafeRouter {
  if (typeof window === "undefined") {
    return { push() {}, replace() {}, back() {}, forward() {}, refresh() {}, prefetch() {} };
  }
  return {
    push: (url: string) => {
      window.location.href = url;
    },
    replace: (url: string) => {
      window.location.replace(url);
    },
    back: () => {
      window.history.back();
    },
    forward: () => {
      window.history.forward();
    },
    refresh: () => {
      window.location.reload();
    },
    prefetch: () => {},
  };
}

export function getSearchParams(): URLSearchParams {
  if (typeof window === "undefined") return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

export function SafeLink({
  href,
  className,
  children,
  target,
}: {
  href: string;
  className?: string;
  children?: React.ReactNode;
  target?: string;
}) {
  return (
    <a href={href} className={className} target={target}>
      {children}
    </a>
  );
}
