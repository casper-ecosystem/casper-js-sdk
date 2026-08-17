#!/usr/bin/env bash
# Boots the local Casper 2.0 network, runs the e2e suite against it, and always
# tears the network down — a red run must not leave `casper-nctl` behind.
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

cleanup() {
  docker compose --project-directory e2e down
}
trap cleanup EXIT

docker compose --project-directory e2e up -d --wait

docker exec casper-nctl cat \
  /home/casper/casper-nctl/assets/net-1/faucet/secret_key.pem \
  > e2e/faucet_secret_key.pem

npx vitest run --config vitest.e2e.config.mts
