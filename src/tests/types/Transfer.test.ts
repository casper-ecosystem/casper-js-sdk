import { describe, it, expect } from 'vitest';
import { TypedJSON } from 'typedjson';

import { Transfer } from '../../types';
import { expectJsonRoundTrip } from '../roundtrip';

const deployHash =
  '683cbcf69dd1a029d4291e873d600566b50b40a7a40da2ba98e169971cd92ddd';
const fromAccountHash =
  'account-hash-d9c89d3ef62f1c8c5f951d1e44f136f133b728ae7291ea5d4f36530b6f02a910';
const toAccountHash =
  'account-hash-c54c0a2fd689a68dd4114d4852fefa414d24d04f531176729070ca83bd924bea';
const sourceUref =
  'uref-b27476d0aa1d55ce26512424b40b093e3057b4d79636f124a3a5e1a9f44733e8-007';
const targetUref =
  'uref-654802c4a00cf5e05ecb5c57a7d7731b1f8fa50036c17b49a4b0a5e71dd35055-004';

describe('Transfer', () => {
  describe('V1 wire format', () => {
    const transferV1Json = {
      amount: '193125900000000',
      deploy_hash: deployHash,
      from: fromAccountHash,
      gas: '0',
      id: 7,
      source: sourceUref,
      target: targetUref,
      to: toAccountHash
    };

    it('parses via Transfer.fromJSON and normalizes into the unified shape', () => {
      const transfer = Transfer.fromJSON(transferV1Json);

      expect(transfer.amount.toString()).to.equal(transferV1Json.amount);
      expect(transfer.gas).to.equal(0);
      expect(transfer.id).to.equal(transferV1Json.id);
      expect(transfer.source.toPrefixedString()).to.equal(
        transferV1Json.source
      );
      expect(transfer.target.toPrefixedString()).to.equal(
        transferV1Json.target
      );
      expect(transfer.to?.toPrefixedString()).to.equal(transferV1Json.to);
      expect(transfer.transactionHash.deploy?.toHex()).to.equal(deployHash);
      expect(transfer.from.accountHash?.toPrefixedString()).to.equal(
        fromAccountHash
      );
      expect(transfer.getTransferV1()).to.not.be.undefined;
      expect(transfer.getTransferV2()).to.be.undefined;
    });

    it("also parses the bare (unwrapped) V1 shape that predates the 'Version1' wrapper", () => {
      const transfer = Transfer.fromJSON(transferV1Json);
      expect(transfer.amount.toString()).to.equal(transferV1Json.amount);
    });
  });

  describe('V2 wire format', () => {
    const transferV2Json = {
      Version2: {
        amount: '193125900000000',
        transaction_hash: { Version1: deployHash },
        from: { AccountHash: fromAccountHash },
        gas: '0',
        id: 3,
        source: sourceUref,
        target: targetUref,
        to: toAccountHash
      }
    };

    it('parses via Transfer.fromJSON and preserves the V2 fields', () => {
      const transfer = Transfer.fromJSON(transferV2Json);

      expect(transfer.amount.toString()).to.equal(
        transferV2Json.Version2.amount
      );
      expect(transfer.gas).to.equal(0);
      expect(transfer.id).to.equal(transferV2Json.Version2.id);
      expect(transfer.source.toPrefixedString()).to.equal(sourceUref);
      expect(transfer.target.toPrefixedString()).to.equal(targetUref);
      expect(transfer.to?.toPrefixedString()).to.equal(toAccountHash);
      expect(transfer.transactionHash.transactionV1?.toHex()).to.equal(
        deployHash
      );
      expect(transfer.from.accountHash?.toPrefixedString()).to.equal(
        fromAccountHash
      );
      expect(transfer.getTransferV2()).to.not.be.undefined;
      expect(transfer.getTransferV1()).to.be.undefined;
    });

    it('round-trips through its own (unified) JSON shape: toJSON(fromJSON(x)) deep-equals', () => {
      const serializer = new TypedJSON(Transfer);
      const transfer = Transfer.fromJSON(transferV2Json);

      const json = JSON.parse(serializer.stringify(transfer));
      expectJsonRoundTrip(serializer, json);

      expect(json.amount).to.equal(transferV2Json.Version2.amount);
      expect(json.transaction_hash).to.deep.equal(
        transferV2Json.Version2.transaction_hash
      );
    });
  });
});
