import { jsonObject } from 'typedjson';
import { CLType } from './CLType';
import { CLTypeParser } from './Parser';
import { toError } from '../../../utils/errors';

/**
 * Represents a raw CLType message that can be parsed into a `CLType` instance.
 * This class utilizes `typedjson` decorators for JSON serialization and deserialization.
 */
@jsonObject
export class CLTypeRaw {
  /**
   * The raw message string representation of a CLType.
   */
  private rawMessage: CLType;

  /**
   * Initializes a new instance of the CLTypeRaw class.
   * @param rawMessage - A string representing the raw CLType message.
   */
  constructor(rawMessage: CLType) {
    this.rawMessage = rawMessage;
  }

  /**
   * Parses the raw message into a `CLType` object.
   * @returns A `CLType` instance if parsing is successful.
   * @throws Error if parsing fails, with a descriptive error message.
   */
  static parseCLType(json: any): CLType | Error {
    try {
      return CLTypeParser.fromRawJson(json);
    } catch (error) {
      throw new Error(`Error parsing CLType: ${toError(error).message}`, {
        cause: error
      });
    }
  }

  /**
   * Parses the raw message into a `CLType` object.
   * @returns A `CLType` instance if parsing is successful.
   * @throws Error if parsing fails, with a descriptive error message.
   */
  toJSON(): any {
    return this.rawMessage?.toString() || this?.rawMessage?.toJSON();
  }
}
