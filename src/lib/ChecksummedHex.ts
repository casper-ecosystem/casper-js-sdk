//! Checksummed hex encoding following an [EIP-55][1]-like scheme.
//!
//! [1]: https://eips.ethereum.org/EIPS/eip-55

//! Migrate from https://github.com/casper-network/casper-node/blob/9609a616439de334d89917a14240940615a49f81/types/src/checksummed_hex.rs

import { bits, byteHash, concatenate } from './ByteConverters';
import { decodeBase16 } from './Conversions';

// The number of input bytes, at or below which [`decode`] will checksum-decode the output.
export const SMALL_BYTES_COUNT = 75;

/**
 * Takes a slice of bytes and breaks it up into a vector of *nibbles* (ie, 4-bit values)
 * @param bytes
 * @returns double sized of Unit8Array
 */
const bytesToNibbles = (bytes: Uint8Array): Uint8Array => {
  let outputNibbles = new Uint8Array();
  bytes.forEach(byte => {
    outputNibbles = concatenate(
      outputNibbles,
      Uint8Array.of(byte >> 4, byte & 0x0f)
    );
  });
  return outputNibbles;
};

const bytesToBitsCycle = (bytes: Uint8Array) => {
  let output: boolean[] = [];
  bytes.forEach(byte => {
    output = output.concat(bits(byte, 8).map(bit => (bit & 0x01) === 0x01));
  });
  return output;
};

const HEX_CHARS = [
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F'
];

const isAlphabetic = (char: string) => /^[a-zA-Z()]+$/.test(char);

export const encode = (input: Uint8Array) => {
  const inputNibbles = bytesToNibbles(input);
  const hashBits = bytesToBitsCycle(byteHash(input));
  let hexOutputString = '';
  inputNibbles.forEach((nibble, i) => {
    const c = HEX_CHARS[nibble];
    const hashBit = hashBits[i] ?? true;
    if (isAlphabetic(c) && hashBit) {
      hexOutputString += c.toUpperCase();
    } else {
      hexOutputString += c.toLowerCase();
    }
  });
  return hexOutputString;
};

export const isSamecase = (value: string) => /^[a-z]+$|^[A-Z]+$/.test(value);

export const decode = (input: string): boolean => {
  const bytes = decodeBase16(input);

  // If the string was not small or not mixed case, don't verify the checksum.
  if (bytes.length > SMALL_BYTES_COUNT || isSamecase(input)) return true;

  return input === encode(bytes);
};
