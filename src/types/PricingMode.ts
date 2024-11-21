import { jsonObject, jsonMember } from 'typedjson';
import { Hash } from './key';
import { CLValueBool, CLValueUInt64, CLValueUInt8 } from './clvalue';
import { CalltableSerialization } from './CalltableSerialization';

/**
 * Represents the classic pricing mode, including parameters for gas price tolerance,
 * payment amount, and standard payment.
 */
@jsonObject
export class PaymentLimitedMode {
  /**
   * The tolerance for gas price fluctuations in classic pricing mode.
   */
  @jsonMember({ name: 'gas_price_tolerance', constructor: Number })
  gasPriceTolerance: number;

  /**
   * The payment amount associated with classic pricing mode.
   */
  @jsonMember({ name: 'payment_amount', constructor: Number })
  paymentAmount: number;

  /**
   * Whether the payment is a standard payment.
   */
  @jsonMember({ name: 'standard_payment', constructor: Boolean })
  standardPayment: boolean;

  public toBytes(): Uint8Array {
    const calltableSerializer = new CalltableSerialization();
    calltableSerializer.addField(0, CLValueUInt8.newCLUint8(0).bytes());
    calltableSerializer.addField(
      1,
      CLValueUInt64.newCLUint64(this.paymentAmount).bytes()
    );
    calltableSerializer.addField(
      2,
      CLValueUInt8.newCLUint8(this.gasPriceTolerance).bytes()
    );
    calltableSerializer.addField(
      3,
      CLValueBool.fromBoolean(this.standardPayment).bytes()
    );

    return calltableSerializer.toBytes();
  }
}

/**
 * Represents the fixed pricing mode, including a parameter for gas price tolerance.
 */
@jsonObject
export class FixedMode {
  /**
   * The tolerance for gas price fluctuations in fixed pricing mode.
   */
  @jsonMember({ name: 'gas_price_tolerance', constructor: Number })
  gasPriceTolerance: number;

  /**
   * User-specified additional computation factor (minimum 0).
   *
   * - If `0` is provided, no additional logic is applied to the computation limit.
   * - Each value above `0` tells the node that it needs to treat the transaction
   *   as if it uses more gas than its serialized size indicates.
   * - Each increment of `1` increases the "wasm lane" size bucket for this transaction by `1`.
   *
   * For example:
   * - If the transaction's size indicates bucket `0` and `additionalComputationFactor = 2`,
   *   the transaction will be treated as if it belongs to bucket `2`.
   */
  @jsonMember({ name: 'additional_computation_factor', constructor: Number })
  additionalComputationFactor!: number;

  public toBytes(): Uint8Array {
    const calltableSerializer = new CalltableSerialization();
    calltableSerializer.addField(0, CLValueUInt8.newCLUint8(1).bytes());
    calltableSerializer.addField(
      1,
      CLValueUInt8.newCLUint8(this.gasPriceTolerance).bytes()
    );
    calltableSerializer.addField(
      2,
      CLValueUInt8.newCLUint8(this.additionalComputationFactor).bytes()
    );

    return calltableSerializer.toBytes();
  }
}

/**
 * Represents the reserved pricing mode, which includes a receipt hash.
 */
@jsonObject
export class PrepaidMode {
  /**
   * The receipt associated with the reserved pricing mode.
   */
  @jsonMember({
    name: 'receipt',
    constructor: Hash,
    deserializer: json => Hash.fromJSON(json),
    serializer: value => value.toJSON()
  })
  receipt: Hash;

  public toBytes(): Uint8Array {
    const calltableSerializer = new CalltableSerialization();
    calltableSerializer.addField(0, CLValueUInt8.newCLUint8(2).bytes());
    calltableSerializer.addField(1, this.receipt.toBytes());

    return calltableSerializer.toBytes();
  }
}

/**
 * Represents the pricing mode, which can be one of the following: Classic, Fixed, or Reserved.
 */
@jsonObject
export class PricingMode {
  /**
   * The classic pricing mode, if applicable.
   */
  @jsonMember({ name: 'PaymentLimited', constructor: PaymentLimitedMode })
  paymentLimited?: PaymentLimitedMode;

  /**
   * The fixed pricing mode, if applicable.
   */
  @jsonMember({ name: 'Fixed', constructor: FixedMode })
  fixed?: FixedMode;

  /**
   * The reserved pricing mode, if applicable.
   */
  @jsonMember({ name: 'Prepaid', constructor: PrepaidMode })
  prepaid?: PrepaidMode;

  /**
   * Converts the pricing mode instance into a byte array representation.
   * This method serializes the current pricing mode into bytes that can be used for transactions.
   *
   * @returns A `Uint8Array` representing the serialized pricing mode.
   */
  toBytes(): Uint8Array {
    if (this.paymentLimited) {
      return this.paymentLimited.toBytes();
    } else if (this.fixed) {
      return this.fixed.toBytes();
    } else if (this.prepaid) {
      return this.prepaid.toBytes();
    }

    throw new Error('Unable to serialize PricingMode');
  }
}
