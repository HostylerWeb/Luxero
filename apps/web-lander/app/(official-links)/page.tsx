import type { Metadata } from "next";
import { OfficialLinksPage } from "@/components/links/official-links-page";

const landerUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3333";

export const metadata: Metadata = {
  title: "LUXERO — Official Links",
  description:
    "Explore Luxero Competitions, Luxero Agro and our official community. Everyone deserves a fair chance at something extraordinary.",
  themeColor: "#050607",
  openGraph: {
    title: "LUXERO — A fair chance at something extraordinary.",
    description:
      "Luxero Competitions, Luxero Agro and our official community. All our links in one place.",
    url: landerUrl,
    images: [
      {
        url: "/links/assets/share.jpg",
        width: 1200,
        height: 630,
        alt: "Luxero official links",
      },
    ],
    siteName: "Luxero",
  },
  twitter: {
    card: "summary_large_image",
    images: ["/links/assets/share.jpg"],
  },
  icons: {
    icon: "/links/assets/favicon.svg",
  },
};

export default function HomePage() {
  return <OfficialLinksPage />;
}
