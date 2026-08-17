import { describe, it, expect } from 'vitest';
import { TypedJSON } from 'typedjson';

import { UnbondingPurse } from '../../types';
import { expectJsonRoundTrip } from '../roundtrip';

describe('UnbondingPurse', () => {
  const unbondingPurseJson = {
    amount: '900000000000',
    bonding_purse:
      'uref-b3c03358245a0d9514064b6d0c3dd90023d29a0fe137507d430a26990f5ce8e3-007',
    era_of_creation: 1200,
    unbonder_public_key:
      '01197f6b23e16c8532c6abc838facd5ea789be0c76b2920334039bfa8b3d368d61',
    validator_public_key:
      '01d829cbfb66b2b11ef8d8feb6d3f2155789fc22f407bb57f89b05f6ba4b9ae070'
  };

  const unbondingPurseWithNewValidatorJson = {
    ...unbondingPurseJson,
    new_validator:
      '014508a07aa941707f3eb2db94c8897a80b2c1197476b6de213ac273df7d86c4ff'
  };

  it('round-trips through JSON: toJSON(fromJSON(x)) deep-equals the fixture', () => {
    const parsed = expectJsonRoundTrip(
      new TypedJSON(UnbondingPurse),
      unbondingPurseJson
    );

    expect(parsed.amount.toString()).to.equal(unbondingPurseJson.amount);
    expect(parsed.eraOfCreation).to.equal(unbondingPurseJson.era_of_creation);
    expect(parsed.newValidator).to.be.undefined;
  });

  it('round-trips the optional new_validator field', () => {
    const parsed = expectJsonRoundTrip(
      new TypedJSON(UnbondingPurse),
      unbondingPurseWithNewValidatorJson
    );

    expect(parsed.newValidator?.toHex()).to.equal(
      unbondingPurseWithNewValidatorJson.new_validator
    );
  });
});
