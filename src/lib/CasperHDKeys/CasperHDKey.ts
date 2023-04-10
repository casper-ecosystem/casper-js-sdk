import * as bip39 from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';

import { SignatureAlgorithm } from '../types';

export abstract class CasperHDKey<AsymmetricKey> {
  // Registered at https://github.com/satoshilabs/slips/blob/master/slip-0044.md
  static readonly bip44Index = 506;

  readonly depth: number = 0;
  readonly index: number = 0;

  constructor(
    private seed: Uint8Array,
    private signatureAlorithm: SignatureAlgorithm
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

  public static newMenmonic(): string {
    return bip39.generateMnemonic(CasperHDKey.getWordlist());
  }

  public static validateMnemonic(mnemonic: string): boolean {
    return bip39.validateMnemonic(mnemonic, CasperHDKey.getWordlist());
  }

  public static mnemonicToSeed(mnemonic: string): Uint8Array {
    return bip39.mnemonicToEntropy(mnemonic, CasperHDKey.getWordlist());
  }

  public static newSeed(): Uint8Array {
    return CasperHDKey.mnemonicToSeed(CasperHDKey.newMenmonic());
  }

  public static getWordlist(): string[] {
    return wordlist;
  }

  public get signatureAlgorithm(): SignatureAlgorithm {
    return this.signatureAlorithm;
  }

  public get mnemonic(): string {
    return bip39.entropyToMnemonic(this.seed, CasperHDKey.getWordlist());
  }

  public deriveChild(index: number): AsymmetricKey {
    return this.derive(CasperHDKey.bip44Path(index));
  }

  abstract derive(path: string): AsymmetricKey;

  abstract sign(hash: Uint8Array): Uint8Array;

  abstract verify(hash: Uint8Array, signature: Uint8Array): boolean;

  abstract publicKey(): Uint8Array;

  abstract privateKey(): Uint8Array;
}
