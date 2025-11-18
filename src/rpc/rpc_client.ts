import { TypedJSON } from 'typedjson';

import { IClient, IHandler } from './client';
import {
  ChainGetBlockResult,
  ChainGetBlockResultV1Compatible,
  ChainGetBlockTransfersResult,
  ChainGetEraInfoResult,
  ChainGetEraSummaryResult,
  ChainGetStateRootHashResult,
  InfoGetChainspecResult,
  InfoGetDeployResult,
  InfoGetPeerResult,
  InfoGetRewardResult,
  InfoGetStatusResult,
  InfoGetTransactionResult,
  InfoGetTransactionResultV1Compatible,
  InfoGetValidatorChangesResult,
  PutDeployResult,
  PutTransactionResult,
  QueryBalanceDetailsResult,
  QueryBalanceResult,
  QueryGlobalStateResult,
  RpcResponse,
  StateGetAccountInfo,
  StateGetAuctionInfoResult,
  StateGetAuctionInfoV1Result,
  StateGetAuctionInfoV2Result,
  StateGetBalanceResult,
  StateGetDictionaryResult,
  StateGetEntityResult,
  StateGetItemResult
} from './response';
import {
  AccountIdentifier,
  BlockIdentifier,
  EntityIdentifier,
  EraIdentifier,
  GlobalStateIdentifier,
  InfoGetRewardRequest,
  Method,
  ParamBlockIdentifier,
  ParamDeployHash,
  ParamDictionaryIdentifier,
  ParamDictionaryIdentifierURef,
  ParamGetAccountInfoBalance,
  ParamGetStateEntity,
  ParamQueryGlobalState,
  ParamStateRootHash,
  ParamTransactionHash,
  PurseIdentifier,
  PutDeployRequest,
  PutTransactionRequest,
  QueryBalanceDetailsRequest,
  QueryBalanceRequest,
  RpcRequest,
  StateGetBalanceRequest,
  StateGetDictionaryRequest
} from './request';
import { IDValue } from './id_value';
import {
  TransactionHash,
  Deploy,
  PublicKey,
  Hash,
  Transaction,
  AuctionState
} from '../types';
import { HttpError } from './error';
import { sleep } from '../utils';

export class RpcClient implements IClient {
  private handler: IHandler;

  constructor(handler: IHandler) {
    this.handler = handler;
  }

  async getDeploy(hash: string): Promise<InfoGetDeployResult> {
    const serializer = new TypedJSON(ParamDeployHash);
    const paramDeployHash = new ParamDeployHash(hash);

    const resp = await this.processRequest(
      Method.GetDeploy,
      serializer.toPlainJson(paramDeployHash)
    );

    const result = this.parseResponse(InfoGetDeployResult, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async getDeployFinalizedApproval(hash: string): Promise<InfoGetDeployResult> {
    const serializer = new TypedJSON(ParamDeployHash);
    const paramDeployHash = new ParamDeployHash(hash, true);

    const resp = await this.processRequest(
      Method.GetDeploy,
      serializer.toPlainJson(paramDeployHash)
    );

    const result = this.parseResponse(InfoGetDeployResult, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async getTransactionByTransactionHash(
    transactionHash: string
  ): Promise<InfoGetTransactionResult> {
    const serializer = new TypedJSON(ParamTransactionHash);
    const hash = Hash.fromHex(transactionHash);
    const transactionHashParam = new ParamTransactionHash(
      TransactionHash.fromTransactionHash(hash)
    );

    const resp = await this.processRequest<ParamTransactionHash>(
      Method.GetTransaction,
      serializer.toPlainJson(transactionHashParam) as ParamTransactionHash
    );

    const result = this.parseResponse(
      InfoGetTransactionResultV1Compatible,
      resp.result
    );
    result.rawJSON = resp.result;

    const txResult =
      InfoGetTransactionResultV1Compatible.newInfoGetTransactionResultFromV1Compatible(
        result,
        result.rawJSON
      );
    txResult.rawJSON = resp.result;

    return txResult;
  }

  async getTransactionByDeployHash(
    deployHash: string
  ): Promise<InfoGetTransactionResult> {
    const serializer = new TypedJSON(ParamTransactionHash);
    const hash = Hash.fromHex(deployHash);
    const transactionHashParam = new ParamTransactionHash(
      TransactionHash.fromDeployHash(hash)
    );

    const resp = await this.processRequest<ParamTransactionHash>(
      Method.GetTransaction,
      serializer.toPlainJson(transactionHashParam) as ParamTransactionHash
    );

    const result = this.parseResponse(
      InfoGetTransactionResultV1Compatible,
      resp.result
    );
    result.rawJSON = resp.result;

    const txResult =
      InfoGetTransactionResultV1Compatible.newInfoGetTransactionResultFromV1Compatible(
        result,
        result.rawJSON
      );
    txResult.rawJSON = resp.result;

    return txResult;
  }

  async getTransactionFinalizedApprovalByTransactionHash(
    transactionHash: string
  ): Promise<InfoGetTransactionResult> {
    const serializer = new TypedJSON(ParamTransactionHash);
    const hash = Hash.fromHex(transactionHash);
    const transactionHashParam = new ParamTransactionHash(
      TransactionHash.fromTransactionHash(hash),
      true
    );

    const resp = await this.processRequest<ParamTransactionHash>(
      Method.GetTransaction,
      serializer.toPlainJson(transactionHashParam) as ParamTransactionHash
    );

    const result = this.parseResponse(
      InfoGetTransactionResultV1Compatible,
      resp.result
    );
    result.rawJSON = resp.result;

    const txResult =
      InfoGetTransactionResultV1Compatible.newInfoGetTransactionResultFromV1Compatible(
        result,
        result.rawJSON
      );
    txResult.rawJSON = resp.result;

    return txResult;
  }

  async getTransactionFinalizedApprovalByDeployHash(
    deployHash: string
  ): Promise<InfoGetTransactionResult> {
    const serializer = new TypedJSON(ParamTransactionHash);
    const hash = Hash.fromHex(deployHash);
    const transactionHashParam = new ParamTransactionHash(
      TransactionHash.fromDeployHash(hash),
      true
    );

    const resp = await this.processRequest<ParamTransactionHash>(
      Method.GetTransaction,
      serializer.toPlainJson(transactionHashParam) as ParamTransactionHash
    );

    const result = this.parseResponse(
      InfoGetTransactionResultV1Compatible,
      resp.result
    );
    result.rawJSON = resp.result;

    const txResult =
      InfoGetTransactionResultV1Compatible.newInfoGetTransactionResultFromV1Compatible(
        result,
        result.rawJSON
      );
    txResult.rawJSON = resp.result;

    return txResult;
  }

  /**
   * ⚠️ Deprecated: `getStateItem` is deprecated and will be removed in a future release.
   *
   * Use `queryLatestGlobalState`, `queryGlobalStateByBlockHash`,
   * `queryGlobalStateByBlockHeight`, or `queryGlobalStateByStateHash` instead.
   *
   * Reason: The newer Global State Query API provides more consistent behavior
   * across block identifiers and supports both stored values and typed keys.
   *
   * @deprecated Use Global State Query methods instead.
   */
  async getStateItem(
    stateRootHash: string | null,
    key: string,
    path: string[]
  ): Promise<StateGetItemResult> {
    let rootHash = stateRootHash;

    if (!rootHash) {
      const latestHashResult = await this.getStateRootHashLatest();
      rootHash = latestHashResult.stateRootHash.toHex();
    }

    const serializer = new TypedJSON(ParamStateRootHash);
    const stateRootHashParam = new ParamStateRootHash(rootHash, key, path);

    const resp = await this.processRequest<ParamStateRootHash>(
      Method.GetStateItem,
      serializer.toPlainJson(stateRootHashParam) as ParamStateRootHash
    );

    const result = this.parseResponse(StateGetItemResult, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async queryLatestGlobalState(
    key: string,
    path: string[]
  ): Promise<QueryGlobalStateResult> {
    const serializer = new TypedJSON(ParamQueryGlobalState);
    const queryGlobalStateParam =
      ParamQueryGlobalState.newQueryGlobalStateParam(key, path);

    const resp = await this.processRequest(
      Method.QueryGlobalState,
      serializer.toPlainJson(queryGlobalStateParam) as ParamQueryGlobalState
    );

    const result = this.parseResponse(QueryGlobalStateResult, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async queryGlobalStateByBlockHash(
    blockHash: string,
    key: string,
    path: string[]
  ): Promise<QueryGlobalStateResult> {
    const serializer = new TypedJSON(ParamQueryGlobalState);
    const queryGlobalStateParam =
      ParamQueryGlobalState.newQueryGlobalStateParam(key, path, { blockHash });

    const resp = await this.processRequest(
      Method.QueryGlobalState,
      serializer.toPlainJson(queryGlobalStateParam) as ParamQueryGlobalState
    );

    const result = this.parseResponse(QueryGlobalStateResult, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async queryGlobalStateByBlockHeight(
    blockHeight: number,
    key: string,
    path: string[]
  ): Promise<QueryGlobalStateResult> {
    const serializer = new TypedJSON(ParamQueryGlobalState);
    const queryGlobalStateParam =
      ParamQueryGlobalState.newQueryGlobalStateParam(key, path, {
        blockHeight
      });

    const resp = await this.processRequest(
      Method.QueryGlobalState,
      serializer.toPlainJson(queryGlobalStateParam) as ParamQueryGlobalState
    );

    const result = this.parseResponse(QueryGlobalStateResult, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async queryGlobalStateByStateHash(
    stateRootHash: string | null,
    key: string,
    path: string[]
  ): Promise<QueryGlobalStateResult> {
    const serializer = new TypedJSON(ParamQueryGlobalState);
    let resp: RpcResponse;

    if (!stateRootHash) {
      const queryGlobalStateParamWithoutRootHash =
        ParamQueryGlobalState.newQueryGlobalStateParam(key, path);
      resp = await this.processRequest(
        Method.QueryGlobalState,
        serializer.toPlainJson(
          queryGlobalStateParamWithoutRootHash
        ) as ParamQueryGlobalState
      );
    } else {
      const queryGlobalState = ParamQueryGlobalState.newQueryGlobalStateParam(
        key,
        path,
        {
          stateRootHash
        }
      );
      resp = await this.processRequest(
        Method.QueryGlobalState,
        serializer.toPlainJson(queryGlobalState) as ParamQueryGlobalState
      );
    }

    const result = this.parseResponse(QueryGlobalStateResult, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async getLatestEntity(
    entityIdentifier: EntityIdentifier
  ): Promise<StateGetEntityResult> {
    const serializer = new TypedJSON(ParamGetStateEntity);
    const getStateEntityParam = new ParamGetStateEntity(entityIdentifier);

    const resp = await this.processRequest<ParamGetStateEntity>(
      Method.GetStateEntity,
      serializer.toPlainJson(getStateEntityParam) as ParamGetStateEntity
    );

    const result = this.parseResponse(StateGetEntityResult, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async getEntityByBlockHash(
    entityIdentifier: EntityIdentifier,
    hash: string
  ): Promise<StateGetEntityResult> {
    const serializer = new TypedJSON(ParamGetStateEntity);
    const getStateEntityParam = new ParamGetStateEntity(
      entityIdentifier,
      new BlockIdentifier(hash)
    );

    const resp = await this.processRequest<ParamGetStateEntity>(
      Method.GetStateEntity,
      serializer.toPlainJson(getStateEntityParam) as ParamGetStateEntity
    );

    const result = this.parseResponse(StateGetEntityResult, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async getEntityByBlockHeight(
    entityIdentifier: EntityIdentifier,
    height: number
  ): Promise<StateGetEntityResult> {
    const serializer = new TypedJSON(ParamGetStateEntity);
    const getStateEntityParam = new ParamGetStateEntity(
      entityIdentifier,
      new BlockIdentifier(undefined, height)
    );

    const resp = await this.processRequest<ParamGetStateEntity>(
      Method.GetStateEntity,
      serializer.toPlainJson(getStateEntityParam) as ParamGetStateEntity
    );

    const result = this.parseResponse(StateGetEntityResult, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async getAccountInfoByBlockHash(
    blockHash: string,
    pub: PublicKey
  ): Promise<StateGetAccountInfo> {
    const accountInfoBalance = new ParamGetAccountInfoBalance(
      pub.toHex(),
      ParamBlockIdentifier.byHash(blockHash)
    );

    const resp = await this.processRequest<ParamGetAccountInfoBalance>(
      Method.GetStateAccount,
      accountInfoBalance.toJSON() as ParamGetAccountInfoBalance
    );

    const result = this.parseResponse(StateGetAccountInfo, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async getAccountInfoByBlockHeight(
    blockHeight: number,
    pub: PublicKey
  ): Promise<StateGetAccountInfo> {
    const accountInfoBalance = new ParamGetAccountInfoBalance(
      pub.toHex(),
      ParamBlockIdentifier.byHeight(blockHeight)
    );

    const resp = await this.processRequest<ParamGetAccountInfoBalance>(
      Method.GetStateAccount,
      accountInfoBalance.toJSON() as ParamGetAccountInfoBalance
    );

    const result = this.parseResponse(StateGetAccountInfo, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async getAccountInfo(
    blockIdentifier: ParamBlockIdentifier | null,
    accountIdentifier: AccountIdentifier
  ): Promise<StateGetAccountInfo> {
    let identifier = blockIdentifier;

    if (!identifier) {
      identifier = new ParamBlockIdentifier();
    }

    let accountParam: string;

    if (accountIdentifier.accountHash) {
      accountParam = accountIdentifier.accountHash.toPrefixedString();
    } else if (accountIdentifier.publicKey) {
      accountParam = accountIdentifier.publicKey.toHex();
    } else {
      throw new Error('account identifier is empty');
    }

    const accountInfoBalance = new ParamGetAccountInfoBalance(
      accountParam,
      identifier
    );

    const resp = await this.processRequest<ParamGetAccountInfoBalance>(
      Method.GetStateAccount,
      accountInfoBalance.toJSON() as ParamGetAccountInfoBalance
    );

    const result = this.parseResponse(StateGetAccountInfo, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async getDictionaryItem(
    stateRootHash: string | null,
    uref: string,
    key: string
  ): Promise<StateGetDictionaryResult> {
    return this.getDictionaryItemByIdentifier(
      stateRootHash,
      new ParamDictionaryIdentifier(
        undefined,
        undefined,
        new ParamDictionaryIdentifierURef(key, uref)
      )
    );
  }

  async getDictionaryItemByIdentifier(
    stateRootHash: string | null,
    identifier: ParamDictionaryIdentifier
  ): Promise<StateGetDictionaryResult> {
    const serializer = new TypedJSON(StateGetDictionaryRequest);
    let rootHash = stateRootHash;

    if (!rootHash) {
      const latestHashResult = await this.getStateRootHashLatest();

      rootHash = latestHashResult.stateRootHash.toHex();
    }

    const stateDictionaryParam = new StateGetDictionaryRequest(
      rootHash,
      identifier
    );
    const resp = await this.processRequest<StateGetDictionaryRequest>(
      Method.GetDictionaryItem,
      serializer.toPlainJson(stateDictionaryParam) as StateGetDictionaryRequest
    );

    const result = this.parseResponse(StateGetDictionaryResult, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async getLatestBalance(purseURef: string): Promise<StateGetBalanceResult> {
    const serializer = new TypedJSON(StateGetBalanceRequest);
    const latestHashResult = await this.getStateRootHashLatest();
    const stateBalance = new StateGetBalanceRequest(
      latestHashResult.stateRootHash.toHex(),
      purseURef
    );

    const resp = await this.processRequest<StateGetBalanceRequest>(
      Method.GetStateBalance,
      serializer.toPlainJson(stateBalance) as StateGetBalanceRequest
    );

    const result = this.parseResponse(StateGetBalanceResult, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async getBalanceByStateRootHash(
    purseURef: string,
    stateRootHash: string
  ): Promise<StateGetBalanceResult> {
    const serializer = new TypedJSON(StateGetBalanceRequest);
    const stateBalance = new StateGetBalanceRequest(stateRootHash, purseURef);

    const resp = await this.processRequest<StateGetBalanceRequest>(
      Method.GetStateBalance,
      serializer.toPlainJson(stateBalance) as StateGetBalanceRequest
    );

    const result = this.parseResponse(StateGetBalanceResult, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async getEraInfoLatest(): Promise<ChainGetEraInfoResult> {
    const resp = await this.processRequest(Method.GetEraInfo, null);

    const result = this.parseResponse(ChainGetEraInfoResult, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async getEraInfoByBlockHeight(
    height: number
  ): Promise<ChainGetEraInfoResult> {
    const serializer = new TypedJSON(ParamBlockIdentifier);
    const blockIdentifierParam = ParamBlockIdentifier.byHeight(height);

    const resp = await this.processRequest(
      Method.GetEraInfo,
      serializer.toPlainJson(blockIdentifierParam) as ParamBlockIdentifier
    );

    const result = this.parseResponse(ChainGetEraInfoResult, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async getEraInfoByBlockHash(hash: string): Promise<ChainGetEraInfoResult> {
    const serializer = new TypedJSON(ParamBlockIdentifier);
    const blockIdentifierParam = ParamBlockIdentifier.byHash(hash);

    const resp = await this.processRequest(
      Method.GetEraInfo,
      serializer.toPlainJson(blockIdentifierParam) as ParamBlockIdentifier
    );

    const result = this.parseResponse(ChainGetEraInfoResult, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async getLatestBlock(): Promise<ChainGetBlockResult> {
    const resp = await this.processRequest(Method.GetBlock, null);

    const result = this.parseResponse(
      ChainGetBlockResultV1Compatible,
      resp.result
    );
    result.rawJSON = resp.result;

    const blockResult =
      ChainGetBlockResult.newChainGetBlockResultFromV1Compatible(
        result,
        result.rawJSON
      );
    blockResult.rawJSON = result.rawJSON;

    return blockResult;
  }

  async getBlockByHash(hash: string): Promise<ChainGetBlockResult> {
    const serializer = new TypedJSON(ParamBlockIdentifier);
    const blockIdentifierParam = ParamBlockIdentifier.byHash(hash);

    const resp = await this.processRequest(
      Method.GetBlock,
      serializer.toPlainJson(blockIdentifierParam) as ParamBlockIdentifier
    );

    const result = this.parseResponse(
      ChainGetBlockResultV1Compatible,
      resp.result
    );
    result.rawJSON = resp.result;

    const blockResult =
      ChainGetBlockResult.newChainGetBlockResultFromV1Compatible(
        result,
        result.rawJSON
      );
    blockResult.rawJSON = resp.result;

    return blockResult;
  }

  async getBlockByHeight(height: number): Promise<ChainGetBlockResult> {
    const serializer = new TypedJSON(ParamBlockIdentifier);
    const blockIdentifierParam = ParamBlockIdentifier.byHeight(height);

    const resp = await this.processRequest(
      Method.GetBlock,
      serializer.toPlainJson(blockIdentifierParam) as ParamBlockIdentifier
    );

    const result = this.parseResponse(
      ChainGetBlockResultV1Compatible,
      resp.result
    );
    result.rawJSON = resp.result;

    const blockResult =
      ChainGetBlockResult.newChainGetBlockResultFromV1Compatible(
        result,
        result.rawJSON
      );
    blockResult.rawJSON = resp.result;

    return blockResult;
  }

  async getLatestBlockTransfers(): Promise<ChainGetBlockTransfersResult> {
    const resp = await this.processRequest(Method.GetBlockTransfers, null);

    const result = this.parseResponse(
      ChainGetBlockTransfersResult,
      resp.result
    );
    result.rawJSON = resp.result;

    return result;
  }

  async getBlockTransfersByHash(
    blockHash: string
  ): Promise<ChainGetBlockTransfersResult> {
    const serializer = new TypedJSON(ParamBlockIdentifier);
    const blockIdentifierParam = ParamBlockIdentifier.byHash(blockHash);

    const resp = await this.processRequest(
      Method.GetBlockTransfers,
      serializer.toPlainJson(blockIdentifierParam) as ParamBlockIdentifier
    );

    const result = this.parseResponse(
      ChainGetBlockTransfersResult,
      resp.result
    );
    result.rawJSON = resp.result;

    return result;
  }

  async getBlockTransfersByHeight(
    height: number
  ): Promise<ChainGetBlockTransfersResult> {
    const serializer = new TypedJSON(ParamBlockIdentifier);
    const blockIdentifierParam = ParamBlockIdentifier.byHeight(height);

    const resp = await this.processRequest(
      Method.GetBlockTransfers,
      serializer.toPlainJson(blockIdentifierParam) as ParamBlockIdentifier
    );

    const result = this.parseResponse(
      ChainGetBlockTransfersResult,
      resp.result
    );
    result.rawJSON = resp.result;

    return result;
  }

  async getEraSummaryLatest(): Promise<ChainGetEraSummaryResult> {
    const resp = await this.processRequest(Method.GetEraSummary, null);

    const result = this.parseResponse(ChainGetEraSummaryResult, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async getEraSummaryByHash(
    blockHash: string
  ): Promise<ChainGetEraSummaryResult> {
    const serializer = new TypedJSON(ParamBlockIdentifier);
    const blockIdentifierParam = ParamBlockIdentifier.byHash(blockHash);

    const resp = await this.processRequest(
      Method.GetEraSummary,
      serializer.toPlainJson(blockIdentifierParam) as ParamBlockIdentifier
    );

    const result = this.parseResponse(ChainGetEraSummaryResult, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async getEraSummaryByHeight(
    height: number
  ): Promise<ChainGetEraSummaryResult> {
    const serializer = new TypedJSON(ParamBlockIdentifier);
    const blockIdentifierParam = ParamBlockIdentifier.byHeight(height);

    const resp = await this.processRequest(
      Method.GetEraSummary,
      serializer.toPlainJson(blockIdentifierParam) as ParamBlockIdentifier
    );

    const result = this.parseResponse(ChainGetEraSummaryResult, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async getLatestAuctionInfo(): Promise<StateGetAuctionInfoResult> {
    try {
      const auctionInfoV2 = await this.getLatestAuctionInfoV2();
      const auctionInfoResult = new StateGetAuctionInfoResult();
      auctionInfoResult.auctionState = AuctionState.fromV2(
        auctionInfoV2.auctionState
      );
      auctionInfoResult.version = auctionInfoV2.version;
      auctionInfoResult.rawJSON = auctionInfoV2.rawJSON;
      return auctionInfoResult;
    } catch (err) {
      const errorMessage = err?.message || '';
      if (!errorMessage.includes('Method not found')) {
        throw err;
      }

      const auctionInfoV1 = await this.getLatestAuctionInfoV1();
      const auctionInfoResult = new StateGetAuctionInfoResult();
      auctionInfoResult.auctionState = AuctionState.fromV1(
        auctionInfoV1.auctionState
      );
      auctionInfoResult.version = auctionInfoV1.version;
      auctionInfoResult.rawJSON = auctionInfoV1.rawJSON;
      return auctionInfoResult;
    }
  }

  async getLatestAuctionInfoV1(): Promise<StateGetAuctionInfoV1Result> {
    const resp = await this.processRequest(Method.GetAuctionInfo, null);

    const result = this.parseResponse(StateGetAuctionInfoV1Result, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async getLatestAuctionInfoV2(): Promise<StateGetAuctionInfoV2Result> {
    const resp = await this.processRequest(Method.GetAuctionInfoV2, null);

    const result = this.parseResponse(StateGetAuctionInfoV2Result, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async getAuctionInfoByHash(
    blockHash: string
  ): Promise<StateGetAuctionInfoResult> {
    try {
      const resV2 = await this.getAuctionInfoV2ByHash(blockHash);
      const result = new StateGetAuctionInfoResult();
      result.auctionState = AuctionState.fromV2(resV2.auctionState);
      result.version = resV2.version;
      result.rawJSON = resV2.rawJSON;
      return result;
    } catch (err) {
      const errorMessage = err?.message || '';
      if (!errorMessage.includes('Method not found')) {
        throw err;
      }

      const resV1 = await this.getAuctionInfoV1ByHash(blockHash);
      const result = new StateGetAuctionInfoResult();
      result.auctionState = AuctionState.fromV1(resV1.auctionState);
      result.version = resV1.version;
      result.rawJSON = resV1.rawJSON;
      return result;
    }
  }

  async getAuctionInfoV1ByHash(
    blockHash: string
  ): Promise<StateGetAuctionInfoV1Result> {
    const serializer = new TypedJSON(ParamBlockIdentifier);
    const blockIdentifierParam = ParamBlockIdentifier.byHash(blockHash);

    const resp = await this.processRequest(
      Method.GetAuctionInfo,
      serializer.toPlainJson(blockIdentifierParam) as ParamBlockIdentifier
    );

    const result = this.parseResponse(StateGetAuctionInfoV1Result, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async getAuctionInfoV2ByHash(
    blockHash: string
  ): Promise<StateGetAuctionInfoV2Result> {
    const serializer = new TypedJSON(ParamBlockIdentifier);
    const blockIdentifierParam = ParamBlockIdentifier.byHash(blockHash);

    const resp = await this.processRequest(
      Method.GetAuctionInfoV2,
      serializer.toPlainJson(blockIdentifierParam) as ParamBlockIdentifier
    );

    const result = this.parseResponse(StateGetAuctionInfoV2Result, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async getAuctionInfoByHeight(
    height: number
  ): Promise<StateGetAuctionInfoResult> {
    try {
      const resV2 = await this.getAuctionInfoV2ByHeight(height);
      const result = new StateGetAuctionInfoResult();
      result.auctionState = AuctionState.fromV2(resV2.auctionState);
      result.version = resV2.version;
      result.rawJSON = resV2.rawJSON;
      return result;
    } catch (err) {
      const errorMessage = err?.message || '';
      if (!errorMessage.includes('Method not found')) {
        throw err;
      }

      const resV1 = await this.getAuctionInfoV1ByHeight(height);
      const result = new StateGetAuctionInfoResult();
      result.auctionState = AuctionState.fromV1(resV1.auctionState);
      result.version = resV1.version;
      result.rawJSON = resV1.rawJSON;
      return result;
    }
  }

  async getAuctionInfoV1ByHeight(
    height: number
  ): Promise<StateGetAuctionInfoV1Result> {
    const serializer = new TypedJSON(ParamBlockIdentifier);
    const blockIdentifierParam = ParamBlockIdentifier.byHeight(height);

    const resp = await this.processRequest(
      Method.GetAuctionInfo,
      serializer.toPlainJson(blockIdentifierParam) as ParamBlockIdentifier
    );

    const result = this.parseResponse(StateGetAuctionInfoV1Result, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async getAuctionInfoV2ByHeight(
    height: number
  ): Promise<StateGetAuctionInfoV2Result> {
    const serializer = new TypedJSON(ParamBlockIdentifier);
    const blockIdentifierParam = ParamBlockIdentifier.byHeight(height);

    const resp = await this.processRequest(
      Method.GetAuctionInfoV2,
      serializer.toPlainJson(blockIdentifierParam) as ParamBlockIdentifier
    );

    const result = this.parseResponse(StateGetAuctionInfoV2Result, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async getStateRootHashLatest(): Promise<ChainGetStateRootHashResult> {
    const resp = await this.processRequest(Method.GetStateRootHash, null);

    const result = this.parseResponse(ChainGetStateRootHashResult, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async getStateRootHashByHash(
    blockHash: string
  ): Promise<ChainGetStateRootHashResult> {
    const serializer = new TypedJSON(ParamBlockIdentifier);
    const blockIdentifierParam = ParamBlockIdentifier.byHash(blockHash);

    const resp = await this.processRequest(
      Method.GetStateRootHash,
      serializer.toPlainJson(blockIdentifierParam) as ParamBlockIdentifier
    );

    const result = this.parseResponse(ChainGetStateRootHashResult, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async getStateRootHashByHeight(
    height: number
  ): Promise<ChainGetStateRootHashResult> {
    const serializer = new TypedJSON(ParamBlockIdentifier);
    const blockIdentifierParam = ParamBlockIdentifier.byHeight(height);

    const resp = await this.processRequest(
      Method.GetStateRootHash,
      serializer.toPlainJson(blockIdentifierParam) as ParamBlockIdentifier
    );

    const result = this.parseResponse(ChainGetStateRootHashResult, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async getValidatorChangesInfo(): Promise<InfoGetValidatorChangesResult> {
    const resp = await this.processRequest(Method.GetValidatorChanges, null);

    const result = this.parseResponse(
      InfoGetValidatorChangesResult,
      resp.result
    );
    result.rawJSON = resp.result;

    return result;
  }

  async getStatus(): Promise<InfoGetStatusResult> {
    const resp = await this.processRequest(Method.GetStatus, null);

    const result = this.parseResponse(InfoGetStatusResult, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async getPeers(): Promise<InfoGetPeerResult> {
    const resp = await this.processRequest(Method.GetPeers, null);

    const result = this.parseResponse(InfoGetPeerResult, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async putDeploy(deploy: Deploy): Promise<PutDeployResult> {
    const serializer = new TypedJSON(PutDeployRequest);
    const deployRequestParam = new PutDeployRequest(deploy);

    const resp = await this.processRequest<PutDeployRequest>(
      Method.PutDeploy,
      serializer.toPlainJson(deployRequestParam) as PutDeployRequest
    );

    const result = this.parseResponse(PutDeployResult, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async putTransaction(
    transaction: Transaction
  ): Promise<PutTransactionResult> {
    const serializer = new TypedJSON(PutTransactionRequest);
    const transactionRequestParam = new PutTransactionRequest(
      transaction.getTransactionWrapper()
    );

    const resp = await this.processRequest<PutTransactionRequest>(
      Method.PutTransaction,
      serializer.toPlainJson(transactionRequestParam) as PutTransactionRequest
    );

    const result = this.parseResponse(PutTransactionResult, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async queryLatestBalance(
    identifier: PurseIdentifier
  ): Promise<QueryBalanceResult> {
    const serializer = new TypedJSON(QueryBalanceRequest);
    const queryBalanceParam = new QueryBalanceRequest(identifier);

    const resp = await this.processRequest<QueryBalanceRequest>(
      Method.QueryBalance,
      serializer.toPlainJson(queryBalanceParam) as QueryBalanceRequest
    );

    const result = this.parseResponse(QueryBalanceResult, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async queryBalanceByBlockHeight(
    purseIdentifier: PurseIdentifier,
    height: number
  ): Promise<QueryBalanceResult> {
    const serializer = new TypedJSON(QueryBalanceRequest);
    const queryBalanceParam = new QueryBalanceRequest(
      purseIdentifier,
      new GlobalStateIdentifier(undefined, height)
    );

    const resp = await this.processRequest<QueryBalanceRequest>(
      Method.QueryBalance,
      serializer.toPlainJson(queryBalanceParam) as QueryBalanceRequest
    );

    const result = this.parseResponse(QueryBalanceResult, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async queryBalanceByBlockHash(
    purseIdentifier: PurseIdentifier,
    blockHash: string
  ): Promise<QueryBalanceResult> {
    const serializer = new TypedJSON(QueryBalanceRequest);
    const queryBalanceParam = new QueryBalanceRequest(
      purseIdentifier,
      new GlobalStateIdentifier(blockHash)
    );

    const resp = await this.processRequest<QueryBalanceRequest>(
      Method.QueryBalance,
      serializer.toPlainJson(queryBalanceParam) as QueryBalanceRequest
    );

    const result = this.parseResponse(QueryBalanceResult, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async queryBalanceByStateRootHash(
    purseIdentifier: PurseIdentifier,
    stateRootHash: string
  ): Promise<QueryBalanceResult> {
    const serializer = new TypedJSON(QueryBalanceRequest);
    const queryBalanceParam = new QueryBalanceRequest(
      purseIdentifier,
      new GlobalStateIdentifier(undefined, undefined, stateRootHash)
    );

    const resp = await this.processRequest<QueryBalanceRequest>(
      Method.QueryBalance,
      serializer.toPlainJson(queryBalanceParam) as QueryBalanceRequest
    );

    const result = this.parseResponse(QueryBalanceResult, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async queryLatestBalanceDetails(
    purseIdentifier: PurseIdentifier
  ): Promise<QueryBalanceDetailsResult> {
    const serializer = new TypedJSON(QueryBalanceDetailsRequest);
    const queryBalanceParam = new QueryBalanceDetailsRequest(purseIdentifier);

    const resp = await this.processRequest<QueryBalanceDetailsRequest>(
      Method.QueryBalanceDetails,
      serializer.toPlainJson(queryBalanceParam) as QueryBalanceDetailsRequest
    );

    const result = this.parseResponse(QueryBalanceDetailsResult, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async queryBalanceDetailsByStateRootHash(
    purseIdentifier: PurseIdentifier,
    stateRootHash: string
  ): Promise<QueryBalanceDetailsResult> {
    const serializer = new TypedJSON(QueryBalanceDetailsRequest);
    const queryBalanceParam = new QueryBalanceDetailsRequest(
      purseIdentifier,
      new GlobalStateIdentifier(undefined, undefined, stateRootHash)
    );

    const resp = await this.processRequest<QueryBalanceDetailsRequest>(
      Method.QueryBalanceDetails,
      serializer.toPlainJson(queryBalanceParam) as QueryBalanceDetailsRequest
    );

    const result = this.parseResponse(QueryBalanceDetailsResult, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async queryBalanceDetailsByBlockHeight(
    purseIdentifier: PurseIdentifier,
    height: number
  ): Promise<QueryBalanceDetailsResult> {
    const serializer = new TypedJSON(QueryBalanceDetailsRequest);
    const queryBalanceParam = new QueryBalanceDetailsRequest(
      purseIdentifier,
      new GlobalStateIdentifier(undefined, height)
    );

    const resp = await this.processRequest<QueryBalanceDetailsRequest>(
      Method.QueryBalanceDetails,
      serializer.toPlainJson(queryBalanceParam) as QueryBalanceDetailsRequest
    );

    const result = this.parseResponse(QueryBalanceDetailsResult, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async queryBalanceDetailsByBlockHash(
    purseIdentifier: PurseIdentifier,
    blockHash: string
  ): Promise<QueryBalanceDetailsResult> {
    const serializer = new TypedJSON(QueryBalanceDetailsRequest);
    const queryBalanceParam = new QueryBalanceDetailsRequest(
      purseIdentifier,
      new GlobalStateIdentifier(blockHash)
    );

    const resp = await this.processRequest<QueryBalanceDetailsRequest>(
      Method.QueryBalanceDetails,
      serializer.toPlainJson(queryBalanceParam) as QueryBalanceDetailsRequest
    );

    const result = this.parseResponse(QueryBalanceDetailsResult, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async getChainspec(): Promise<InfoGetChainspecResult> {
    const resp = await this.processRequest(Method.InfoGetChainspec, null);

    const result = this.parseResponse(InfoGetChainspecResult, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async getValidatorRewardByEraID(
    validator: PublicKey,
    eraID: number
  ): Promise<InfoGetRewardResult> {
    const serializer = new TypedJSON(InfoGetRewardRequest);
    const rewardParam = new InfoGetRewardRequest(
      validator,
      undefined,
      new EraIdentifier(undefined, eraID)
    );

    const resp = await this.processRequest<InfoGetRewardRequest>(
      Method.GetReward,
      serializer.toPlainJson(rewardParam) as InfoGetRewardRequest
    );

    const result = this.parseResponse(InfoGetRewardResult, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async getValidatorRewardByBlockHash(
    validator: PublicKey,
    blockHash: string
  ): Promise<InfoGetRewardResult> {
    const serializer = new TypedJSON(InfoGetRewardRequest);
    const rewardParam = new InfoGetRewardRequest(
      validator,
      undefined,
      new EraIdentifier(new BlockIdentifier(blockHash))
    );

    const resp = await this.processRequest<InfoGetRewardRequest>(
      Method.GetReward,
      serializer.toPlainJson(rewardParam) as InfoGetRewardRequest
    );

    const result = this.parseResponse(InfoGetRewardResult, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async getValidatorRewardByBlockHeight(
    validator: PublicKey,
    height: number
  ): Promise<InfoGetRewardResult> {
    const serializer = new TypedJSON(InfoGetRewardRequest);
    const rewardParam = new InfoGetRewardRequest(
      validator,
      undefined,
      new EraIdentifier(new BlockIdentifier(undefined, height))
    );

    const resp = await this.processRequest<InfoGetRewardRequest>(
      Method.GetReward,
      serializer.toPlainJson(rewardParam) as InfoGetRewardRequest
    );

    const result = this.parseResponse(InfoGetRewardResult, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async getDelegatorRewardByEraID(
    validator: PublicKey,
    delegator: PublicKey,
    eraID: number
  ): Promise<InfoGetRewardResult> {
    const serializer = new TypedJSON(InfoGetRewardRequest);
    const rewardParam = new InfoGetRewardRequest(
      validator,
      delegator,
      new EraIdentifier(undefined, eraID)
    );

    const resp = await this.processRequest<InfoGetRewardRequest>(
      Method.GetReward,
      serializer.toPlainJson(rewardParam) as InfoGetRewardRequest
    );

    const result = this.parseResponse(InfoGetRewardResult, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async getDelegatorRewardByBlockHash(
    validator: PublicKey,
    delegator: PublicKey,
    blockHash: string
  ): Promise<InfoGetRewardResult> {
    const serializer = new TypedJSON(InfoGetRewardRequest);
    const rewardParam = new InfoGetRewardRequest(
      validator,
      delegator,
      new EraIdentifier(new BlockIdentifier(blockHash))
    );

    const resp = await this.processRequest<InfoGetRewardRequest>(
      Method.GetReward,
      serializer.toPlainJson(rewardParam) as InfoGetRewardRequest
    );

    const result = this.parseResponse(InfoGetRewardResult, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async getDelegatorRewardByBlockHeight(
    validator: PublicKey,
    delegator: PublicKey,
    height: number
  ): Promise<InfoGetRewardResult> {
    const serializer = new TypedJSON(InfoGetRewardRequest);
    const rewardParam = new InfoGetRewardRequest(
      validator,
      delegator,
      new EraIdentifier(new BlockIdentifier(undefined, height))
    );

    const resp = await this.processRequest<InfoGetRewardRequest>(
      Method.GetReward,
      serializer.toPlainJson(rewardParam) as InfoGetRewardRequest
    );

    const result = this.parseResponse(InfoGetRewardResult, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async getLatestValidatorReward(
    validator: PublicKey
  ): Promise<InfoGetRewardResult> {
    const serializer = new TypedJSON(InfoGetRewardRequest);
    const rewardParam = new InfoGetRewardRequest(validator);

    const resp = await this.processRequest(
      Method.GetReward,
      serializer.toPlainJson(rewardParam) as InfoGetRewardRequest
    );

    const result = this.parseResponse(InfoGetRewardResult, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  async getLatestDelegatorReward(
    validator: PublicKey,
    delegator: PublicKey
  ): Promise<InfoGetRewardResult> {
    const serializer = new TypedJSON(InfoGetRewardRequest);
    const rewardParam = new InfoGetRewardRequest(validator, delegator);

    const resp = await this.processRequest<InfoGetRewardRequest>(
      Method.GetReward,
      serializer.toPlainJson(rewardParam) as InfoGetRewardRequest
    );

    const result = this.parseResponse(InfoGetRewardResult, resp.result);
    result.rawJSON = resp.result;

    return result;
  }

  /**
   * Waits for a transaction to be confirmed within a given timeout period.
   * Implements a retry mechanism to handle transient errors from the getInfo function.
   *
   * @template T - The expected return type of the transaction info.
   * @param getInfo - A function that fetches transaction info based on its hash.
   * @param hash - The transaction hash to monitor.
   * @param timeout - The maximum time (in milliseconds) to wait for confirmation.
   * @param maxRetries - The maximum number of retries for transient errors.
   * @param retryDelay - The delay (in milliseconds) between retry attempts.
   * @returns A promise that resolves with the transaction info if confirmed, otherwise rejects on timeout or persistent errors.
   * @throws {Error} If the timeout is reached before confirmation or if getInfo fails consistently beyond the allowed retries.
   */
  private async waitForConfirmation<T>(
    getInfo: (hash: string) => Promise<T>,
    hash: string,
    timeout: number,
    maxRetries = 3,
    retryDelay = 500
  ): Promise<T> {
    const timer = setTimeout(() => {
      throw new Error('Timeout');
    }, timeout);

    let attempts = 0;

    while (true) {
      try {
        const info = await getInfo(hash);
        if ((info as any)?.executionInfo?.executionResult) {
          clearTimeout(timer);
          return info;
        }
      } catch (error) {
        if (attempts >= maxRetries) {
          clearTimeout(timer);
          throw new Error(
            `Failed after ${maxRetries} retries: ${error.message}`
          );
        }
        attempts++;
        console.warn(
          `Attempt ${attempts} failed: ${error.message}. Retrying in ${retryDelay}ms...`
        );
        await sleep(retryDelay);
        continue;
      }
      await sleep(400);
    }
  }

  /**
   * Waits for a transaction to be confirmed on-chain.
   * @param transaction - The transaction instance.
   * @param timeout - Optional timeout in milliseconds (default: 6000ms).
   * @returns A promise that resolves to `InfoGetTransactionResult` if successful.
   * @throws An error if the transaction times out.
   */
  public async waitForTransaction(
    transaction: Transaction,
    timeout = 6000
  ): Promise<InfoGetTransactionResult> {
    return this.waitForConfirmation(
      this.getTransactionByTransactionHash.bind(this),
      transaction?.hash?.toHex(),
      timeout
    );
  }

  /**
   * Waits for a deploy to be confirmed on-chain.
   * @param deploy - The deploy instance.
   * @param timeout - Optional timeout in milliseconds (default: 60000ms).
   * @returns A promise that resolves to `InfoGetDeployResult` if successful.
   * @throws An error if the deploy times out.
   */
  public async waitForDeploy(
    deploy: Deploy,
    timeout = 60000
  ): Promise<InfoGetDeployResult> {
    return this.waitForConfirmation(
      this.getDeploy.bind(this),
      deploy?.hash?.toHex(),
      timeout
    );
  }

  private parseResponse<T>(type: new (params: any) => T, response: any): T {
    const serializer = new TypedJSON(type);
    const parsed = serializer.parse(response);

    if (!parsed) throw new Error(`Error parsing ${type.name} response data`);

    return parsed as T;
  }

  private async processRequest<Request>(
    method: Method,
    params: Request,
    reqID = '0'
  ): Promise<RpcResponse> {
    const request = RpcRequest.defaultRpcRequest(method, params);

    if (reqID !== '0') {
      request.id = IDValue.fromString(reqID);
    }

    const resp = await this.handler.processCall(request);

    if (resp.error) {
      throw new HttpError(resp.error.code, resp.error);
    }

    return resp;
  }
}
