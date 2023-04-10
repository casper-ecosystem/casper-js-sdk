import { HDKey } from '@scure/bip32';
import { sha256 } from '@noble/hashes/sha256';
import { CasperHDKey } from './CasperHDKey';
import { Secp256K1, SignatureAlgorithm } from '../Keys';

export class Secp256K1HDKey extends CasperHDKey<Secp256K1> {
  private hdKey: HDKey;

  constructor(seed: Uint8Array) {
    super(seed, SignatureAlgorithm.Ed25519);
    this.hdKey = HDKey.fromMasterSeed(seed);
  }

  public static new() {
    return new Secp256K1HDKey(Secp256K1HDKey.newSeed());
  }

  public static fromMnemonic(mnemonic: string) {
    return new Secp256K1HDKey(Secp256K1HDKey.mnemonicToSeed(mnemonic));
  }

  public publicKey() {
    return this.hdKey.publicKey!;
  }

  public privateKey() {
    return this.hdKey.privateKey!;
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
    return this.derive(CasperHDKey.bip44Path(index));
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
