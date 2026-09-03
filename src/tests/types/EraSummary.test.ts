import { TypedJSON } from 'typedjson';
import { expect } from 'vitest';

import { EraSummary } from '../../types';
import { eraSummaryJson, eraSummaryV2DelegatorKindJson } from '../data';

const validateValidatorAllocation = (
  validator: any,
  jsonValidator: any,
  index: number
): void => {
  expect(
    validator.validatorPublicKey.toHex(),
    `Validator.validatorPublicKey.toHex() at index ${index} should not be empty`
  ).to.not.be.empty;
  expect(
    validator.validatorPublicKey.toHex(),
    `Validator.validatorPublicKey at index ${index} does not match`
  ).to.deep.equal(jsonValidator?.validator_public_key);
  expect(
    validator.amount,
    `Validator.amount at index ${index} should not be empty`
  ).to.not.be.empty;
  expect(
    validator.amount.toString(),
    `Validator.amount at index ${index} does not match`
  ).to.deep.equal(jsonValidator?.amount);
};

const validateDelegatorAllocationTest1 = (
  delegator: any,
  jsonDelegator: any,
  index: number
): void => {
  expect(
    delegator.delegatorKind.toHex(),
    `DelegatorKind.toHex() at index ${index} should not be empty`
  ).to.not.be.empty;
  expect(
    delegator.delegatorKind.toHex(),
    `DelegatorKind at index ${index} does not match`
  ).to.deep.equal(jsonDelegator?.delegator_public_key);
  expect(
    delegator.validatorPublicKey.toHex(),
    `Delegator.validatorPublicKey.toHex() at index ${index} should not be empty`
  ).to.not.be.empty;
  expect(
    delegator.validatorPublicKey.toHex(),
    `Delegator.validatorPublicKey at index ${index} does not match`
  ).to.deep.equal(jsonDelegator?.validator_public_key);
  expect(
    delegator.amount,
    `Delegator.amount at index ${index} should not be empty`
  ).to.not.be.empty;
  expect(
    delegator.amount.toString(),
    `Delegator.amount at index ${index} does not match`
  ).to.deep.equal(jsonDelegator?.amount);
};

const validateDelegatorAllocationTest2 = (
  delegator: any,
  jsonDelegator: any,
  index: number
): void => {
  expect(
    delegator.delegatorKind.toHex(),
    `DelegatorKind.toHex() at index ${index} should not be empty`
  ).to.not.be.empty;

  if (delegator.delegatorKind.publicKey) {
    expect(
      delegator.delegatorKind.toHex(),
      `DelegatorKind.publicKey at index ${index} does not match`
    ).to.deep.equal(jsonDelegator?.delegator_kind?.PublicKey);
  } else if (delegator.delegatorKind.purse) {
    const expected = `uref-${jsonDelegator?.delegator_kind?.Purse}-007`;
    expect(
      delegator.delegatorKind.toHex(),
      `DelegatorKind.purse at index ${index} does not match expected value ${expected}`
    ).to.deep.equal(expected);
  }

  expect(
    delegator.validatorPublicKey.toHex(),
    `Delegator.validatorPublicKey.toHex() at index ${index} should not be empty`
  ).to.not.be.empty;
  expect(
    delegator.validatorPublicKey.toHex(),
    `Delegator.validatorPublicKey at index ${index} does not match`
  ).to.deep.equal(jsonDelegator?.validator_public_key);
  expect(
    delegator.amount,
    `Delegator.amount at index ${index} should not be empty`
  ).to.not.be.empty;
  expect(
    delegator.amount.toString(),
    `Delegator.amount at index ${index} does not match`
  ).to.deep.equal(jsonDelegator?.amount);
};

// The v1 fixture is an 11 MB era summary carrying 30650 seigniorage
// allocations, each asserted field by field, so the run does not fit in the
// 5s default on a CI runner.
describe('EraSummary', { timeout: 10000 }, () => {
  it('should correctly parse and match the era summary json', () => {
    const serializer = new TypedJSON(EraSummary);
    const jsonRes = serializer.parse(eraSummaryJson);

    expect(jsonRes, 'Parsed era summary should be defined').to.not.be.undefined;
    expect(
      jsonRes?.blockHash.toHex(),
      'Block hash does not match expected value'
      // @ts-ignore IDE issue
    ).to.deep.equal(eraSummaryJson.block_hash);

    const allocations = jsonRes!.storedValue!.eraInfo!.seigniorageAllocations;
    const jsonAllocations =
      // @ts-ignore IDE issue
      eraSummaryJson.stored_value.EraInfo.seigniorage_allocations;

    allocations.forEach((summary, index) => {
      const jsonSummary = jsonAllocations[index];

      if (summary.delegator) {
        validateDelegatorAllocationTest1(
          summary.delegator,
          jsonSummary?.Delegator,
          index
        );
      }

      if (summary.validator) {
        validateValidatorAllocation(
          summary.validator,
          jsonSummary?.Validator,
          index
        );
      }
    });
  });

  it('should correctly parse and match the era summary v2 json', () => {
    const serializer = new TypedJSON(EraSummary);
    const jsonRes = serializer.parse(eraSummaryV2DelegatorKindJson);

    expect(jsonRes, 'Parsed era summary v2 should be defined').to.not.be
      .undefined;
    expect(
      jsonRes?.blockHash.toHex(),
      'Block hash does not match expected value'
    ).to.deep.equal(eraSummaryV2DelegatorKindJson.block_hash);

    const allocations = jsonRes!.storedValue!.eraInfo!.seigniorageAllocations;
    const jsonAllocations =
      eraSummaryV2DelegatorKindJson.stored_value.EraInfo
        .seigniorage_allocations;

    allocations.forEach((summary, index) => {
      const jsonSummary = jsonAllocations[index];

      if (summary.delegator) {
        validateDelegatorAllocationTest2(
          summary.delegator,
          jsonSummary?.DelegatorKind,
          index
        );
      }

      if (summary.validator) {
        validateValidatorAllocation(
          summary.validator,
          jsonSummary?.Validator,
          index
        );
      }
    });
  });
});
