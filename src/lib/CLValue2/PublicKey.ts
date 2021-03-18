import { CLType, CLValue } from './Abstract';
import { decodeBase16, encodeBase16 } from '../Conversions';
import { byteHash } from '../Contracts';

// TODO: Tidy up almost the same enum in 
// { SignatureAlgorithm } '../Keys';
export enum PublicKeyTag {
  ED25519 = 1,
  SECP256K1 = 2
}

export class PublicKeyType extends CLType {
  toString(): string {
    return 'URef';
  }
}

export class PublicKey extends CLValue {
  v: Uint8Array;
  private tag: PublicKeyTag;

  constructor(rawPublicKey: Uint8Array, tag: PublicKeyTag) {
    super();
    if (Object.values(PublicKeyTag).includes(tag)) {
      this.v = rawPublicKey;
      this.tag = tag;
    } else {
      throw new Error('Unsupported type of public key');
    }
  }

  clType(): CLType {
    return new PublicKeyType();
  }

  toAccountHex(): string {
    return `0${this.tag}${encodeBase16(this.v)}`;
  }

  isEd25519(): boolean {
    return this.tag === PublicKeyTag.ED25519;
  }

  isSecp256K1(): boolean {
    return this.tag === PublicKeyTag.SECP256K1;
  }

  toAccountHash(): Uint8Array {
    const algorithmIdentifier = PublicKeyTag[this.tag];
    const separator = Buffer.from([0]);
    const prefix = Buffer.concat([
      Buffer.from(algorithmIdentifier.toLowerCase()),
      separator
    ]);

    if (this.v.length === 0) {
      return Buffer.from([]);
    } else {
      return byteHash(Buffer.concat([prefix, Buffer.from(this.v)]));
    }
  }

  value(): Uint8Array {
    return this.v;
  }

  static fromEd25519(publicKey: Uint8Array): PublicKey {
    return new PublicKey(publicKey, PublicKeyTag.ED25519);
  }

  static fromSecp256K1(publicKey: Uint8Array): PublicKey {
    return new PublicKey(publicKey, PublicKeyTag.SECP256K1);
  }

  /**
   * Tries to decode PublicKey from its hex-representation.
   * The hex format should be as produced by PublicKey.toAccountHex
   * @param publicKeyHex
   */
  static fromHex(publicKeyHex: string): PublicKey {
    if (publicKeyHex.length < 2) {
      throw new Error('Asymmetric key error: too short');
    }
    const publicKeyHexBytes = decodeBase16(publicKeyHex);

    // TODO: Test it!
    return new PublicKey(publicKeyHexBytes.subarray(1), publicKeyHexBytes[0]);
  }

}
