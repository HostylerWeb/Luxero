import { useEffect, useState } from "react";

type AssetStatus = "loading" | "loaded" | "error";

interface ExternalAsset {
  url: string;
  type: "script" | "style";
}

function injectAsset({ url, type }: ExternalAsset): Promise<void> {
  return new Promise((resolve, reject) => {
    if (type === "style") {
      const existing = document.querySelector<HTMLLinkElement>(
        `link[rel="stylesheet"][href="${url}"]`
      );
      if (existing) {
        resolve();
        return;
      }
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = url;
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to load CSS: ${url}`));
      document.head.appendChild(link);
    } else {
      const existing = document.querySelector<HTMLScriptElement>(`script[src="${url}"]`);
      if (existing) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = url;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
      document.head.appendChild(script);
    }
  });
}

export function useExternalScripts(assets: ExternalAsset[]): AssetStatus {
  const [status, setStatus] = useState<AssetStatus>("loading");

  useEffect(() => {
    if (assets.length === 0) {
      setStatus("loaded");
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        await Promise.all(assets.map(injectAsset));
        if (!cancelled) setStatus("loaded");
      } catch {
        if (!cancelled) setStatus("error");
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [assets]);

  return status;
}
