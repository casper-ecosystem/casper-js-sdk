// A leaf module on purpose, and nothing may be imported into it. `PrefixName`
// is needed by eight of the key types `Key.ts` imports, so declaring it there
// makes `Key.ts` the hub of an import cycle — harmless under webpack and CJS,
// but under native ESM typedjson calls the `() => AccountHash` type thunk while
// `Account.ts` is still evaluating, throwing `Cannot access 'AccountHash'
// before initialization`.

/**
 * Enum that defines prefixes used to identify different types of blockchain entities and objects.
 */
export enum PrefixName {
  Account = 'account-hash-',
  AddressableEntity = 'addressable-entity-',
  Hash = 'hash-',
  ContractPackageWasm = 'contract-package-wasm',
  ContractPackage = 'contract-package-',
  ContractWasm = 'contract-wasm-',
  Contract = 'contract-',
  URef = 'uref-',
  Transfer = 'transfer-',
  DeployInfo = 'deploy-',
  EraId = 'era-',
  Bid = 'bid-',
  Balance = 'balance-',
  Withdraw = 'withdraw-',
  Dictionary = 'dictionary-',
  SystemContractRegistry = 'system-contract-registry-',
  EraSummary = 'era-summary-',
  Unbond = 'unbond-',
  ChainspecRegistry = 'chainspec-registry-',
  EntityContract = 'entity-contract-',
  ChecksumRegistry = 'checksum-registry-',
  BidAddr = 'bid-addr-',
  Package = 'package-',
  Entity = 'entity-',
  ByteCode = 'byte-code-',
  Message = 'message-',
  NamedKey = 'named-key-',
  BlockGlobal = 'block-',
  BalanceHold = 'balance-hold-',
  EntryPoint = 'entry-point-'
}
