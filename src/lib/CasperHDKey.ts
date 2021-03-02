import { HDKeyT } from 'ethereum-cryptography/pure/hdkey';
import { HDKey } from 'ethereum-cryptography/hdkey';
import { sha256 } from 'ethereum-cryptography/sha256';
import { Secp256K1 } from './Keys';

export class CasperHDKey {
  // todo select a lucky number and register in https://github.com/satoshilabs/slips/blob/master/slip-0044.md
  private readonly bip44Index = 748;

  constructor(private hdKey: HDKeyT) {}

  // see https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki#path-levels
  private bip44Path(index: number): string {
    return [
      'm',
      `44'`, // bip 44
      `${this.bip44Index}'`, // coin index
      `0'`, // wallet
      `0`, // external
      `${index}` // child account index
    ].join('/');
  }

  /**
   * Generate HDKey from master seed
   * @param seed
   */
  public static fromMasterSeed(seed: Uint8Array): CasperHDKey {
    return new CasperHDKey(HDKey.fromMasterSeed(Buffer.from(seed)));
  }

  public publicKey() {
    return this.hdKey.publicKey;
  }

  public privateKey() {
    return this.hdKey.privateKey;
  }

  public privateExtendedKey() {
    return this.hdKey.privateExtendedKey;
  }

  public publicExtendedKey() {
    return this.hdKey.publicExtendedKey;
  }

  /**
   * Derive the child key basing the path
   * @param path
   */
  public derive(path: string): Secp256K1 {
    const secpKeyPair = this.hdKey.derive(path);
    return new Secp256K1(
      new Uint8Array(secpKeyPair.publicKey!), 
      new Uint8Array(secpKeyPair.privateKey!)
    );
  }

  /**
   * Derive child key basing the bip44 protocol
   * @param index the index of child key
   */
  public deriveIndex(index: number): Secp256K1 {
    return this.derive(this.bip44Path(index));
  }

  /**
   * Generate the signature for the message by using the key
   * @param msg The message to sign
   */
  public sign(msg: Uint8Array) {
    return this.hdKey.sign(sha256(Buffer.from(msg)));
  }

  /**
   * Verify the signature
   * @param signature the signature generated for the msg
   * @param msg the raw message
   */
  public verify(signature: Uint8Array, msg: Uint8Array) {
    return this.hdKey.verify(sha256(Buffer.from(msg)), Buffer.from(signature));
  }

  /**
   * Get the JSON representation of the wallet
   */
  public toJSON() {
    return this.hdKey.toJSON();
  }
}
