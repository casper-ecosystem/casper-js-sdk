import { expect } from 'chai';
import 'mocha';
import { decodeBase64 } from 'tweetnacl-ts';
import * as nacl from 'tweetnacl-ts';
import { byteHash } from '../../src/lib/Contracts';
import { Ed25519 } from '../../src/lib/Keys';

describe('byteHash', () => {
  it('should compute the same hash as Scala', () => {
    const inputBase64 =
      'CiD3h4YVBZm1ChNTR29eLxLNE8IU5RIJZ0HEjn7GNjmvVhABGOO9g5q8LSpA4X7mRaRWddGbdOmIM9Fm9p0QxFKvVBscD5dmu1YdPK29ufR/ZmI0oseKM6l5RVKIUO3hh5en5prtkrrCzl3sdw==';
    const input = decodeBase64(inputBase64);
    const hash = byteHash(input);
    const hashHex = Buffer.from(hash).toString('hex');
    const expectedHex =
      'e0c7d8fbcbfd7eb5231b779cb4d7dcbcc3d60846e5a198a2c66bb1d3aafbd9a7';
    expect(hashHex).to.equal(expectedHex);
    expect(hash.length).to.equal(32);
  });
});

describe('sign', () => {
  it('should compute the same signature as Scala', () => {
    // Input is a deploy hash.
    const inputBase16 =
      '20bb4422795c2c61285b230a5b185339caa6c1d143092b5041cd0f96e8bf062c';
    const input = Buffer.from(inputBase16, 'hex');
    const publicKeyBase64 =
      'MCowBQYDK2VwAyEALnsOUzZT5+6UvOo2fEXyOr993f+Zjj1aFe2BBeR78Dc=';
    const privateKeyBase64 =
      'MC4CAQAwBQYDK2VwBCIEIEIcqHCVzuejJfD9wCoGVOLc3YFNUa9dcsy+mv5j2sar';
    const publicKey = decodeBase64(publicKeyBase64);
    const privateKey = decodeBase64(privateKeyBase64);
    const keyPair = Ed25519.parseKeyPair(publicKey, privateKey);

    const signature = nacl.sign_detached(input, keyPair.privateKey);

    const signatureHex = Buffer.from(signature).toString('hex');
    const expectedHex =
      '1babb50ad05f179985295654e2f1b31ef0b15637efbca7cc8b6601158e67811bc1aa0e4ee30271a6e68ec658495f2f2360b67bea733baec97e63b960efe9b00c';
    expect(signature.length).to.equal(64);
    expect(signatureHex).to.equal(expectedHex);
  });
});
