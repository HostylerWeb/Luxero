import { App } from "@capacitor/app";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function useDeepLinkHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = App.addListener("appUrlOpen", (event) => {
      const url = new URL(event.url);
      const path = url.pathname + url.search;
      navigate(path);
    });

    App.getLaunchUrl().then((res) => {
      if (res?.url) {
        const url = new URL(res.url);
        navigate(url.pathname + url.search);
      }
    });

    return () => {
      handler.then((h) => h.remove());
    };
  }, [navigate]);
}
