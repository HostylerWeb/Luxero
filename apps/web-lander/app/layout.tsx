import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const landerUrl = process.env.NEXT_PUBLIC_APP_URL || "https://agro.luxero.win";

export const metadata: Metadata = {
  title: {
    default: "Win Premium Prizes — Luxero Competitions",
    template: "%s — Luxero",
  },
  description:
    "Enter to win incredible prizes with Luxero Competitions. Browse active competitions, answer skill questions, and win instantly.",
  openGraph: {
    siteName: "Luxero",
    type: "website",
    locale: "en_GB",
    url: landerUrl,
    images: [
      {
        url: "/og-default.png",
        secureUrl: `${landerUrl}/og-default.png`,
        type: "image/png",
        width: 1200,
        height: 630,
      },
    ],
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
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Outfit:wght@300;400;500;600;700&family=Space+Mono&display=swap"
          as="style"
        />
      </head>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
