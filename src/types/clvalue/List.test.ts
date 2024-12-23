import { expect } from 'chai';
import { CLTypeBool, CLTypeList, CLTypeUInt32 } from './cltype';
import { concat } from '@ethersproject/bytes';
import { toBytesU32 } from '../ByteConverters';
import { CLValueUInt32 } from './Numeric/Uint32';
import { CLValueList } from './List';
import { BigNumber } from '@ethersproject/bignumber';
import { CLValue } from './CLValue';
import { CLValueBool } from './Bool';

describe('CLValueList', () => {
  let typeList: CLTypeList;
  let clValueList: CLValueList;
  let element1: CLValue;
  let element2: CLValue;

  beforeEach(() => {
    typeList = new CLTypeList(new CLTypeList(CLTypeUInt32));
    element1 = CLValueUInt32.newCLUInt32(BigNumber.from(1));
    element2 = CLValueUInt32.newCLUInt32(BigNumber.from(2));
    clValueList = new CLValueList(typeList, [element1, element2]);
  });

  it('should initialize with type and elements', () => {
    expect(clValueList.type).to.equal(typeList);
    expect(clValueList.elements).to.deep.equal([element1, element2]);
  });

  it('should return correct byte representation', () => {
    const expectedBytes = concat([
      toBytesU32(2),
      element1.bytes(),
      element2.bytes()
    ]);
    expect(clValueList.bytes()).to.deep.equal(expectedBytes);
  });

  it('should return correct string representation', () => {
    expect(clValueList.toString()).to.equal('["1","2"]');
  });

  it('should return false for non-empty list when calling isEmpty()', () => {
    expect(clValueList.isEmpty()).to.be.false;
  });

  it('should return true for empty list when calling isEmpty()', () => {
    const emptyList = new CLValueList(typeList);
    expect(emptyList.isEmpty()).to.be.true;
  });

  it('should add an element to the list when calling append()', () => {
    const element3 = CLValueUInt32.newCLUInt32(BigNumber.from(3));
    clValueList.append(element3);
    expect(clValueList.elements).to.deep.equal([element1, element2, element3]);
  });

  it('should remove an element at specified index when calling remove()', () => {
    clValueList.remove(0);
    expect(clValueList.elements).to.deep.equal([element2]);
  });

  it('should remove and return the last element when calling pop()', () => {
    const lastElement = clValueList.pop();
    expect(lastElement).to.equal(element2);
    expect(clValueList.elements).to.deep.equal([element1]);
  });

  it('should return correct number of elements when calling size()', () => {
    expect(clValueList.size()).to.equal(2);
  });

  it('should set the element at specified index when calling set()', () => {
    const element3 = CLValueUInt32.newCLUInt32(BigNumber.from(3));
    clValueList.set(1, element3);
    expect(clValueList.elements[1]).to.equal(element3);
  });

  it('should throw error if index is out of bounds in set()', () => {
    const element3 = CLValueUInt32.newCLUInt32(BigNumber.from(3));
    expect(() => clValueList.set(2, element3)).to.throw(
      'List index out of bounds.'
    );
  });

  it('should return the element at specified index when calling get()', () => {
    expect(clValueList.get(1)).to.equal(element2);
  });

  it('should throw error if index is out of bounds in get()', () => {
    expect(() => clValueList.get(2)).to.throw('List index out of bounds.');
  });

  it('should return JSON representation of the list when calling toJSON()', () => {
    expect(clValueList.toJSON()).to.deep.equal(['1', '2']);
  });

  it('should create a CLValue instance with a List value when calling newCLList()', () => {
    const newList = CLValueList.newCLList(CLTypeUInt32);
    expect(newList.list).to.be.instanceOf(CLValueList);
  });
});

describe('CLValueList with boolean values', () => {
  let boolTypeList: CLTypeList;
  let clValueBoolList: CLValueList;
  let trueElement: CLValue;
  let falseElement: CLValue;

  beforeEach(() => {
    boolTypeList = new CLTypeList(CLTypeBool);
    trueElement = CLValueBool.newCLValueBool(true);
    falseElement = CLValueBool.newCLValueBool(false);
    clValueBoolList = new CLValueList(boolTypeList, [
      trueElement,
      falseElement
    ]);
  });

  it('should initialize with type and boolean elements', () => {
    expect(clValueBoolList.type).to.equal(boolTypeList);
    expect(clValueBoolList.elements).to.deep.equal([trueElement, falseElement]);
  });

  it('should return correct byte representation for boolean list', () => {
    const expectedBytes = concat([
      toBytesU32(2),
      trueElement.bytes(),
      falseElement.bytes()
    ]);
    expect(clValueBoolList.bytes()).to.deep.equal(expectedBytes);
  });

  it('should return correct string representation for boolean list', () => {
    expect(clValueBoolList.toString()).to.equal('["true","false"]');
  });

  it('should add a boolean element to the list when calling append()', () => {
    const newElement = CLValueBool.newCLValueBool(true);
    clValueBoolList.append(newElement);
    expect(clValueBoolList.elements).to.deep.equal([
      trueElement,
      falseElement,
      newElement
    ]);
  });

  it('should remove and return the last boolean element when calling pop()', () => {
    const lastElement = clValueBoolList.pop();
    expect(lastElement).to.equal(falseElement);
    expect(clValueBoolList.elements).to.deep.equal([trueElement]);
  });

  it('should throw error if index is out of bounds in set() for boolean list', () => {
    const newElement = CLValueBool.newCLValueBool(false);
    expect(() => clValueBoolList.set(2, newElement)).to.throw(
      'List index out of bounds.'
    );
  });

  it('should construct a CLValueList from byte representation of booleans', () => {
    const bytes = concat([
      toBytesU32(2),
      trueElement.bytes(),
      falseElement.bytes()
    ]);
    const parsedList = CLValueList.fromBytes(bytes, boolTypeList);

    expect(parsedList.result.elements.length).to.equal(2);
    expect(parsedList.result.elements[0].toString()).to.equal('true');
    expect(parsedList.result.elements[1].toString()).to.equal('false');
  });
});
