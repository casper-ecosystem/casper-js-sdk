import { expect, vi } from 'vitest';
import { TypedJSON } from 'typedjson';

import { RpcClient } from '../../rpc/rpc_client';
import { IHandler } from '../../rpc/client';
import { RpcResponse, StateGetEntityResult } from '../../rpc/response';
import {
  AccountIdentifier,
  EntityIdentifier,
  Method,
  ParamBlockIdentifier,
  ParamDictionaryIdentifier,
  PurseIdentifier,
  RpcRequest
} from '../../rpc/request';
import {
  EntityAddr,
  KeyAlgorithm,
  NativeTransferBuilder,
  PrefixName,
  PrivateKey,
  TransactionV1,
  URef,
  UrefAccess
} from '../../types';
import {
  getStatusJson,
  getBlockByHashJson,
  infoGetDeployJson,
  stateGetAccountInfoJson
} from '../data';

// Filler for any field typed `Hash` where only the round-trip matters.
const HASH_HEX = '11'.repeat(32);
const HASH_HEX_2 = '22'.repeat(32);

const senderKey = PrivateKey.generate(KeyAlgorithm.ED25519);
const PK = senderKey.publicKey;
const PK_ACCOUNT_HASH = PK.accountHash();
const PK_ENTITY_ADDR = new EntityAddr(undefined, PK_ACCOUNT_HASH);
const PK_UREF = new URef(new Uint8Array(32).fill(7), UrefAccess.ReadWrite);

// Built from the prefix constant, not `PK_ACCOUNT_HASH.toJSON()`: asserting a
// param against the call that produced it passes whatever the serializer emits,
// separator bugs included.
const PK_ACCOUNT_HASH_JSON = PrefixName.Account + PK_ACCOUNT_HASH.toHex();

/** Marks a mocked RPC method as failing, so the handler returns an RPC error response instead of a result. */
class RpcFailure {
  constructor(
    public code: number,
    public message: string
  ) {}
}
const methodNotFound = (message = 'Method not found'): RpcFailure =>
  new RpcFailure(-32601, message);

const stateRootHashResult = {
  api_version: '2.0.0',
  state_root_hash: HASH_HEX
};

// Several client methods fetch the latest state root hash internally when none
// is supplied, so every handler answers it whether or not the test needs it.
const baseResults: Partial<Record<Method, unknown>> = {
  [Method.GetStateRootHash]: stateRootHashResult
};

function createHandler(resultsByMethod: Partial<Record<Method, unknown>>): {
  handler: IHandler;
  requests: RpcRequest[];
} {
  const requests: RpcRequest[] = [];
  const handler: IHandler = {
    processCall: vi.fn(async (request: RpcRequest) => {
      requests.push(request);

      if (!(request.method in resultsByMethod)) {
        throw new Error(
          `test bug: mock handler has no response configured for ${request.method}`
        );
      }

      const value = resultsByMethod[request.method];
      if (value instanceof RpcFailure) {
        return {
          version: '2.0',
          id: request.id,
          result: undefined,
          error: { code: value.code, message: value.message }
        } as unknown as RpcResponse;
      }

      return {
        version: '2.0',
        id: request.id,
        result: value
      } as unknown as RpcResponse;
    })
  };
  return { handler, requests };
}

interface MethodCase {
  name: string;
  invoke: (client: RpcClient) => Promise<unknown>;
  expectedMethod: Method;
  results: Partial<Record<Method, unknown>>;
  checkParams?: (params: any) => void;
  checkResult: (result: any) => void;
}

const auctionStateV1Result = (blockHeight: number) => ({
  api_version: '2.0.0',
  auction_state: {
    bids: [],
    block_height: blockHeight,
    era_validators: [],
    state_root_hash: HASH_HEX
  }
});

const auctionStateV2Result = (blockHeight: number) => ({
  api_version: '2.0.0',
  auction_state: {
    bids: [],
    block_height: blockHeight,
    era_validators: [],
    state_root_hash: HASH_HEX
  }
});

const eraSummaryResult = {
  api_version: '2.0.0',
  era_summary: {
    block_hash: HASH_HEX,
    era_id: 7,
    stored_value: {},
    state_root_hash: HASH_HEX_2,
    merkle_proof: 'proof'
  }
};

const rewardResult = {
  api_version: '2.0.0',
  delegation_rate: 10,
  era_id: 5,
  reward_amount: '100',
  switch_block_hash: HASH_HEX
};

const cases: MethodCase[] = [
  // --- deploys / transactions ---------------------------------------------
  {
    name: 'getDeploy',
    invoke: c => c.getDeploy(HASH_HEX),
    expectedMethod: Method.GetDeploy,
    results: { [Method.GetDeploy]: infoGetDeployJson },
    checkParams: params => {
      expect(params.deploy_hash).to.equal(HASH_HEX);
      expect(params.finalized_approvals).to.be.undefined;
    },
    checkResult: result => {
      expect(result.deploy.hash.toHex()).to.equal(
        infoGetDeployJson.deploy.hash
      );
    }
  },
  {
    name: 'getDeployFinalizedApproval',
    invoke: c => c.getDeployFinalizedApproval(HASH_HEX),
    expectedMethod: Method.GetDeploy,
    results: { [Method.GetDeploy]: infoGetDeployJson },
    checkParams: params => {
      expect(params.deploy_hash).to.equal(HASH_HEX);
      expect(params.finalized_approvals).to.be.true;
    },
    checkResult: result => {
      expect(result.deploy.hash.toHex()).to.equal(
        infoGetDeployJson.deploy.hash
      );
    }
  },
  {
    name: 'getTransactionByTransactionHash',
    invoke: c => c.getTransactionByTransactionHash(HASH_HEX),
    expectedMethod: Method.GetTransaction,
    results: { [Method.GetTransaction]: infoGetDeployJson },
    checkParams: params => {
      expect(params.transaction_hash).to.deep.equal({ Version1: HASH_HEX });
    },
    checkResult: result => {
      expect(result.transaction.hash.toHex()).to.equal(
        infoGetDeployJson.deploy.hash
      );
    }
  },
  {
    name: 'getTransactionByDeployHash',
    invoke: c => c.getTransactionByDeployHash(HASH_HEX),
    expectedMethod: Method.GetTransaction,
    results: { [Method.GetTransaction]: infoGetDeployJson },
    checkParams: params => {
      expect(params.transaction_hash).to.deep.equal({ Deploy: HASH_HEX });
    },
    checkResult: result => {
      expect(result.transaction.hash.toHex()).to.equal(
        infoGetDeployJson.deploy.hash
      );
    }
  },
  {
    name: 'getTransactionFinalizedApprovalByTransactionHash',
    invoke: c => c.getTransactionFinalizedApprovalByTransactionHash(HASH_HEX),
    expectedMethod: Method.GetTransaction,
    results: { [Method.GetTransaction]: infoGetDeployJson },
    checkParams: params => {
      expect(params.transaction_hash).to.deep.equal({ Version1: HASH_HEX });
      expect(params.finalized_approvals).to.be.true;
    },
    checkResult: result => {
      expect(result.transaction.hash.toHex()).to.equal(
        infoGetDeployJson.deploy.hash
      );
    }
  },
  {
    name: 'getTransactionFinalizedApprovalByDeployHash',
    invoke: c => c.getTransactionFinalizedApprovalByDeployHash(HASH_HEX),
    expectedMethod: Method.GetTransaction,
    results: { [Method.GetTransaction]: infoGetDeployJson },
    checkParams: params => {
      expect(params.transaction_hash).to.deep.equal({ Deploy: HASH_HEX });
      expect(params.finalized_approvals).to.be.true;
    },
    checkResult: result => {
      expect(result.transaction.hash.toHex()).to.equal(
        infoGetDeployJson.deploy.hash
      );
    }
  },

  // --- deprecated state_get_item / global state query ---------------------
  {
    name: 'getStateItem',
    // Deprecated but still shipped — kept honest until it is removed.
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    invoke: c => c.getStateItem(HASH_HEX_2, 'some-key', ['a', 'b']),
    expectedMethod: Method.GetStateItem,
    results: {
      [Method.GetStateItem]: { stored_value: {}, merkle_proof: 'proof' }
    },
    checkParams: params => {
      expect(params.state_root_hash).to.equal(HASH_HEX_2);
      expect(params.key).to.equal('some-key');
      expect(params.path).to.deep.equal(['a', 'b']);
    },
    checkResult: result => {
      expect(result.merkleProof).to.equal('proof');
    }
  },
  {
    name: 'queryLatestGlobalState',
    invoke: c => c.queryLatestGlobalState('some-key', []),
    expectedMethod: Method.QueryGlobalState,
    results: {
      [Method.QueryGlobalState]: {
        api_version: '2.0.0',
        stored_value: {},
        merkle_proof: 'proof'
      }
    },
    checkParams: params => {
      expect(params.key).to.equal('some-key');
      expect(params.state_identifier).to.be.undefined;
    },
    checkResult: result => expect(result.merkleProof).to.equal('proof')
  },
  // typedjson serializes a nested member only when it is a real instance of the
  // declared class — a plain object literal drops the state identifier, and the
  // node then answers about some other state.
  {
    name: 'queryGlobalStateByBlockHash',
    invoke: c => c.queryGlobalStateByBlockHash(HASH_HEX, 'some-key', []),
    expectedMethod: Method.QueryGlobalState,
    results: {
      [Method.QueryGlobalState]: {
        api_version: '2.0.0',
        stored_value: {},
        merkle_proof: 'proof'
      }
    },
    checkParams: params => {
      expect(params.state_identifier).to.deep.equal({ BlockHash: HASH_HEX });
    },
    checkResult: result => expect(result.merkleProof).to.equal('proof')
  },
  {
    name: 'queryGlobalStateByBlockHeight',
    invoke: c => c.queryGlobalStateByBlockHeight(42, 'some-key', []),
    expectedMethod: Method.QueryGlobalState,
    results: {
      [Method.QueryGlobalState]: {
        api_version: '2.0.0',
        stored_value: {},
        merkle_proof: 'proof'
      }
    },
    checkParams: params => {
      expect(params.state_identifier).to.deep.equal({ BlockHeight: 42 });
    },
    checkResult: result => expect(result.merkleProof).to.equal('proof')
  },
  {
    name: 'queryGlobalStateByStateHash',
    invoke: c => c.queryGlobalStateByStateHash(HASH_HEX_2, 'some-key', []),
    expectedMethod: Method.QueryGlobalState,
    results: {
      [Method.QueryGlobalState]: {
        api_version: '2.0.0',
        stored_value: {},
        merkle_proof: 'proof'
      }
    },
    checkParams: params => {
      expect(params.state_identifier).to.deep.equal({
        StateRootHash: HASH_HEX_2
      });
    },
    checkResult: result => expect(result.merkleProof).to.equal('proof')
  },

  // --- accounts -------------------------------------------------------------
  {
    name: 'getAccountInfoByBlockHash',
    invoke: c => c.getAccountInfoByBlockHash(HASH_HEX, PK),
    expectedMethod: Method.GetStateAccount,
    results: { [Method.GetStateAccount]: stateGetAccountInfoJson },
    checkParams: params => {
      expect(params.account_identifier).to.equal(PK.toHex());
      expect(params.block_identifier).to.deep.equal({ Hash: HASH_HEX });
    },
    checkResult: result =>
      expect(result.account.accountHash.toPrefixedString()).to.equal(
        stateGetAccountInfoJson.account.account_hash
      )
  },
  {
    name: 'getAccountInfoByBlockHeight',
    invoke: c => c.getAccountInfoByBlockHeight(42, PK),
    expectedMethod: Method.GetStateAccount,
    results: { [Method.GetStateAccount]: stateGetAccountInfoJson },
    checkParams: params => {
      expect(params.account_identifier).to.equal(PK.toHex());
      expect(params.block_identifier).to.deep.equal({ Height: 42 });
    },
    checkResult: result =>
      expect(result.account.accountHash.toPrefixedString()).to.equal(
        stateGetAccountInfoJson.account.account_hash
      )
  },
  {
    name: 'getAccountInfo (account hash identifier, no block identifier)',
    invoke: c => c.getAccountInfo(null, new AccountIdentifier(PK_ACCOUNT_HASH)),
    expectedMethod: Method.GetStateAccount,
    results: { [Method.GetStateAccount]: stateGetAccountInfoJson },
    checkParams: params => {
      expect(params.account_identifier).to.equal(PK_ACCOUNT_HASH_JSON);
      expect(params.block_identifier).to.be.undefined;
    },
    checkResult: result =>
      expect(result.account.accountHash.toPrefixedString()).to.equal(
        stateGetAccountInfoJson.account.account_hash
      )
  },
  {
    name: 'getAccountInfo (public key identifier, explicit block identifier)',
    invoke: c =>
      c.getAccountInfo(
        ParamBlockIdentifier.byHeight(9),
        new AccountIdentifier(undefined, PK)
      ),
    expectedMethod: Method.GetStateAccount,
    results: { [Method.GetStateAccount]: stateGetAccountInfoJson },
    checkParams: params => {
      expect(params.account_identifier).to.equal(PK.toHex());
      expect(params.block_identifier).to.deep.equal({ Height: 9 });
    },
    checkResult: result =>
      expect(result.account.accountHash.toPrefixedString()).to.equal(
        stateGetAccountInfoJson.account.account_hash
      )
  },

  // --- addressable entities --------------------------------------------------
  {
    name: 'getLatestEntity',
    invoke: c => c.getLatestEntity(EntityIdentifier.fromPublicKey(PK)),
    expectedMethod: Method.GetStateEntity,
    results: {
      [Method.GetStateEntity]: {
        api_version: '2.0.0',
        entity: { LegacyAccount: stateGetAccountInfoJson.account },
        merkle_proof: 'proof'
      }
    },
    checkParams: params => {
      expect(params.entity_identifier).to.deep.equal({ PublicKey: PK.toHex() });
      expect(params.block_identifier).to.be.undefined;
    },
    checkResult: result =>
      expect(
        result.entity.legacyAccount.accountHash.toPrefixedString()
      ).to.equal(stateGetAccountInfoJson.account.account_hash)
  },
  {
    name: 'getEntityByBlockHash',
    invoke: c =>
      c.getEntityByBlockHash(
        EntityIdentifier.fromAccountHash(PK_ACCOUNT_HASH),
        HASH_HEX
      ),
    expectedMethod: Method.GetStateEntity,
    results: {
      [Method.GetStateEntity]: {
        api_version: '2.0.0',
        entity: { LegacyAccount: stateGetAccountInfoJson.account },
        merkle_proof: 'proof'
      }
    },
    checkParams: params => {
      expect(params.entity_identifier).to.deep.equal({
        AccountHash: PK_ACCOUNT_HASH_JSON
      });
      expect(params.block_identifier).to.deep.equal({ Hash: HASH_HEX });
    },
    checkResult: result =>
      expect(
        result.entity.legacyAccount.accountHash.toPrefixedString()
      ).to.equal(stateGetAccountInfoJson.account.account_hash)
  },
  {
    name: 'getEntityByBlockHeight',
    invoke: c =>
      c.getEntityByBlockHeight(
        EntityIdentifier.fromEntityAddr(PK_ENTITY_ADDR),
        42
      ),
    expectedMethod: Method.GetStateEntity,
    results: {
      [Method.GetStateEntity]: {
        api_version: '2.0.0',
        entity: { LegacyAccount: stateGetAccountInfoJson.account },
        merkle_proof: 'proof'
      }
    },
    checkParams: params => {
      expect(params.entity_identifier).to.deep.equal({
        EntityAddr: PK_ENTITY_ADDR.toPrefixedString()
      });
      expect(params.block_identifier).to.deep.equal({ Height: 42 });
    },
    checkResult: result =>
      expect(
        result.entity.legacyAccount.accountHash.toPrefixedString()
      ).to.equal(stateGetAccountInfoJson.account.account_hash)
  },

  // --- blocks -----------------------------------------------------------------
  {
    name: 'getLatestBlock',
    invoke: c => c.getLatestBlock(),
    expectedMethod: Method.GetBlock,
    results: { [Method.GetBlock]: getBlockByHashJson.result },
    checkParams: params => expect(params).to.be.null,
    checkResult: result => {
      expect(result.block.hash.toHex()).to.equal(
        getBlockByHashJson.result.block_with_signatures.block.Version2.hash
      );
      expect(result.block.height).to.equal(
        getBlockByHashJson.result.block_with_signatures.block.Version2.header
          .height
      );
    }
  },
  {
    name: 'getBlockByHash',
    invoke: c =>
      c.getBlockByHash(
        getBlockByHashJson.result.block_with_signatures.block.Version2.hash
      ),
    expectedMethod: Method.GetBlock,
    results: { [Method.GetBlock]: getBlockByHashJson.result },
    checkParams: params => {
      expect(params.block_identifier).to.deep.equal({
        Hash: getBlockByHashJson.result.block_with_signatures.block.Version2
          .hash
      });
    },
    checkResult: result => {
      expect(result.block.hash.toHex()).to.equal(
        getBlockByHashJson.result.block_with_signatures.block.Version2.hash
      );
    }
  },
  {
    name: 'getBlockByHeight',
    invoke: c => c.getBlockByHeight(3444515),
    expectedMethod: Method.GetBlock,
    results: { [Method.GetBlock]: getBlockByHashJson.result },
    checkParams: params => {
      expect(params.block_identifier).to.deep.equal({ Height: 3444515 });
    },
    checkResult: result => {
      expect(result.block.height).to.equal(3444515);
    }
  },
  {
    name: 'getLatestBlockTransfers',
    invoke: c => c.getLatestBlockTransfers(),
    expectedMethod: Method.GetBlockTransfers,
    results: {
      [Method.GetBlockTransfers]: {
        api_version: '2.0.0',
        block_hash: HASH_HEX,
        transfers: []
      }
    },
    checkParams: params => expect(params).to.be.null,
    checkResult: result => {
      expect(result.blockHash).to.equal(HASH_HEX);
      expect(result.transfers).to.deep.equal([]);
    }
  },
  {
    name: 'getBlockTransfersByHash',
    invoke: c => c.getBlockTransfersByHash(HASH_HEX),
    expectedMethod: Method.GetBlockTransfers,
    results: {
      [Method.GetBlockTransfers]: {
        api_version: '2.0.0',
        block_hash: HASH_HEX,
        transfers: []
      }
    },
    checkParams: params =>
      expect(params.block_identifier).to.deep.equal({ Hash: HASH_HEX }),
    checkResult: result => expect(result.blockHash).to.equal(HASH_HEX)
  },
  {
    name: 'getBlockTransfersByHeight',
    invoke: c => c.getBlockTransfersByHeight(42),
    expectedMethod: Method.GetBlockTransfers,
    results: {
      [Method.GetBlockTransfers]: {
        api_version: '2.0.0',
        block_hash: HASH_HEX,
        transfers: []
      }
    },
    checkParams: params =>
      expect(params.block_identifier).to.deep.equal({ Height: 42 }),
    checkResult: result => expect(result.blockHash).to.equal(HASH_HEX)
  },

  // --- era summary / era info --------------------------------------------------
  {
    name: 'getEraSummaryLatest',
    invoke: c => c.getEraSummaryLatest(),
    expectedMethod: Method.GetEraSummary,
    results: { [Method.GetEraSummary]: eraSummaryResult },
    checkParams: params => expect(params).to.be.null,
    checkResult: result => expect(result.eraSummary.eraID).to.equal(7)
  },
  {
    name: 'getEraSummaryByHash',
    invoke: c => c.getEraSummaryByHash(HASH_HEX),
    expectedMethod: Method.GetEraSummary,
    results: { [Method.GetEraSummary]: eraSummaryResult },
    checkParams: params =>
      expect(params.block_identifier).to.deep.equal({ Hash: HASH_HEX }),
    checkResult: result => expect(result.eraSummary.eraID).to.equal(7)
  },
  {
    name: 'getEraSummaryByHeight',
    invoke: c => c.getEraSummaryByHeight(42),
    expectedMethod: Method.GetEraSummary,
    results: { [Method.GetEraSummary]: eraSummaryResult },
    checkParams: params =>
      expect(params.block_identifier).to.deep.equal({ Height: 42 }),
    checkResult: result => expect(result.eraSummary.eraID).to.equal(7)
  },
  {
    name: 'getEraInfoLatest',
    invoke: c => c.getEraInfoLatest(),
    expectedMethod: Method.GetEraInfo,
    results: { [Method.GetEraInfo]: eraSummaryResult },
    checkParams: params => expect(params).to.be.null,
    checkResult: result => expect(result.eraSummary.eraID).to.equal(7)
  },
  {
    name: 'getEraInfoByBlockHeight',
    invoke: c => c.getEraInfoByBlockHeight(42),
    expectedMethod: Method.GetEraInfo,
    results: { [Method.GetEraInfo]: eraSummaryResult },
    checkParams: params =>
      expect(params.block_identifier).to.deep.equal({ Height: 42 }),
    checkResult: result => expect(result.eraSummary.eraID).to.equal(7)
  },
  {
    name: 'getEraInfoByBlockHash',
    invoke: c => c.getEraInfoByBlockHash(HASH_HEX),
    expectedMethod: Method.GetEraInfo,
    results: { [Method.GetEraInfo]: eraSummaryResult },
    checkParams: params =>
      expect(params.block_identifier).to.deep.equal({ Hash: HASH_HEX }),
    checkResult: result => expect(result.eraSummary.eraID).to.equal(7)
  },

  // --- state root hash ----------------------------------------------------------
  {
    name: 'getStateRootHashLatest',
    invoke: c => c.getStateRootHashLatest(),
    expectedMethod: Method.GetStateRootHash,
    results: { [Method.GetStateRootHash]: stateRootHashResult },
    checkParams: params => expect(params).to.be.null,
    checkResult: result =>
      expect(result.stateRootHash.toHex()).to.equal(HASH_HEX)
  },
  {
    name: 'getStateRootHashByHash',
    invoke: c => c.getStateRootHashByHash(HASH_HEX),
    expectedMethod: Method.GetStateRootHash,
    results: { [Method.GetStateRootHash]: stateRootHashResult },
    checkParams: params =>
      expect(params.block_identifier).to.deep.equal({ Hash: HASH_HEX }),
    checkResult: result =>
      expect(result.stateRootHash.toHex()).to.equal(HASH_HEX)
  },
  {
    name: 'getStateRootHashByHeight',
    invoke: c => c.getStateRootHashByHeight(42),
    expectedMethod: Method.GetStateRootHash,
    results: { [Method.GetStateRootHash]: stateRootHashResult },
    checkParams: params =>
      expect(params.block_identifier).to.deep.equal({ Height: 42 }),
    checkResult: result =>
      expect(result.stateRootHash.toHex()).to.equal(HASH_HEX)
  },

  // --- misc info -------------------------------------------------------------------
  {
    name: 'getValidatorChangesInfo',
    invoke: c => c.getValidatorChangesInfo(),
    expectedMethod: Method.GetValidatorChanges,
    results: {
      [Method.GetValidatorChanges]: { api_version: '2.0.0', changes: [] }
    },
    checkParams: params => expect(params).to.be.null,
    checkResult: result => expect(result.changes).to.deep.equal([])
  },
  {
    name: 'getStatus',
    invoke: c => c.getStatus(),
    expectedMethod: Method.GetStatus,
    results: { [Method.GetStatus]: getStatusJson.result },
    checkParams: params => expect(params).to.be.null,
    checkResult: result =>
      expect(result.chainSpecName).to.equal(getStatusJson.result.chainspec_name)
  },
  {
    name: 'getPeers',
    invoke: c => c.getPeers(),
    expectedMethod: Method.GetPeers,
    results: {
      [Method.GetPeers]: {
        api_version: '2.0.0',
        peers: [{ node_id: 'peer-1', address: '1.2.3.4:35000' }]
      }
    },
    checkParams: params => expect(params).to.be.null,
    checkResult: result => {
      expect(result.peers).to.have.lengthOf(1);
      expect(result.peers[0].nodeId).to.equal('peer-1');
    }
  },
  {
    name: 'getChainspec',
    invoke: c => c.getChainspec(),
    expectedMethod: Method.InfoGetChainspec,
    results: {
      [Method.InfoGetChainspec]: {
        api_version: '2.0.0',
        chainspec_bytes: { chainspec_bytes: 'AA==' }
      }
    },
    checkParams: params => expect(params).to.be.null,
    checkResult: result =>
      expect(result.chainspecBytes.chainspecBytes).to.equal('AA==')
  },

  // --- balances --------------------------------------------------------------------
  {
    name: 'queryLatestBalance',
    invoke: c => c.queryLatestBalance(PurseIdentifier.fromPublicKey(PK)),
    expectedMethod: Method.QueryBalance,
    results: {
      [Method.QueryBalance]: { api_version: '2.0.0', balance: '500' }
    },
    checkParams: params => {
      expect(params.purse_identifier).to.deep.equal({
        main_purse_under_public_key: PK.toHex()
      });
      expect(params.state_identifier).to.be.undefined;
    },
    checkResult: result => expect(result.balance.toString()).to.equal('500')
  },
  {
    name: 'queryBalanceByBlockHeight',
    invoke: c =>
      c.queryBalanceByBlockHeight(PurseIdentifier.fromPublicKey(PK), 42),
    expectedMethod: Method.QueryBalance,
    results: {
      [Method.QueryBalance]: { api_version: '2.0.0', balance: '500' }
    },
    checkParams: params =>
      expect(params.state_identifier).to.deep.equal({ BlockHeight: 42 }),
    checkResult: result => expect(result.balance.toString()).to.equal('500')
  },
  {
    name: 'queryBalanceByBlockHash',
    invoke: c =>
      c.queryBalanceByBlockHash(PurseIdentifier.fromPublicKey(PK), HASH_HEX),
    expectedMethod: Method.QueryBalance,
    results: {
      [Method.QueryBalance]: { api_version: '2.0.0', balance: '500' }
    },
    checkParams: params =>
      expect(params.state_identifier).to.deep.equal({ BlockHash: HASH_HEX }),
    checkResult: result => expect(result.balance.toString()).to.equal('500')
  },
  {
    name: 'queryBalanceByStateRootHash',
    invoke: c =>
      c.queryBalanceByStateRootHash(
        PurseIdentifier.fromPublicKey(PK),
        HASH_HEX_2
      ),
    expectedMethod: Method.QueryBalance,
    results: {
      [Method.QueryBalance]: { api_version: '2.0.0', balance: '500' }
    },
    checkParams: params =>
      expect(params.state_identifier).to.deep.equal({
        StateRootHash: HASH_HEX_2
      }),
    checkResult: result => expect(result.balance.toString()).to.equal('500')
  },
  {
    name: 'queryLatestBalanceDetails',
    invoke: c => c.queryLatestBalanceDetails(PurseIdentifier.fromPublicKey(PK)),
    expectedMethod: Method.QueryBalanceDetails,
    results: {
      [Method.QueryBalanceDetails]: {
        api_version: '2.0.0',
        total_balance: '1000',
        available_balance: '900',
        total_balance_proof: 'proof',
        holds: []
      }
    },
    checkParams: params => expect(params.state_identifier).to.be.undefined,
    checkResult: result => {
      expect(result.totalBalance.toString()).to.equal('1000');
      expect(result.availableBalance.toString()).to.equal('900');
    }
  },
  {
    name: 'queryBalanceDetailsByBlockHeight',
    invoke: c =>
      c.queryBalanceDetailsByBlockHeight(PurseIdentifier.fromPublicKey(PK), 42),
    expectedMethod: Method.QueryBalanceDetails,
    results: {
      [Method.QueryBalanceDetails]: {
        api_version: '2.0.0',
        total_balance: '1000',
        available_balance: '900',
        total_balance_proof: 'proof',
        holds: []
      }
    },
    checkParams: params =>
      expect(params.state_identifier).to.deep.equal({ BlockHeight: 42 }),
    checkResult: result =>
      expect(result.totalBalance.toString()).to.equal('1000')
  },
  {
    name: 'queryBalanceDetailsByBlockHash',
    invoke: c =>
      c.queryBalanceDetailsByBlockHash(
        PurseIdentifier.fromPublicKey(PK),
        HASH_HEX
      ),
    expectedMethod: Method.QueryBalanceDetails,
    results: {
      [Method.QueryBalanceDetails]: {
        api_version: '2.0.0',
        total_balance: '1000',
        available_balance: '900',
        total_balance_proof: 'proof',
        holds: []
      }
    },
    checkParams: params =>
      expect(params.state_identifier).to.deep.equal({ BlockHash: HASH_HEX }),
    checkResult: result =>
      expect(result.totalBalance.toString()).to.equal('1000')
  },
  {
    name: 'queryBalanceDetailsByStateRootHash',
    invoke: c =>
      c.queryBalanceDetailsByStateRootHash(
        PurseIdentifier.fromPublicKey(PK),
        HASH_HEX_2
      ),
    expectedMethod: Method.QueryBalanceDetails,
    results: {
      [Method.QueryBalanceDetails]: {
        api_version: '2.0.0',
        total_balance: '1000',
        available_balance: '900',
        total_balance_proof: 'proof',
        holds: []
      }
    },
    checkParams: params =>
      expect(params.state_identifier).to.deep.equal({
        StateRootHash: HASH_HEX_2
      }),
    checkResult: result =>
      expect(result.totalBalance.toString()).to.equal('1000')
  },
  {
    name: 'getLatestBalance (chains through getStateRootHashLatest)',
    invoke: c => c.getLatestBalance(PK_UREF.toPrefixedString()),
    expectedMethod: Method.GetStateBalance,
    results: {
      [Method.GetStateBalance]: { api_version: '2.0.0', balance_value: '777' }
    },
    checkParams: params => {
      expect(params.state_root_hash).to.equal(HASH_HEX);
      expect(params.purse_uref).to.equal(PK_UREF.toPrefixedString());
    },
    checkResult: result =>
      expect(result.balanceValue.toString()).to.equal('777')
  },
  {
    name: 'getBalanceByStateRootHash',
    invoke: c =>
      c.getBalanceByStateRootHash(PK_UREF.toPrefixedString(), HASH_HEX_2),
    expectedMethod: Method.GetStateBalance,
    results: {
      [Method.GetStateBalance]: { api_version: '2.0.0', balance_value: '777' }
    },
    checkParams: params => {
      expect(params.state_root_hash).to.equal(HASH_HEX_2);
    },
    checkResult: result =>
      expect(result.balanceValue.toString()).to.equal('777')
  },

  // --- dictionary items --------------------------------------------------------------
  {
    name: 'getDictionaryItem',
    invoke: c =>
      c.getDictionaryItem(HASH_HEX_2, PK_UREF.toPrefixedString(), 'item-key'),
    expectedMethod: Method.GetDictionaryItem,
    results: {
      [Method.GetDictionaryItem]: {
        api_version: '2.0.0',
        dictionary_key: 'resolved-key',
        stored_value: {},
        merkle_proof: 'proof'
      }
    },
    checkParams: params => {
      expect(params.state_root_hash).to.equal(HASH_HEX_2);
      expect(params.dictionary_identifier).to.deep.equal({
        URef: {
          dictionary_item_key: 'item-key',
          seed_uref: PK_UREF.toPrefixedString()
        }
      });
    },
    checkResult: result => expect(result.dictionaryKey).to.equal('resolved-key')
  },
  {
    name: 'getDictionaryItemByIdentifier',
    invoke: c =>
      c.getDictionaryItemByIdentifier(
        HASH_HEX_2,
        new ParamDictionaryIdentifier(
          undefined,
          undefined,
          undefined,
          'dict-addr'
        )
      ),
    expectedMethod: Method.GetDictionaryItem,
    results: {
      [Method.GetDictionaryItem]: {
        api_version: '2.0.0',
        dictionary_key: 'resolved-key',
        stored_value: {},
        merkle_proof: 'proof'
      }
    },
    checkParams: params => {
      expect(params.dictionary_identifier).to.deep.equal({
        Dictionary: 'dict-addr'
      });
    },
    checkResult: result => expect(result.dictionaryKey).to.equal('resolved-key')
  },

  // --- rewards -----------------------------------------------------------------------
  {
    name: 'getLatestValidatorReward',
    invoke: c => c.getLatestValidatorReward(PK),
    expectedMethod: Method.GetReward,
    results: { [Method.GetReward]: rewardResult },
    checkParams: params => {
      expect(params.validator).to.equal(PK.toHex());
      expect(params.delegator).to.be.undefined;
      expect(params.era_identifier).to.be.undefined;
    },
    checkResult: result => expect(result.eraID).to.equal(5)
  },
  {
    name: 'getValidatorRewardByEraID',
    invoke: c => c.getValidatorRewardByEraID(PK, 9),
    expectedMethod: Method.GetReward,
    results: { [Method.GetReward]: rewardResult },
    checkParams: params =>
      expect(params.era_identifier).to.deep.equal({ Era: 9 }),
    checkResult: result => expect(result.eraID).to.equal(5)
  },
  {
    name: 'getValidatorRewardByBlockHash',
    invoke: c => c.getValidatorRewardByBlockHash(PK, HASH_HEX),
    expectedMethod: Method.GetReward,
    results: { [Method.GetReward]: rewardResult },
    checkParams: params =>
      expect(params.era_identifier).to.deep.equal({
        Block: { Hash: HASH_HEX }
      }),
    checkResult: result => expect(result.eraID).to.equal(5)
  },
  {
    name: 'getValidatorRewardByBlockHeight',
    invoke: c => c.getValidatorRewardByBlockHeight(PK, 42),
    expectedMethod: Method.GetReward,
    results: { [Method.GetReward]: rewardResult },
    checkParams: params =>
      expect(params.era_identifier).to.deep.equal({
        Block: { Height: 42 }
      }),
    checkResult: result => expect(result.eraID).to.equal(5)
  },
  {
    name: 'getLatestDelegatorReward',
    invoke: c => c.getLatestDelegatorReward(PK, PK),
    expectedMethod: Method.GetReward,
    results: { [Method.GetReward]: rewardResult },
    checkParams: params => {
      expect(params.validator).to.equal(PK.toHex());
      expect(params.delegator).to.equal(PK.toHex());
    },
    checkResult: result => expect(result.eraID).to.equal(5)
  },
  {
    name: 'getDelegatorRewardByEraID',
    invoke: c => c.getDelegatorRewardByEraID(PK, PK, 9),
    expectedMethod: Method.GetReward,
    results: { [Method.GetReward]: rewardResult },
    checkParams: params =>
      expect(params.era_identifier).to.deep.equal({ Era: 9 }),
    checkResult: result => expect(result.eraID).to.equal(5)
  },
  {
    name: 'getDelegatorRewardByBlockHash',
    invoke: c => c.getDelegatorRewardByBlockHash(PK, PK, HASH_HEX),
    expectedMethod: Method.GetReward,
    results: { [Method.GetReward]: rewardResult },
    checkParams: params =>
      expect(params.era_identifier).to.deep.equal({
        Block: { Hash: HASH_HEX }
      }),
    checkResult: result => expect(result.eraID).to.equal(5)
  },
  {
    name: 'getDelegatorRewardByBlockHeight',
    invoke: c => c.getDelegatorRewardByBlockHeight(PK, PK, 42),
    expectedMethod: Method.GetReward,
    results: { [Method.GetReward]: rewardResult },
    checkParams: params =>
      expect(params.era_identifier).to.deep.equal({
        Block: { Height: 42 }
      }),
    checkResult: result => expect(result.eraID).to.equal(5)
  },

  // --- auction info (v1 direct calls; v2-to-v1 fallback is covered separately) -----
  {
    name: 'getLatestAuctionInfoV1',
    invoke: c => c.getLatestAuctionInfoV1(),
    expectedMethod: Method.GetAuctionInfo,
    results: { [Method.GetAuctionInfo]: auctionStateV1Result(100) },
    checkParams: params => expect(params).to.be.null,
    checkResult: result => expect(result.auctionState.blockHeight).to.equal(100)
  },
  {
    name: 'getAuctionInfoV1ByHash',
    invoke: c => c.getAuctionInfoV1ByHash(HASH_HEX),
    expectedMethod: Method.GetAuctionInfo,
    results: { [Method.GetAuctionInfo]: auctionStateV1Result(100) },
    checkParams: params =>
      expect(params.block_identifier).to.deep.equal({ Hash: HASH_HEX }),
    checkResult: result => expect(result.auctionState.blockHeight).to.equal(100)
  },
  {
    name: 'getAuctionInfoV1ByHeight',
    invoke: c => c.getAuctionInfoV1ByHeight(42),
    expectedMethod: Method.GetAuctionInfo,
    results: { [Method.GetAuctionInfo]: auctionStateV1Result(100) },
    checkParams: params =>
      expect(params.block_identifier).to.deep.equal({ Height: 42 }),
    checkResult: result => expect(result.auctionState.blockHeight).to.equal(100)
  }
];

describe('RpcClient — method table (request method, param marshalling, typed result)', () => {
  for (const tc of cases) {
    it(tc.name, async () => {
      const { handler, requests } = createHandler({
        ...baseResults,
        ...tc.results
      });
      const client = new RpcClient(handler);

      const result = await tc.invoke(client);

      const call = requests.find(r => r.method === tc.expectedMethod);
      expect(call, `expected a ${tc.expectedMethod} request to have been sent`)
        .to.exist;
      tc.checkParams?.(call!.params);
      tc.checkResult(result);
    });
  }
});

describe('RpcClient — PurseIdentifier variants', () => {
  it.each([
    [
      'public key',
      PurseIdentifier.fromPublicKey(PK),
      { main_purse_under_public_key: PK.toHex() }
    ],
    [
      'account hash',
      PurseIdentifier.fromAccountHash(PK_ACCOUNT_HASH),
      { main_purse_under_account_hash: PK_ACCOUNT_HASH_JSON }
    ],
    [
      'entity addr',
      PurseIdentifier.fromEntityAddr(PK_ENTITY_ADDR),
      { main_purse_under_entity_addr: PK_ENTITY_ADDR.toPrefixedString() }
    ],
    [
      'uref',
      PurseIdentifier.fromUref(PK_UREF),
      { purse_uref: PK_UREF.toPrefixedString() }
    ]
  ])(
    'marshals the %s variant under its own request key',
    async (_label, identifier, expectedParam) => {
      const { handler, requests } = createHandler({
        ...baseResults,
        [Method.QueryBalance]: { api_version: '2.0.0', balance: '1' }
      });
      const client = new RpcClient(handler);

      await client.queryLatestBalance(identifier);

      expect(requests[0].params.purse_identifier).to.deep.equal(expectedParam);
    }
  );
});

describe('RpcClient — getAccountInfo local validation', () => {
  it('throws before making any RPC call when the account identifier has neither hash nor key', async () => {
    const { handler, requests } = createHandler(baseResults);
    const client = new RpcClient(handler);

    await expect(
      client.getAccountInfo(null, new AccountIdentifier())
    ).rejects.toThrow('account identifier is empty');
    expect(requests).to.have.lengthOf(0);
  });
});

describe('RpcClient — getStateEntity account spellings', () => {
  const entityResult = (entity: unknown) => ({
    api_version: '2.0.0',
    entity,
    merkle_proof: 'proof'
  });

  const fetchEntity = async (entity: unknown) => {
    const { handler } = createHandler({
      ...baseResults,
      [Method.GetStateEntity]: entityResult(entity)
    });
    return await new RpcClient(handler).getLatestEntity(
      EntityIdentifier.fromPublicKey(PK)
    );
  };

  // A 2.x node keys an account entity `Account`; only 1.x says `LegacyAccount`.
  // Before the normalization the 2.x spelling matched no member and parsed to an
  // `EntityOrAccount` with everything undefined — no error, just no account.
  it.each([['Account'], ['LegacyAccount']])(
    'resolves an entity keyed %s to legacyAccount',
    async key => {
      const result = await fetchEntity({
        [key]: stateGetAccountInfoJson.account
      });

      expect(result.entity.legacyAccount).to.not.be.undefined;
      expect(
        result.entity.legacyAccount!.accountHash.toPrefixedString()
      ).to.equal(stateGetAccountInfoJson.account.account_hash);
      expect(result.entity.addressableEntity).to.be.undefined;
    }
  );

  it('does not invent an account when the response carries no entity', async () => {
    const result = await fetchEntity(null);

    expect(result.entity).to.be.undefined;
  });

  // Pins the asymmetry as intended rather than accidental, together with the
  // escape hatch that makes it acceptable.
  it('re-serializes an Account payload as LegacyAccount, and keeps the original in rawJSON', async () => {
    const entity = { Account: stateGetAccountInfoJson.account };
    const result = await fetchEntity(entity);

    const plain: any = new TypedJSON(StateGetEntityResult).toPlainJson(result);

    expect(Object.keys(plain.entity)).to.deep.equal(['LegacyAccount']);
    expect(result.rawJSON.entity).to.deep.equal(entity);
  });
});

describe('RpcClient — auction info v2 -> v1 fallback', () => {
  it('getLatestAuctionInfo retries against v1 when v2 is not found, and returns the v1-derived state', async () => {
    const { handler, requests } = createHandler({
      ...baseResults,
      [Method.GetAuctionInfoV2]: methodNotFound(),
      [Method.GetAuctionInfo]: auctionStateV1Result(55)
    });
    const client = new RpcClient(handler);

    const result = await client.getLatestAuctionInfo();

    expect(requests.map(r => r.method)).to.deep.equal([
      Method.GetAuctionInfoV2,
      Method.GetAuctionInfo
    ]);
    expect(result.auctionState.blockHeight).to.equal(55);
  });

  it('getAuctionInfoByHash retries against v1 when v2 is not found', async () => {
    const { handler, requests } = createHandler({
      ...baseResults,
      [Method.GetAuctionInfoV2]: methodNotFound(),
      [Method.GetAuctionInfo]: auctionStateV1Result(55)
    });
    const client = new RpcClient(handler);

    const result = await client.getAuctionInfoByHash(HASH_HEX);

    expect(requests.map(r => r.method)).to.deep.equal([
      Method.GetAuctionInfoV2,
      Method.GetAuctionInfo
    ]);
    expect(result.auctionState.blockHeight).to.equal(55);
  });

  it('getAuctionInfoByHeight retries against v1 when v2 is not found', async () => {
    const { handler, requests } = createHandler({
      ...baseResults,
      [Method.GetAuctionInfoV2]: methodNotFound(),
      [Method.GetAuctionInfo]: auctionStateV1Result(55)
    });
    const client = new RpcClient(handler);

    const result = await client.getAuctionInfoByHeight(42);

    expect(requests.map(r => r.method)).to.deep.equal([
      Method.GetAuctionInfoV2,
      Method.GetAuctionInfo
    ]);
    expect(result.auctionState.blockHeight).to.equal(55);
  });

  it('does not fall back to v1 when the v2 failure is unrelated to method availability', async () => {
    const { handler, requests } = createHandler({
      ...baseResults,
      [Method.GetAuctionInfoV2]: new RpcFailure(-32000, 'Internal error'),
      [Method.GetAuctionInfo]: auctionStateV1Result(55)
    });
    const client = new RpcClient(handler);

    await expect(client.getLatestAuctionInfo()).rejects.toThrow(
      'Internal error'
    );
    expect(requests.map(r => r.method)).to.deep.equal([
      Method.GetAuctionInfoV2
    ]);
  });

  it('does not call v2 at all for the explicit V2 accessor', async () => {
    const { handler, requests } = createHandler({
      ...baseResults,
      [Method.GetAuctionInfoV2]: auctionStateV2Result(77)
    });
    const client = new RpcClient(handler);

    const result = await client.getLatestAuctionInfoV2();

    expect(requests.map(r => r.method)).to.deep.equal([
      Method.GetAuctionInfoV2
    ]);
    expect(result.auctionState.blockHeight).to.equal(77);
  });
});

describe('RpcClient — putDeploy / putTransaction', () => {
  const transferTransaction = new NativeTransferBuilder()
    .from(PK)
    .target(PK)
    .amount('2500000000')
    .chainName('casper-net-1')
    .payment(100_000_000)
    .build();
  transferTransaction.sign(senderKey);

  const transferDeployWrapper = new NativeTransferBuilder()
    .from(PK)
    .target(PK)
    .amount('2500000000')
    .chainName('casper-net-1')
    .payment(100_000_000)
    .buildFor1_5();
  const transferDeploy = transferDeployWrapper.getDeploy()!;
  transferDeploy.sign(senderKey);

  it('putDeploy sends the deploy and unwraps the typed hash', async () => {
    const { handler, requests } = createHandler({
      ...baseResults,
      [Method.PutDeploy]: { api_version: '2.0.0', deploy_hash: HASH_HEX }
    });
    const client = new RpcClient(handler);

    const result = await client.putDeploy(transferDeploy);

    const call = requests.find(r => r.method === Method.PutDeploy)!;
    expect(call.params.deploy.hash).to.equal(transferDeploy.hash.toHex());
    expect(result.deployHash.toHex()).to.equal(HASH_HEX);
  });

  it('putTransaction sends the TransactionV1 wrapper and unwraps the typed hash', async () => {
    const { handler, requests } = createHandler({
      ...baseResults,
      [Method.PutTransaction]: {
        api_version: '2.0.0',
        transaction_hash: { Version1: HASH_HEX }
      }
    });
    const client = new RpcClient(handler);

    const result = await client.putTransaction(transferTransaction);

    const call = requests.find(r => r.method === Method.PutTransaction)!;
    expect(call.params.transaction.Version1.hash).to.equal(
      transferTransaction.hash.transactionV1?.toHex()
    );
    expect(result.transactionHash.transactionV1?.toHex()).to.equal(HASH_HEX);
  });
});

describe('RpcClient — waitForTransaction', () => {
  const buildSignedTransfer = () => {
    const tx = new NativeTransferBuilder()
      .from(PK)
      .target(PK)
      .amount('2500000000')
      .chainName('casper-net-1')
      .payment(100_000_000)
      .build();
    tx.sign(senderKey);
    return tx;
  };

  afterEach(() => {
    vi.useRealTimers();
  });

  it('polls until execution info appears, then resolves with the typed result', async () => {
    vi.useFakeTimers();
    const transaction = buildSignedTransfer();
    const txV1 = transaction.getTransactionV1()!;
    const pendingResult = {
      api_version: '2.0.0',
      transaction: {
        Version1: TransactionV1.toJSON(txV1)
      }
    };
    const confirmedResult = {
      ...pendingResult,
      execution_info: {
        block_hash: HASH_HEX,
        block_height: 1,
        execution_result: {
          Version1: {
            Success: {
              cost: '1',
              effect: { operations: [], transforms: [] },
              transfers: []
            }
          }
        }
      }
    };

    let call = 0;
    const handler: IHandler = {
      processCall: vi.fn(async request => {
        if (request.method !== Method.GetTransaction) {
          throw new Error('unexpected method ' + request.method);
        }
        call += 1;
        return {
          version: '2.0',
          id: request.id,
          result: call < 3 ? pendingResult : confirmedResult
        } as unknown as RpcResponse;
      })
    };
    const client = new RpcClient(handler);

    const resultPromise = client.waitForTransaction(transaction, 60_000);
    await vi.advanceTimersByTimeAsync(2000);
    const result = await resultPromise;

    expect(call).to.equal(3);
    expect(result.executionInfo?.executionResult.cost).to.equal(1);
  });

  it('rejects once the retry budget on transient errors is exhausted, without waiting in real time', async () => {
    vi.useFakeTimers();
    const transaction = buildSignedTransfer();
    const handler: IHandler = {
      processCall: vi.fn(async () => {
        throw new Error('network down');
      })
    };
    const client = new RpcClient(handler);

    const resultPromise = client.waitForTransaction(transaction, 60_000);
    const assertion = expect(resultPromise).rejects.toThrow(
      /Failed after 3 retries/
    );
    await vi.advanceTimersByTimeAsync(5000);
    await assertion;
  });

  it('rejects with a timeout once the deadline passes while the transaction stays unconfirmed', async () => {
    vi.useFakeTimers();
    const transaction = buildSignedTransfer();
    const txV1 = transaction.getTransactionV1()!;
    // Accepted by the node but never executed, so `executionInfo` stays absent
    // and the poll loop can only ever end at the deadline.
    const pendingResult = {
      api_version: '2.0.0',
      transaction: {
        Version1: TransactionV1.toJSON(txV1)
      }
    };
    const handler: IHandler = {
      processCall: vi.fn(
        async request =>
          ({
            version: '2.0',
            id: request.id,
            result: pendingResult
          }) as unknown as RpcResponse
      )
    };
    const client = new RpcClient(handler);

    const resultPromise = client.waitForTransaction(transaction, 1000);
    const assertion = expect(resultPromise).rejects.toThrow('Timeout');
    await vi.advanceTimersByTimeAsync(5000);
    await assertion;
  });

  it('stops polling once it has timed out', async () => {
    vi.useFakeTimers();
    const transaction = buildSignedTransfer();
    const txV1 = transaction.getTransactionV1()!;
    let calls = 0;
    const handler: IHandler = {
      processCall: vi.fn(async request => {
        calls++;
        return {
          version: '2.0',
          id: request.id,
          result: {
            api_version: '2.0.0',
            transaction: { Version1: TransactionV1.toJSON(txV1) }
          }
        } as unknown as RpcResponse;
      })
    };
    const client = new RpcClient(handler);

    const resultPromise = client.waitForTransaction(transaction, 1000);
    const assertion = expect(resultPromise).rejects.toThrow('Timeout');
    await vi.advanceTimersByTimeAsync(2000);
    await assertion;

    const callsAtTimeout = calls;
    await vi.advanceTimersByTimeAsync(10_000);
    expect(calls).to.equal(callsAtTimeout);
  });
});
