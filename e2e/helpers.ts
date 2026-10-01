import {
  HttpHandler,
  InfoGetTransactionResult,
  NativeTransferBuilder,
  PrivateKey,
  PublicKey,
  RpcClient,
  Transaction
} from '../src';
import { NETWORK_NAME, NODE_URL } from './config';

export function newRpcClient(): RpcClient {
  return new RpcClient(new HttpHandler(NODE_URL));
}

/**
 * Polls `getLatestBlock` until the chain has produced at least `minHeight`
 * blocks — height/era/auction queries return nothing meaningful until a
 * freshly booted nctl network is a few blocks in.
 */
export async function waitForBlockHeight(
  client: RpcClient,
  minHeight: number,
  timeoutMs = 120_000
): Promise<void> {
  const start = Date.now();

  while (true) {
    const latest = await client.getLatestBlock();
    if (latest.block.height >= minHeight) return;

    if (Date.now() - start > timeoutMs) {
      throw new Error(
        `Timed out waiting for block height >= ${minHeight} ` +
          `(last seen: ${latest.block.height})`
      );
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

/** Shape shared by `InfoGetTransactionResult` and `InfoGetDeployResult`. */
interface ExecutionInfoBearing {
  executionInfo?: { executionResult?: { errorMessage?: string } };
}

/**
 * Asserts a transaction succeeded on-chain, not merely that the node accepted
 * it: `waitForTransaction`/`waitForDeploy` only guarantee an execution result
 * is present, not that it carries no `errorMessage`.
 */
export function assertTransactionSucceeded(
  result: ExecutionInfoBearing,
  context: string
): void {
  const executionResult = result.executionInfo?.executionResult;
  if (!executionResult) {
    throw new Error(`${context}: transaction has no execution result`);
  }
  if (executionResult.errorMessage) {
    throw new Error(
      `${context}: transaction failed: ${executionResult.errorMessage}`
    );
  }
}

/**
 * Builds, signs, submits and confirms a native CSPR transfer. The SSE suite
 * uses it too, to get a `TransactionProcessed` event on the stream.
 */
export async function nativeTransfer(
  client: RpcClient,
  from: PrivateKey,
  to: PublicKey,
  amountMotes: string
): Promise<{ transaction: Transaction; result: InfoGetTransactionResult }> {
  const transaction = new NativeTransferBuilder()
    .from(from.publicKey)
    .target(to)
    .amount(amountMotes)
    .id(Date.now())
    .chainName(NETWORK_NAME)
    .payment(100_000_000)
    .build();

  transaction.sign(from);
  await client.putTransaction(transaction);

  const result = await client.waitForTransaction(transaction, 120_000);
  assertTransactionSucceeded(result, 'nativeTransfer');

  return { transaction, result };
}
