import { jsonMember, jsonObject } from 'typedjson';

import { InitiatorAddr } from './InitiatorAddr';
import { Duration, Timestamp } from './Time';
import { PricingMode } from './PricingMode';
import { Args, NamedArg } from './Args';
import { TransactionTarget } from './TransactionTarget';
import { TransactionEntryPoint } from './TransactionEntryPoint';
import { TransactionScheduling } from './TransactionScheduling';
import { CalltableSerialization } from './CalltableSerialization';
import { deserializeArgs, serializeArgs } from './SerializationUtils';
import { CLValue } from './clvalue';
import {
  expandBuffer,
  writeBytes,
  writeInteger,
  writeUShort
} from './ByteConverters';

/**
 * Interface representing the parameters required to build a `TransactionV1Payload`.
 * Contains all necessary data to construct a valid V1 transaction payload.
 */
interface ITransactionPayloadBuildParams {
  /**
   * The address of the transaction initiator.
   */
  initiatorAddr: InitiatorAddr;

  /**
   * Arguments for the transaction.
   */
  args: Args;

  /**
   * The time-to-live (TTL) duration of the transaction.
   */
  ttl: Duration;

  /**
   * Entry point for the transaction execution.
   */
  entryPoint: TransactionEntryPoint;

  /**
   * Pricing mode for the transaction.
   */
  pricingMode: PricingMode;

  /**
   * Timestamp indicating when the transaction was created.
   */
  timestamp: Timestamp;

  /**
   * Target destination of the transaction.
   */
  transactionTarget: TransactionTarget;

  /**
   * Scheduling details for the transaction.
   */
  scheduling: TransactionScheduling;

  /**
   * Name of the chain the transaction should be executed on.
   */
  chainName: string;
}

/**
 * Class representing a collection of fields used in transaction serialization.
 * This class handles serialization and deserialization of transaction data fields.
 */
@jsonObject
export class PayloadFields {
  /**
   * Arguments for the transaction.
   */
  @jsonMember(() => Args, {
    deserializer: deserializeArgs,
    serializer: (args: Args) => serializeArgs(args, true)
  })
  public args: Args;

  /**
   * Target destination of the transaction.
   */
  @jsonMember({
    name: 'target',
    constructor: TransactionTarget,
    deserializer: json => TransactionTarget.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public target: TransactionTarget;

  /**
   * Entry point for the transaction execution.
   */
  @jsonMember({
    name: 'entry_point',
    constructor: TransactionEntryPoint,
    deserializer: json => TransactionEntryPoint.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public entryPoint: TransactionEntryPoint;

  /**
   * Scheduling details for the transaction execution.
   */
  @jsonMember({
    name: 'scheduling',
    constructor: TransactionScheduling,
    deserializer: json => TransactionScheduling.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public scheduling: TransactionScheduling;

  /**
   * Internal map to store serialized fields, where the key is the field identifier.
   */
  private fields: Map<number, Uint8Array> = new Map();

  /**
   * Builds a `PayloadFields` instance from provided transaction details.
   *
   * @param args - Transaction arguments.
   * @param transactionTarget - Transaction target.
   * @param transactionEntryPoint - Transaction entry point.
   * @param transactionScheduling - Scheduling information for the transaction.
   * @returns A new `PayloadFields` instance.
   * @throws Error if any of the required parameters are missing or invalid.
   */
  public static build(
    args: Args,
    transactionTarget: TransactionTarget,
    transactionEntryPoint: TransactionEntryPoint,
    transactionScheduling: TransactionScheduling
  ): PayloadFields {
    const missingFields = [];
    if (!args) missingFields.push('args');
    if (!transactionTarget) missingFields.push('transactionTarget');
    if (!transactionEntryPoint) missingFields.push('transactionEntryPoint');
    if (!transactionScheduling) missingFields.push('transactionScheduling');

    if (missingFields.length > 0) {
      throw new Error(
        `Failed to build PayloadFields: Missing or invalid fields: ${missingFields.join(
          ', '
        )}.`
      );
    }

    const payloadFields = new PayloadFields();
    payloadFields.args = args;
    payloadFields.target = transactionTarget;
    payloadFields.entryPoint = transactionEntryPoint;
    payloadFields.scheduling = transactionScheduling;

    return payloadFields;
  }

  /**
   * Adds a serialized field to the payload.
   *
   * @param field - Field identifier.
   * @param value - Serialized value of the field.
   */
  public addField(field: number, value: Uint8Array): void {
    this.fields.set(field, value);
  }

  /**
   * Retrieves the value of a specific field.
   *
   * @param fieldIndex - Identifier of the field.
   * @returns Serialized value of the field.
   */
  public getFieldValue(fieldIndex: number): Uint8Array | undefined {
    return this.fields.get(fieldIndex);
  }

  /**
   * Serializes the fields of the object into a `Uint8Array` for transmission or storage.
   *
   * This method iterates over the `fields` map, serializing each key-value pair. The key is
   * written as a 16-bit unsigned integer, and the value is written as a sequence of bytes.
   * The resulting byte array contains all serialized fields in order, preceded by the number of fields.
   *
   * @returns A `Uint8Array` containing the serialized representation of the fields.
   *
   */
  toBytes(): Uint8Array {
    const bufferSize = 1024;
    let fieldsBytes = new ArrayBuffer(bufferSize);
    let view = new DataView(fieldsBytes);
    let offset = 0;

    offset = writeInteger(view, offset, this.fields.size);

    for (const [field, value] of Array.from(this.fields.entries())) {
      if (offset + 2 > fieldsBytes.byteLength) {
        fieldsBytes = expandBuffer(fieldsBytes, offset + 2);
        view = new DataView(fieldsBytes);
      }
      offset = writeUShort(view, offset, field);

      if (offset + value.length > fieldsBytes.byteLength) {
        fieldsBytes = expandBuffer(fieldsBytes, offset + value.length);
        view = new DataView(fieldsBytes);
      }
      offset = writeBytes(view, offset, value);
    }

    return new Uint8Array(fieldsBytes, 0, offset);
  }
}

/**
 * Class representing the payload for a V1 transaction.
 */
@jsonObject
export class TransactionV1Payload {
  /**
   * Address of the transaction initiator.
   */
  @jsonMember({
    name: 'initiator_addr',
    constructor: InitiatorAddr,
    deserializer: json => InitiatorAddr.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public initiatorAddr: InitiatorAddr;

  /**
   * Timestamp when the transaction was created.
   */
  @jsonMember({
    name: 'timestamp',
    constructor: Timestamp,
    deserializer: json => Timestamp.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public timestamp: Timestamp;

  /**
   * Time-to-live (TTL) duration of the transaction.
   */
  @jsonMember({
    name: 'ttl',
    constructor: Duration,
    deserializer: json => Duration.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public ttl: Duration;

  /**
   * Pricing mode used for the transaction.
   */
  @jsonMember({ name: 'pricing_mode', constructor: PricingMode })
  public pricingMode: PricingMode;

  /**
   * Name of the chain the transaction should be executed on.
   */
  @jsonMember({ name: 'chain_name', constructor: String })
  public chainName: string;

  /**
   * Serialized fields associated with the transaction.
   */
  @jsonMember({
    name: 'fields',
    constructor: PayloadFields
  })
  public fields: PayloadFields;

  /**
   * Serializes the transaction payload into a `Uint8Array`.
   *
   * @returns A `Uint8Array` representing the serialized transaction payload.
   */
  toBytes(): Uint8Array {
    const bufferSize = 1024;
    let runtimeArgsBuffer = new ArrayBuffer(bufferSize);
    let runtimeArgsView = new DataView(runtimeArgsBuffer);
    let offset = 0;

    runtimeArgsView.setUint8(offset, 0x00);
    offset += 1;

    if (offset + 4 > runtimeArgsBuffer.byteLength) {
      runtimeArgsBuffer = expandBuffer(runtimeArgsBuffer, offset + 4);
      runtimeArgsView = new DataView(runtimeArgsBuffer);
    }
    runtimeArgsView.setUint32(offset, this.fields.args.args.size, true);
    offset += 4;

    for (const [name, value] of Array.from(this.fields.args.args.entries())) {
      const namedArg = new NamedArg(name, value);
      const argBytes = NamedArg.toBytesWithNamedArg(namedArg);

      if (offset + argBytes.length > runtimeArgsBuffer.byteLength) {
        runtimeArgsBuffer = expandBuffer(
          runtimeArgsBuffer,
          offset + argBytes.length
        );
        runtimeArgsView = new DataView(runtimeArgsBuffer);
      }
      new Uint8Array(runtimeArgsBuffer, offset).set(argBytes);
      offset += argBytes.length;
    }

    const runtimeArgsBytes = new Uint8Array(runtimeArgsBuffer, 0, offset);

    const fields = new PayloadFields();

    const runtimeArgsWithLength = new Uint8Array(runtimeArgsBytes.length + 4);
    new DataView(runtimeArgsWithLength.buffer).setUint32(
      0,
      runtimeArgsBytes.length,
      true
    );
    runtimeArgsWithLength.set(runtimeArgsBytes, 4);
    fields.addField(0, runtimeArgsWithLength);

    const targetBytes = this.fields.target.toBytes();
    const targetWithLength = new Uint8Array(targetBytes.length + 4);
    new DataView(targetWithLength.buffer).setUint32(
      0,
      targetBytes.length,
      true
    );
    targetWithLength.set(targetBytes, 4);
    fields.addField(1, targetWithLength);

    const entryPointBytes = this.fields.entryPoint.toBytes();
    const entryPointWithLength = new Uint8Array(entryPointBytes.length + 4);
    new DataView(entryPointWithLength.buffer).setUint32(
      0,
      entryPointBytes.length,
      true
    );
    entryPointWithLength.set(entryPointBytes, 4);
    fields.addField(2, entryPointWithLength);

    const schedulingBytes = this.fields.scheduling.toBytes();
    const schedulingWithLength = new Uint8Array(schedulingBytes.length + 4);
    new DataView(schedulingWithLength.buffer).setUint32(
      0,
      schedulingBytes.length,
      true
    );
    schedulingWithLength.set(schedulingBytes, 4);
    fields.addField(3, schedulingWithLength);

    return new CalltableSerialization()
      .addField(0, this.initiatorAddr.toBytes())
      .addField(1, CLValue.newCLUint64(this.timestamp.toMilliseconds()).bytes())
      .addField(2, CLValue.newCLUint64(this.ttl.duration).bytes())
      .addField(3, CLValue.newCLString(this.chainName).bytes())
      .addField(4, this.pricingMode.toBytes())
      .addField(5, fields.toBytes())
      .toBytes();
  }

  /**
   * Constructs a `TransactionV1Payload` instance with specified parameters.
   *
   * @param params - Parameters for building the transaction payload.
   * @returns A new `TransactionV1Payload` instance.
   */
  public static build({
    initiatorAddr,
    args,
    ttl,
    entryPoint,
    pricingMode,
    timestamp,
    transactionTarget,
    scheduling,
    chainName
  }: ITransactionPayloadBuildParams): TransactionV1Payload {
    const payloadFields = PayloadFields.build(
      args,
      transactionTarget,
      entryPoint,
      scheduling
    );

    const payload = new TransactionV1Payload();
    payload.initiatorAddr = initiatorAddr;
    payload.ttl = ttl;
    payload.pricingMode = pricingMode;
    payload.timestamp = timestamp;
    payload.chainName = chainName;
    payload.fields = payloadFields;

    return payload;
  }
}
