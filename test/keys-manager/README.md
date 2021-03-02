# Casper Keys Manager

## Install

### Compile Account Code (Smart Contracts).
It creates a WASM file used by JS code.
```bash
$ cd contract
$ cargo build --release
```

### Install JS packages
```bash
$ cd client
$ npm install
```

## Prepare nctl network.
1. Setup [nctl](https://github.com/CasperLabs/casper-node/tree/master/utils/nctl)
2. Update `client/src/keys-manager.js`:
    - Set `baseKeyPath` to your nctl faucet key.

## Run
```bash
$ cd client
$ node src/keys-manager.js
$ node src/keys-manager-set-all.js
```

## Test
```bash
$ cd client
npm test
```
