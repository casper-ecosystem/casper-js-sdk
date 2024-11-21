import { concat } from '@ethersproject/bytes';
import { toBytesU16, toBytesU32 } from './ByteConverters';

export class Field {
  readonly index: number;
  readonly offset: number;
  readonly value: Uint8Array;

  constructor(index: number, offset: number, value: Uint8Array) {
    this.index = index;
    this.offset = offset;
    this.value = value;
  }

  /**
   * Calculates the serialized vector size for the given number of fields.
   * @returns The size of the serialized vector.
   */
  static serializedVecSize(): number {
    return 4 + 4 * 2;
  }
}

export class CalltableSerialization {
  private fields: Field[] = [];
  private currentOffset = 0;

  /**
   * Adds a field to the call table.
   * @param index The field index.
   * @param value The field value as a byte array.
   * @returns The current instance of CalltableSerialization.
   */
  addField(index: number, value: Uint8Array): CalltableSerialization {
    if (this.fields.length !== index) {
      throw new Error('Add fields in correct index order.');
    }

    const field = new Field(index, this.currentOffset, value);
    this.fields.push(field);
    this.currentOffset += value.length;

    return this;
  }

  /**
   * Serializes the call table to a byte array.
   * @returns A Uint8Array representing the serialized call table.
   */
  toBytes(): Uint8Array {
    const calltableBytes: Uint8Array[] = [];
    const payloadBytes: Uint8Array[] = [];

    calltableBytes.push(toBytesU32(this.fields.length));

    for (const field of this.fields) {
      calltableBytes.push(toBytesU16(field.index));
      calltableBytes.push(toBytesU32(field.offset));
      payloadBytes.push(field.value);
    }

    calltableBytes.push(toBytesU32(this.currentOffset));

    return concat([...calltableBytes, ...payloadBytes]);
  }
}
