import { jsonObject, jsonMember } from 'typedjson';
import { dehumanizerTTL, humanizerTTL } from './SerializationUtils';

/**
 * Represents a timestamp as a specific point in time (Date).
 */
@jsonObject
export class Timestamp {
  /**
   * The Date object representing the timestamp.
   */
  @jsonMember({ constructor: Date })
  date: Date;

  /**
   * Creates a new instance of `Timestamp` with the specified Date.
   *
   * @param date The `Date` object representing the timestamp.
   */
  constructor(date: Date) {
    this.date = date;
  }

  /**
   * Converts the timestamp to milliseconds (Unix timestamp).
   *
   * @returns The timestamp in milliseconds.
   */
  toMilliseconds(): number {
    return this.date.getTime();
  }

  /**
   * Converts the timestamp to a JSON string (ISO 8601 format).
   *
   * @returns A JSON string representing the timestamp.
   */
  toJSON(): string {
    return this.date.toISOString();
  }

  /**
   * Creates a `Timestamp` instance from a JSON string.
   *
   * @param data The JSON string representing the timestamp in ISO 8601 format.
   * @returns A `Timestamp` object.
   */
  static fromJSON(data: string): Timestamp {
    return new Timestamp(new Date(data));
  }

  /**
   * Returns the underlying `Date` object of the timestamp.
   *
   * @returns The `Date` object representing the timestamp.
   */
  toDate(): Date {
    return this.date;
  }
}

/**
 * Represents a duration, typically in milliseconds, with utility methods for parsing and formatting.
 */
@jsonObject
export class Duration {
  /**
   * The duration in milliseconds.
   */
  @jsonMember({ constructor: Number })
  duration: number;

  /**
   * Creates a new instance of `Duration` with the specified duration in milliseconds.
   *
   * @param duration The duration in milliseconds.
   */
  constructor(duration: number) {
    this.duration = duration;
  }

  /**
   * Converts the duration to a human-readable string.
   *
   * @returns A string representing the duration in a human-readable format (e.g., "1d 2h 3m 4s").
   */
  toJSON(): string {
    return humanizerTTL(this.duration);
  }

  /**
   * Creates a `Duration` instance from a human-readable string representing the duration.
   *
   * @param data The human-readable string representing the duration (e.g., "1d 2h 3m 4s").
   * @returns A `Duration` object.
   */
  static fromJSON(data: string): Duration {
    const duration = dehumanizerTTL(data);

    return new Duration(duration);
  }

  /**
   * Converts the duration to a string in the format `hh:mm:ss`.
   *
   * @returns A string representing the duration in `hh:mm:ss` format.
   */
  toDurationString(): string {
    return new Date(this.duration).toISOString().substring(11, 19);
  }

  /**
   * Parses a duration string (e.g., "1d 2h 3m") and converts it to milliseconds.
   *
   * @param durationStr The string representing the duration in a human-readable format.
   * @returns The duration in milliseconds.
   * @throws Error if the duration format is invalid.
   */
  static parseDurationString(durationStr: string): number {
    const parts = durationStr.match(/(\d+)([smhd])/g);
    if (!parts) throw new Error('Invalid duration format');

    let totalMs = 0;
    for (const part of parts) {
      const value = parseInt(part.slice(0, -1));
      const unit = part.slice(-1);
      switch (unit) {
        case 's':
          totalMs += value * 1000;
          break;
        case 'm':
          totalMs += value * 60000;
          break;
        case 'h':
          totalMs += value * 3600000;
          break;
        case 'd':
          totalMs += value * 86400000;
          break;
        default:
          // Unreachable: the regex above only ever yields s/m/h/d. An
          // unrecognized unit contributes nothing.
          break;
      }
    }
    return totalMs;
  }

  /**
   * Returns the duration in milliseconds.
   *
   * @returns The duration in milliseconds.
   */
  toMilliseconds(): number {
    return this.duration;
  }
}
