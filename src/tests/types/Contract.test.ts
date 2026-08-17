import { describe, it, expect } from 'vitest';
import { TypedJSON } from 'typedjson';

import { Contract } from '../../types';
import { stateItemResultV1Json, stateItemResultV2Json } from '../data';
import { expectJsonRoundTrip } from '../roundtrip';

describe('Contract', () => {
  describe('1.x (old, flat entry_points) fixture', () => {
    const contractJson = stateItemResultV1Json.stored_value.Contract;

    it('parses package hash, wasm hash, named keys and entry points', () => {
      const parsed = new TypedJSON(Contract).parse(contractJson)!;

      expect(parsed.contractPackageHash.toPrefixedString()).to.equal(
        contractJson.contract_package_hash
      );
      expect(parsed.contractWasmHash.toPrefixedWasmString()).to.equal(
        contractJson.contract_wasm_hash
      );
      expect(parsed.protocolVersion).to.equal(contractJson.protocol_version);
      expect(parsed.namedKeys).to.have.lengthOf(contractJson.named_keys.length);
      expect(parsed.entryPoints).to.have.lengthOf(
        contractJson.entry_points.length
      );
      expect(parsed.entryPoints[0].entryPoint.name).to.equal(
        contractJson.entry_points[0].name
      );
    });
  });

  describe('2.x (wrapped entry_points) fixture', () => {
    const contractJson = stateItemResultV2Json.stored_value.Contract;

    it('round-trips the whole fixture through JSON, group-restricted entry points included', () => {
      expect(
        contractJson.entry_points.some(
          (ep: any) =>
            typeof ep.entry_point.access === 'object' &&
            ep.entry_point.access !== null &&
            'Groups' in ep.entry_point.access
        )
      ).to.be.true;

      expectJsonRoundTrip(new TypedJSON(Contract), contractJson);
    });

    // The fixture is real 2.x node output, so `Groups` is the wire casing.
    // `fromJSON` also accepts lowercase, which hides an asymmetric `toJSON`.
    it('re-serializes group-restricted access with the wire "Groups" casing', () => {
      const groupRestrictedEntry = contractJson.entry_points.find(
        (ep: any) =>
          typeof ep.entry_point.access === 'object' &&
          ep.entry_point.access !== null &&
          'Groups' in ep.entry_point.access
      );
      expect(groupRestrictedEntry).to.not.be.undefined;

      const access = groupRestrictedEntry!.entry_point.access;
      if (typeof access === 'string' || !('Groups' in access)) {
        throw new Error('expected a group-restricted access fixture');
      }

      const parsed = new TypedJSON(Contract).parse(contractJson)!;
      const entryPoint = parsed.entryPoints.find(
        ep => ep.entryPoint.name === groupRestrictedEntry!.entry_point.name
      )!;

      expect(entryPoint.entryPoint.access.groups).to.deep.equal(access.Groups);
      expect(entryPoint.entryPoint.access.toJSON()).to.deep.equal({
        Groups: access.Groups
      });
    });

    it('parses package hash, wasm hash, named keys and entry points', () => {
      const parsed = new TypedJSON(Contract).parse(contractJson)!;

      expect(parsed.contractPackageHash.toPrefixedString()).to.equal(
        contractJson.contract_package_hash
      );
      expect(parsed.contractWasmHash.toPrefixedWasmString()).to.equal(
        contractJson.contract_wasm_hash
      );
      expect(parsed.entryPoints).to.have.lengthOf(
        contractJson.entry_points.length
      );
      expect(parsed.entryPoints[0].entryPoint.name).to.equal(
        contractJson.entry_points[0].entry_point.name
      );
    });
  });
});
