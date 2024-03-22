import * as bip39 from '@scure/bip39';
import { wordlist as engWordlist } from '@scure/bip39/wordlists/english';

import { SignatureAlgorithm } from '../types';

let wordlist = engWordlist;

export abstract class CasperHDKey<AsymmetricKey> {
  // Registered at https://github.com/satoshilabs/slips/blob/master/slip-0044.md
  static readonly bip44Index = 506;

  // TODO: Check if seed can be public
  constructor(
    public seed: Uint8Array,
    public signatureAlgorithm: SignatureAlgorithm
  ) {}

  // see https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki#path-levels
  static bip44Path(index: number): string {
    return [
      'm',
      `44'`, // bip 44
      `${CasperHDKey.bip44Index}'`, // coin index
      `0'`, // wallet
      `0`, // external
      `${index}` // child account index
    ].join('/');
  }

  /**
   * Returns mnemonic which can be used to construct HD wallet.
   * @param wordLength mnemonic word length, default 12, possible lengths 12 or 24
   * @returns mnemonic word array
   */
  public static newMnemonic(wordLength = 12): string {
    const validWordLengths = [12, 24];
    if (!validWordLengths.includes(wordLength)) {
      throw new Error('Invalid word length');
    }
    const strength = wordLength === 12 ? 128 : 256;
    return bip39.generateMnemonic(CasperHDKey.getWordlist(), strength);
  }

  /**
   * Validate the mnemonic word array
   * @param mnemonic word array
   * @returns `true` if the word array is correct mnemonic, otherwise `false`
   */
  public static validateMnemonic(mnemonic: string): boolean {
    return bip39.validateMnemonic(mnemonic, CasperHDKey.getWordlist());
  }

  /**
   * Convert mnemonic to relevant `Uint8Array`
   * @param mnemonic word array
   * @returns relevant `Uint8Array`
   */
  public static mnemonicToSeed(
    mnemonic: string,
    passphrase?: string
  ): Uint8Array {
    return bip39.mnemonicToSeedSync(mnemonic, passphrase);
  }

  /**
   * Returns randomly generated `Uint8Array` which can be used to construct HD wallet.
   * @returns
   */
  public static newSeed(): Uint8Array {
    return CasperHDKey.mnemonicToSeed(CasperHDKey.newMnemonic());
  }

  /**
   * Set provided word list as default word list
   * @param list
   */
  public static setWordlist(list: string[]) {
    wordlist = list;
  }

  /**
   * Returns word list
   * @default english word list
   * @returns word list
   */
  public static getWordlist(): string[] {
    return wordlist;
  }

  /**
   * Returns english word list
   * @returns word list
   */
  public static getDefaultWordlist(): string[] {
    return engWordlist;
  }

  /**
   * Derive the child key based on BIP44
   * @param index index of the child
   */
  public deriveChild(index: number): AsymmetricKey {
    return this.derive(CasperHDKey.bip44Path(index));
  }

  /**
   * Derive the child key from the path
   * @param path path to derive
   */
  abstract derive(path: string): AsymmetricKey;

  /**
   * Generate the signature for the message by using the key
   * @param msg The message to sign
   */
  abstract sign(msg: Uint8Array): Uint8Array;

  /**
   * Verify the signature
   * @param signature the signature generated for the msg
   * @param msg the raw message
   */
  abstract verify(signature: Uint8Array, msg: Uint8Array): boolean;

  /**
   * Returns public key of the default HD wallet
   */
  abstract publicKey(): Uint8Array;

  /**
   * Returns private key of the default HD wallet
   */
  abstract privateKey(): Uint8Array;
}
