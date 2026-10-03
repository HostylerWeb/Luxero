#!/bin/bash
set -e

cd /Users/ncs/Desktop/turborepo

# Start Colima if needed
colima status 2>/dev/null || colima start

bun install

# Start Docker infra (MongoDB, Redis, Mailpit, MinIO)
docker compose -f docker-compose.dev.yml up -d

# Start dev servers (admin:3222, client:3555)
bun run devserver
