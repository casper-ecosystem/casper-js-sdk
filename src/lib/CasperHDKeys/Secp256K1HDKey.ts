import { HDKey } from '@scure/bip32';
import { sha256 } from '@noble/hashes/sha256';
import { CasperHDKey } from './CasperHDKey';
import { Secp256K1, SignatureAlgorithm } from '../Keys';

/**
 * Casper HD Key for Secp256K1.
 *
 * Examples
 * ```ts
 *  const mn = Secp256K1HDKey.newMnemonic();
 *  const hdKey = Secp256K1HDKey.fromMnemonic(mn);
 *  const key0 = hdKey.deriveChild(0);
 * ```
 */
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

  public derive(path: string): Secp256K1 {
    const secpKeyPair = this.hdKey.derive(path);

    return new Secp256K1(
      new Uint8Array(secpKeyPair.publicKey!),
      new Uint8Array(secpKeyPair.privateKey!)
    );
  }

  public sign(msg: Uint8Array) {
    return this.hdKey.sign(sha256(Buffer.from(msg)));
  }

  public verify(signature: Uint8Array, msg: Uint8Array) {
    return this.hdKey.verify(sha256(Buffer.from(msg)), Buffer.from(signature));
  }
}
