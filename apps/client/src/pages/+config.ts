import type { Config } from "vike/types";
import vikeReact from "vike-react/config";

export default {
  extends: [vikeReact],
  ssr: true,
  clientRouting: true,
  stream: false,
  Wrapper: "import:./+Wrapper:Wrapper",
  passToClient: [
    "user",
    "userShell",
    "routeParams",
    "cartInitialData",
    "complianceFeaturesData",
    "defaultOgImageUrl",
    "referralOgImageUrl",
    "defaultTitle",
    "defaultDescription",
    "sidebarDefaultOpen",
    "nonce",
    "locale",
    "localeData",
    "urlLogical",
  ],
} satisfies Config;
