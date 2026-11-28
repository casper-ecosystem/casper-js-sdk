import { expect } from 'vitest';

import { BidAddr, BidAddrTag, Key, KeyTypeID } from '../../../types';

describe('BidAddr', () => {
  it('should correctly create a new key for validator BidAddr', () => {
    const validatorBidAddrKeyStr =
      'bid-addr-012f3fb80d362ad0a922f446915a259c9aaec9ba99292b3e50ff2359c458007309';
    const key = Key.newKey(validatorBidAddrKeyStr);

    expect(key.toPrefixedString()).to.equal(validatorBidAddrKeyStr);
    expect(key.bidAddr?.getTag()).to.equal(BidAddrTag.ValidatorTag);
    expect(key.bidAddr?.validator).not.to.be.undefined;
  });

  it('should correctly create a new key for unified BidAddr', () => {
    const unifiedBidAddrKeyStr =
      'bid-addr-002f3fb80d362ad0a922f446915a259c9aaec9ba99292b3e50ff2359c458007309';
    const key = Key.newKey(unifiedBidAddrKeyStr);

    expect(key.toPrefixedString()).to.equal(unifiedBidAddrKeyStr);
    expect(key.bidAddr?.getTag()).to.equal(BidAddrTag.UnifiedTag);
    expect(key.bidAddr?.unified).not.to.be.undefined;
  });

  it('should correctly create a new key for delegator BidAddr', () => {
    const delegatorBidAddrKeyStr =
      'bid-addr-022f3fb80d362ad0a922f446915a259c9aaec9ba99292b3e50ff2359c4580073099fa1fc0808d3a5b9ea9f3af4ca7c8c3655568fdf378d8afdf8a7e56e58abbfd4';
    const key = Key.newKey(delegatorBidAddrKeyStr);

    expect(key.toPrefixedString()).to.equal(delegatorBidAddrKeyStr);
    expect(key.bidAddr?.getTag()).to.equal(BidAddrTag.DelegatedAccountTag);
    expect(key.bidAddr?.delegatorAccount).not.to.be.undefined;
    expect(key.bidAddr?.validator).not.to.be.undefined;
    expect(key.bidAddr?.delegatorAccount?.toHex()).to.deep.equal(
      '9fa1fc0808d3a5b9ea9f3af4ca7c8c3655568fdf378d8afdf8a7e56e58abbfd4'
    );
    expect(key.bidAddr?.validator?.toHex()).to.deep.equal(
      '2f3fb80d362ad0a922f446915a259c9aaec9ba99292b3e50ff2359c458007309'
    );
  });

  it('should correctly create a new key for credit BidAddr', () => {
    const creditBidAddrKeyStr =
      'bid-addr-04520037cd249ccbcfeb0b9feae07d8d4f7d922cf88adc4f3e8691f9d34ccc8d097f00000000000000';
    const key = Key.newKey(creditBidAddrKeyStr);

    expect(key.toPrefixedString()).to.equal(creditBidAddrKeyStr);
    expect(key.bidAddr?.getTag()).to.equal(BidAddrTag.CreditTag);
    expect(key.bidAddr?.validator).not.to.be.undefined;
    expect(key.bidAddr?.eraId).not.to.be.undefined;
    expect(key.bidAddr?.eraId).to.deep.equal(127);
    expect(key.bidAddr?.validator?.toHex()).to.deep.equal(
      '520037cd249ccbcfeb0b9feae07d8d4f7d922cf88adc4f3e8691f9d34ccc8d09'
    );
  });

  it('should correctly create a new key for delegatorPurse BidAddr', () => {
    const delegatorPurseKeyStr =
      'bid-addr-03da3cd8cc4c8f34e7731583e67ddc211ff9b5c3f2c52640582415c2cce9315b2a8af7b77811970792f98b806779dfc0d1a9fef5bad205c6be8bb884210d7d323c';
    const key = Key.newKey(delegatorPurseKeyStr);

    expect(key.toPrefixedString()).to.equal(delegatorPurseKeyStr);
    expect(key.bidAddr?.getTag()).to.equal(BidAddrTag.DelegatedPurseTag);
    expect(key.bidAddr?.validator).not.to.be.undefined;
    expect(key.bidAddr?.delegatorPurseAddress).not.to.be.undefined;
    expect(key.bidAddr?.validator?.toHex()).to.deep.equal(
      'da3cd8cc4c8f34e7731583e67ddc211ff9b5c3f2c52640582415c2cce9315b2a'
    );
    expect(key.bidAddr?.delegatorPurseAddress).to.deep.equal(
      '8af7b77811970792f98b806779dfc0d1a9fef5bad205c6be8bb884210d7d323c'
    );
  });

  it('should correctly create a new key for unbondPurse BidAddr', () => {
    const unbondPurseKeyStr =
      'bid-addr-08da3cd8cc4c8f34e7731583e67ddc211ff9b5c3f2c52640582415c2cce9315b2a8af7b77811970792f98b806779dfc0d1a9fef5bad205c6be8bb884210d7d323c';
    const key = Key.newKey(unbondPurseKeyStr);

    expect(key.toPrefixedString()).to.equal(unbondPurseKeyStr);
    expect(key.bidAddr?.getTag()).to.equal(BidAddrTag.UnbondPurseTag);
    expect(key.bidAddr?.validator).not.to.be.undefined;
    expect(key.bidAddr?.delegatorPurseAddress).not.to.be.undefined;
    expect(key.bidAddr?.validator?.toHex()).to.deep.equal(
      'da3cd8cc4c8f34e7731583e67ddc211ff9b5c3f2c52640582415c2cce9315b2a'
    );
    expect(key.bidAddr?.delegatorPurseAddress).to.deep.equal(
      '8af7b77811970792f98b806779dfc0d1a9fef5bad205c6be8bb884210d7d323c'
    );
  });

  it('should correctly create a new key for validator rev BidAddr', () => {
    const validatorRevBidAddrKeyStr =
      'bid-addr-092f3fb80d362ad0a922f446915a259c9aaec9ba99292b3e50ff2359c458007309';
    const key = Key.newKey(validatorRevBidAddrKeyStr);

    expect(key.toPrefixedString()).to.equal(validatorRevBidAddrKeyStr);
    expect(key.bidAddr?.getTag()).to.equal(BidAddrTag.ValidatorRevTag);
    expect(key.bidAddr?.validator).not.to.be.undefined;
    expect(key.bidAddr?.validator?.toHex()).to.equal(
      '2f3fb80d362ad0a922f446915a259c9aaec9ba99292b3e50ff2359c458007309'
    );
    expect(`account-hash-${key.bidAddr?.validator?.toHex()}`).to.equal(
      'account-hash-2f3fb80d362ad0a922f446915a259c9aaec9ba99292b3e50ff2359c458007309'
    );
  });

  describe('credit era', () => {
    const validatorHex =
      '520037cd249ccbcfeb0b9feae07d8d4f7d922cf88adc4f3e8691f9d34ccc8d09';
    const creditStr = (eraHex: string) => `bid-addr-04${validatorHex}${eraHex}`;

    it('round-trips an era above 2^32 through the string form', () => {
      // 2^32 + 5 as a little-endian u64
      const str = creditStr('0500000001000000');
      const key = Key.newKey(str);

      expect(key.bidAddr?.eraId).to.equal(2 ** 32 + 5);
      expect(key.toPrefixedString()).to.equal(str);
    });

    it('round-trips era 0 through bytes', () => {
      const key = Key.newKey(creditStr('0000000000000000'));

      const { result } = Key.fromBytes(key.bytes());
      expect(result.bidAddr?.eraId).to.equal(0);
      expect(result.toPrefixedString()).to.equal(key.toPrefixedString());
    });

    it('BidAddr.fromBytes() consumes the 8 era bytes', () => {
      const bytes = Key.newKey(creditStr('7f00000000000000')).bytes();
      expect(bytes[0]).to.equal(KeyTypeID.BidAddr);

      const withExtra = new Uint8Array([...bytes.subarray(1), 0xff]);
      const { result, bytes: remainder } = BidAddr.fromBytes(withExtra);
      expect(result.eraId).to.equal(127);
      expect(Array.from(remainder)).to.deep.equal([0xff]);
    });
  });
});
