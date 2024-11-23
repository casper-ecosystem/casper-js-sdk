import { jsonObject, jsonMember } from 'typedjson';
import {
  Bid,
  Bridge,
  Credit,
  Delegator,
  Reservation,
  ValidatorBid
} from './Bid';

/**
 * Represents a polymorphic bid kind, allowing for different types of bid-related entities.
 * This class contains properties for various bid types, including unified bids, validator bids,
 * delegators, bridge transitions, and credits.
 */
@jsonObject
export class BidKind {
  /**
   * A unified bid that combines multiple bid attributes.
   */
  @jsonMember({ name: 'Unified', constructor: Bid })
  unified?: Bid;

  /**
   * A validator-specific bid, containing information unique to validators.
   */
  @jsonMember({ name: 'Validator', constructor: ValidatorBid })
  validator?: ValidatorBid;

  /**
   * A bid specific to a delegator, which represents a user delegating their stake to a validator.
   */
  @jsonMember({ name: 'Delegator', constructor: Delegator })
  delegator?: Delegator;

  /**
   * Represents a transition bridge between validators, connecting an old validator with a new one.
   */
  @jsonMember({ name: 'Bridge', constructor: Bridge })
  bridge?: Bridge;

  /**
   * Represents a credit entry for a validator, specifying an amount and era.
   */
  @jsonMember({ name: 'Credit', constructor: Credit })
  credit?: Credit;

  /**
   *  Represents a validator reserving a slot for specific delegator
   */
  @jsonMember({ name: 'Reservation', constructor: Reservation })
  reservation?: Reservation;
}
