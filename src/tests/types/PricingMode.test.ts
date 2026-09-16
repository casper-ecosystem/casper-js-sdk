import { describe, it, expect } from 'vitest';
import { TypedJSON } from 'typedjson';

import { PricingMode } from '../../types';
import { CalltableSerialization } from '../../types/CalltableSerialization';
import { expectJsonRoundTrip } from '../roundtrip';

describe('PricingMode', () => {
  const paymentLimitedJson = {
    PaymentLimited: {
      gas_price_tolerance: 3,
      payment_amount: 200000000,
      standard_payment: true
    }
  };
  const fixedJson = {
    Fixed: {
      gas_price_tolerance: 5,
      additional_computation_factor: 2
    }
  };
  const prepaidJson = {
    Prepaid: {
      receipt:
        '44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a'
    }
  };

  describe('JSON round-trip: toJSON(fromJSON(x)) deep-equals the fixture', () => {
    it.each([
      ['PaymentLimited', paymentLimitedJson],
      ['Fixed', fixedJson],
      ['Prepaid', prepaidJson]
    ])('%s', (_name, fixture) => {
      expectJsonRoundTrip(new TypedJSON(PricingMode), fixture);
    });
  });

  describe('toBytes field offsets and order (calltable)', () => {
    it('PaymentLimited: tag 0, then payment_amount(u64), gas_price_tolerance(u8), standard_payment(bool)', () => {
      const mode = new TypedJSON(PricingMode).parse(paymentLimitedJson)!;
      const bytes = mode.toBytes();
      const table = CalltableSerialization.fromBytes(bytes);

      expect(table.getField(0)).to.deep.equal(Uint8Array.from([0])); // variant tag: PaymentLimited = 0
      expect(table.getField(1)).to.deep.equal(
        Uint8Array.from([0, 194, 235, 11, 0, 0, 0, 0]) // 200000000 as u64 LE
      );
      expect(table.getField(2)).to.deep.equal(Uint8Array.from([3])); // gas_price_tolerance as u8
      expect(table.getField(3)).to.deep.equal(Uint8Array.from([1])); // standard_payment = true
      expect(table.getField(4)).to.be.undefined;
    });

    it('Fixed: tag 1, then gas_price_tolerance(u8), additional_computation_factor(u8)', () => {
      const mode = new TypedJSON(PricingMode).parse(fixedJson)!;
      const bytes = mode.toBytes();
      const table = CalltableSerialization.fromBytes(bytes);

      expect(table.getField(0)).to.deep.equal(Uint8Array.from([1])); // variant tag: Fixed = 1
      expect(table.getField(1)).to.deep.equal(Uint8Array.from([5]));
      expect(table.getField(2)).to.deep.equal(Uint8Array.from([2]));
      expect(table.getField(3)).to.be.undefined;
    });

    it('Prepaid: tag 2, then the receipt hash bytes', () => {
      const mode = new TypedJSON(PricingMode).parse(prepaidJson)!;
      const bytes = mode.toBytes();
      const table = CalltableSerialization.fromBytes(bytes);

      expect(table.getField(0)).to.deep.equal(Uint8Array.from([2])); // variant tag: Prepaid = 2
      expect(table.getField(1)).to.deep.equal(mode.prepaid!.receipt.toBytes());
      expect(table.getField(2)).to.be.undefined;
    });

    it('throws when no variant is set', () => {
      const empty = new PricingMode();
      expect(() => empty.toBytes()).to.throw('Unable to serialize PricingMode');
    });
  });
});
