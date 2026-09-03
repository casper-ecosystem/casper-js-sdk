import { TypedJSON } from 'typedjson';
import { expect } from 'vitest';

import { Bid } from '../../types';
import { auctionBidV1Json, auctionBidV2Json } from '../data';

describe('Bid', () => {
  it('should parse auction bid V1', () => {
    const serializer = new TypedJSON(Bid);
    const parsed = serializer.parse(auctionBidV1Json);

    expect(parsed).to.not.be.undefined;
    expect(parsed).to.not.be.null;

    expect(parsed!.stakedAmount.toString()).to.equal(
      auctionBidV1Json.staked_amount
    );
    expect(parsed!.delegationRate).to.equal(auctionBidV1Json.delegation_rate);
    expect(parsed!.inactive).to.equal(auctionBidV1Json.inactive);
    expect(parsed!.delegators[0].stakedAmount.toString()).to.equal(
      auctionBidV1Json.delegators[0].staked_amount
    );
    expect(parsed!.delegators[0].bondingPurse.toPrefixedString()).to.equal(
      auctionBidV1Json.delegators[0].bonding_purse
    );
    expect(parsed!.delegators[0].delegatorKind.toHex()).to.equal(
      auctionBidV1Json.delegators[0].public_key
    );
    expect(parsed!.delegators[0].validatorPublicKey.toHex()).to.equal(
      auctionBidV1Json.delegators[0].delegatee
    );
  });

  it('should parse auction bid V2', () => {
    const serializer = new TypedJSON(Bid);
    const parsed = serializer.parse(auctionBidV2Json);

    expect(parsed).to.not.be.undefined;
    expect(parsed).to.not.be.null;

    expect(parsed!.stakedAmount.toString()).to.equal(
      auctionBidV2Json.staked_amount
    );
    expect(parsed!.delegationRate).to.equal(auctionBidV2Json.delegation_rate);
    expect(parsed!.inactive).to.equal(auctionBidV2Json.inactive);
    expect(parsed!.delegators[0].stakedAmount.toString()).to.equal(
      auctionBidV2Json.delegators[0].delegator.staked_amount
    );
    expect(parsed!.delegators[0].bondingPurse.toPrefixedString()).to.equal(
      auctionBidV2Json.delegators[0].delegator.bonding_purse
    );
    expect(parsed!.delegators[0].delegatorKind.toHex()).to.equal(
      auctionBidV2Json.delegators[0].delegator.delegator_kind.PublicKey
    );
    expect(parsed!.delegators[0].validatorPublicKey.toHex()).to.equal(
      auctionBidV2Json.delegators[0].delegator.validator_public_key
    );
  });
});
