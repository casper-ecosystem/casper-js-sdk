import { TypedJSON } from 'typedjson';
import { expect } from 'chai';

import {
  StoredValue,
  DelegatorAllocation,
  ValidatorAllocation,
  NamedEntryPoint
} from '../../types';
import {
  stateItemResultV1Json,
  stateItemResultV2Json,
  eraInfoResultJson
} from '../data';

describe('Test StoredValue', () => {
  describe('era_info', () => {
    let storedValue: StoredValue | undefined;

    beforeEach(() => {
      storedValue = new TypedJSON(StoredValue).parse(eraInfoResultJson);
    });

    it('should parse the EraInfo JSON into a StoredValue instance', () => {
      expect(storedValue).to.be.an.instanceOf(StoredValue);
      expect(storedValue?.eraInfo).to.exist;
    });

    it('should contain valid seigniorage allocations', () => {
      const allocations = storedValue?.eraInfo?.seigniorageAllocations;
      expect(allocations, 'Seigniorage allocations should exist').to.exist;
      expect(allocations).to.have.lengthOf(20);
    });

    it('should ensure each allocation is an instance of the correct class', () => {
      const allocations = storedValue?.eraInfo?.seigniorageAllocations || [];
      allocations.forEach((allocation, index) => {
        if (allocation.delegator) {
          expect(allocation.delegator).to.be.an.instanceOf(DelegatorAllocation);
        } else if (allocation.validator) {
          expect(allocation.validator).to.be.an.instanceOf(ValidatorAllocation);
        } else {
          expect.fail(
            `Allocation at index ${index} does not have a delegator or validator property`
          );
        }
      });
    });
  });

  describe('entry_points', () => {
    describe('error handling', () => {
      it('should throw an error when provided with null JSON', () => {
        expect(() => NamedEntryPoint.fromJSON(null)).to.throw(
          'Invalid JSON provided for NamedEntryPoint'
        );
      });
    });

    describe('old structure (1.x format)', () => {
      let storedValue: StoredValue;
      let jsonEntryPoint: any;

      before(() => {
        storedValue = new TypedJSON(StoredValue).parse(
          stateItemResultV1Json.stored_value
        ) as StoredValue;
        jsonEntryPoint =
          stateItemResultV1Json.stored_value.Contract.entry_points[0];
      });

      it('should parse and map the entry point correctly for old structure', () => {
        const entryPoint = storedValue!.contract!.entryPoints[0]!;
        expect(entryPoint).to.exist;
        expect(entryPoint).to.be.instanceOf(NamedEntryPoint);

        expect(entryPoint.entryPoint.ret.toJSON()).to.deep.equal(
          jsonEntryPoint.ret
        );
        expect(entryPoint.entryPoint.name).to.deep.equal(jsonEntryPoint.name);
        expect(entryPoint.entryPoint.access.toJSON()).to.deep.equal(
          jsonEntryPoint.access
        );
        expect(entryPoint.entryPoint.access.isPublic).to.be.true;
        expect(entryPoint.entryPoint.entryPointType).to.deep.equal(
          jsonEntryPoint.entry_point_type
        );
      });
    });

    describe('Template access', () => {
      it('should correctly deserialize Template access in EntryPoint', () => {
        const json = {
          ret: 'U256',
          args: [],
          name: 'total_supply',
          access: 'Template',
          entry_point_type: 'Called'
        };

        const entryPoint = NamedEntryPoint.fromJSON(json);

        expect(entryPoint).to.exist;
        expect(entryPoint.entryPoint.access.isTemplate).to.be.true;
        expect(entryPoint.entryPoint.access.isPublic).to.be.false;
        expect(entryPoint.entryPoint.access.groups).to.be.null;
      });
    });

    describe('new structure (2.x format)', () => {
      let storedValue: StoredValue;
      let jsonEntryPoint: any;

      before(() => {
        storedValue = new TypedJSON(StoredValue).parse(
          stateItemResultV2Json.stored_value
        ) as StoredValue;
        jsonEntryPoint =
          stateItemResultV2Json.stored_value.Contract.entry_points[0];
      });

      it('should parse and map the entry point correctly for new structure', () => {
        const entryPoint = storedValue!.contract!.entryPoints[0]!;
        expect(entryPoint).to.exist;
        expect(entryPoint).to.be.instanceOf(NamedEntryPoint);

        expect(entryPoint.entryPoint.ret.toJSON()).to.deep.equal(
          jsonEntryPoint.entry_point.ret
        );
        expect(entryPoint.entryPoint.name).to.deep.equal(
          jsonEntryPoint.entry_point.name
        );
        expect(entryPoint.entryPoint.access.isPublic).to.be.true;
        expect(entryPoint.entryPoint.access.toJSON()).to.deep.equal(
          jsonEntryPoint.entry_point.access
        );
        expect(entryPoint.entryPoint.entryPointType).to.deep.equal(
          jsonEntryPoint.entry_point.entry_point_type
        );
      });
    });
  });
});
