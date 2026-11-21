#!/usr/bin/env bash
set -Eeuo pipefail

# Build the Pages static output using the pinned Node 22 development image.
# Run Chromium using the matching Playwright package and browser image.
cd "$(dirname "${BASH_SOURCE[0]}")/.."

docker compose build portfolio
docker compose run --rm --no-deps portfolio sh -euc 'npm ci && npm run build'
docker compose run --rm --no-deps browser npm run test:e2e
