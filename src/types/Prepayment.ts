import { jsonMember, jsonObject } from 'typedjson';
import { HexBytes } from './HexBytes';
import { Hash } from './key';

/**
 * Represents a gas pre-payment in the blockchain system.
 *
 * This container includes details about the receipt, prepayment kind,
 * and associated data required for the gas pre-payment process.
 */
@jsonObject
export class PrepaymentKind {
  /**
   * The receipt identifier for the gas pre-payment.
   *
   * This is a string representation that uniquely identifies the pre-payment receipt.
   */
  @jsonMember({
    name: 'receipt',
    constructor: Hash,
    deserializer: json => Hash.fromJSON(json),
    serializer: value => value.toJSON()
  })
  receipt: Hash;

  /**
   * The kind of pre-payment, represented as a byte.
   *
   * This value specifies the type or category of the pre-payment.
   */
  @jsonMember({
    name: 'prepayment_data',
    constructor: HexBytes,
    deserializer: json => HexBytes.fromJSON(json),
    serializer: value => value.toJSON()
  })
  prepaymentData: HexBytes;

  /**
   * The pre-payment data associated with this transaction.
   *
   * This is a string containing additional information or metadata for the pre-payment.
   */
  @jsonMember({ name: 'prepayment_kind', constructor: Number })
  prepaymentKind: number;
}
