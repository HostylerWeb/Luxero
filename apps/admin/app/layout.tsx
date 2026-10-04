import { AuthProvider, QueryProvider } from "@luxero/api-admin";
import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { BuildVersionWatcher } from "@/components/BuildVersionWatcher";
import { ErrorBoundary } from "@/components/error-boundary";
import { PwaInstallPrompt } from "@/components/layout/PwaInstallPrompt";
import { ScrollLockFix } from "@/components/ScrollLockFix";
import { CommandMenuProvider } from "@/components/shell/CommandMenuContext";
import { CommandMenuShortcutListener } from "@/components/shell/CommandMenuShortcutListener";
import "./globals.css";

const BUILD_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || "";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: {
    default: "Admin — Luxero",
    template: "%s — Luxero Admin",
  },
  description: "Luxero admin dashboard",
  icons: [{ rel: "icon", url: "/icons/icon-192x192.svg" }],
  manifest: "/manifest.webmanifest",
  robots: { index: false },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
          <script
            defer
            src="https://umami.luxero.win/script.js"
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
          />
        )}
        <script defer src="/sw-register.js" />
      </head>
      <body className={`${plusJakarta.variable} font-sans antialiased`}>
        <ScrollLockFix />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          storageKey="luxero-theme"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary buildVersion={BUILD_VERSION}>
            <QueryProvider>
              <CommandMenuProvider>
                <BuildVersionWatcher />
                <CommandMenuShortcutListener />
                <Suspense fallback={null}>
                  <AuthProvider enableGuestSession={false}>{children}</AuthProvider>
                </Suspense>
                <PwaInstallPrompt
                  appName="Luxero Admin"
                  tagline="Add to your home screen for one-tap admin access"
                />
                <Toaster />
              </CommandMenuProvider>
            </QueryProvider>
          </ErrorBoundary>
        </ThemeProvider>
        <script
          id="image-debug-logger"
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  if (window.__logRecorder) return;
  var logs = [];
  var origLog = console.log;
  var origWarn = console.warn;
  var origError = console.error;
  var record = function(level, args) {
    logs.push({ level: level, ts: Date.now(), msg: Array.prototype.map.call(args, String).join(' ') });
    if (level === 'error') origError.apply(console, args);
    else if (level === 'warn') origWarn.apply(console, args);
    else origLog.apply(console, args);
  };
  console.log = function() { record('log', arguments); };
  console.warn = function() { record('warn', arguments); };
  console.error = function() { record('error', arguments); };
  window.__dumpLogs = function() { return JSON.stringify(logs); };
  window.__clearLogs = function() { logs = []; };
  origLog('[logger] image debug logger initialized');
})();
`,
          }}
        />
      </body>
    </html>
  );
}
