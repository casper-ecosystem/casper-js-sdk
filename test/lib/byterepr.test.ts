// import { expect } from 'chai';
// import { Some } from "ts-results";
// import {
//   CLAccountHash,
//   // CLTypedAndToBytesHelper,
//   // CLTypeHelper,
//   CLBool,
//   CLI32,
//   CLI64,
//   CLOption,
//   CLList,
//   CLMap,
//   CLString,
//   CLTuple1,
//   CLTuple2,
//   CLTuple3,
//   CLU128,
//   CLU32,
//   CLU64,
//   CLU8,
//   CLUnit,
//   AccessRights,
//   CLValue,
//   CLKey,
//   CLPublicKey,
//   CLURef,
//   CLTuple1Type,
//   CLTuple2Type,
//   CLTuple3Type,
//   CLStringType,
//   CLU64Type,
//   CLBoolType,
//   CLListType,
//   CLU32Type,
//   CLMapType,
//   CLOptionType
// } from '../../src/lib/CLValue';
// import {
//   Keys,
// } from '../../src/lib';

// import {
//   decodeBase16,
// } from '../../src';

// import {
//   toBytesDeployHash,
//   toBytesI32,
//   toBytesI64,
//   toBytesString,
//   toBytesU128,
//   toBytesU32,
//   toBytesU64,
//   toBytesU8,
//   toBytesVector
// } from '../../src/lib/ByteConverters';

// describe(`numbers' toBytes`, () => {
//    it('should be able to serialize/deserialize u8', () => {
//      let bytesU8 = toBytesU8(10);
//      expect(bytesU8).to.deep.eq(Uint8Array.from([0x0a]));
//      expect(CLU8.fromBytes(bytesU8).unwrap().toBytes().unwrap()).to.deep.eq(
//        CLValue.u8(10).innerData().toBytes().unwrap()
//      );

//      bytesU8 = toBytesU8(255);
//      expect(bytesU8).to.deep.eq(Uint8Array.from([0xff]));
//      expect(CLU8.fromBytes(bytesU8).unwrap().toBytes().unwrap()).to.deep.eq(
//        CLValue.u8(255).innerData().toBytes().unwrap()
//      );

//      expect(() => toBytesU8(256)).to.throws('out');
//    });

//    it('should be able to serialize/deserialize u32', () => {
//      let bytesU32 = toBytesU32(0xf0e0_d0c0);
//      expect(bytesU32).to.deep.eq(Uint8Array.from([0xc0, 0xd0, 0xe0, 0xf0]));
//      expect(CLU32.fromBytes(bytesU32).unwrap().toBytes().unwrap()).to.deep.eq(
//        CLValue.u32(0xf0e0_d0c0).innerData().toBytes().unwrap()
//      );
//      bytesU32 = toBytesU32(100000);
//      expect(bytesU32).to.deep.eq(Uint8Array.from([160, 134, 1, 0]));
//      expect(CLU32.fromBytes(bytesU32).unwrap().toBytes().unwrap()).to.deep.eq(
//        CLValue.u32(100000).innerData().toBytes().unwrap()
//      );
//      bytesU32 = toBytesU32(0);
//      expect(bytesU32).to.deep.eq(Uint8Array.from([0, 0, 0, 0]));
//      expect(CLU32.fromBytes(bytesU32).unwrap().toBytes().unwrap()).to.deep.eq(
//        CLValue.u32(0).innerData().toBytes().unwrap()
//      );
//    });

//    it('should be able to serialize/deserialize i32', () => {
//      let bytesI32 = toBytesI32(-100000);
//      expect(bytesI32).to.deep.eq(Uint8Array.from([96, 121, 254, 255]));
//      expect(CLI32.fromBytes(bytesI32).unwrap().toBytes().unwrap()).to.deep.eq(
//        CLValue.i32(-100000).innerData().toBytes().unwrap()
//      );
//      bytesI32 = toBytesI32(100000);
//      expect(bytesI32).to.deep.eq(Uint8Array.from([160, 134, 1, 0]));
//      expect(CLI32.fromBytes(bytesI32).unwrap().toBytes().unwrap()).to.deep.eq(
//        CLValue.i32(100000).innerData().toBytes().unwrap()
//      );
//      bytesI32 = toBytesI32(0);
//      expect(bytesI32).to.deep.eq(Uint8Array.from([0, 0, 0, 0]));
//      expect(CLI32.fromBytes(bytesI32).unwrap().toBytes().unwrap()).to.deep.eq(
//        CLValue.i32(0).innerData().toBytes().unwrap()
//      );
//      bytesI32 = toBytesI32(-1);
//      expect(bytesI32).to.deep.eq(Uint8Array.from([255, 255, 255, 255]));
//      expect(CLI32.fromBytes(bytesI32).unwrap().toBytes().unwrap()).to.deep.eq(
//        CLValue.i32(-1).innerData().toBytes().unwrap()
//      );
//    });

//    it('should be able to serialize/deserialize i64', () => {
//      let bytesI64 = toBytesI64('198572906121139257');
//      expect(bytesI64).to.deep.eq(
//        Uint8Array.from([57, 20, 94, 139, 1, 121, 193, 2])
//      );
//      expect(CLI64.fromBytes(bytesI64).unwrap().toBytes().unwrap()).to.deep.eq(
//        CLValue.i64('198572906121139257').innerData().toBytes().unwrap()
//      );
//      bytesI64 = toBytesI64('-4009477689550808');
//      expect(bytesI64).to.deep.eq(
//        Uint8Array.from([40, 88, 148, 186, 102, 193, 241, 255])
//      );
//      expect(CLI64.fromBytes(bytesI64).unwrap().toBytes().unwrap()).to.deep.equal(
//        CLValue.i64('-4009477689550808').innerData().toBytes().unwrap()
//      );
//    });

//    it('should be able to serialize/deserialize u64', () => {
//      let bytesU64 = toBytesU64('14198572906121139257');
//      expect(bytesU64).to.deep.eq(
//        Uint8Array.from([57, 20, 214, 178, 212, 118, 11, 197])
//      );
//      expect(CLU64.fromBytes(bytesU64).unwrap().toBytes().unwrap()).to.deep.equal(
//        CLValue.u64('14198572906121139257').innerData().toBytes().unwrap()
//      );
//      bytesU64 = toBytesU64('9834009477689550808');
//      expect(bytesU64).to.deep.eq(
//        Uint8Array.from([216, 167, 130, 99, 132, 107, 121, 136])
//      );
//      expect(CLU64.fromBytes(bytesU64).unwrap().toBytes().unwrap()).to.deep.equal(
//        CLValue.u64('9834009477689550808').innerData().toBytes().unwrap()
//      );
//    });

//    it('should be able to serialize/deserialize u128', () => {
//      let bytesU128 = toBytesU128(100000);
//      expect(bytesU128).to.deep.eq(Uint8Array.from([3, 160, 134, 1]));
//      expect(CLU128.fromBytes(bytesU128).unwrap().toBytes().unwrap()).to.deep.equal(
//        CLValue.u128(100000).innerData().toBytes().unwrap()
//      );
//      bytesU128 = toBytesU128(0xf0e0_d0c0_0000);
//      expect(bytesU128).to.deep.eq(
//        Uint8Array.from([6, 0, 0, 0xc0, 0xd0, 0xe0, 0xf0])
//      );
//      expect(CLU128.fromBytes(bytesU128).unwrap().toBytes().unwrap()).to.deep.equal(
//        CLValue.u128(0xf0e0_d0c0_0000).innerData().toBytes().unwrap()
//      );
//      bytesU128 = toBytesU128(0x0000_f0e0_d0c0_0000);
//      expect(bytesU128).to.deep.eq(
//        Uint8Array.from([6, 0, 0, 0xc0, 0xd0, 0xe0, 0xf0])
//      );
//      expect(CLU128.fromBytes(bytesU128).unwrap().toBytes().unwrap()).to.deep.equal(
//        CLValue.u128(0x0000_f0e0_d0c0_0000).innerData().toBytes().unwrap()
//      );
//    });

//    it('should be able to serialize/deserialize utf8 string', () => {
//      const bytesString = toBytesString('test_测试');
//      expect(bytesString).to.deep.eq(
//        Uint8Array.from([
//          11,
//          0,
//          0,
//          0,
//          116,
//          101,
//          115,
//          116,
//          95,
//          230,
//          181,
//          139,
//          232,
//          175,
//          149
//        ])
//      );
//      expect(CLString.fromBytes(bytesString).unwrap().toBytes().unwrap()).to.deep.equal(
//        CLValue.string('test_测试').innerData().toBytes().unwrap()
//      );
//    });

//    it('should be able to serialize/deserialize unit', () => {
//      const unit = CLValue.unit().innerData();
//      const bytesUnit = unit.toBytes().unwrap();
//      expect(bytesUnit).to.deep.eq(Uint8Array.from([]));
//      expect(CLUnit.fromBytes(bytesUnit).unwrap().toBytes().unwrap()).to.deep.equal(
//        CLValue.unit().innerData().toBytes().unwrap()
//      );
//    });

//   it('should serialize a vector of CLValue correctly', () => {
//     const truth = decodeBase16(
//       '0100000015000000110000006765745f7061796d656e745f70757273650a'
//     );
//     const bytes = toBytesVector([CLValue.string('get_payment_purse')]);
//     expect(bytes).to.deep.eq(truth);
//   });

//   it('should serialize/deserialize URef variant of Key correctly', () => {
//     const urefAddr =
//       '2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a';
//     const truth = decodeBase16(
//       '022a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a07'
//     );
//     const uref = new CLURef(decodeBase16(urefAddr), AccessRights.READ_ADD_WRITE);
//     const bytes = new CLKey(uref).toBytes().unwrap();
//     expect(bytes).to.deep.eq(truth);

//     const bytes2 = new CLKey(
//       CLURef.fromFormattedStr(
//         'uref-d93dfedfc13180a0ea188841e64e0a1af718a733216e7fae4909dface372d2b0-007'
//       )
//     ).toBytes().unwrap();
//     expect(bytes2).to.deep.eq(
//       Uint8Array.from([
//         2,
//         217,
//         61,
//         254,
//         223,
//         193,
//         49,
//         128,
//         160,
//         234,
//         24,
//         136,
//         65,
//         230,
//         78,
//         10,
//         26,
//         247,
//         24,
//         167,
//         51,
//         33,
//         110,
//         127,
//         174,
//         73,
//         9,
//         223,
//         172,
//         227,
//         114,
//         210,
//         176,
//         7
//       ])
//     );

//     expect(CLKey.fromBytes(bytes).unwrap().value().data).to.deep.equal(
//       decodeBase16(urefAddr)
//     );
//     expect(CLKey.fromBytes(bytes).unwrap().value().accessRights).to.deep.equal(
//       AccessRights.READ_ADD_WRITE
//     );
//   });

//   it('should serialize/deserialize Hash variant of Key correctly', () => {
//     const keyHash = new CLKey(Uint8Array.from(Array(32).fill(42)));
//     // prettier-ignore
//     const expectedBytes = Uint8Array.from([
//       1, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42
//     ]);
//     expect(keyHash.toBytes().unwrap()).to.deep.eq(expectedBytes);
//     expect(CLKey.fromBytes(expectedBytes).unwrap()).to.deep.eq(keyHash);
//   });

//   it('should serialize/deserialize Account variant of Key correctly', () => {
//     const keyAccount = new CLKey(
//       new CLAccountHash(Uint8Array.from(Array(32).fill(42)))
//     );
//     // prettier-ignore
//     const expectedBytes = Uint8Array.from([
//       0, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42
//     ]);

//     expect(keyAccount.toBytes().unwrap()).to.deep.eq(expectedBytes);
//     expect(CLKey.fromBytes(expectedBytes).unwrap()).to.deep.eq(keyAccount);
//   });

//   it('should serialize DeployHash correctly', () => {
//     const deployHash = decodeBase16(
//       '7e83be8eb783d4631c3239eee08e95f33396210e23893155b6fb734e9b7f0df7'
//     );
//     const bytes = toBytesDeployHash(deployHash);
//     expect(bytes).to.deep.eq(
//       Uint8Array.from([
//         126,
//         131,
//         190,
//         142,
//         183,
//         131,
//         212,
//         99,
//         28,
//         50,
//         57,
//         238,
//         224,
//         142,
//         149,
//         243,
//         51,
//         150,
//         33,
//         14,
//         35,
//         137,
//         49,
//         85,
//         182,
//         251,
//         115,
//         78,
//         155,
//         127,
//         13,
//         247
//       ])
//     );
//   });

//   it('should serialize/deserialize URef correctly', () => {
//     const uref = CLURef.fromFormattedStr(
//       'uref-ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff-007'
//     );
//     // prettier-ignore
//     const expectedBytes = Uint8Array.from([255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 7]);
//     expect(uref.toBytes().unwrap()).to.deep.equal(expectedBytes);
//     expect(CLURef.fromBytes(expectedBytes).unwrap()).to.deep.eq(uref);
//   });

//   it('should serialize/deserialize Tuple1 correctly', () => {
//     const value1 = CLValue.string('hello').innerData();
//     const tuple = CLValue.tuple1(value1).innerData();
//     // prettier-ignore
//     const expectedBytes = Uint8Array.from([5, 0, 0, 0, 104, 101, 108, 108, 111]);
//     expect(tuple.toBytes().unwrap()).to.deep.equal(expectedBytes);

//     expect(
//       CLTuple1.fromBytes(
//         expectedBytes,
//         new CLTuple1Type([new CLStringType()])
//       )
//         .unwrap()
//         .clType()
//     ).to.deep.equal(tuple.clType());

//     expect(
//       CLTuple1.fromBytes(
//         expectedBytes,
//         new CLTuple1Type([new CLStringType()])
//       )
//         .unwrap()
//         .toBytes()
//         .unwrap()
//     ).to.deep.equal(tuple.toBytes().unwrap());
//   });

//   it('should serialize/deserialize Tuple2 correctly', () => {
//     const value1 = new CLString('hello');
//     const value2 = new CLU64(123456);
//     const tuple2 = new CLTuple2([value1, value2]);
//     // prettier-ignore
//     const expectedBytes = Uint8Array.from(
//       [5, 0, 0, 0, 104, 101, 108, 108, 111, 64, 226, 1, 0, 0, 0, 0, 0]);
//     expect(tuple2.toBytes().unwrap()).to.deep.equal(expectedBytes);

//     expect(
//       CLTuple2.fromBytes(
//         expectedBytes,
//         new CLTuple2Type([new CLStringType(), new CLU64Type()]),
//       )
//         .unwrap()
//         .clType()
//     ).to.deep.equal(tuple2.clType());

//     expect(
//       CLTuple2.fromBytes(
//         expectedBytes,
//         new CLTuple2Type([new CLStringType(), new CLU64Type()]),
//       )
//         .unwrap()
//         .toBytes()
//         .unwrap()
//     ).to.deep.equal(tuple2.toBytes().unwrap());
//   });

//   it('should serialize/deserialize Tuple3 correctly', () => {
//     const value1 = new CLString('hello');
//     const value2 = new CLU64(123456);
//     const value3 = new CLBool(true);
//     const tuple3 = new CLTuple3([value1, value2, value3]);
//     // prettier-ignore
//     const expectedBytes = Uint8Array.from(
//       [5, 0, 0, 0, 104, 101, 108, 108, 111, 64, 226, 1, 0, 0, 0, 0, 0, 1]
//     );
//     expect(tuple3.toBytes().unwrap()).to.deep.equal(expectedBytes);

//     expect(
//       CLTuple3.fromBytes(
//         expectedBytes,
//         new CLTuple3Type([new CLStringType(), new CLU64Type(), new CLBoolType()])
//       )
//         .unwrap()
//         .clType()
//     ).to.deep.equal(tuple3.clType());

//     expect(
//       CLTuple3.fromBytes(
//         expectedBytes,
//         new CLTuple3Type([new CLStringType(), new CLU64Type(), new CLBoolType()])
//       )
//         .unwrap()
//         .toBytes()
//         .unwrap()
//     ).to.deep.equal(tuple3.toBytes().unwrap());
//   });

//   it('should serialize/deserialize List correctly', () => {
//     const list = new CLList([
//       new CLU32(1),
//       new CLU32(2),
//       new CLU32(3),
//     ]);
//     // prettier-ignore
//     const expectedBytes = Uint8Array.from([3, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 3, 0, 0, 0]);
//     expect(list.toBytes().unwrap()).to.deep.eq(expectedBytes);

//     expect(
//       CLList.fromBytes(expectedBytes, new CLListType(new CLU32Type()))
//         .unwrap()
//         .toBytes()
//         .unwrap()
//     ).to.deep.eq(list.toBytes().unwrap());
//   });

//   it('should serialze/deserialize Map correctly', () => {
//     const map = new CLMap([
//       [
//         new CLString('test1'),
//         new CLList([
//           new CLU64(1),
//           new CLU64(2)
//         ]),
//       ],
//       [
//         new CLString('test2'),
//         new CLList([
//           new CLU64(3),
//           new CLU64(4)
//         ]),
//       ],
//     ]);
//     // prettier-ignore
//     const expectBytes = Uint8Array.from([2, 0, 0, 0, 5, 0, 0, 0, 116, 101, 115, 116, 49, 2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 116, 101, 115, 116, 50, 2, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0])

//     expect(map.toBytes().unwrap()).to.deep.eq(expectBytes);

//     expect(
//       CLMap.fromBytes(
//         expectBytes,
//         new CLMapType(
//           [new CLStringType(),
//           new CLListType(new CLU64Type())]
//         ),
//       )
//         .unwrap()
//         .toBytes()
//         .unwrap()
//     ).to.deep.eq(expectBytes);
//   });

//   it('should serialize/deserialize Option correctly', () => {
//     const opt = new CLOption(
//       Some(new CLString('test'))
//     );
//     const expectBytes = Uint8Array.from([1, 4, 0, 0, 0, 116, 101, 115, 116]);
//     expect(opt.toBytes().unwrap()).to.deep.eq(expectBytes);

//     expect(
//       CLOption.fromBytes(expectBytes, new CLOptionType(new CLStringType()))
//         .unwrap()
//         .toBytes()
//         .unwrap()
//     ).to.deep.eq(expectBytes);
//   });

//   it('should serialize ByteArray correctly', () => {
//     const byteArray = Uint8Array.from(Array(32).fill(42));
//     const bytes = CLValue.byteArray(byteArray).toBytes().unwrap();
//     expect(bytes).to.deep.eq(
//       Uint8Array.from([
//         32,
//         0,
//         0,
//         0,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         15,
//         32,
//         0,
//         0,
//         0
//       ])
//     );
//   });

//   it('should serialize PublicKey correctly', () => {
//     const publicKey = Uint8Array.from(Array(32).fill(42));
//     const bytes = CLPublicKey.fromEd25519(publicKey).toBytes().unwrap();
//     expect(bytes).to.deep.eq(
//       Uint8Array.from([
//         1,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42,
//         42
//       ])
//     );
//   });

//   it('should compute hex from PublicKey correctly', () => {
//     const ed25519Account = Keys.Ed25519.new();
//     const ed25519AccountHex = ed25519Account.accountHex();
//     expect(CLPublicKey.fromHex(ed25519AccountHex)).to.deep.equal(
//       ed25519Account.publicKey
//     );

//     const secp256K1Account = Keys.Secp256K1.new();
//     const secp256K1AccountHex = secp256K1Account.accountHex();
//     expect(CLPublicKey.fromHex(secp256K1AccountHex)).to.deep.equal(
//       secp256K1Account.publicKey
//     );
//   });
// });
