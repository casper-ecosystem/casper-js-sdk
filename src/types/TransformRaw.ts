import { jsonArrayMember, jsonMember, jsonObject } from 'typedjson';

import { UnbondingPurse } from './UnbondingPurse';
import { NamedKeyKind } from './NamedKeyKind';
import { AddressableEntity } from './AddressableEntity';
import { Package } from './Package';
import { BidKind } from './BidKind';
import { MessageTopicSummary } from './MessageTopic';
import { CLValue, CLValueParser, CLValueUInt512 } from './clvalue';
import { DeployInfo } from './DeployInfo';
import { BigNumber } from '@ethersproject/bignumber';
import { AccountHash, Hash, URef } from './key';
import { Contract } from './Contract';
import { ContractPackage } from './ContractPackage';

/**
 * Represents a transfer operation in a transaction.
 */
@jsonObject
export class WriteTransfer {
  /**
   * The optional ID of the transfer.
   */
  @jsonMember({ name: 'id', constructor: Number, preserveNull: true })
  public id?: number;

  /**
   * The recipient of the transfer, represented as an `AccountHash`.
   */
  @jsonMember({
    name: 'to',
    constructor: AccountHash,
    preserveNull: true,
    deserializer: json => {
      if (!json) return;
      return AccountHash.fromJSON(json);
    },
    serializer: (value: AccountHash) => {
      if (!value) return;
      return value.toJSON();
    }
  })
  public to?: AccountHash;

  /**
   * The deploy hash associated with the transfer.
   */
  @jsonMember({
    name: 'deploy_hash',
    constructor: Hash,
    deserializer: json => {
      if (!json) return;
      return Hash.fromJSON(json);
    },
    serializer: value => {
      if (!value) return;
      return value.toJSON();
    }
  })
  public deployHash: Hash;

  /**
   * The sender of the transfer, represented as an `AccountHash`.
   */
  @jsonMember({
    name: 'from',
    constructor: AccountHash,
    deserializer: json => AccountHash.fromJSON(json),
    serializer: (value: AccountHash) => value.toJSON()
  })
  public from: AccountHash;

  /**
   * The amount being transferred, represented as a `CLValueUInt512`.
   */
  @jsonMember({
    name: 'amount',
    constructor: CLValueUInt512,
    deserializer: json => CLValueUInt512.fromJSON(json),
    serializer: (value: CLValueUInt512) => value.toJSON()
  })
  public amount: CLValueUInt512;

  /**
   * The source URef (Universal Reference) of the transfer.
   */
  @jsonMember({
    name: 'source',
    constructor: URef,
    deserializer: json => URef.fromJSON(json),
    serializer: (value: URef) => value.toJSON()
  })
  public source: URef;

  /**
   * The target URef (Universal Reference) of the transfer.
   */
  @jsonMember({
    name: 'target',
    constructor: URef,
    deserializer: json => URef.fromJSON(json),
    serializer: (value: URef) => value.toJSON()
  })
  public target: URef;

  /**
   * The gas used for the transfer.
   */
  @jsonMember({
    name: 'gas',
    constructor: Number,
    deserializer: json => BigNumber.from(json).toNumber(),
    serializer: value => BigNumber.from(value).toString()
  })
  public gas: number;
}

/**
 * Represents raw data for a write operation involving withdrawals.
 */
@jsonObject
export class RawWriteWithdrawals {
  /**
   * The list of unbonding purses in the withdrawal write operation.
   */
  @jsonArrayMember(UnbondingPurse, { name: 'WriteWithdraw' })
  UnbondingPurses?: UnbondingPurse[];
}

/**
 * Represents raw data for a write transfer operation.
 */
@jsonObject
export class RawWriteTransferTransform {
  /**
   * The write transfer operation.
   */
  @jsonMember({ name: 'WriteTransfer', constructor: WriteTransfer })
  WriteTransfer?: WriteTransfer;
}

/**
 * Represents a transform for an addressable entity.
 */
@jsonObject
export class TranformAddressableEntity {
  /**
   * The addressable entity involved in the transform.
   */
  @jsonMember({ name: 'AddressableEntity', constructor: AddressableEntity })
  AddressableEntity?: AddressableEntity;
}

/**
 * Represents raw data for a write operation on an addressable entity.
 */
@jsonObject
export class TranformAddressableEntityRawData {
  /**
   * The write operation containing an addressable entity transform.
   */
  @jsonMember({ name: 'Write', constructor: TranformAddressableEntity })
  Write?: TranformAddressableEntity;
}

/**
 * Represents transform data for a package entity.
 */
@jsonObject
export class TranformPackageData {
  /**
   * The package data in the transform.
   */
  @jsonMember({ name: 'Package', constructor: Package })
  Package?: Package;
}

/**
 * Represents raw data for a write operation involving a package.
 */
@jsonObject
export class PackageRawData {
  /**
   * The write operation containing package data.
   */
  @jsonMember({ name: 'Write', constructor: TranformPackageData })
  Write?: TranformPackageData;
}

/**
 * Represents transform data for a bid kind.
 */
@jsonObject
export class TranformBidKindData {
  /**
   * The bid kind data in the transform.
   */
  @jsonMember({ name: 'BidKind', constructor: BidKind })
  BidKind?: BidKind;
}

/**
 * Represents raw data for a write operation on a bid kind.
 */
@jsonObject
export class BidKindRawData {
  /**
   * The write operation containing bid kind data.
   */
  @jsonMember({ name: 'Write', constructor: TranformBidKindData })
  Write?: TranformBidKindData;
}

/**
 * Represents a write operation involving a named key.
 */
@jsonObject
class WriteNamedKey {
  /**
   * The named key in the write operation.
   */
  @jsonMember(() => NamedKeyKind, { name: 'NamedKey' })
  NamedKey?: NamedKeyKind;
}

/**
 * Represents raw data for a write operation on a named key.
 */
@jsonObject
export class RawDataNamedKey {
  /**
   * The write operation containing the named key data.
   */
  @jsonMember({ constructor: WriteNamedKey, name: 'Write' })
  Write?: WriteNamedKey;
}

/**
 * Represents a write operation involving a message.
 */
@jsonObject
export class WriteMessage {
  /**
   * The message content in the write operation.
   */
  @jsonMember({ constructor: String, name: 'Message' })
  Message?: string;
}

/**
 * Represents raw data for a write operation on a message.
 */
@jsonObject
export class RawDataMessage {
  /**
   * The write operation containing message data.
   */
  @jsonMember({ constructor: WriteMessage, name: 'Write' })
  Write?: WriteMessage;
}

/**
 * Represents a write operation involving a message topic.
 */
@jsonObject
export class WriteMessageTopic {
  /**
   * The message topic in the write operation.
   */
  @jsonMember({ constructor: MessageTopicSummary, name: 'MessageTopic' })
  MessageTopic?: MessageTopicSummary;
}

/**
 * Represents raw data for a write operation on a message topic.
 */
@jsonObject
export class RawDataMessageTopic {
  /**
   * The write operation containing message topic data.
   */
  @jsonMember({ constructor: WriteMessageTopic, name: 'Write' })
  Write?: WriteMessageTopic;
}

/**
 * Represents raw write data for unbonding purses.
 */
@jsonObject
export class RawWriteUnbonding {
  /**
   * The list of unbonding purses in the write operation.
   */
  @jsonArrayMember(UnbondingPurse, { name: 'WriteUnbonding' })
  UnbondingPurses?: UnbondingPurse[];
}

/**
 * Represents raw write data for a UInt512 value.
 */
@jsonObject
export class RawUInt512 {
  /**
   * The UInt512 value in the write operation.
   */
  @jsonMember({
    name: 'AddUInt512',
    constructor: CLValueUInt512,
    deserializer: json => {
      if (!json) return;
      return CLValueUInt512.fromJSON(json);
    },
    serializer: value => {
      if (!value) return;
      return value.toJSON();
    }
  })
  UInt512?: CLValueUInt512;
}

/**
 * Represents raw write data for deploying information.
 */
@jsonObject
export class RawWriteDeployInfo {
  /**
   * The deploy information in the write operation.
   */
  @jsonMember({ constructor: DeployInfo, name: 'WriteDeployInfo' })
  WriteDeployInfo?: DeployInfo;
}

/**
 * Represents raw write data for a CLValue.
 * Used for serializing and deserializing the arguments of a CLValue write operation.
 */
@jsonObject
export class RawWriteCLValue {
  /**
   * The write operation on a CLValue represented as `Args`.
   */
  @jsonMember(() => CLValue, {
    deserializer: json => {
      if (!json) return;
      return CLValueParser.fromJSON(json);
    },
    serializer: (value: CLValue) => {
      if (!value) return;
      return CLValueParser.toJSON(value);
    },
    name: 'WriteCLValue'
  })
  WriteCLValue?: CLValue;
}

/**
 * Represents a write operation in a transaction.
 */
@jsonObject
export class WriteCLValue {
  /**
   * The CLValue write operation represented as `Args`.
   */
  @jsonMember(() => CLValue, {
    deserializer: json => {
      if (!json) return;
      return CLValueParser.fromJSON(json);
    },
    serializer: (value: CLValue) => {
      if (!value) return;
      return CLValueParser.toJSON(value);
    },
    name: 'CLValue'
  })
  CLValue?: CLValue;
}

/**
 * Represents raw write data for version 2 of a CLValue.
 */
@jsonObject
export class RawWriteCLValueV2 {
  /**
   * The write operation represented as `Write`.
   */
  @jsonMember({
    name: 'Write',
    constructor: WriteCLValue
  })
  Write?: WriteCLValue;
}

@jsonObject
export class WriteContract {
  @jsonMember({
    name: 'Contract',
    constructor: Contract
  })
  Contract?: Contract;
}

@jsonObject
export class RawWriteContract {
  @jsonMember({
    name: 'Write',
    constructor: WriteContract
  })
  Write?: WriteContract;
}

@jsonObject
export class WriteContractPackage {
  @jsonMember({
    name: 'ContractPackage',
    constructor: ContractPackage
  })
  ContractPackage?: ContractPackage;
}

@jsonObject
export class RawWriteContractPackage {
  @jsonMember({
    name: 'Write',
    constructor: WriteContractPackage
  })
  Write?: WriteContractPackage;
}

/**
 * Represents the inner Account object in a 2.x Write transformation.
 */
@jsonObject
export class RawWriteAccount2XTransformAccount {
  @jsonMember({
    name: 'account_hash',
    constructor: AccountHash,
    deserializer: json => {
      if (!json) return;
      return AccountHash.fromJSON(json);
    },
    serializer: (value: AccountHash) => {
      return value.toJSON();
    }
  })
  accountHash: AccountHash;
}

/**
 * Represents the nested Write.Account object in a 2.x Write transformation.
 */
@jsonObject
export class RawWriteAccount2XTransformWrite {
  @jsonMember({
    name: 'Account',
    constructor: RawWriteAccount2XTransformAccount
  })
  Account: RawWriteAccount2XTransformAccount;
}

/**
 * Represents a 2.x Write transformation.
 *
 * Expected JSON shape:
 * {
 *   "Write": {
 *     "Account": {
 *       "account_hash": "..."
 *     }
 *   }
 * }
 */
@jsonObject
export class RawWriteAccount2XTransform {
  @jsonMember({ name: 'Write', constructor: RawWriteAccount2XTransformWrite })
  Write: RawWriteAccount2XTransformWrite;
}

/**
 * Represents a 1.x Write transformation.
 *
 * Expected JSON shape:
 * {
 *   "WriteAccount": "..."
 * }
 */
@jsonObject
export class RawWriteAccount1XTransform {
  @jsonMember({
    name: 'WriteAccount',
    constructor: AccountHash,
    deserializer: json => {
      if (!json) return;
      return AccountHash.fromJSON(json);
    },
    serializer: (value: AccountHash) => {
      return value.toJSON();
    }
  })
  WriteAccount: AccountHash;
}
