import { expect, vi } from 'vitest';

import { EventName, SseClient, SseError } from '../../sse';

// eventsource is mocked so these tests exercise SseClient's own wiring rather
// than a socket. The stand-in is declared inside the factory because `vi.mock`
// is hoisted above every top-level binding in the file.
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
    // `isSseError`, not `instanceof`: under `target: es5` the emitted
    // `_super.call(this, …) || this` returns a plain Error, so `instanceof` is
    // false in the shipped bundle even though it holds under the test
    // transform's native classes.
    expect(SseError.isSseError(errors[0])).to.be.true;
    expect(errors[0].code).to.equal(401);
    expect(errors[0].message).to.equal('Unauthorized');
  });

  it('should keep the prototype chain intact so instanceof works in the bundle too', () => {
    const error = new SseError('boom', 401);

    expect(error instanceof SseError).to.be.true;
    expect(error instanceof Error).to.be.true;
    expect(SseError.isSseError(error)).to.be.true;
    expect(SseError.isSseError(new Error('boom'))).to.be.false;
    expect(SseError.isSseError(undefined)).to.be.false;
  });

  it('should report stream errors without throwing when no callback is supplied', async () => {
    const client = new SseClient('http://localhost:9999/events');
    client.start();
    const stream = await lastStream();
    const logged = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    try {
      // eventsource invokes onerror inside its own fetch promise chain, so a
      // throw here is either swallowed whole or escapes as an unhandled
      // rejection that kills the host process and pre-empts the reconnect.
      expect(() => stream.onerror?.({ code: 403 })).to.not.throw();
      expect(logged).toHaveBeenCalledTimes(1);
      expect(String(logged.mock.calls[0][0])).to.include('403');
    } finally {
      logged.mockRestore();
    }
  });

  it('should close the underlying stream on stop', async () => {
    const client = new SseClient('http://localhost:9999/events');
    client.start();
    client.stop();

    expect((await lastStream()).closed).to.be.true;
  });
});
