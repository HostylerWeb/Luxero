# =============================================================================
# Stage 1: Prune
# =============================================================================
FROM oven/bun:1.2.23-alpine AS prune

RUN apk add --no-cache ffmpeg openssl ca-certificates

WORKDIR /app

COPY . .

RUN bun install --no-verify --ignore-scripts

RUN bunx turbo prune --docker --out-dir=out @luxero/web-lander

# =============================================================================
# Stage 2: Builder
# =============================================================================
FROM oven/bun:1.2.23-alpine AS builder

RUN apk add --no-cache ffmpeg openssl ca-certificates

WORKDIR /app

COPY --from=prune /app/out/json/ .
RUN bun install --no-verify --ignore-scripts

COPY --from=prune /app/out/full/ .
COPY --from=prune /app/tsconfig.base.json .

WORKDIR /app/apps/web-lander
RUN BUILD_TS=$(date +%s) && echo "NEXT_PUBLIC_APP_VERSION=$BUILD_TS" > /app/apps/web-lander/.env.production
RUN NODE_OPTIONS='--max-old-space-size=2048 --max-semi-space-size=64' \
    bun run build

# =============================================================================
# Stage 3: Runtime
# =============================================================================
FROM oven/bun:1.2.23-alpine

RUN apk add --no-cache ffmpeg openssl ca-certificates curl

WORKDIR /app

COPY --from=prune /app/out/json/ .
RUN bun install --no-verify --ignore-scripts

COPY --from=builder /app/apps/web-lander/.next ./apps/web-lander/.next
COPY --from=builder /app/apps/web-lander/public ./apps/web-lander/public
COPY --from=builder /app/apps/web-lander/next.config.* ./apps/web-lander/
COPY --from=builder /app/packages ./packages

ENV NODE_ENV=production
EXPOSE 3000

WORKDIR /app/apps/web-lander

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=2 \
  CMD curl -f http://127.0.0.1:${PORT:-3000}/ || exit 1

CMD ["bun", "run", "start"]
