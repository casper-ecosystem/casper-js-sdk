import { expect } from 'vitest';
import sinon from 'sinon';

import {
  HttpHandler,
  ErrProcessHttpRequest,
  HttpError,
  RpcRequest,
  Method
} from '../../rpc';

describe('HttpHandler', () => {
  const endpoint = 'http://localhost:7777/rpc';
  const mockRpcResponse = {
    jsonrpc: '2.0',
    id: '1',
    result: { api_version: '1.0' }
  };
  const mockRequest = RpcRequest.defaultRpcRequest(Method.GetStatus, {});

  let fetchStub: sinon.SinonStub;

  beforeEach(() => {
    fetchStub = sinon.stub(global, 'fetch');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('constructor', () => {
    it('should default to axios client', () => {
      const handler = new HttpHandler(endpoint);
      expect((handler as any).client).to.equal('axios');
    });

    it('should accept fetch as explicit client', () => {
      const handler = new HttpHandler(endpoint, 'fetch');
      expect((handler as any).client).to.equal('fetch');
    });

    it('should create an axios instance when client is axios', () => {
      const handler = new HttpHandler(endpoint, 'axios');
      expect((handler as any).httpClient).to.not.be.undefined;
    });

    it('should not create an axios instance when client is fetch', () => {
      const handler = new HttpHandler(endpoint, 'fetch');
      expect((handler as any).httpClient).to.be.undefined;
    });
  });

  describe('setCustomHeaders', () => {
    it('should store custom headers', () => {
      const handler = new HttpHandler(endpoint);
      handler.setCustomHeaders({ 'X-Custom-Header': 'value' });
      expect((handler as any).customHeaders).to.deep.equal({
        'X-Custom-Header': 'value'
      });
    });
  });

  describe('setReferrer', () => {
    it('should store referrer', () => {
      const handler = new HttpHandler(endpoint);
      handler.setReferrer('http://referrer.example.com');
      expect((handler as any).referrer).to.equal('http://referrer.example.com');
    });
  });

  describe('processCall — fetch client', () => {
    it('should return the response body on success', async () => {
      fetchStub.resolves(
        new Response(JSON.stringify(mockRpcResponse), { status: 200 })
      );

      const handler = new HttpHandler(endpoint, 'fetch');
      const result = await handler.processCall(mockRequest);

      expect(result).to.deep.equal(mockRpcResponse);
    });

    it('should send a POST request to the configured endpoint', async () => {
      fetchStub.resolves(
        new Response(JSON.stringify(mockRpcResponse), { status: 200 })
      );

      const handler = new HttpHandler(endpoint, 'fetch');
      await handler.processCall(mockRequest);

      expect(fetchStub.calledOnce).to.be.true;
      expect(fetchStub.firstCall.args[0]).to.equal(endpoint);
      expect(fetchStub.firstCall.args[1].method).to.equal('POST');
    });

    it('should include Content-Type header', async () => {
      fetchStub.resolves(
        new Response(JSON.stringify(mockRpcResponse), { status: 200 })
      );

      const handler = new HttpHandler(endpoint, 'fetch');
      await handler.processCall(mockRequest);

      expect(fetchStub.firstCall.args[1].headers['Content-Type']).to.equal(
        'application/json'
      );
    });

    it('should include custom headers in the request', async () => {
      fetchStub.resolves(
        new Response(JSON.stringify(mockRpcResponse), { status: 200 })
      );

      const handler = new HttpHandler(endpoint, 'fetch');
      handler.setCustomHeaders({ 'X-Api-Key': 'secret' });
      await handler.processCall(mockRequest);

      expect(fetchStub.firstCall.args[1].headers['X-Api-Key']).to.equal(
        'secret'
      );
    });

    it('should include referrer in the request when set', async () => {
      fetchStub.resolves(
        new Response(JSON.stringify(mockRpcResponse), { status: 200 })
      );

      const handler = new HttpHandler(endpoint, 'fetch');
      handler.setReferrer('http://referrer.example.com');
      await handler.processCall(mockRequest);

      expect(fetchStub.firstCall.args[1].referrer).to.equal(
        'http://referrer.example.com'
      );
    });

    it('should not include referrer when not set', async () => {
      fetchStub.resolves(
        new Response(JSON.stringify(mockRpcResponse), { status: 200 })
      );

      const handler = new HttpHandler(endpoint, 'fetch');
      await handler.processCall(mockRequest);

      expect(fetchStub.firstCall.args[1].referrer).to.be.undefined;
    });

    it('should throw HttpError on 4xx response', async () => {
      fetchStub.resolves(
        new Response('Not Found', { status: 404, statusText: 'Not Found' })
      );

      const handler = new HttpHandler(endpoint, 'fetch');

      try {
        await handler.processCall(mockRequest);
        expect.fail('Expected HttpError to be thrown');
      } catch (err) {
        expect(HttpError.isHttpError(err)).to.be.true;
        expect((err as HttpError).statusCode).to.equal(404);
      }
    });

    it('should throw HttpError on 5xx response', async () => {
      fetchStub.resolves(
        new Response('Internal Server Error', {
          status: 500,
          statusText: 'Internal Server Error'
        })
      );

      const handler = new HttpHandler(endpoint, 'fetch');

      try {
        await handler.processCall(mockRequest);
        expect.fail('Expected HttpError to be thrown');
      } catch (err) {
        expect(HttpError.isHttpError(err)).to.be.true;
        expect((err as HttpError).statusCode).to.equal(500);
      }
    });

    it('should throw a generic Error on network failure', async () => {
      fetchStub.rejects(new TypeError('Failed to fetch'));

      const handler = new HttpHandler(endpoint, 'fetch');

      try {
        await handler.processCall(mockRequest);
        expect.fail('Expected Error to be thrown');
      } catch (err) {
        expect(HttpError.isHttpError(err)).to.be.false;
        expect((err as Error).message).to.include(
          ErrProcessHttpRequest.message
        );
      }
    });

    it('attaches the original failure as the error cause', async () => {
      const underlying = new Error('socket hang up');
      fetchStub.rejects(underlying);
      const handler = new HttpHandler(endpoint, 'fetch');

      try {
        await handler.processCall(mockRequest);
        expect.fail('expected the call to reject');
      } catch (err) {
        // Consumers match on this message, so wrapping must not replace it.
        expect((err as Error).message).to.include(
          ErrProcessHttpRequest.message
        );
        expect((err as Error).cause).to.equal(underlying);
      }
    });
  });

  describe('processCall — axios client', () => {
    it('should return the response body on success', async () => {
      fetchStub.resolves(
        new Response(JSON.stringify(mockRpcResponse), { status: 200 })
      );

      const handler = new HttpHandler(endpoint, 'axios');
      const result = await handler.processCall(mockRequest);

      expect(result).to.deep.equal(mockRpcResponse);
    });

    it('should throw HttpError on 4xx response', async () => {
      fetchStub.resolves(
        new Response('Not Found', { status: 404, statusText: 'Not Found' })
      );

      const handler = new HttpHandler(endpoint, 'axios');

      try {
        await handler.processCall(mockRequest);
        expect.fail('Expected HttpError to be thrown');
      } catch (err) {
        expect(HttpError.isHttpError(err)).to.be.true;
        expect((err as HttpError).statusCode).to.equal(404);
      }
    });

    it('should throw HttpError on 5xx response', async () => {
      fetchStub.resolves(
        new Response('Internal Server Error', {
          status: 500,
          statusText: 'Internal Server Error'
        })
      );

      const handler = new HttpHandler(endpoint, 'axios');

      try {
        await handler.processCall(mockRequest);
        expect.fail('Expected HttpError to be thrown');
      } catch (err) {
        expect(HttpError.isHttpError(err)).to.be.true;
        expect((err as HttpError).statusCode).to.equal(500);
      }
    });

    it('should throw a generic Error on network failure', async () => {
      fetchStub.rejects(new TypeError('Failed to fetch'));

      const handler = new HttpHandler(endpoint, 'axios');

      try {
        await handler.processCall(mockRequest);
        expect.fail('Expected Error to be thrown');
      } catch (err) {
        expect(HttpError.isHttpError(err)).to.be.false;
        expect((err as Error).message).to.include(
          ErrProcessHttpRequest.message
        );
      }
    });

    it('should use the fetch adapter (no follow-redirects dependency)', () => {
      const handler = new HttpHandler(endpoint, 'axios');
      const axiosInstance = (handler as any).httpClient;
      expect(axiosInstance.defaults.adapter).to.equal('fetch');
    });
  });
});
