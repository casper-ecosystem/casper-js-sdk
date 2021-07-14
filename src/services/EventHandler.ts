import { Result, Ok, Err } from 'ts-results';
import got from 'got';

type EventHandlerFn = (result: any) => void;
type EventName = string;

interface EventSubscription {
  eventName: EventName;
  eventHandlerFn: EventHandlerFn;
}

export class EventHandler {
  subscribedTo: EventSubscription[] = [];
  stream: any;

  constructor(public eventStreamUrl: string) {
    this.stream = got.stream(this.eventStreamUrl);

    const runLoop = async () => {
      for await (const eventString of this.stream) {
        const res = parseEvent(Buffer.from(eventString).toString());
        if (!res) return;
        this.subscribedTo.forEach((sub: EventSubscription) => {
          if (res.body && res.body.hasOwnProperty(sub.eventName)) {
            sub.eventHandlerFn(res);
          }
        });
      }
    };

    runLoop();
  }

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
    this.subscribedTo.filter(d => d.eventName !== eventName);
    return Ok(true);
  }
}

const parseEvent = (eventString: string): any => {
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
