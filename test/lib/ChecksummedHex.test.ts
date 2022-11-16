import { assert } from 'chai';
import { decodeBase16 } from '../../src';
import { encode, decode, isSamecase, SMALL_BYTES_COUNT } from '../../src/lib/ChecksummedHex';

describe('ChecksumedHex', () => {
  it('should_decode_empty_input', () => {
    const empty = "";
    assert.isTrue(decode(empty))
  });

  it('string_is_same_case_true_when_same_case', () => {
    let input = "aaaaaaaaaaa";
    assert.isTrue(isSamecase(input));

    input = "AAAAAAAAAAA";
    assert.isTrue(isSamecase(input));
  });

  it('string_is_same_case_false_when_mixed_case', () => {
    let input = "aAaAaAaAaAa";
    assert.isFalse(isSamecase(input));
  });

  xit('string_is_same_case_no_alphabetic_chars_in_string', () => {
    let input = "424242424242";
    assert.isTrue(isSamecase(input));
  });

  it('should_checksum_decode_only_if_small', () => {
    const input = new Uint8Array(SMALL_BYTES_COUNT).fill(255);

    const smallEncode = encode(input);


    const key = decodeBase16("A1a2");
    const ee = encode(key);
    console.log("heeelo", ee, key, decodeBase16(ee))

    assert.isTrue(decode(smallEncode));
    assert.isFalse(decode("A1a2"));


    const largeEncoded = "A1" + smallEncode;
    assert.isTrue(decode(largeEncoded));
  });
})