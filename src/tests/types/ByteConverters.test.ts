import { describe, it, expect } from 'vitest';
import { BigNumber } from '@ethersproject/bignumber';

import {
  toBytesU8,
  toBytesU16,
  toBytesU32,
  toBytesU64,
  toBytesU128,
  toBytesU256,
  toBytesU512,
  fromBytesU64,
  parseU16,
  parseU32,
  fromBytesUInt128,
  fromBytesUInt256,
  fromBytesUInt512
} from '../../types';

const hex = (bytes: Uint8Array): string => Buffer.from(bytes).toString('hex');

describe('ByteConverters', () => {
  describe('toBytesU8', () => {
    it('encodes 0 as a single zero byte', () => {
      expect(hex(toBytesU8(0))).to.equal('00');
    });

    it('encodes the max u8 value against a known byte vector', () => {
      expect(hex(toBytesU8(255))).to.equal('ff');
    });

    it('rejects values above the u8 range', () => {
      expect(() => toBytesU8(256)).to.throw('out-of-bounds');
    });
  });

  describe('toBytesU16 (round-trip via parseU16)', () => {
    it('round-trips 0', () => {
      const bytes = toBytesU16(0);
      expect(hex(bytes)).to.equal('0000');
      expect(parseU16(bytes)).to.equal(0);
    });

    it('round-trips the max u16 value against a known byte vector', () => {
      const bytes = toBytesU16(65535);
      expect(hex(bytes)).to.equal('ffff');
      expect(parseU16(bytes)).to.equal(65535);
    });
  });

  describe('toBytesU32 (round-trip via parseU32)', () => {
    it('round-trips 0', () => {
      const bytes = toBytesU32(0);
      expect(hex(bytes)).to.equal('00000000');
      expect(parseU32(bytes)).to.equal(0);
    });

    it('round-trips the largest value parseU32 can represent as unsigned (0x7fffffff)', () => {
      const bytes = toBytesU32(0x7fffffff);
      expect(hex(bytes)).to.equal('ffffff7f');
      expect(parseU32(bytes)).to.equal(0x7fffffff);
    });

    // The high bit is the point: JS bitwise ops are signed 32-bit, so a read
    // path without a final `>>> 0` returns -1 here.
    it('round-trips the max u32 value against a known byte vector', () => {
      const bytes = toBytesU32(4294967295);
      expect(hex(bytes)).to.equal('ffffffff');
      expect(parseU32(bytes)).to.equal(4294967295);
    });

    it('round-trips the smallest u32 with the high bit set', () => {
      const bytes = toBytesU32(2147483648);
      expect(hex(bytes)).to.equal('00000080');
      expect(parseU32(bytes)).to.equal(2147483648);
    });
  });

  describe('toBytesU64 (round-trip via fromBytesU64)', () => {
    it('round-trips 0', () => {
      const bytes = toBytesU64(0);
      expect(hex(bytes)).to.equal('0000000000000000');
      expect(fromBytesU64(bytes).toString()).to.equal('0');
    });

    it('round-trips the max u64 value against a known byte vector', () => {
      const maxU64 = BigNumber.from('18446744073709551615'); // 2^64 - 1
      const bytes = toBytesU64(maxU64);
      expect(hex(bytes)).to.equal('ffffffffffffffff');
      expect(fromBytesU64(bytes).toString()).to.equal(maxU64.toString());
    });
  });

  describe('toBytesU128 (round-trip via fromBytesUInt128)', () => {
    it('round-trips 0 as a single zero-length-prefix byte', () => {
      const bytes = toBytesU128(0);
      expect(hex(bytes)).to.equal('00');
      expect(fromBytesUInt128(bytes).result.toString()).to.equal('0');
    });

    it('round-trips the max u128 value against a known byte vector', () => {
      const maxU128 = BigNumber.from(2).pow(128).sub(1);
      const bytes = toBytesU128(maxU128);
      // length-prefix (16) followed by 16 bytes of 0xff
      expect(hex(bytes)).to.equal('10' + 'ff'.repeat(16));
      expect(fromBytesUInt128(bytes).result.toString()).to.equal(
        maxU128.toString()
      );
    });
  });

  describe('toBytesU256 (round-trip via fromBytesUInt256)', () => {
    it('round-trips 0 as a single zero-length-prefix byte', () => {
      const bytes = toBytesU256(0);
      expect(hex(bytes)).to.equal('00');
      expect(fromBytesUInt256(bytes).result.toString()).to.equal('0');
    });

    it('round-trips the max u256 value against a known byte vector', () => {
      const maxU256 = BigNumber.from(2).pow(256).sub(1);
      const bytes = toBytesU256(maxU256);
      // length-prefix (32) followed by 32 bytes of 0xff
      expect(hex(bytes)).to.equal('20' + 'ff'.repeat(32));
      expect(fromBytesUInt256(bytes).result.toString()).to.equal(
        maxU256.toString()
      );
    });
  });

  describe('toBytesU512 (round-trip via fromBytesUInt512)', () => {
    it('round-trips 0 as a single zero-length-prefix byte', () => {
      const bytes = toBytesU512(0);
      expect(hex(bytes)).to.equal('00');
      expect(fromBytesUInt512(bytes).result.toString()).to.equal('0');
    });

    it('round-trips a value at the u256 boundary against a known byte vector', () => {
      // 2^256-1: the ceiling a mask-derived bounds check would impose on U512.
      const boundary = BigNumber.from(2).pow(256).sub(1);
      const bytes = toBytesU512(boundary);
      expect(hex(bytes)).to.equal('20' + 'ff'.repeat(32));
      expect(fromBytesUInt512(bytes).result.toString()).to.equal(
        boundary.toString()
      );
    });

    // Above 2^256 is where a `MaxUint256`-masked bounds check collapses U512
    // down to U256.
    it('accepts the whole legal U512 range', () => {
      const trueMaxU512 = BigNumber.from(2).pow(512).sub(1);
      const maxBytes = toBytesU512(trueMaxU512);
      // length-prefix (64) followed by 64 bytes of 0xff
      expect(hex(maxBytes)).to.equal('40' + 'ff'.repeat(64));
      expect(fromBytesUInt512(maxBytes).result.toString()).to.equal(
        trueMaxU512.toString()
      );

      const justAboveU256 = BigNumber.from(2).pow(256);
      expect(
        fromBytesUInt512(toBytesU512(justAboveU256)).result.toString()
      ).to.equal(justAboveU256.toString());
    });

    it('still rejects a value past the u512 max', () => {
      expect(() => toBytesU512(BigNumber.from(2).pow(512))).to.throw(
        'out-of-bounds'
      );
    });
  });
});
