import { jsonObject, jsonMember, TypedJSON } from 'typedjson';

import { AccountHash, Key } from './key';
import { UnbondingPurse } from './UnbondingPurse';
import { AddressableEntity } from './AddressableEntity';
import { Package } from './Package';
import { BidKind } from './BidKind';
import { MessageChecksum, MessageTopicSummary } from './MessageTopic';
import { DeployInfo } from './DeployInfo';
import { CLValue, CLValueUInt512 } from './clvalue';
import {
  BidKindRawData,
  PackageRawData,
  RawDataMessage,
  RawDataMessageTopic,
  RawDataNamedKey,
  RawUInt512,
  RawWriteAccount1XTransform,
  RawWriteAccount2XTransform,
  RawWriteCLValue,
  RawWriteCLValueV2,
  RawWriteContract,
  RawWriteContractPackage,
  RawWriteDeployInfo,
  RawWriteTransferTransform,
  RawWriteUnbonding,
  RawWriteWithdrawals,
  TranformAddressableEntityRawData,
  WriteTransfer
} from './TransformRaw';
import { Contract } from './Contract';
import { NamedKeyKind } from './NamedKeyKind';
import { ContractPackage } from './ContractPackage';

/**
 * Represents different types of transformation that can be applied.
 * Used for parsing and processing transformation data in a transaction.
 */
@jsonObject
export class TransformKind {
  private data: any;

  /**
   * Constructs a new `TransformKind` instance.
   *
   * @param data The transformation data as a string.
   */
  constructor(data: any) {
    this.data = data;
  }

  /**
   * Getter for transformation data.
   *
   * @returns The transformation data.
   */
  public get transformationData(): any {
    return this.data;
  }

  /**
   * Creates a `TransformKind` instance from a JSON string.
   *
   * @param json The transformation data as a string.
   * @returns The `TransformKind` instance.
   */
  static fromJSON(json: any): TransformKind | undefined {
    if (!json) {
      throw new Error('TransformKind: fromJSON on empty string');
    }
    return new TransformKind(json);
  }

  /**
   * Converts the transformation data into a JSON string.
   *
   * @returns The transformation data as a string.
   */
  public toJSON(): any {
    return this.data;
  }

  /**
   * Checks if the transformation is a WriteTransfer.
   *
   * @returns `true` if the transformation is a WriteTransfer, otherwise `false`.
   */
  public isWriteTransfer(): boolean {
    return this.isTransformation('WriteTransfer');
  }

  /**
   * Checks if the transformation is a WriteAccount.
   *
   * @returns `true` if the transformation is a WriteAccount, otherwise `false`.
   */
  public isWriteAccount(): boolean {
    return (
      this.isTransformation('WriteAccount') ||
      (this.isTransformation('Write') && this.isTransformation('Account'))
    );
  }

  /**
   * Checks if the transformation is a WriteCLValue.
   *
   * @returns `true` if the transformation is a WriteCLValue, otherwise `false`.
   */
  public isCLValueWrite(): boolean {
    return this.isTransformation('WriteCLValue');
  }

  /**
   * Checks if the transformation is a WriteContract.
   *
   * @returns `true` if the transformation is a WriteContract, otherwise `false`.
   */
  public isWriteContract(): boolean {
    /**
     * v1 compatible check
     */
    if (this.isTransformation('WriteContract')) {
      return true;
    }

    /**
     * v2 compatible check
     */
    const serializer = new TypedJSON(RawWriteContract);
    const jsonRes = serializer.parse(this.data);

    return !!jsonRes?.Write?.Contract;
  }

  /**
   * Checks if the transformation is a WriteWithdraw.
   *
   * @returns `true` if the transformation is a WriteWithdraw, otherwise `false`.
   */
  public isWriteWithdraw(): boolean {
    return this.isTransformation('WriteWithdraw');
  }

  /**
   * Checks if the transformation is a WriteUnbonding.
   *
   * @returns `true` if the transformation is a WriteUnbonding, otherwise `false`.
   */
  public isWriteUnbonding(): boolean {
    return this.isTransformation('WriteUnbonding');
  }

  /**
   * Checks if the transformation is a WriteCLValue.
   *
   * @returns `true` if the transformation is a WriteCLValue, otherwise `false`.
   */
  public isWriteCLValue(): boolean {
    return this.isTransformation('CLValue');
  }

  /**
   * Checks if the transformation is a WritePackage.
   *
   * @returns `true` if the transformation is a WritePackage, otherwise `false`.
   */
  public isWritePackage(): boolean {
    return this.isTransformation('Package');
  }

  /**
   * Checks if the transformation is a WriteAddressableEntity.
   *
   * @returns `true` if the transformation is a WriteAddressableEntity, otherwise `false`.
   */
  public isWriteAddressableEntity(): boolean {
    return this.isTransformation('AddressableEntity');
  }

  /**
   * Checks if the transformation is a WriteBidKind.
   *
   * @returns `true` if the transformation is a WriteBidKind, otherwise `false`.
   */
  public isWriteBidKind(): boolean {
    return this.isTransformation('BidKind');
  }

  /**
   * Checks if the transformation is a WriteNamedKey.
   *
   * @returns `true` if the transformation is a WriteNamedKey, otherwise `false`.
   */
  public isWriteNamedKey(): boolean {
    return this.isTransformation('NamedKey');
  }

  /**
   * Checks if the transformation is a WriteMessage.
   *
   * @returns `true` if the transformation is a WriteMessage, otherwise `false`.
   */
  public isWriteMessage(): boolean {
    return this.isTransformation('Message');
  }

  /**
   * Checks if the transformation is a WriteMessageTopic.
   *
   * @returns `true` if the transformation is a WriteMessageTopic, otherwise `false`.
   */
  public isWriteMessageTopic(): boolean {
    return this.isTransformation('MessageTopic');
  }

  /**
   * Checks if the transformation is a WriteBid.
   *
   * @returns `true` if the transformation is a WriteBid, otherwise `false`.
   */
  public isWriteBid(): boolean {
    return this.isTransformation('WriteBid');
  }

  /**
   * Checks if the transformation is an AddUInt512.
   *
   * @returns `true` if the transformation is AddUInt512, otherwise `false`.
   */
  public isAddUint512(): boolean {
    return this.isTransformation('AddUInt512');
  }

  /**
   * Checks if the transformation is a WriteDeployInfo.
   *
   * @returns `true` if the transformation is a WriteDeployInfo, otherwise `false`.
   */
  public isWriteDeployInfo(): boolean {
    return this.isTransformation('WriteDeployInfo');
  }

  /**
   * Checks if the transformation is a WriteContractPackage.
   *
   * @returns `true` if the transformation is a WriteContractPackage, otherwise `false`.
   */
  public isWriteContractPackage(): boolean {
    /**
     * v1 compatible check
     */
    if (this.isTransformation('WriteContractPackage')) {
      return true;
    }

    /**
     * v2 compatible check
     */
    const serializer = new TypedJSON(RawWriteContractPackage);
    const jsonRes = serializer.parse(this.data);

    return !!jsonRes?.Write?.ContractPackage;
  }

  /**
   * Attempts to parse the transformation as a WriteTransfer.
   *
   * @returns A `WriteTransfer` object if the data matches, otherwise throw an error`.
   */
  public parseAsWriteTransfer(): WriteTransfer {
    const serializer = new TypedJSON(RawWriteTransferTransform);
    const jsonRes = serializer.parse(this.data);

    if (!jsonRes || !jsonRes.WriteTransfer) {
      throw new Error(`Error parsing as WriteTransfer`);
    }

    return jsonRes.WriteTransfer;
  }
  /**
   * Attempts to parse the transformation as a WriteWithdraw.
   *
   * @returns An array of `UnbondingPurse` objects if the data matches, otherwise `[]`.
   */
  public parseAsWriteWithdraws(): UnbondingPurse[] {
    const serializer = new TypedJSON(RawWriteWithdrawals);
    const jsonRes = serializer.parse(this.data);

    if (!jsonRes || !jsonRes.UnbondingPurses) {
      return [];
    }

    return jsonRes.UnbondingPurses;
  }

  /**
   * Attempts to parse the transformation as a WriteAddressableEntity.
   *
   * @returns An `AddressableEntity` object if the data matches, otherwise throw an error`.
   */
  public parseAsWriteAddressableEntity(): AddressableEntity {
    const serializer = new TypedJSON(TranformAddressableEntityRawData);
    const jsonRes = serializer.parse(this.data);

    if (!jsonRes?.Write?.AddressableEntity) {
      throw new Error(`Error parsing as AddressableEntity`);
    }

    return jsonRes.Write.AddressableEntity;
  }

  /**
   * Attempts to parse the transformation as a WritePackage.
   *
   * @returns A `Package` object if the data matches, otherwise `throw an error`.
   */
  public parseAsWritePackage(): Package {
    const serializer = new TypedJSON(PackageRawData);
    const jsonRes = serializer.parse(this.data);

    if (!jsonRes?.Write?.Package) {
      throw new Error(`Error parsing as Package`);
    }

    return jsonRes.Write.Package;
  }

  /**
   * Attempts to parse the transformation as a WriteBidKind.
   *
   * @returns A `BidKind` object if the data matches, otherwise `throw an error`.
   */
  public parseAsWriteBidKind(): BidKind {
    const serializer = new TypedJSON(BidKindRawData);
    const jsonRes = serializer.parse(this.data);

    if (!jsonRes?.Write?.BidKind) {
      throw new Error(`Error parsing as BidKind`);
    }

    return jsonRes.Write.BidKind;
  }

  /**
   * Attempts to parse the transformation as a WriteNamedKey.
   *
   * @returns A `NamedKeyKind` object if the data matches, otherwise `throw an error`.
   */
  public parseAsWriteNamedKey(): NamedKeyKind | null {
    const serializer = new TypedJSON(RawDataNamedKey);
    const jsonRes = serializer.parse(this.data);

    if (!jsonRes || !jsonRes.Write || !jsonRes.Write.NamedKey) {
      throw new Error(`Error parsing as NamedKeyKind`);
    }

    return jsonRes.Write.NamedKey;
  }

  /**
   * Attempts to parse the transformation as a WriteMessage.
   *
   * @returns A `MessageChecksum` if the data matches, otherwise `throw an error`.
   */
  public parseAsWriteMessage(): MessageChecksum {
    const serializer = new TypedJSON(RawDataMessage);
    const jsonRes = serializer.parse(this.data);

    if (!jsonRes || !jsonRes.Write || !jsonRes.Write.Message) {
      throw new Error(`Error parsing as MessageChecksum`);
    }

    return jsonRes.Write.Message;
  }

  /**
   * Attempts to parse the transformation as a WriteMessageTopic.
   *
   * @returns A `MessageTopicSummary` if the data matches, otherwise `throw an error`.
   */
  public parseAsWriteMessageTopic(): MessageTopicSummary {
    const serializer = new TypedJSON(RawDataMessageTopic);
    const jsonRes = serializer.parse(this.data);

    if (!jsonRes || !jsonRes.Write || !jsonRes.Write.MessageTopic) {
      throw new Error(`Error parsing as MessageTopicSummary`);
    }

    return jsonRes.Write.MessageTopic;
  }

  /**
   * Attempts to parse the transformation as a WriteUnbonding.
   *
   * @returns An array of `UnbondingPurse` objects if the data matches, otherwise `throw an error`.
   */
  public parseAsWriteUnbondings(): UnbondingPurse[] | null {
    const serializer = new TypedJSON(RawWriteUnbonding);
    const jsonRes = serializer.parse(this.data);

    if (!jsonRes || !jsonRes.UnbondingPurses) {
      throw new Error(`Error parsing as UnbondingPurse array`);
    }

    return jsonRes.UnbondingPurses;
  }

  /**
   * Attempts to parse the transformation as a UInt512.
   *
   * @returns A `CLValueUInt512` object if the data matches, otherwise `throw an error`.
   */
  public parseAsUInt512(): CLValueUInt512 {
    const serializer = new TypedJSON(RawUInt512);
    const jsonRes = serializer.parse(this.data);

    if (!jsonRes || !jsonRes.UInt512) {
      throw new Error(`Error parsing as CLValueUInt512`);
    }

    return jsonRes.UInt512;
  }

  /**
   * Attempts to parse the transformation data as a WriteAccount transformation.
   *
   * This method supports two JSON formats:
   *
   * - **2.x Format:**
   *   ```json
   *   {
   *     "Write": {
   *       "Account": {
   *         "account_hash": "..."
   *       }
   *     }
   *   }
   *   ```
   *   If the parsed `accountHash` is not equal to the zero account hash, this value is returned.
   *
   * - **1.x Format:**
   *   ```json
   *   {
   *     "WriteAccount": "..."
   *   }
   *   ```
   *   If the 2.x format is not matched or the parsed account hash equals the zero hash,
   *   the method falls back to this format.
   *
   * @returns The parsed `AccountHash`.
   * @throws Error if the transformation data cannot be parsed as a valid WriteAccount.
   */
  public parseAsWriteAccount(): AccountHash {
    const ZERO_ACCOUNT_HASH =
      'account-hash-0000000000000000000000000000000000000000000000000000000000000000';

    const serializer2x = new TypedJSON(RawWriteAccount2XTransform);
    const parsed2x = serializer2x.parse(this.data);

    if (
      parsed2x?.Write?.Account?.accountHash &&
      parsed2x.Write.Account.accountHash.toPrefixedString() !==
        ZERO_ACCOUNT_HASH
    ) {
      return parsed2x.Write.Account.accountHash;
    }

    // Fallback: attempt to parse using the 1.x transformation format.
    const serializer1x = new TypedJSON(RawWriteAccount1XTransform);
    const parsed1x = serializer1x.parse(this.data);

    if (!parsed1x?.WriteAccount) {
      throw new Error('Error parsing as WriteAccount');
    }

    return parsed1x.WriteAccount;
  }
  /**
   * Attempts to parse the transformation as a WriteDeployInfo.
   *
   * @returns A `DeployInfo` object if the data matches, otherwise `throw an error`.
   */
  public parseAsWriteDeployInfo(): DeployInfo {
    const serializer = new TypedJSON(RawWriteDeployInfo);
    const jsonRes = serializer.parse(this.data);

    if (!jsonRes || !jsonRes.WriteDeployInfo) {
      throw new Error(`Error parsing as DeployInfo`);
    }

    return jsonRes.WriteDeployInfo;
  }

  /**
   * Attempts to parse the transformation as a WriteCLValue.
   *
   * @returns The `Args` object if the data matches, otherwise `throw an error`.
   */
  public parseAsWriteCLValue(): CLValue {
    const serializer = new TypedJSON(RawWriteCLValue);
    const jsonRes = serializer.parse(this.data);

    if (jsonRes && jsonRes.WriteCLValue) {
      return jsonRes.WriteCLValue;
    }

    const serializer2 = new TypedJSON(RawWriteCLValueV2);
    const jsonRes2 = serializer2.parse(this.data);

    if (!jsonRes2 || !jsonRes2.Write || !jsonRes2?.Write.CLValue) {
      throw new Error(`Error parsing as RawWriteCLValueV2`);
    }

    return jsonRes2.Write?.CLValue;
  }

  /**
   * Attempts to parse the transformation as a WriteContract.
   *
   * @returns A `Contract` object if the data matches, otherwise `throw an error`.
   */
  public parseAsWriteContract(): Contract {
    const serializer = new TypedJSON(RawWriteContract);
    const jsonRes = serializer.parse(this.data);

    if (!jsonRes || !jsonRes.Write?.Contract) {
      throw new Error(`Error parsing as WriteContract`);
    }

    return jsonRes.Write.Contract;
  }

  /**
   * Attempts to parse the transformation as a WriteContractPackage.
   *
   * @returns A `ContractPackage` object if the data matches, otherwise `throw an error`.
   */
  public parseAsWriteContractPackage(): ContractPackage {
    const serializer = new TypedJSON(RawWriteContractPackage);
    const jsonRes = serializer.parse(this.data);

    if (!jsonRes || !jsonRes.Write?.ContractPackage) {
      throw new Error(`Error parsing as WriteContractPackage`);
    }

    return jsonRes.Write.ContractPackage;
  }

  /**
   * Recursively checks if any key in the provided object (including nested objects)
   * contains the specified name.
   *
   * @param obj - The object to search through.
   * @param name - The transformation name to search for within the keys.
   * @returns true if a key containing the name is found; otherwise, false.
   */
  private containsKeyRecursive(obj: any, name: string): boolean {
    for (const key in obj) {
      if (key.includes(name)) {
        return true;
      }
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (this.containsKeyRecursive(obj[key], name)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Checks if `TransformKind` has the transformation specified by name.
   *
   * @param `name` - transformation name (aka WriteTransfer)
   * @returns `true` if the transformation is a WriteTransfer, otherwise `false`.
   */
  public isTransformation(name: string): boolean {
    if (typeof this.data === 'string') {
      return this.data.includes(name);
    } else if (typeof this.data === 'object' && this.data !== null) {
      return this.containsKeyRecursive(this.data, name);
    }
    return false;
  }
}

/**
 * Represents a transformation, which includes a key and a transformation kind.
 */
@jsonObject
export class Transform {
  /**
   * The key associated with the transformation.
   */
  @jsonMember({
    name: 'key',
    constructor: Key,
    deserializer: (json: string) => {
      if (!json) return;
      return Key.newKey(json);
    },
    serializer: value => {
      if (!value) return;
      return value.toPrefixedString();
    }
  })
  public key: Key;

  /**
   * The kind of transformation being applied.
   */
  @jsonMember({
    name: 'kind',
    constructor: TransformKind,
    deserializer: json => {
      if (!json) return;
      return TransformKind.fromJSON(json);
    },
    serializer: (value: TransformKind) => {
      if (!value) return;
      return value.toJSON();
    }
  })
  public kind: TransformKind;

  /**
   * Constructs a new `Transform` instance.
   *
   * @param key The key associated with the transformation.
   * @param kind The kind of transformation.
   */
  constructor(key: Key, kind: TransformKind) {
    this.key = key;
    this.kind = kind;
  }
}

/**
 * Represents a key transformation in a transaction.
 */
@jsonObject
export class TransformKey {
  /**
   * The key associated with the transformation.
   */
  @jsonMember({
    name: 'key',
    constructor: Key,
    deserializer: (json: string) => {
      if (!json) return;
      return Key.newKey(json);
    },
    serializer: value => {
      if (!value) return;
      return value.toPrefixedString();
    }
  })
  public key: Key;

  /**
   * The transformation kind.
   */
  @jsonMember({
    name: 'transform',
    constructor: TransformKind,
    deserializer: json => {
      if (!json) return;
      return TransformKind.fromJSON(json);
    },
    serializer: (value: TransformKind) => {
      if (!value) return;
      return value.toJSON();
    }
  })
  public transform: TransformKind;
}

// Re-exported so `NamedKeyKind` keeps its published import path.
export { NamedKeyKind };
