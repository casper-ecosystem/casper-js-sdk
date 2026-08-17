import { beforeAll, describe, expect, it } from 'vitest';

import {
  EventName,
  KeyAlgorithm,
  PrivateKey,
  RawEvent,
  SseClient
} from '../src';
import { EVENT_STREAM_URL, loadFaucetKey } from './config';
import { nativeTransfer, newRpcClient, waitForBlockHeight } from './helpers';

function waitUntil(
  predicate: () => boolean,
  timeoutMs: number,
  intervalMs = 500
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const check = () => {
      if (predicate()) return resolve();
      if (Date.now() > deadline) {
        return reject(new Error('Timed out waiting for condition'));
      }
      setTimeout(check, intervalMs);
    };
    check();
  });
}

describe('SSE', () => {
  const rpcClient = newRpcClient();
  let faucetKey: PrivateKey;

  beforeAll(async () => {
    faucetKey = loadFaucetKey();
    await waitForBlockHeight(rpcClient, 2);
  }, 120_000);

  it('connects and receives the ApiVersion event', async () => {
    const client = new SseClient(EVENT_STREAM_URL);
    const seen: RawEvent[] = [];
    client.subscribe(EventName.APIVersionEventType, event => seen.push(event));
    client.start();

    await waitUntil(() => seen.length >= 1, 20_000);
    const parsed = seen[0].parseAsAPIVersionEvent();
    expect(parsed.apiVersion).toBeTruthy();

    client.stop();
  }, 30_000);

  it('subscribes to BlockAdded and observes monotonically increasing heights', async () => {
    const client = new SseClient(EVENT_STREAM_URL);
    const seen: RawEvent[] = [];
    client.subscribe(EventName.BlockAddedEventType, event => seen.push(event));
    client.start();

    await waitUntil(() => seen.length >= 2, 60_000);
    const [first, second] = seen
      .slice(0, 2)
      .map(event => event.parseAsBlockAddedEvent());

    expect(second.BlockAdded.block.height).toBeGreaterThan(
      first.BlockAdded.block.height
    );

    client.stop();
  }, 70_000);

  it('observes the TransactionProcessed event for a transfer fired while subscribed', async () => {
    const client = new SseClient(EVENT_STREAM_URL);
    const seen: RawEvent[] = [];
    client.subscribe(EventName.TransactionProcessedEventType, event =>
      seen.push(event)
    );
    client.start();

    const recipient = PrivateKey.generate(KeyAlgorithm.ED25519);
    const { transaction } = await nativeTransfer(
      rpcClient,
      faucetKey,
      recipient.publicKey,
      '2500000000'
    );
    const transactionHashHex = transaction.hash.toHex();

    const matches = () =>
      seen
        .map(event => event.parseAsTransactionProcessedEvent())
        .find(
          parsed =>
            parsed.transactionProcessedPayload.transactionHash.toHex() ===
            transactionHashHex
        );

    await waitUntil(() => matches() !== undefined, 20_000);
    expect(matches()).toBeDefined();

    client.stop();
  }, 150_000);

  it('requires start() again after stop(), and keeps the same subscriptions', async () => {
    const client = new SseClient(EVENT_STREAM_URL);
    const seen: RawEvent[] = [];
    client.subscribe(EventName.BlockAddedEventType, event => seen.push(event));
    client.start();

    await waitUntil(() => seen.length >= 1, 30_000);
    client.stop();
    const countAfterStop = seen.length;

    // `stop()` closes the EventSource, which per the WhatWG contract can never
    // reconnect, and `SseClient` has no reconnect logic of its own.
    await new Promise(resolve => setTimeout(resolve, 6_000));
    expect(seen.length).toBe(countAfterStop);

    // Subscriptions live on the client, not the connection, so `start()`
    // resumes delivery without re-subscribing.
    client.start();
    await waitUntil(() => seen.length > countAfterStop, 30_000);
    expect(seen.length).toBeGreaterThan(countAfterStop);

    client.stop();
  }, 80_000);
});
