import { concat } from '@ethersproject/bytes';

import { CLType, CLTypeList } from './cltype';
import { CLValue, IResultWithBytes } from './CLValue';
import { CLValueUInt32 } from './Numeric';
import { CLValueParser } from './Parser';
import { toBytesU32 } from '../ByteConverters';

/**
 * Represents a List value in the Casper type system.
 * This class provides methods to manage and manipulate lists of CLValues.
 */
export class CLValueList {
  /**
   * The type of the list elements.
   */
  public type: CLTypeList;

  /**
   * The elements contained in the list.
   */
  public elements: CLValue[];

  /**
   * Initializes a new instance of the CLValueList class.
   * @param type - The CLTypeList representing the type of the list.
   * @param elements - Optional array of CLValues to initialize the list with.
   */
  constructor(type: CLTypeList, elements: CLValue[] = []) {
    this.type = type;
    this.elements = elements;
  }

  /**
   * Converts the list to its byte representation, including the length and each element's bytes.
   * @returns A Uint8Array representing the bytes of the list.
   */
  public bytes(): Uint8Array {
    const valueByteList = this.elements.map(e => e.bytes());
    valueByteList.splice(0, 0, toBytesU32(this.size()));
    return concat(valueByteList);
  }

  /**
   * Provides a string representation of the list.
   * @returns A string in the format "[elem1, elem2, ...]".
   */
  public toString(): string {
    const strData = this.elements.map(one => `"${one.toString()}"`);
    return `[${strData.join(',')}]`;
  }

  /**
   * Checks if the list is empty.
   * @returns true if the list is empty, false otherwise.
   */
  public isEmpty(): boolean {
    return this.size() === 0;
  }

  /**
   * Appends a new element to the list.
   * @param value - The CLValue to append to the list.
   */
  public append(value: CLValue): void {
    this.elements.push(value);
  }

  /**
   * Removes an element from the list at the specified index.
   * @param index - The index of the element to remove.
   */
  public remove(index: number): void {
    this.elements.splice(index, 1);
  }

  /**
   * Removes and returns the last element from the list.
   * @returns The last element of the list, or undefined if the list is empty.
   */
  public pop(): CLValue | undefined {
    return this.elements.pop();
  }

  /**
   * Returns the number of elements in the list.
   * @returns The number of elements in the list.
   */
  public size(): number {
    return this.elements.length;
  }

  /**
   * Sets the element at the specified index.
   * @param index - The index at which to set the element.
   * @param item - The CLValue to set at the specified index.
   * @throws Error if the index is out of bounds.
   */
  public set(index: number, item: CLValue): void {
    if (index >= this.elements.length) {
      throw new Error('List index out of bounds.');
    }
    this.elements[index] = item;
  }

  /**
   * Gets the element at the specified index.
   * @param index - The index of the element to get.
   * @returns The CLValue at the specified index.
   * @throws Error if the index is out of bounds.
   */
  public get(index: number): CLValue {
    if (index >= this.elements.length) {
      throw new Error('List index out of bounds.');
    }
    return this.elements[index];
  }

  /**
   * Converts the list to a JSON-compatible representation.
   * @returns An array of string representations of the list elements.
   */
  public toJSON(): string[] {
    return this.elements.map(d => d.toJSON());
  }

  /**
   * Creates a new CLValue instance with a List value.
   * @param elementType - The CLType for the elements of the list.
   * @param elements - Optional array of CLValues to initialize the list with.
   * @returns A new CLValue instance containing CLTypeList and a CLValueList.
   */
  public static newCLList(
    elementType: CLType,
    elements: CLValue[] = []
  ): CLValue {
    const listType = new CLTypeList(elementType);
    const clValue = new CLValue(listType);
    clValue.list = new CLValueList(listType, elements);
    return clValue;
  }

  /**
   * Creates a CLValueList instance from a Uint8Array.
   * Parses the byte array to interpret the length of the list and each element in the list.
   * @param source - The Uint8Array containing the byte representation of the List value.
   * @param clType - The CLTypeList representing the type of the list.
   * @returns An object containing the new CLValueList instance and any remaining bytes.
   */
  public static fromBytes(
    source: Uint8Array,
    clType: CLTypeList
  ): IResultWithBytes<CLValueList> {
    const { result: u32, bytes: u32Bytes } = CLValueUInt32.fromBytes(source);
    const size = u32.toNumber();
    let remainder = u32Bytes;
    const elements: CLValue[] = [];

    for (let i = 0; i < size; i++) {
      if (remainder.length) {
        const {
          result: inner,
          bytes: innerBytes
        } = CLValueParser.fromBytesByType(remainder, clType.elementsType);

        if (!inner) {
          continue;
        }

        elements.push(inner);
        remainder = innerBytes;
      }
    }

    if (elements.length === 0) {
      return { result: new CLValueList(clType, []), bytes: remainder };
    }

    return { result: new CLValueList(clType, elements), bytes: remainder };
  }
}
