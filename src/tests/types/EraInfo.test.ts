import { describe, it, expect } from 'vitest';
import { TypedJSON } from 'typedjson';

import {
  EraInfo,
  SeigniorageAllocation,
  DelegatorAllocation,
  ValidatorAllocation
} from '../../types';
import { eraInfoResultJson, eraSummaryV2DelegatorKindJson } from '../data';
import { expectJsonRoundTrip } from '../roundtrip';

describe('EraInfo', () => {
  const eraInfoJson = eraInfoResultJson.EraInfo as {
    seigniorage_allocations: any[];
  };

  it('parses every allocation in the fixture as a Delegator or Validator allocation', () => {
    const parsed = new TypedJSON(EraInfo).parse(eraInfoJson)!;

    expect(parsed.seigniorageAllocations).to.have.lengthOf(
      eraInfoJson.seigniorage_allocations.length
    );
    parsed.seigniorageAllocations.forEach((allocation, index) => {
      const jsonAllocation = eraInfoJson.seigniorage_allocations[index];
      expect(allocation).to.be.instanceOf(SeigniorageAllocation);

      if ('Validator' in jsonAllocation) {
        expect(allocation.validator).to.be.instanceOf(ValidatorAllocation);
        expect(allocation.validator?.validatorPublicKey.toHex()).to.equal(
          jsonAllocation.Validator.validator_public_key
        );
        expect(allocation.validator?.amount.toString()).to.equal(
          jsonAllocation.Validator.amount
        );
      } else {
        expect(allocation.delegator).to.be.instanceOf(DelegatorAllocation);
      }
    });
  });

  it('round-trips the Validator allocations through JSON: toJSON(fromJSON(x)) deep-equals the fixture', () => {
    // Validator entries only: a `Delegator`-keyed 2.x entry keeps its key
    // material but is written back under `DelegatorKind`, so it cannot be
    // byte-identical.
    const validatorOnly = {
      seigniorage_allocations: eraInfoJson.seigniorage_allocations.filter(
        a => 'Validator' in a
      )
    };
    expect(validatorOnly.seigniorage_allocations.length).to.be.greaterThan(0);

    expectJsonRoundTrip(new TypedJSON(EraInfo), validatorOnly);
  });

  it('round-trips a delegator allocation without losing the key material', () => {
    const delegatorAllocationJson =
      eraSummaryV2DelegatorKindJson.stored_value.EraInfo
        .seigniorage_allocations[0].DelegatorKind!;

    const parsed = new TypedJSON(DelegatorAllocation).parse(
      delegatorAllocationJson
    )!;
    expect(parsed.delegatorKind.toHex()).to.equal(
      delegatorAllocationJson.delegator_kind.PublicKey
    );

    const reserialized = JSON.parse(
      new TypedJSON(DelegatorAllocation).stringify(parsed)
    );
    expect(reserialized.delegator_kind.PublicKey).to.equal(
      delegatorAllocationJson.delegator_kind.PublicKey
    );
  });

  // 2.x nests `delegator_kind` under the same `Delegator` key that 1.x used for
  // a flat `delegator_public_key`, so the key name alone cannot pick the reader.
  it('parses the delegator key out of "Delegator"-keyed 2.x data', () => {
    const rawDelegatorEntry = eraInfoJson.seigniorage_allocations.find(
      a => 'Delegator' in a
    );
    expect(rawDelegatorEntry).to.not.be.undefined;
    expect(rawDelegatorEntry.Delegator.delegator_kind).to.not.be.undefined;

    const allocation = SeigniorageAllocation.fromJSON(rawDelegatorEntry);
    expect(allocation.delegator?.delegatorKind.toHex()).to.equal(
      rawDelegatorEntry.Delegator.delegator_kind.PublicKey
    );
    expect(allocation.delegator?.validatorPublicKey.toHex()).to.equal(
      rawDelegatorEntry.Delegator.validator_public_key
    );
  });

  // The 1.x flat shape is still emitted by older nodes and must keep working.
  it('still parses the flat 1.x "Delegator" shape', () => {
    const flat = {
      Delegator: {
        delegator_public_key:
          '010136c394f11baa01e62a1610a87684085688c7db5c78e3053c98ff762ca38566',
        validator_public_key:
          '01000e6fce753895c0d08d5d6af62db4e9b0d070f10e69e2c6badf977b29bbeeee',
        amount: '1621202855'
      }
    };

    const allocation = SeigniorageAllocation.fromJSON(flat);
    expect(allocation.delegator?.delegatorKind.toHex()).to.equal(
      flat.Delegator.delegator_public_key
    );
  });

  it('SeigniorageAllocation.fromJSON throws on an unrecognized shape', () => {
    expect(() => SeigniorageAllocation.fromJSON(null)).to.throw(
      'Invalid JSON for SeigniorageAllocation'
    );
    expect(() => SeigniorageAllocation.fromJSON({})).to.throw(
      'incorrect SeigniorageAllocation format structure'
    );
  });
});
