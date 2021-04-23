# Changelog

All notable changes to casper-client-sdk.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 1.0.43

### Fixed

- Missign interface for `getActivePublicKey` method from the Signer.

## 1.0.42

### Added

- Support `getActivePublicKey` method from the Signer.

## 1.0.41

### Added

- `DeployUtils.deployFromJson` verifies `Deploy`'s `hash` and `bodyHash`. If not matching return `undefined`, so the interface doesn't change.

## 1.0.40

### Changed

- New url for docs.

## 1.0.39

### Fixed

- Reverted usage of `TextEncoder` to support Node.js versions < 11.

## 1.0.38

### Fixed

- Problem with U32 deserialization (and all values that uses Buffer polyfill).

## 1.0.37

### Changed

- Changed the default `Deploy`'s ttl from 1h to 30min.

## 1.0.36

### Fixed

- Fixed Delegator interface shape

## 1.0.35

### Changed

- Validate the size of the `Deploy`. Now `CasperServiceByJsonRPC.deploy` throws an error if the size of the deploy is larger then 1 megabyte.`

## 1.0.34

### Fixed

- Problems with Buffer polyfill not working in browser

## 1.0.32

### Added

- `CasperServiceByJsonRPC.getBlockInfoByHeight(height)`

### Fixed

- `CasperServiceByJsonRPC.getBlockInfo(hash)` to return requested block, not the last one.

## 1.0.25

### Added

- Added UMD bundle into npm package.

## 1.0.24

### Added

- Adds `protocol_version` to the `JsonHeader`.

### Fixed

- Fixes `ValidatorInfoResult` for casper-node ^0.9.0 (creates `AuctionState` interface).

## 1.0.23

### Changed

- Removes use of `Buffer` in `parseKeyPair()` and instead creates new `Uint8Array` concatenating public and private keys for use as secret key in Ed25519 key pair.

## 1.0.22

### Fixed

- Parsing `ExecutableDeployItem`'s `StoredContractByHash` from JSON to the `ExecutableDeployItem` object.

## 1.0.21

### Added

- `CasperClient.getDeployByHashFromRPC` allows for getting `Deploy` instance from the Node's RPC.

### Fixed

- Secp keys generator returns `Uint8Array` instead of `Buffer`.

### Changed

- `CLValue.publicKey` accepts `PublicKey` object.

## 1.0.20

### Fixed

- Deserialize `Deploy.hash` to `Uint8Array` instead of `Buffer`.

## 1.0.19

### Added

- `CLValue.isList` and `CLValue.asList`.

### Fixed

- BytesArrayValue's fromBytes.

## 1.0.18

### Added

- Partial support for the Contract object under StoredValue.

### Fixed

- Deploy's body hash derivation.

## 1.0.17

### Added

- Added `DeployUtils.addArgToDeploy(deploy: Deploy, name: string, value: CLValue)` to be able to modify Deploy's session arguments. It creates a new deploy instance. Can not be used on signed deploys.

### Changed

- Default `gasPrice` changed from `10` to `1`.
- Casper balances checks return `BigNumber` now.

## 1.0.15

### Added

- Started using CHANGELOG.md.

### Changed

- Changed CLValue's `value` to `value()` and `remainder` to `remainder()`.
