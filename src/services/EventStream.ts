import { fetch } from 'fetch-h2';
import { Result, Ok, Err } from 'ts-results';

export interface DeploySubscription {
  deployHash: string;
  eventHandlerFn: EventHandlerFn;
}

enum StreamErrors {
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
    this.es.subscribe(EventName.DeployProcessed, result => {
      const deployHash = result.body.DeployProcessed.deploy_hash;
      const pendingDeploy = this.watchList.find(
        d => d.deployHash === deployHash
      );
      if (pendingDeploy) {
        pendingDeploy.eventHandlerFn(result);
        this.unsubscribe(deployHash);
      }
    });
    this.es.start();
  }

  stop() {
    this.es.stop();
  }
}

type EventHandlerFn = (result: any) => void;

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
  id: string | null;
  err: StreamErrors | null;
  body: any | null;
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

  private runEventsLoop(result: EventParseResult) {
    this.subscribedTo.forEach((sub: EventSubscription) => {
      if (result.body && result.body.hasOwnProperty(sub.eventName)) {
        sub.eventHandlerFn(result);
      }
    });
  }

  public async start(eventId = 0) {
    const separator = this.eventStreamUrl.indexOf('?') > -1 ? '&' : '?';
    const requestUrl = `${this.eventStreamUrl}${separator}start_from=${eventId}`;
    const response = await fetch(requestUrl);
    const body = await response.readable();

    body.on('data', (buf: Uint8Array) => {
      const result = parseEvent(Buffer.from(buf).toString());
      if (result && !result.err) {
        this.runEventsLoop(result);
      }
      if (result.err === StreamErrors.EarlyEndOfStream) {
        this.pendingDeployString = result.body;
      }
      if (result.err === StreamErrors.MissingDataHeaderAndId) {
        this.pendingDeployString += result.body;
      }
      if (result.err === StreamErrors.MissingDataHeader) {
        this.pendingDeployString += result.body;
        this.pendingDeployString += `\nid:${result.id}`;

        const newResult = parseEvent(this.pendingDeployString);
        if (newResult.err === null) {
          this.pendingDeployString = '';
        }
        this.runEventsLoop(newResult);
      }
    });
    body.once('readable', () => {
      console.info('Connected successfully to event stream endpoint.');
    });
    body.on('error', (error: Error) => {
      throw error;
    });
    body.on('timeout', () => {
      throw Error('EventStream: Timeout error');
    });
    body.on('close', () => {
      throw Error('EventStream: Connection closed');
    });
  }

  public stop(): void {
    if (this.stream) this.stream.pause();
  }
}

export const parseEvent = (eventString: string): any => {
  if (eventString.startsWith('data')) {
    const splitted = eventString.split('\n');
    const id =
      splitted[1] && splitted[1].startsWith('id:')
        ? splitted[1].substr(3)
        : null;
    try {
      const body = JSON.parse(splitted[0].substr(5));
      if (id) {
        // Note: This is case where there is proper object with JSON body and id in one chunk.
        return { id, body, err: null };
      } else {
        // Note: This is case where there is proper object with JSON body but without ID.
        return { id, body, err: StreamErrors.MissingId };
      }
    } catch {
      // Note: This is case where there is invalid JSON because of early end of stream.
      const body = splitted[0];
      return { id, body, err: StreamErrors.EarlyEndOfStream };
    }
  } else {
    // Note: This is in case where there data chunk which isn't the first one.
    const splitted = eventString.split('\n');
    const body = splitted[0];
    const id =
      splitted[1] && splitted[1].startsWith('id:')
        ? splitted[1].substr(3)
        : null;

    if (splitted[0] === ':' && splitted[1] === '' && splitted[2] === '') {
      return { id: null, body: null, err: StreamErrors.NotAnEvent };
    }

    if (id) {
      return { id, body, err: StreamErrors.MissingDataHeader };
    } else {
      return { id: null, body, err: StreamErrors.MissingDataHeaderAndId };
    }
  }
};
