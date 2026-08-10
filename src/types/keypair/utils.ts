import { Conversions } from '../Conversions';

/**
 * Reads in a base64 private key, ignoring the header: `-----BEGIN PUBLIC KEY-----`
 * and footer: `-----END PUBLIC KEY-----`
 * @param {string} content A .pem private key string with a header and footer
 * @returns A base64 private key as a `Uint8Array`
 * @remarks
 * If the provided base64 `content` string does not include a header/footer,
 * it will pass through this function unaffected
 * @example
 * Example PEM:
 *
 * ```
 * -----BEGIN PUBLIC KEY-----\r\n
 * MFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEj1fgdbpNbt06EY/8C+wbBXq6VvG+vCVD\r\n
 * Nl74LvVAmXfpdzCWFKbdrnIlX3EFDxkd9qpk35F/kLcqV3rDn/u3dg==\r\n
 * -----END PUBLIC KEY-----\r\n
 * ```
 */
export function readBase64WithPEM(content: string): Uint8Array {
  const base64 = content
    // there are two kinks of line-endings, CRLF(\r\n) and LF(\n)
    // we need handle both
    .split(/\r?\n/)
    .filter(x => !x.startsWith('---'))
    .join('')
    // remove the line-endings in the end of content
    .trim();
  return Conversions.decodeBase64(base64);
}

/**
 * Parses and validates a key in a certain range "from" to "to"
 * @param {Uint8Array} bytes The key to be parsed and validated
 * @param {number} from The starting index from which to parse the key
 * @param {number} to The ending index from which to parse the key
 * @returns The parsed key
 * @throws `Error` if the key is of an unexpected length
 */
// The return type is declared rather than inferred: the branches yield a mix
// of `Uint8Array` and `Buffer`, and letting TypeScript print that union into
// the emitted `.d.ts` puts `Buffer` — and with it a hard `@types/node`
// requirement — into the published surface.
export const parseKey = (
  bytes: Uint8Array,
  from: number,
  to: number
): Uint8Array => {
  const len = bytes.length;

  const key =
    len === 32
      ? bytes
      : len === 64
        ? Buffer.from(bytes).slice(from, to)
        : len > 32 && len < 64
          ? Buffer.from(bytes).slice(len % 32)
          : null;
  if (key == null || key.length !== 32) {
    throw Error(`Unexpected key length: ${len}`);
  }
  return key;
};
