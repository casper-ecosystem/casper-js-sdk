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
  byteArrayJsonDeserializer,
  byteArrayJsonSerializer
} from './SerializationUtils';

/**
 * Interface representing the parameters required to build a `TransactionV1Payload`.
 */
interface ITransactionPayloadBuildParams {
  initiatorAddr: InitiatorAddr;
  args: Args;
  ttl: Duration;
  entryPoint: TransactionEntryPoint;
  pricingMode: PricingMode;
  timestamp: Timestamp;
  category?: number;
  transactionTarget: TransactionTarget;
  scheduling: TransactionScheduling;
  chainName: string;
}

/**
 * Class representing a collection of payload fields used in transaction serialization.
 */
export class PayloadFields {
  /**
   * Map storing the fields of the payload where the key is the field identifier and the value is the serialized data.
   */
  public fields: Map<number, Uint8Array> = new Map();

  /**
   * Adds a field to the payload.
   *
   * @param field - The identifier of the field.
   * @param value - The serialized value of the field.
   */
  addField(field: number, value: Uint8Array): void {
    this.fields.set(field, value);
  }

  getFieldValue(fieldIndex: number) {
    return this.fields.get(fieldIndex);
  }

  /**
   * Serializes the payload fields into a `Uint8Array`.
   *
   * @returns A `Uint8Array` containing the serialized payload fields.
   */
  toBytes(): Uint8Array {
    const fieldsCount = toBytesU32(this.fields.size);
    const fieldEntries = Array.from(this.fields.entries()).map(([key, value]) =>
      concat([toBytesU16(key), value])
    );

    return concat([fieldsCount, ...fieldEntries]);
  }

  /**
   * Deserializes a JSON object into a `PayloadFields` instance.
   *
   * @param json - The JSON representation of the payload fields.
   * @returns A `PayloadFields` instance.
   */
  static fromJSON(json: Record<string, string>): PayloadFields {
    const payload = new PayloadFields();
    for (const [key, value] of Object.entries(json)) {
      const field = parseInt(key);
      if (!isNaN(field)) {
        payload.addField(field, byteArrayJsonDeserializer(value));
      }
    }
    return payload;
  }

  /**
   * Converts the payload fields to a JSON object.
   *
   * @returns A JSON representation of the payload fields.
   */
  toJSON(): Record<string, string> {
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
   * The address of the transaction initiator.
   */
  @jsonMember({
    name: 'initiator_addr',
    constructor: InitiatorAddr,
    deserializer: json => InitiatorAddr.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public initiatorAddr: InitiatorAddr;

  /**
   * The timestamp of the transaction.
   */
  @jsonMember({
    name: 'timestamp',
    constructor: Timestamp,
    deserializer: json => Timestamp.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public timestamp: Timestamp;

  /**
   * The time-to-live (TTL) duration of the transaction.
   */
  @jsonMember({
    name: 'ttl',
    constructor: Duration,
    deserializer: json => Duration.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public ttl: Duration;

  /**
   * The pricing mode used for the transaction.
   */
  @jsonMember({ name: 'pricing_mode', constructor: PricingMode })
  public pricingMode: PricingMode;

  /**
   * The name of the blockchain on which the transaction is executed.
   */
  @jsonMember({ name: 'chain_name', constructor: String })
  public chainName: string;

  /**
   * Additional serialized fields associated with the transaction.
   */
  @jsonMember({
    name: 'fields',
    serializer: value => (value ? value.toJSON() : undefined),
    deserializer: json => (json ? PayloadFields.fromJSON(json) : undefined)
  })
  public fields: PayloadFields;

  /**
   * Arguments associated with the transaction.
   */
  public args: Args;

  /**
   * The target of the transaction.
   */
  public target: TransactionTarget;

  /**
   * The entry point of the transaction.
   */
  public entryPoint: TransactionEntryPoint;

  /**
   * The scheduling information for the transaction.
   */
  public scheduling: TransactionScheduling;

  /**
   * Optional category of the transaction.
   */
  public category?: number;

  /**
   * Serializes the transaction payload into a `Uint8Array`.
   *
   * @returns A `Uint8Array` representing the serialized transaction payload.
   */
  public toBytes(): Uint8Array {
    const calltableSerialization = new CalltableSerialization();
    const fields = new PayloadFields();
    fields.addField(0, this.args.toBytes());
    fields.addField(1, this.target.toBytes());
    fields.addField(2, this.entryPoint.bytes());
    fields.addField(3, this.scheduling.bytes());

    calltableSerialization.addField(0, this.initiatorAddr.toBytes());
    calltableSerialization.addField(
      1,
      toBytesU64(Date.parse(this.timestamp.toJSON()))
    );
    calltableSerialization.addField(2, toBytesU64(this.ttl.duration));
    calltableSerialization.addField(3, toBytesString(this.chainName));
    calltableSerialization.addField(4, this.pricingMode.toBytes());
    calltableSerialization.addField(5, fields.toBytes());

    return calltableSerialization.toBytes();
  }

  /**
   * Creates a `TransactionV1Payload` instance from the provided parameters.
   *
   * @param params - The parameters for building the transaction payload.
   * @returns A new `TransactionV1Payload` instance.
   */
  public static build({
    initiatorAddr,
    args,
    ttl,
    entryPoint,
    pricingMode,
    timestamp,
    category,
    transactionTarget,
    scheduling,
    chainName
  }: ITransactionPayloadBuildParams): TransactionV1Payload {
    const payloadFields = new PayloadFields();
    payloadFields.addField(0, args.toBytes());
    payloadFields.addField(1, transactionTarget.toBytes());
    payloadFields.addField(2, entryPoint.bytes());
    payloadFields.addField(3, scheduling.bytes());

    const transactionPayload = new TransactionV1Payload();
    transactionPayload.initiatorAddr = initiatorAddr;
    transactionPayload.ttl = ttl;
    transactionPayload.args = args;
    transactionPayload.entryPoint = entryPoint;
    transactionPayload.pricingMode = pricingMode;
    transactionPayload.timestamp = timestamp;
    transactionPayload.category = category;
    transactionPayload.target = transactionTarget;
    transactionPayload.scheduling = scheduling;
    transactionPayload.chainName = chainName;
    transactionPayload.fields = payloadFields;

    return transactionPayload;
  }

  /**
   * Deserializes a JSON object into a `TransactionV1Payload` instance.
   *
   * This method parses a JSON object to create a `TransactionV1Payload` instance.
   * Additionally, it deserializes nested fields such as `args`, `target`, `entryPoint`,
   * and `scheduling` from their respective byte representations if they are present.
   *
   * @param json - The JSON object representing a serialized `TransactionV1Payload`.
   * @returns A deserialized `TransactionV1Payload` instance, or `undefined` if parsing fails.
   *
   * ### Example
   * ```typescript
   * const json = {
   *   fields: {
   *     // Provide serialized fields in JSON format
   *   }
   * };
   * const transactionPayload = TransactionV1Payload.fromJSON(json);
   * console.log(transactionPayload); // Parsed TransactionV1Payload instance or undefined
   * ```
   */
  public static fromJSON(json: any): TransactionV1Payload | undefined {
    const serializer = new TypedJSON(TransactionV1Payload);
    const transactionPayload = serializer.parse(json);

    if (!transactionPayload) {
      return undefined;
    }

    const argsBytes = transactionPayload.fields.getFieldValue(0);
    const targetBytes = transactionPayload.fields.getFieldValue(1);
    const entryPointBytes = transactionPayload.fields.getFieldValue(2);
    const schedulingBytes = transactionPayload.fields.getFieldValue(3);

    if (argsBytes) {
      transactionPayload.args = Args.fromBytes(argsBytes);
    }

    if (targetBytes) {
      transactionPayload.target = TransactionTarget.fromBytes(targetBytes);
    }

    if (entryPointBytes) {
      transactionPayload.entryPoint = TransactionEntryPoint.fromBytes(
        entryPointBytes
      );
    }

    if (schedulingBytes) {
      transactionPayload.scheduling = TransactionScheduling.fromBytes(
        schedulingBytes
      );
    }

    return transactionPayload;
  }
}
