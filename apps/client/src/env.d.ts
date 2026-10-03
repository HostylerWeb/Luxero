/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
  readonly BASE_URL: string;
  readonly MODE: string;

  // Build version (inlined at build time via VITE_ prefix)
  readonly VITE_APP_VERSION: string;
  readonly VITE_UMAMI_WEBSITE_ID: string;

  // PUBLIC_ prefix (Vite convention) - safe for client
  readonly PUBLIC_APP_URL: string;
  readonly PUBLIC_SELF_URL: string;
  readonly PUBLIC_ADMIN_URL: string;
  readonly PUBLIC_PAYPAL_CLIENT_ID: string;
  readonly PUBLIC_PAYMENT_BYPASS: string;
  readonly PUBLIC_PAYMENT_DEBUG: string;
  readonly PUBLIC_SENTRY_DSN_WEB: string;
  readonly PUBLIC_SENTRY_ENVIRONMENT: string;

  // NEXT_PUBLIC_ prefix (Next.js convention) - also safe for client
  readonly NEXT_PUBLIC_APP_URL: string;
  readonly NEXT_PUBLIC_SELF_URL: string;
  readonly NEXT_PUBLIC_ADMIN_URL: string;
  readonly NEXT_PUBLIC_PAYPAL_CLIENT_ID: string;
  readonly NEXT_PUBLIC_PAYMENT_BYPASS: string;
  readonly NEXT_PUBLIC_PAYMENT_DEBUG: string;
  readonly NEXT_PUBLIC_SENTRY_DSN_WEB: string;
  readonly NEXT_PUBLIC_SENTRY_ENVIRONMENT: string;

  // Private env vars (server-only) - NOT exposed to client
  readonly DATABASE_URL: string;
  readonly BETTER_AUTH_SECRET: string;
  readonly SENTRY_DSN: string;
  readonly REDIS_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
