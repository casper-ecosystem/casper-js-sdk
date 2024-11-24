import { concat } from '@ethersproject/bytes';
import {
  toBytesString,
  toBytesU16,
  toBytesU32,
  toBytesU64
} from './ByteConverters';
import { jsonMember, jsonObject, TypedJSON } from 'typedjson';
import { InitiatorAddr } from './InitiatorAddr';
import { Duration, Timestamp } from './Time';
import { PricingMode } from './PricingMode';
import { Args } from './Args';
import { TransactionTarget } from './TransactionTarget';
import { TransactionEntryPoint } from './TransactionEntryPoint';
import { TransactionScheduling } from './TransactionScheduling';
import { CalltableSerialization } from './CalltableSerialization';
import {
  byteArrayJsonSerializer,
  deserializeArgs,
  serializeArgs
} from './SerializationUtils';

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
    serializer: serializeArgs
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
   * Utility method to map field identifiers to serialized values.
   * Ensures that all fields are properly initialized before serialization.
   * @returns A map of field identifiers to their serialized values.
   * @throws Error if any required field is uninitialized or invalid.
   */
  private toSerializedFields(): Map<number, Uint8Array> {
    if (!this.args) throw new Error('args field is uninitialized.');
    if (!this.target) throw new Error('target field is uninitialized.');
    if (!this.entryPoint) throw new Error('entryPoint field is uninitialized.');
    if (!this.scheduling) throw new Error('scheduling field is uninitialized.');

    return new Map([
      [0, this.args.toBytes()],
      [1, this.target.toBytes()],
      [2, this.entryPoint.bytes()],
      [3, this.scheduling.bytes()]
    ]);
  }

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

    payloadFields.fields = payloadFields.toSerializedFields();

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
   * Serializes all fields into a `Uint8Array`.
   *
   * @returns Serialized fields as a `Uint8Array`.
   */
  public toBytes(): Uint8Array {
    const fieldsCount = toBytesU32(this.fields.size);
    const serializedFields = Array.from(
      this.fields.entries()
    ).map(([key, value]) => concat([toBytesU16(key), value]));

    return concat([fieldsCount, ...serializedFields]);
  }

  /**
   * Deserializes JSON data into a `PayloadFields` instance.
   *
   * @param json - JSON representation of the payload fields.
   * @returns A `PayloadFields` instance.
   */
  public static fromJSON(json: any): PayloadFields {
    const deserialized = new TypedJSON(PayloadFields).parse(json);

    if (!deserialized) {
      throw new Error('Failed to deserialize PayloadFields.');
    }

    deserialized.fields = deserialized.toSerializedFields();

    return deserialized;
  }

  /**
   * Converts the payload fields to a JSON object.
   *
   * @returns A JSON representation of the payload fields.
   */
  public toJSON(): Record<string, string> {
    const result: Record<string, string> = {};
    const fieldEntries = Array.from(this.fields.entries());
    for (const [key, value] of fieldEntries) {
      result[key.toString()] = byteArrayJsonSerializer(value);
    }
    return result;
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
    serializer: value => (value ? value.toJSON() : undefined),
    deserializer: json => (json ? PayloadFields.fromJSON(json) : undefined)
  })
  public fields: PayloadFields;

  /**
   * Serializes the transaction payload into a `Uint8Array`.
   *
   * @returns A `Uint8Array` representing the serialized transaction payload.
   */
  public toBytes(): Uint8Array {
    const calltable = new CalltableSerialization();

    calltable.addField(0, this.initiatorAddr.toBytes());
    calltable.addField(1, toBytesU64(Date.parse(this.timestamp.toJSON())));
    calltable.addField(2, toBytesU64(this.ttl.duration));
    calltable.addField(3, toBytesString(this.chainName));
    calltable.addField(4, this.pricingMode.toBytes());
    calltable.addField(5, this.fields.toBytes());

    return calltable.toBytes();
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
