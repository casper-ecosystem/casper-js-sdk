export FAUCET_PRIV_KEY=`cat /home/casperlabs-dev/DEV/src/casper-nctl/assets/net-1/users/user-1/secret_key.pem  | sed -n '2 p'`
export NODE_URL="http://127.0.0.1:7777/rpc"
export HTTP_EVENT_STREAM_URL="http://127.0.0.1:19999/events"
export HTTPS_EVENT_STREAM_URL="https://events.mainnet.casperlabs.io/events"
export NETWORK_NAME="casper-net-1"
export RUST_LOG="INFO"
export VERSION_QUERY='{"jsonrpc": "2.0", "id": "1", "method": "info_get_status"}'
export MAINNET_NODE_URL='https://rpc.mainnet.casperlabs.io/rpc'
export TESTNET_NODE_URL='https://rpc.testnet.casperlabs.io/rpc'

# The e2e config sets `passWithNoTests`, and `e2e/` currently holds only
# `config.ts` and the wasm fixtures. Without the warning below this script exits
# 0 having executed nothing, reading exactly like a passing run against a node.
if ! ls e2e/**/*.test.ts e2e/*.test.ts >/dev/null 2>&1; then
  echo
  echo "WARNING: e2e/ contains no *.test.ts files — there is nothing to run."
  echo "         The command below will exit 0 without testing your node."
  echo
fi

npm run test:node:e2e
