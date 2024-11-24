import { jsonObject, jsonMember, jsonArrayMember, TypedJSON } from 'typedjson';

import { Hash } from './key';
import { Deploy } from './Deploy';
import { Duration, Timestamp } from './Time';
import { InitiatorAddr } from './InitiatorAddr';
import { PricingMode } from './PricingMode';
import { TransactionTarget } from './TransactionTarget';
import { TransactionEntryPoint } from './TransactionEntryPoint';
import { TransactionScheduling } from './TransactionScheduling';
import { PublicKey } from './keypair';
import { HexBytes } from './HexBytes';
import { PrivateKey } from './keypair/PrivateKey';
import { Args } from './Args';
import { deserializeArgs, serializeArgs } from './SerializationUtils';
import { byteHash } from './ByteConverters';
import { TransactionV1Payload } from './TransactionV1Payload';

/**
 * Custom error class for handling transaction-related errors.
 */
export class TransactionError extends Error {}

/**
 * Error to indicate an invalid transaction hash.
 */
export const ErrInvalidTransactionHash = new TransactionError(
  'invalid transaction hash'
);

/**
 * Error to indicate an invalid approval signature in a transaction.
 */
export const ErrInvalidApprovalSignature = new TransactionError(
  'invalid approval signature'
);

/**
 * Error to indicate an issue parsing JSON as a TransactionV1.
 */
export const ErrTransactionV1FromJson = new TransactionError(
  "The JSON can't be parsed as a TransactionV1."
);

/**
 * Enum representing the categories of transactions.
 */
export enum TransactionCategory {
  Mint = 0,
  Auction,
  InstallUpgrade,
  Large,
  Medium,
  Small
}

/**
 * Enum representing the versions of transactions.
 */
export enum TransactionVersion {
  V1 = 0,
  Deploy
}

/**
 * Represents an approval for a transaction with a signer and signature.
 */
@jsonObject
export class Approval {
  /**
   * The public key of the signer.
   */
  @jsonMember({
    name: 'signer',
    constructor: PublicKey,
    deserializer: json => PublicKey.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public signer: PublicKey;

  /**
   * The signature of the transaction signed by the signer.
   */
  @jsonMember({
    name: 'signature',
    constructor: HexBytes,
    deserializer: json => HexBytes.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public signature: HexBytes;

  /**
   * Constructs an `Approval` instance with a signer and signature.
   * @param signer The public key of the signer.
   * @param signature The signature of the transaction.
   */
  constructor(signer: PublicKey, signature: HexBytes) {
    this.signer = signer;
    this.signature = signature;
  }
}

/**
 * Represents a TransactionV1 object, including its header, body, and approvals.
 */
@jsonObject
export class TransactionV1 {
  /**
   * The hash of the transaction.
   */
  @jsonMember({
    name: 'hash',
    constructor: Hash,
    deserializer: json => Hash.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public hash: Hash;

  /**
   * The payload of the transaction.
   * A merge of header and body concepts from before.
   */
  @jsonMember({
    name: 'payload',
    constructor: TransactionV1Payload
  })
  public payload: TransactionV1Payload;

  /**
   * The approvals for the transaction.
   */
  @jsonArrayMember(() => Approval)
  public approvals: Approval[];

  constructor(
    hash: Hash,
    payload: TransactionV1Payload,
    approvals: Approval[]
  ) {
    this.hash = hash;
    this.payload = payload;
    this.approvals = approvals;
  }

  /**
   * Validates the transaction by checking the transaction hash and the approval signatures.
   * @throws {TransactionError} Throws errors if validation fails.
   */
  public validate(): boolean {
    const payloadBytes = this.payload!.toBytes();
    const calculatedHash = new Hash(byteHash(payloadBytes));

    if (!this.hash.equals(calculatedHash)) throw ErrInvalidTransactionHash;

    for (const approval of this.approvals) {
      if (
        !approval.signer.verifySignature(
          this.hash.toBytes(),
          approval.signature.bytes
        )
      ) {
        throw ErrInvalidApprovalSignature;
      }
    }

    return true;
  }

  /**
   * Signs the transaction using the provided private key.
   * @param keys The private key to sign the transaction.
   */
  async sign(keys: PrivateKey): Promise<void> {
    const signatureBytes = await keys.sign(this.hash.toBytes());
    const signature = new HexBytes(signatureBytes);

    if (!this.approvals) {
      this.approvals = [];
    }

    this.approvals.push(new Approval(keys.publicKey, signature));
  }

  /**
   * Sets an already generated signature to the transaction.
   * @param transaction The `TransactionV1` instance.
   * @param signature The Ed25519 or Secp256K1 signature.
   * @param publicKey The public key used to generate the signature.
   * @returns The updated `TransactionV1`.
   */
  static setSignature(
    transaction: TransactionV1,
    signature: Uint8Array,
    publicKey: PublicKey
  ): TransactionV1 {
    const hex = new HexBytes(signature);
    transaction.approvals.push(new Approval(publicKey, hex));

    return transaction;
  }

  /**
   * Creates a new `TransactionV1` instance.
   * @param hash The hash of the transaction.
   * @param payload The payload of the transaction. A merge of header and body concepts from before.
   * @param approvals The approvals for the transaction.
   * @returns A new `TransactionV1` instance.
   */
  static newTransactionV1(
    hash: Hash,
    payload: TransactionV1Payload,
    approvals: Approval[]
  ): TransactionV1 {
    return new TransactionV1(hash, payload, approvals);
  }

  /**
   * Creates a new `TransactionV1` instance with a header and body.
   * @param payload The payload of the transaction. A merge of header and body concepts from before.
   * @returns A new `TransactionV1` instance.
   */
  static makeTransactionV1(payload: TransactionV1Payload): TransactionV1 {
    const payloadBytes = payload.toBytes();
    const transactionHash = new Hash(byteHash(payloadBytes));
    return new TransactionV1(transactionHash, payload, []);
  }

  /**
   * Converts a JSON representation of a `TransactionV1` to a `TransactionV1` object.
   * @param json A JSON representation of a `TransactionV1`.
   * @returns A `TransactionV1` object.
   * @throws {TransactionError} If parsing fails.
   */
  public static fromJSON(json: any): TransactionV1 {
    let tx: TransactionV1 | undefined;

    try {
      const data: Record<string, any> =
        typeof json === 'string' ? JSON.parse(json) : json;
      const txData: Record<string, any> | null =
        data?.transaction?.Version1 ?? data?.Version1 ?? data ?? null;

      if (!(txData?.hash && txData?.payload?.initiator_addr)) {
        throw ErrTransactionV1FromJson;
      }

      const serializer = new TypedJSON(TransactionV1);
      tx = serializer.parse(txData);

      if (!tx) {
        throw ErrTransactionV1FromJson;
      }
    } catch (e) {
      throw new Error(`Serialization error: ${e.message}`);
    }

    tx.validate();

    return tx;
  }

  /**
   * Converts the `TransactionV1` object to a JSON representation.
   * @param transaction The `TransactionV1` object.
   * @returns A JSON version of the `TransactionV1`.
   */
  public static toJson = (transaction: TransactionV1) => {
    const serializer = new TypedJSON(TransactionV1);

    return serializer.toPlainJson(transaction);
  };
}

/**
 * Represents the header of a transaction, including details like chain name, timestamp,
 * time-to-live (TTL), initiator address, and pricing mode.
 */
@jsonObject
export class TransactionHeader {
  /**
   * The name of the blockchain chain associated with this transaction.
   */
  @jsonMember({ name: 'chain_name', constructor: String })
  public chainName: string;

  /**
   * The timestamp when the transaction was created.
   */
  @jsonMember({
    name: 'timestamp',
    constructor: Timestamp,
    deserializer: json => Timestamp.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public timestamp: Timestamp;

  /**
   * The time-to-live (TTL) duration of the transaction. It defines the expiration time for the transaction.
   */
  @jsonMember({
    name: 'ttl',
    constructor: Duration,
    deserializer: json => Duration.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public ttl: Duration;

  /**
   * The address of the initiator of the transaction.
   */
  @jsonMember({
    name: 'initiator_addr',
    constructor: InitiatorAddr,
    deserializer: json => InitiatorAddr.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public initiatorAddr: InitiatorAddr;

  /**
   * The pricing mode used for the transaction, which may involve different cost mechanisms.
   */
  @jsonMember({ name: 'pricing_mode', constructor: PricingMode })
  public pricingMode: PricingMode;

  /**
   * Creates a new `TransactionHeader` instance with the given properties.
   * @param chainName The name of the blockchain chain.
   * @param timestamp The timestamp of the transaction.
   * @param ttl The TTL (Time-To-Live) for the transaction.
   * @param initiatorAddr The address of the transaction initiator.
   * @param pricingMode The pricing mode for the transaction.
   */
  constructor(
    chainName: string,
    timestamp: Timestamp,
    ttl: Duration,
    initiatorAddr: InitiatorAddr,
    pricingMode: PricingMode
  ) {
    this.chainName = chainName;
    this.timestamp = timestamp;
    this.ttl = ttl;
    this.initiatorAddr = initiatorAddr;
    this.pricingMode = pricingMode;
  }
}

/**
 * Represents the body of a transaction, containing the arguments, target,
 * entry point, scheduling information, and transaction category.
 */
@jsonObject
export class TransactionBody {
  /**
   * The arguments for the transaction, which can be a map of values required by the entry point.
   */
  @jsonMember(() => Args, {
    deserializer: deserializeArgs,
    serializer: serializeArgs
  })
  public args: Args;

  /**
   * The target of the transaction, which specifies where the transaction is directed (e.g., a contract or account).
   */
  @jsonMember({
    name: 'target',
    constructor: TransactionTarget,
    serializer: value => value.toJSON(),
    deserializer: json => TransactionTarget.fromJSON(json)
  })
  public target: TransactionTarget;

  /**
   * The entry point of the transaction, specifying the method or action to be executed.
   */
  @jsonMember({
    name: 'entry_point',
    constructor: TransactionEntryPoint,
    serializer: value => value.toJSON(),
    deserializer: json => TransactionEntryPoint.fromJSON(json)
  })
  public entryPoint: TransactionEntryPoint;

  /**
   * The scheduling information for when the transaction should be executed.
   */
  @jsonMember({
    name: 'scheduling',
    constructor: TransactionScheduling,
    serializer: value => value.toJSON(),
    deserializer: json => TransactionScheduling.fromJSON(json)
  })
  public scheduling: TransactionScheduling;

  /**
   * The category of the transaction, indicating its type (e.g., minting, auction).
   */
  @jsonMember({ name: 'transaction_category', constructor: Number })
  public category?: number;

  /**
   * Constructs a `TransactionBody` with the given arguments, target, entry point, scheduling, and category.
   * @param args The arguments for the transaction.
   * @param target The target of the transaction (e.g., a contract or account).
   * @param entryPoint The entry point to specify the method or action of the transaction.
   * @param scheduling The scheduling information for the transaction's execution.
   * @param category The category/type of the transaction (e.g., mint, auction).
   */
  constructor(
    args: Args,
    target: TransactionTarget,
    entryPoint: TransactionEntryPoint,
    scheduling: TransactionScheduling,
    category?: number
  ) {
    this.args = args;
    this.target = target;
    this.entryPoint = entryPoint;
    this.scheduling = scheduling;
    this.category = category;
  }
}

/**
 * Represents a transaction in the system, containing information such as its hash,
 * header, body, approvals, and optionally its associated deployment and transaction details.
 */
@jsonObject
export class Transaction {
  /**
   * The hash of the transaction.
   */
  @jsonMember({
    name: 'hash',
    constructor: Hash,
    deserializer: json => Hash.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public hash: Hash;

  /**
   * The header of the transaction, which includes metadata about the transaction.
   */
  @jsonMember({ name: 'header', constructor: TransactionHeader })
  public header: TransactionHeader;

  /**
   * The body of the transaction, containing details such as the target, entry point, and arguments.
   */
  @jsonMember({ name: 'body', constructor: TransactionBody })
  public body: TransactionBody;

  /**
   * The list of approvals for this transaction.
   */
  @jsonArrayMember(Approval)
  public approvals: Approval[];

  /**
   * The original deployment associated with this transaction, if applicable.
   * This is optional and only populated if the transaction originated from a deploy.
   */
  private originDeployV1?: Deploy;

  /**
   * The original TransactionV1 associated with this transaction, if applicable.
   * This is optional and only populated if the transaction is based on a TransactionV1.
   */
  private originTransactionV1?: TransactionV1;

  /**
   * Creates a new `Transaction` instance with the specified values.
   * @param hash The hash of the transaction.
   * @param header The header of the transaction.
   * @param body The body of the transaction.
   * @param approvals The list of approvals for this transaction.
   * @param originTransactionV1 The original TransactionV1, if applicable.
   * @param originDeployV1 The original deploy, if applicable.
   */
  constructor(
    hash: Hash,
    header: TransactionHeader,
    body: TransactionBody,
    approvals: Approval[],
    originTransactionV1?: TransactionV1,
    originDeployV1?: Deploy
  ) {
    this.hash = hash;
    this.header = header;
    this.body = body;
    this.approvals = approvals;
    this.originDeployV1 = originDeployV1;
    this.originTransactionV1 = originTransactionV1;
  }

  /**
   * Gets the original deployment associated with this transaction, if available.
   * @returns The original deploy or `undefined` if not available.
   */
  public getDeploy(): Deploy | undefined {
    return this.originDeployV1;
  }

  /**
   * Gets the original TransactionV1 associated with this transaction, if available.
   * @returns The original TransactionV1 or `undefined` if not available.
   */
  public getTransactionV1(): TransactionV1 | undefined {
    return this.originTransactionV1;
  }

  /**
   * Converts a `TransactionV1` to a `Transaction` object.
   * @param v1 The `TransactionV1` to convert.
   * @returns A new `Transaction` instance created from the given `TransactionV1`.
   */
  static fromTransactionV1(v1: TransactionV1): Transaction {
    return new Transaction(
      v1.hash,
      new TransactionHeader(
        v1.payload.chainName,
        v1.payload.timestamp,
        v1.payload.ttl,
        v1.payload.initiatorAddr,
        v1.payload.pricingMode
      ),
      new TransactionBody(
        v1.payload.fields.args,
        v1.payload.fields.target,
        v1.payload.fields.entryPoint,
        v1.payload.fields.scheduling
      ),
      v1.approvals,
      v1
    );
  }
}

/**
 * Wrapper class for transactions, allowing for both `Deploy` and `TransactionV1` to be stored
 * in the same object. This can be useful when working with multiple versions of transactions.
 */
@jsonObject
export class TransactionWrapper {
  /**
   * The deployment object associated with the transaction, if applicable.
   * This will contain the details of the deploy transaction.
   */
  @jsonMember({ name: 'Deploy', constructor: () => Deploy })
  deploy?: Deploy;

  /**
   * The version 1 transaction object, if applicable.
   * This will contain the details of a TransactionV1, which represents the first version of a transaction.
   */
  @jsonMember({ name: 'Version1', constructor: TransactionV1 })
  transactionV1?: TransactionV1;

  /**
   * Constructs a new `TransactionWrapper` instance with the provided `Deploy` and `TransactionV1` values.
   * @param deploy The `Deploy` object, if applicable.
   * @param transactionV1 The `TransactionV1` object, if applicable.
   */
  constructor(deploy?: Deploy, transactionV1?: TransactionV1) {
    this.deploy = deploy;
    this.transactionV1 = transactionV1;
  }
}

/**
 * Represents a transaction hash, which can either be associated with a `Deploy` or a `TransactionV1`.
 * This class helps in wrapping transaction hashes from different transaction types.
 */
@jsonObject
export class TransactionHash {
  /**
   * The hash associated with the deploy transaction, if applicable.
   * This will contain the hash of the `Deploy` transaction.
   */
  @jsonMember({
    name: 'Deploy',
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
  public deploy?: Hash;

  /**
   * The hash associated with the version 1 transaction, if applicable.
   * This will contain the hash of the `TransactionV1`.
   */
  @jsonMember({
    name: 'Version1',
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
  public transactionV1?: Hash;

  /**
   * Constructs a new `TransactionHash` instance, which can hold either a `Deploy` hash or a `TransactionV1` hash.
   * @param deploy The hash of the deploy transaction, if applicable.
   * @param transactionV1 The hash of the version 1 transaction, if applicable.
   */
  constructor(deploy?: Hash, transactionV1?: Hash) {
    this.deploy = deploy;
    this.transactionV1 = transactionV1;
  }
}
