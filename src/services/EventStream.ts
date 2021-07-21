import { Result, Ok, Err } from 'ts-results';
import http from 'http';

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

export class EventStream {
  subscribedTo: EventSubscription[] = [];
  stream: any;

  constructor(public eventStreamUrl: string) {}

  subscribe(
    eventName: EventName,
    eventHandlerFn: EventHandlerFn
  ): Result<boolean, string> {
    if (this.subscribedTo.some(e => e.eventName === eventName)) {
      return Err('Already subscribed to this event');
    }
    this.subscribedTo.push({ eventName, eventHandlerFn });
    return Ok(true);
  }

  unsubscribe(eventName: EventName): Result<boolean, string> {
    if (!this.subscribedTo.some(e => e.eventName === eventName)) {
      return Err('Cannot find provided subscription');
    }
    this.subscribedTo = this.subscribedTo.filter(
      d => d.eventName !== eventName
    );
    return Ok(true);
  }

  start(eventId = 0): void {
    http.get(`${this.eventStreamUrl}?start_from=${eventId}`, res => {
      this.stream = res;
      this.stream.on('data', (buf: Uint8Array) => {
        const result = parseEvent(Buffer.from(buf).toString());
        if (result) {
          this.subscribedTo.forEach((sub: EventSubscription) => {
            if (result.body.hasOwnProperty(sub.eventName)) {
              sub.eventHandlerFn(result);
            }
          });
        }
      });
    });
  }

  stop(): void {
    this.stream.destroy();
  }
}

export const parseEvent = (eventString: string): any => {
  if (eventString.startsWith('id')) {
    return { id: eventString.substr(3) };
  }

  if (eventString.startsWith('data')) {
    const splitted = eventString.split('\n');
    const body = JSON.parse(splitted[0].substr(5));
    const id = splitted[1] ? splitted[1].substr(3) : null;
    return { id, body };
  }
};
