import { HTTPTransport } from '@open-rpc/client-js';
import sinon from 'sinon';

import {
  CasperServiceByJsonRPC,
  PurseIdentifier
} from './CasperServiceByJsonRPC';
import ProviderTransport from './ProviderTransport';
import { expect } from 'chai';

describe('CasperServiceByJsonRPC', () => {
  it('should send request with timeout params using HTTPTransport', async () => {
    const client = new CasperServiceByJsonRPC('');
    const httpTransport = sinon
      .stub(HTTPTransport.prototype, 'sendData')
      .callsFake(async () => ({
        balance: '9000000000'
      }));

    const timeout = 6000;

    await client.queryBalance(
      PurseIdentifier.PurseUref,
      'uref-6f2d3316f5c114923e6ec7087a399f692f4ce85197106a6daa97bf7f444e4f9e-007',
      undefined,
      timeout
    );
    expect(httpTransport.args[0][1]).to.eq(timeout);
  });

  // TODO: Update test with ProviderTransport
  xit('should send request with timeout params using ProviderTransport', async () => {
    const client = new CasperServiceByJsonRPC('');

    const providerTransport = sinon
      .stub(ProviderTransport.prototype, 'sendData')
      .callsFake(async () => ({
        balance: '9000000000'
      }));

    const timeout = 6000;

    await client.queryBalance(
      PurseIdentifier.PurseUref,
      'uref-6f2d3316f5c114923e6ec7087a399f692f4ce85197106a6daa97bf7f444e4f9e-007',
      undefined,
      timeout
    );
    expect(providerTransport.args[0][1]).to.eq(timeout);
  });
});
