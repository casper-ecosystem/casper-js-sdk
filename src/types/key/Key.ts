import { jsonObject, jsonMember } from 'typedjson';
import { PrefixName } from './PrefixName';
import { AccountHash } from './Account';
import { Hash } from './Hash';
import { TransferHash } from './Transfer';
import { Era } from './Era';
import { EntityAddr } from './EntityAddr';
import { BidAddr } from './BidAddr';
import { ByteCode } from './ByteCode';
import { MessageAddr } from './MessageAddr';
import { NamedKeyAddr } from './NewNamedKeyAddr';
import { BlockGlobalAddr } from './BlockGlobalAddr';
import { BalanceHoldAddr } from './BalanceHoldAddr';
import { EntryPointAddr } from './EntryPointAddr';
import { URef } from './URef';
import { IResultWithBytes } from '../clvalue';

// Re-exported so `PrefixName` keeps its published import path.
export { PrefixName };

/**
 * Enum representing different types of blockchain key types used in the system.
 */
export enum KeyTypeID {
  Account = 0,
  Hash,
  URef,
  Transfer,
  DeployInfo,
  EraId,
  Balance,
  Bid,
  Withdraw,
  Dictionary,
  SystemContractRegistry,
  EraSummary,
  Unbond,
  ChainspecRegistry,
  ChecksumRegistry,
  BidAddr,
  Package,
  AddressableEntity,
  ByteCode,
  Message,
  NamedKey,
  BlockGlobal,
  BalanceHold,
  EntryPoint,
  State,
  RewardsHandling
}

/**
 * Enum for human-readable key type names, used to represent various key entities in the blockchain.
 */
export enum KeyTypeName {
  Account = 'Account',
  Hash = 'Hash',
  URef = 'URef',
  Transfer = 'Transfer',
  Deploy = 'Deploy',
  Era = 'Era',
  Bid = 'Bid',
  Balance = 'Balance',
  Withdraw = 'Withdraw',
  Dictionary = 'Dictionary',
  SystemContractRegistry = 'SystemContractRegistry',
  EraSummary = 'EraSummary',
  Unbond = 'Unbond',
  ChainspecRegistry = 'ChainspecRegistry',
  ChecksumRegistry = 'ChecksumRegistry'
}

/**
 * Mapping of key type names to their corresponding KeyTypeID values.
 */
export const typeIDbyNames = new Map<KeyTypeName, KeyTypeID>([
  [KeyTypeName.Account, KeyTypeID.Account],
  [KeyTypeName.Hash, KeyTypeID.Hash],
  [KeyTypeName.URef, KeyTypeID.URef],
  [KeyTypeName.Transfer, KeyTypeID.Transfer],
  [KeyTypeName.Deploy, KeyTypeID.DeployInfo],
  [KeyTypeName.Era, KeyTypeID.EraId],
  [KeyTypeName.Bid, KeyTypeID.Bid],
  [KeyTypeName.Balance, KeyTypeID.Balance],
  [KeyTypeName.Withdraw, KeyTypeID.Withdraw],
  [KeyTypeName.Dictionary, KeyTypeID.Dictionary],
  [KeyTypeName.SystemContractRegistry, KeyTypeID.SystemContractRegistry],
  [KeyTypeName.EraSummary, KeyTypeID.EraSummary],
  [KeyTypeName.Unbond, KeyTypeID.Unbond],
  [KeyTypeName.ChainspecRegistry, KeyTypeID.ChainspecRegistry],
  [KeyTypeName.ChecksumRegistry, KeyTypeID.ChecksumRegistry]
]);

/**
 * Mapping of blockchain key prefixes to their corresponding KeyKeyTypeID values.
 */
export const keyIDbyPrefix = new Map<PrefixName, KeyTypeID>([
  [PrefixName.Account, KeyTypeID.Account],
  [PrefixName.Hash, KeyTypeID.Hash],
  [PrefixName.Transfer, KeyTypeID.Transfer],
  [PrefixName.URef, KeyTypeID.URef],
  [PrefixName.DeployInfo, KeyTypeID.DeployInfo],
  [PrefixName.EraId, KeyTypeID.EraId],
  [PrefixName.Bid, KeyTypeID.Bid],
  [PrefixName.Balance, KeyTypeID.Balance],
  [PrefixName.Withdraw, KeyTypeID.Withdraw],
  [PrefixName.Dictionary, KeyTypeID.Dictionary],
  [PrefixName.SystemContractRegistry, KeyTypeID.SystemContractRegistry],
  [PrefixName.EraSummary, KeyTypeID.EraSummary],
  [PrefixName.Unbond, KeyTypeID.Unbond],
  [PrefixName.ChainspecRegistry, KeyTypeID.ChainspecRegistry],
  [PrefixName.ChecksumRegistry, KeyTypeID.ChecksumRegistry],
  [PrefixName.BidAddr, KeyTypeID.BidAddr],
  [PrefixName.Package, KeyTypeID.Package],
  [PrefixName.Entity, KeyTypeID.AddressableEntity],
  [PrefixName.ByteCode, KeyTypeID.ByteCode],
  [PrefixName.Message, KeyTypeID.Message],
  [PrefixName.NamedKey, KeyTypeID.NamedKey],
  [PrefixName.BlockGlobal, KeyTypeID.BlockGlobal],
  [PrefixName.BalanceHold, KeyTypeID.BalanceHold],
  [PrefixName.EntryPoint, KeyTypeID.EntryPoint],
  [PrefixName.SystemEntityRegistry, KeyTypeID.SystemContractRegistry],
  [PrefixName.State, KeyTypeID.State],
  [PrefixName.RewardsHandling, KeyTypeID.RewardsHandling]
]);

/**
 * Default byte length for keys.
 */
export const KEY_DEFAULT_BYTE_LENGTH = 32;

/**
 * Represents a Key that can identify different types of entities in the system.
 */
@jsonObject
export class Key {
  @jsonMember({ name: 'Type', constructor: Number })
  type: KeyTypeID;

  @jsonMember(() => AccountHash, {
    name: 'Account'
  })
  account?: AccountHash;

  @jsonMember({
    name: 'Hash',
    constructor: Hash
  })
  hash?: Hash;

  @jsonMember({
    name: 'URef',
    constructor: URef
  })
  uRef?: URef;

  @jsonMember({
    name: 'Transfer',
    constructor: TransferHash
  })
  transfer?: TransferHash;

  @jsonMember({
    name: 'Deploy',
    constructor: Hash
  })
  deploy?: Hash;

  @jsonMember({
    name: 'Era',
    constructor: Era
  })
  era?: Era;

  @jsonMember({
    name: 'Balance',
    constructor: Hash
  })
  balance?: Hash;

  @jsonMember(() => AccountHash, {
    name: 'Bid'
  })
  bid?: AccountHash;

  @jsonMember(() => AccountHash, {
    name: 'Withdraw'
  })
  withdraw?: AccountHash;

  @jsonMember({
    name: 'Dictionary',
    constructor: Hash
  })
  dictionary?: Hash;

  @jsonMember({
    name: 'SystemContactRegistry',
    constructor: Hash
  })
  systemContactRegistry?: Hash;

  @jsonMember({
    name: 'EraSummary',
    constructor: Hash
  })
  eraSummary?: Hash;

  @jsonMember(() => AccountHash, {
    name: 'Unbond'
  })
  unbond?: AccountHash;

  @jsonMember({
    name: 'ChainspecRegistry',
    constructor: Hash
  })
  chainspecRegistry?: Hash;

  @jsonMember({
    name: 'ChecksumRegistry',
    constructor: Hash
  })
  checksumRegistry?: Hash;

  @jsonMember({
    name: 'BidAddr',
    constructor: BidAddr
  })
  bidAddr?: BidAddr;

  @jsonMember({
    name: 'Package',
    constructor: Hash
  })
  package?: Hash;

  @jsonMember({
    name: 'AddressableEntity',
    constructor: EntityAddr
  })
  addressableEntity?: EntityAddr;

  @jsonMember({
    name: 'ByteCode',
    constructor: ByteCode
  })
  byteCode?: ByteCode;

  @jsonMember({
    name: 'Message',
    constructor: MessageAddr
  })
  message?: MessageAddr;

  @jsonMember({
    name: 'NamedKey',
    constructor: NamedKeyAddr
  })
  namedKey?: NamedKeyAddr;

  @jsonMember({
    name: 'BlockGlobal',
    constructor: BlockGlobalAddr
  })
  blockGlobal?: BlockGlobalAddr;

  @jsonMember({
    name: 'BalanceHold',
    constructor: BalanceHoldAddr
  })
  balanceHold?: BalanceHoldAddr;

  @jsonMember({
    name: 'EntryPoint',
    constructor: EntryPointAddr
  })
  entryPoint?: EntryPointAddr;

  @jsonMember({
    name: 'State',
    constructor: EntityAddr
  })
  state?: EntityAddr;

  /**
   * Converts the key to bytes.
   * @returns A Uint8Array representing the serialized key.
   */
  bytes(withKeyTypeID = true): Uint8Array {
    const typeBytes = withKeyTypeID ? Uint8Array.from([this.type]) : undefined;

    switch (this.type) {
      case KeyTypeID.Balance:
        return Key.concatBytes(this.balance?.toBytes(), typeBytes);
      case KeyTypeID.Bid:
        return Key.concatBytes(this.bid?.toBytes(), typeBytes);
      case KeyTypeID.Withdraw:
        return Key.concatBytes(this.withdraw?.toBytes(), typeBytes);
      case KeyTypeID.SystemContractRegistry:
        return Key.concatBytes(
          this.systemContactRegistry?.toBytes(),
          typeBytes
        );
      case KeyTypeID.Unbond:
        return Key.concatBytes(this.unbond?.toBytes(), typeBytes);
      case KeyTypeID.ChainspecRegistry:
        return Key.concatBytes(this.chainspecRegistry?.toBytes(), typeBytes);
      case KeyTypeID.ChecksumRegistry:
        return Key.concatBytes(this.checksumRegistry?.toBytes(), typeBytes);
      case KeyTypeID.EraSummary:
        return Key.concatBytes(this.eraSummary?.toBytes(), typeBytes);
      case KeyTypeID.Account:
        return Key.concatBytes(this.account?.toBytes(), typeBytes);
      case KeyTypeID.Hash:
        return Key.concatBytes(this.hash?.toBytes(), typeBytes);
      case KeyTypeID.EraId:
        return Key.concatBytes(this.era?.toBytes(), typeBytes);
      case KeyTypeID.URef:
        return Key.concatBytes(this.uRef?.bytes(), typeBytes);
      case KeyTypeID.Transfer:
        return Key.concatBytes(this.transfer?.toBytes(), typeBytes);
      case KeyTypeID.DeployInfo:
        return Key.concatBytes(this.deploy?.toBytes(), typeBytes);
      case KeyTypeID.Dictionary:
        return Key.concatBytes(this.dictionary?.toBytes(), typeBytes);
      case KeyTypeID.BidAddr:
        return Key.concatBytes(this.bidAddr?.toBytes(), typeBytes);
      case KeyTypeID.Package:
        return Key.concatBytes(this.package?.toBytes(), typeBytes);
      case KeyTypeID.AddressableEntity:
        return Key.concatBytes(this.addressableEntity?.toBytes(), typeBytes);
      case KeyTypeID.ByteCode:
        return Key.concatBytes(this.byteCode?.toBytes(), typeBytes);
      case KeyTypeID.Message:
        return Key.concatBytes(this.message?.toBytes(), typeBytes);
      case KeyTypeID.NamedKey:
        return Key.concatBytes(this.namedKey?.toBytes(), typeBytes);
      case KeyTypeID.BlockGlobal:
        return Key.concatBytes(this.blockGlobal?.toBytes(), typeBytes);
      case KeyTypeID.BalanceHold:
        return Key.concatBytes(this.balanceHold?.toBytes(), typeBytes);
      case KeyTypeID.EntryPoint:
        return Key.concatBytes(this.entryPoint?.toBytes(), typeBytes);
      case KeyTypeID.State:
        return Key.concatBytes(this.state?.toBytes(), typeBytes);
      case KeyTypeID.RewardsHandling:
        return Key.concatBytes(Key.paddingBytes(), typeBytes);
      default:
        return new Uint8Array();
    }
  }

  /** The zero padding that stands in for the address of an addressless key. */
  private static paddingBytes(): Uint8Array {
    return new Uint8Array(KEY_DEFAULT_BYTE_LENGTH);
  }

  /** The same padding, as the node formats it in a key string. */
  private static paddingHex(): string {
    return '0'.repeat(KEY_DEFAULT_BYTE_LENGTH * 2);
  }

  /**
   * Concatenates the type and field bytes.
   * @param typeBytes - The bytes representing the type.
   * @param fieldBytes - The bytes representing the field.
   * @returns A Uint8Array with concatenated type and field bytes.
   */
  private static concatBytes(
    fieldBytes: Uint8Array = Uint8Array.from([]),
    typeBytes?: Uint8Array
  ): Uint8Array {
    if (typeBytes) {
      const result = new Uint8Array(typeBytes.length + fieldBytes.length);
      result.set(typeBytes);
      result.set(fieldBytes, typeBytes.length);
      return result;
    }

    return fieldBytes;
  }

  /**
   * Converts the instance to a JSON-compatible hexadecimal string.
   *
   * @returns {string} The hex-encoded string representation of the instance.
   */
  public toJSON() {
    return Buffer.from(this.bytes(false)).toString('hex');
  }

  /**
   * Converts the key to a prefixed string representation.
   * @returns The prefixed string of the key.
   */
  toPrefixedString(): string {
    switch (this.type) {
      case KeyTypeID.Account:
        return this.account!.toPrefixedString();
      case KeyTypeID.Hash:
        return `${PrefixName.Hash}${this.hash?.toHex()}`;
      case KeyTypeID.EraId:
        return `${PrefixName.EraId}${this.era?.toJSON()}`;
      case KeyTypeID.URef:
        return this.uRef!.toPrefixedString();
      case KeyTypeID.Transfer:
        return this.transfer!.toPrefixedString();
      case KeyTypeID.DeployInfo:
        return `${PrefixName.DeployInfo}${this.deploy!.toHex()}`;
      case KeyTypeID.Dictionary:
        return `${PrefixName.Dictionary}${this.dictionary!.toHex()}`;
      case KeyTypeID.Balance:
        return `${PrefixName.Balance}${this.balance!.toHex()}`;
      case KeyTypeID.Bid:
        return `${PrefixName.Bid}${this.bid!.toHex()}`;
      case KeyTypeID.Withdraw:
        return `${PrefixName.Withdraw}${this.withdraw!.toHex()}`;
      case KeyTypeID.SystemContractRegistry:
        // The only spelling a node accepts back. `newKey` still reads the
        // 1.x `system-contract-registry-` form, so older records keep loading.
        return `${
          PrefixName.SystemEntityRegistry
        }${this.systemContactRegistry!.toHex()}`;
      case KeyTypeID.EraSummary:
        return `${PrefixName.EraSummary}${this.eraSummary!.toHex()}`;
      case KeyTypeID.Unbond:
        return `${PrefixName.Unbond}${this.unbond!.toHex()}`;
      case KeyTypeID.ChainspecRegistry:
        return `${
          PrefixName.ChainspecRegistry
        }${this.chainspecRegistry!.toHex()}`;
      case KeyTypeID.ChecksumRegistry:
        return `${
          PrefixName.ChecksumRegistry
        }${this.checksumRegistry!.toHex()}`;
      case KeyTypeID.BidAddr:
        return this.bidAddr!.toPrefixedString();
      case KeyTypeID.Package:
        return `${PrefixName.Package}${this.package!.toHex()}`;
      case KeyTypeID.AddressableEntity:
        return this.addressableEntity!.toPrefixedString();
      case KeyTypeID.ByteCode:
        return this.byteCode!.toPrefixedString();
      case KeyTypeID.Message:
        return this.message!.toPrefixedString();
      case KeyTypeID.NamedKey:
        return this.namedKey!.toPrefixedString();
      case KeyTypeID.BlockGlobal:
        return this.blockGlobal!.toPrefixedString();
      case KeyTypeID.BalanceHold:
        return this.balanceHold!.toPrefixedString();
      case KeyTypeID.EntryPoint:
        return this.entryPoint!.toPrefixedString();
      case KeyTypeID.State:
        return `${PrefixName.State}${this.state!.toPrefixedString()}`;
      case KeyTypeID.RewardsHandling:
        return `${PrefixName.RewardsHandling}${Key.paddingHex()}`;
      default:
        return '';
    }
  }

  /**
   * Converts the key to a string representation.
   * @returns The string representation of the key.
   */
  toString(): string {
    return this.toPrefixedString();
  }

  /**
   * Creates a Key instance from a byte array.
   * @param bytes - The byte array containing serialized key data.
   * @returns A new Key instance.
   * @throws Error if deserialization fails.
   */
  public static fromBytes(bytes: Uint8Array): IResultWithBytes<Key> {
    const keyType = bytes[0] as KeyTypeID;
    const contentBytes = bytes.subarray(1);

    const result = new Key();
    result.type = keyType;

    switch (keyType) {
      case KeyTypeID.Account: {
        const accountHash = Hash.fromBytes(contentBytes);
        result.account = new AccountHash(accountHash?.result);
        return { result, bytes: accountHash?.bytes };
      }
      case KeyTypeID.Hash: {
        const hashParsed = Hash.fromBytes(contentBytes);
        result.hash = hashParsed?.result;
        return { result, bytes: hashParsed?.bytes };
      }
      case KeyTypeID.URef: {
        const uref = URef.fromBytes(contentBytes);
        result.uRef = uref?.result;
        return { result, bytes: uref?.bytes };
      }
      case KeyTypeID.Transfer: {
        const transferHash = Hash.fromBytes(contentBytes);
        // Bytes, not hex: the string overload only keeps `transfer-` when the
        // input already carries it, so a bare hex string dropped the prefix.
        result.transfer = new TransferHash(transferHash?.result.toBytes());
        return { result, bytes: transferHash?.bytes };
      }
      case KeyTypeID.DeployInfo: {
        const deploy = Hash.fromBytes(contentBytes);
        result.deploy = deploy?.result;
        return { result, bytes: deploy?.bytes };
      }
      case KeyTypeID.EraId: {
        const [eraBytes, eraRemainder] = splitAt(1, contentBytes);
        result.era = Era.fromBytes(eraBytes);
        return { result, bytes: eraRemainder };
      }
      case KeyTypeID.Balance: {
        const parsed = Hash.fromBytes(contentBytes);
        result.balance = parsed?.result;

        return { result, bytes: parsed?.bytes };
      }
      case KeyTypeID.Bid: {
        const bid = Hash.fromBytes(contentBytes);
        result.bid = new AccountHash(bid.result);

        return { result, bytes: bid?.bytes };
      }
      case KeyTypeID.Withdraw: {
        const withdraw = Hash.fromBytes(contentBytes);
        const withdrawHash = withdraw?.result;
        result.withdraw = new AccountHash(withdrawHash);
        return { result, bytes: withdraw?.bytes };
      }
      case KeyTypeID.Dictionary: {
        const dictionary = Hash.fromBytes(contentBytes);
        result.dictionary = dictionary?.result;
        return { result, bytes: dictionary?.bytes };
      }
      case KeyTypeID.SystemContractRegistry: {
        const systemContractRegistry = Hash.fromBytes(contentBytes);
        result.systemContactRegistry = systemContractRegistry?.result;
        return { result, bytes: systemContractRegistry?.bytes };
      }
      case KeyTypeID.EraSummary: {
        const eraSummary = Hash.fromBytes(contentBytes);
        result.eraSummary = eraSummary?.result;
        return { result, bytes: eraSummary?.bytes };
      }
      case KeyTypeID.Unbond: {
        const { result: unbondHash, bytes: unbondBytes } =
          Hash.fromBytes(contentBytes);
        result.unbond = new AccountHash(unbondHash);
        return { result, bytes: unbondBytes };
      }
      case KeyTypeID.ChainspecRegistry: {
        const [chainBytes, chainspecRegistryBytes] = splitAt(
          KEY_DEFAULT_BYTE_LENGTH,
          contentBytes
        );
        result.chainspecRegistry = Hash.fromBytes(chainBytes)?.result;
        return { result, bytes: chainspecRegistryBytes };
      }
      case KeyTypeID.ChecksumRegistry: {
        const checksumRegistry = Hash.fromBytes(contentBytes);
        result.checksumRegistry = checksumRegistry?.result;
        return { result, bytes: checksumRegistry?.bytes };
      }
      case KeyTypeID.BidAddr: {
        const { result: bidAddr, bytes: bidAddrBytes } =
          BidAddr.fromBytes(contentBytes);
        result.bidAddr = bidAddr;

        return { result, bytes: bidAddrBytes };
      }
      case KeyTypeID.Package: {
        const packageHash = Hash.fromBytes(contentBytes);
        result.package = packageHash?.result;
        return { result, bytes: packageHash?.bytes };
      }
      case KeyTypeID.AddressableEntity: {
        const { result: entityAddr, bytes: entityAddrBytes } =
          EntityAddr.fromBytes(contentBytes);
        result.addressableEntity = entityAddr;
        return { result, bytes: entityAddrBytes };
      }
      case KeyTypeID.ByteCode: {
        const { result: byteCode, bytes: byteCodeBytes } =
          ByteCode.fromBytes(contentBytes);
        result.byteCode = byteCode;

        return { result, bytes: byteCodeBytes };
      }
      case KeyTypeID.Message: {
        const { result: messageAddr, bytes: messageAddrBytes } =
          MessageAddr.fromBytes(contentBytes);
        result.message = messageAddr;
        return { result, bytes: messageAddrBytes };
      }
      case KeyTypeID.NamedKey: {
        const { result: namedKey, bytes: namedKeyBytes } =
          NamedKeyAddr.fromBytes(contentBytes);
        result.namedKey = namedKey;
        return { result, bytes: namedKeyBytes };
      }
      case KeyTypeID.BlockGlobal: {
        const { result: blockGlobal, bytes: blockGlobalBytes } =
          BlockGlobalAddr.fromBytes(contentBytes);
        result.blockGlobal = blockGlobal;
        return { result, bytes: blockGlobalBytes };
      }
      case KeyTypeID.BalanceHold: {
        const { result: balanceHold, bytes: balanceHoldBytes } =
          BalanceHoldAddr.fromBytes(contentBytes);
        result.balanceHold = balanceHold;
        return { result, bytes: balanceHoldBytes };
      }
      case KeyTypeID.EntryPoint: {
        const { result: entryPoint, bytes: entryPointBytes } =
          EntryPointAddr.fromBytes(contentBytes);
        result.entryPoint = entryPoint;
        return { result, bytes: entryPointBytes };
      }
      case KeyTypeID.State: {
        const { result: state, bytes: stateBytes } =
          EntityAddr.fromBytes(contentBytes);
        result.state = state;
        return { result, bytes: stateBytes };
      }
      case KeyTypeID.RewardsHandling: {
        // Carries no address of its own — just the padding the node writes.
        if (contentBytes.length < KEY_DEFAULT_BYTE_LENGTH) {
          throw new Error('Early end of stream when deserializing data.');
        }
        return {
          result,
          bytes: contentBytes.subarray(KEY_DEFAULT_BYTE_LENGTH)
        };
      }
      default:
        throw new Error('Missing key type');
    }
  }

  /**
   * Finds the prefix name by matching the source string with a map of prefixes.
   * @param source - The string to check for a matching prefix.
   * @param prefixes - The map of prefix names to KeyTypeID.
   * @returns The matching PrefixName or undefined if not found.
   */
  static findPrefixByMap(
    source: string,
    prefixes: Map<PrefixName, KeyTypeID>
  ): PrefixName {
    let result: PrefixName = '' as PrefixName;

    prefixes.forEach((_, prefix) => {
      if (source.startsWith(prefix)) {
        if (
          prefix === PrefixName.EraId &&
          source.startsWith(PrefixName.EraSummary)
        ) {
          result = PrefixName.EraSummary;
        } else if (
          prefix === PrefixName.Bid &&
          source.startsWith(PrefixName.BidAddr)
        ) {
          result = PrefixName.BidAddr;
        } else if (
          prefix === PrefixName.Balance &&
          source.startsWith(PrefixName.BalanceHold)
        ) {
          result = PrefixName.BalanceHold;
        } else {
          result = prefix;
        }
        return; // Exit early from forEach if a match is found
      }
    });

    return result;
  }

  /**
   * Creates a Key instance based on the type ID and source string.
   * @param source - The string containing the key data.
   * @param typeID - The TypeID of the key.
   * @returns A new Key instance.
   * @throws Error if the type is not found or invalid.
   */
  static createByType(source: string, typeID: KeyTypeID): Key {
    const result = new Key();
    result.type = typeID;

    switch (result.type) {
      case KeyTypeID.EraId:
        result.era = Era.fromJSON(source.replace(PrefixName.EraId, ''));

        break;
      case KeyTypeID.Hash:
        result.hash = Hash.fromHex(source.replace(PrefixName.Hash, ''));
        break;
      case KeyTypeID.URef:
        result.uRef = URef.fromString(source);
        break;
      case KeyTypeID.Account:
        result.account = AccountHash.fromString(source);
        break;
      case KeyTypeID.Transfer:
        result.transfer = TransferHash.fromJSON(source);
        break;
      case KeyTypeID.DeployInfo:
        result.deploy = Hash.fromHex(source.replace(PrefixName.DeployInfo, ''));
        break;
      case KeyTypeID.Balance:
        result.balance = Hash.fromHex(source.replace(PrefixName.Balance, ''));
        break;
      case KeyTypeID.Bid:
        result.bid = AccountHash.fromString(source.replace(PrefixName.Bid, ''));
        break;
      case KeyTypeID.Withdraw:
        result.withdraw = AccountHash.fromString(
          source.replace(PrefixName.Withdraw, '')
        );
        break;
      case KeyTypeID.Dictionary:
        result.dictionary = Hash.fromHex(
          source.replace(PrefixName.Dictionary, '')
        );
        break;
      case KeyTypeID.SystemContractRegistry:
        result.systemContactRegistry = Hash.fromHex(
          source
            .replace(PrefixName.SystemEntityRegistry, '')
            .replace(PrefixName.SystemContractRegistry, '')
        );
        break;
      case KeyTypeID.EraSummary:
        result.eraSummary = Hash.fromHex(
          source.replace(PrefixName.EraSummary, '')
        );
        break;
      case KeyTypeID.Unbond:
        result.unbond = AccountHash.fromString(
          source.replace(PrefixName.Unbond, '')
        );
        break;
      case KeyTypeID.ChainspecRegistry:
        result.chainspecRegistry = Hash.fromHex(
          source.replace(PrefixName.ChainspecRegistry, '')
        );
        break;
      case KeyTypeID.ChecksumRegistry:
        result.checksumRegistry = Hash.fromHex(
          source.replace(PrefixName.ChecksumRegistry, '')
        );
        break;
      case KeyTypeID.BidAddr:
        result.bidAddr = BidAddr.fromHex(
          source.replace(PrefixName.BidAddr, '')
        );
        break;
      case KeyTypeID.Package:
        result.package = Hash.fromHex(source.replace(PrefixName.Package, ''));
        break;
      case KeyTypeID.AddressableEntity:
        result.addressableEntity = EntityAddr.fromPrefixedString(
          source.replace(PrefixName.AddressableEntity, '')
        );
        break;
      case KeyTypeID.ByteCode:
        result.byteCode = ByteCode.fromJSON(
          source.replace(PrefixName.ByteCode, '')
        );
        break;
      case KeyTypeID.Message:
        result.message = MessageAddr.fromString(source);
        break;
      case KeyTypeID.NamedKey:
        result.namedKey = NamedKeyAddr.fromString(
          source.replace(PrefixName.NamedKey, '')
        );
        break;
      case KeyTypeID.BlockGlobal:
        result.blockGlobal = BlockGlobalAddr.fromString(
          source.replace(PrefixName.BlockGlobal, '')
        );
        break;
      case KeyTypeID.BalanceHold:
        result.balanceHold = BalanceHoldAddr.fromString(
          source.replace(PrefixName.BalanceHold, '')
        );
        break;
      case KeyTypeID.EntryPoint:
        result.entryPoint = EntryPointAddr.fromString(
          source.replace(PrefixName.EntryPoint, '')
        );
        break;
      case KeyTypeID.State:
        result.state = EntityAddr.fromPrefixedString(
          source.replace(PrefixName.State, '')
        );
        break;
      case KeyTypeID.RewardsHandling: {
        // No address to carry — but the padding is checked, so a malformed
        // source fails here rather than parsing into a well-formed key.
        const padding = source.replace(PrefixName.RewardsHandling, '');
        if (padding !== Key.paddingHex()) {
          throw new Error(`invalid RewardsHandling key -> source: ${source}`);
        }
        break;
      }
      default:
        throw new Error(`type is not found -> source: ${source}`);
    }
    return result;
  }

  /**
   * Parses a Key instance from a string representation.
   * @param source - The string containing the key data.
   * @returns A new Key instance.
   * @throws Error if the format is invalid or unexpected.
   */
  static parseTypeByString(source: string): Key {
    const openBracketIndex = source.indexOf('(');
    if (openBracketIndex === -1) {
      throw new Error('invalid key format');
    }

    const typeIndexStart = 5;
    const keyTypeStr = source.slice(typeIndexStart, openBracketIndex);
    const keyValue = source.slice(openBracketIndex + 1, -1);
    const typeID = typeIDbyNames.get(keyTypeStr as KeyTypeName);
    if (typeID === undefined) {
      throw new Error('unexpected KeyType');
    }

    return Key.createByType(keyValue, typeID);
  }

  /**
   * Creates a new Key instance from a source string.
   * @param source - The string containing the key data.
   * @returns A new Key instance.
   * @throws Error if the prefix is not found or the source is invalid.
   */
  static newKey(source: string): Key {
    if (source.length === Hash.StringHashLen) {
      const defaultHash = Hash.fromHex(source);
      const result = new Key();
      result.type = KeyTypeID.Hash;
      result.hash = defaultHash;
      return result;
    }

    if (source.startsWith('Key::')) {
      return Key.parseTypeByString(source);
    }

    if (source.startsWith('00') && source.length === Hash.StringHashLen + 2) {
      return Key.createByType(source.slice(2), KeyTypeID.Account);
    }

    const prefix = Key.findPrefixByMap(source, keyIDbyPrefix);
    if (!prefix) {
      throw new Error(`prefix is not found, source: ${source}`);
    }

    return Key.createByType(source, keyIDbyPrefix.get(prefix)!);
  }
}

/**
 * Splits the array at a given index.
 * @param i - The index to split the array.
 * @param arr - The Uint8Array to split.
 * @returns The bytes before index i, and the bytes from index i onwards.
 * @throws Error if the index is out of bounds.
 */
export const splitAt = (
  i: number,
  arr: Uint8Array
): [Uint8Array, Uint8Array] => {
  if (i > arr.length - 1) {
    throw new Error('Early end of stream when deserializing data.');
  }
  const clonedArray = new Uint8Array(arr);
  return [clonedArray.subarray(0, i), clonedArray.subarray(i)];
};
