import { TypedJSON } from 'typedjson';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

import { HttpError } from './error';
import { RpcRequest } from './request';
import { RpcResponse } from './response';
import { IHandler } from './client';
import { toError } from '../utils/errors';

export const ErrParamsJsonStringifyHandler = new Error(
  "failed to stringify json rpc request's params"
);
export const ErrProcessHttpRequest = new Error('failed to send http request');
export const ErrReadHttpResponseBody = new Error(
  'failed to read http response body'
);
export const ErrRpcResponseUnmarshal = new Error(
  'failed to unmarshal rpc response'
);

export class HttpHandler implements IHandler {
  private endpoint: string;
  private client: 'axios' | 'fetch';
  private httpClient?: AxiosInstance;
  private referrer?: string;
  private customHeaders: Record<string, string> = {};

  constructor(endpoint: string, client: 'axios' | 'fetch' = 'axios') {
    this.endpoint = endpoint;
    this.client = client;
    if (client === 'axios') {
      this.httpClient = axios.create({ adapter: 'fetch' });
    }
  }

  setCustomHeaders(headers: Record<string, string>) {
    this.customHeaders = headers;
  }

  setReferrer(url: string) {
    this.referrer = url;
  }

  /** @throws {HttpError, Error} */
  async processCall(params: RpcRequest): Promise<RpcResponse> {
    const serializer = new TypedJSON(RpcRequest);
    let body: string;

    try {
      body = serializer.stringify(params);
    } catch (err) {
      throw new Error(
        `${ErrParamsJsonStringifyHandler.message}, details: ${
          toError(err).message
        }`,
        { cause: err }
      );
    }

    if (this.client === 'axios') {
      return await this.processAxiosRequest(body);
    } else {
      return await this.processFetchRequest(body);
    }
  }

  private async processAxiosRequest(body: string): Promise<RpcResponse> {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: this.endpoint,
      headers: {
        'Content-Type': 'application/json',
        ...this.customHeaders
      },
      data: body
    };

    try {
      const response = await this.httpClient!.request<RpcResponse>(config);
      if (response.status < 200 || response.status >= 300) {
        throw new HttpError(response.status, new Error(response.statusText));
      }
      return response.data;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        throw new HttpError(
          err.response.status,
          new Error(err.response.statusText)
        );
      }
      throw new Error(
        `${ErrProcessHttpRequest.message}, details: ${toError(err).message}`,
        { cause: err }
      );
    }
  }

  private async processFetchRequest(body: string): Promise<RpcResponse> {
    let response: Response;
    try {
      response = await fetch(this.endpoint, {
        method: 'POST',
        ...(this.referrer ? { referrer: this.referrer } : {}),
        headers: {
          'Content-Type': 'application/json',
          ...this.customHeaders
        },
        body
      });
    } catch (err) {
      throw new Error(
        `${ErrProcessHttpRequest.message}, details: ${toError(err).message}`,
        { cause: err }
      );
    }

    if (response.status < 200 || response.status >= 300) {
      throw new HttpError(response.status, new Error(response.statusText));
    }

    return await response.json();
  }
}
