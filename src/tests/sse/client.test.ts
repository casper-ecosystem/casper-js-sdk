import { expect, vi } from 'vitest';

import { EventName, SseClient, SseError } from '../../sse';

// eventsource is mocked so these tests exercise SseClient's own wiring rather
// than a socket; PHASE-4.5's e2e suite covers the real stream. The stand-in is
// declared inside the factory because `vi.mock` is hoisted above every
// top-level binding in the file.
vi.mock('eventsource', () => {
  class FakeEventSource {
    static lastInstance?: FakeEventSource;

    public onmessage?: (event: MessageEvent<string>) => void;
    public onerror?: (event: { message?: string; code?: number }) => void;
    public closed = false;

    constructor(public readonly url: string) {
      FakeEventSource.lastInstance = this;
    }

    close(): void {
      this.closed = true;
    }
  }

  return { EventSource: FakeEventSource, ErrorEvent: class {} };
});

interface FakeEventSource {
  url: string;
  closed: boolean;
  onmessage?: (event: MessageEvent<string>) => void;
  onerror?: (event: { message?: string; code?: number }) => void;
}

const lastStream = async (): Promise<FakeEventSource> => {
  const { EventSource } = (await import('eventsource')) as unknown as {
    EventSource: { lastInstance?: FakeEventSource };
  };

  if (!EventSource.lastInstance) throw new Error('no stream was opened');

  return EventSource.lastInstance;
};

describe('SseClient', () => {
  it('should refuse a duplicate subscription and an unknown unsubscribe', () => {
    const client = new SseClient('http://localhost:9999/events');
    const handler = () => undefined;

    expect(client.subscribe(EventName.BlockAddedEventType, handler).ok).to.be
      .true;
    expect(client.subscribe(EventName.BlockAddedEventType, handler).ok).to.be
      .false;
    expect(client.unsubscribe(EventName.BlockAddedEventType).ok).to.be.true;
    expect(client.unsubscribe(EventName.BlockAddedEventType).ok).to.be.false;
  });

  it('should append start_from only when an event id is given', async () => {
    new SseClient('http://localhost:9999/events').start();
    expect((await lastStream()).url).to.equal('http://localhost:9999/events?');

    new SseClient('http://localhost:9999/events').start(42);
    expect((await lastStream()).url).to.equal(
      'http://localhost:9999/events?start_from=42'
    );

    new SseClient('http://localhost:9999/events?foo=bar').start(7);
    expect((await lastStream()).url).to.equal(
      'http://localhost:9999/events?foo=bar&start_from=7'
    );
  });

  it('should hand stream errors to the callback with the HTTP status attached', async () => {
    const client = new SseClient('http://localhost:9999/events');
    const errors: SseError[] = [];

    client.start(undefined, error => errors.push(error));
    (await lastStream()).onerror?.({ message: 'Unauthorized', code: 401 });

    expect(errors).to.have.lengthOf(1);
    expect(errors[0]).to.be.instanceOf(SseError);
    expect(errors[0].code).to.equal(401);
    expect(errors[0].message).to.equal('Unauthorized');
  });

  it('should throw a described error when no callback is supplied', async () => {
    const client = new SseClient('http://localhost:9999/events');
    client.start();
    const stream = await lastStream();

    // The pre-3.x client re-threw the raw event, which carried neither a stack
    // nor a readable message.
    expect(() => stream.onerror?.({ code: 403 })).to.throw(
      'Event stream failed with status 403'
    );
  });

  it('should close the underlying stream on stop', async () => {
    const client = new SseClient('http://localhost:9999/events');
    client.start();
    client.stop();

    expect((await lastStream()).closed).to.be.true;
  });
});
