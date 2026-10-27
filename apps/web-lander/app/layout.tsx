import type { Metadata, Viewport } from "next";
import { HOSTYLER_CONSOLE_NOTICE_INLINE } from "@luxero/utils";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const landerUrl = process.env.NEXT_PUBLIC_APP_URL || "https://agro.luxero.win";

export const metadata: Metadata = {
  title: {
    default: "LUXERO — Official Links",
    template: "%s — Luxero",
  },
  description:
    "Explore Luxero Competitions, Luxero Agro and our official community. Everyone deserves a fair chance at something extraordinary.",
  openGraph: {
    siteName: "Luxero",
    type: "website",
    locale: "en_GB",
    url: landerUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-[var(--color-bg-deep)] font-body font-display">
      <head>
        <script
          id="hostyler-console-notice"
          dangerouslySetInnerHTML={{ __html: HOSTYLER_CONSOLE_NOTICE_INLINE }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Luxero",
              url: "https://luxero.win",
              logo: "https://luxero.win/og-default.svg",
            }),
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Outfit:wght@300;400;500;600;700&family=Space+Mono&display=swap"
        />
      </head>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
