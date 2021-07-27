import { assert } from 'chai';
import {
  CasperServiceByJsonRPC,
  EventStream,
  EventName
} from '../../src/services';
import { Keys, DeployUtil, RuntimeArgs } from '../../src/index';

let client = new CasperServiceByJsonRPC('http://127.0.0.1:40101/rpc');

describe('RPC', () => {
  xit('should return correct block by number', async () => {
    let check = async (height: number) => {
      let result = await client.getBlockInfoByHeight(height);
      assert.equal(result.block?.header.height, height);
    };
    let blocks_to_check = 3;
    for (let i = 0; i < blocks_to_check; i++) {
      await check(i);
    }
  });

  xit('should return correct block by hash', async () => {
    let check = async (height: number) => {
      let block_by_height = await client.getBlockInfoByHeight(height);
      let block_hash = block_by_height.block?.hash!;
      let block = await client.getBlockInfo(block_hash);
      assert.equal(block.block?.hash, block_hash);
    };
    let blocks_to_check = 3;
    for (let i = 0; i < blocks_to_check; i++) {
      await check(i);
    }
  });

  it('should not allow to send deploy larger then 1 megabyte.', async () => {
    // moduleBytes need to have length of (1 megabyte - 169 bytes) to produce
    // a deploy with the size of (1 megabyte + 1 byte).
    const oneMegaByte = 1048576;
    const moduleBytes = Uint8Array.from(Array(oneMegaByte - 169).fill(0));

    let deployParams = new DeployUtil.DeployParams(
      Keys.Ed25519.new().publicKey,
      'test'
    );
    let session = DeployUtil.ExecutableDeployItem.newModuleBytes(
      moduleBytes,
      RuntimeArgs.fromMap({})
    );
    let payment = DeployUtil.standardPayment(100000);
    let deploy = DeployUtil.makeDeploy(deployParams, session, payment);

    assert.equal(DeployUtil.deploySizeInBytes(deploy), oneMegaByte + 1);
    await client
      .deploy(deploy)
      .then(_ => {
        assert.fail("client.deploy should't throw an error.");
      })
      .catch(err => {
        let expectedMessage =
          `Deploy can not be send, because it's too large: ${oneMegaByte +
            1} bytes. ` + `Max size is 1 megabyte.`;
        assert.equal(err.message, expectedMessage);
      });
  });

  xit('EventHandler', () => {
    const client = new EventStream('http://localhost:60101/events');
    client.subscribe(EventName.FinalitySignature, value =>
      console.log('SUBSCRIBED VALUE', value)
    );
    client.start();
    setTimeout(() => {
      console.log('STOP');
      client.stop();
    }, 10000);
    setTimeout(() => {
      console.log('START');
      client.start();
    }, 3 * 10000);
    setTimeout(() => {
      console.log('STOP');
      client.stop();
    }, 6 * 10000);
  });

  xit('get-dictionary-item', async () => {
    const client = new CasperServiceByJsonRPC('http://127.0.0.1:11101/rpc');
    const v = await client.getDictionaryItem(
      '332ec11a30a3d880b62423a6c33016199eb16c3bd7c25f0984ace573dfd6ee72',
      'hun',
      'uref-49d9303967823eb3749423c4791c85433b0843f932f0d0d5b1d73f00a644d19e-007'
    );
    console.log(v);
  });
});
