import { expect } from 'chai';
import {
  CLPublicKey,
  CLPublicKeyType,
  CLPublicKeyTag,
  CLValueParsers
} from './index';
import { Keys } from '../index';
import { SignatureAlgorithm } from '../Keys';

// prettier-ignore
const rawEd25519Account = Uint8Array.from([
  154, 211, 137, 116, 146, 249, 164, 57,
  9,  35,  64, 255,  83, 105, 131, 86,
  169, 250, 100, 248,  12,  68, 201,  17,
  43,  62, 151,  55, 158,  87, 186, 148
]);

// prettier-ignore
const rawSecp256K1Account = Uint8Array.from([
  2, 159, 140, 124,  87,   6, 242, 206,
  197, 115, 224, 181, 184, 223, 197, 239,
  249, 252, 127, 235, 243, 153, 111, 242,
  225, 125,  76, 204,  37,  56,  70,  41,
  229
]);

const publicKeyEd25519 = new CLPublicKey(
  rawEd25519Account,
  CLPublicKeyTag.ED25519
);

const publicKeySecp256K1 = new CLPublicKey(
  rawSecp256K1Account,
  CLPublicKeyTag.SECP256K1
);

describe('CLPublicKey', () => {
  it('Valid by construction', () => {
    expect(publicKeyEd25519).to.be.an.instanceof(CLPublicKey);
    expect(publicKeySecp256K1).to.be.an.instanceof(CLPublicKey);
  });

  it('Invalid by construction', () => {
    const badFn = () => new CLPublicKey(rawEd25519Account, 4);
    expect(badFn).to.throw('Unsupported type of public key');
  });

  it('Proper clType() value', () => {
    expect(publicKeyEd25519.clType().toString()).to.be.eq('PublicKey');
  });

  it('CLPublicKey.fromhex() value', () => {
    const ed25519Account = Keys.Ed25519.new();
    const ed25519AccountHex = ed25519Account.accountHex();

    expect(CLPublicKey.fromHex(ed25519AccountHex).value()).to.deep.equal(
      ed25519Account.publicKey.value()
    );

    const secp256K1Account = Keys.Secp256K1.new();
    const secp256K1AccountHex = secp256K1Account.accountHex();

    expect(CLPublicKey.fromHex(secp256K1AccountHex).value()).to.deep.equal(
      secp256K1Account.publicKey.value()
    );

    const badFn = () => CLPublicKey.fromHex('1');
    expect(badFn).to.throw('Asymmetric key error: too short');

    // Check mixed case pubkeys
    const goodFn = () =>
      CLPublicKey.fromHex(
        '0115C9b40c06fF99B0cBadf1140B061B5dBF92103E66a6330fbCc7768f5219C1ce'
      );

    expect(goodFn).to.not.throw();
  });

  it('CLPublicKey.fromEd25519() return proper value', () => {
    const pub = CLPublicKey.fromEd25519(rawEd25519Account);
    expect(pub.value()).to.be.deep.eq(rawEd25519Account);
  });

  it('CLPublicKey.fromSecp256K1 return proper value', () => {
    const pub = CLPublicKey.fromSecp256K1(rawSecp256K1Account);
    expect(pub.value()).to.be.deep.eq(rawSecp256K1Account);
  });

  it('fromHex() should serializes to the same hex value by using toHex()', () => {
    const accountKey =
      '01f9235ff9c46c990e1e2eee0d531e488101fab48c05b75b8ea9983658e228f06b';

    const publicKey = CLPublicKey.fromHex(accountKey);
    const accountHex = publicKey.toHex();

    expect(accountHex).to.be.eq(accountKey);
    expect(publicKey.isEd25519()).to.be.eq(true);
  });

  it('toAccountHash() valid result', () => {
    const accountKey =
      '01f9235ff9c46c990e1e2eee0d531e488101fab48c05b75b8ea9983658e228f06b';

    const publicKey = CLPublicKey.fromHex(accountKey);
    const accountHash = publicKey.toAccountHash();
    // prettier-ignore
    const validResult = Uint8Array.from([
      145, 171, 120,   7, 189,  47, 216, 
      41, 215, 192, 156, 198,  81, 187,
      81, 206,  63, 183, 251, 252, 224,
      127,  79, 141, 250, 233, 141, 132,                    
      130, 235, 172,  98
    ]);

    expect(accountHash).to.be.deep.eq(validResult);
  });

  it('isEd25519() valid result', () => {
    expect(publicKeyEd25519.isEd25519()).to.be.eq(true);
    expect(publicKeyEd25519.isSecp256K1()).to.be.eq(false);
  });

  it('isSecp256K1() valid result', () => {
    expect(publicKeySecp256K1.isEd25519()).to.be.eq(false);
    expect(publicKeySecp256K1.isSecp256K1()).to.be.eq(true);
  });

  it('toBytes() / fromBytes()', () => {
    const bytes = Uint8Array.from(Array(32).fill(42));
    const publicKey = CLPublicKey.fromEd25519(bytes);
    const toBytes = CLValueParsers.toBytes(publicKey).unwrap();
    const validResult = Uint8Array.from([1, ...Array(32).fill(42)]);

    expect(toBytes).to.be.deep.eq(validResult);
    expect(
      CLValueParsers.fromBytes(toBytes, new CLPublicKeyType()).unwrap()
    ).to.be.deep.eq(publicKey);
  });

  it('toJSON() / fromJSON()', () => {
    const bytes = Uint8Array.from(Array(32).fill(42));
    const publicKey = CLPublicKey.fromEd25519(bytes);
    const json = CLValueParsers.toJSON(publicKey).unwrap();
    const expectedJson = JSON.parse(
      '{"bytes":"012a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a","cl_type":"PublicKey"}'
    );

    expect(json).to.be.deep.eq(expectedJson);
    expect(CLValueParsers.fromJSON(expectedJson).unwrap()).to.be.deep.eq(
      publicKey
    );
  });

  it('getTag() / getSignatureAlgorithm()', () => {
    const tag = publicKeyEd25519.getTag();
    const signatureAlgorithm = publicKeyEd25519.getSignatureAlgorithm();

    expect(tag).to.be.eq(CLPublicKeyTag.ED25519);
    expect(signatureAlgorithm).to.be.eq(SignatureAlgorithm.Ed25519);
  });
});
