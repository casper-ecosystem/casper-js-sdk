import { jsonObject, jsonMember } from 'typedjson';

import { Timestamp } from './Time';
import { CLValueUInt64 } from './clvalue';
import { CalltableSerialization } from './CalltableSerialization';
import { fromBytesU64, toBytesU64 } from './ByteConverters';

/**
 * Enum representing the scheduling tags for transaction scheduling types.
 */
export enum TransactionSchedulingTag {
  /** Native scheduling, meaning no future scheduling is applied. */
  Native = 0,
  /** Future scheduling based on the era ID. */
  FutureEra,
  /** Future scheduling based on a specific timestamp. */
  FutureTimestamp
}

/**
 * Represents the scheduling for a transaction in a future era.
 */
@jsonObject
export class FutureEraScheduling {
  /**
   * The ID of the future era when the transaction is scheduled to occur.
   */
  @jsonMember({ constructor: Number, name: 'EraID' })
  eraID: number;

  /**
   * Creates a new instance of `FutureEraScheduling`.
   *
   * @param eraID The era ID when the transaction is scheduled.
   */
  constructor(eraID: number) {
    this.eraID = eraID;
  }

  public toBytes(): Uint8Array {
    const calltableSerialization = new CalltableSerialization();
    calltableSerialization.addField(0, Uint8Array.of(1));
    calltableSerialization.addField(
      1,
      CLValueUInt64.newCLUint64(this.eraID).bytes()
    );

    return calltableSerialization.toBytes();
  }
}

/**
 * Represents the scheduling for a transaction in a future timestamp.
 */
@jsonObject
export class FutureTimestampScheduling {
  /**
   * The timestamp when the transaction is scheduled to occur.
   */
  @jsonMember({
    name: 'FutureTimestamp',
    constructor: Timestamp,
    deserializer: json => Timestamp.fromJSON(json),
    serializer: value => value.toJSON()
  })
  timestamp: Timestamp;

  /**
   * Creates a new instance of `FutureTimestampScheduling`.
   *
   * @param timestamp The timestamp when the transaction is scheduled.
   */
  constructor(timestamp: Timestamp) {
    this.timestamp = timestamp;
  }

  public toBytes(): Uint8Array {
    const calltableSerialization = new CalltableSerialization();
    calltableSerialization.addField(0, Uint8Array.of(2));
    calltableSerialization.addField(
      1,
      toBytesU64(Date.parse(this.timestamp.toJSON()))
    );

    return calltableSerialization.toBytes();
  }
}

/**
 * Represents a transaction scheduling, which could be either immediate (standard), scheduled for a future era, or scheduled for a future timestamp.
 */
@jsonObject
export class TransactionScheduling {
  /**
   * Represents the standard (immediate) scheduling with no future scheduling.
   */
  @jsonMember({ name: 'Standard', constructor: Object })
  standard?: object;

  /**
   * Represents scheduling to a future era with a specified `eraID`.
   */
  @jsonMember({ name: 'FutureEra', constructor: FutureEraScheduling })
  futureEra?: FutureEraScheduling;

  /**
   * Represents scheduling to a future timestamp with a specified `timestamp`.
   */
  @jsonMember({
    name: 'FutureTimestamp',
    constructor: FutureTimestampScheduling
  })
  futureTimestamp?: FutureTimestampScheduling;

  /**
   * Creates a new instance of `TransactionScheduling`.
   *
   * @param standard The standard scheduling with no delay.
   * @param futureEra The future era scheduling.
   * @param futureTimestamp The future timestamp scheduling.
   */
  constructor(
    standard?: object,
    futureEra?: FutureEraScheduling,
    futureTimestamp?: FutureTimestampScheduling
  ) {
    this.standard = standard;
    this.futureEra = futureEra;
    this.futureTimestamp = futureTimestamp;
  }

  /**
   * Determines the tag that corresponds to the current scheduling type.
   *
   * @returns The corresponding tag for the scheduling type.
   */
  tag(): TransactionSchedulingTag {
    if (this.standard) return TransactionSchedulingTag.Native;
    if (this.futureEra) return TransactionSchedulingTag.FutureEra;
    if (this.futureTimestamp) return TransactionSchedulingTag.FutureTimestamp;
    return 0;
  }

  /**
   * Serializes the transaction scheduling into a byte array representation.
   *
   * @returns A `Uint8Array` representing the transaction scheduling.
   */
  bytes(): Uint8Array {
    if (this.standard) {
      const calltableSerialization = new CalltableSerialization();
      calltableSerialization.addField(0, Uint8Array.of(0));
      return calltableSerialization.toBytes();
    } else if (this.futureEra) {
      return this.futureEra.toBytes();
    } else if (this.futureTimestamp) {
      return this.futureTimestamp.toBytes();
    }

    throw new Error('Unable to serialize TransactionScheduling');
  }

  /**
   * Creates a `TransactionScheduling` instance from a JSON object.
   *
   * @param json The JSON object to deserialize into a `TransactionScheduling` instance.
   * @returns The deserialized `TransactionScheduling` object.
   * @throws Error if the JSON format is invalid.
   */
  static fromJSON(json: any): TransactionScheduling {
    if (json === 'Standard') {
      return new TransactionScheduling({});
    }
    if (typeof json === 'object') {
      if ('FutureEra' in json) {
        return new TransactionScheduling(
          undefined,
          new FutureEraScheduling(json.FutureEra)
        );
      }
      if ('FutureTimestamp' in json) {
        return new TransactionScheduling(
          undefined,
          undefined,
          new FutureTimestampScheduling(json.FutureEra)
        );
      }
    }
    throw new Error('Invalid JSON format for TransactionScheduling');
  }

  /**
   * Converts the transaction scheduling into a JSON-compatible format.
   *
   * @returns The JSON representation of the transaction scheduling.
   * @throws Error if the scheduling type is unknown.
   */
  toJSON(): unknown {
    if (this.standard) {
      return 'Standard';
    }
    if (this.futureTimestamp) {
      return {
        FutureTimestamp: this.futureTimestamp.timestamp.date.toISOString()
      };
    }
    if (this.futureEra) {
      return { FutureEra: this.futureEra.eraID };
    }
    throw new Error('Unknown scheduling type');
  }

  /**
   * Deserializes a `Uint8Array` into a `TransactionScheduling` instance.
   *
   * This method parses a byte array representation of a `TransactionScheduling`
   * object, determines the type of scheduling based on the tag, and reconstructs
   * the appropriate instance.
   *
   * @param bytes - The byte array to be deserialized.
   * @returns A `TransactionScheduling` instance based on the serialized data.
   * @throws Error - If the byte array is invalid, missing required fields, or contains
   *                 an unrecognized scheduling tag.
   *
   * ### Tags and Their Associated Schedulers:
   * - `TransactionSchedulingTag.Native`: Represents a native scheduling target.
   * - `TransactionSchedulingTag.FutureEra`: Represents a scheduling target tied to a future era.
   * - `TransactionSchedulingTag.FutureTimestamp`: Represents a scheduling target tied to a future timestamp.
   *
   * ### Example
   * ```typescript
   * const bytes = new Uint8Array([...]); // Provide valid TransactionScheduling bytes
   * const scheduling = TransactionScheduling.fromBytes(bytes);
   * console.log(scheduling); // Parsed TransactionScheduling instance
   * ```
   */
  static fromBytes(bytes: Uint8Array): TransactionScheduling {
    const calltable = CalltableSerialization.fromBytes(bytes);

    const tagBytes = calltable.getField(0);
    if (!tagBytes || tagBytes.length !== 1) {
      throw new Error(
        'Invalid or missing tag in serialized TransactionScheduling'
      );
    }
    const tag = tagBytes[0];

    switch (tag) {
      case TransactionSchedulingTag.Native:
        return new TransactionScheduling({});

      case TransactionSchedulingTag.FutureEra: {
        const eraIDBytes = calltable.getField(1);
        if (!eraIDBytes) {
          throw new Error('Missing eraID field for FutureEra scheduling');
        }
        const eraID = fromBytesU64(eraIDBytes).toNumber();
        return new TransactionScheduling(
          undefined,
          new FutureEraScheduling(eraID)
        );
      }

      case TransactionSchedulingTag.FutureTimestamp: {
        const timestampBytes = calltable.getField(1);
        if (!timestampBytes) {
          throw new Error(
            'Missing timestamp field for FutureTimestamp scheduling'
          );
        }
        const timestampMs = fromBytesU64(timestampBytes).toNumber();
        const timestamp = new Timestamp(new Date(timestampMs));
        return new TransactionScheduling(
          undefined,
          undefined,
          new FutureTimestampScheduling(timestamp)
        );
      }

      default:
        throw new Error(`Unknown TransactionSchedulingTag: ${tag}`);
    }
  }
}
