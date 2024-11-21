import { concat } from '@ethersproject/bytes';
import {
  toBytesString,
  toBytesU16,
  toBytesU32,
  toBytesU64
} from './ByteConverters';
import { jsonMember, jsonObject } from 'typedjson';
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

export class PayloadFields {
  public fields: Map<number, Uint8Array> = new Map();

  addField(field: number, value: Uint8Array): void {
    this.fields.set(field, value);
  }

  toBytes(): Uint8Array {
    const fieldsCount = toBytesU32(this.fields.size);
    const fieldEntries = Array.from(this.fields.entries()).map(
      ([key, value]) => {
        return concat([toBytesU16(key), value]);
      }
    );

    return concat([fieldsCount, ...fieldEntries]);
  }

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

  toJSON(): Record<string, string> {
    const result: Record<string, string> = {};
    const fieldEntries = Array.from(this.fields.entries());
    for (const [key, value] of fieldEntries) {
      result[key.toString()] = byteArrayJsonSerializer(value);
    }
    return result;
  }
}

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
   * The name of the blockchain.
   */
  @jsonMember({ name: 'chain_name', constructor: String })
  public chainName: string;

  /**
   * The name of the blockchain.
   */
  @jsonMember({
    name: 'fields',
    serializer: value => {
      if (!value) return;
      return value.toJSON();
    },
    deserializer: json => {
      if (!json) return;
      return PayloadFields.fromJSON(json);
    }
  })
  public fields: PayloadFields;

  public args: Args;
  public target: TransactionTarget;
  public entryPoint: TransactionEntryPoint;
  public scheduling: TransactionScheduling;
  public category?: number;

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
}
