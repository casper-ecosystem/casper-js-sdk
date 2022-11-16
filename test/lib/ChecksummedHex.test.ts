import { assert } from 'chai';
import {
  encode,
  isChecksummed,
  isSamecase,
  SMALL_BYTES_COUNT
} from '../../src/lib/ChecksummedHex';

describe('ChecksumedHex', () => {
  it('should decode empty input', () => {
    const empty = '';
    assert.isTrue(isChecksummed(empty));
  });

  it('string is same case true when same case', () => {
    let input = 'aaaaaaaaaaa';
    assert.isTrue(isSamecase(input));

    input = 'AAAAAAAAAAA';
    assert.isTrue(isSamecase(input));
  });

  it('string is same case false when mixed case', () => {
    const input = 'aAaAaAaAaAa';
    assert.isFalse(isSamecase(input));
  });

  it('should checksum decode only if small', () => {
    const input = new Uint8Array(SMALL_BYTES_COUNT).fill(255);

    const smallEncoded = encode(input);

    assert.isTrue(isChecksummed(smallEncoded));
    assert.isFalse(isChecksummed('A1a2'));

    const largeEncoded = 'A1' + smallEncoded;
    assert.isTrue(isChecksummed(largeEncoded));
  });

  it('should verify on valid and invalid hex strings', () => {
    const validInput =
      '01b35a345E031FBCFBcF017f70476249aFE7FBB07aB84a774601010213d121a37D';

    assert.isTrue(isChecksummed(validInput));

    const invalidInput =
      '01b35a345E031FBCFBcF017f70476249aFE7FBB07aB84a774601010213d121a37d';
    assert.isFalse(isChecksummed(invalidInput));
  });
});
