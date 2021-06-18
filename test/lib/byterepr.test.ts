import { expect } from 'chai';
import { Some } from 'ts-results';
import {
  CLValueBuilder,
  CLTypeBuilder,
  CLValueParsers,
  CLURef,
  CLAccountHash,
  CLPublicKey,
  CLPublicKeyTag,
  Keys,
  AccessRights,
  decodeBase16
} from '../../src';
import { toBytesDeployHash } from '../../src/lib/ByteConverters';

describe(`numbers' toBytes`, () => {
  it('should be able to serialize/deserialize u8', () => {
    const validBytes = Uint8Array.from([0x0a]);
    const clVal = CLValueBuilder.u8(10);

    const clValFromBytes = CLValueParsers.fromBytes(
      validBytes,
      CLTypeBuilder.u8()
    ).unwrap();
    const clValBytes = CLValueParsers.toBytes(clVal).unwrap();

    expect(clValFromBytes).to.deep.eq(clVal);
    expect(clValBytes).to.deep.eq(validBytes);
  });

  it('should be able to serialize/deserialize u32', () => {
    const validBytes = Uint8Array.from([0xc0, 0xd0, 0xe0, 0xf0]);
    const clVal = CLValueBuilder.u32(0xf0e0_d0c0);

    const clValFromBytes = CLValueParsers.fromBytes(
      validBytes,
      CLTypeBuilder.u32()
    ).unwrap();
    const clValBytes = CLValueParsers.toBytes(clVal).unwrap();

    expect(clValFromBytes).to.deep.eq(clVal);
    expect(clValBytes).to.deep.eq(validBytes);
  });

  it('should be able to serialize/deserialize i32', () => {
    const validBytes = Uint8Array.from([96, 121, 254, 255]);
    const clVal = CLValueBuilder.i32(-100000);

    const clValFromBytes = CLValueParsers.fromBytes(
      validBytes,
      CLTypeBuilder.i32()
    ).unwrap();
    const clValBytes = CLValueParsers.toBytes(clVal).unwrap();

    expect(clValFromBytes).to.deep.eq(clVal);
    expect(clValBytes).to.deep.eq(validBytes);
  });

  it('should be able to serialize/deserialize i64', () => {
    const validBytes = Uint8Array.from([57, 20, 94, 139, 1, 121, 193, 2]);
    const clVal = CLValueBuilder.i64('198572906121139257');

    const clValFromBytes = CLValueParsers.fromBytes(
      validBytes,
      CLTypeBuilder.i64()
    ).unwrap();
    const clValBytes = CLValueParsers.toBytes(clVal).unwrap();

    expect(clValFromBytes).to.deep.eq(clVal);
    expect(clValBytes).to.deep.eq(validBytes);

    const validBytes2 = Uint8Array.from([40, 88, 148, 186, 102, 193, 241, 255]);
    const clVal2 = CLValueBuilder.i64('-4009477689550808');

    const clValFromBytes2 = CLValueParsers.fromBytes(
      validBytes2,
      CLTypeBuilder.i64()
    ).unwrap();
    const clValBytes2 = CLValueParsers.toBytes(clVal2).unwrap();

    expect(clValFromBytes2).to.deep.eq(clVal2);
    expect(clValBytes2).to.deep.eq(validBytes2);
  });

  it('should be able to serialize/deserialize u64', () => {
    const validBytes = Uint8Array.from([57, 20, 214, 178, 212, 118, 11, 197]);
    const clVal = CLValueBuilder.u64('14198572906121139257');

    const clValFromBytes = CLValueParsers.fromBytes(
      validBytes,
      CLTypeBuilder.u64()
    ).unwrap();
    const clValBytes = CLValueParsers.toBytes(clVal).unwrap();

    expect(clValFromBytes).to.deep.eq(clVal);
    expect(clValBytes).to.deep.eq(validBytes);
  });

  it('should be able to serialize/deserialize u128', () => {
    const clVal = CLValueBuilder.u128(264848365584384);
    const validBytes = Uint8Array.from([6, 0, 0, 192, 208, 224, 240]);

    const clValFromBytes = CLValueParsers.fromBytes(
      validBytes,
      CLTypeBuilder.u128()
    ).unwrap();
    const clValBytes = CLValueParsers.toBytes(clVal).unwrap();

    expect(clValFromBytes).to.deep.eq(clVal);
    expect(clValBytes).to.deep.eq(validBytes);
  });

  it('should be able to serialize/deserialize utf8 string', () => {
    const clVal = CLValueBuilder.string('test_测试');
    const validBytes = Uint8Array.from([
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
    ]);

    const clValFromBytes = CLValueParsers.fromBytes(
      validBytes,
      CLTypeBuilder.string()
    ).unwrap();
    const clValBytes = CLValueParsers.toBytes(clVal).unwrap();

    expect(clValFromBytes).to.deep.eq(clVal);
    expect(clValBytes).to.deep.eq(validBytes);
  });

  it('should be able to serialize/deserialize unit', () => {
    const clVal = CLValueBuilder.unit();
    const validBytes = Uint8Array.from([]);

    const clValFromBytes = CLValueParsers.fromBytes(
      validBytes,
      CLTypeBuilder.unit()
    ).unwrap();
    const clValBytes = CLValueParsers.toBytes(clVal).unwrap();

    expect(clValFromBytes).to.deep.eq(clVal);
    expect(clValBytes).to.deep.eq(validBytes);
  });

  it('should serialize/deserialize URef variant of Key correctly', () => {
    const urefAddr =
      '2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a';
    const clVal = CLValueBuilder.uref(
      decodeBase16(urefAddr),
      AccessRights.READ_ADD_WRITE
    );
    const validBytes = decodeBase16(
      '022a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a07'
    );
    const bytes = CLValueParsers.toBytes(CLValueBuilder.key(clVal)).unwrap();

    expect(bytes).to.deep.eq(validBytes);

    const uref = CLURef.fromFormattedStr(
      'uref-d93dfedfc13180a0ea188841e64e0a1af718a733216e7fae4909dface372d2b0-007'
    );
    const clVal2 = CLValueBuilder.key(uref);
    const validBytes2 = CLValueParsers.toBytes(clVal2).unwrap();

    expect(validBytes2).to.deep.eq(
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

    expect(
      CLValueParsers.fromBytes(bytes, CLTypeBuilder.key())
        .unwrap()
        .value().data
    ).to.deep.equal(decodeBase16(urefAddr));
    expect(
      CLValueParsers.fromBytes(bytes, CLTypeBuilder.key())
        .unwrap()
        .value().accessRights
    ).to.deep.equal(AccessRights.READ_ADD_WRITE);
  });

  it('should serialize/deserialize Hash variant of Key correctly', () => {
    const keyHash = CLValueBuilder.key(
      CLValueBuilder.byteArray(Uint8Array.from(Array(32).fill(42)))
    );
    // prettier-ignore
    const expectedBytes = Uint8Array.from([
      1, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42
    ]);
    expect(CLValueParsers.toBytes(keyHash).unwrap()).to.deep.eq(expectedBytes);
    expect(
      CLValueParsers.fromBytes(expectedBytes, CLTypeBuilder.key()).unwrap()
    ).to.deep.eq(keyHash);
  });

  it('should serialize/deserialize Account variant of Key correctly', () => {
    const keyAccount = CLValueBuilder.key(
      new CLAccountHash(Uint8Array.from(Array(32).fill(42)))
    );
    // prettier-ignore
    const expectedBytes = Uint8Array.from([
      0, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42
    ]);

    expect(CLValueParsers.toBytes(keyAccount).unwrap()).to.deep.eq(
      expectedBytes
    );
    expect(
      CLValueParsers.fromBytes(expectedBytes, CLTypeBuilder.key()).unwrap()
    ).to.deep.eq(keyAccount);
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
    const uref = CLURef.fromFormattedStr(
      'uref-ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff-007'
    );
    // prettier-ignore
    const expectedBytes = Uint8Array.from([255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 7]);
    expect(CLValueParsers.toBytes(uref).unwrap()).to.deep.equal(expectedBytes);
    expect(
      CLValueParsers.fromBytes(expectedBytes, CLTypeBuilder.uref()).unwrap()
    ).to.deep.eq(uref);
  });

  it('should serialize/deserialize Tuple1 correctly', () => {
    const value1 = CLValueBuilder.string('hello');
    const tuple = CLValueBuilder.tuple1([value1]);
    // prettier-ignore
    const expectedBytes = Uint8Array.from([5, 0, 0, 0, 104, 101, 108, 108, 111]);
    expect(CLValueParsers.toBytes(tuple).unwrap()).to.deep.equal(expectedBytes);

    expect(
      CLValueParsers.fromBytes(
        expectedBytes,
        CLTypeBuilder.tuple1([CLTypeBuilder.string()])
      )
        .unwrap()
        .clType()
    ).to.deep.equal(tuple.clType());

    expect(
      CLValueParsers.toBytes(
        CLValueParsers.fromBytes(
          expectedBytes,
          CLTypeBuilder.tuple1([CLTypeBuilder.string()])
        ).unwrap()
      ).unwrap()
    ).to.deep.equal(expectedBytes);
  });

  it('should serialize/deserialize Tuple2 correctly', () => {
    const value1 = CLValueBuilder.string('hello');
    const value2 = CLValueBuilder.u64(123456);
    const tuple2 = CLValueBuilder.tuple2([value1, value2]);
    // prettier-ignore
    const expectedBytes = Uint8Array.from(
      [5, 0, 0, 0, 104, 101, 108, 108, 111, 64, 226, 1, 0, 0, 0, 0, 0]);
    expect(CLValueParsers.toBytes(tuple2).unwrap()).to.deep.equal(
      expectedBytes
    );

    expect(
      CLValueParsers.fromBytes(
        expectedBytes,
        CLTypeBuilder.tuple2([CLTypeBuilder.string(), CLTypeBuilder.u64()])
      )
        .unwrap()
        .clType()
    ).to.deep.equal(tuple2.clType());

    expect(
      CLValueParsers.toBytes(
        CLValueParsers.fromBytes(
          expectedBytes,
          CLTypeBuilder.tuple2([CLTypeBuilder.string(), CLTypeBuilder.u64()])
        ).unwrap()
      ).unwrap()
    ).to.deep.equal(expectedBytes);
  });

  it('should serialize/deserialize Tuple3 correctly', () => {
    const value1 = CLValueBuilder.string('hello');
    const value2 = CLValueBuilder.u64(123456);
    const value3 = CLValueBuilder.bool(true);
    const tuple3 = CLValueBuilder.tuple3([value1, value2, value3]);
    // prettier-ignore
    const expectedBytes = Uint8Array.from(
      [5, 0, 0, 0, 104, 101, 108, 108, 111, 64, 226, 1, 0, 0, 0, 0, 0, 1]
    );
    expect(CLValueParsers.toBytes(tuple3).unwrap()).to.deep.equal(
      expectedBytes
    );

    expect(
      CLValueParsers.fromBytes(
        expectedBytes,
        CLTypeBuilder.tuple3([
          CLTypeBuilder.string(),
          CLTypeBuilder.u64(),
          CLTypeBuilder.bool()
        ])
      )
        .unwrap()
        .clType()
    ).to.deep.equal(tuple3.clType());

    expect(
      CLValueParsers.toBytes(
        CLValueParsers.fromBytes(
          expectedBytes,
          CLTypeBuilder.tuple3([
            CLTypeBuilder.string(),
            CLTypeBuilder.u64(),
            CLTypeBuilder.bool()
          ])
        ).unwrap()
      ).unwrap()
    ).to.deep.equal(expectedBytes);
  });

  it('should serialize/deserialize List correctly', () => {
    const list = CLValueBuilder.list([
      CLValueBuilder.u32(1),
      CLValueBuilder.u32(2),
      CLValueBuilder.u32(3)
    ]);
    // prettier-ignore
    const expectedBytes = Uint8Array.from([3, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 3, 0, 0, 0]);

    expect(CLValueParsers.toBytes(list).unwrap()).to.deep.eq(expectedBytes);

    expect(
      CLValueParsers.fromBytes(
        expectedBytes,
        CLTypeBuilder.list(CLTypeBuilder.u32())
      ).unwrap()
    ).to.deep.eq(list);
  });

  it('should serialze/deserialize Map correctly', () => {
    const map = CLValueBuilder.map([
      [
        CLValueBuilder.string('test1'),
        CLValueBuilder.list([CLValueBuilder.u64(1), CLValueBuilder.u64(2)])
      ],
      [
        CLValueBuilder.string('test2'),
        CLValueBuilder.list([CLValueBuilder.u64(3), CLValueBuilder.u64(4)])
      ]
    ]);
    // prettier-ignore
    const expectBytes = Uint8Array.from([2, 0, 0, 0, 5, 0, 0, 0, 116, 101, 115, 116, 49, 2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 116, 101, 115, 116, 50, 2, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0])

    expect(CLValueParsers.toBytes(map).unwrap()).to.deep.eq(expectBytes);

    expect(
      CLValueParsers.fromBytes(
        expectBytes,
        CLTypeBuilder.map([
          CLTypeBuilder.string(),
          CLTypeBuilder.list(CLTypeBuilder.u64())
        ])
      ).unwrap()
    ).to.deep.eq(map);
  });

  it('should serialize/deserialize Option correctly', () => {
    const opt = CLValueBuilder.option(Some(CLValueBuilder.string('test')));
    const expectedBytes = Uint8Array.from([1, 4, 0, 0, 0, 116, 101, 115, 116]);
    expect(CLValueParsers.toBytes(opt).unwrap()).to.deep.eq(expectedBytes);

    expect(
      CLValueParsers.fromBytes(
        expectedBytes,
        CLTypeBuilder.option(CLTypeBuilder.string())
      ).unwrap()
    ).to.deep.eq(opt);
  });

  it('should serialize ByteArray correctly', () => {
    const byteArray = Uint8Array.from(Array(32).fill(42));
    const bytes = CLValueParsers.toBytesWithType(
      CLValueBuilder.byteArray(byteArray)
    ).unwrap();
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
    const bytes = CLValueParsers.toBytes(
      CLValueBuilder.publicKey(publicKey, CLPublicKeyTag.ED25519)
    ).unwrap();
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
    expect(CLPublicKey.fromHex(ed25519AccountHex)).to.deep.equal(
      ed25519Account.publicKey
    );

    const secp256K1Account = Keys.Secp256K1.new();
    const secp256K1AccountHex = secp256K1Account.accountHex();
    expect(CLPublicKey.fromHex(secp256K1AccountHex)).to.deep.equal(
      secp256K1Account.publicKey
    );
  });
});
