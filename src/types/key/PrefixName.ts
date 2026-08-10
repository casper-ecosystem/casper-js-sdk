// Kept in its own leaf module on purpose. `PrefixName` is needed by eight of
// the key types that `Key.ts` itself imports, so declaring it there made
// `Key.ts` the hub of an import cycle. Under webpack and under the CJS test
// path that cycle resolved by luck; in a real browser (native ESM) it threw
// `Cannot access 'AccountHash' before initialization`, because typedjson
// eagerly calls the `() => AccountHash` type thunk while `Account.ts` is
// still mid-evaluation. Nothing may be imported into this file.

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
