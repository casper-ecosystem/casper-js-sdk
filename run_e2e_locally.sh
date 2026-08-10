export FAUCET_PRIV_KEY=`cat /home/casperlabs-dev/DEV/src/casper-nctl/assets/net-1/users/user-1/secret_key.pem  | sed -n '2 p'`
export NODE_URL="http://127.0.0.1:7777/rpc"
export HTTP_EVENT_STREAM_URL="http://127.0.0.1:19999/events"
export HTTPS_EVENT_STREAM_URL="https://events.mainnet.casperlabs.io/events"
export NETWORK_NAME="casper-net-1"
export RUST_LOG="INFO"
export VERSION_QUERY='{"jsonrpc": "2.0", "id": "1", "method": "info_get_status"}'
export MAINNET_NODE_URL='https://rpc.mainnet.casperlabs.io/rpc'
export TESTNET_NODE_URL='https://rpc.testnet.casperlabs.io/rpc'

npm run test:node:e2e
