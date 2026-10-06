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
    ],
    formats: ["image/avif", "image/webp"],
    qualities: [50, 75, 80],
    deviceSizes: [480, 768, 1024, 1280, 1536, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 2678400,
    maximumDiskCacheSize: 250_000_000,
  },
  async headers() {
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
            value:
              "default-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'",
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
