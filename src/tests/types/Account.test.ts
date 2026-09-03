import { describe, it, expect } from 'vitest';
import { TypedJSON } from 'typedjson';

import { Account } from '../../types';
import { stateGetAccountInfoJson } from '../data';
import { expectJsonRoundTrip } from '../roundtrip';

describe('Account', () => {
  const accountJson = stateGetAccountInfoJson.account;

  it('round-trips through JSON: toJSON(fromJSON(x)) deep-equals the fixture', () => {
    expectJsonRoundTrip(new TypedJSON(Account), accountJson);
  });

  it('parses account hash, main purse, associated keys and thresholds', () => {
    const parsed = new TypedJSON(Account).parse(accountJson)!;

    expect(parsed.accountHash.toPrefixedString()).to.equal(
      accountJson.account_hash
    );
    expect(parsed.mainPurse.toPrefixedString()).to.equal(
      accountJson.main_purse
    );
    expect(parsed.namedKeys).to.have.lengthOf(accountJson.named_keys.length);
    expect(parsed.namedKeys[0].name).to.equal(accountJson.named_keys[0].name);
    expect(parsed.namedKeys[0].key.toPrefixedString()).to.equal(
      accountJson.named_keys[0].key
    );
    expect(parsed.associatedKeys).to.have.lengthOf(
      accountJson.associated_keys.length
    );
    expect(parsed.associatedKeys[0].accountHash.toPrefixedString()).to.equal(
      accountJson.associated_keys[0].account_hash
    );
    expect(parsed.associatedKeys[0].weight).to.equal(
      accountJson.associated_keys[0].weight
    );
    expect(parsed.actionThresholds.deployment).to.equal(
      accountJson.action_thresholds.deployment
    );
    expect(parsed.actionThresholds.keyManagement).to.equal(
      accountJson.action_thresholds.key_management
    );
  });
});
