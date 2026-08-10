import { TypedJSON, jsonMember, jsonObject } from 'typedjson';
import { expect } from 'vitest';
import { fail } from 'assert';

import { InitiatorAddr } from '../../types';

@jsonObject
class UnderTest {
  @jsonMember({
    deserializer: json => InitiatorAddr.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public a: InitiatorAddr;
}

describe('InitiatorAddr', () => {
  const serializer = new TypedJSON(UnderTest);
  it('should parse InitiatorAddr::PublicKey correctly', () => {
    const mockJson = {
      a: {
        PublicKey:
          '01f0b77e728673aef7f984fd41d38a9424fd1796e07968534625c5b24b997ab34b'
      }
    };
    const parsed = serializer.parse(mockJson);
    if (parsed) {
      const reserialized = JSON.parse(serializer.stringify(parsed));
      expect(reserialized).to.deep.eq(mockJson);
    } else {
      fail('InitiatorAddr is undefined');
    }
  });
  it('should parse InitiatorAddr::AccountHash correctly', () => {
    const mockJson = {
      a: {
        AccountHash:
          'account-hash-032816afac5b702a899ff861f4192b2bea3cd4f109a8b90140a318054b97c139'
      }
    };
    const parsed = serializer.parse(mockJson);
    if (parsed) {
      const reserialized = JSON.parse(serializer.stringify(parsed));
      expect(reserialized).to.deep.eq(mockJson);
    } else {
      fail('InitiatorAddr is undefined');
    }
  });
});
