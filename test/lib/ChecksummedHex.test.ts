import chai from 'chai';

import {
  encode,
  isChecksummed,
  isSamecase,
  SMALL_BYTES_COUNT
} from '../../src/lib/ChecksummedHex';

chai.should();

const { assert } = chai;

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
    const validInputs = [
      '015b2DDD0B43c9616fA0d67b761fc8B52193dbd8D1a4093e0821815FdCAF5584A3',
      '01A3542DA88C8513Aea69d48a49aB0278F3b3093267013FD05362C4356D581a68A',
      '015A3a2815C96D563ff79a706695619A710C1A4f7770bFe3A8cdB84936b4200cfA',
      '01df0fd704DcA46CD41517b4ebA4BdD97019f80162D4bC6256c4202d8fD2a00F9F',
      '019E130bF86201a701cB0DAb4Aae1D6E558781d6fB6195Fc291685777A36cdb388',
      '010d900Aa8E9b7768ef5CA1526480589dd82707AFecAcd7e6cc8D0D042Ed6B5A63',
      '01F7209585154305700A322075959f38b6d21b5cC1Ae6D5499Cc087C551b93cA39',
      '0191a7B0522614A7a7d4F8bdBC7322854fD8eA40486b46cF63f24809c5527CbB79',
      '0192AD4bD76A88605Df58EB9ACEE5386c8a5D61A7eAFA02Ec3CcC3Ca4Cbf040197',
      '019C33470EDdc96ad2d102c61B61F535934c0257630Df6aBf11B08500F9DEBEA20',
      '02025369bf375252E40660B18Cb49E8d34435214e5282803a4BFD33B1EA3c2F7Aa55',
      '02038c7684F0B00ABE966bb6c013811616d26106D918bC9Ac84826804fE6d32e7776',
      '02025853315DB0e4757cC616bfA97800e2FEa61b7cE37D4376D1719148cd0EA5Fc1C',
      '02039A0e21273eD5Aa98f88D6c3DD5648B18F62dcd81e74C9bee35Ba56198DA7FbB6',
      '0202072401Ed62190C59AE71A1CE41631CfA0A6ea07DDB5Bfb52F94Ea64b3C3D14f4',
      '02036954A73A6788B254AeB19983b0cD3457BFfc151A1EeB9c61B3CbC965f966E96C',
      '0202d144A0cfc60A34aebb6179d74ca8801A9BbDC7767a73B747f030aAf69135330A',
      '020310Ae2b7191bA40b97e0531CE84554345782beE5Fd4574870359AfB9EE7eB871E',
      '0203d7F45A5a34dD5b0131afae10aF69A9D1aF16FA2BcC35fD76d0402A1d2fFF461f',
      '0202848e3889e6F6806d2e163BbEaFC2818C9F1d8984660A2e135e2BcD72fA9c2c4B'
    ];

    validInputs.map(isChecksummed).should.not.include(false);
    const invalidInputs = validInputs.map(i => i.toLowerCase());
    invalidInputs.map(isChecksummed).should.not.include(true);
  });
});
