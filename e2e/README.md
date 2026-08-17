# e2e

Runs the SDK against a real Casper 2.x network booted from the
`makesoftware/casper-nctl` Docker image. Not part of the dev loop — the unit
suite (`npm run test:node:unit`) is.

## Running it

```bash
./e2e/run.sh
```

That boots the network, waits for the image's own healthcheck, extracts the
faucet key, runs the suite, and tears the network down again — including when
the suite fails.

To run against a node that is already up (faster while iterating):

```bash
docker compose --project-directory e2e up -d --wait
docker exec casper-nctl cat \
  /home/casper/casper-nctl/assets/net-1/faucet/secret_key.pem \
  > e2e/faucet_secret_key.pem
npx vitest run --config vitest.e2e.config.mts
```

`e2e/faucet_secret_key.pem` is a private key and is gitignored. Never commit it.

## Environment

Every variable has a default pointing at the compose network, so a local run
needs none of them.

| Variable | Default | Meaning |
| --- | --- | --- |
| `NODE_URL` | `http://127.0.0.1:11101/rpc` | JSON-RPC endpoint |
| `NETWORK_NAME` | `casper-net-1` | Chain name used when building transactions |
| `EVENT_STREAM_URL` | `http://127.0.0.1:18101/events` | SSE endpoint |
| `FAUCET_KEY_PATH` | `e2e/faucet_secret_key.pem` | Faucet secret key, PEM |
| `FAUCET_PRIV_KEY` | — | Base64 key body, accepted instead of the PEM path |
| `CASPER_IMAGE_TAG` | `v212` | Image tag `docker compose` boots |

## Verified against the image

Checked by hand against `makesoftware/casper-nctl:v212` and `:v210`, because
the port and path layout differs from the 1.x images:

- **JSON-RPC is `:11101/rpc`.** `:25101` does not serve it.
- **SSE is `:18101/events`.** `:14101` does not serve it.
- **The faucet key is at `/home/casper/casper-nctl/assets/net-1/faucet/secret_key.pem`**
  inside the container — *not* the 1.x `casper-node/utils/nctl/assets/...` path.
  Sibling directories: `assets/net-1/{bin,chainspec,daemon,faucet,nodes,users}`.
- **The faucet account is Ed25519.** The Secp256K1 write-path case therefore
  funds a fresh secp256k1 account from it rather than re-signing with it.
- The image ships a `HEALTHCHECK`, so `docker compose up -d --wait` blocks until
  the node is up — about 50s from cold. No fixed sleeps needed.
- Network shape the suite asserts against: `chainspec_name` `casper-net-1`,
  4 peers, `protocol_version` 2.0.0.

## Pinning a different node version

`CASPER_IMAGE_TAG=v210 ./e2e/run.sh` runs against another tag. The tags the
weekly matrix covers live in `e2e/supported-tags.json`, alongside the
`build_version` each one actually reports.

**A tag does not report its own version.** `v212` serves `build_version`
`2.1.1`, and `v210` serves `2.1.0` — every 2.x tag so far is one patch below its
own name. Nothing should derive a version from a tag string; boot the image and
read `info_get_status` instead. `scripts/check-node-version-drift.js` compares
live mainnet/testnet against the recorded numbers and is run weekly by
`.github/workflows/node-version-drift.yml`.

## Not covered, and why

**Wasm install and CEP-18 transfer.** Both wasm fixtures in `services/` are
built against the 1.x contract ABI and cannot install on a 2.x node:

- `erc20_token.wasm` (2023) → `ApiError::EarlyEndOfStream`
- `cep18.wasm` (2025) → `Interpreter error: host module doesn't export function with name casper_add_package_version`

The newest published `casper-ecosystem/cep18` release is v1.2.0 (April 2024),
which predates Casper 2.0, so there is no drop-in replacement. Restoring this
coverage needs a CEP-18 contract rebuilt against `casper-contract` 2.x; once
such a wasm exists, drop it in `services/` and the install + transfer +
`getDictionaryItemByIdentifier` balance check can go back into
`transaction.test.ts`.
