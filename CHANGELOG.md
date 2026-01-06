# Changelog

All notable changes to casper-js-sdk.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!--
  Please follow below structures.
  ## [1.1.1] - 2023-03-05
  ### Added
  ### Fixed
  ### Changed
  ### Removed
 -->

### [5.0.8] - 2026-01-06

### Fixed

- Issue with parsing `protocol_version_major` when it's null for `InvocationTarget's`

### [5.0.7] - 2025-12-04

### Added

- CEP-95 support for NFT transfers
- Documentation for `Transaction` builder
- Updated README.md
- Add protocol_major_version as optional property in `ByPackageHash` and `ByPackageName` invocations

### Fixed

- Issue with speculative client response deserialization
- Issue when `gas_price` not set to value indicated in payment
- Optional data type in NFT transfer utils

### Changed

- Deprecate `getStateItem` in favor of `queryLatestGlobalState`

### [5.0.6] - 2025-05-01

### Fixed

- Issue with speculative client response deserialization

### [5.0.5] - 2025-04-23

### Fixed

- Issue with circular dependencies for method declaration

### [5.0.4] - 2025-04-22

### Added

- Query latest balance utility function for Casper network

### [5.0.3] - 2025-04-14

### Fixed

- Issue with circular dependencies by @alexmyshchyshyn in https://github.com/casper-ecosystem/casper-js-sdk/pull/557

**Full Changelog**: https://github.com/casper-ecosystem/casper-js-sdk/compare/5.0.2...5.0.3

### [5.0.2] - 2025-04-11

### Fixed

- Issue with parsing named keys for AccountInfo and Contracts by @alexmyshchyshyn in https://github.com/casper-ecosystem/casper-js-sdk/pull/552
- Parsing of arguments keys for transaction V1 by @alexmyshchyshyn in https://github.com/casper-ecosystem/casper-js-sdk/pull/554

### Changed

- Replace key-encoder lib with equal internal implementation by @Comp0te in https://github.com/casper-ecosystem/casper-js-sdk/pull/551
- Extended the CasperNetwork utility getTransaction method with a fallb… by @ihor in https://github.com/casper-ecosystem/casper-js-sdk/pull/555

### Added

- Support for prefix entity-contract- for contract hashes by @alexmyshchyshyn in https://github.com/casper-ecosystem/casper-js-sdk/pull/553

**Full Changelog**: https://github.com/casper-ecosystem/casper-js-sdk/compare/5.0.1...5.0.2

### [5.0.1] - 2025-04-04

### Fixed

- `token_hash` args type by @Comp0te in https://github.com/casper-ecosystem/casper-js-sdk/pull/545
- Parsing null execution results for `1.5.x` deploys and transactions by @alexmyshchyshyn in https://github.com/casper-ecosystem/casper-js-sdk/pull/546

### Added

- `toBytes()` method to `Transaction` class. by @davidatwhiletrue in https://github.com/casper-ecosystem/casper-js-sdk/pull/544
- Dynamic payment amount for deploys by @alexmyshchyshyn in https://github.com/casper-ecosystem/casper-js-sdk/pull/547
- `CasperNetwork` utility usage documentation by @alexmyshchyshyn in https://github.com/casper-ecosystem/casper-js-sdk/pull/550

### Changed

- hash type to `TransactionHash` by @alexmyshchyshyn in https://github.com/casper-ecosystem/casper-js-sdk/pull/549

**Full Changelog**: https://github.com/casper-ecosystem/casper-js-sdk/compare/5.0.0...5.0.1

### [5.0.0] - 2025-03-27

This version is identical to `5.0.16-beta2`. Please review the changes in the previous beta releases, and refer to the [Migration guide](https://github.com/make-software/casper-net-sdk/blob/master/Docs/Articles/Casper20MigrationGuide.md) if you’re updating a project from `v2.x`.

### [5.0.16-beta2] - 2025-03-19

### Changed

- Handle message keys contract prefixes in https://github.com/casper-ecosystem/casper-js-sdk/pull/534
- Update gas price for utils in https://github.com/casper-ecosystem/casper-js-sdk/pull/538

### Added

- Refund and Current Gas Price fields parsing for execution results in https://github.com/casper-ecosystem/casper-js-sdk/pull/533
- Methods to wait for transaction / deploy in https://github.com/casper-ecosystem/casper-js-sdk/pull/535
- Provide possibility to specify the gas price tolerance when creating Transactions and Deploys in https://github.com/casper-ecosystem/casper-js-sdk/pull/536

**Full Changelog**: https://github.com/casper-ecosystem/casper-js-sdk/compare/5.0.15-beta2...5.0.16-beta2

### [5.0.15-beta2] - 2025-03-15

### Fixed

- Issue with parsing Transaction with EraId Key in https://github.com/casper-ecosystem/casper-js-sdk/pull/530

**Full Changelog**: https://github.com/casper-ecosystem/casper-js-sdk/compare/5.0.14-beta2...5.0.15-beta2

### [5.0.14-beta2] - 2025-03-10

### Fixed

- Issue with parsing deploy in https://github.com/casper-ecosystem/casper-js-sdk/pull/528

**Full Changelog**: https://github.com/casper-ecosystem/casper-js-sdk/compare/5.0.13-beta2...5.0.14-beta2

### [5.0.13-beta2] - 2025-03-07

### Fixed

- Issue with serialization for ParamBlockIdentifier instance in https://github.com/casper-ecosystem/casper-js-sdk/pull/523
- Issue with parsing add_reservation Transaction with Any type in https://github.com/casper-ecosystem/casper-js-sdk/pull/526

### Added

- Possibility to export/import `public key` from/in PEM in https://github.com/casper-ecosystem/casper-js-sdk/pull/524
- `addArgToDeploy` method to be able to modify `Deploy's session` arguments in https://github.com/casper-ecosystem/casper-js-sdk/pull/525

**Full Changelog**: https://github.com/casper-ecosystem/casper-js-sdk/compare/5.0.12-beta2...5.0.13-beta2

### [5.0.12-beta2] - 2025-02-27

### Fixed

- Parsing clvalues and cltypes in https://github.com/casper-ecosystem/casper-js-sdk/pull/520
- Rewrite and fix the existing SSE Client implementation in https://github.com/casper-ecosystem/casper-js-sdk/pull/521

**Full Changelog**: https://github.com/casper-ecosystem/casper-js-sdk/compare/5.0.11-beta2...5.0.12-beta2

### [5.0.11-beta2] - 2025-02-24

### Changed

- Updated `cost` / `consumed` for executions result V1 by @alexmyshchyshyn in https://github.com/casper-ecosystem/casper-js-sdk/pull/517

### Fixed

- Fixed `toInfoGetTransactionResult` method to parse V1 deploy result by @alexmyshchyshyn in https://github.com/casper-ecosystem/casper-js-sdk/pull/518
- Fixed construction of Uref and EraID for Transaction Session builder by @alexmyshchyshyn in https://github.com/casper-ecosystem/casper-js-sdk/pull/516

**Full Changelog**: https://github.com/casper-ecosystem/casper-js-sdk/compare/5.0.10-beta2...5.0.11-beta2

### [5.0.10-beta2] - 2025-02-20

### Fixed

- Fixed issue with importing of `KeyTypeID`
- Fixed vulnerability in the elliptic package by @Comp0te in https://github.com/casper-ecosystem/casper-js-sdk/pull/514

**Full Changelog**: https://github.com/casper-ecosystem/casper-js-sdk/compare/5.0.9-beta2...5.0.10-beta2

### [5.0.9-beta2] - 2025-02-12

### Added

- `transferId` to `transaction / deploy` builders

### Changed

- For `HttpHandler` added a possibility to set referer header and choose between axios / fetch

### [5.0.8-beta2] - 2025-02-05

### Added

- Parsing of contract entry points between `Casper 1.5`.x and `Casper 2.0`
- New get auction info v2 method support
- [Transaction utils](src/utils)

### Fixed

- Seigniorage allocations structure from `Delegator` to `DelegatorKind`
- Parsing write account for `Transform`
- `info_get_status` response parsing

### Changed

- Renamed `RpcAddressableEntity` to `AddressableEntity` to improve naming clarity and consistency.

### [5.0.7-beta2] - 2025-01-31

### Fixed

- Un/re-delegate flow with `payment` property

### [5.0.6-beta2] - 2025-01-30

### Added

- Extended `BidAddr`.

### Fixed

- Issue with `BlockTransaction` serialization.
- Corrected the `rewardedSignatures` type to ensure accuracy.

### Changed

- Moved `newCL` methods into the `CLValue` class for a more streamlined `CLValue` creation process.
- Added the ability to set a contract hash for the transaction builder, enhancing flexibility.
- Updated migration guide from v2 to v5 for a smoother transition.

### [5.0.5-beta2] - 2025-01-22

### Added

- `CasperNetwork` abstraction that helps to easily handle Casper 1.5 and 2.0 versions

### Fixed

- Issue with `Conversions.motesToCSPR` and `Conversions.csprToMotes` Update `makeCep18TransferDeploy`
- Issue with `CLValueMap.fromBytes`

### [5.0.4-beta2] - 2025-01-16

### Added

- Ability to build `Deploy` with `TransactionBuilder` `buildFor1_5` method
- Update `makeCep18TransferDeploy` to use `contractPackageHash` instead of `contractHash`
- New auction contract hash for integration-test network, fixed deserialization of CES schema, Update contract package parsing compatible 1.x, added unit tests to cover mentioned bugs / features

### Fixed

- Issue with PEM file creation and parsing
- Issue with typo in transaction scheduling creation
- Issue with compatible transforms parsing
- Issues with `@jsonArrayMember`

### [5.0.3-beta2] - 2024-01-25

### Added

- Transform parsing functions
- `fromJSON` method for `InfoGetTransactionResultV1Compatible`

### Fixed

- Issue with TransactionEntryPoint deserialization

### [5.0.2-beta2] - 2024-12-24

### Fixed

- CLValueMap deserialization from bytes
- Deserialization of Deploy from RPC

### [5.0.1-beta2] - 2024-12-24

### Fixed

- `TransactionEntryPoint` serialization in https://github.com/casper-ecosystem/casper-js-sdk/pull/482

### Added

- `parseAsWriteAccount` method / getter for `TransformKind` data, unit tests for different scenarios of parsing `TransformKind` data
- `RawWriteAccount` class for parsing `WriteAccount` data

### Changed

- `RawWriteCLValue` / `WriteCLValue` values from `Args` to `CLValue`

### [5.0.0-beta2] - 2024-12-23

### Added

- Check for `WriteCLValue` to `TransformKind`, added `executionResultsV1` to `InfoGetDeployResult` by @alexmyshchyshyn in https://github.com/casper-ecosystem/casper-js-sdk/pull/481

### Fixed

- `Tuple3` constructor inconsistency, aligned Numerics `CLValue` by value type by @alexmyshchyshyn in https://github.com/casper-ecosystem/casper-js-sdk/pull/476
- Offset is outside the bounds of the `DataView` issue for `TransactionV1` by @alexmyshchyshyn in https://github.com/casper-ecosystem/casper-js-sdk/pull/479

### Changed

- Aligned casing for `fromJSON` and `toJSON`, updated type for chain name for utils by @alexmyshchyshyn in https://github.com/casper-ecosystem/casper-js-sdk/pull/477
- Feat sync keys and fixes by @Comp0te in https://github.com/casper-ecosystem/casper-js-sdk/pull/480

**Full Changelog**: https://github.com/casper-ecosystem/casper-js-sdk/compare/5.0.0-beta1...5.0.0-beta2

### [5.0.0-beta1] - 2024-12-20

### Added

- Feat utils and fixes by @Comp0te in https://github.com/casper-ecosystem/casper-js-sdk/pull/464 and https://github.com/casper-ecosystem/casper-js-sdk/pull/467
- Added `toJSON` method for each `CLValue` representation by @alexmyshchyshyn in https://github.com/casper-ecosystem/casper-js-sdk/pull/470
- Added `transaction` builders by @alexmyshchyshyn in https://github.com/casper-ecosystem/casper-js-sdk/pull/473

### Changed

- Updated `TransactionRuntime` / `TransactionTarget` serialization by @alexmyshchyshyn in https://github.com/casper-ecosystem/casper-js-sdk/pull/466
- Updated `MessageTopic` serialization, `MessageAddr` key parsing by @alexmyshchyshyn in https://github.com/casper-ecosystem/casper-js-sdk/pull/472

### Fixed

- Transform Raw serialization, removed message topics from `AddressableEntity`, `EntryPointPayment` change by @alexmyshchyshyn in https://github.com/casper-ecosystem/casper-js-sdk/pull/468
- Map and List `fromBytes` methods by @Comp0te in https://github.com/casper-ecosystem/casper-js-sdk/pull/469
- Derializers by @Comp0te in https://github.com/casper-ecosystem/casper-js-sdk/pull/471

**Full Changelog**: https://github.com/casper-ecosystem/casper-js-sdk/compare/5.0.0-rc8...5.0.0-beta1

## [5.0.0-rc8] - 2024-12-16

### Added

- `makeCep18TransferDeploy` and `makeNftTransferDeploy` utils
- `PrivateKey.toBytes` method
- Rename Key's TypeID to KeyTypeID
- Add initial list values to `CLValueList.newCLList`
- `Args.getByName` getter
- Remove unused `Effects` class
- Improvements for `TransformKind` transformation parsing

### Fixed

- Issue with `ed25519` private key length

## [5.0.0-rc7] - 2024-12-13

### Added

- Checksummed `PublicKey` hex
- Improvements in `Transaction` creation from JSON
- Ability to send `Deploy` with the `RPC.putTransaction` method
- Renamed `StoredValue.prepaid` to `StoredValue.prepayment`
- Improvements in RPC client error processing

### Fixed

- Issue with implicit `axios` dependency
- Issue with `secp256k1` bytes
- Issue with `StepPayload.executionEffects` annotations
- Issue with `ExecutionResult` parsing from JSON

## [5.0.0-rc6] - 2024-12-08

### Added

- Basic documentation for Casper 2.0
- **Enhanced `CLValue.newCLOption` Method**:
  - Automatic resolution of the option type from `inner` when provided.
  - Optional `clType` parameter when `inner` is present.
  - Defaults to `CLTypeAny` if `inner` is `null` and `clType` is not specified.
- **New Method**:
  - **`ExecutionResult.toJSON(executionResult: ExecutionResult): object`**
    - Converts an `ExecutionResult` instance to a plain JSON object using the `TypedJSON` serializer.

### Fixed

- Issue with parsing in RPC `getDictionaryItem` method

## [5.0.0-rc5] - 2024-12-01

### Added

- DelegatorKind support fot Bid
- Calltable serialization for `TransactionV1` - [Reference of changes](https://github.com/casper-network/casper-node/pull/4823)
- Custom ttl for `makeCsprTransferDeploy` and `makeAuctionManagerDeploy`

### Changed

- `TransactionV1` structure. From now on a TransactionV1 consists of `hash`, `payload` and `approvals`. `payload` is a merge of `header` and `body` concepts from before.
- Updated documentation

## [5.0.0-rc4] - 2024-11-25

### Added

- `makeCsprTransferDeploy` and `makeAuctionManagerDeploy` utils
- **README.md**: Introduced a comprehensive README file, including detailed information about the SDK, setup instructions, and usage examples.
- **Migration Guide**: Added a basic migration guide to assist developers in transitioning to the new SDK version with updated types and RPC.
- `getDeploySizeInBytes` static method for Deploy

### Removed

- DeployParams class due to deprecation, renamed `fromHeaderAndItems` function to the `makeDeploy` due to consistency with previous methods names

### Changed

- Made `id` optional in TransferDeployItem.newTransfer

## [5.0.0-rc3] - 2024-11-19

### Added

- Deserializer function for InfoGetDeployResultV1Compatible - `fromJSON`
- Annotate RPC request params

### Fixed

- Args and CLType / CLValue parsers
- RPC serialization
- Updated names for RPC response/request
- Deserializer for Transform class
- Removed unnecessary object declaration for deploy/transaction during serialization

**Full Changelog**: https://github.com/casper-ecosystem/casper-js-sdk/compare/5.0.0-rc2...5.0.0-rc3

## [5.0.0-rc1] - 2024-11-12

### Added

- **Caution!** This release contains rewritten classes/CLValue/CLType from scratch, there are some breaking changes so consider it before upgrading.

### Changed

- We’ve entirely rewritten the casper-js-sdk from the ground up to provide a more efficient, flexible, and developer-friendly experience. This major release includes significant changes to the SDK’s architecture, type system, and API methods, introducing new types and RPC capabilities to support the latest Casper blockchain features.
- Updated Type System:

  - Refined and expanded CLType and CLValue implementations for stronger type-checking and better type safety.
  - Introduced new types to support complex data structures and improved encoding/decoding of values for compatibility with the latest Casper updates.

- Enhanced RPC Methods:
  - New RPC methods provide richer interaction capabilities, supporting advanced transactions, streamlined data retrieval, and improved error handling.
  - Added support for more granular transaction controls, allowing for better customizations of gas fees, transaction targets, and entry points.

## [2.15.6] - 2024-04-18

### Fixed

- Backfilled missing variants of `TransformValue` type (AddInt32|AddUInt64|AddUInt128|AddUInt256|WriteEraInfo|WriteBid|WriteWithdraw|Failure|WriteUnbonding)
- Backfilled `operations` field in `Effect` type
- Exported all types in `services/types` module so that they can be used by end users

## [2.15.5] - 2024-04-18

### Fixed

- invalid seed usage in the HDKey ([#410](https://github.com/casper-ecosystem/casper-js-sdk/issues/410))

## [2.15.4] - 2024-02-12

### Fixed

- [`newTransferWithOptionalTransferId` now uses `PublicKey` as a target instead of `AccountHash`.](https://github.com/casper-ecosystem/casper-js-sdk/issues/385)
- [Fixed implementation of `EventStream`. Previous one had problems when there was two events emmited at the same time](https://github.com/casper-ecosystem/casper-js-sdk/issues/379)
- [Fixed imports problem in modern TS environment](https://github.com/casper-ecosystem/casper-js-sdk/issues/386)

## [2.15.3] - 2023-10-16

### Fixed

- Replace legacy `sendAsync` with `request` ([#373](https://github.com/casper-ecosystem/casper-js-sdk/pull/373))

[2.15.3]: https://github.com/casper-ecosystem/casper-js-sdk/compare/2.15.2...2.15.3

## [2.15.2] - 2023-8-4

### Fixed

- Reintroduced `getStateRootHash` fix as its not specific for `casper-node 1.5` ([#339](https://github.com/casper-ecosystem/casper-js-sdk/pull/339))

## [2.15.1] - 2023-8-4

### Fixed

- Reverted broken 1.4.x compatibility. The version compatible with protocol version 1.5.x will be released as a separate one. ([#351](https://github.com/casper-ecosystem/casper-js-sdk/issues/351))

## [2.15.0] - 2023-8-3

### Added

- `checkApproval` optional parameter (`false` by default) to the `deploy` method of `CasperServiceByJsonRPC` class. ([#348](https://github.com/casper-ecosystem/casper-js-sdk/pull/348))

### Fixed

- Fixed JSON RPC request issues with 1.5 node. ([#339](https://github.com/casper-ecosystem/casper-js-sdk/pull/339),[#344](https://github.com/casper-ecosystem/casper-js-sdk/pull/344))

### Changed

- `waitForDeploy` method of `CasperServiceByJsonRPC` class now supports deploy hash in string

## [2.14.0] - 2023-7-11

### Fixed

- `StoredValue` TypedJSON serialization issue. ([#312](https://github.com/casper-ecosystem/casper-js-sdk/pull/312))

### Added

- Added `BaseSigner` class for further wallet & signer integrations, support [`CasperWallet`](https://github.com/make-software/casper-wallet). ([#300](https://github.com/casper-ecosystem/casper-js-sdk/pull/300))

- Support node URL without `/rpc` like `casper-client` does. ([#298](https://github.com/casper-ecosystem/casper-js-sdk/pull/298))

- Added `to` field to the `TransferJson`. ([#312](https://github.com/casper-ecosystem/casper-js-sdk/pull/312))

## 2.13.3

### Fixed

- Fixed to support 64 bytes Ed25519 private key generated using v2.10

## 2.13.2

### Fixed

- Fix for wrong signatures being generated for SECP256K1 keys - it was missing `der: false` setting in a function call

## 2.13.1

### Added

- New method `makeDeployWithAutoTimestamp` that fetches timestamp and then uses it to create deploy header. Recommended to use it in browsers env.

## 2.13.0

### Added

- Added `getEraSummary`
- Added `getEraSummaryByBlockHeight`
- Added Ed25519 HD Wallet support
- Added `timeout` param to all CasperServiceByJsonRPC methods
- Deterministic Asymmetric keys can be generated by using HD Wallet following [BIP-0032](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki)

### Changed

- Switched from `tweetnacl-ts` and `eccrypto` to `noble` libraries

## 2.12.1

### Fixed

- Fix in CI job that broke README.md attached to NPM Package and tgz archive to the release
- Fix links to the examples in docs

## 2.12.0

### Added

- HTTPS Event stream without breaking browsers support
- New docs generator
- Add missing types for `ExecutionResult`
- Added missing CLType `Any`
- Added tests in browser env
- Added source maps to build version

### Changed

- Move generated docs to github pages

## 2.11.1

### Removed

- Support for HTTPS/HTTP2 EventStream - as it caused problems in browser environment

## 2.11.0

### Added

- Support for checksumed mixed-case publickeys
- Support for HTTPS EventStream
- Extended test cases for `CasperServiceByJsonRPC`

### Changed

- `CLPublicKey.toHex()` now by default returns checksummed value. You can use it in legacy mode by calling it `CLPublicKey.toHex(false)` that way
- `CLPublicKey.fromHex()` now can get two arguments. The first one is string containing hex encoded public key, and the second one is a boolean value that indicates if you want to run checksum validation. When `true` is passed it will throw an error. Otherwise it will log warn to the console. We added this because we want to support users who store the non-checksumed publickeys and need time to adapt
- `AccountHash` now can be serialized to bytes (it's an alias)
- Some internal optimalization (in `matchByteParserByCLType`)

### Fixed

- Issues with parsing broken deploys

## 2.10.2

### Fixed

- Updated ts-results dependency of our own fork to fix some compiling issues

## 2.10.1

### Fixed

- Updated exports so more conversion fuctions are now public
- Added typings to `JsonExecutableDeployItem`
- Fixed how the `EventStream` URL is build
- Replaced `ts-results` dependency for our [own fork](https://github.com/CasperLabs/ts-results) because of the conflicting config

## 2.10.0

### Added

- Added signatures verification in `validateDeploy` method.
- Added `queryBalance` (will be supported in casper-node 1.5 - RPC name `query_balance`) method in `CasperServiceByJsonRPC`.
- Added `speculativeDeploy` (will be supported in casper-node 1.5 - RPC name `speculative_exec`) method in `CasperServiceByJsonRPC`.
- Better documented RPC methods .
- Added `csprToMotes` - motes/cspr converter in `Conversions`.
- Extended PublicKey class API with two new methods, allowing to get publicKey tag type or its corresponding signature algo type.

### Fixed

- `getStateRootHash` (RPC name `chain_get_state_root_hash`) can now correctly support `block_hash` argument.

## 2.9.1

### Fixed

- Got rid of unnecessary instanceof.
- Reverted StoredValue and added `{ rawData: boolean }` to `getDictionaryItemByName` and `getDictionaryItemByURef`.

## 2.9.0

### Added

- Now all stored value contains raw JSON from RPC under `raw` key.
- New method `getValidatorsInfoByBlockHeight` added.

### Changed

- `targetPublicKeyHex` is now optional in `Signer` class.

## 2.8.0

### Added

- Added support to `CLPublicKey` passed as argument to `CLKey` (it gets serialized to `account-hash` when serializing).
- New `Contracts` class that basically acts as contract client (possible to install WASM, call an entrypoint, query state or dictionary).
- Added `getDictionaryItemByName` that uses `state_get_dictionary_item` with `dictionary_name` and `dictionary_item_key`
- Added `sign` and `send` method on `Deploy` class.

## 2.7.9

### Fixed

- Fixed problems with CLResult when it got created using different version of ts-results.

## 2.7.8

### Fixed

- Fixed problems with deserialization Tuples containing CLType which includes length parameter (eg. CLByteArray).

## 2.7.7

### Changed

- Version 2.0 is now @latest.
- README updated.

## 2.7.6

### Fixed

- Fixes wrong logic in newTransferWithOptionalTransferId() method.

## 2.7.5

### Fixed

- Fixes problems with Lists containing multiple Keys containing Hash or ByteArray.
- Fixes problem with ByteArray with size different than 32 bytes.

## 2.7.4

### Fixed

- Fixes problems with `getBlockInfo` and mixed case block hashes.

## 2.7.3

### Added

- Added types missing in OpenRPC library

## 2.7.2

### Fixed

- Fix for bundling all of the existing types defined in the library.

## 2.7.1

### Fixed

- Added support for mixed case hex representation of public keys introduced in `casper-node` `1.4.2`.

## 2.7.0

### Changed

- Now `target` in transfer is represented by `PublicKey` instead of `account-hash`.

## 2.6.2

### Added

- Now minimal bundle without any polyfills included is a part of distribution package.

## 2.6.1

### Fixed

- Added workaround for historical deploys with invalid serialized `0`.

## 2.6.0

### Added

- Added `CasperProvider`

## 2.5.2

### Fixed

- Problem when serializing U128, U256 ad U512 `toBytes`.

## 2.5.1

### Fixed

- Added stronger validation to `PublicKey.fromHex` method
- Fix for deploy's `execution_result` type signatures
- Fix instanceof problem in `CLValueParser` which caused problems when two different versions of SDK was used in one project
- Signer methods fixes

## 2.5.0

### Added

- `signMessage` - added method to sign arbitrary string message
- `verifyMessageSignature` - added method to verify signature of arbitrary string message

## 2.4.1

### Fixed

- `EventStream` - fixed problems with multiple data chunks parsing

## 2.4.0

### Added

- `DeployWatcher` added

## 2.3.0

### Added

- `state_get_dictionary_item` with URef support in `getDictionaryItemByURef` implemented

## 2.2.3

### Fixed

- `StoredValue` parsing access param hotfixed

## 2.2.2

### Fixed

- `CLMap` fix for empty maps from bytes
- `CLMap` replaced problematic Map implementation

## 2.2.1

### Fixed

- `EventStream` now properly handle invalid JSONs

## 2.2.0

### Added

- `EventStream` added

## 2.1.0

### Fixed

- `state-get-item` due to RPC changes
- `CLList` as empty list initialization from JSON

### Added

- `getBlockTransfers`, `getEraInfoBySwitchBlock`, `getEraInfoBySwitchBlockHeight` methods to `CasperServiceByJsonRPC`

## 2.0.1

### Changed

- `DeployUtil.deployFromJson` returns now `Result<Deploy, Error>` instead of `Deploy | undefined`. `Error` has a `message` inside.

## 2.0.0

### Changed

- Caution! This release contains rewritten CLValue from scratch, there are some breaking changes so consider it before upgrading.
- Removed `CLTypedAndToBytesHelper` to have consistent way of creating new CLValues by using `new CLBool(true)` or `CLValueBuilder.bool(true)`
- Removed `CLTypeHelper` have consistent way of creating new CLValues by using `new CLBoolType()` or `CLTypeBuilder.bool()`
- `CLValue` static methods now are moved to `CLValueBuilder` eg. `CLValueBuilder.u512`
- Every class inheriting from `CLValue` is now named with `CL` prefix, bigger naming changes:
  - `StringValue` -> `CLString`
  - `KeyValue` -> `CLKey`
  - `MapValue` -> `CLMap`
  - `Option` -> `CLOption`
- There are API changes in `CLResult`

```
const myTypesComplex = {
  ok: new CLListType(new CLListType(new CLU8Type())),
  err: new CLOptionType(new CLListType(new CLListType(new CLU8Type())))
};

const myOkComplexRes = new CLResult( Ok(new CLList([new CLList([new CLU8(5), new CLU8(10), new CLU8(15)])])), myTypesComplex );
```

- There are API changes in `CLOption` - now it requires `Some` or `None` wrappers as argument (from `ts-result` library).
- Now all the serialization methods are not connected to `CLValue` anymore - `toJSON`, `fromJSON`, `toBytes`, `fromBytes` needs to be called with `CLValueParsers` eg. `CLValueParser.toJSON(CLValueBuilder.string("ABC"))`
- Renamed methods in `CLPublicKey`:
  - `toAccountHex` -> `toHex` - old name led to misunderstandings as in fact this is hex representation of `public-key` prefixed with key-type.
  - added method `toAccountHashStr` - this methods returns string containing account hash in hex form prefixed with `account-hash-`.

## 1.4.4

### Changed

- Experimental release with `@next` tag.

## 1.4.3

### Changed

- Changed repo name and npm package name from `casper-client-sdk` to `casper-js-sdk`.

## 1.4.2

### Added

- `newTransferWithoutObligatoryId` renamed to `newTransferWithOptionalTransferId`

## 1.4.1

### Added

- `newTransferWithoutObligatoryId` restores the function that gives abilitity to send transfer without providing id.

## 1.4.0

### Changed

- `Signer.sign` now requires deploy in JSON format, `public-key hex` of a sender and `public-key hex` of a target.

## 1.3.4

### Added

- `Signer.getVersion` returns running version of Signer.

## 1.3.3

### Fixed

- `Keys.SECP256K1.new()` and other SECP256K1 releated methods now can work in a browser environment.

## 1.3.2

### Added

- `DeployUtil.deployToBytes(deploy)` returns an `Uint8Array`, which is a byte representation of a deploy.

## 1.3.1

### Changed

- Added `newTransferToUniqAddress` and `UniqAddress`.
- Fix in `newTransfer` - `id` now can be `0`

## 1.3.0

### Changed

- Removed EventStore from codebase.
- `CasperClient.getDeployByHashFromRPC` is now `CasperClient.getDeploy`.
- Fixed problems with `deployFromJson` caused by missing support for deserialization TTL values other than `ms`.

## 1.2.0

### Changed

- BIP-44 Index changed from `748` to `506`. It follows https://github.com/satoshilabs/slips/blob/master/slip-0044.md. All secret and public keys dervied using `CasperHDKey` class will change.

## 1.1.0

### Changed

- `transfer-id` is required parameter in `DeployUtils.newTransfer`.

## 1.0.44

### Added

- Support `disconnectFromSite` method from the Signer.

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

<!-- Add version compare links here -->

[unreleased]: https://github.com/casper-ecosystem/casper-js-sdk/compare/2.14.0...dev
[2.14.0]: https://github.com/casper-ecosystem/casper-js-sdk/compare/2.13.3...2.14.0
