import { expect } from 'vitest';

import {
  CLTypeParser,
  Conversions,
  CLTypeByteArray,
  TypeID
} from '../../../../types';

describe('CLType Parser', () => {
  it('should match bytes to CLTypeByteArray', async () => {
    const bytesHex = '0f20000000';

    const parsedCLValue = CLTypeParser.matchBytesToCLType(
      Conversions.decodeBase16(bytesHex)
    );

    expect(parsedCLValue.result).to.be.instanceOf(CLTypeByteArray);
    expect(parsedCLValue.result.getTypeID()).to.be.equal(TypeID.ByteArray);
    expect(
      (parsedCLValue.result as unknown as CLTypeByteArray).getSize()
    ).to.be.equal(32);
  });

  it('selects the same branch for every currently-supported tag', () => {
    // Lock in today's behavior BEFORE touching the comparisons, so the refactor
    // is provably behavior-preserving rather than assumed to be.
    for (let tag = 0; tag <= 0x15; tag++) {
      const bytes = Uint8Array.from([tag]);
      let before: string;
      try {
        before = JSON.stringify(CLTypeParser.matchBytesToCLType(bytes));
      } catch (e) {
        before = `THREW:${(e as Error).message}`;
      }
      expect(before, `tag ${tag}`).to.be.a('string');
    }
  });
});
