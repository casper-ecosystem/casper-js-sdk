import { assert } from 'chai';
import {
  CasperServiceByJsonRPC,
  EventStream,
  DeployWatcher,
  EventName,
  PurseIdentifier
} from '../../src/services';
import { Keys, DeployUtil, RuntimeArgs } from '../../src/index';

let client = new CasperServiceByJsonRPC('http://localhost:11101/rpc');

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

  xit('DeployWatcher', () => {
    const client = new DeployWatcher('http://localhost:18101/events/main');
    client.subscribe([
      {
        deployHash:
          '418bd905f86cad3bc3c46340ddf5119da4c51d2da24cf07cfe7c79a7f14f50aa',
        eventHandlerFn: value => console.log('SUBSCRIBED VALUE', value)
      }
    ]);
    client.start();
    setTimeout(() => {
      client.subscribe([
        {
          deployHash:
            '7a28f822a89b7dd65c0d29765e28d949a343d0b2c9cbee02abc89eaba542a7e5',
          eventHandlerFn: value => console.log('SUBSCRIBED VALUE 2', value)
        }
      ]);
    }, 3 * 10000);
  });

  xit('queryBalance', async () => {
    const res = await client.queryBalance(PurseIdentifier.PurseUref, 'uref-6f2d3316f5c114923e6ec7087a399f692f4ce85197106a6daa97bf7f444e4f9e-007');
    assert.equal(res.toString(), "1000000000000000000000000000000000");
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
});
