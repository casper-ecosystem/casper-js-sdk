import { assert } from 'chai';
import {
  CasperServiceByJsonRPC,
  EventStream,
  DeployWatcher,
  EventName,
  PurseIdentifier
} from '../../src/services';
import { HTTP_EVENT_STREAM_URL, NODE_URL } from '../config';

const client = new CasperServiceByJsonRPC(NODE_URL);

describe('RPC', () => {
  // TODO Transfer to EventStream tests
  xit('DeployWatcher', () => {
    const client = new DeployWatcher(HTTP_EVENT_STREAM_URL);
    client.subscribe([
      {
        deployHash:
          '418bd905f86cad3bc3c46340ddf5119da4c51d2da24cf07cfe7c79a7f14f50aa',
        eventHandlerFn: value => console.log('SUBSCRIBED VALUE', value)
      }
    ]);
    client.start();
    setTimeout(() => {
      client.subscribe([
        {
          deployHash:
            '7a28f822a89b7dd65c0d29765e28d949a343d0b2c9cbee02abc89eaba542a7e5',
          eventHandlerFn: value => console.log('SUBSCRIBED VALUE 2', value)
        }
      ]);
    }, 3 * 10000);
  });

  xit('queryBalance', async () => {
    const res = await client.queryBalance(
      PurseIdentifier.PurseUref,
      'uref-6f2d3316f5c114923e6ec7087a399f692f4ce85197106a6daa97bf7f444e4f9e-007'
    );
    assert.equal(res.toString(), '1000000000000000000000000000000000');
  });

  // TODO Transfer to EventStream tests
  xit('EventHandler', () => {
    const client = new EventStream('http://localhost:60101/events');
    client.subscribe(EventName.FinalitySignature, value =>
      console.log('SUBSCRIBED VALUE', value)
    );
    client.start();
    setTimeout(() => {
      console.log('STOP');
      client.stop();
    }, 10000);
    setTimeout(() => {
      console.log('START');
      client.start();
    }, 3 * 10000);
    setTimeout(() => {
      console.log('STOP');
      client.stop();
    }, 6 * 10000);
  });
});
