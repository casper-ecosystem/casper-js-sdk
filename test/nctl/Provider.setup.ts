import { CasperClient, DeployUtil } from '../../src';
import { Secp256K1 } from '../../src/lib/Keys';
import {
  JRPCRequest,
  SendCallBack
} from '../../src/services/ProviderTransport';

const keyPair = Secp256K1.new();

function parseResponse(fetchRes: any, body: Record<string, unknown>): any {
  // check for error code
  if (fetchRes.status !== 200) {
    throw new Error(
      JSON.stringify({
        message: `Non-200 status code: '${fetchRes.status}'`,
        data: body
      })
    );
  }
  // check for rpc error
  if (body.error) {
    throw new Error(body.error as string);
  }
  // return successful result
  return body.result;
}

const createFetchConfigFromReq = ({
  req,
  rpcTarget
}: {
  req: JRPCRequest<unknown>;
  rpcTarget: string;
}) => {
  const parsedUrl: URL = new URL(rpcTarget);

  // prepare payload
  // copy only canonical json rpc properties
  const payload = {
    id: req.id,
    jsonrpc: req.jsonrpc,
    method: req.method,
    params: req.params
  };
  // serialize request body
  const serializedPayload: string = JSON.stringify(payload);

  // configure fetch params
  const fetchParams = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: serializedPayload
  };

  return { fetchUrl: parsedUrl.href, fetchParams };
};
const sendRpcRequestToChain = async (
  req: JRPCRequest<unknown>,
  rpcTarget: string
) => {
  const { fetchUrl, fetchParams } = createFetchConfigFromReq({
    req,
    rpcTarget
  });
  const fetchRes = await fetch(fetchUrl, fetchParams);
  if (fetchRes.status >= 400) {
    throw new Error(
      `Request failed with status: ${
        fetchRes.status
      } and body: ${JSON.stringify(fetchRes.body || {})}`
    );
  }
  // parse response body
  const fetchBody = await fetchRes.json();
  const result = parseResponse(fetchRes, fetchBody as Record<string, unknown>);
  // set result and exit retry loop
  return result;
};

const processDeploy = async (
  req: JRPCRequest<unknown>,
  client: CasperClient,
  rpcTarget: string
) => {
  // we can do any preprocessing or validation on deploy here,
  // and then finally sign deploy and send it blockchain.
  const deserializedDeploy = DeployUtil.deployFromJson(req.params as any);
  if (deserializedDeploy.ok) {
    const signedDeploy = client.signDeploy(deserializedDeploy.val, keyPair);
    req.params = DeployUtil.deployToJson(signedDeploy);
    //   const jrpcResult = await sendRpcRequestToChain(req, rpcTarget);
    const jrpcResult = { deploy_hash: '0x123', rpcTarget };
    return jrpcResult
  }
  throw new Error('Failed to parse deploy');
};

export class MockProvider {
  private rpcTarget: string;
  private client: CasperClient;

  constructor(rpcTarget: string) {
    this.rpcTarget = rpcTarget;
    this.client = new CasperClient(rpcTarget);
  }

  async sendAsync(req: JRPCRequest<unknown>): Promise<any> {
    // we are intercepting 'account_put_deploy' (ie. signing the deploy and then submitting the signed deploy
    // to blockchain)
    // for rest of rpc calls we are simply sending rpc call to blockchain and returning the result.
    if (req.method === 'account_put_deploy') {
      return processDeploy(req, this.client, this.rpcTarget);
    } else {
      try {
        const jrpcResult = await sendRpcRequestToChain(req, this.rpcTarget);
        return jrpcResult
      } catch (error) {
        throw error;
      }
    }
  }

  // currently we only use sendAsync in provider transport, so we live it unimplemented here.
  send(_: JRPCRequest<unknown>, __: SendCallBack<any>): void {
    return;
  }
}
