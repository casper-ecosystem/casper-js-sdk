'use strict';

/**
 * Node-18 consumer smoke test.
 *
 * This runs against an INSTALLED tarball (`npm pack` -> `npm i ./casper-js-sdk-*.tgz`),
 * with a plain CommonJS `require`, on the oldest Node the published
 * `engines.node` promises. It is the only thing that exercises
 * `dist/lib.node.js` plus the externalized runtime dependencies the way a
 * consumer does — the dev test suite runs TypeScript sources through Vitest and
 * never touches the built artifact at all.
 *
 * From PHASE-3 the 18.x CI leg runs this instead of the unit suite: Vitest 4
 * declares `engines.node ^20 || ^22 || >=24` and cannot execute there. Without
 * this job that leg would go green while testing nothing.
 *
 * Everything asserted below is an exact value, not a shape. A "did not throw"
 * smoke test would pass against a bundle that silently produced wrong bytes,
 * which for a transaction-signing SDK is the failure that matters.
 */

const assert = require('assert');

const sdk = require('casper-js-sdk');

const {
  CLValue,
  CLValueParser,
  CasperNetworkName,
  Conversions,
  HttpHandler,
  KeyAlgorithm,
  NativeTransferBuilder,
  PrivateKey,
  PublicKey,
  RpcClient,
  SseClient,
  Timestamp,
  Transaction
} = sdk;

// Fixed test keys. Never used for anything real — they exist so the signatures
// below are reproducible.
const ED25519_SECRET =
  '0e5a1a2c8b19b9c0f4d2e6f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1';
const SECP256K1_SECRET =
  '7c1a0c9f7f2d3e4b5a69788796a5b4c3d2e1f00918273645546372819a0b1c2d';

// Every field the builder would otherwise default from the clock is pinned, so
// the payload — and therefore the hash and the signature over it — is fixed.
// Without this the transaction differs on every run and nothing about its bytes
// can be asserted.
const buildFixedTransfer = key =>
  new NativeTransferBuilder()
    .from(key.publicKey)
    .target(key.publicKey)
    .amount('25000000000')
    .id(42)
    .chainName(CasperNetworkName.Mainnet)
    .payment(100000000)
    .timestamp(new Timestamp(new Date(0)))
    .ttl(1800000)
    .build();

// Captured from this SDK, so they are a characterization of the current
// serialization rather than an independent oracle — the point is to fail when
// the bytes move, which is the regression that would otherwise reach consumers
// silently. The public keys above ARE checked against an independent oracle,
// so the key material underneath these is anchored separately.
const EXPECTED = {
  ed25519: {
    hash: 'c95021dcc6b2d82b50155580fee35d3b249afa32d094a1949dac30097cc8c7eb',
    signature:
      '01f42f26ce3ff0f7ae6a7a4cf04d88a302c567dab457817211e108cb7ea748ed36160af3dbd479ad91ab7a7c5bc9d324193b42fc70cef13555d6cd6a2a41cad60f',
    serialized:
      '010300000000000000000001002000000002006f010000d5010000c95021dcc6b2d82b50155580fee35d3b249afa32d094a1949dac30097cc8c7eb0600000000000000000001003600000002003e00000003004600000004005000000005007b000000230100000200000000000000000001000100000022000000000181c43bb4baca355050a431bce794075a7805be2b2ee2e4f2d63614f5030d1f3d000000000000000040771b0000000000060000006361737065720400000000000000000001000100000002000900000003000a0000000b0000000000e1f5050000000001010400000000005f000000000300000006000000746172676574210000000181c43bb4baca355050a431bce794075a7805be2b2ee2e4f2d63614f5030d1f3d1606000000616d6f756e74060000000500ba1dd2050802000000696409000000012a000000000000000d0501000f00000001000000000000000000010000000002000f00000001000000000000000000010000000203000f000000010000000000000000000100000000010000000181c43bb4baca355050a431bce794075a7805be2b2ee2e4f2d63614f5030d1f3d01f42f26ce3ff0f7ae6a7a4cf04d88a302c567dab457817211e108cb7ea748ed36160af3dbd479ad91ab7a7c5bc9d324193b42fc70cef13555d6cd6a2a41cad60f'
  },
  secp256k1: {
    hash: '70d9e72d7bf9a474ea672268e45b1a4fc97ae1dd53c10be9ad358d8fe24d2107',
    signature:
      '022ff3d64efd2dd1d504eca0d9dc1ea6203bbafabd925267b68063398f0d9f1e4a4e8f2496e18064f01930bb30da25c5640f7baa38dd86188884460e6e582500be',
    serialized:
      '0103000000000000000000010020000000020071010000d801000070d9e72d7bf9a474ea672268e45b1a4fc97ae1dd53c10be9ad358d8fe24d21070600000000000000000001003700000002003f00000003004700000004005100000005007c0000002501000002000000000000000000010001000000230000000002036d96e2ca75d87700ffb4f52d5e4c7a6ed58af8091e014679b3b7c0879c3d6ba0000000000000000040771b0000000000060000006361737065720400000000000000000001000100000002000900000003000a0000000b0000000000e1f505000000000101040000000000600000000003000000060000007461726765742200000002036d96e2ca75d87700ffb4f52d5e4c7a6ed58af8091e014679b3b7c0879c3d6ba01606000000616d6f756e74060000000500ba1dd2050802000000696409000000012a000000000000000d0501000f00000001000000000000000000010000000002000f00000001000000000000000000010000000203000f0000000100000000000000000001000000000100000002036d96e2ca75d87700ffb4f52d5e4c7a6ed58af8091e014679b3b7c0879c3d6ba0022ff3d64efd2dd1d504eca0d9dc1ea6203bbafabd925267b68063398f0d9f1e4a4e8f2496e18064f01930bb30da25c5640f7baa38dd86188884460e6e582500be'
  }
};

const checks = [];
const check = (name, fn) => checks.push([name, fn]);

check('exports the documented entry points', () => {
  for (const name of [
    'CLValue',
    'Conversions',
    'NativeTransferBuilder',
    'PrivateKey',
    'PublicKey',
    'RpcClient',
    'SseClient',
    'Transaction'
  ]) {
    assert.ok(sdk[name], `${name} is missing from the published entry point`);
  }
});

check('derives the documented public keys from fixed secrets', () => {
  const ed = PrivateKey.fromHex(ED25519_SECRET, KeyAlgorithm.ED25519);
  const secp = PrivateKey.fromHex(SECP256K1_SECRET, KeyAlgorithm.SECP256K1);

  // Both expected values were derived with Node's own crypto, not with this
  // SDK, so the assertion is an independent oracle rather than a snapshot of
  // whatever the bundle happens to output:
  //
  //   ed25519    crypto.createPublicKey(<seed wrapped in the PKCS#8 prefix>)
  //   secp256k1  crypto.createECDH('secp256k1').getPublicKey(null, 'compressed')
  //
  // The leading byte in each is the SDK's algorithm tag (01 = ed25519,
  // 02 = secp256k1); the rest is the raw key.
  assert.strictEqual(
    ed.publicKey.toHex(),
    '01' + '81c43bb4baca355050a431bce794075a7805be2b2ee2e4f2d63614f5030d1f3d'
  );
  assert.strictEqual(
    secp.publicKey.toHex(),
    '02' + '036d96e2ca75d87700ffb4f52d5e4c7a6ed58af8091e014679b3b7c0879c3d6ba0'
  );
});

for (const [algorithm, secret, keyAlgorithm] of [
  ['ed25519', ED25519_SECRET, KeyAlgorithm.ED25519],
  ['secp256k1', SECP256K1_SECRET, KeyAlgorithm.SECP256K1]
]) {
  check(
    `serializes and signs a native transfer byte-for-byte (${algorithm})`,
    () => {
      const expected = EXPECTED[algorithm];
      const key = PrivateKey.fromHex(secret, keyAlgorithm);
      const transaction = buildFixedTransfer(key);

      // The hash is the digest of the serialized payload, so pinning it fails on
      // any field reordering, wrong length prefix or changed preimage.
      assert.strictEqual(
        transaction.hash.toHex(),
        expected.hash,
        'the serialized transaction payload moved'
      );

      transaction.sign(key);

      assert.strictEqual(transaction.approvals.length, 1);
      assert.strictEqual(
        transaction.approvals[0].signer.toHex(),
        key.publicKey.toHex()
      );
      // Both algorithms sign deterministically — ed25519 by RFC 8032, secp256k1
      // by RFC 6979 — so an exact signature is assertable rather than merely
      // verifiable. `verifySignature` alone would pass against any payload,
      // because it checks the signature against the hash it was just made over.
      assert.strictEqual(
        transaction.approvals[0].signature.toHex(),
        expected.signature,
        'the signature over the transaction hash changed'
      );
      assert.ok(
        key.publicKey.verifySignature(
          transaction.hash.toBytes(),
          transaction.approvals[0].signature.bytes
        ),
        'the transaction signature does not verify against its own hash'
      );

      // The full envelope, which the hash does not cover: field ordering, length
      // prefixes and the approvals encoding.
      assert.strictEqual(
        Conversions.encodeBase16(transaction.toBytes()),
        expected.serialized,
        'the serialized transaction bytes changed'
      );
    }
  );
}

check('round-trips a signed transaction through JSON', () => {
  const key = PrivateKey.fromHex(ED25519_SECRET, KeyAlgorithm.ED25519);

  const transaction = new NativeTransferBuilder()
    .from(key.publicKey)
    .target(key.publicKey)
    .amount('2500000000')
    .chainName(CasperNetworkName.Mainnet)
    .payment(100000000)
    .build();

  transaction.sign(key);

  const parsed = Transaction.fromJSON(transaction.toJSON());

  assert.strictEqual(parsed.hash.toHex(), transaction.hash.toHex());
  assert.strictEqual(parsed.approvals.length, 1);
  assert.strictEqual(
    parsed.approvals[0].signature.toHex(),
    transaction.approvals[0].signature.toHex()
  );
});

check('round-trips the wide CLValue numerics through bytes and JSON', () => {
  const cases = [
    ['U256', CLValue.newCLUInt256('340282366920938463463374607431768211455')],
    ['U512', CLValue.newCLUInt512('25000000000')],
    ['U64', CLValue.newCLUint64('18446744073709551615')],
    ['String', CLValue.newCLString('casper')]
  ];

  for (const [label, value] of cases) {
    const bytes = CLValueParser.toBytesWithType(value);
    const back = CLValueParser.fromBytesWithType(bytes).result;

    assert.strictEqual(
      back.toString(),
      value.toString(),
      `${label} did not survive the byte round-trip`
    );

    const fromJson = CLValueParser.fromJSON(CLValueParser.toJSON(value));
    assert.strictEqual(
      fromJson.toString(),
      value.toString(),
      `${label} did not survive the JSON round-trip`
    );
  }
});

check('converts CSPR to motes and back', () => {
  assert.strictEqual(Conversions.csprToMotes('1').toString(), '1000000000');
  assert.strictEqual(Conversions.motesToCSPR('1000000000').toString(), '1');
});

check('parses a public key from hex and back', () => {
  const hex =
    '0202f5a92ab6da536e7b1a351406f3744224bec85d7acbab1497b65de48a1a707b64';

  assert.strictEqual(PublicKey.fromHex(hex).toHex(), hex);
});

check('constructs the network clients without opening a connection', () => {
  assert.ok(new SseClient('http://localhost:9999/events'));
  // Actually instantiate rather than assert the constructor is truthy: the
  // point is that the class graph loads and wires up on Node 18, which a
  // truthiness check on the exported symbol never established.
  const rpc = new RpcClient(new HttpHandler('http://localhost:9999/rpc'));
  assert.ok(rpc);
  assert.strictEqual(typeof rpc.getLatestBlock, 'function');
});

let failed = 0;
for (const [name, fn] of checks) {
  try {
    fn();
    console.log(`ok   ${name}`);
  } catch (error) {
    failed++;
    console.error(`FAIL ${name}`);
    console.error(`     ${error && error.message}`);
  }
}

console.log(`\n${checks.length - failed}/${checks.length} checks passed`);
process.exit(failed === 0 ? 0 : 1);
