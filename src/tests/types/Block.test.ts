import { describe, it, expect } from 'vitest';
import { TypedJSON } from 'typedjson';

import { Block, BlockWrapper, BlockV1, BlockV2, Proof } from '../../types';
import { getBlockByHashJson } from '../data';
import getBlockByHashV1Json from '../data/rpc_response/get_block_by_hash_v1.json';

// era_end: null round-trips as an absent key (typedjson drops undefined optional
// members on stringify rather than re-emitting null); strip it before comparing.
const omitNullEraEnd = <T extends { era_end: unknown }>(
  header: T
): Omit<T, 'era_end'> => {
  const rest = { ...header };
  delete (rest as { era_end?: unknown }).era_end;
  return rest;
};

describe('Block', () => {
  describe('V2', () => {
    const { block, proofs } = getBlockByHashJson.result.block_with_signatures;

    it('round-trips BlockV2 through JSON: toJSON(fromJSON(x)) deep-equals the fixture', () => {
      const serializer = new TypedJSON(BlockV2);
      const parsed = serializer.parse(block.Version2);
      const reserialized = JSON.parse(serializer.stringify(parsed!));

      expect(reserialized).to.deep.equal({
        ...block.Version2,
        header: omitNullEraEnd(block.Version2.header)
      });
    });

    it('newBlockFromBlockWrapper builds a Block exposing the origin BlockV2', () => {
      const wrapper = new TypedJSON(BlockWrapper).parse(block)!;
      const parsedProofs = TypedJSON.parseAsArray(proofs, Proof);
      const built = Block.newBlockFromBlockWrapper(wrapper, parsedProofs);

      expect(built.hash.toHex()).to.equal(block.Version2.hash);
      expect(built.height).to.equal(block.Version2.header.height);
      expect(built.eraID).to.equal(block.Version2.header.era_id);
      expect(built.proposer.toJSON()).to.equal(block.Version2.header.proposer);
      expect(built.currentGasPrice).to.equal(
        block.Version2.header.current_gas_price
      );
      expect(built.lastSwitchBlockHash?.toHex()).to.equal(
        block.Version2.header.last_switch_block_hash
      );
      expect(built.eraEnd).to.be.undefined;
      expect(built.getBlockV2()).to.not.be.undefined;
      expect(built.getBlockV1()).to.be.undefined;
      expect(built.transactions).to.have.lengthOf(1);
      expect(built.transactions[0].hash.toHex()).to.equal(
        block.Version2.body.transactions['3'][0].Deploy
      );
      expect(built.proofs).to.deep.equal(parsedProofs);
    });
  });

  describe('V1', () => {
    const { block, proofs } = getBlockByHashV1Json.result.block_with_signatures;

    it('round-trips BlockV1 through JSON: toJSON(fromJSON(x)) deep-equals the fixture', () => {
      const serializer = new TypedJSON(BlockV1);
      const parsed = serializer.parse(block.Version1);
      const reserialized = JSON.parse(serializer.stringify(parsed!));

      expect(reserialized).to.deep.equal({
        ...block.Version1,
        header: omitNullEraEnd(block.Version1.header)
      });
    });

    it('newBlockFromBlockWrapper builds a Block exposing the origin BlockV1', () => {
      const wrapper = new TypedJSON(BlockWrapper).parse(block)!;
      const parsedProofs = TypedJSON.parseAsArray(proofs, Proof);
      const built = Block.newBlockFromBlockWrapper(wrapper, parsedProofs);

      expect(built.hash.toHex()).to.equal(block.Version1.hash);
      expect(built.height).to.equal(block.Version1.header.height);
      expect(built.eraID).to.equal(block.Version1.header.era_id);
      expect(built.proposer.toJSON()).to.equal(block.Version1.body.proposer);
      expect(built.currentGasPrice).to.equal(1); // V1 blocks are always gas price 1
      expect(built.lastSwitchBlockHash).to.be.null;
      expect(built.getBlockV1()).to.not.be.undefined;
      expect(built.getBlockV2()).to.be.undefined;
      expect(built.transactions).to.have.lengthOf(
        block.Version1.body.deploy_hashes.length +
          block.Version1.body.transfer_hashes.length
      );
      expect(built.proofs).to.deep.equal(parsedProofs);
    });

    it('newBlockFromBlockV1 produces the same Block as going through the wrapper', () => {
      const blockV1 = new TypedJSON(BlockV1).parse(block.Version1)!;
      const built = Block.newBlockFromBlockV1(blockV1);

      expect(built.hash.toHex()).to.equal(block.Version1.hash);
      expect(built.proofs).to.deep.equal(blockV1.proofs);
    });
  });
});
