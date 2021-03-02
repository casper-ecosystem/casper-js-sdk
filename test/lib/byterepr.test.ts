import { expect } from 'chai';
import {
  AccountHash,
  CLTypedAndToBytesHelper,
  CLTypeHelper,
  decodeBase16,
  I32,
  I64,
  Option,
  List,
  MapValue,
  StringValue,
  Tuple1,
  Tuple2,
  Tuple3,
  U128,
  U32,
  U64,
  U8,
  Unit
} from '../../src';
import {
  AccessRights,
  CLValue,
  KeyValue,
  PublicKey,
  Keys,
  URef
} from '../../src/lib';
import {
  toBytesDeployHash,
  toBytesI32,
  toBytesI64,
  toBytesString,
  toBytesU128,
  toBytesU32,
  toBytesU64,
  toBytesU8,
  toBytesVecT
} from '../../src/lib/byterepr';

describe(`numbers' toBytes`, () => {
  it('should be able to serialize/deserialize u8', () => {
    let bytesU8 = toBytesU8(10);
    expect(bytesU8).to.deep.eq(Uint8Array.from([0x0a]));
    expect(U8.fromBytes(bytesU8).value().toBytes()).to.deep.eq(
      CLTypedAndToBytesHelper.u8(10).toBytes()
    );

    bytesU8 = toBytesU8(255);
    expect(bytesU8).to.deep.eq(Uint8Array.from([0xff]));
    expect(U8.fromBytes(bytesU8).value().toBytes()).to.deep.eq(
      CLTypedAndToBytesHelper.u8(255).toBytes()
    );

    expect(() => toBytesU8(256)).to.throws('out');
  });

  it('should be able to serialize/deserialize u32', () => {
    let bytesU32 = toBytesU32(0xf0e0_d0c0);
    expect(bytesU32).to.deep.eq(Uint8Array.from([0xc0, 0xd0, 0xe0, 0xf0]));
    expect(U32.fromBytes(bytesU32).value().toBytes()).to.deep.eq(
      CLTypedAndToBytesHelper.u32(0xf0e0_d0c0).toBytes()
    );
    bytesU32 = toBytesU32(100000);
    expect(bytesU32).to.deep.eq(Uint8Array.from([160, 134, 1, 0]));
    expect(U32.fromBytes(bytesU32).value().toBytes()).to.deep.eq(
      CLTypedAndToBytesHelper.u32(100000).toBytes()
    );
    bytesU32 = toBytesU32(0);
    expect(bytesU32).to.deep.eq(Uint8Array.from([0, 0, 0, 0]));
    expect(U32.fromBytes(bytesU32).value().toBytes()).to.deep.eq(
      CLTypedAndToBytesHelper.u32(0).toBytes()
    );
  });

  it('should be able to serialize/deserialize i32', () => {
    let bytesI32 = toBytesI32(-100000);
    expect(bytesI32).to.deep.eq(Uint8Array.from([96, 121, 254, 255]));
    expect(I32.fromBytes(bytesI32).value().toBytes()).to.deep.eq(
      CLTypedAndToBytesHelper.i32(-100000).toBytes()
    );
    bytesI32 = toBytesI32(100000);
    expect(bytesI32).to.deep.eq(Uint8Array.from([160, 134, 1, 0]));
    expect(I32.fromBytes(bytesI32).value().toBytes()).to.deep.eq(
      CLTypedAndToBytesHelper.i32(100000).toBytes()
    );
    bytesI32 = toBytesI32(0);
    expect(bytesI32).to.deep.eq(Uint8Array.from([0, 0, 0, 0]));
    expect(I32.fromBytes(bytesI32).value().toBytes()).to.deep.eq(
      CLTypedAndToBytesHelper.i32(0).toBytes()
    );
    bytesI32 = toBytesI32(-1);
    expect(bytesI32).to.deep.eq(Uint8Array.from([255, 255, 255, 255]));
    expect(I32.fromBytes(bytesI32).value().toBytes()).to.deep.eq(
      CLTypedAndToBytesHelper.i32(-1).toBytes()
    );
  });

  it('should be able to serialize/deserialize i64', () => {
    let bytesI64 = toBytesI64('198572906121139257');
    expect(bytesI64).to.deep.eq(
      Uint8Array.from([57, 20, 94, 139, 1, 121, 193, 2])
    );
    expect(I64.fromBytes(bytesI64).value().toBytes()).to.deep.eq(
      CLTypedAndToBytesHelper.i64('198572906121139257').toBytes()
    );
    bytesI64 = toBytesI64('-4009477689550808');
    expect(bytesI64).to.deep.eq(
      Uint8Array.from([40, 88, 148, 186, 102, 193, 241, 255])
    );
    expect(I64.fromBytes(bytesI64).value().toBytes()).to.deep.equal(
      CLTypedAndToBytesHelper.i64('-4009477689550808').toBytes()
    );
  });

  it('should be able to serialize/deserialize u64', () => {
    let bytesU64 = toBytesU64('14198572906121139257');
    expect(bytesU64).to.deep.eq(
      Uint8Array.from([57, 20, 214, 178, 212, 118, 11, 197])
    );
    expect(U64.fromBytes(bytesU64).value().toBytes()).to.deep.equal(
      CLTypedAndToBytesHelper.u64('14198572906121139257').toBytes()
    );
    bytesU64 = toBytesU64('9834009477689550808');
    expect(bytesU64).to.deep.eq(
      Uint8Array.from([216, 167, 130, 99, 132, 107, 121, 136])
    );
    expect(U64.fromBytes(bytesU64).value().toBytes()).to.deep.equal(
      CLTypedAndToBytesHelper.u64('9834009477689550808').toBytes()
    );
  });

  it('should be able to serialize/deserialize u128', () => {
    let bytesU128 = toBytesU128(100000);
    expect(bytesU128).to.deep.eq(Uint8Array.from([3, 160, 134, 1]));
    expect(U128.fromBytes(bytesU128).value().toBytes()).to.deep.equal(
      CLTypedAndToBytesHelper.u128(100000).toBytes()
    );
    bytesU128 = toBytesU128(0xf0e0_d0c0_0000);
    expect(bytesU128).to.deep.eq(
      Uint8Array.from([6, 0, 0, 0xc0, 0xd0, 0xe0, 0xf0])
    );
    expect(U128.fromBytes(bytesU128).value().toBytes()).to.deep.equal(
      CLTypedAndToBytesHelper.u128(0xf0e0_d0c0_0000).toBytes()
    );
    bytesU128 = toBytesU128(0x0000_f0e0_d0c0_0000);
    expect(bytesU128).to.deep.eq(
      Uint8Array.from([6, 0, 0, 0xc0, 0xd0, 0xe0, 0xf0])
    );
    expect(U128.fromBytes(bytesU128).value().toBytes()).to.deep.equal(
      CLTypedAndToBytesHelper.u128(0x0000_f0e0_d0c0_0000).toBytes()
    );
  });

  it('should be able to serialize/deserialize utf8 string', () => {
    const bytesString = toBytesString('test_测试');
    expect(bytesString).to.deep.eq(
      Uint8Array.from([
        11,
        0,
        0,
        0,
        116,
        101,
        115,
        116,
        95,
        230,
        181,
        139,
        232,
        175,
        149
      ])
    );
    expect(StringValue.fromBytes(bytesString).value().toBytes()).to.deep.equal(
      CLTypedAndToBytesHelper.string('test_测试').toBytes()
    );
  });

  it('should be able to serialize/deserialize unit', () => {
    const unit = CLTypedAndToBytesHelper.unit();
    const bytesUnit = unit.toBytes();
    expect(bytesUnit).to.deep.eq(Uint8Array.from([]));
    expect(Unit.fromBytes(bytesUnit).value().toBytes()).to.deep.equal(
      CLTypedAndToBytesHelper.unit().toBytes()
    );
  });

  it('should serialize a vector of CLValue correctly', () => {
    const truth = decodeBase16(
      '0100000015000000110000006765745f7061796d656e745f70757273650a'
    );
    const bytes = toBytesVecT([CLValue.string('get_payment_purse')]);
    expect(bytes).to.deep.eq(truth);
  });

  it('should serialize/deserialize URef variant of Key correctly', () => {
    const urefAddr =
      '2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a';
    const truth = decodeBase16(
      '022a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a07'
    );
    const uref = new URef(decodeBase16(urefAddr), AccessRights.READ_ADD_WRITE);
    const bytes = KeyValue.fromURef(uref).toBytes();
    expect(bytes).to.deep.eq(truth);

    const bytes2 = KeyValue.fromURef(
      URef.fromFormattedStr(
        'uref-d93dfedfc13180a0ea188841e64e0a1af718a733216e7fae4909dface372d2b0-007'
      )
    ).toBytes();
    expect(bytes2).to.deep.eq(
      Uint8Array.from([
        2,
        217,
        61,
        254,
        223,
        193,
        49,
        128,
        160,
        234,
        24,
        136,
        65,
        230,
        78,
        10,
        26,
        247,
        24,
        167,
        51,
        33,
        110,
        127,
        174,
        73,
        9,
        223,
        172,
        227,
        114,
        210,
        176,
        7
      ])
    );

    expect(KeyValue.fromBytes(bytes).value()?.uRef?.uRefAddr).to.deep.equal(
      decodeBase16(urefAddr)
    );
    expect(KeyValue.fromBytes(bytes).value()?.uRef?.accessRights).to.deep.equal(
      AccessRights.READ_ADD_WRITE
    );
  });

  it('should serialize/deserialize Hash variant of Key correctly', () => {
    const keyHash = KeyValue.fromHash(Uint8Array.from(Array(32).fill(42)));
    // prettier-ignore
    const expectedBytes = Uint8Array.from([
      1, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42
    ]);
    expect(keyHash.toBytes()).to.deep.eq(expectedBytes);
    expect(KeyValue.fromBytes(expectedBytes).value()).to.deep.eq(keyHash);
  });

  it('should serialize/deserialize Account variant of Key correctly', () => {
    const keyAccount = KeyValue.fromAccount(
      new AccountHash(Uint8Array.from(Array(32).fill(42)))
    );
    // prettier-ignore
    const expectedBytes = Uint8Array.from([
      0, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42
    ]);

    expect(keyAccount.toBytes()).to.deep.eq(expectedBytes);
    expect(KeyValue.fromBytes(expectedBytes).value()).to.deep.eq(keyAccount);
  });

  it('should serialize DeployHash correctly', () => {
    const deployHash = decodeBase16(
      '7e83be8eb783d4631c3239eee08e95f33396210e23893155b6fb734e9b7f0df7'
    );
    const bytes = toBytesDeployHash(deployHash);
    expect(bytes).to.deep.eq(
      Uint8Array.from([
        126,
        131,
        190,
        142,
        183,
        131,
        212,
        99,
        28,
        50,
        57,
        238,
        224,
        142,
        149,
        243,
        51,
        150,
        33,
        14,
        35,
        137,
        49,
        85,
        182,
        251,
        115,
        78,
        155,
        127,
        13,
        247
      ])
    );
  });

  it('should serialize/deserialize URef correctly', () => {
    const uref = URef.fromFormattedStr(
      'uref-ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff-007'
    );
    // prettier-ignore
    const expectedBytes = Uint8Array.from([255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 7]);
    expect(uref.toBytes()).to.deep.equal(expectedBytes);
    expect(URef.fromBytes(expectedBytes).value()).to.deep.eq(uref);
  });

  it('should serialize/deserialize Tuple1 correctly', () => {
    const value1 = CLTypedAndToBytesHelper.string('hello');
    const tuple = CLTypedAndToBytesHelper.tuple1(value1);
    // prettier-ignore
    const expectedBytes = Uint8Array.from([5, 0, 0, 0, 104, 101, 108, 108, 111]);
    expect(tuple.toBytes()).to.deep.equal(expectedBytes);

    expect(
      Tuple1.fromBytes(
        CLTypeHelper.tuple1(CLTypeHelper.string()),
        expectedBytes
      )
        .value()
        .clType()
    ).to.deep.equal(tuple.clType());

    expect(
      Tuple1.fromBytes(
        CLTypeHelper.tuple1(CLTypeHelper.string()),
        expectedBytes
      )
        .value()
        .toBytes()
    ).to.deep.equal(tuple.toBytes());
  });

  it('should serialize/deserialize Tuple2 correctly', () => {
    const value1 = CLTypedAndToBytesHelper.string('hello');
    const value2 = CLTypedAndToBytesHelper.u64(123456);
    const tuple2 = CLTypedAndToBytesHelper.tuple2(value1, value2);
    // prettier-ignore
    const expectedBytes = Uint8Array.from(
      [5, 0, 0, 0, 104, 101, 108, 108, 111, 64, 226, 1, 0, 0, 0, 0, 0]);
    expect(tuple2.toBytes()).to.deep.equal(expectedBytes);

    expect(
      Tuple2.fromBytes(
        CLTypeHelper.tuple2(CLTypeHelper.string(), CLTypeHelper.u64()),
        expectedBytes
      )
        .value()
        .clType()
    ).to.deep.equal(tuple2.clType());

    expect(
      Tuple2.fromBytes(
        CLTypeHelper.tuple2(CLTypeHelper.string(), CLTypeHelper.u64()),
        expectedBytes
      )
        .value()
        .toBytes()
    ).to.deep.equal(tuple2.toBytes());
  });

  it('should serialize/deserialize Tuple3 correctly', () => {
    const value1 = CLTypedAndToBytesHelper.string('hello');
    const value2 = CLTypedAndToBytesHelper.u64(123456);
    const value3 = CLTypedAndToBytesHelper.bool(true);
    const tuple3 = CLTypedAndToBytesHelper.tuple3(value1, value2, value3);
    // prettier-ignore
    const expectedBytes = Uint8Array.from(
      [5, 0, 0, 0, 104, 101, 108, 108, 111, 64, 226, 1, 0, 0, 0, 0, 0, 1]
    );
    expect(tuple3.toBytes()).to.deep.equal(expectedBytes);

    expect(
      Tuple3.fromBytes(
        CLTypeHelper.tuple3(
          CLTypeHelper.string(),
          CLTypeHelper.u64(),
          CLTypeHelper.bool()
        ),
        expectedBytes
      )
        .value()
        .clType()
    ).to.deep.equal(tuple3.clType());

    expect(
      Tuple3.fromBytes(
        CLTypeHelper.tuple3(
          CLTypeHelper.string(),
          CLTypeHelper.u64(),
          CLTypeHelper.bool()
        ),
        expectedBytes
      )
        .value()
        .toBytes()
    ).to.deep.equal(tuple3.toBytes());
  });

  it('should serialize/deserialize List correctly', () => {
    const list = CLTypedAndToBytesHelper.list([
      CLTypedAndToBytesHelper.u32(1),
      CLTypedAndToBytesHelper.u32(2),
      CLTypedAndToBytesHelper.u32(3)
    ]);
    // prettier-ignore
    const expectedBytes = Uint8Array.from([3, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 3, 0, 0, 0]);
    expect(list.toBytes()).to.deep.eq(expectedBytes);

    expect(
      List.fromBytes(CLTypeHelper.list(CLTypeHelper.u32()), expectedBytes)
        .value()
        .toBytes()
    ).to.deep.eq(list.toBytes());
  });

  it('should serialze/deserialize Map correctly', () => {
    const map = new MapValue([
      {
        key: CLTypedAndToBytesHelper.string('test1'),
        value: CLTypedAndToBytesHelper.list([
          CLTypedAndToBytesHelper.u64(1),
          CLTypedAndToBytesHelper.u64(2)
        ])
      },
      {
        key: CLTypedAndToBytesHelper.string('test2'),
        value: CLTypedAndToBytesHelper.list([
          CLTypedAndToBytesHelper.u64(3),
          CLTypedAndToBytesHelper.u64(4)
        ])
      }
    ]);
    // prettier-ignore
    const expectBytes = Uint8Array.from([2, 0, 0, 0, 5, 0, 0, 0, 116, 101, 115, 116, 49, 2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 116, 101, 115, 116, 50, 2, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0])

    expect(map.toBytes()).to.deep.eq(expectBytes);

    expect(
      MapValue.fromBytes(
        CLTypeHelper.map(
          CLTypeHelper.string(),
          CLTypeHelper.list(CLTypeHelper.u64())
        ),
        expectBytes
      )
        .value()
        .toBytes()
    ).to.deep.eq(expectBytes);
  });

  it('should serialize/deserialize Option correctly', () => {
    const opt = CLTypedAndToBytesHelper.option(
      CLTypedAndToBytesHelper.string('test')
    );
    const expectBytes = Uint8Array.from([1, 4, 0, 0, 0, 116, 101, 115, 116]);
    expect(opt.toBytes()).to.deep.eq(expectBytes);

    expect(
      Option.fromBytes(CLTypeHelper.option(CLTypeHelper.string()), expectBytes)
        .value()
        .toBytes()
    ).to.deep.eq(expectBytes);
  });

  it('should serialize ByteArray correctly', () => {
    const byteArray = Uint8Array.from(Array(32).fill(42));
    const bytes = CLValue.byteArray(byteArray).toBytes();
    expect(bytes).to.deep.eq(
      Uint8Array.from([
        32,
        0,
        0,
        0,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        15,
        32,
        0,
        0,
        0
      ])
    );
  });

  it('should serialize PublicKey correctly', () => {
    const publicKey = Uint8Array.from(Array(32).fill(42));
    const bytes = PublicKey.fromEd25519(publicKey).toBytes();
    expect(bytes).to.deep.eq(
      Uint8Array.from([
        1,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42,
        42
      ])
    );
  });

  it('should compute hex from PublicKey correctly', () => {
    const ed25519Account = Keys.Ed25519.new();
    const ed25519AccountHex = ed25519Account.accountHex();
    expect(PublicKey.fromHex(ed25519AccountHex)).to.deep.equal(
      ed25519Account.publicKey
    );

    const secp256K1Account = Keys.Secp256K1.new();
    const secp256K1AccountHex = secp256K1Account.accountHex();
    expect(PublicKey.fromHex(secp256K1AccountHex)).to.deep.equal(
      secp256K1Account.publicKey
    );
  });
});
