import { describe, it, expect } from 'vitest';
import { TypedJSON } from 'typedjson';
import { concat } from '@ethersproject/bytes';

import {
  Args,
  byteHash,
  CLValue,
  ContractHash,
  Deploy,
  DeployHeader,
  ExecutableDeployItem,
  KeyAlgorithm,
  ModuleBytes,
  PrivateKey,
  StoredContractByHash,
  StoredContractByName,
  StoredVersionedContractByHash,
  StoredVersionedContractByName,
  TransferDeployItem
} from '../../types';

const hex = (bytes: Uint8Array) => Buffer.from(bytes).toString('hex');

const contractHash = ContractHash.newContract('ab'.repeat(32));

function signedModuleBytesDeployJson() {
  const key = PrivateKey.generate(KeyAlgorithm.ED25519);
  const header = new DeployHeader('test-network');
  header.account = key.publicKey;

  const session = ExecutableDeployItem.newModuleBytes(
    Uint8Array.from([0x00, 0x61, 0x73, 0x6d]),
    Args.fromMap({ arbitrary: CLValue.newCLString('wasm') })
  );
  const deploy = Deploy.makeDeploy(
    header,
    ExecutableDeployItem.standardPayment('2500000000'),
    session
  );
  deploy.sign(key);

  return { json: Deploy.toJSON(deploy) as any, deploy, key };
}

/** Recomputes body_hash and hash over `bodyBytes`, so only the variant check can reject the JSON. */
function rehash(json: any, bodyBytes: Uint8Array) {
  json.header.body_hash = hex(byteHash(bodyBytes));
  const header = new TypedJSON(DeployHeader).parse(json.header)!;
  json.hash = hex(byteHash(header.toBytes()));
  json.approvals = [];
}

describe('ExecutableDeployItem', () => {
  describe('exactly one variant', () => {
    it('Deploy.fromJSON rejects a session holding ModuleBytes and Transfer', () => {
      const { json } = signedModuleBytesDeployJson();
      const recipient = PrivateKey.generate(KeyAlgorithm.ED25519).publicKey;
      json.session.Transfer = new TypedJSON(TransferDeployItem).toPlainJson(
        TransferDeployItem.newTransfer('1000000000', recipient, null, 1)
      );

      expect(() => Deploy.fromJSON(json)).toThrow(/exactly one variant/);
    });

    it.each([
      ['null', { ModuleBytes: null }],
      ['a string', { ModuleBytes: 'x' }]
    ])('fromJSON rejects a variant whose value is %s', (_name, json) => {
      expect(() => ExecutableDeployItem.fromJSON(json)).toThrow();
    });

    it('Deploy.fromJSON rejects a payment holding two variants', () => {
      const { json, deploy } = signedModuleBytesDeployJson();
      json.payment.StoredContractByName = {
        name: 'payment',
        entry_point: 'pay',
        args: []
      };
      rehash(json, concat([deploy.payment.bytes(), deploy.session.bytes()]));

      expect(() => Deploy.fromJSON(json)).toThrow();
    });

    it('Deploy.fromJSON rejects an empty session', () => {
      const { json, deploy } = signedModuleBytesDeployJson();
      json.session = {};
      rehash(json, deploy.payment.bytes());

      expect(() => Deploy.fromJSON(json)).toThrow();
    });

    it('bytes() throws when no variant is set', () => {
      expect(() => new ExecutableDeployItem().bytes()).toThrow();
    });

    it('bytes() throws when two variants are set', () => {
      const item = ExecutableDeployItem.newModuleBytes(
        new Uint8Array(),
        Args.fromMap({})
      );
      item.transfer = new TransferDeployItem(Args.fromMap({}));

      expect(() => item.bytes()).toThrow();
    });

    it('Deploy.fromJSON still accepts a single-variant deploy', () => {
      const { json, deploy } = signedModuleBytesDeployJson();

      expect(Deploy.fromJSON(json).hash.equals(deploy.hash)).toBe(true);
    });
  });

  describe('missing args', () => {
    it.each([
      [
        'ModuleBytes',
        () => new ModuleBytes(new Uint8Array(), undefined as any)
      ],
      [
        'StoredContractByHash',
        () => new StoredContractByHash(contractHash, 'ep', undefined as any)
      ],
      [
        'StoredContractByName',
        () => new StoredContractByName('name', 'ep', undefined as any)
      ],
      [
        'StoredVersionedContractByHash',
        () =>
          new StoredVersionedContractByHash(
            contractHash,
            'ep',
            undefined as any
          )
      ],
      [
        'StoredVersionedContractByName',
        () => new StoredVersionedContractByName('name', 'ep', undefined as any)
      ],
      ['Transfer', () => new TransferDeployItem(undefined as any)]
    ])('%s.bytes() throws instead of serializing no args', (_name, make) => {
      expect(() => make().bytes()).toThrow();
    });

    it('Deploy.fromJSON rejects a session variant without args', () => {
      const { json, deploy } = signedModuleBytesDeployJson();
      delete json.session.ModuleBytes.args;
      rehash(json, deploy.payment.bytes());

      expect(() => Deploy.fromJSON(json)).toThrow();
    });
  });

  describe('package version 0', () => {
    // Option<u32>: tag 1 then the u32 little-endian.
    const someZero = [1, 0, 0, 0, 0];

    it('StoredVersionedContractByHash serializes Some(0)', () => {
      const bytes = new StoredVersionedContractByHash(
        contractHash,
        'ep',
        Args.fromMap({}),
        0
      ).bytes();

      expect(Array.from(bytes.slice(32, 37))).toEqual(someZero);
    });

    it('StoredVersionedContractByName serializes Some(0)', () => {
      const nameBytes = CLValue.newCLString('name').bytes();
      const bytes = new StoredVersionedContractByName(
        'name',
        'ep',
        Args.fromMap({}),
        0
      ).bytes();

      expect(
        Array.from(bytes.slice(nameBytes.length, nameBytes.length + 5))
      ).toEqual(someZero);
    });

    it.each([
      ['0', 0, someZero],
      ['null', null, [0]]
    ])(
      'JSON version %s serializes as the node does',
      (_name, version, expected) => {
        const item = ExecutableDeployItem.fromJSON({
          StoredVersionedContractByHash: {
            hash: contractHash.toJSON(),
            entry_point: 'ep',
            version,
            args: []
          }
        });

        // Tag byte, then the 32-byte hash, then the Option<u32>.
        expect(
          Array.from(item.bytes().slice(33, 33 + expected.length))
        ).toEqual(expected);
      }
    );

    it('a deploy with version 0 round-trips through Deploy.fromJSON', () => {
      const key = PrivateKey.generate(KeyAlgorithm.ED25519);
      const header = new DeployHeader('test-network');
      header.account = key.publicKey;
      const session = new ExecutableDeployItem();
      session.storedVersionedContractByHash = new StoredVersionedContractByHash(
        contractHash,
        'ep',
        Args.fromMap({}),
        0
      );
      const deploy = Deploy.makeDeploy(
        header,
        ExecutableDeployItem.standardPayment('2500000000'),
        session
      );
      deploy.sign(key);

      const parsed = Deploy.fromJSON(Deploy.toJSON(deploy));

      expect(parsed.session.storedVersionedContractByHash!.version).toBe(0);
      expect(parsed.hash.equals(deploy.hash)).toBe(true);
    });

    it('an absent version still serializes None', () => {
      const bytes = new StoredVersionedContractByHash(
        contractHash,
        'ep',
        Args.fromMap({})
      ).bytes();

      expect(bytes[32]).toBe(0);
    });
  });
});
