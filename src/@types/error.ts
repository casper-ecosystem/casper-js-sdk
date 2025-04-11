export enum ErrorCode {
  /// The requested Deploy was not found.
  NoSuchDeploy = -32000,
  /// The requested Block was not found.
  NoSuchBlock = -32001,
  /// Parsing the Key for a query failed.
  FailedToParseQueryKey = -32002,
  /// The query failed to find a result.
  QueryFailed = -32003,
  /// Executing the query failed.
  QueryFailedToExecute = -32004,
  /// Parsing the URef while getting a balance failed.
  FailedToParseGetBalanceURef = -32005,
  /// Failed to get the requested balance.
  FailedToGetBalance = -32006,
  /// Executing the query to retrieve the balance failed.
  GetBalanceFailedToExecute = -32007,
  /// The given Deploy cannot be executed as it is invalid.
  InvalidDeploy = -32008,
  /// The given account was not found.
  NoSuchAccount = -32009,
  /// Failed to get the requested dictionary URef.
  FailedToGetDictionaryURef = -32010,
  /// Failed to get the requested dictionary trie.
  FailedToGetTrie = -32011,
  /// The requested state root hash was not found.
  NoSuchStateRoot = -32012,
  /// The main purse for a given account hash does not exist.
  NoMainPurse = -32013,
  /// The requested Transaction was not found.
  NoSuchTransaction = -32014,
  /// Variant mismatch.
  VariantMismatch = -32015,
  /// The given Transaction cannot be executed as it is invalid.
  InvalidTransaction = -32016,
  /// The given Block could not be verified.
  InvalidBlock = -32017,
  /// Failed during a node request.
  NodeRequestFailed = -32018,
  /// The request could not be satisfied because an underlying function is disabled.
  FunctionIsDisabled = -32019,
  /// The requested addressable entity was not found.
  NoSuchAddressableEntity = -32020,
  /// The requested account has been migrated to an addressable entity.
  AccountMigratedToEntity = -32021,
  /// The requested reward was not found.
  NoRewardsFound = -32022,
  /// The switch block for the requested era was not found.
  SwitchBlockNotFound = -32023,
  /// The parent of the switch block for the requested era was not found.
  SwitchBlockParentNotFound = -32024,
  /// Cannot serve rewards stored in V1 format
  UnsupportedRewardsV1Request = -32025,
  /// Purse was not found for given identifier.
  PurseNotFound = -32026
}
