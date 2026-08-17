import { readFileSync } from 'fs';
import { config as loadDotenv } from 'dotenv';

import { KeyAlgorithm, PrivateKey } from '../src';

loadDotenv();

// Of the ports `e2e/docker-compose.yml` publishes for `makesoftware/casper-nctl`,
// only 11101 (JSON-RPC) and 18101 (SSE) serve anything — 14101/25101/28101 are
// published but dead.
export const NODE_URL = process.env.NODE_URL || 'http://127.0.0.1:11101/rpc';
export const NETWORK_NAME = process.env.NETWORK_NAME || 'casper-net-1';
export const EVENT_STREAM_URL =
  process.env.EVENT_STREAM_URL || 'http://127.0.0.1:18101/events';

const FAUCET_KEY_PATH =
  process.env.FAUCET_KEY_PATH || 'e2e/faucet_secret_key.pem';

/**
 * Loads the faucet's Ed25519 key: `FAUCET_PRIV_KEY` (hex) if set, otherwise the
 * PEM `e2e/run.sh` extracts from the running container.
 */
export function loadFaucetKey(): PrivateKey {
  if (process.env.FAUCET_PRIV_KEY) {
    return PrivateKey.fromHex(
      process.env.FAUCET_PRIV_KEY,
      KeyAlgorithm.ED25519
    );
  }

  let pem: string;
  try {
    pem = readFileSync(FAUCET_KEY_PATH, 'utf-8');
  } catch (err) {
    throw new Error(
      `Could not read faucet key at "${FAUCET_KEY_PATH}". Run e2e/run.sh ` +
        '(it extracts the key from the running container), or set ' +
        'FAUCET_PRIV_KEY to a hex-encoded private key.',
      { cause: err }
    );
  }

  return PrivateKey.fromPem(pem, KeyAlgorithm.ED25519);
}
