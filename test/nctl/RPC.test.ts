import { assert } from 'chai';
import { CasperServiceByJsonRPC } from '../../src/services';

let client = new CasperServiceByJsonRPC(
    'http://127.0.0.1:40101/rpc',
);

describe.skip('RPC', () => {
    it('should return correct block by number', async () => {
        let check = async (height: number) => {
            let result = await client.getBlockInfoByHeight(height);
            assert.equal(result.block?.header.height, height);
        };
        let blocks_to_check = 3;
        for(let i = 0; i < blocks_to_check; i++) {
            await check(i);
        }
    });

    it('should return correct block by hash', async () => {
        let check = async (height: number) => {
            let block_by_height = await client.getBlockInfoByHeight(height);
            let block_hash = block_by_height.block?.hash!;
            let block = await client.getBlockInfo(block_hash);
            assert.equal(block.block?.hash, block_hash);
        };
        let blocks_to_check = 3;
        for(let i = 0; i < blocks_to_check; i++) {
            await check(i);
        }
    });
});