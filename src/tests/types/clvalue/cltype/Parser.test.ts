import { expect } from 'vitest';

import { CLTypeParser, Conversions, CLTypeByteArray, TypeID } from '../../../../types';

describe('CLType Parser', () => {
  it('should match bytes to CLTypeByteArray', async () => {
    const bytesHex = '0f20000000';

    const parsedCLValue = CLTypeParser.matchBytesToCLType(Conversions.decodeBase16(bytesHex));

    expect(parsedCLValue.result).to.be.instanceOf(CLTypeByteArray);
    expect(parsedCLValue.result.getTypeID()).to.be.equal(TypeID.ByteArray);
    expect((parsedCLValue.result as unknown as CLTypeByteArray).getSize()).to.be.equal(32);
  });
});
