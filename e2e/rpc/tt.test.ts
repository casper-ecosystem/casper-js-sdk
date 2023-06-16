import { assert } from 'chai';
import { CasperServiceByJsonRPC } from '../../src/services';

import { NODE_URL } from '../config';

const client = new CasperServiceByJsonRPC(NODE_URL);

describe('RPC', () => {
  it('chain_get_state_root_hash', async () => {
    const stateRootHash = await client.getStateRootHash();
    assert.equal(stateRootHash.length, 64);
  });
});
