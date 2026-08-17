import { expect } from 'vitest';

import { EventParser, EventName, RawEvent } from '../../sse';
import {
  apiVersionJson,
  blockAddedJson,
  transactionAcceptedJson,
  transactionProcessedJson,
  transactionExpiredJson,
  finalitySignatureJson,
  faultJson,
  stepJson
} from '../data/sse';

// Stringified, like the SSE `data:` line `SseClient` hands to `RawEvent`.
const raw = (eventType: string, payload: unknown): RawEvent =>
  new RawEvent(eventType, JSON.stringify(payload), '1');

describe('EventParser', () => {
  const parser = new EventParser();

  it('detects the top-level property matching the event name', () => {
    const data = JSON.stringify(blockAddedJson);

    expect(parser.shouldHandleEvent(data, EventName.BlockAddedEventType)).to.be
      .true;
    expect(parser.shouldHandleEvent(data, EventName.FaultEventType)).to.be
      .false;
  });

  it('returns false rather than throwing on unparsable JSON', () => {
    expect(parser.shouldHandleEvent('not json', EventName.BlockAddedEventType))
      .to.be.false;
  });

  it('wraps the raw payload and metadata verbatim, without parsing it', () => {
    const event = parser.parseEvent(
      '{"ApiVersion":"2.0.0"}',
      'ApiVersion',
      '7'
    );

    expect(event.data).to.equal('{"ApiVersion":"2.0.0"}');
    expect(event.eventType).to.equal('ApiVersion');
    expect(event.lastEventId).to.equal('7');
  });
});

describe('RawEvent — typed event parsing', () => {
  it('parses ApiVersion', () => {
    const event = raw(
      EventName.APIVersionEventType,
      apiVersionJson
    ).parseAsAPIVersionEvent();

    expect(event.apiVersion).to.equal('2.0.0');
  });

  it('parses BlockAdded (v2 block)', () => {
    const event = raw(
      EventName.BlockAddedEventType,
      blockAddedJson
    ).parseAsBlockAddedEvent();

    expect(event.BlockAdded.blockHash).to.equal(
      blockAddedJson.BlockAdded.block_hash
    );
    expect(event.BlockAdded.block.hash.toHex()).to.equal(
      blockAddedJson.BlockAdded.block_hash
    );
    expect(event.BlockAdded.block.height).to.equal(3444515);
  });

  it('parses TransactionAccepted (TransactionV1)', () => {
    const event = raw(
      EventName.TransactionAcceptedEventType,
      transactionAcceptedJson
    ).parseAsTransactionAcceptedEvent();

    expect(event).to.not.be.instanceOf(Error);
    expect(
      event.transactionAcceptedPayload.transaction.hash.transactionV1?.toHex()
    ).to.equal(transactionAcceptedJson.TransactionAccepted.Version1.hash);
  });

  it('parses TransactionProcessed', () => {
    const event = raw(
      EventName.TransactionProcessedEventType,
      transactionProcessedJson
    ).parseAsTransactionProcessedEvent();

    expect(event).to.not.be.instanceOf(Error);
    const payload = event.transactionProcessedPayload;
    expect(payload.transactionHash.transactionV1?.toHex()).to.equal(
      transactionProcessedJson.TransactionProcessed.transaction_hash.Version1
    );
    expect(payload.blockHash.toHex()).to.equal(
      transactionProcessedJson.TransactionProcessed.block_hash
    );
    expect(payload.executionResult.cost).to.equal(100000000);
    expect(payload.messages).to.deep.equal([]);
  });

  it('parses TransactionExpired', () => {
    const event = raw(
      EventName.TransactionExpiredEventType,
      transactionExpiredJson
    ).parseAsTransactionExpiredEvent();

    expect(event).to.not.be.instanceOf(Error);
    expect(
      event.transactionExpiredPayload.transactionHash.transactionV1?.toHex()
    ).to.equal(
      transactionExpiredJson.TransactionExpired.transaction_hash.Version1
    );
  });

  it('parses FinalitySignature (V2)', () => {
    const event = raw(
      EventName.FinalitySignatureType,
      finalitySignatureJson
    ).parseAsFinalitySignatureEvent();

    expect(event).to.not.be.instanceOf(Error);
    const sig = event.finalitySignature;
    expect(sig.eraID).to.equal(14828);
    expect(sig.blockHeight).to.equal(3444515);
    expect(sig.publicKey.toHex()).to.equal(
      finalitySignatureJson.FinalitySignature.V2.public_key
    );
    // A V2 payload has no v1 origin; the wrong branch would populate this.
    expect(sig.originFinalitySignatureV1).to.be.undefined;
  });

  it('parses Fault', () => {
    const event = raw(EventName.FaultEventType, faultJson).parseAsFaultEvent();

    expect(event.fault.eraID).to.equal(14828);
    expect(event.fault.publicKey.toHex()).to.equal(faultJson.Fault.public_key);
  });

  // Fixture captured off a live 2.x node's event stream, so it pins the real
  // `Step` casing and the 2.x payload shape (no `execution_effect`).
  it('parses Step', () => {
    const event = raw(EventName.StepEventType, stepJson).parseAsStepEvent();

    expect(event.step.eraID).to.equal(671);
    expect(event.step.executionEffects).to.have.lengthOf(2);
    expect(event.step.executionEffects[0].key.toPrefixedString()).to.equal(
      'uref-209640fb9c827b9b5802a44d086f529ae4a64158c8ea9eab490debe97cb70e05-000'
    );
  });
});

describe('RawEvent — malformed payloads', () => {
  it('BlockAdded: an unrelated shape throws a descriptive error', () => {
    expect(() =>
      raw(EventName.BlockAddedEventType, {
        foo: 'bar'
      }).parseAsBlockAddedEvent()
    ).to.throw('Invalid JSON structure for BlockAddedEvent');
  });

  it('BlockAdded: present but incomplete throws rather than returning a partial block', () => {
    expect(() =>
      raw(EventName.BlockAddedEventType, {
        BlockAdded: {}
      }).parseAsBlockAddedEvent()
    ).to.throw();
  });

  // These four must throw, not return an Error: a returned Error is truthy, so
  // `parseEvent`'s `if (!parsed) throw` guard hands it back as the event.
  it('TransactionAccepted: unmatched shape throws', () => {
    expect(() =>
      raw(EventName.TransactionAcceptedEventType, {
        TransactionAccepted: { garbage: true }
      }).parseAsTransactionAcceptedEvent()
    ).to.throw('Failed to match any transaction structure');
  });

  it('TransactionExpired: unmatched shape throws', () => {
    expect(() =>
      raw(EventName.TransactionExpiredEventType, {
        TransactionExpired: { garbage: true }
      }).parseAsTransactionExpiredEvent()
    ).to.throw('Failed to match any transaction structure');
  });

  it('TransactionProcessed: unmatched shape throws', () => {
    expect(() =>
      raw(EventName.TransactionProcessedEventType, {
        TransactionProcessed: { garbage: true }
      }).parseAsTransactionProcessedEvent()
    ).to.throw('Failed to match any transaction structure');
  });

  it('FinalitySignature: a nil wrapper throws', () => {
    expect(() =>
      raw(EventName.FinalitySignatureType, {
        FinalitySignature: null
      }).parseAsFinalitySignatureEvent()
    ).to.throw('FinalitySignatureWrapper is nil');
  });

  it('the thrown parse error keeps the underlying failure as its cause', () => {
    let caught: unknown;
    try {
      raw(EventName.FinalitySignatureType, {
        FinalitySignature: null
      }).parseAsFinalitySignatureEvent();
    } catch (error) {
      caught = error;
    }

    expect((caught as Error).cause).to.be.instanceOf(Error);
    expect(((caught as Error).cause as Error).message).to.include(
      'FinalitySignatureWrapper is nil'
    );
  });
});
