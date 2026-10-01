import { TypedJSON } from 'typedjson';

import {
  BlockIdentifier,
  Method,
  RpcRequest,
  SpeculativeExecParams
} from './request';
import { RpcResponse, SpeculativeExecResult } from './response';
import { IHandler } from './client';
import { IDValue } from './id_value';
import { Deploy } from '../types';

/**
 * A client for interacting with the speculative execution endpoint in the Casper Network.
 * This class is responsible for executing speculative transactions on the Casper Network and processing their responses.
 */
export class SpeculativeClient {
  private handler: IHandler;

  /**
   * Creates an instance of the `SpeculativeClient`.
   *
   * @param handler The handler used to process RPC requests.
   */
  constructor(handler: IHandler) {
    this.handler = handler;
  }

  /**
   * Static method to create a new `SpeculativeClient` instance.
   *
   * @param handler The handler used to process RPC requests.
   * @returns A new instance of the `SpeculativeClient`.
   */
  static newSpeculativeClient(handler: IHandler): SpeculativeClient {
    return new SpeculativeClient(handler);
  }

  /**
   * Executes a speculative transaction on the Casper Network.
   *
   * @param reqID The request identifier for the RPC call.
   * @param deploy The deploy object that represents the transaction to be executed.
   * @param identifier (Optional) The block identifier where the speculative transaction should be executed.
   *
   * @returns A promise that resolves to a `SpeculativeExecResult`, which contains the results of the speculative execution.
   *
   * @throws {Error} If the handler response is empty or if an error occurs while processing the RPC call or parsing the response.
   */
  async speculativeExec(
    reqID: string,
    deploy: Deploy,
    identifier?: BlockIdentifier
  ): Promise<SpeculativeExecResult> {
    const serializer = new TypedJSON(SpeculativeExecParams);
    const speculativeParams = new SpeculativeExecParams(deploy, identifier);

    const request = RpcRequest.defaultRpcRequest(
      Method.SpeculativeExec,
      serializer.toPlainJson(speculativeParams)
    );

    if (reqID && reqID !== '0') {
      request.id = new IDValue(reqID);
    }

    const resp = await this.handler.processCall(request);

    if (!resp) {
      throw new Error('Handler response is empty');
    }

    if (resp.error) {
      throw new Error(
        `RPC call failed, details: ${JSON.stringify(resp.error)}`
      );
    }

    try {
      const responseSerializer = new TypedJSON(RpcResponse);
      const data = responseSerializer.parse(resp);

      if (!data) {
        throw new Error(`Error parsing JSON`);
      }

      return SpeculativeExecResult.fromJSON(data);
    } catch (error) {
      throw new Error(`Error parsing JSON, details: ${error}`, {
        cause: error
      });
    }
  }
}
