import { expect } from 'chai';
import { EventName, EventStream } from './EventStream';

const sleep = (ms: number) => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};

describe('EventStream', () => {
  it('should work on http and https', async () => {
    const startEventStream = async (url: string) => {
      const es = new EventStream(url);
      await es.start();
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

    try {
      await startEventStream('http://176.9.63.35:9999/events/main');
    } catch (error) {
      console.log(error);
      expect(error).to.be.an('Error');
    }

    try {
      await startEventStream(
        'https://events.mainnet.casperlabs.io/events/main'
      );
    } catch (error) {
      console.log(error);
      expect(error).to.be.an('Error');
    }
  });
});
