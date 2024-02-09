import EventSource from 'eventsource';
import { Result, Ok, Err } from 'ts-results';

export interface DeploySubscription {
  deployHash: string;
  eventHandlerFn: EventHandlerFn;
}

/**
 * @deprecated
 */
enum StreamErrors {
  NotAnEvent,
  EarlyEndOfStream,
  MissingDataHeader,
  MissingDataHeaderAndId,
  MissingId
}

interface EventStreamOptions {
  headers?: object;
}

export class DeployWatcher {
  es: EventStream;
  watchList: DeploySubscription[] = [];

  constructor(public eventStreamUrl: string, protected eventStreamOptions?: EventStreamOptions) {
    this.es = new EventStream(eventStreamUrl, eventStreamOptions);
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
  /** Can be fetched in `/events/main` path */
  BlockAdded = 'BlockAdded',
  /** Can be fetched in `/events/main` path */
  DeployProcessed = 'DeployProcessed',
  /** Can be fetched in `/events/deploys` path */
  DeployAccepted = 'DeployAccepted',
  BlockFinalized = 'BlockFinalized',
  /** Can be fetched in `/events/sigs` path */
  FinalitySignature = 'FinalitySignature',
  Fault = 'Fault'
}

interface EventSubscription {
  eventName: EventName;
  eventHandlerFn: EventHandlerFn;
}

export interface EventParseResult<E = unknown> {
  id: string;
  /** @deprecated */
  err?: StreamErrors | null;
  body: E;
}

export class EventStream {
  subscribedTo: EventSubscription[] = [];
  eventSource: EventSource;

  constructor(public eventStreamUrl: string, protected eventStreamOptions?: EventStreamOptions) {}

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

  public start(eventId?: number) {
    const separator = this.eventStreamUrl.indexOf('?') > -1 ? '&' : '?';
    let requestUrl = `${this.eventStreamUrl}${separator}`;
    if (eventId !== undefined) {
      requestUrl = requestUrl.concat(`start_from=${eventId}`);
    }
    this.eventSource = new EventSource(requestUrl, this.eventStreamOptions);

    this.eventSource.onmessage = e => {
      const event = {
        body: JSON.parse(e.data),
        id: e.lastEventId
      };
      this.runEventsLoop(event);
    };

    this.eventSource.onerror = err => {
      throw err;
    };
  }

  public stop(): void {
    if (this.eventSource) this.eventSource.close();
  }
}
