import { describe, it, expect } from 'vitest';
import { TypedJSON } from 'typedjson';

import { EraEnd, EraEndV1, EraEndV2 } from '../../types';
import { expectJsonRoundTrip } from '../roundtrip';

const validator1 =
  '01197f6b23e16c8532c6abc838facd5ea789be0c76b2920334039bfa8b3d368d61';
const validator2 =
  '01d829cbfb66b2b11ef8d8feb6d3f2155789fc22f407bb57f89b05f6ba4b9ae070';

describe('EraEnd', () => {
  describe('EraEndV1', () => {
    const eraEndV1Json = {
      era_report: {
        equivocators: [validator1],
        inactive_validators: [validator2],
        rewards: [{ validator: validator1, amount: '1000000000' }]
      },
      next_era_validator_weights: [
        { validator: validator1, weight: '500000000000' },
        { validator: validator2, weight: '250000000000' }
      ]
    };

    it('round-trips through JSON: toJSON(fromJSON(x)) deep-equals the fixture', () => {
      expectJsonRoundTrip(new TypedJSON(EraEndV1), eraEndV1Json);
    });

    it('converts into the unified EraEnd shape, folding per-validator rewards into a map', () => {
      const v1 = new TypedJSON(EraEndV1).parse(eraEndV1Json)!;
      const unified = EraEnd.fromV1(v1)!;

      expect(unified.nextEraGasPrice).to.equal(1);
      expect(unified.equivocators.map(pk => pk.toHex())).to.deep.equal([
        validator1
      ]);
      expect(unified.inactiveValidators.map(pk => pk.toHex())).to.deep.equal([
        validator2
      ]);
      expect(unified.nextEraValidatorWeights).to.have.lengthOf(2);

      const rewards = unified.rewards.get(validator1);
      expect(rewards).to.have.lengthOf(1);
      expect(rewards?.[0].toString()).to.equal('1000000000');
    });

    it('EraEnd.fromV1(null) returns null', () => {
      expect(EraEnd.fromV1(null)).to.be.null;
    });
  });

  describe('EraEndV2', () => {
    const eraEndV2Json = {
      equivocators: [validator1],
      inactive_validators: [validator2],
      next_era_validator_weights: [
        { validator: validator1, weight: '500000000000' }
      ],
      rewards: [[validator1, ['1000000000', '2000000000']]],
      next_era_gas_price: 2
    };

    it('round-trips through JSON: toJSON(fromJSON(x)) deep-equals the fixture', () => {
      expectJsonRoundTrip(new TypedJSON(EraEndV2), eraEndV2Json);
    });

    it('converts into the unified EraEnd shape unchanged', () => {
      const v2 = new TypedJSON(EraEndV2).parse(eraEndV2Json)!;
      const unified = EraEnd.fromV2(v2)!;

      expect(unified.nextEraGasPrice).to.equal(2);
      expect(unified.equivocators.map(pk => pk.toHex())).to.deep.equal([
        validator1
      ]);
      const rewards = unified.rewards.get(validator1);
      expect(rewards?.map(r => r.toString())).to.deep.equal([
        '1000000000',
        '2000000000'
      ]);
    });

    it('EraEnd.fromV2(null) returns null', () => {
      expect(EraEnd.fromV2(null)).to.be.null;
    });
  });

  describe('unified EraEnd', () => {
    it('round-trips through JSON: toJSON(fromJSON(x)) deep-equals the fixture', () => {
      const eraEndJson = {
        equivocators: [validator1],
        inactive_validators: [],
        next_era_validator_weights: [
          { validator: validator1, weight: '500000000000' }
        ],
        rewards: [[validator1, ['1000000000']]],
        next_era_gas_price: 1
      };

      expectJsonRoundTrip(new TypedJSON(EraEnd), eraEndJson);
    });

    it('defaults to an empty, well-formed EraEnd', () => {
      const eraEnd = new EraEnd();
      expect(eraEnd.equivocators).to.deep.equal([]);
      expect(eraEnd.inactiveValidators).to.deep.equal([]);
      expect(eraEnd.nextEraValidatorWeights).to.deep.equal([]);
      expect(eraEnd.rewards.size).to.equal(0);
      expect(eraEnd.nextEraGasPrice).to.equal(1);
    });
  });
});
