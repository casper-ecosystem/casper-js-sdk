import { TypedJSON } from 'typedjson';
import { expect } from 'chai';

import {
  ChainGetBlockResult,
  ChainGetBlockResultV1Compatible,
  InfoGetDeployResult,
  InfoGetStatusResult,
  InfoGetTransactionResult,
  InfoGetTransactionResultV1Compatible,
  StateGetAccountInfo
} from '../../rpc';
import { BlockBodyV2, NamedKey } from '../../types';
import {
  getBlockByHashJson,
  getStatusJson,
  infoGetTransactionResultV1Json,
  addReservationTransactionJson,
  infoGetDeployJson,
  transactionWithEraJson,
  getDeployWithNullExecutionResults,
  getTransactionWithNullExecutionResults,
  stateGetAccountInfoJson,
  transactionWithArgsKeys,
  transactionWithListU8
} from '../data';

describe('RPC Client', () => {
  it('should be able to parse getTransactionByTransactionHash response', () => {
    const serializer = new TypedJSON(InfoGetTransactionResultV1Compatible);
    const result = serializer.parse(infoGetTransactionResultV1Json.result)!;
    result.rawJSON = infoGetTransactionResultV1Json.result;

    const txResult = InfoGetTransactionResultV1Compatible.newInfoGetTransactionResultFromV1Compatible(
      result,
      result.rawJSON
    );

    expect(txResult).to.be.not.undefined;
    expect(txResult).to.be.not.empty;
    expect(
      txResult.executionInfo?.executionResult.initiator.publicKey?.toHex()
    ).to.deep.equal(
      infoGetTransactionResultV1Json.result.deploy.header.account
    );
    expect(
      txResult.executionInfo?.executionResult.transfers[0].transactionHash.toHex()
    ).to.deep.equal(txResult.transaction.hash.toHex());
  });

  it('Should process RPC.getBlockByHash response', () => {
    const serializer = new TypedJSON(ChainGetBlockResultV1Compatible);
    const result = serializer.parse(getBlockByHashJson.result)!;
    result.rawJSON = getBlockByHashJson.result;

    const ser = new TypedJSON(BlockBodyV2);
    const blockV2BodyJson = JSON.stringify(
      ser.toPlainJson(result.blockWithSignatures!.block.blockV2!.body)
    );

    const blockResult = ChainGetBlockResult.newChainGetBlockResultFromV1Compatible(
      result,
      result.rawJSON
    );
    blockResult.rawJSON = getBlockByHashJson.result;

    expect(blockResult).to.be.not.undefined;
    expect(blockResult).to.be.not.empty;
    expect(blockResult.block?.hash.toHex()).to.deep.equal(
      getBlockByHashJson.result.block_with_signatures.block.Version2.hash
    );
    expect(
      result.blockWithSignatures?.block.blockV2?.hash?.toHex()
    ).to.deep.equal(
      getBlockByHashJson.result.block_with_signatures.block.Version2.hash
    );
    expect(blockV2BodyJson).to.equal(
      JSON.stringify(
        getBlockByHashJson.result.block_with_signatures.block.Version2.body
      )
    );
  });

  it('should be able to parse getStatus response', () => {
    const serializer = new TypedJSON(InfoGetStatusResult);
    const result = serializer.parse(getStatusJson.result)!;
    result.rawJSON = getStatusJson.result;

    expect(result).to.be.not.undefined;
    expect(result).to.be.not.empty;
    expect(result.rawJSON).to.deep.equal(getStatusJson.result);
    expect(result.protocolVersion).to.deep.equal(
      getStatusJson.result.protocol_version
    );
    expect(result.buildVersion).to.deep.equal(
      getStatusJson.result.build_version
    );
    expect(result.chainSpecName).to.deep.equal(
      getStatusJson.result.chainspec_name
    );
    expect(result.lastAddedBlockInfo.hash.toHex()).to.deep.equal(
      getStatusJson.result.last_added_block_info.hash
    );
    expect(result.lastAddedBlockInfo.creator.toHex()).to.deep.equal(
      getStatusJson.result.last_added_block_info.creator
    );
    expect(result.lastAddedBlockInfo.eraID).to.deep.equal(
      getStatusJson.result.last_added_block_info.era_id
    );
    expect(result.lastAddedBlockInfo.stateRootHash.toHex()).to.deep.equal(
      getStatusJson.result.last_added_block_info.state_root_hash
    );
    expect(result.lastAddedBlockInfo.height).to.deep.equal(
      getStatusJson.result.last_added_block_info.height
    );
    expect(result.ourPublicSigningKey).to.deep.equal(
      getStatusJson.result.our_public_signing_key
    );
    expect(result.latestSwitchBlockHash.toHex()).to.deep.equal(
      getStatusJson.result.latest_switch_block_hash
    );
    expect(result.lastProgress.toJSON()).to.deep.equal(
      getStatusJson.result.last_progress
    );
    expect(result.blockSync.forward?.blockHash?.toHex()).to.deep.equal(
      getStatusJson.result.block_sync.forward.block_hash
    );
    expect(result.blockSync.forward?.blockHeight).to.deep.equal(
      getStatusJson.result.block_sync.forward.block_height
    );
    expect(result.blockSync.forward?.acquisitionState).to.deep.equal(
      getStatusJson.result.block_sync.forward.acquisition_state
    );
    expect(result.blockSync.historical?.acquisitionState).to.deep.equal(
      getStatusJson.result.block_sync.historical.acquisition_state
    );
    expect(result.blockSync.historical?.blockHeight).to.deep.equal(
      getStatusJson.result.block_sync.historical.block_height
    );
    expect(result.blockSync.historical?.blockHash?.toHex()).to.deep.equal(
      getStatusJson.result.block_sync.historical.block_hash
    );
  });

  it('should correctly parse AddReservation Transaction with Any type', () => {
    const tx = InfoGetTransactionResult.fromJSON(
      addReservationTransactionJson
    )!;

    expect(tx).to.be.not.undefined;
    expect(tx).to.be.not.empty;
    expect(tx?.rawJSON).to.deep.equal(addReservationTransactionJson);
    expect(tx.transaction.hash.toHex()).to.deep.equal(
      addReservationTransactionJson.transaction.Version1.hash
    );
    expect(tx.transaction.entryPoint.toJSON()).to.deep.equal(
      addReservationTransactionJson.transaction.Version1.payload.fields
        .entry_point
    );
    expect(tx.transaction.scheduling.toJSON()).to.deep.equal(
      addReservationTransactionJson.transaction.Version1.payload.fields
        .scheduling
    );
    expect(tx.transaction.initiatorAddr.publicKey?.toHex()).to.deep.equal(
      addReservationTransactionJson.transaction.Version1.payload.initiator_addr
        .PublicKey
    );
  });

  it('should correctly parse deploy', () => {
    const deployResult = new TypedJSON(InfoGetDeployResult).parse(
      infoGetDeployJson
    )!;
    const tx = deployResult.toInfoGetTransactionResult();

    expect(deployResult).to.be.not.undefined;
    expect(deployResult).to.be.not.empty;
    expect(tx).to.be.not.undefined;
    expect(tx).to.be.not.empty;
    expect(tx.transaction.hash.toHex()).to.deep.equal(
      infoGetDeployJson.deploy.hash
    );
    expect(tx.transaction.entryPoint.customEntryPoint).to.deep.equal(
      infoGetDeployJson.deploy.session.StoredContractByHash.entry_point
    );
  });

  it('should correctly parse Transaction with era-id Key', () => {
    const tx = InfoGetTransactionResultV1Compatible.fromJSON(
      transactionWithEraJson.data
    )!;

    expect(tx).to.be.not.undefined;
    expect(tx).to.be.not.empty;

    expect(tx.transaction?.transactionV1?.hash.toHex()).to.deep.equal(
      transactionWithEraJson.data.transaction.Version1.hash
    );
    expect(
      tx.transaction?.transactionV1?.payload.fields.args
        .getByName('key_uref_name')
        ?.key?.toPrefixedString()
    ).to.deep.equal('era-42');
  });

  it('should correctly parse deploy result with null execution result', () => {
    const deployResult = new TypedJSON(InfoGetDeployResult).parse(
      getDeployWithNullExecutionResults.result
    );
    const transactionResult = deployResult?.toInfoGetTransactionResult();

    expect(transactionResult).to.be.not.undefined;
    expect(transactionResult).to.be.not.empty;

    expect(transactionResult?.transaction?.hash.toHex()).to.deep.equal(
      getDeployWithNullExecutionResults.result.deploy.hash
    );
    expect(transactionResult?.executionInfo).to.be.undefined;
  });

  it('should correctly parse transaction result with null execution result', () => {
    const transactionResult = InfoGetTransactionResult.fromJSON(
      getTransactionWithNullExecutionResults.result
    );

    expect(transactionResult).to.be.not.undefined;
    expect(transactionResult).to.be.not.empty;

    expect(transactionResult?.transaction?.hash.toHex()).to.deep.equal(
      getTransactionWithNullExecutionResults.result.transaction.Deploy.hash
    );
    expect(transactionResult?.executionInfo?.executionResult).to.be.undefined;
  });

  it('should correctly parse account info result', () => {
    const stateGetAccountInfo = new TypedJSON(StateGetAccountInfo).parse(
      stateGetAccountInfoJson
    );

    expect(stateGetAccountInfo).to.be.not.undefined;
    expect(stateGetAccountInfo).to.be.not.empty;

    const parsedNamedKeys = stateGetAccountInfo?.account.namedKeys;
    const originalNamedKeys = stateGetAccountInfoJson.account.named_keys;

    expect(parsedNamedKeys).to.have.lengthOf(originalNamedKeys.length);

    parsedNamedKeys?.forEach((namedKey, index) => {
      expect(namedKey).to.be.an.instanceof(NamedKey);
      expect(namedKey.name).to.deep.equal(originalNamedKeys[index].name);
      expect(namedKey.key.toPrefixedString()).to.deep.equal(
        originalNamedKeys[index].key
      );
    });
  });

  it('should correctly parse transaction with args keys', () => {
    const tx = InfoGetTransactionResult.fromJSON(transactionWithArgsKeys);

    expect(tx).to.be.not.undefined;
    expect(tx).to.be.not.empty;

    expect(tx?.transaction?.hash.toHex()).to.deep.equal(
      transactionWithArgsKeys.transaction.Version1.hash
    );
  });

  it('should correctly parse transaction with args keys', () => {
    const tx = InfoGetTransactionResult.fromJSON(transactionWithListU8);

    expect(tx).to.be.not.undefined;
    expect(tx).to.be.not.empty;

    expect(tx?.transaction?.hash.toHex()).to.deep.equal(
      transactionWithListU8.transaction.Deploy.hash
    );
  });
});
