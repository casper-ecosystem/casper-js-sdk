import { expect } from 'chai';

import { EventName, EventStream } from '../../src/services/EventStream';
import { HTTPS_EVENT_STREAM_URL } from '../config';

const sleep = (ms: number) => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};

describe('EventStream', () => {
  const startEventStream = async (url: string) => {
    const es = new EventStream(url);
    es.start();
    let blockAddedEvent;
    es.subscribe(EventName.BlockAdded, res => (blockAddedEvent = res));

    while (true) {
      if (blockAddedEvent) break;
      await sleep(300);
    }

    expect(blockAddedEvent)
      .to.be.have.nested.property('body.BlockAdded.block_hash')
      .and.to.be.a('string');
    es.stop();
  };

  it('should work on http', async () => {
    // TODO Enable event stream on GitHub CI
    // Replace hardcoded url with HTTP_EVENT_STREAM_URL
    await startEventStream('http://65.21.231.87:9999/events/main');
  });

  it('should work on http1.1/https protocol', async () => {
    await startEventStream(HTTPS_EVENT_STREAM_URL);
  });
});
