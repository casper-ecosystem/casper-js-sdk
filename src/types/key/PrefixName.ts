// A leaf module on purpose: nothing may be imported into it. Declaring
// `PrefixName` back in `Key.ts` makes that file the hub of an import cycle, and
// typedjson resolves its `() => AccountHash` thunk while `Account.ts` is still
// evaluating — `Cannot access 'AccountHash' before initialization`.

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
  SystemEntityRegistry = 'system-entity-registry-',
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
  EntryPoint = 'entry-point-',
  State = 'state-',
  RewardsHandling = 'rewards-handling-'
}
