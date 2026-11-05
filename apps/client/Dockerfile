# =============================================================================
# Stage 1: Prune
# Generate a partial monorepo with `turbo prune` for the target app
# =============================================================================
FROM oven/bun:1-alpine AS prune

RUN apk add --no-cache ffmpeg openssl ca-certificates

WORKDIR /app

COPY . .

RUN bun install --no-verify --ignore-scripts

RUN bunx turbo prune --docker --out-dir=out @luxero/client

# =============================================================================
# Stage 2: Builder
# Install deps (json/) then copy source (full/)
# =============================================================================
FROM oven/bun:1-alpine AS builder

RUN apk add --no-cache ffmpeg openssl ca-certificates

WORKDIR /app

COPY --from=prune /app/out/json/ .
RUN bun install --no-verify --ignore-scripts

COPY --from=prune /app/out/full/ .
COPY --from=prune /app/tsconfig.base.json .

ARG PUBLIC_ENV__TURNSTILE_SITE_KEY=""
ARG PUBLIC_ENV__APP_URL=""
ARG PUBLIC_ENV__ADMIN_URL=""
ARG PUBLIC_ENV__STRIPE_PUBLISHABLE_KEY=""
ARG PUBLIC_ENV__PAYMENT_BYPASS=""
ARG PUBLIC_ENV__PAYMENT_DEBUG=""
RUN rm -f /app/apps/client/.env /app/apps/client/.env.local /app/apps/client/.env.production && \
  BUILD_TS=$(date +%s) && \
  { \
    echo "VITE_APP_VERSION=$BUILD_TS"; \
    [ -n "$PUBLIC_ENV__TURNSTILE_SITE_KEY" ] && echo "PUBLIC_ENV__TURNSTILE_SITE_KEY=$PUBLIC_ENV__TURNSTILE_SITE_KEY"; \
    [ -n "$PUBLIC_ENV__APP_URL" ] && echo "PUBLIC_ENV__APP_URL=$PUBLIC_ENV__APP_URL"; \
    [ -n "$PUBLIC_ENV__ADMIN_URL" ] && echo "PUBLIC_ENV__ADMIN_URL=$PUBLIC_ENV__ADMIN_URL"; \
    [ -n "$PUBLIC_ENV__STRIPE_PUBLISHABLE_KEY" ] && echo "PUBLIC_ENV__STRIPE_PUBLISHABLE_KEY=$PUBLIC_ENV__STRIPE_PUBLISHABLE_KEY"; \
    [ -n "$PUBLIC_ENV__PAYMENT_BYPASS" ] && echo "PUBLIC_ENV__PAYMENT_BYPASS=$PUBLIC_ENV__PAYMENT_BYPASS"; \
    [ -n "$PUBLIC_ENV__PAYMENT_DEBUG" ] && echo "PUBLIC_ENV__PAYMENT_DEBUG=$PUBLIC_ENV__PAYMENT_DEBUG"; \
  } > /app/apps/client/.env.production

WORKDIR /app/apps/client
RUN NODE_OPTIONS='--max-old-space-size=2048' bun run build

# =============================================================================
# Stage 3: Runtime
# =============================================================================
FROM oven/bun:1-alpine

RUN apk add --no-cache ffmpeg openssl ca-certificates curl

WORKDIR /app

COPY --from=prune /app/out/json/ .
RUN bun install --no-verify --ignore-scripts

COPY --from=builder /app/apps/client/dist ./dist
COPY --from=builder /app/apps/client/public ./public
COPY --from=builder /app/packages ./packages
ENV NODE_ENV=production
EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=2 \
  CMD curl -f http://127.0.0.1:${PORT:-3000}/health || exit 1

CMD ["bun", "run", "/app/dist/server/index.mjs"]