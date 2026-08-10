import { ErrorEvent, EventSource } from 'eventsource';
import { Result, Ok, Err } from 'ts-results';

import { EventName, RawEvent } from './event';
import { EventParser } from './event_parser';

/**
 * Type definition for an event handler function.
 *
 * @param result - A RawEvent instance representing the event.
 */
export type EventHandlerFn = (result: RawEvent) => void;

/**
 * Error raised when the event stream itself fails.
 */
export class SseError extends Error {
  /**
   * HTTP status code, when the failure came from an HTTP response (e.g. 401 or
   * 403). Undefined for transport-level failures.
   */
  public readonly code?: number;

  constructor(message?: string, code?: number) {
    super(
      message ?? (code ? `Event stream failed with status ${code}` : 'Event stream failed')
    );
    this.name = 'SseError';
    this.code = code;
  }
}

/**
 * Interface representing an event subscription.
 */
export interface EventSubscription {
  /**
   * The name of the event to subscribe to.
   */
  eventName: EventName;
  /**
   * The event handler function to invoke when the event occurs.
   */
  eventHandlerFn: EventHandlerFn;
}

/**
 * Client for managing Server-Sent Events (SSE) connections.
 */
export class SseClient {
  private subscribedTo: EventSubscription[] = [];
  private eventSource?: EventSource;
  private parser: EventParser;

  /**
   * Creates an instance of SseClient.
   *
   * @param eventStreamUrl - The URL of the event stream.
   */
  constructor(private eventStreamUrl: string) {
    this.parser = new EventParser();
  }

  /**
   * Subscribes to a specified event.
   *
   * @param eventName - The name of the event to subscribe to.
   * @param eventHandlerFn - The function to handle the event when it occurs.
   * @returns A Result indicating success (Ok(true)) or failure (Err with an error message).
   */
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

  /**
   * Unsubscribes from a specified event.
   *
   * @param eventName - The name of the event to unsubscribe from.
   * @returns A Result indicating success (Ok(true)) or failure (Err with an error message).
   */
  public unsubscribe(eventName: EventName): Result<boolean, string> {
    if (!this.subscribedTo.some(e => e.eventName === eventName)) {
      return Err('Cannot find provided subscription');
    }
    this.subscribedTo = this.subscribedTo.filter(
      e => e.eventName !== eventName
    );
    return Ok(true);
  }

  /**
   * Processes incoming messages from the event source and dispatches them to the appropriate handlers.
   *
   * @param event - The message event containing the event data.
   */
  private runEventsLoop(event: MessageEvent<string>): void {
    this.subscribedTo.forEach(sub => {
      if (this.parser.shouldHandleEvent(event.data, sub.eventName)) {
        const rawEvent = this.parser.parseEvent(
          event.data,
          event.type,
          event.lastEventId
        );
        sub.eventHandlerFn(rawEvent);
      }
    });
  }

  /**
   * Starts the SSE connection.
   *
   * @param eventId - (Optional) The event ID to start streaming from.
   * @param onError - (Optional) Invoked when the stream reports an error, with
   *   the HTTP status code attached when the failure was an HTTP one (401, 403,
   *   …). When omitted, the error is thrown, which is what this client has
   *   always done — note that an error raised from the stream's callback cannot
   *   be caught by the caller of `start`.
   */
  public start(
    eventId?: number,
    onError?: (error: SseError) => void
  ): void {
    const separator = this.eventStreamUrl.includes('?') ? '&' : '?';
    let requestUrl = `${this.eventStreamUrl}${separator}`;
    if (eventId !== undefined) {
      requestUrl += `start_from=${eventId}`;
    }
    this.eventSource = new EventSource(requestUrl);

    this.eventSource.onmessage = e => this.runEventsLoop(e);
    this.eventSource.onerror = (event: ErrorEvent) => {
      // eventsource v3 hands the callback an `ErrorEvent`, not an `Error`.
      // Re-raising it verbatim — as this did before — surfaced an object with
      // no stack and no readable message; the HTTP status that explains the
      // failure sits on `.code`.
      const error = new SseError(event.message, event.code);

      if (onError) {
        onError(error);
        return;
      }

      throw error;
    };
  }

  /**
   * Stops the SSE connection.
   */
  public stop(): void {
    if (this.eventSource) {
      this.eventSource.close();
    }
  }
}
