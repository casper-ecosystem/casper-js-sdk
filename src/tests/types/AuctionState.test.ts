import { describe, it, expect } from 'vitest';
import { TypedJSON } from 'typedjson';

import { AuctionState, AuctionStateV1, AuctionStateV2 } from '../../types';
import { auctionStateV1Json, auctionStateV2Json } from '../data';
import { expectJsonRoundTrip } from '../roundtrip';

describe('AuctionState', () => {
  describe('AuctionStateV1', () => {
    it('parses bids, era validators and state root hash from the fixture', () => {
      const parsed = new TypedJSON(AuctionStateV1).parse(auctionStateV1Json)!;

      expect(parsed.blockHeight).to.equal(auctionStateV1Json.block_height);
      expect(parsed.stateRootHash).to.equal(auctionStateV1Json.state_root_hash);
      expect(parsed.bids[0].publicKey.toHex()).to.equal(
        auctionStateV1Json.bids[0].public_key
      );
      expect(parsed.bids[0].bid.stakedAmount.toString()).to.equal(
        auctionStateV1Json.bids[0].bid.staked_amount
      );
      expect(
        parsed.bids[0].bid.delegators[0].validatorPublicKey.toHex()
      ).to.equal(auctionStateV1Json.bids[0].bid.delegators[0].delegatee);
      expect(parsed.eraValidators[0].eraID).to.equal(
        auctionStateV1Json.era_validators[0].era_id
      );
    });

    it('round-trips a delegator-free fixture through JSON: toJSON(fromJSON(x)) deep-equals', () => {
      const noDelegatorsFixture = {
        ...auctionStateV1Json,
        bids: [
          {
            ...auctionStateV1Json.bids[0],
            bid: { ...auctionStateV1Json.bids[0].bid, delegators: [] }
          }
        ]
      };

      expectJsonRoundTrip(new TypedJSON(AuctionStateV1), noDelegatorsFixture);
    });
  });

  describe('AuctionStateV2', () => {
    it('parses Validator and Delegator bid kinds from the fixture', () => {
      const parsed = new TypedJSON(AuctionStateV2).parse(auctionStateV2Json)!;

      const validatorEntry = parsed.bids[0];
      expect(validatorEntry.publicKey.toHex()).to.equal(
        auctionStateV2Json.bids[0].public_key
      );
      expect(validatorEntry.bid.validator?.stakedAmount.toString()).to.equal(
        auctionStateV2Json.bids[0].bid.Validator!.staked_amount
      );
      expect(
        validatorEntry.bid.validator?.minimumDelegationAmount.toString()
      ).to.equal(
        auctionStateV2Json.bids[0].bid.Validator!.minimum_delegation_amount
      );

      const delegatorEntry = parsed.bids[1];
      expect(delegatorEntry.publicKey.toHex()).to.equal(
        auctionStateV2Json.bids[1].public_key
      );
      expect(delegatorEntry.bid.delegator?.delegatorKind.toHex()).to.equal(
        auctionStateV2Json.bids[1].bid.Delegator!.delegator_kind.PublicKey
      );
    });

    it('round-trips the Validator bid kind through JSON: toJSON(fromJSON(x)) deep-equals', () => {
      // Validator entry only, for the reason EraInfo.test.ts records.
      const validatorOnlyFixture = {
        ...auctionStateV2Json,
        bids: [auctionStateV2Json.bids[0]]
      };

      expectJsonRoundTrip(new TypedJSON(AuctionStateV2), validatorOnlyFixture);
    });
  });

  describe('unified AuctionState', () => {
    it('fromV1 expands each bid into a Validator wrapper plus one wrapper per delegator', () => {
      const v1 = new TypedJSON(AuctionStateV1).parse(auctionStateV1Json)!;
      const unified = AuctionState.fromV1(v1);

      expect(unified.blockHeight).to.equal(v1.blockHeight);
      expect(unified.stateRootHash).to.equal(v1.stateRootHash);
      expect(unified.bids).to.have.lengthOf(2); // 1 validator + 1 delegator

      const [validatorWrapper, delegatorWrapper] = unified.bids;
      expect(
        validatorWrapper.bid.validator?.validatorPublicKey.toHex()
      ).to.equal(auctionStateV1Json.bids[0].public_key);
      expect(validatorWrapper.bid.validator?.stakedAmount.toString()).to.equal(
        auctionStateV1Json.bids[0].bid.staked_amount
      );
      expect(delegatorWrapper.bid.delegator?.stakedAmount.toString()).to.equal(
        auctionStateV1Json.bids[0].bid.delegators[0].staked_amount
      );
      expect(delegatorWrapper.bid.delegator?.delegatorKind.toHex()).to.equal(
        auctionStateV1Json.bids[0].bid.delegators[0].public_key
      );
    });

    it('fromV2 carries bids, era validators and state root hash through unchanged', () => {
      const v2 = new TypedJSON(AuctionStateV2).parse(auctionStateV2Json)!;
      const unified = AuctionState.fromV2(v2);

      expect(unified.blockHeight).to.equal(v2.blockHeight);
      expect(unified.stateRootHash).to.equal(v2.stateRootHash);
      expect(unified.bids).to.have.lengthOf(2);
      expect(unified.bids[0].bid.validator?.stakedAmount.toString()).to.equal(
        v2.bids[0].bid.validator?.stakedAmount.toString()
      );
    });
  });
});
