import fs from 'fs';
import { assert, expect } from 'chai';
import { config } from 'dotenv';
import { CasperServiceByJsonRPC } from '../../src/services';
import {
  Keys,
  DeployUtil,
  RuntimeArgs,
  CasperClient,
  CLValueBuilder,
  CLValueParsers,
  CLKeyParameters
} from '../../src/index';
import { getAccountInfo } from './utils';
import { Transfers } from '../../src/lib/StoredValue';
import { Contract } from '../../src/lib/Contracts';
import path from 'path';
import { BigNumber } from '@ethersproject/bignumber';

config();

const localCasperNode = require('../../ci/start_node');
const casperNodePid = localCasperNode.start_a_single_node();

const { SignatureAlgorithm, getKeysFromHexPrivKey, Ed25519 } = Keys;

const nodeUrl = process.env.NODE_URL!;
const networkName = process.env.NETWORK_NAME!;
const client = new CasperServiceByJsonRPC(nodeUrl);
const faucetKey = getKeysFromHexPrivKey(
  process.env.FAUCET_PRIV_KEY!,
  SignatureAlgorithm.Ed25519
);

let faucetMainPurseUref = '';
let transferBlockHash = '';

describe('RPC', () => {
  it('should return correct block by number', async () => {
    const check = async (height: number) => {
      const result = await client.getBlockInfoByHeight(height);
      assert.equal(result.block?.header.height, height);
    };
    const blocks_to_check = 3;
    for (let i = 0; i < blocks_to_check; i++) {
      await check(i);
    }
  });

  it('should return correct block by hash', async () => {
    const check = async (height: number) => {
      const block_by_height = await client.getBlockInfoByHeight(height);
      const block_hash = block_by_height.block?.hash;
      assert.exists(block_hash);
      const block = await client.getBlockInfo(block_hash!);
      assert.equal(block.block?.hash, block_hash);
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

  it('chain_get_state_root_hash', async () => {
    const stateRootHash = await client.getStateRootHash();
    assert.equal(stateRootHash.length, 64);
  });

  it('state_get_balance', async () => {
    const stateRootHash = await client.getStateRootHash();
    const accountInfo = await getAccountInfo(nodeUrl, faucetKey.publicKey);
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
      faucetKey.publicKey.toAccountRawHashStr()
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
      faucetKey.publicKey
    );
    const [prefix, value, suffix] = uref.split('-');
    expect(uref).to.be.equal(faucetMainPurseUref);
    expect(prefix).to.be.equal('uref');
    expect(value.length).to.be.equal(64);
    expect(suffix.length).to.be.equal(3);
  });

  it('should transfer native token by session', async () => {
    // for native-transfers payment price is fixed
    const paymentAmount = 10000000000;
    const id = Date.now();

    const amount = '25000000000';

    const deployParams = new DeployUtil.DeployParams(
      faucetKey.publicKey,
      networkName
    );

    const toPublicKey = Keys.Ed25519.new().publicKey;

    const session = DeployUtil.ExecutableDeployItem.newTransfer(
      amount,
      toPublicKey,
      null,
      id
    );

    const payment = DeployUtil.standardPayment(paymentAmount);
    const deploy = DeployUtil.makeDeploy(deployParams, session, payment);
    const signedDeploy = DeployUtil.signDeploy(deploy, faucetKey);

    const { deploy_hash } = await client.deploy(signedDeploy);
    const result = await client.waitForDeploy(signedDeploy, 100000);

    expect(deploy_hash).to.be.equal(result.deploy.hash);
    expect(result.deploy.session).to.have.property('Transfer');
    expect(result.execution_results[0].result).to.have.property('Success');

    transferBlockHash = result.execution_results[0].block_hash;

    const stateRootHash = await client.getStateRootHash();
    const uref = await client.getAccountBalanceUrefByPublicKey(
      stateRootHash,
      toPublicKey
    );
    const balance = await client.getAccountBalance(stateRootHash, uref);
    expect(amount).to.be.equal(balance.toString());
  });

  it('should deploy wasm over rpc', async () => {
    const casperClient = new CasperClient(nodeUrl);
    const erc20 = new Contract(casperClient);
    const wasmPath = path.resolve(__dirname, './erc20_token.wasm');
    const wasm = new Uint8Array(fs.readFileSync(wasmPath, null).buffer);

    const tokenName = 'TEST';
    const tokenSymbol = 'TST';
    const tokenDecimals = 8;
    const tokenTotlaSupply = 500_000_000_000;

    const args = RuntimeArgs.fromMap({
      name: CLValueBuilder.string(tokenName),
      symbol: CLValueBuilder.string(tokenSymbol),
      decimals: CLValueBuilder.u8(tokenDecimals),
      total_supply: CLValueBuilder.u256(tokenTotlaSupply)
    });
    const signedDeploy = erc20.install(
      wasm,
      args,
      '200000000000',
      faucetKey.publicKey,
      networkName,
      [faucetKey]
    );

    await client.deploy(signedDeploy);
    let result = await client.waitForDeploy(signedDeploy, 100000);

    const stateRootHash = await client.getStateRootHash();
    const { Account } = await client.getBlockState(
      stateRootHash,
      faucetKey.publicKey.toAccountHashStr(),
      []
    );

    const contractHash = Account!.namedKeys.find(
      (i: any) => i.name === 'erc20_token_contract'
    )?.key;

    assert.exists(contractHash);

    erc20.setContractHash(contractHash!);

    const fetchedTokenName = await erc20.queryContractData(['name']);
    const fetchedTokenSymbol = await erc20.queryContractData(['symbol']);
    const fetchedTokenDecimals: BigNumber = await erc20.queryContractData([
      'decimals'
    ]);
    const fetchedTokenTotalSupply: BigNumber = await erc20.queryContractData([
      'total_supply'
    ]);

    const balanceOf = async (erc20: Contract, owner: CLKeyParameters) => {
      const balanceKey = Buffer.from(
        CLValueParsers.toBytes(CLValueBuilder.key(owner)).unwrap()
      ).toString('base64');
      const balance: BigNumber = (
        await erc20.queryContractDictionary('balances', balanceKey)
      ).value();
      return balance;
    };

    const balanceOfFaucet = await balanceOf(erc20, faucetKey.publicKey);

    assert.equal(tokenName, fetchedTokenName);
    assert.equal(tokenSymbol, fetchedTokenSymbol);
    assert.equal(tokenDecimals, fetchedTokenDecimals.toNumber());
    assert.equal(tokenTotlaSupply, fetchedTokenTotalSupply.toNumber());
    assert.equal(balanceOfFaucet.toNumber(), tokenTotlaSupply);

    // Test `callEntrypoint` method: Transfter token
    const recipient = Ed25519.new().publicKey;
    const transferAmount = 2_000;

    const transferArgs = RuntimeArgs.fromMap({
      recipient: CLValueBuilder.key(recipient),
      amount: CLValueBuilder.u256(2_000)
    });

    const transferDeploy = erc20.callEntrypoint(
      'transfer',
      transferArgs,
      faucetKey.publicKey,
      networkName,
      '2500000000',
      [faucetKey]
    );

    const { deploy_hash } = await client.deploy(transferDeploy);
    result = await client.waitForDeploy(transferDeploy, 100000);

    assert.equal(result.deploy.hash, deploy_hash);
    expect(result.deploy.session).to.have.property('StoredContractByHash');
    expect(result.execution_results[0].result).to.have.property('Success');

    const balanceOfRecipient = await balanceOf(erc20, recipient);
    assert.equal(balanceOfRecipient.toNumber(), transferAmount);
  });

  it('chain_get_block_transfers - blockHash', async () => {
    const transfers = await client.getBlockTransfers(transferBlockHash);
    expect(transfers).to.be.an.instanceof(Transfers);
  });

  it('chain_get_era_info_by_switch_block - by height', async () => {
    const eraSummary = await client.getEraInfoBySwitchBlockHeight(10);
    const blockInfo = await client.getBlockInfoByHeight(10);
    console.log('***** eraSummary *****');
    console.log(eraSummary);
    console.log('***** blockInfo *****');
    console.log(blockInfo);
    expect(eraSummary.blockHash).to.be.equal(blockInfo.block?.hash);
  });
});

after(function() {
  process.kill(casperNodePid);
});
