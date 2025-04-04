import { jsonObject, jsonMember, TypedJSON } from 'typedjson';
import { TransactionHash } from './Transaction';
import { InitiatorAddr } from './InitiatorAddr';
import { AccountHash, Hash, URef } from './key';
import { CLValueUInt512 } from './clvalue';
import { BigNumber } from '@ethersproject/bignumber';

/**
 * Represents the details of a version 1 (V1) transfer transaction.
 */
@jsonObject
export class TransferV1 {
  /**
   * The amount being transferred in a version 1 transaction.
   */
  @jsonMember({
    constructor: CLValueUInt512,
    deserializer: json => CLValueUInt512.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public amount: CLValueUInt512;

  /**
   * The deploy hash associated with the transfer.
   */
  @jsonMember({
    name: 'deploy_hash',
    constructor: Hash,
    deserializer: json => Hash.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public deployHash: Hash;

  /**
   * The account hash representing the sender of the transfer.
   */
  @jsonMember({
    constructor: AccountHash,
    deserializer: json => AccountHash.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public from: AccountHash;

  /**
   * The gas used for the transfer.
   */
  @jsonMember({
    constructor: Number,
    deserializer: json => BigNumber.from(json).toNumber(),
    serializer: value => BigNumber.from(value).toString()
  })
  public gas: number;

  /**
   * The optional ID of the transfer.
   */
  @jsonMember({ constructor: Number })
  public id?: number;

  /**
   * The source URef (Universal Reference) of the transfer.
   */
  @jsonMember({
    constructor: URef,
    deserializer: json => URef.fromJSON(json),
    serializer: (value: URef) => value.toJSON()
  })
  public source: URef;

  /**
   * The target URef (Universal Reference) of the transfer.
   */
  @jsonMember({
    constructor: URef,
    deserializer: json => URef.fromJSON(json),
    serializer: (value: URef) => value.toJSON()
  })
  public target: URef;

  /**
   * The optional account hash representing the recipient of the transfer.
   */
  @jsonMember({
    constructor: AccountHash,
    deserializer: json => {
      if (!json) return;
      return AccountHash.fromJSON(json);
    },
    serializer: value => {
      if (!value) return;
      return value.toJSON();
    }
  })
  public to?: AccountHash;
}

/**
 * Represents the details of a version 2 (V2) transfer transaction.
 */
@jsonObject
export class TransferV2 {
  /**
   * The amount being transferred in a version 2 transaction.
   */
  @jsonMember({
    constructor: CLValueUInt512,
    deserializer: json => CLValueUInt512.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public amount: CLValueUInt512;

  /**
   * The transaction hash associated with the transfer.
   */
  @jsonMember({ name: 'transaction_hash', constructor: TransactionHash })
  public transactionHash: TransactionHash;

  /**
   * The initiator address of the transfer, containing details about the sender.
   */
  @jsonMember({
    constructor: InitiatorAddr,
    deserializer: json => InitiatorAddr.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public from: InitiatorAddr;

  /**
   * The gas used for the transfer.
   */
  @jsonMember({
    constructor: Number,
    deserializer: json => BigNumber.from(json).toNumber(),
    serializer: value => BigNumber.from(value).toString()
  })
  public gas: number;

  /**
   * The optional ID of the transfer.
   */
  @jsonMember({ constructor: Number })
  public id?: number;

  /**
   * The source URef (Universal Reference) of the transfer.
   */
  @jsonMember({
    constructor: URef,
    deserializer: json => URef.fromJSON(json),
    serializer: (value: URef) => value.toJSON()
  })
  public source: URef;

  /**
   * The target URef (Universal Reference) of the transfer.
   */
  @jsonMember({
    constructor: URef,
    deserializer: json => URef.fromJSON(json),
    serializer: (value: URef) => value.toJSON()
  })
  public target: URef;

  /**
   * The optional account hash representing the recipient of the transfer.
   */
  @jsonMember({
    constructor: AccountHash,
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
}

/**
 * Represents a versioned transfer transaction, which can be either version 1 (V1) or version 2 (V2).
 */
@jsonObject
class TransferVersioned {
  /**
   * The version 1 transfer details, if applicable.
   */
  @jsonMember({ name: 'Version1', constructor: TransferV1 })
  public Version1?: TransferV1;

  /**
   * The version 2 transfer details, if applicable.
   */
  @jsonMember({ name: 'Version2', constructor: TransferV2 })
  public Version2?: TransferV2;
}

/**
 * Represents a transfer transaction, which can be either version 1 (V1) or version 2 (V2).
 */
@jsonObject
export class Transfer {
  /**
   * The amount being transferred in the transaction.
   */
  @jsonMember({
    constructor: CLValueUInt512,
    deserializer: json => CLValueUInt512.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public amount: CLValueUInt512;

  /**
   * The transaction hash associated with the transfer.
   */
  @jsonMember({ name: 'transaction_hash', constructor: TransactionHash })
  public transactionHash: TransactionHash;

  /**
   * The initiator address of the transfer, containing details about the sender.
   */
  @jsonMember({
    constructor: InitiatorAddr,
    deserializer: json => InitiatorAddr.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public from: InitiatorAddr;

  /**
   * The gas used for the transfer.
   */
  @jsonMember({
    constructor: Number,
    deserializer: json => BigNumber.from(json).toNumber(),
    serializer: value => BigNumber.from(value).toString()
  })
  public gas: number;

  /**
   * The optional ID of the transfer.
   */
  @jsonMember({ constructor: Number })
  public id?: number;

  /**
   * The source URef (Universal Reference) of the transfer.
   */
  @jsonMember({
    constructor: URef,
    deserializer: json => URef.fromJSON(json),
    serializer: (value: URef) => value.toJSON()
  })
  public source: URef;

  /**
   * The target URef (Universal Reference) of the transfer.
   */
  @jsonMember({
    constructor: URef,
    deserializer: json => URef.fromJSON(json),
    serializer: (value: URef) => value.toJSON()
  })
  public target: URef;

  /**
   * The optional account hash representing the recipient of the transfer.
   */
  @jsonMember({
    constructor: AccountHash,
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

  private originTransferV1?: TransferV1;
  private originTransferV2?: TransferV2;

  /**
   * Gets the version 1 transfer details if available.
   *
   * @returns The version 1 transfer details, or `undefined` if not present.
   */
  public getTransferV1(): TransferV1 | undefined {
    return this.originTransferV1;
  }

  /**
   * Gets the version 2 transfer details if available.
   *
   * @returns The version 2 transfer details, or `undefined` if not present.
   */
  public getTransferV2(): TransferV2 | undefined {
    return this.originTransferV2;
  }

  /**
   * Deserializes a `Transfer` instance from JSON.
   * It can handle both version 1 and version 2 transfer formats.
   *
   * @param data The JSON data representing the transfer.
   * @returns A `Transfer` instance.
   * @throws Error if the transfer format is invalid or unrecognized.
   */
  public static fromJSON(data: any): Transfer {
    const versioned = TypedJSON.parse(data, TransferVersioned);

    if (versioned?.Version2) {
      const transfer = new Transfer();
      transfer.amount = versioned.Version2.amount;
      transfer.transactionHash = versioned.Version2.transactionHash;
      transfer.from = versioned.Version2.from;
      transfer.gas = versioned.Version2.gas;
      transfer.id = versioned.Version2.id;
      transfer.source = versioned.Version2.source;
      transfer.target = versioned.Version2.target;
      transfer.to = versioned.Version2.to;
      transfer.originTransferV2 = versioned.Version2;
      return transfer;
    }

    if (versioned?.Version1) {
      return Transfer.fromTransferV1(versioned.Version1);
    }

    const v1Compatible = TypedJSON.parse(data, TransferV1);

    if (v1Compatible) {
      return Transfer.fromTransferV1(v1Compatible);
    }

    throw new Error('Incorrect RPC response structure');
  }

  /**
   * Creates a `Transfer` instance from version 1 transfer data.
   *
   * @param transferV1 The version 1 transfer details.
   * @returns A `Transfer` instance created from the version 1 data.
   */
  private static fromTransferV1(transferV1: TransferV1): Transfer {
    const transfer = new Transfer();
    transfer.amount = transferV1.amount;
    transfer.transactionHash = TransactionHash.fromDeployHash(
      transferV1.deployHash
    );
    transfer.from = new InitiatorAddr(undefined, transferV1.from);
    transfer.gas = transferV1.gas;
    transfer.id = transferV1.id;
    transfer.source = transferV1.source;
    transfer.target = transferV1.target;
    transfer.to = transferV1.to;
    transfer.originTransferV1 = transferV1;
    return transfer;
  }
}
