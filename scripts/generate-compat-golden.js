'use strict';

/**
 * Regenerates `src/tests/data/compat/v5_1_0_golden.json` by running the
 * *published* casper-js-sdk@5.1.0 over this repository's own fixture corpus.
 *
 * The golden records what the previous release produced: JSON round-trip
 * digests, serialized transaction and deploy bytes, key/URef string forms, and
 * PEM/DER key material. `src/tests/compat/v5_1_0.test.ts` replays every case
 * against the working tree and asserts the results are identical — that is what
 * proves a 5.1.0 key file, RPC payload or signed transaction still round-trips.
 *
 * It deliberately does NOT run from this repo's node_modules: 5.1.0 has to come
 * from the registry, or the comparison is against the working tree twice.
 *
 *   mkdir -p /tmp/casper-v510 && cd /tmp/casper-v510
 *   npm init -y && npm install casper-js-sdk@5.1.0 typedjson@^1.8.0
 *   node <repo>/scripts/generate-compat-golden.js \
 *     <repo> <repo>/src/tests/data/compat/v5_1_0_golden.json
 *
 * Regenerating is only correct when the golden itself is wrong (a case was
 * added, a fixture changed). A test failure against an unchanged golden is a
 * compatibility break, not a stale file — fix the code, not the recording.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const repoRoot = process.argv[2];
const outFile = process.argv[3];

if (!repoRoot || !outFile) {
  console.error('usage: node generate-compat-golden.js <repo-root> <out.json>');
  process.exit(1);
}

// Resolved from the *current working directory*, never by bare specifier. This
// file lives inside the casper-js-sdk package, so `require('casper-js-sdk')`
// here self-references the repository's own `dist/` — which would silently
// compare the working tree against itself and record a golden that can never
// fail.
const EXPECTED_VERSION = '5.1.0';
const sdkDir = path.join(process.cwd(), 'node_modules/casper-js-sdk');
const sdkVersion = JSON.parse(
  fs.readFileSync(path.join(sdkDir, 'package.json'), 'utf8')
).version;

if (sdkVersion !== EXPECTED_VERSION) {
  console.error(
    `refusing to run: ${sdkDir} is ${sdkVersion}, expected ${EXPECTED_VERSION}`
  );
  process.exit(1);
}

const { TypedJSON } = require(
  path.join(process.cwd(), 'node_modules/typedjson')
);
const sdk = require(sdkDir);

const dataDir = path.join(repoRoot, 'src/tests/data');

const readFixture = rel =>
  JSON.parse(fs.readFileSync(path.join(dataDir, rel), 'utf8'));

/** Stable stringification: object keys sorted, so ordering never affects the digest. */
const canonical = value => {
  if (value === null || typeof value !== 'object')
    return JSON.stringify(value) ?? 'null';
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  return (
    '{' +
    Object.keys(value)
      .sort()
      .filter(k => value[k] !== undefined)
      .map(k => JSON.stringify(k) + ':' + canonical(value[k]))
      .join(',') +
    '}'
  );
};

const sha256 = s => crypto.createHash('sha256').update(s).digest('hex');

// ---------------------------------------------------------------------------
// 1. JSON round-trips over the whole fixture corpus
// ---------------------------------------------------------------------------

// name -> { file, pick, class }. `pick` selects the sub-document the tests parse.
const CORPUS = [
  [
    'storedValue/eraInfoResult',
    'era/era_info_result.json',
    null,
    'StoredValue'
  ],
  [
    'storedValue/stateItemV1',
    'rpc_response/state_item_result_v1.json',
    'stored_value',
    'StoredValue'
  ],
  [
    'storedValue/stateItemV2',
    'rpc_response/state_item_result_v2.json',
    'stored_value',
    'StoredValue'
  ],
  ['storedValue/storedBid', 'bid/stored_bid_example.json', null, 'StoredValue'],
  ['bid/auctionV1', 'bid/auction_bid_example_v1.json', null, 'Bid'],
  ['bid/auctionV2', 'bid/auction_bid_example_v2.json', null, 'Bid'],
  ['eraSummary/example', 'era/era_summary_example.json', null, 'EraSummary'],
  [
    'eraSummary/v2DelegatorKind',
    'era/era_summary_v2_delegator_kind_purse.json',
    null,
    'EraSummary'
  ],
  [
    'transform/writeAccountV1',
    'transform/write_account_v1.json',
    null,
    'TransformKey'
  ],
  [
    'transform/writeAccountV2',
    'transform/write_account_v2.json',
    null,
    'TransformKey'
  ],
  [
    'transform/writeContractV2',
    'transform/write_contract_v2.json',
    null,
    'Transform'
  ],
  // `InfoGetStatusResult` is deliberately absent. Its `available_block_range`
  // member is declared with a `constructor:` thunk that returns an object of
  // decorators instead of a class, which typedjson cannot use — so the class
  // does not serialize cleanly in *either* version and there is no meaningful
  // digest to record. `src/tests/compat/v5_1_0.test.ts` covers it on the parse
  // side instead, where the two versions do agree.
  [
    'rpc/chainGetBlock',
    'rpc_response/get_block_by_hash.json',
    'result',
    'ChainGetBlockResultV1Compatible'
  ],
  [
    'rpc/infoGetTransactionV1',
    'rpc_response/info_get_transaction_result_v1.json',
    'result',
    'InfoGetTransactionResultV1Compatible'
  ],
  [
    'rpc/transactionWithEra',
    'era/transaction_with_era.json',
    'data',
    'InfoGetTransactionResultV1Compatible'
  ],
  [
    'rpc/addReservation',
    'rpc_response/add_reservation_transaction.json',
    null,
    'InfoGetTransactionResultV1Compatible'
  ],
  [
    'rpc/transactionWithKeys',
    'transaction/transaction_with_keys.json',
    null,
    'InfoGetTransactionResultV1Compatible'
  ],
  [
    'rpc/transactionWithListU8',
    'transaction/transaction_with_list_u8.json',
    null,
    'InfoGetTransactionResultV1Compatible'
  ],
  [
    'rpc/transactionBidAddr',
    'transaction/get_transaction_bid_addr.json',
    null,
    'InfoGetTransactionResultV1Compatible'
  ],
  [
    'rpc/transactionNullResults',
    'transaction/get_transaction_with_null_execution_results.json',
    'result',
    'InfoGetTransactionResultV1Compatible'
  ],
  [
    'rpc/infoGetDeploy',
    'rpc_response/info_get_deploy.json',
    null,
    'InfoGetDeployResult'
  ],
  [
    'rpc/deployNullResults',
    'deploy/get_deploy_with_null_execution_results.json',
    'result',
    'InfoGetDeployResult'
  ],
  [
    'rpc/stateGetAccountInfo',
    'account/state_get_account_info.json',
    null,
    'StateGetAccountInfo'
  ]
];

const jsonRoundTrip = {};

for (const [name, file, pick, className] of CORPUS) {
  const raw = readFixture(file);
  const input = pick ? raw[pick] : raw;
  const serializer = new TypedJSON(sdk[className]);
  const parsed = serializer.parse(input);

  if (!parsed) throw new Error(`${name}: ${className} parsed to undefined`);

  // A few of these do not survive re-serialization even in 5.1.0. Record that
  // fact rather than skipping the case: the branch has to fail the same way.
  let record;
  try {
    record = { sha256: sha256(canonical(serializer.toPlainJson(parsed))) };
  } catch (error) {
    record = { serializeError: error.message };
  }

  jsonRoundTrip[name] = { class: className, ...record };
}

// ---------------------------------------------------------------------------
// 2. Byte encodings of the transactions and deploys in the corpus
// ---------------------------------------------------------------------------

const hex = bytes => Buffer.from(bytes).toString('hex');

const transactionBytes = {};

for (const [name, file, pick] of CORPUS.filter(c =>
  c[3].includes('Transaction')
)) {
  const raw = readFixture(file);
  const result = sdk.InfoGetTransactionResult.fromJSON(pick ? raw[pick] : raw);
  const transaction = result.transaction;

  transactionBytes[name] = {
    hash: transaction.hash.toHex(),
    bytes: hex(transaction.toBytes())
  };
}

for (const [name, file, pick] of CORPUS.filter(
  c => c[3] === 'InfoGetDeployResult'
)) {
  const raw = readFixture(file);
  const deploy = new TypedJSON(sdk.InfoGetDeployResult).parse(
    pick ? raw[pick] : raw
  ).deploy;

  transactionBytes[name] = {
    hash: deploy.hash.toHex(),
    bytes: hex(deploy.toBytes())
  };
}

// ---------------------------------------------------------------------------
// 3. Every prefixed key string that appears anywhere in the corpus
// ---------------------------------------------------------------------------

const PREFIXES = Object.values(sdk.PrefixName);

const collectStrings = (node, out) => {
  if (typeof node === 'string') out.add(node);
  else if (Array.isArray(node)) node.forEach(n => collectStrings(n, out));
  else if (node && typeof node === 'object')
    Object.values(node).forEach(n => collectStrings(n, out));
  return out;
};

// `compat/` holds the output of this script. Walking it would feed the previous
// golden's own recorded values back in as inputs, so which strings get sampled
// would depend on the last run rather than on the corpus.
const walk = dir =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap(e =>
      e.isDirectory()
        ? e.name === 'compat'
          ? []
          : walk(path.join(dir, e.name))
        : e.name.endsWith('.json')
          ? [path.join(dir, e.name)]
          : []
    );

const allStrings = new Set();
for (const file of walk(dataDir)) {
  collectStrings(JSON.parse(fs.readFileSync(file, 'utf8')), allStrings);
}

// Keep a bounded, deterministic sample per prefix so the golden stays reviewable.
const PER_PREFIX = 4;
const byPrefix = new Map();

for (const value of [...allStrings].sort()) {
  const prefix = PREFIXES.filter(p => value.startsWith(p)).sort(
    (a, b) => b.length - a.length
  )[0];
  if (!prefix) continue;
  const bucket = byPrefix.get(prefix) ?? [];
  if (bucket.length >= PER_PREFIX) continue;
  bucket.push(value);
  byPrefix.set(prefix, bucket);
}

const keys = [];

for (const [prefix, values] of [...byPrefix.entries()].sort()) {
  for (const source of values) {
    let record;
    try {
      const key = sdk.Key.newKey(source);
      record = {
        source,
        prefix,
        type: key.type,
        toString: key.toString(),
        toJSON: key.toJSON(),
        bytes: hex(key.bytes()),
        // Round-tripping through the byte form is the encode/decode pair the
        // node itself uses, so it has to survive the version change too.
        fromBytes: sdk.Key.fromBytes(key.bytes()).result.toString()
      };
    } catch (error) {
      record = { source, prefix, error: error.message };
    }
    keys.push(record);
  }
}

// ---------------------------------------------------------------------------
// 4. The concrete classes whose constructors or comparison changed
// ---------------------------------------------------------------------------

const HASH_HEX =
  '0e5a1a2c8b19b9c0f4d2e6f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1';
const OTHER_HEX = 'bb'.repeat(32);

const hashSerializer = new TypedJSON(sdk.TransactionHash);

const transactionHash = {
  fromDeployHash: {
    json: hashSerializer.toPlainJson(
      sdk.TransactionHash.fromDeployHash(sdk.Hash.fromHex(HASH_HEX))
    ),
    toHex: sdk.TransactionHash.fromDeployHash(
      sdk.Hash.fromHex(HASH_HEX)
    ).toHex(),
    bytes: hex(
      sdk.TransactionHash.fromDeployHash(sdk.Hash.fromHex(HASH_HEX)).toBytes()
    )
  },
  fromTransactionHash: {
    json: hashSerializer.toPlainJson(
      sdk.TransactionHash.fromTransactionHash(sdk.Hash.fromHex(HASH_HEX))
    ),
    toHex: sdk.TransactionHash.fromTransactionHash(
      sdk.Hash.fromHex(HASH_HEX)
    ).toHex(),
    bytes: hex(
      sdk.TransactionHash.fromTransactionHash(
        sdk.Hash.fromHex(HASH_HEX)
      ).toBytes()
    )
  },
  parsedDeploy: {
    json: hashSerializer.toPlainJson(
      hashSerializer.parse({ Deploy: HASH_HEX })
    ),
    toHex: hashSerializer.parse({ Deploy: HASH_HEX }).toHex()
  },
  parsedVersion1: {
    json: hashSerializer.toPlainJson(
      hashSerializer.parse({ Version1: HASH_HEX })
    ),
    toHex: hashSerializer.parse({ Version1: HASH_HEX }).toHex()
  }
};

const transferHashSerializer = new TypedJSON(sdk.TransferHash);
const transferHash = ['transfer-' + HASH_HEX, HASH_HEX].map(source => {
  const value = new sdk.TransferHash(source);
  return {
    source,
    toHex: value.toHex(),
    originPrefix: value.originPrefix,
    toPrefixedString: value.toPrefixedString(),
    json: transferHashSerializer.toPlainJson(value)
  };
});

const fromBytesSource = new sdk.TransferHash(
  Uint8Array.from(Buffer.from(HASH_HEX, 'hex'))
);
transferHash.push({
  source: 'Uint8Array',
  toHex: fromBytesSource.toHex(),
  originPrefix: fromBytesSource.originPrefix,
  toPrefixedString: fromBytesSource.toPrefixedString(),
  json: transferHashSerializer.toPlainJson(fromBytesSource)
});

// `Hash#equals` was asymmetric across the Hash/TransactionHash boundary. Record
// what 5.1.0 answered — including the cases where it threw — so the branch's
// behaviour can be compared against it rather than assumed.
const evaluate = fn => {
  try {
    return { value: fn() };
  } catch (error) {
    return { threw: error.constructor.name };
  }
};

const plainHash = sdk.Hash.fromHex(HASH_HEX);
const otherHash = sdk.Hash.fromHex(OTHER_HEX);
const deployVariant = sdk.TransactionHash.fromDeployHash(
  sdk.Hash.fromHex(HASH_HEX)
);

const equality = {
  'plain.equals(plainSame)': evaluate(() =>
    plainHash.equals(sdk.Hash.fromHex(HASH_HEX))
  ),
  'plain.equals(plainOther)': evaluate(() => plainHash.equals(otherHash)),
  'transactionHash.equals(plain)': evaluate(() =>
    deployVariant.equals(plainHash)
  ),
  'plain.equals(transactionHash)': evaluate(() =>
    plainHash.equals(deployVariant)
  ),
  // The variant typedjson builds: no constructor arguments, members assigned
  // afterwards. This is the pair that disagreed in 5.1.0.
  'parsedTransactionHash.equals(plain)': evaluate(() =>
    hashSerializer.parse({ Deploy: HASH_HEX }).equals(plainHash)
  ),
  'plain.equals(parsedTransactionHash)': evaluate(() =>
    plainHash.equals(hashSerializer.parse({ Deploy: HASH_HEX }))
  ),
  'plain.equals(parsedTransactionHashOther)': evaluate(() =>
    plainHash.equals(hashSerializer.parse({ Deploy: OTHER_HEX }))
  ),
  'transferHash.equals(plain)': evaluate(() =>
    new sdk.TransferHash(HASH_HEX).equals(plainHash)
  ),
  'plain.equals(transferHash)': evaluate(() =>
    plainHash.equals(new sdk.TransferHash(HASH_HEX))
  )
};

// ---------------------------------------------------------------------------
// 5. URef, and the PrefixName enum itself
// ---------------------------------------------------------------------------

const UREF_SOURCES = [...allStrings]
  .filter(s => s.startsWith('uref-'))
  .sort()
  .slice(0, 6);

const urefs = UREF_SOURCES.map(source => {
  const uref = sdk.URef.fromString(source);
  return {
    source,
    toString: uref.toString(),
    toPrefixedString: uref.toPrefixedString(),
    bytes: hex(uref.bytes()),
    json: uref.toJSON()
  };
});

const prefixNames = { ...sdk.PrefixName };

// ---------------------------------------------------------------------------
// 6. Key material: PEM/DER for both algorithms, and signatures
// ---------------------------------------------------------------------------

const RAW_PRIVATE_KEYS = [
  '0000000000000000000000000000000000000000000000000000000000000001',
  '00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff',
  '7c1a0c9f7f2d3e4b5a69788796a5b4c3d2e1f00918273645546372819a0b1c2d'
];

const MESSAGE = Buffer.from(
  'casper-js-sdk cross-version compatibility',
  'utf8'
);

const keypair = [];

for (const algorithm of [
  sdk.KeyAlgorithm.ED25519,
  sdk.KeyAlgorithm.SECP256K1
]) {
  for (const rawPrivateKey of RAW_PRIVATE_KEYS) {
    const privateKey = sdk.PrivateKey.fromHex(rawPrivateKey, algorithm);

    keypair.push({
      algorithm: sdk.KeyAlgorithm[algorithm],
      algorithmId: algorithm,
      rawPrivateKey,
      privatePem: privateKey.toPem(),
      publicPem: privateKey.publicKey.toPem(),
      publicKeyHex: privateKey.publicKey.toHex(),
      publicKeyJson: privateKey.publicKey.toJSON(),
      publicKeyBytes: hex(privateKey.publicKey.bytes()),
      accountHash: privateKey.publicKey.accountHash().toPrefixedString(),
      // Both curves sign deterministically here (ed25519 by construction,
      // secp256k1 through RFC 6979), so the signature is a stable vector.
      signature: hex(privateKey.signAndAddAlgorithmBytes(MESSAGE))
    });
  }
}

// ---------------------------------------------------------------------------
// 7. The committed secp256k1 DER vectors, pushed back through 5.1.0's asn1.js
//    codec. `encodePrivate`/`encodePublic` are not on the public API, so this
//    reaches them the way the SDK does — through PrivateKey/PublicKey PEM.
// ---------------------------------------------------------------------------

// `InfoGetStatusResult` gets its own record rather than a corpus digest,
// because it is the one class whose output is deliberately *not* identical:
// 5.1.0 could not serialize `available_block_range` at all and silently dropped
// it. Both the parsed values and the exact document 5.1.0 emitted are recorded,
// so the test can assert that the only difference is the restored field.
const statusSerializer = new TypedJSON(sdk.InfoGetStatusResult);
const statusJson = readFixture('rpc_response/get_status.json').result;
const status = statusSerializer.parse(statusJson);
const infoGetStatusSerialized = statusSerializer.toPlainJson(status);

if ('available_block_range' in infoGetStatusSerialized) {
  throw new Error(
    'expected 5.1.0 to drop available_block_range — the recording is no longer describing the bug it exists to pin'
  );
}

const infoGetStatusParsed = {
  apiVersion: status.apiVersion,
  protocolVersion: status.protocolVersion,
  buildVersion: status.buildVersion,
  chainSpecName: status.chainSpecName,
  ourPublicSigningKey: status.ourPublicSigningKey,
  startingStateRootHash: status.startingStateRootHash,
  roundLength: status.roundLength,
  uptime: status.uptime,
  reactorState: status.reactorState,
  lastProgress: status.lastProgress.toJSON(),
  lastAddedBlockInfo: {
    hash: status.lastAddedBlockInfo.hash.toHex(),
    height: status.lastAddedBlockInfo.height,
    eraID: status.lastAddedBlockInfo.eraID,
    stateRootHash: status.lastAddedBlockInfo.stateRootHash.toHex(),
    creator: status.lastAddedBlockInfo.creator.toHex()
  },
  peers: status.peers.map(peer => ({
    nodeId: peer.nodeId,
    address: peer.address
  })),
  availableBlockRange: status.availableBlockRange,
  latestSwitchBlockHash: status.latestSwitchBlockHash.toHex(),
  blockSync: {
    historicalBlockHash: status.blockSync.historical.blockHash.toHex(),
    historicalBlockHeight: status.blockSync.historical.blockHeight,
    historicalAcquisitionState: status.blockSync.historical.acquisitionState,
    forwardBlockHash: status.blockSync.forward.blockHash.toHex(),
    forwardBlockHeight: status.blockSync.forward.blockHeight,
    forwardAcquisitionState: status.blockSync.forward.acquisitionState
  }
};

const derVectors = readFixture('keypair/secp256k1_der_vectors.json').map(
  vector => {
    const privateKey = sdk.PrivateKey.fromPem(
      vector.privatePem,
      sdk.KeyAlgorithm.SECP256K1
    );

    return {
      privateKeyHex: vector.privateKeyHex,
      // Re-emitted from the recorded PEM: proves the vector is what 5.1.0 both
      // reads and writes, not merely something it happens to accept.
      privatePem: privateKey.toPem(),
      publicPem: privateKey.publicKey.toPem(),
      publicKeyHex: privateKey.publicKey.toHex(),
      accountHash: privateKey.publicKey.accountHash().toPrefixedString()
    };
  }
);

// ---------------------------------------------------------------------------

const golden = {
  generatedFrom: 'casper-js-sdk@' + sdkVersion,
  message: MESSAGE.toString('hex'),
  hashHex: HASH_HEX,
  otherHashHex: OTHER_HEX,
  jsonRoundTrip,
  transactionBytes,
  keys,
  urefs,
  transactionHash,
  transferHash,
  equality,
  prefixNames,
  keypair,
  derVectors,
  infoGetStatusParsed,
  infoGetStatusSerialized
};

fs.writeFileSync(outFile, JSON.stringify(golden, null, 2) + '\n');
console.log('wrote', outFile);
console.log('  jsonRoundTrip:', Object.keys(jsonRoundTrip).length);
console.log('  transactionBytes:', Object.keys(transactionBytes).length);
console.log('  keys:', keys.length);
console.log('  urefs:', urefs.length);
console.log('  keypair:', keypair.length);
