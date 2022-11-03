import { expect } from 'chai';
import 'mocha';
import { CEP78 } from '../../src/lib/CEP78'
import { CasperClient, RuntimeArgs } from '../../src';
import { Keys } from '../../src/index'
import { csprToMotes } from '../../src/lib/Conversions'
import fs from 'fs'
import { Deploy } from '../../src/lib/DeployUtil';
import { step } from 'mocha-steps';

/**
 * @packageDocumentation
 * 
 * Before testing, create a directory resources/ within this directory and populate it with
 * an Ed25519 secret key with the filename *secret_key.pem* and a compiled WASM CEP-78
 * contract named *contract.wasm*. Be sure to fund *secret_key.pem* with testnet CSPR
 */

let cep78: CEP78;
const secretKeyFilePath = __dirname + "/resources/secret_key.pem"
const wasmFilePath = __dirname + "/resources/contract.wasm"
let deploymentArgs: RuntimeArgs

const _key = Keys.Ed25519.loadKeyPairFromPrivateFile(secretKeyFilePath)



describe('CEP78', () => {
  before(() => {
    cep78 = new CEP78(new CasperClient("http://135.181.208.231:7777/rpc"));
  });
  

  step('should build a CEP-78 compliant `RuntimeArgs` object', async() => {
    deploymentArgs = CEP78.buildInstallmentArgs(
      "Test collection",
      "TST",
      1000,
      2,
      1,
      2,
      "",
      0,
      0,
      undefined,
      undefined,
      undefined
    )
  })
  

  step('should create a CEP78 installment deploy object and deploy it', async () => {
    const file = fs.readFileSync(wasmFilePath)
      const deployment = cep78.installContract(
        (new Uint8Array(file.buffer)),
        deploymentArgs,
        _key.publicKey,
        csprToMotes(180),
        "casper-test",
        [_key]
      )
      const res = await putAndGetDeploy(cep78, deployment)
      cep78.contract?.setContractHash(iterateTransforms(res))
  }).timeout(120000);

  step('should mint a new NFT to this account', async () => {
    await expect(async () => {
      const deployment = cep78.mint(
        "0x0",
        _key.publicKey,
        _key.publicKey,
        "casper-test",
        csprToMotes(1),
        [_key]
      )
      await putAndGetDeploy(cep78, deployment)

    }).to.not.throw("NFT mint failed")
  }).timeout(120000);

  step('should transfer the newly minted NFT to a hardcoded account', async () => {
    await expect(async () => {
      const deployment = cep78.transfer(
        0,
        _key.publicKey.toHex(),
        "02024c108b69b91984fab256fa515b1a79e1cadd1b43a4432d529d4f4248108ba43d",
        _key.publicKey,
        "casper-test",
        csprToMotes(1),
        [_key]
      )
      await putAndGetDeploy(cep78, deployment)

    }).to.not.throw("Transferring the NFT failed")
  }).timeout(120000);

  step('should get the NFT balance of an account', async () => {
    await expect(async () => {
      const response = cep78.balanceOf(_key.publicKey)
      console.log(response)

    }).to.not.throw("Couldn't get the NFT balance of the account")
  }).timeout(60000);

  step('should get the owner of an NFT', async () => {
    await expect(async () => {
      const response = cep78.ownerOf(0)
      console.log(response)

    }).to.not.throw("Couldn't get the owner of the NFT")
  }).timeout(60000);

  step('should get the total number of minted NFTs', async () => {
    await expect(async () => {
      const response = cep78.totalMinted()
      console.log(response)

    }).to.not.throw("Couldn't get the total number of minted NFTs")
  }).timeout(60000);
})

function putAndGetDeploy(cep78: CEP78, deploy: Deploy) {
  return new Promise((resolve, reject) => {
    cep78.client?.putDeploy(deploy).then((deployHash) => {
      pollDeployment(cep78, deployHash).then((response) => {
        resolve(response)
      }).catch((error) => {
        reject(error)
      })
    }).catch((error) => {
      reject(error)
    })
  })
}

function pollDeployment(cep78: CEP78, deployHash: string) {
  return new Promise((resolve, reject) => {
    var poll = setInterval(async function(deployHash) {
      try {
        const response = await cep78.client!.getDeploy(deployHash)
        if (response![1].execution_results.length != 0) {
           //Deploy executed
           if (response![1].execution_results[0].result.Failure != null) {
             clearInterval(poll)
             reject("Deployment failed")
             return
           }
           clearInterval(poll)
           resolve(response![1].execution_results[0].result.Success)
         }
      } catch(error) {
        console.error(error)
      }
    }, 2000, deployHash)
  })
}

function iterateTransforms(result: any) {
  const transforms = result.effect.transforms
  for (var i = 0; i < transforms.length; i++) {
    if (transforms[i].transform == "WriteContract") {
      return transforms[i].key
    }
  }
}