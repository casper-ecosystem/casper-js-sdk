# SSE client

Provide basic functionality to work with Casper events that streamed by SSE server. It connects to the server and collect events, from other side consumers obtain this stream and delegate the process to specific handlers.

## Usage

```ts
import { SseClient, EventName } from 'casper-js-sdk';

const sseClient = new SseClient('http://<Node Address>:9999/events');

sseClient.subscribe(EventName.BlockAddedEventType, rawEvent => {
  try {
    const parsedEvent = rawEvent.parseAsBlockAddedEvent();
    console.log(`Block hash: ${parsedEvent.BlockAdded.blockHash}`);
  } catch (error) {
    console.error('Error processing event:', error);
  }
});

// Start the client with the last known event ID ( Optional )
const lastEventID = 1234;

sseClient.start(lastEventID);
```

## Events List

- [ApiVersion](https://github.com/casper-ecosystem/casper-js-sdk/blob/573b563d0bc038e46b07f12789286d336536f8c9/src/sse/event.ts#L138)
- [BlockAdded](https://github.com/casper-ecosystem/casper-js-sdk/blob/573b563d0bc038e46b07f12789286d336536f8c9/src/sse/event.ts#L162)
- [DeployProcessed](https://github.com/casper-ecosystem/casper-js-sdk/blob/573b563d0bc038e46b07f12789286d336536f8c9/src/sse/event.ts#L287)
- [DeployAccepted](https://github.com/casper-ecosystem/casper-js-sdk/blob/573b563d0bc038e46b07f12789286d336536f8c9/src/sse/event.ts#L296)
- [DeployExpired](https://github.com/casper-ecosystem/casper-js-sdk/blob/573b563d0bc038e46b07f12789286d336536f8c9/src/sse/event.ts#L313)
- [TransactionProcessed](https://github.com/casper-ecosystem/casper-js-sdk/blob/573b563d0bc038e46b07f12789286d336536f8c9/src/sse/event.ts#L114)
- [TransactionAccepted](https://github.com/casper-ecosystem/casper-js-sdk/blob/573b563d0bc038e46b07f12789286d336536f8c9/src/sse/event.ts#L328)
- [TransactionExpired](https://github.com/casper-ecosystem/casper-js-sdk/blob/573b563d0bc038e46b07f12789286d336536f8c9/src/sse/event.ts#L382)
- [FinalitySignature](https://github.com/casper-ecosystem/casper-js-sdk/blob/573b563d0bc038e46b07f12789286d336536f8c9/src/sse/event.ts#L674)
- [Step](https://github.com/casper-ecosystem/casper-js-sdk/blob/573b563d0bc038e46b07f12789286d336536f8c9/src/sse/event.ts#L766)
- [Fault](https://github.com/casper-ecosystem/casper-js-sdk/blob/573b563d0bc038e46b07f12789286d336536f8c9/src/sse/event.ts#L748)

## Key Components

### SseClient

`SseClient` serves as the primary interface for handling an SSE data stream. It encapsulates multiple responsibilities:

- **Connection Management**:  
  Establishes and manages an `EventSource` connection to the SSE endpoint. The client handles connection setup, monitors the stream for incoming messages, and cleans up resources when stopping.

- **Subscription Management**:  
  Provides methods to subscribe to and unsubscribe from specific event types. Each subscription links an event name with a handler function that will process matching events.

- **Event Dispatching**:  
  Listens for incoming messages, leverages the `EventParser` to check and parse messages, and dispatches parsed events to the corresponding subscription handler.

- **Error Handling**:  
  Monitors for errors during the SSE connection and raises exceptions when necessary.

#### Key Methods

- **subscribe**

  ```ts
  subscribe(eventName: EventName, eventHandlerFn: EventHandlerFn): Result<boolean, string>
  ```

  Registers a handler for a specific event type. Returns a result indicating success or failure (e.g., if already subscribed).

- **unsubscribe**

  ```ts
  unsubscribe(eventName: EventName): Result<boolean, string>
  ```

  Removes the subscription for the specified event type.

- **start**

  ```ts
  start(eventId?: number): void
  ```

  Opens the connection to the SSE endpoint, optionally starting from a given event ID, and begins processing incoming events.

- **stop**
  ```ts
  stop(): void
  ```
  Closes the SSE connection, stopping further event processing.

---

### EventParser

`EventParser` is responsible for processing the raw data received from the SSE stream. Its core functions include:

- **Event Filtering**:

  ```ts
  shouldHandleEvent(data: string, eventName: string): boolean
  ```

  Determines whether the raw event data contains the property corresponding to the expected event type. It parses the incoming JSON and checks for the presence of the event identifier.

- **Event Parsing**:
  ```ts
  parseEvent(data: string, type: string, lastEventId: string): RawEvent
  ```
  Converts the raw string data into a structured `RawEvent` object, which contains metadata such as the event type, raw payload, and event ID.

---
