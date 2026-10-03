import "../index.css";
import { getEnv } from "@luxero/env/vike";
import { usePageContext } from "vike-react/usePageContext";

const DEFAULT_DESC =
  "Enter competitions on Luxero to win incredible prizes, from premium electronics and designer fashion to unforgettable luxury experiences. Play skill-based contests and try instant win games.";

export function Head() {
  const pageContext = usePageContext();
  const locale = pageContext.locale ?? "en";
  const localeData = pageContext.localeData as Record<string, unknown> | null;
  const headData = localeData?.head as Record<string, string> | undefined;

  const description = pageContext.defaultDescription ?? headData?.description ?? DEFAULT_DESC;
  const umamiId = getEnv("UMAMI_WEBSITE_ID");
  const siteName = headData?.siteName ?? "Luxero";
  const baseUrl = getEnv("APP_URL");

  return (
    <>
      <html lang={locale} />
      <meta name="description" content={description} />
      <meta name="theme-color" content="#C9A84C" />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

      {pageContext.nonce && <style nonce={pageContext.nonce} />}

      {umamiId && (
        <script defer src="https://umami.luxero.win/script.js" data-website-id={umamiId} />
      )}

      <script defer src="/sw-register.js" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: siteName,
            url: baseUrl,
            logo: `${baseUrl}/og-default.png`,
          }),
        }}
      />
    </>
  );
}
