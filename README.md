# Casper JS SDK

[![npm version](https://img.shields.io/npm/v/casper-js-sdk.svg?style=flat-square)](https://www.npmjs.com/package/casper-js-sdk) [![npm downloads](https://img.shields.io/npm/dm/casper-js-sdk.svg?style=flat-square)](https://www.npmjs.com/package/casper-js-sdk) [![License](https://img.shields.io/npm/l/casper-js-sdk.svg?style=flat-square)](https://github.com/casper-ecosystem/casper-js-sdk/blob/master/LICENSE) [![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/) [![GitHub stars](https://img.shields.io/github/stars/casper-ecosystem/casper-js-sdk.svg?style=flat-square&logo=github)](https://github.com/casper-ecosystem/casper-js-sdk) [![Build Status](https://img.shields.io/github/actions/workflow/status/casper-ecosystem/casper-js-sdk/ci.yml?style=flat-square&logo=github)](https://github.com/casper-ecosystem/casper-js-sdk/actions)

The Casper JS SDK provides a convenient way to interact with the Casper Network using JavaScript.

## Get started

```bash
# Basic Node.JS installation
npm install casper-js-sdk --save
```

## Base usage

- [Public and private keys](#public-and-private-keys)
- [RPC client](#rpc-client)
- [SSE](#sse)
- [Creating a transaction](#creating-a-transaction)
- [Creating a legacy deploy](#creating-a-legacy-deploy)
- [Creating and sending CSPR transfer deploy](#creating-and-sending-cspr-transfer-deploy)
- [Creating and sending Auction manager deploy](#creating-and-sending-auction-manager-deploy)
- [Creating and sending CEP-18 transfer deploy](#creating-and-sending-cep-18-transfer-deploy)
- [Creating and sending NFT transfer deploy](#creating-and-sending-nft-transfer-deploy)

## Migration guides

### [v2 to v5](resources/migration-guide-v2-v5.md)

## Usage examples

### Public and private keys

Provides functionality for working with public and private key cryptography in Casper. [See more details here](src/types/keypair/README.md)

```ts
import { KeyAlgorithm, PrivateKey, PublicKey } from 'casper-js-sdk';

const privateKeyAlgoritm = KeyAlgorithm.SECP256K1;

// Generate new
const privateKey = await PrivateKey.generate(privateKeyAlgoritm);

// Recreate from hex string
const privateHex = 'PRIVATE-KEY-HEX...';
const privateKeyFromHex = await PrivateKey.fromHex(
  privateHex,
  privateKeyAlgoritm
);

// Public key from PrivateKey
const publicKey = privateKey.publicKey;

// Public key from hex string
const publicKeyHex =
  '02039daee95ef2cd54a23bd201febc495dc1404bc300c572e77dc55cf8ff53ac4823';
const publicKeyFromHex = PublicKey.fromHex(publicKeyHex);
```

### RPC client

Provides access to the exported methods of RPC Client and data structures where the response is serialized. [See more details here](src/rpc/README.md)

Example:

```ts
import { HttpHandler, RpcClient } from 'casper-js-sdk';

const rpcHandler = new HttpHandler('http://<Node Address>:7777/rpc');
const rpcCient = new RpcClient(rpcHandler);
const deployHash =
  '3facbc4133e722c5c5630b6ad2331383ba849ef719da582cc026e9dd85e72ac9';

try {
  const deployResult = await rpcCient.getDeploy(deployHash);
} catch (e) {}
```

### SSE

Provides basic functionality to work with Casper events that streamed by SSE server. [See more details here](src/sse/README.md)

Example:

```ts
import { SseClient, EventName } from 'casper-js-sdk';

const sseClient = new SseClient('http://<Node Address>:9999/events');

sseClient.subscribe(EventName.BlockAddedEventType, rawEvent => {
  try {
    const parsedEvent = rawEvent.parseAsBlockAddedEvent();
    console.log(`Block hash: ${parsedEvent.BlockAdded.blockHash}`);
  } catch (error) {
    console.error('Error processing event:', error);
  }
});

// Start the client with the last known event ID ( Optional )
const lastEventID = 1234;

sseClient.start(lastEventID);
```

### Creating a transaction

Example of how to construct a transaction and push it to the network:

```ts
import {
  HttpHandler,
  RpcClient,
  NativeTransferBuilder,
  PrivateKey,
  KeyAlgorithm,
  PublicKey
} from 'casper-js-sdk';

const rpcHandler = new HttpHandler('http://<Node Address>:7777/rpc');
const rpcClient = new RpcClient(rpcHandler);

const privateKey = await PrivateKey.generate(KeyAlgorithm.ED25519);

const transaction = new NativeTransferBuilder()
  .from(privateKey.publicKey)
  .target(
    PublicKey.fromHex(
      '0202f5a92ab6da536e7b1a351406f3744224bec85d7acbab1497b65de48a1a707b64'
    )
  )
  .amount('25000000000') // Amount in motes
  .id(Date.now())
  .chainName('casper-net-1')
  .payment(100_000_000)
  .build();

transaction.sign(privateKey);

try {
  const result = await rpcClient.putTransaction(transaction);
  console.log(`Transaction Hash: ${result.transactionHash}`);
} catch (e) {
  console.error(e);
}
```

### Creating a legacy deploy

Example of how to construct a deploy and push it to the network:

```ts
import {
  Deploy,
  DeployHeader,
  ExecutableDeployItem,
  HttpHandler,
  PublicKey,
  KeyAlgorithm,
  PrivateKey,
  RpcClient,
  TransferDeployItem
} from 'casper-js-sdk';

const rpcHandler = new HttpHandler('http://<Node Address>:7777/rpc');
const rpcClient = new RpcClient(rpcHandler);

const senderKey = await PrivateKey.generate(KeyAlgorithm.ED25519);
const recipientKey = PublicKey.fromHex(
  '010068920746ecf5870e18911EE1fC5db975E0e97fFFcBBF52f5045Ad6C9838D2F'
);
const paymentAmount = '10000000000000';
const transferAmount = '10';
const transferId = 35;

const session = new ExecutableDeployItem();

session.transfer = TransferDeployItem.newTransfer(
  transferAmount,
  recipientKey,
  undefined,
  transferId
);

const payment = ExecutableDeployItem.standardPayment(paymentAmount);

const deployHeader = DeployHeader.default();
deployHeader.account = senderKey.publicKey;
deployHeader.chainName = 'casper-test';

const deploy = Deploy.makeDeploy(deployHeader, payment, session);
deploy.sign(senderKey);

const result = await rpcClient.putDeploy(deploy);

console.log(`Deploy Hash: ${result.deployHash}`);
```

### Creating and sending CSPR transfer deploy

Example of how to construct a CSPR transfer deploy and push it to the network:

```ts
import {
  HttpHandler,
  RpcClient,
  KeyAlgorithm,
  PrivateKey,
  makeCsprTransferDeploy
} from 'casper-js-sdk';

// get private key fromHex, fromPem or generate it
const privateKey = await PrivateKey.fromHex(
  'privateKeyHex',
  KeyAlgorithm.SECP256K1 // or KeyAlgorithm.ED25519, depends on your private key
);

const deploy = makeCsprTransferDeploy({
  senderPublicKeyHex: privateKey.publicKey.toHex(),
  recipientPublicKeyHex: '0123456789abcdef...',
  transferAmount: '2500000000' // 2.5 CSPR
});

deploy.sign(privateKey);

const rpcHandler = new HttpHandler('http://<Node Address>:7777/rpc');
const rpcClient = new RpcClient(rpcHandler);

const result = await rpcClient.putDeploy(deploy);

console.log(`Deploy Hash: ${result.deployHash}`);
```

### Creating and sending Auction manager deploy

Example of how to construct a Auction manager deploy (delegate/undelegate/redelegate CSPR) and push it to the network:

```ts
import {
  HttpHandler,
  RpcClient,
  KeyAlgorithm,
  PrivateKey,
  makeAuctionManagerDeploy,
  AuctionManagerEntryPoint
} from 'casper-js-sdk';

// get private key fromHex, fromPem or generate it
const privateKey = await PrivateKey.fromHex(
  'privateKeyHex',
  KeyAlgorithm.SECP256K1 // or KeyAlgorithm.ED25519, depends on your private key
);

const deploy = makeAuctionManagerDeploy({
  contractEntryPoint: AuctionManagerEntryPoint.delegate,
  delegatorPublicKeyHex: privateKey.publicKey.toHex(),
  validatorPublicKeyHex: '0123456789awedef...',
  amount: '500000000000' // 500 CSPR
});

deploy.sign(privateKey);

const rpcHandler = new HttpHandler('http://<Node Address>:7777/rpc');
const rpcClient = new RpcClient(rpcHandler);

const result = await rpcClient.putDeploy(deploy);

console.log(`Deploy Hash: ${result.deployHash}`);
```

### Creating and sending CEP-18 transfer deploy

Example of how to construct a CEP-18 transfer deploy and push it to the network:

```ts
import {
  HttpHandler,
  RpcClient,
  KeyAlgorithm,
  PrivateKey,
  makeCep18TransferDeploy
} from 'casper-js-sdk';

// get private key fromHex, fromPem or generate it
const privateKey = await PrivateKey.fromHex(
  'privateKeyHex',
  KeyAlgorithm.SECP256K1 // or KeyAlgorithm.ED25519, depends on your private key
);

const deploy = await makeCep18TransferDeploy({
  contractHash: '0123456789asdfbcdef...',
  senderPublicKeyHex: '0123456789asdfbcdef...',
  recipientPublicKeyHex: '0123456789abcdef...',
  transferAmount: '25000000000', // 25 CEP-18 with 9 decimals
  paymentAmount: '3000000000' // 3 CSPR
});

deploy.sign(privateKey);

const rpcHandler = new HttpHandler('http://<Node Address>:7777/rpc');
const rpcClient = new RpcClient(rpcHandler);

const result = await rpcClient.putDeploy(deploy);

console.log(`Deploy Hash: ${result.deployHash}`);
```

### Creating and sending NFT transfer deploy

Example of how to construct a NFT transfer deploy and push it to the network:

```ts
import {
  HttpHandler,
  RpcClient,
  KeyAlgorithm,
  PrivateKey,
  makeNftTransferDeploy,
  NFTTokenStandard
} from 'casper-js-sdk';

// get private key fromHex, fromPem or generate it
const privateKey = await PrivateKey.fromHex(
  'privateKeyHex',
  KeyAlgorithm.SECP256K1 // or KeyAlgorithm.ED25519, depends on your private key
);

const deploy = await makeNftTransferDeploy({
  nftStandard: NFTTokenStandard.CEP47,
  contractPackageHash: '0123456789asdfbcdef...',
  senderPublicKeyHex: '0123456789asdfbcdef...',
  recipientPublicKeyHex: '0123456789abcdef...',
  paymentAmount: '3000000000', // 3 CSPR
  tokenId: 234
});

deploy.sign(privateKey);

const rpcHandler = new HttpHandler('http://<Node Address>:7777/rpc');
const rpcClient = new RpcClient(rpcHandler);

const result = await rpcClient.putDeploy(deploy);

console.log(`Deploy Hash: ${result.deployHash}`);
```
