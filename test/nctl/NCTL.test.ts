import { assert, expect } from 'chai';
import {
  CasperServiceByJsonRPC,
  DeployWatcher,
  Keys,
  DeployUtil,
  RuntimeArgs
} from '../../src';
import { getKeysFromHexPrivKey, SignatureAlgorithm } from '../../src/lib/Keys';
import { getAccountInfo } from '../utils';
import { sleep, start_nctl_docker, waitForFirstBlock } from './setup';

before(async () => {
  await start_nctl_docker();
  await waitForFirstBlock();
});

describe('NCTL', () => {
  const nodeUrl = 'http://localhost:11101/rpc';
  const client = new CasperServiceByJsonRPC(nodeUrl);
  const faucetKeys = getKeysFromHexPrivKey(
    'MC4CAQAwBQYDK2VwBCIEIFPhcforANWls15bVRyIU8KHnehhclpn5+4ow4hq7B6q',
    SignatureAlgorithm.Ed25519
  );
  let faucetMainPurseUref = '';

  it('should return correct block by number', async () => {
    const check = async (height: number) => {
      while (true) {
        try {
          const result = await client.getBlockInfoByHeight(height);
          assert.equal(result.block?.header.height, height);
          break;
        } catch (error) {
          if (error.message === 'block not known') {
            await sleep(300);
          } else console.error(error);
        }
      }
    };
    const blocks_to_check = 3;
    for (let i = 0; i < blocks_to_check; i++) {
      await check(i);
    }
  });

  it('should return correct block by hash', async () => {
    const check = async (height: number) => {
      while (true) {
        try {
          const block_by_height = await client.getBlockInfoByHeight(height);
          const block_hash = block_by_height.block?.hash;
          assert.exists(block_hash);
          const block = await client.getBlockInfo(block_hash!);
          assert.equal(block.block?.hash, block_hash);
          break;
        } catch (error) {
          if (error.message === 'block not known') {
            await sleep(300);
          } else console.error(error);
        }
      }
    };
    const blocks_to_check = 3;
    for (let i = 0; i < blocks_to_check; i++) {
      await check(i);
    }
  });

  it('should not allow to send deploy larger then 1 megabyte.', async () => {
    // moduleBytes need to have length of (1 megabyte - 169 bytes) to produce
    // a deploy with the size of (1 megabyte + 1 byte).
    const oneMegaByte = 1048576;
    const moduleBytes = Uint8Array.from(Array(oneMegaByte - 169).fill(0));

    const deployParams = new DeployUtil.DeployParams(
      Keys.Ed25519.new().publicKey,
      'test'
    );
    const session = DeployUtil.ExecutableDeployItem.newModuleBytes(
      moduleBytes,
      RuntimeArgs.fromMap({})
    );
    const payment = DeployUtil.standardPayment(100000);
    const deploy = DeployUtil.makeDeploy(deployParams, session, payment);

    assert.equal(DeployUtil.deploySizeInBytes(deploy), oneMegaByte + 1);
    await client
      .deploy(deploy)
      .then(_ => {
        assert.fail("client.deploy should't throw an error.");
      })
      .catch(err => {
        const expectedMessage =
          `Deploy can not be send, because it's too large: ${oneMegaByte +
            1} bytes. ` + `Max size is 1 megabyte.`;
        assert.equal(err.message, expectedMessage);
      });
  });

  it('DeployWatcher', () => {
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

  it('chain_get_state_root_hash', async () => {
    const stateRootHash = await client.getStateRootHash();
    assert.equal(stateRootHash.length, 64);
  });

  it('state_get_balance', async () => {
    const stateRootHash = await client.getStateRootHash();
    const accountInfo = await getAccountInfo(nodeUrl, faucetKeys.publicKey);

    const balance = await client.getAccountBalance(
      stateRootHash,
      accountInfo.mainPurse
    );
    assert.equal(balance.toString(), '1000000000000000000000000000000000');
  });

  it('chain_get_block', async () => {
    const latestBlock = await client.getLatestBlockInfo();
    expect(latestBlock).to.have.property('block');
  });

  it('info_get_peers', async () => {
    const peers = await client.getPeers();
    expect(peers).to.have.property('peers');
  });

  it('info_get_status', async () => {
    const status = await client.getStatus();
    expect(status).to.have.property('peers');
    expect(status).to.have.property('chainspec_name');
    expect(status).to.have.property('starting_state_root_hash');
    expect(status).to.have.property('last_added_block_info');
    expect(status).to.have.property('our_public_signing_key');
    expect(status).to.have.property('round_length');
    expect(status).to.have.property('next_upgrade');
    expect(status).to.have.property('build_version');
    expect(status).to.have.property('uptime');
  });

  it('state_get_auction_info - newest one', async () => {
    const validators = await client.getValidatorsInfo();
    expect(validators).to.have.property('auction_state');
  });

  it('state_get_auction_info - by height', async () => {
    const validators = await client.getValidatorsInfoByBlockHeight(1);
    expect(validators).to.have.property('auction_state');
    expect(validators.auction_state.block_height).to.be.eq(1);
  });

  it('state_get_item - account hash to main purse uref', async () => {
    const stateRootHash = await client.getStateRootHash();
    const uref = await client.getAccountBalanceUrefByPublicKeyHash(
      stateRootHash,
      faucetKeys.publicKey.toAccountRawHashStr()
    );
    faucetMainPurseUref = uref;
    const [prefix, value, suffix] = uref.split('-');
    expect(prefix).to.be.equal('uref');
    expect(value.length).to.be.equal(64);
    expect(suffix.length).to.be.equal(3);
  });

  it('state_get_item - CLPublicKey to main purse uref', async () => {
    const stateRootHash = await client.getStateRootHash();
    const uref = await client.getAccountBalanceUrefByPublicKey(
      stateRootHash,
      faucetKeys.publicKey
    );
    const [prefix, value, suffix] = uref.split('-');
    expect(uref).to.be.equal(faucetMainPurseUref);
    expect(prefix).to.be.equal('uref');
    expect(value.length).to.be.equal(64);
    expect(suffix.length).to.be.equal(3);
  });

  // TODO: Deploys required
  // it('chain_get_block_transfers - blockHash', async () => {
  //   const transfers = await client.getBlockTransfers(exampleBlockHash);
  //   expect(transfers).to.be.an.instanceof(Transfers);
  // });

  // TODO: Deploys required
  // it('chain_get_era_info_by_switch_block - blockHash', async () => {
  //   const eraSummary = await client.getEraInfoBySwitchBlock(exampleBlockHash);
  //   expect(eraSummary).to.be.equal(undefined);
  // });

  // TODO: Deploys required
  // it('chain_get_era_info_by_switch_block - by height', async () => {
  //   const eraSummary = await client.getEraInfoBySwitchBlockHeight(10);
  //   expect(eraSummary).to.be.equal(undefined);
  // });
});
