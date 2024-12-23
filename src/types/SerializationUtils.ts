import { TypedJSON } from 'typedjson';
import humanizeDuration from 'humanize-duration';
import { Args } from './Args';
import { Conversions } from './Conversions';
import { CLValueUInt512 } from './clvalue';

/**
 * Serializes a `Uint8Array` into a hexadecimal string.
 *
 * @param bytes The `Uint8Array` to be serialized.
 * @returns A base-16 encoded string of the provided byte array.
 */
export const byteArrayJsonSerializer: (bytes: Uint8Array) => string = (
  bytes: Uint8Array
) => {
  return Conversions.encodeBase16(bytes);
};

/**
 * Serializes a `Uint8Array` into a hexadecimal string, but only if the value is not `undefined`.
 *
 * @param bytes The `Uint8Array` to be serialized (or `undefined`).
 * @returns A base-16 encoded string of the provided byte array, or `undefined` if input is `undefined`.
 *
 * @note It's suggested to swap the names of this function with `byteArrayJsonSerializer` for better clarity. This function handles `undefined` inputs, while `byteArrayJsonSerializer` should handle only `Uint8Array` directly.
 */
export const undefinedSafeByteArrayJsonSerializer: (
  bytes: Uint8Array | undefined
) => string | undefined = (bytes: Uint8Array | undefined) => {
  if (!bytes) {
    return undefined;
  }
  return Conversions.encodeBase16(bytes);
};

/**
 * Deserializes a hexadecimal string into a `Uint8Array`.
 *
 * @param str The base-16 encoded string to be deserialized.
 * @returns The decoded `Uint8Array` corresponding to the hexadecimal string.
 */
export const byteArrayJsonDeserializer: (str: string) => Uint8Array = (
  str: string
) => {
  return Conversions.decodeBase16(str);
};

/**
 * Deserializes a hexadecimal string into a `Uint8Array`, but only if the value is not `undefined`.
 *
 * @param str The base-16 encoded string to be deserialized (or `undefined`).
 * @returns The decoded `Uint8Array` corresponding to the hexadecimal string, or `undefined` if input is `undefined`.
 */
export const undefinedSafeByteArrayJsonDeserializer: (
  str: string | undefined
) => Uint8Array | undefined = (str: string | undefined) => {
  if (!str) {
    return undefined;
  }
  return Conversions.decodeBase16(str);
};

/**
 * A humanizer configuration for time durations in short English format (days, hours, minutes, seconds, milliseconds).
 */
const shortEnglishHumanizer = humanizeDuration.humanizer({
  spacer: '',
  serialComma: false,
  conjunction: ' ',
  delimiter: ' ',
  language: 'shortEn',
  languages: {
    // Mapping of duration units to shorter names
    shortEn: {
      d: () => 'day',
      h: () => 'h',
      m: () => 'm',
      s: () => 's',
      ms: () => 'ms'
    }
  }
});

/**
 * Returns a human-readable time duration for a given time-to-live (TTL) in milliseconds.
 *
 * @param ttl The TTL in milliseconds.
 * @returns A human-readable string representation of the TTL, such as "1d 2h 3m 4s".
 */
export const humanizerTTL = (ttl: number) => {
  return shortEnglishHumanizer(ttl);
};

/**
 * Converts a human-readable time duration (e.g., "1d 2h 3m 4s") back to a time-to-live (TTL) in milliseconds.
 *
 * @param ttl The human-readable string representing the time duration.
 * @returns The TTL in milliseconds.
 * @throws Error if an unsupported TTL unit is encountered.
 */
export const dehumanizerTTL = (ttl: string): number => {
  const dehumanizeUnit = (s: string): number => {
    if (s.includes('ms')) {
      return Number(s.replace('ms', ''));
    }
    if (s.includes('s') && !s.includes('m')) {
      return Number(s.replace('s', '')) * 1000;
    }
    if (s.includes('m') && !s.includes('s')) {
      return Number(s.replace('m', '')) * 60 * 1000;
    }
    if (s.includes('h')) {
      return Number(s.replace('h', '')) * 60 * 60 * 1000;
    }
    if (s.includes('day')) {
      return Number(s.replace('day', '')) * 24 * 60 * 60 * 1000;
    }
    throw Error('Unsupported TTL unit');
  };

  return ttl
    .split(' ')
    .map(dehumanizeUnit)
    .reduce((acc, val) => (acc += val));
};

/**
 * Deserializes an array of runtime arguments to a `RuntimeArgs` object.
 *
 * @param arr The array of serialized runtime arguments or a Named wrapper.
 * @returns A `RuntimeArgs` object containing the deserialized arguments.
 * @throws Error if the input format is invalid.
 */
export const deserializeArgs = (arr: any): Args | undefined => {
  const raSerializer = new TypedJSON(Args);

  if (arr.Named && Array.isArray(arr.Named)) {
    // If the arguments are wrapped in a "Named" property
    return raSerializer.parse({ args: arr.Named });
  }

  if (Array.isArray(arr)) {
    // If the input is directly an array of arguments
    return raSerializer.parse({ args: arr });
  }

  throw new Error('Invalid argument format for deserialization.');
};

/**
 * Serializes a `RuntimeArgs` object to a byte array or an object representation.
 *
 * This function converts the `RuntimeArgs` (or `Args`) object into a serialized format.
 * If `asNamed` is set to `true`, the serialized arguments are wrapped in a `Named` property
 * for more structured output. Otherwise, the plain array of serialized arguments is returned.
 *
 * @param ra - The `Args` object to be serialized. It contains the runtime arguments.
 * @param asNamed - A boolean flag indicating whether to wrap the serialized output in a `Named` property. Defaults to `false`.
 * @returns A serialized representation of the runtime arguments.
 * If `asNamed` is `true`, the output is an object with a `Named` property. Otherwise, it is a plain array.
 *
 */
export const serializeArgs = (ra: Args, asNamed = false) => {
  const raSerializer = new TypedJSON(Args);
  const json = raSerializer.toPlainJson(ra);
  const argsArray = Object.values(json as any)[0];

  if (asNamed) {
    return {
      Named: argsArray
    };
  }

  return argsArray;
};

/**
 * Deserializes an array of rewards into a Map.
 * @param arr - The array to be deserialized, where each element is a tuple containing a key and an array of rewards.
 * @returns A Map where each key corresponds to an array of CLValueUInt512 rewards.
 * @throws Will throw an error if duplicate keys are detected.
 */
export const deserializeRewards = (arr: any) => {
  const parsed = new Map(
    Array.from(arr, ([key, value]) => {
      const valuesArray = value.map((item: any) =>
        CLValueUInt512.fromJSON(item)
      );
      return [key, valuesArray];
    })
  );

  if (parsed.size !== Array.from(arr).length) {
    throw Error(`Duplicate key exists.`);
  }

  return parsed;
};

/**
 * Serializes a Map of rewards into an array format suitable for JSON storage.
 * @param map - A Map where each key corresponds to an array of CLValueUInt512 rewards.
 * @returns An array where each element is a tuple containing a key and an array of rewards in JSON format.
 */
export const serializeRewards = (map: Map<string, CLValueUInt512[]>) => {
  return Array.from(map, ([key, value]) => {
    const serializedValue = value.map(item => item.toJSON());
    return [key, serializedValue];
  });
};
