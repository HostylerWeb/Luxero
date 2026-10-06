import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "assets.luxero.win" },
      { protocol: "https", hostname: "assets.staging.luxero.win" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "googleuserconsent.com" },
      { protocol: "http", hostname: "localhost", port: "9011", pathname: "/luxero-assets/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "9011", pathname: "/luxero-assets/**" },
    ],
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
    formats: ["image/avif", "image/webp"],
    qualities: [50, 75, 80],
    deviceSizes: [480, 768, 1024, 1280, 1536, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 2678400,
    maximumDiskCacheSize: 250_000_000,
  },
  async headers() {
    const devAssetHosts =
      process.env.NODE_ENV !== "production" ? " http://localhost:9011 http://127.0.0.1:9011" : "";
    const devClient =
      process.env.NODE_ENV !== "production"
        ? " http://localhost:3555 http://127.0.0.1:3555 http://localhost:3333"
        : "";
    const csp =
      "base-uri 'self'; form-action 'self'; object-src 'none'; frame-ancestors 'none'; default-src 'self'; " +
      `media-src 'self' https://assets.luxero.win https://assets.staging.luxero.win${devAssetHosts}; ` +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "worker-src 'self' blob:; child-src 'self' blob:; " +
      `connect-src 'self' https://assets.luxero.win https://assets.staging.luxero.win${devAssetHosts}${devClient}; ` +
      `img-src 'self' data: blob: https://assets.luxero.win https://assets.staging.luxero.win https://luxero.win https://lh3.googleusercontent.com${devAssetHosts}; ` +
      "font-src 'self' https://fonts.gstatic.com data:";

    return [
      {
        source: "/_next/image/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/sw.js",
        headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }],
      },
      ...(process.env.NODE_ENV === "production"
        ? [
            {
              source: "/:all*(svg|png|jpg|jpeg|webp|avif|woff2|css|js)",
              headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
            },
            {
              source: "/:path*/",
              headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }],
            },
          ]
        : []),
      {
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-cache, no-store, must-revalidate" }],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Content-Security-Policy",
            value: csp,
          },
        ],
      },
    ];
  },
  async redirects() {
    return [{ source: "/competitions/:slug", destination: "/:slug", permanent: true }];
  },
};

export default nextConfig;
