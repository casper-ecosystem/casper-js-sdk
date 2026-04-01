import { expect } from 'chai';

import {
  Args,
  ContractHash,
  ExecutableDeployItem,
  StoredVersionedContractByHash,
  StoredVersionedContractByName,
  TransactionTarget
} from '../../types';

describe('TransactionTarget', () => {
  it('ignores null version for stored versioned contract by hash', () => {
    const session = new ExecutableDeployItem();
    session.storedVersionedContractByHash = new StoredVersionedContractByHash(
      ContractHash.fromJSON(
        'hash-0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
      ),
      'mint',
      Args.fromMap({})
    );
    (session.storedVersionedContractByHash as any).version = null;

    const target = TransactionTarget.newTransactionTargetFromSession(session);

    expect(target.stored?.id.byPackageHash?.version).to.equal(undefined);
  });

  it('keeps numeric version for stored versioned contract by hash', () => {
    const session = new ExecutableDeployItem();
    session.storedVersionedContractByHash = new StoredVersionedContractByHash(
      ContractHash.fromJSON(
        'hash-0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
      ),
      'mint',
      Args.fromMap({}),
      7
    );

    const target = TransactionTarget.newTransactionTargetFromSession(session);

    expect(target.stored?.id.byPackageHash?.version).to.equal(7);
  });

  it('ignores null version for stored versioned contract by name', () => {
    const session = new ExecutableDeployItem();
    session.storedVersionedContractByName = new StoredVersionedContractByName(
      'cep78',
      'mint',
      Args.fromMap({})
    );
    (session.storedVersionedContractByName as any).version = null;

    const target = TransactionTarget.newTransactionTargetFromSession(session);

    expect(target.stored?.id.byPackageName?.version).to.equal(undefined);
  });
});
