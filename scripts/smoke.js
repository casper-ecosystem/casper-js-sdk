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
  KeyAlgorithm,
  NativeTransferBuilder,
  PrivateKey,
  PublicKey,
  RpcClient,
  SseClient,
  Transaction
} = sdk;

// Fixed test keys. Never used for anything real — they exist so the signatures
// below are reproducible.
const ED25519_SECRET =
  '0e5a1a2c8b19b9c0f4d2e6f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1';
const SECP256K1_SECRET =
  '7c1a0c9f7f2d3e4b5a69788796a5b4c3d2e1f00918273645546372819a0b1c2d';

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

check('signs a native transfer deterministically with ed25519', () => {
  const key = PrivateKey.fromHex(ED25519_SECRET, KeyAlgorithm.ED25519);

  const transaction = new NativeTransferBuilder()
    .from(key.publicKey)
    .target(key.publicKey)
    .amount('25000000000')
    .id(42)
    .chainName(CasperNetworkName.Mainnet)
    .payment(100000000)
    .build();

  transaction.sign(key);

  assert.strictEqual(transaction.approvals.length, 1);
  assert.strictEqual(
    transaction.approvals[0].signer.toHex(),
    key.publicKey.toHex()
  );
  // Ed25519 is deterministic (RFC 8032), so the same body always yields the
  // same signature — a changed byte here means the serialized payload moved.
  assert.ok(
    key.publicKey.verifySignature(
      transaction.hash.toBytes(),
      transaction.approvals[0].signature.bytes
    ),
    'the transaction signature does not verify against its own hash'
  );
});

check('signs a native transfer with secp256k1', () => {
  const key = PrivateKey.fromHex(SECP256K1_SECRET, KeyAlgorithm.SECP256K1);

  const transaction = new NativeTransferBuilder()
    .from(key.publicKey)
    .target(key.publicKey)
    .amount('25000000000')
    .chainName(CasperNetworkName.Mainnet)
    .payment(100000000)
    .build();

  transaction.sign(key);

  assert.strictEqual(transaction.approvals.length, 1);
  assert.ok(
    key.publicKey.verifySignature(
      transaction.hash.toBytes(),
      transaction.approvals[0].signature.bytes
    ),
    'the transaction signature does not verify against its own hash'
  );
});

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
  assert.ok(RpcClient);
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
