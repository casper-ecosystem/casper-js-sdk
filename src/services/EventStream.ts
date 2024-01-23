import * as http from 'http';
import * as https from 'https';

import { Err, Ok, Result } from 'ts-results';

export interface Event<T = unknown> {
  id: string;
  body: T;
}

export interface DeploySubscription {
  deployHash: string;
  eventHandlerFn: EventHandlerFn;
}

export enum StreamErrors {
  NotAnEvent,
  EarlyEndOfStream,
  MissingDataHeader,
  MissingDataHeaderAndId,
  MissingId
}

export class DeployWatcher {
  es: EventStream;
  watchList: DeploySubscription[] = [];

  constructor(public eventStreamUrl: string) {
    this.es = new EventStream(eventStreamUrl);
  }

  subscribe(val: DeploySubscription[]): void {
    this.watchList = [...this.watchList, ...val];
  }

  unsubscribe(deployHash: string): void {
    this.watchList = this.watchList.filter(d => d.deployHash !== deployHash);
  }

  start() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.es.subscribe(EventName.DeployProcessed, (event: any) => {
      const deployHash = event.body.DeployProcessed.deploy_hash;
      const pendingDeploy = this.watchList.find(
        d => d.deployHash === deployHash
      );
      if (pendingDeploy) {
        pendingDeploy.eventHandlerFn(event);
        this.unsubscribe(deployHash);
      }
    });
    this.es.start();
  }

  stop() {
    this.es.stop();
  }
}

type EventHandlerFn<E = unknown> = (event: E) => void;

export enum EventName {
  BlockAdded = 'BlockAdded',
  BlockFinalized = 'BlockFinalized',
  FinalitySignature = 'FinalitySignature',
  Fault = 'Fault',
  DeployProcessed = 'DeployProcessed'
}

interface EventSubscription {
  eventName: EventName;
  eventHandlerFn: EventHandlerFn;
}

export interface EventParseResult {
  events: Event[];
  remainder: string | null;
  err: StreamErrors | null;
}

export class EventStream {
  subscribedTo: EventSubscription[] = [];
  pendingDeploysParts: EventParseResult[] = [];
  pendingDeployString = '';
  stream?: NodeJS.ReadableStream;

  constructor(public eventStreamUrl: string) {}

  public subscribe(
    eventName: EventName,
    eventHandlerFn: EventHandlerFn
  ): Result<boolean, string> {
    if (this.subscribedTo.some(e => e.eventName === eventName)) {
      return Err('Already subscribed to this event');
    }
    this.subscribedTo.push({ eventName, eventHandlerFn });
    return Ok(true);
  }

  public unsubscribe(eventName: EventName): Result<boolean, string> {
    if (!this.subscribedTo.some(e => e.eventName === eventName)) {
      return Err('Cannot find provided subscription');
    }
    this.subscribedTo = this.subscribedTo.filter(
      d => d.eventName !== eventName
    );
    return Ok(true);
  }

  private runEventsLoop(event: Event) {
    this.subscribedTo.forEach((sub: EventSubscription) => {
      // eslint-disable-next-line no-prototype-builtins
      if (event.body && event.body.hasOwnProperty(sub.eventName)) {
        sub.eventHandlerFn(event);
      }
    });
  }

  public start(eventId?: number) {
    const separator = this.eventStreamUrl.indexOf('?') > -1 ? '&' : '?';
    let requestUrl = `${this.eventStreamUrl}${separator}`;
    if (eventId !== undefined) {
      requestUrl = requestUrl.concat(`start_from=${eventId}`);
    }

    const request = requestUrl.startsWith('https://') ? https.get : http.get;

    request(requestUrl, body => {
      this.stream = body;

      body.on('data', (buf: Uint8Array) => {
        const eventString = Buffer.from(buf).toString();
        this.parse(eventString);
      });
      body.once('readable', () => {
        console.info('Connected successfully to event stream endpoint.');
      });
      body.on('error', (error: Error) => {
        throw error;
      });
    });
  }

  public parse(eventString: string) {
    const result = parseEvent(eventString);

    if (result.events.length > 0) {
      result.events.map(this.runEventsLoop.bind(this));
    }
    if (result.err === StreamErrors.EarlyEndOfStream && result.remainder) {
      this.pendingDeployString = result.remainder;
    }
    if (result.err === StreamErrors.MissingDataHeaderAndId) {
      this.pendingDeployString += result.remainder;
    }
    if (result.err === StreamErrors.MissingDataHeader) {
      this.pendingDeployString += result.remainder;

      const newResult = parseEvent(this.pendingDeployString);
      if (newResult.err === null) {
        this.pendingDeployString = '';
      }
      result.events.map(this.runEventsLoop.bind(this));
    }
    return result;
  }

  public stop(): void {
    if (this.stream) this.stream.pause();
  }
}

export const parseEvent = (eventString: string): EventParseResult => {
  if (eventString.startsWith('data')) {
    const splitted = eventString.split('\n').filter(str => str !== '');

    if (splitted.length === 2) {
      const id =
        splitted[1] && splitted[1].startsWith('id:')
          ? splitted[1].substr(3)
          : null;
      try {
        const body = JSON.parse(splitted[0].substr(5));
        if (id) {
          // Note: This is case where there is proper object with JSON body and id in one chunk.
          return { events: [{ id, body }], remainder: null, err: null };
        } else {
          // Note: This is case where there is proper object with JSON body but without ID.
          return { events: [], remainder: body, err: StreamErrors.MissingId };
        }
      } catch {
        // Note: This is case where there is invalid JSON because of early end of stream.
        return {
          events: [],
          remainder: eventString,
          err: StreamErrors.EarlyEndOfStream
        };
      }
    } else if (splitted.length === 4) {
      const event0 = parseEvent(splitted[0].concat('\n', splitted[1]));
      const event1 = parseEvent(splitted[2].concat('\n', splitted[3]));

      return {
        events: [...event0.events, ...event1.events],
        remainder: event1.remainder,
        err: event1.err
      };
    } else {
      if (!eventString.startsWith('data:{"ApiVersion"')) {
        console.warn(`Unexpected event string: ${eventString}`);
      }
      return {
        events: [],
        remainder: eventString,
        err: StreamErrors.NotAnEvent
      };
    }
  } else {
    // Note: This is in case where there data chunk which isn't the first one.
    const splitted = eventString.split('\n');

    const id =
      splitted[1] && splitted[1].startsWith('id:')
        ? splitted[1].substr(3)
        : null;

    if (splitted[0] === ':' && splitted[1] === '' && splitted[2] === '') {
      return { events: [], remainder: null, err: StreamErrors.NotAnEvent };
    }

    if (id) {
      return {
        events: [],
        remainder: eventString,
        err: StreamErrors.MissingDataHeader
      };
    } else {
      return {
        events: [],
        remainder: eventString,
        err: StreamErrors.MissingDataHeaderAndId
      };
    }
  }
};
