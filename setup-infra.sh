#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Remove old/wrong sudoers entry if exists, add correct one
sed -i '' '/NOPASSWD:.*docker compose/d' /etc/sudoers
echo "$SUDO_USER ALL=(ALL) NOPASSWD: /usr/local/bin/docker compose" >> /etc/sudoers

export PATH="/opt/local/bin:$PATH"

docker compose -f "$SCRIPT_DIR/docker-compose.dev.yml" up -d

echo ""
echo "Infra is up. Running containers:"
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'
