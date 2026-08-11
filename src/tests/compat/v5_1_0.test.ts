import { sha256 } from '@noble/hashes/sha256';
import { TypedJSON } from 'typedjson';
import { expect } from 'vitest';

import {
  ChainGetBlockResultV1Compatible,
  InfoGetDeployResult,
  InfoGetStatusResult,
  InfoGetTransactionResult,
  InfoGetTransactionResultV1Compatible,
  StateGetAccountInfo
} from '../../rpc';
import {
  Bid,
  Conversions,
  EraSummary,
  Hash,
  Key,
  KeyAlgorithm,
  PrefixName,
  PrivateKey,
  PublicKey,
  StoredValue,
  TransactionHash,
  Transform,
  TransformKey,
  TransferHash,
  URef
} from '../../types';
import {
  addReservationTransactionJson,
  auctionBidV1Json,
  auctionBidV2Json,
  eraInfoResultJson,
  eraSummaryJson,
  eraSummaryV2DelegatorKindJson,
  getBlockByHashJson,
  getDeployWithNullExecutionResults,
  getStatusJson,
  getTransactionBidAddr,
  getTransactionWithNullExecutionResults,
  infoGetDeployJson,
  infoGetTransactionResultV1Json,
  stateGetAccountInfoJson,
  stateItemResultV1Json,
  stateItemResultV2Json,
  storedBidJson,
  transactionWithArgsKeys,
  transactionWithEraJson,
  transactionWithListU8,
  v5_1_0Golden,
  writeAccountV1Json,
  writeAccountV2Json,
  writeContractV2Json
} from '../data';

// Everything in this file compares the working tree against a recording of
// casper-js-sdk@5.1.0 taken from the registry (see
// `scripts/generate-compat-golden.js`). The contract being tested is bidirectional:
//
//   - anything 5.1.0 wrote — a PEM key file, an RPC payload, a signed
//     transaction — must still parse here, and
//   - anything written here must still be readable by 5.1.0.
//
// Byte-for-byte equality of the *output* is what buys the second direction: if
// this branch emits exactly what 5.1.0 emitted, then 5.1.0 can necessarily read
// it back. So the assertions below are equality against the recording, not
// merely "it parses".

const golden = v5_1_0Golden;

/**
 * Stable stringification with object keys sorted, so JSON key ordering — which
 * carries no meaning — cannot make a digest differ. Must stay identical to the
 * function of the same name in `scripts/generate-compat-golden.js`.
 */
const canonical = (value: any): string => {
  if (value === null || typeof value !== 'object')
    return JSON.stringify(value) ?? 'null';
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  return (
    '{' +
    Object.keys(value)
      .sort()
      .filter(key => value[key] !== undefined)
      .map(key => JSON.stringify(key) + ':' + canonical(value[key]))
      .join(',') +
    '}'
  );
};

const digest = (value: any): string =>
  Conversions.encodeBase16(sha256(new TextEncoder().encode(canonical(value))));

const hex = (bytes: Uint8Array): string => Conversions.encodeBase16(bytes);

describe('compatibility with casper-js-sdk@5.1.0', () => {
  it('is comparing against a 5.1.0 recording', () => {
    expect(golden.generatedFrom).to.equal('casper-js-sdk@5.1.0');
  });

  // ------------------------------------------------------------------------
  // JSON: parse a 5.1.0-era document, re-serialize, and require the result to
  // be the document 5.1.0 itself would have produced.
  // ------------------------------------------------------------------------
  describe('JSON round-trips over the fixture corpus', () => {
    const CORPUS: [string, any, any][] = [
      ['storedValue/eraInfoResult', StoredValue, eraInfoResultJson],
      [
        'storedValue/stateItemV1',
        StoredValue,
        stateItemResultV1Json.stored_value
      ],
      [
        'storedValue/stateItemV2',
        StoredValue,
        stateItemResultV2Json.stored_value
      ],
      ['storedValue/storedBid', StoredValue, storedBidJson],
      ['bid/auctionV1', Bid, auctionBidV1Json],
      ['bid/auctionV2', Bid, auctionBidV2Json],
      ['eraSummary/example', EraSummary, eraSummaryJson],
      ['eraSummary/v2DelegatorKind', EraSummary, eraSummaryV2DelegatorKindJson],
      ['transform/writeAccountV1', TransformKey, writeAccountV1Json],
      ['transform/writeAccountV2', TransformKey, writeAccountV2Json],
      ['transform/writeContractV2', Transform, writeContractV2Json],
      // `InfoGetStatusResult` is absent by design — see its own block below.
      [
        'rpc/chainGetBlock',
        ChainGetBlockResultV1Compatible,
        getBlockByHashJson.result
      ],
      [
        'rpc/infoGetTransactionV1',
        InfoGetTransactionResultV1Compatible,
        infoGetTransactionResultV1Json.result
      ],
      [
        'rpc/transactionWithEra',
        InfoGetTransactionResultV1Compatible,
        transactionWithEraJson.data
      ],
      [
        'rpc/addReservation',
        InfoGetTransactionResultV1Compatible,
        addReservationTransactionJson
      ],
      [
        'rpc/transactionWithKeys',
        InfoGetTransactionResultV1Compatible,
        transactionWithArgsKeys
      ],
      [
        'rpc/transactionWithListU8',
        InfoGetTransactionResultV1Compatible,
        transactionWithListU8
      ],
      [
        'rpc/transactionBidAddr',
        InfoGetTransactionResultV1Compatible,
        getTransactionBidAddr
      ],
      [
        'rpc/transactionNullResults',
        InfoGetTransactionResultV1Compatible,
        getTransactionWithNullExecutionResults.result
      ],
      ['rpc/infoGetDeploy', InfoGetDeployResult, infoGetDeployJson],
      [
        'rpc/deployNullResults',
        InfoGetDeployResult,
        getDeployWithNullExecutionResults.result
      ],
      ['rpc/stateGetAccountInfo', StateGetAccountInfo, stateGetAccountInfoJson]
    ];

    it('covers every case the golden recorded', () => {
      expect(CORPUS.map(([name]) => name).sort()).to.deep.equal(
        Object.keys(golden.jsonRoundTrip).sort()
      );
    });

    CORPUS.forEach(([name, constructor, input]) => {
      it(`serializes ${name} exactly as 5.1.0 did`, () => {
        const serializer = new TypedJSON(constructor);
        const parsed = serializer.parse(input);

        expect(parsed, `${name} failed to parse`).to.not.be.undefined;
        expect(digest(serializer.toPlainJson(parsed!))).to.equal(
          (golden.jsonRoundTrip as Record<string, { sha256: string }>)[name]
            .sha256
        );
      });
    });
  });

  // `InfoGetStatusResult` is the one class whose output is deliberately not
  // identical to 5.1.0's, so it is held out of the digest corpus above.
  //
  // Its `available_block_range` member used to be declared
  // (`src/rpc/response.ts`) with a `constructor:` thunk that returned an object
  // of `jsonMember` decorators rather than a class — not something typedjson can
  // use. 5.1.0 therefore dropped the field from everything it serialized, and
  // under native ES classes typedjson gave up on the whole document and returned
  // `undefined`. It is now a real `@jsonObject` class.
  //
  // So the compatibility claim here is a superset, not an equality: the parse
  // side is unchanged, every field 5.1.0 emitted is emitted identically, and
  // `available_block_range` is added back.
  describe('InfoGetStatusResult', () => {
    const serializer = new TypedJSON(InfoGetStatusResult);
    const status = serializer.parse(getStatusJson.result)!;
    const expected = golden.infoGetStatusParsed;

    it('serializes at all — 5.1.0 emitted a document, so must this', () => {
      // Guards the native-class failure specifically: with the broken
      // declaration `toPlainJson` resolves to `undefined` here, which no
      // assertion about individual fields would ever reach.
      const serialized = serializer.toPlainJson(status);

      expect(serialized).to.be.an('object');
      expect(Object.keys(serialized!)).to.include.members(
        Object.keys(golden.infoGetStatusSerialized)
      );
    });

    it('emits every field 5.1.0 emitted, byte for byte', () => {
      const serialized = {
        ...(serializer.toPlainJson(status) as Record<string, unknown>)
      };

      // The single intended addition; everything else must match exactly.
      delete serialized.available_block_range;

      expect(serialized).to.deep.equal(golden.infoGetStatusSerialized);
    });

    it('restores the available_block_range that 5.1.0 dropped', () => {
      const serialized = serializer.toPlainJson(status) as Record<
        string,
        unknown
      >;

      expect(golden.infoGetStatusSerialized).to.not.have.property(
        'available_block_range'
      );
      // Round-trips to the value that was in the response to begin with, which
      // is what makes the added field safe for 5.1.0 to read back.
      expect(serialized.available_block_range).to.deep.equal(
        getStatusJson.result.available_block_range
      );
    });

    it('parses a 5.1.0-era status response to the same values', () => {
      expect(status.apiVersion).to.equal(expected.apiVersion);
      expect(status.protocolVersion).to.equal(expected.protocolVersion);
      expect(status.buildVersion).to.equal(expected.buildVersion);
      expect(status.chainSpecName).to.equal(expected.chainSpecName);
      expect(status.ourPublicSigningKey).to.equal(expected.ourPublicSigningKey);
      expect(status.startingStateRootHash).to.equal(
        expected.startingStateRootHash
      );
      expect(status.roundLength).to.equal(expected.roundLength);
      expect(status.uptime).to.equal(expected.uptime);
      expect(status.reactorState).to.equal(expected.reactorState);
      expect(status.lastProgress.toJSON()).to.equal(expected.lastProgress);
      expect(status.latestSwitchBlockHash.toHex()).to.equal(
        expected.latestSwitchBlockHash
      );
      expect(status.availableBlockRange).to.deep.equal(
        expected.availableBlockRange
      );
    });

    it('parses the nested block info and peers to the same values', () => {
      expect({
        hash: status.lastAddedBlockInfo.hash.toHex(),
        height: status.lastAddedBlockInfo.height,
        eraID: status.lastAddedBlockInfo.eraID,
        stateRootHash: status.lastAddedBlockInfo.stateRootHash.toHex(),
        creator: status.lastAddedBlockInfo.creator.toHex()
      }).to.deep.equal(expected.lastAddedBlockInfo);

      expect(
        status.peers.map(peer => ({
          nodeId: peer.nodeId,
          address: peer.address
        }))
      ).to.deep.equal(expected.peers);

      expect({
        historicalBlockHash: status.blockSync.historical!.blockHash!.toHex(),
        historicalBlockHeight: status.blockSync.historical!.blockHeight,
        historicalAcquisitionState:
          status.blockSync.historical!.acquisitionState,
        forwardBlockHash: status.blockSync.forward!.blockHash!.toHex(),
        forwardBlockHeight: status.blockSync.forward!.blockHeight,
        forwardAcquisitionState: status.blockSync.forward!.acquisitionState
      }).to.deep.equal(expected.blockSync);
    });
  });

  // ------------------------------------------------------------------------
  // Bytes: the encoding a node actually verifies a signature over. A drift here
  // is an invalid transaction, not a cosmetic difference.
  // ------------------------------------------------------------------------
  describe('serialized transaction and deploy bytes', () => {
    const TRANSACTIONS: [string, any][] = [
      ['rpc/infoGetTransactionV1', infoGetTransactionResultV1Json.result],
      ['rpc/transactionWithEra', transactionWithEraJson.data],
      ['rpc/addReservation', addReservationTransactionJson],
      ['rpc/transactionWithKeys', transactionWithArgsKeys],
      ['rpc/transactionWithListU8', transactionWithListU8],
      ['rpc/transactionBidAddr', getTransactionBidAddr],
      [
        'rpc/transactionNullResults',
        getTransactionWithNullExecutionResults.result
      ]
    ];

    const DEPLOYS: [string, any][] = [
      ['rpc/infoGetDeploy', infoGetDeployJson],
      ['rpc/deployNullResults', getDeployWithNullExecutionResults.result]
    ];

    it('covers every case the golden recorded', () => {
      expect(
        [...TRANSACTIONS, ...DEPLOYS].map(([name]) => name).sort()
      ).to.deep.equal(Object.keys(golden.transactionBytes).sort());
    });

    TRANSACTIONS.forEach(([name, input]) => {
      it(`encodes the transaction in ${name} to the same bytes`, () => {
        const expected = (
          golden.transactionBytes as Record<
            string,
            { hash: string; bytes: string }
          >
        )[name];
        const { transaction } = InfoGetTransactionResult.fromJSON(input)!;

        expect(transaction.hash.toHex()).to.equal(expected.hash);
        expect(hex(transaction.toBytes())).to.equal(expected.bytes);
      });
    });

    DEPLOYS.forEach(([name, input]) => {
      it(`encodes the deploy in ${name} to the same bytes`, () => {
        const expected = (
          golden.transactionBytes as Record<
            string,
            { hash: string; bytes: string }
          >
        )[name];
        const { deploy } = new TypedJSON(InfoGetDeployResult).parse(input)!;

        expect(deploy!.hash.toHex()).to.equal(expected.hash);
        expect(hex(deploy!.toBytes())).to.equal(expected.bytes);
      });
    });
  });

  // ------------------------------------------------------------------------
  // Keys. `PrefixName` and `NamedKeyKind` were moved into their own modules to
  // break an import cycle; everything below is what must not have moved with
  // them.
  // ------------------------------------------------------------------------
  describe('key prefixes', () => {
    it('keeps every PrefixName member and value', () => {
      expect({ ...PrefixName }).to.deep.equal(golden.prefixNames);
    });

    it('still exports PrefixName from its original module path', async () => {
      // The enum now lives in `./PrefixName`; `Key.ts` re-exports it so the
      // published import path is unchanged.
      const fromKeyModule = await import('../../types/key/Key');
      expect(fromKeyModule.PrefixName).to.equal(PrefixName);
    });

    it('still exports NamedKeyKind from its original module path', async () => {
      const fromTransformModule = await import('../../types/Transform');
      const fromOwnModule = await import('../../types/NamedKeyKind');
      expect(fromTransformModule.NamedKeyKind).to.equal(
        fromOwnModule.NamedKeyKind
      );
    });
  });

  describe('Key string and byte forms', () => {
    golden.keys.forEach(vector => {
      const label = `${vector.source.slice(0, vector.prefix.length + 8)}…`;

      if ('error' in vector && vector.error) {
        it(`rejects ${label} the same way`, () => {
          // 5.1.0 could not build a Key from this prefix either. Silently
          // starting to accept it would change what `newKey` means.
          expect(() => Key.newKey(vector.source)).to.throw(vector.error!);
        });
        return;
      }

      it(`round-trips ${label}`, () => {
        const key = Key.newKey(vector.source);

        expect(key.type).to.equal(vector.type);
        expect(key.toString()).to.equal(vector.toString);
        expect(key.toJSON()).to.equal(vector.toJSON);
        expect(hex(key.bytes())).to.equal(vector.bytes);
        // Decoding the 5.1.0 byte form has to land on the same key.
        expect(
          Key.fromBytes(
            Conversions.decodeBase16(vector.bytes!)
          ).result.toString()
        ).to.equal(vector.fromBytes);
      });
    });
  });

  describe('URef', () => {
    golden.urefs.forEach(vector => {
      it(`round-trips ${vector.source.slice(0, 13)}…`, () => {
        const uref = URef.fromString(vector.source);

        // `toString` dropped a dead `(3 || 2)` sub-expression; the rendered
        // string must be unchanged by that.
        expect(uref.toString()).to.equal(vector.toString);
        expect(uref.toPrefixedString()).to.equal(vector.toPrefixedString);
        expect(uref.toJSON()).to.equal(vector.json);
        expect(hex(uref.bytes())).to.equal(vector.bytes);
      });
    });
  });

  // ------------------------------------------------------------------------
  // The two constructors that used to call `super(...)` from inside an `if`.
  // ------------------------------------------------------------------------
  describe('TransactionHash', () => {
    const serializer = new TypedJSON(TransactionHash);

    it('serializes the Deploy variant as 5.1.0 did', () => {
      const value = TransactionHash.fromDeployHash(
        Hash.fromHex(golden.hashHex)
      );

      expect(serializer.toPlainJson(value)).to.deep.equal(
        golden.transactionHash.fromDeployHash.json
      );
      expect(value.toHex()).to.equal(
        golden.transactionHash.fromDeployHash.toHex
      );
      expect(hex(value.toBytes())).to.equal(
        golden.transactionHash.fromDeployHash.bytes
      );
    });

    it('serializes the Version1 variant as 5.1.0 did', () => {
      const value = TransactionHash.fromTransactionHash(
        Hash.fromHex(golden.hashHex)
      );

      expect(serializer.toPlainJson(value)).to.deep.equal(
        golden.transactionHash.fromTransactionHash.json
      );
      expect(value.toHex()).to.equal(
        golden.transactionHash.fromTransactionHash.toHex
      );
      expect(hex(value.toBytes())).to.equal(
        golden.transactionHash.fromTransactionHash.bytes
      );
    });

    it('parses and re-emits a 5.1.0 Deploy hash document unchanged', () => {
      const parsed = serializer.parse({ Deploy: golden.hashHex })!;

      expect(parsed.toHex()).to.equal(
        golden.transactionHash.parsedDeploy.toHex
      );
      expect(serializer.toPlainJson(parsed)).to.deep.equal(
        golden.transactionHash.parsedDeploy.json
      );
    });

    it('parses and re-emits a 5.1.0 Version1 hash document unchanged', () => {
      const parsed = serializer.parse({ Version1: golden.hashHex })!;

      expect(parsed.toHex()).to.equal(
        golden.transactionHash.parsedVersion1.toHex
      );
      expect(serializer.toPlainJson(parsed)).to.deep.equal(
        golden.transactionHash.parsedVersion1.json
      );
    });
  });

  describe('TransferHash', () => {
    const serializer = new TypedJSON(TransferHash);

    golden.transferHash.forEach(vector => {
      it(`builds from ${vector.source.slice(0, 16)}… as 5.1.0 did`, () => {
        const value = new TransferHash(
          vector.source === 'Uint8Array'
            ? Conversions.decodeBase16(golden.hashHex)
            : vector.source
        );

        expect(value.toHex()).to.equal(vector.toHex);
        expect(value.originPrefix).to.equal(vector.originPrefix);
        expect(value.toPrefixedString()).to.equal(vector.toPrefixedString);
        expect(serializer.toPlainJson(value)).to.deep.equal(vector.json);
      });
    });
  });

  describe('Hash#equals', () => {
    const plain = Hash.fromHex(golden.hashHex);
    const other = Hash.fromHex(golden.otherHashHex);
    const parsedTransactionHash = new TypedJSON(TransactionHash).parse({
      Deploy: golden.hashHex
    })!;

    const CASES: Record<string, () => boolean> = {
      'plain.equals(plainSame)': () =>
        plain.equals(Hash.fromHex(golden.hashHex)),
      'plain.equals(plainOther)': () => plain.equals(other),
      'transactionHash.equals(plain)': () =>
        TransactionHash.fromDeployHash(Hash.fromHex(golden.hashHex)).equals(
          plain
        ),
      'plain.equals(transactionHash)': () =>
        plain.equals(
          TransactionHash.fromDeployHash(Hash.fromHex(golden.hashHex))
        ),
      'parsedTransactionHash.equals(plain)': () =>
        parsedTransactionHash.equals(plain),
      'transferHash.equals(plain)': () =>
        new TransferHash(golden.hashHex).equals(plain),
      'plain.equals(transferHash)': () =>
        plain.equals(new TransferHash(golden.hashHex))
    };

    Object.entries(CASES).forEach(([name, run]) => {
      it(`answers ${name} as 5.1.0 did`, () => {
        const recorded = (
          golden.equality as Record<string, { value?: boolean; threw?: string }>
        )[name];

        expect(recorded.threw, `${name} threw in 5.1.0`).to.be.undefined;
        expect(run()).to.equal(recorded.value);
      });
    });

    // The one deliberate divergence. `equals` used to read the private
    // `hashBytes` field off its argument, and private access in TypeScript is
    // class-scoped rather than instance-scoped, so it bypassed
    // `TransactionHash`'s override. On a typedjson-built `TransactionHash` —
    // the shape every RPC and SSE response produces — that field is the
    // zero-filled placeholder, so 5.1.0 threw a TypeError here instead of
    // answering. Reading through `toBytes()` makes the comparison symmetric.
    it('now answers, rather than throwing, where 5.1.0 threw', () => {
      expect(
        (golden.equality as Record<string, { threw?: string }>)[
          'plain.equals(parsedTransactionHash)'
        ].threw
      ).to.equal('TypeError');

      expect(plain.equals(parsedTransactionHash)).to.equal(true);
      expect(parsedTransactionHash.equals(plain)).to.equal(true);
      expect(other.equals(parsedTransactionHash)).to.equal(false);
      expect(parsedTransactionHash.equals(other)).to.equal(false);
    });
  });

  // ------------------------------------------------------------------------
  // Key material. The secp256k1 DER codec was swapped from asn1.js to
  // @peculiar/asn1-*, so this is the change with the largest blast radius: a
  // key file written by 5.1.0 that no longer loads locks a user out of funds.
  // ------------------------------------------------------------------------
  describe('key material', () => {
    const message = Conversions.decodeBase16(golden.message);

    golden.keypair.forEach(vector => {
      const algorithm = vector.algorithmId as KeyAlgorithm;
      const label = `${vector.algorithm} ${vector.rawPrivateKey.slice(0, 8)}…`;

      it(`emits the same PEM, public key and signature for ${label}`, () => {
        const privateKey = PrivateKey.fromHex(vector.rawPrivateKey, algorithm);

        expect(privateKey.toPem()).to.equal(vector.privatePem);
        expect(privateKey.publicKey.toPem()).to.equal(vector.publicPem);
        expect(privateKey.publicKey.toHex()).to.equal(vector.publicKeyHex);
        expect(privateKey.publicKey.toJSON()).to.equal(vector.publicKeyJson);
        expect(hex(privateKey.publicKey.bytes())).to.equal(
          vector.publicKeyBytes
        );
        expect(privateKey.publicKey.accountHash().toPrefixedString()).to.equal(
          vector.accountHash
        );
        expect(hex(privateKey.signAndAddAlgorithmBytes(message))).to.equal(
          vector.signature
        );
      });

      it(`reads the PEM 5.1.0 wrote for ${label}`, () => {
        const privateKey = PrivateKey.fromPem(vector.privatePem, algorithm);

        expect(privateKey.publicKey.toHex()).to.equal(vector.publicKeyHex);
        expect(hex(privateKey.signAndAddAlgorithmBytes(message))).to.equal(
          vector.signature
        );

        const publicKey = PublicKey.fromPem(vector.publicPem, algorithm);
        expect(publicKey.toHex()).to.equal(vector.publicKeyHex);
      });

      it(`verifies a signature 5.1.0 produced for ${label}`, () => {
        const publicKey = PublicKey.fromHex(vector.publicKeyHex);
        // The recorded signature carries the leading algorithm byte, which is
        // what `verifySignature` expects — it strips the byte itself.
        const signature = Conversions.decodeBase16(vector.signature);

        expect(publicKey.verifySignature(message, signature)).to.equal(true);
      });
    });

    // The DER vectors in `secp256k1_der_vectors.json` are asserted byte-for-byte
    // by `encoders.test.ts`. What is checked here is the other half: that those
    // recorded bytes are what a real 5.1.0 both reads and writes, reached
    // through the public API rather than through the encoder functions.
    describe('the recorded secp256k1 DER vectors', () => {
      golden.derVectors.forEach(vector => {
        it(`round-trips ${vector.privateKeyHex.slice(0, 8)}… through the public API`, () => {
          const privateKey = PrivateKey.fromPem(
            vector.privatePem,
            KeyAlgorithm.SECP256K1
          );

          expect(privateKey.toPem()).to.equal(vector.privatePem);
          expect(privateKey.publicKey.toPem()).to.equal(vector.publicPem);
          expect(privateKey.publicKey.toHex()).to.equal(vector.publicKeyHex);
          expect(
            privateKey.publicKey.accountHash().toPrefixedString()
          ).to.equal(vector.accountHash);
        });
      });
    });
  });
});
