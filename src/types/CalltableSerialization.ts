import { concat } from '@ethersproject/bytes';
import { parseU16, parseU32, toBytesU16, toBytesU32 } from './ByteConverters';

/**
 * Represents a single field in the call table.
 */
export class Field {
  readonly index: number;
  readonly offset: number;
  value: Uint8Array;

  /**
   * Constructs a new `Field` instance.
   *
   * @param index - The index of the field.
   * @param offset - The offset of the field in the payload.
   * @param value - The byte array value of the field.
   */
  constructor(index: number, offset: number, value: Uint8Array) {
    this.index = index;
    this.offset = offset;
    this.value = value;
  }

  /**
   * Calculates the serialized vector size for the given number of fields.
   *
   * This method determines the size of the serialized vector required
   * to store all fields, including their indices and offsets.
   *
   * @returns The size of the serialized vector in bytes.
   */
  static serializedVecSize(): number {
    return 4 + 4 * 2; // Number of fields (4 bytes) + index/offset pairs (4 bytes each)
  }
}

/**
 * Handles serialization and deserialization of call table data.
 *
 * The `CalltableSerialization` class is responsible for managing a collection
 * of fields and converting them into a byte array for serialization. It can
 * also reconstruct the fields from a serialized byte array.
 */
export class CalltableSerialization {
  private fields: Field[] = [];
  private currentOffset = 0;

  /**
   * Adds a field to the call table.
   *
   * @param index - The field index.
   * @param value - The field value as a byte array.
   * @returns The current instance of `CalltableSerialization`.
   * @throws An error if the fields are not added in the correct index order.
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
   * Serializes the call table into a byte array.
   *
   * @returns A `Uint8Array` representing the serialized call table.
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

  /**
   * Retrieves a specific field by its index.
   *
   * @param index - The index of the field to retrieve.
   * @returns The field value as a `Uint8Array`, or `undefined` if the field is not found.
   */
  getField(index: number): Uint8Array | undefined {
    const field = this.fields.find(f => f.index === index);
    return field ? field.value : undefined;
  }

  /**
   * Deserializes a byte array into a `CalltableSerialization` object.
   *
   * This method reconstructs the call table and its fields from a serialized byte array.
   *
   * @param bytes - The serialized byte array.
   * @returns A `CalltableSerialization` instance containing the deserialized fields.
   * @throws An error if the byte array is invalid or missing required fields.
   */
  static fromBytes(bytes: Uint8Array): CalltableSerialization {
    const instance = new CalltableSerialization();
    let offset = 0;

    // Read the number of fields
    const fieldCount = parseU32(bytes.slice(offset, offset + 4));
    offset += 4;

    const fields: Field[] = [];
    for (let i = 0; i < fieldCount; i++) {
      const index = parseU16(bytes.slice(offset, offset + 2));
      offset += 2;
      const fieldOffset = parseU32(bytes.slice(offset, offset + 4));
      offset += 4;

      // Initialize each field with an empty value
      fields.push(new Field(index, fieldOffset, new Uint8Array()));
    }

    // Read the total payload size
    const payloadSize = parseU32(bytes.slice(offset, offset + 4));
    offset += 4;

    // Extract field values based on their offsets
    for (let i = 0; i < fields.length; i++) {
      const start = fields[i].offset;
      const end = i + 1 < fields.length ? fields[i + 1].offset : payloadSize;
      fields[i].value = bytes.slice(offset + start, offset + end);
    }

    instance.fields = fields;
    instance.currentOffset = payloadSize;
    return instance;
  }
}
