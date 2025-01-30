import { expect } from 'chai';
import { CLValueTuple2 } from './Tuple2';
import { CLValueParser } from './Parser';
import {
  CLTypeBool,
  CLTypeInt32,
  CLTypeString,
  CLTypeTuple1,
  CLTypeTuple2,
  CLTypeTuple3
} from './cltype';
import { CLValue } from './CLValue';

describe('CLTuple', () => {
  it('Tuple2 should return proper clType', () => {
    const myBool = CLValue.newCLValueBool(false);
    const myStr = CLValue.newCLString('ABC');
    const myTup = CLValue.newCLTuple2(myBool, myStr);

    expect(myTup.getType().toString()).to.be.eq('Tuple2 (Bool, String)');
  });

  it('Should be able to create tuple with proper values - correct by construction', () => {
    const myTup2 = CLValue.newCLTuple2(
      CLValue.newCLValueBool(true),
      CLValue.newCLValueBool(false)
    );

    expect(myTup2.tuple2).to.be.an.instanceof(CLValueTuple2);
  });

  it('Should be able to return proper values by calling .value() on Tuple', () => {
    const myBool = CLValue.newCLValueBool(false);
    const myTuple = CLValue.newCLTuple1(myBool);

    expect(myTuple.tuple1?.value()).to.be.deep.eq(myBool);
  });

  it('Should run toBytes() / fromBytes()', () => {
    const myTup1 = CLValue.newCLTuple1(CLValue.newCLValueBool(true));
    const myTup2 = CLValue.newCLTuple2(
      CLValue.newCLValueBool(false),
      CLValue.newCLInt32(555)
    );
    const myTup3 = CLValue.newCLTuple3(
      CLValue.newCLInt32(555),
      CLValue.newCLString('ABC'),
      CLValue.newCLString('XYZ')
    );

    const myTup1Bytes = myTup1.bytes();
    const myTup2Bytes = myTup2.bytes();
    const myTup3Bytes = myTup3.bytes();

    expect(
      CLValueParser.fromBytesByType(myTup1Bytes, new CLTypeTuple1(CLTypeBool))
        .result
    ).to.be.deep.eq(myTup1);

    expect(
      CLValueParser.fromBytesByType(
        myTup2Bytes,
        new CLTypeTuple2(CLTypeBool, CLTypeInt32)
      ).result
    ).to.be.deep.eq(myTup2);

    expect(
      CLValueParser.fromBytesByType(
        myTup3Bytes,
        new CLTypeTuple3(CLTypeInt32, CLTypeString, CLTypeString)
      ).result
    ).to.be.deep.eq(myTup3);
  });

  it('fromJSON() / toJSON()', () => {
    const arr = CLValue.newCLByteArray(Uint8Array.from([1, 2, 3]));
    const arr2 = CLValue.newCLByteArray(
      Uint8Array.from([
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20,
        21,
        22,
        23,
        24,
        25,
        26,
        27,
        28,
        29,
        30,
        31,
        32,
        33,
        34
      ])
    );

    const myTup1 = CLValue.newCLTuple1(arr);
    const myTup2 = CLValue.newCLTuple2(arr, arr2);
    const myTup3 = CLValue.newCLTuple3(arr, arr2, CLValue.newCLString('ABC'));

    const myTup1JSON = CLValueParser.toJSON(myTup1);
    const expectedMyTup1JSON = JSON.parse(
      `{"bytes":"010203","cl_type":{"Tuple1":[{"ByteArray":3}]}}`
    );

    const myTup2JSON = CLValueParser.toJSON(myTup2);
    const expectedMyTup2JSON = JSON.parse(
      `{"bytes":"0102030102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122","cl_type":{"Tuple2":[{"ByteArray":3},{"ByteArray":34}]}}`
    );

    const myTup3JSON = CLValueParser.toJSON(myTup3);
    const expectedMyTup3JSON = JSON.parse(
      `{"bytes":"0102030102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20212203000000414243","cl_type":{"Tuple3":[{"ByteArray":3},{"ByteArray":34},"String"]}}`
    );

    expect(myTup1JSON).to.be.deep.eq(expectedMyTup1JSON);
    expect(CLValueParser.fromJSON(expectedMyTup1JSON)).to.be.deep.eq(myTup1);

    expect(myTup2JSON).to.be.deep.eq(expectedMyTup2JSON);
    expect(CLValueParser.fromJSON(expectedMyTup2JSON)).to.be.deep.eq(myTup2);

    expect(myTup3JSON).to.be.deep.eq(expectedMyTup3JSON);
    expect(CLValueParser.fromJSON(expectedMyTup3JSON)).to.be.deep.eq(myTup3);
  });

  it('fromJSON() / toJSON()', () => {
    const myTup1 = CLValue.newCLTuple1(CLValue.newCLValueBool(true));
    const myTup2 = CLValue.newCLTuple2(
      CLValue.newCLValueBool(false),
      CLValue.newCLInt32(555)
    );
    const myTup3 = CLValue.newCLTuple3(
      CLValue.newCLInt32(555),
      CLValue.newCLString('ABC'),
      CLValue.newCLString('XYZ')
    );

    const myTup1JSON = CLValueParser.toJSON(myTup1);
    const myTup2JSON = CLValueParser.toJSON(myTup2);
    const myTup3JSON = CLValueParser.toJSON(myTup3);

    const expectedMyTup1JSON = JSON.parse(
      '{"bytes":"01","cl_type":{"Tuple1":["Bool"]}}'
    );
    const expectedMyTup2JSON = JSON.parse(
      '{"bytes":"002b020000","cl_type":{"Tuple2":["Bool","I32"]}}'
    );
    const expectedMyTup3JSON = JSON.parse(
      '{"bytes":"2b020000030000004142430300000058595a","cl_type":{"Tuple3":["I32","String","String"]}}'
    );

    expect(CLValueParser.fromJSON(expectedMyTup1JSON)).to.be.deep.eq(myTup1);

    expect(CLValueParser.fromJSON(expectedMyTup2JSON)).to.be.deep.eq(myTup2);

    expect(CLValueParser.fromJSON(expectedMyTup3JSON)).to.be.deep.eq(myTup3);

    expect(myTup1JSON).to.be.deep.eq(expectedMyTup1JSON);
    expect(myTup2JSON).to.be.deep.eq(expectedMyTup2JSON);
    expect(myTup3JSON).to.be.deep.eq(expectedMyTup3JSON);
  });
});
