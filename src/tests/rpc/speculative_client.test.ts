import { expect, vi } from 'vitest';

import { SpeculativeClient } from '../../rpc/speculative_client';
import { IHandler } from '../../rpc/client';
import { RpcResponse } from '../../rpc/response';
import { BlockIdentifier, Method, RpcRequest } from '../../rpc/request';
import {
  KeyAlgorithm,
  NativeTransferBuilder,
  PrivateKey,
  PublicKey
} from '../../types';

const HASH_HEX = '11'.repeat(32);

const senderKey = PrivateKey.generate(KeyAlgorithm.ED25519);
const target = PublicKey.fromHex(
  '0202f5a92ab6da536e7b1a351406f3744224bec85d7acbab1497b65de48a1a707b64'
);

function buildDeploy() {
  const wrapper = new NativeTransferBuilder()
    .from(senderKey.publicKey)
    .target(target)
    .amount('2500000000')
    .chainName('casper-net-1')
    .payment(100_000_000)
    .buildFor1_5();
  const deploy = wrapper.getDeploy()!;
  deploy.sign(senderKey);
  return deploy;
}

function createHandler(respond: (request: RpcRequest) => unknown): {
  handler: IHandler;
  requests: RpcRequest[];
} {
  const requests: RpcRequest[] = [];
  const handler: IHandler = {
    processCall: vi.fn(async (request: RpcRequest) => {
      requests.push(request);
      return respond(request) as RpcResponse;
    })
  };
  return { handler, requests };
}

const v2ExecutionResult = {
  block_hash: HASH_HEX,
  transfers: [],
  limit: 1000,
  consumed: 500,
  cost: 500,
  current_price: 1,
  refund: 0,
  size_estimate: 128,
  effects: []
};

const v1ExecutionResult = {
  Success: {
    cost: '100000000',
    effect: { operations: [], transforms: [] },
    transfers: []
  }
};

describe('SpeculativeClient — request shape', () => {
  it('sends speculative_exec with the marshalled deploy and no block identifier when omitted', async () => {
    const deploy = buildDeploy();
    const { handler, requests } = createHandler(request => ({
      jsonrpc: '2.0',
      id: request.id?.toJSON(),
      result: { execution_result: v2ExecutionResult }
    }));
    const client = new SpeculativeClient(handler);

    await client.speculativeExec('7', deploy);

    expect(requests).to.have.lengthOf(1);
    expect(requests[0].method).to.equal(Method.SpeculativeExec);
    expect(requests[0].id?.toString()).to.equal('7');
    expect(requests[0].params.deploy.hash).to.equal(deploy.hash.toHex());
    expect(requests[0].params.block_identifier).to.be.undefined;
  });

  it('includes a Hash block identifier when one is supplied', async () => {
    const deploy = buildDeploy();
    const { handler, requests } = createHandler(request => ({
      jsonrpc: '2.0',
      id: request.id?.toJSON(),
      result: { execution_result: v2ExecutionResult }
    }));
    const client = new SpeculativeClient(handler);

    await client.speculativeExec('1', deploy, new BlockIdentifier(HASH_HEX));

    expect(requests[0].params.block_identifier).to.deep.equal({
      Hash: HASH_HEX
    });
  });

  it('includes a Height block identifier when one is supplied', async () => {
    const deploy = buildDeploy();
    const { handler, requests } = createHandler(request => ({
      jsonrpc: '2.0',
      id: request.id?.toJSON(),
      result: { execution_result: v2ExecutionResult }
    }));
    const client = new SpeculativeClient(handler);

    await client.speculativeExec(
      '1',
      deploy,
      new BlockIdentifier(undefined, 42)
    );

    expect(requests[0].params.block_identifier).to.deep.equal({ Height: 42 });
  });

  it('leaves the default request id ("1") in place when called with the "0" sentinel', async () => {
    // `RpcRequest.defaultRpcRequest` stamps id "1" before `speculativeExec`
    // looks at `reqID`, and '0' only skips the override — it does not clear it.
    const deploy = buildDeploy();
    const { handler, requests } = createHandler(request => ({
      jsonrpc: '2.0',
      id: request.id?.toJSON(),
      result: { execution_result: v2ExecutionResult }
    }));
    const client = new SpeculativeClient(handler);

    await client.speculativeExec('0', deploy);

    expect(requests[0].id?.toString()).to.equal('1');
  });
});

describe('SpeculativeClient — response parsing', () => {
  it('parses a Casper 2.0 (v2) execution result and unwraps it as typed', async () => {
    const deploy = buildDeploy();
    const { handler } = createHandler(request => ({
      jsonrpc: '2.0',
      id: request.id?.toJSON(),
      result: { execution_result: v2ExecutionResult }
    }));
    const client = new SpeculativeClient(handler);

    const result = await client.speculativeExec('1', deploy);

    expect(result.isV2).to.be.true;
    expect(result.isV1).to.be.false;
    expect(result.blockHash?.toHex()).to.equal(HASH_HEX);
    expect(result.executionResult?.limit).to.equal(1000);
    expect(result.executionResult?.consumed).to.equal(500);
  });

  it('parses a legacy (v1) execution result and unwraps it as typed', async () => {
    const deploy = buildDeploy();
    const { handler } = createHandler(request => ({
      jsonrpc: '2.0',
      id: request.id?.toJSON(),
      result: { execution_result: v1ExecutionResult }
    }));
    const client = new SpeculativeClient(handler);

    const result = await client.speculativeExec('1', deploy);

    expect(result.isV1).to.be.true;
    expect(result.isV2).to.be.false;
    expect(result.executionResultV1?.success?.cost).to.equal(100000000);
  });

  it('throws when the handler reports an RPC error', async () => {
    const deploy = buildDeploy();
    const { handler } = createHandler(request => ({
      jsonrpc: '2.0',
      id: request.id?.toJSON(),
      error: { code: -32000, message: 'boom' }
    }));
    const client = new SpeculativeClient(handler);

    await expect(client.speculativeExec('1', deploy)).rejects.toThrow('boom');
  });

  it('throws when the handler returns no response at all', async () => {
    const deploy = buildDeploy();
    const handler: IHandler = {
      processCall: vi.fn(async () => undefined as unknown as RpcResponse)
    };
    const client = new SpeculativeClient(handler);

    await expect(client.speculativeExec('1', deploy)).rejects.toThrow(
      'Handler response is empty'
    );
  });
});
