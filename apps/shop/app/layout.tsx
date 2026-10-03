import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import { BuildVersionWatcher } from "@/components/build-version-watcher";
import { ErrorBoundary } from "@/components/error-boundary";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import "./globals.css";

const BUILD_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || "";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
});

export const viewport: Viewport = {
  themeColor: "#C9A84C",
};

const shopUrl =
  process.env.NEXT_PUBLIC_SHOP_URL || process.env.APP_URL || "https://shop.luxero.win";

export const metadata: Metadata = {
  title: {
    default: "Shop — Luxero",
    template: "%s — Luxero Shop",
  },
  description: "Luxero official merchandise store — premium apparel and accessories.",
  icons: [
    { rel: "icon", url: "/icons/icon-192x192.svg" },
    { rel: "apple-touch-icon", url: "/icons/icon-180x180.svg" },
  ],
  manifest: "/manifest.json",
  openGraph: {
    title: "Shop — Luxero",
    description: "Luxero official merchandise store — premium apparel and accessories.",
    siteName: "Luxero Shop",
    type: "website",
    locale: "en_GB",
    url: shopUrl,
    images: [
      {
        url: "/og-default.png",
        secureUrl: `${shopUrl}/og-default.png`,
        type: "image/png",
        width: 1200,
        height: 630,
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${plusJakarta.variable}`}>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Luxero",
              url: shopUrl,
              logo: `${shopUrl}/og-default.png`,
            }),
          }}
        />
        <link rel="preconnect" href="https://assets.luxero.win" />
        <link rel="preconnect" href="https://assets.staging.luxero.win" />
        <link rel="dns-prefetch" href="https://assets.luxero.win" />
        <link rel="dns-prefetch" href="https://assets.staging.luxero.win" />
        {process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
          <script
            defer
            src="https://umami.luxero.win/script.js"
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
          />
        )}
        <AuthProvider>
          <ErrorBoundary buildVersion={BUILD_VERSION}>
            <BuildVersionWatcher />
            <Header />
            {children}
            <Footer />
          </ErrorBoundary>
        </AuthProvider>
      </body>
    </html>
  );
}
