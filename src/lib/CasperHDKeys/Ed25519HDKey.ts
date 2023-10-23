import { HDKey } from './hdkey';
import { CasperHDKey } from './CasperHDKey';
import { Ed25519, SignatureAlgorithm } from '../Keys';

/**
 * Casper HD Key for Ed25519.
 *
 * Examples
 * ```ts
 *  const mn = Ed25519HDKey.newMnemonic();
 *  const hdKey = Ed25519HDKey.fromMnemonic(mn);
 *  const key0 = hdKey.deriveChild(0);
 * ```
 */
export class Ed25519HDKey extends CasperHDKey<Ed25519> {
  private hdKey: HDKey;

  constructor(seed: Uint8Array) {
    super(seed, SignatureAlgorithm.Ed25519);
    this.hdKey = HDKey.fromMasterSeed(seed);
  }

  public static new() {
    return new Ed25519HDKey(Ed25519HDKey.newSeed());
  }

  public static fromMnemonic(mnemonic: string) {
    return new Ed25519HDKey(Ed25519HDKey.mnemonicToSeed(mnemonic));
  }

  publicKey(): Uint8Array {
    return this.hdKey.publicKey;
  }

  privateKey(): Uint8Array {
    return this.hdKey.privateKey;
  }

  derive(path: string, forceHardened = true) {
    const newHdKey = this.hdKey.derive(path, forceHardened);

    return new Ed25519({
      publicKey: newHdKey.publicKeyRaw,
      secretKey: newHdKey.privateKey
    });
  }

  sign(hash: Uint8Array): Uint8Array {
    return this.hdKey.sign(hash);
  }

  verify(signature: Uint8Array, msg: Uint8Array): boolean {
    return this.hdKey.verify(msg, signature);
  }
}
