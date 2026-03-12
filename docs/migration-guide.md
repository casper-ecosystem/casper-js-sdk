## Migration Guide (v2 → v5)

`Casper JS SDK V5` introduces significant **breaking changes**, essentially rewriting the SDK from the ground up to enhance usability, align it with Casper SDKs in other languages, and incorporate new features for the Casper 2.0 update.

This guide will walk you through the key changes and provide detailed examples to help you transition your code seamlessly.

***

### Key Highlights

1. Simplified APIs and modular design.
2. Improved alignment with Casper SDKs in other languages.
3. Enhanced functionality for Casper 2.0.
4. Transition from deploy-based operations to transaction-based architecture.

***

### 1. `CasperServiceByJsonRPC` and `CasperClient` → `RpcClient`

The `CasperServiceByJsonRPC` and `CasperClient` classes have been **removed** and replaced with the new `RpcClient` class.

v2:

```typescript
const client = new CasperServiceByJsonRPC('http://<Node Address>:7777/rpc');
const stateRootHash = await client.getStateRootHash();
```

v5:

```typescript
import { HttpHandler, RpcClient } from 'casper-js-sdk';

const httpHandler = new HttpHandler('http://<Node Address>:7777/rpc');
const rpcClient = new RpcClient(httpHandler);

const stateRootHash = await rpcClient.getStateRootHashLatest();
```

***

### 2. `CLValueBuilder` → `CLValue` constructors

The `CLValueBuilder` class has been **removed**. Use `CLValue.newCL..` methods instead.

v2:

```typescript
const list = CLValueBuilder.list([
  CLValueBuilder.u32(1),
  CLValueBuilder.u32(2),
  CLValueBuilder.u32(3)
]);
const bool = CLValueBuilder.bool(false);
```

v5:

```typescript
import { CLValue, CLTypeUInt32 } from 'casper-js-sdk';

const list = CLValue.newCLList(CLTypeUInt32, [
  CLValue.newCLUInt32(1),
  CLValue.newCLUInt32(2),
  CLValue.newCLUInt32(3)
]);
const bool = CLValue.newCLValueBool(false);
```

#### Quick reference

| v2                                | v5                               |
| --------------------------------- | -------------------------------- |
| `CLValueBuilder.u512(n)`          | `CLValue.newCLUInt512(n)`        |
| `CLValueBuilder.publicKey(key)`   | `CLValue.newCLPublicKey(key)`    |
| `CLValueBuilder.string(s)`        | `CLValue.newCLString(s)`         |
| `CLValueBuilder.bool(b)`          | `CLValue.newCLValueBool(b)`      |
| `CLValueBuilder.byteArray(bytes)` | `CLValue.newCLByteArray(bytes)`  |
| `CLValueBuilder.option(inner)`    | `CLValue.newCLOption(inner)`     |
| `CLValueBuilder.list(items)`      | `CLValue.newCLList(type, items)` |

***

### 3. `CLPublicKey` → `PublicKey`

`CLPublicKey` is now `PublicKey` with added features for better cryptographic key management.

```typescript
import { Args, CLValue, PublicKey } from 'casper-js-sdk';

const args = Args.fromMap({
  target: CLValue.newCLPublicKey(PublicKey.fromHex('0202f5a92ab6...'))
});
```

***

### 4. Key Management

The `Keys` class has been replaced with separate `PublicKey` and `PrivateKey` classes.

v2:

```typescript
import { Keys } from 'casper-js-sdk';

const keyPair = Keys.Ed25519.new();
const publicKey = keyPair.publicKey.toHex();
const privateKey = keyPair.privateKey;
```

v5:

```typescript
import { PublicKey, PrivateKey, KeyAlgorithm } from 'casper-js-sdk';

const keys = await PrivateKey.generate(KeyAlgorithm.ED25519);
const publicKey = keys.publicKey.toHex();
console.log('Private Key (PEM):', keys.toPem());
```

#### Account hash

v2:

```ts
const accountHash = publicKey.toAccountHashStr();
```

v5:

```ts
const accountHash = publicKey.accountHash().toFormattedStr();
// → 'account-hash-abc123...'
```

***

### 5. `PurseIdentifier` Enum → Class

The `PurseIdentifier` enum has been replaced by a class with more flexibility.

v2:

```typescript
const balance = await client.queryBalance(
  PurseIdentifier.MainPurseUnderPublicKey,
  privateKey.publicKey.toHex(false)
);
```

v5:

```typescript
import { PurseIdentifier, RpcClient, HttpHandler } from 'casper-js-sdk';

const rpcClient = new RpcClient(new HttpHandler('http://<Node Address>:7777/rpc'));

const balanceByPublicKey = await rpcClient.queryLatestBalance(
  PurseIdentifier.fromPublicKey(privateKey.publicKey.toHex(false))
);

const balanceByAccountHash = await rpcClient.queryLatestBalance(
  PurseIdentifier.fromAccountHash(privateKey.publicKey.accountHash())
);
```

***

### 6. `DeployUtil` → `Deploy` + Transaction Builders

The `DeployUtil` module has been replaced with the `Deploy` class and chainable transaction builders.

#### Creating a transfer

v2:

```typescript
import { DeployUtil } from 'casper-js-sdk';

const deployParams = new DeployUtil.DeployParams(senderKey.publicKey, 'casper-test');
const session = DeployUtil.ExecutableDeployItem.newTransfer(10, recipientKey.publicKey, undefined, 1);
const payment = DeployUtil.standardPayment(10000000000000);
let deploy = DeployUtil.makeDeploy(deployParams, session, payment);
deploy = DeployUtil.signDeploy(deploy, senderKey);
```

v5:

```typescript
import { NativeTransferBuilder } from 'casper-js-sdk';

const tx = new NativeTransferBuilder()
  .from(senderKey.publicKey)
  .target(recipientKey.publicKey)
  .amount('10')
  .id(1)
  .chainName('casper-test')
  .payment(10000000000000)
  .build();

tx.sign(senderKey);
```

#### Serialization and deserialization

v2:

```typescript
const deployJson = DeployUtil.deployToJson(deploy);
const deployFromJson = DeployUtil.deployFromJson(deployJson);
```

v5:

```typescript
import { Deploy } from 'casper-js-sdk';

const deployJson = Deploy.toJSON(deploy);
const deployFromJson = Deploy.fromJSON(deployJson);
```

#### Installing a smart contract

v5:

```typescript
import {
  PrivateKey, PublicKey, Args, DeployHeader,
  ExecutableDeployItem, Deploy,
} from 'casper-js-sdk';

const deployHeader = DeployHeader.default();
deployHeader.account = sender;
deployHeader.chainName = chainName;

const session = ExecutableDeployItem.newModuleBytes(wasm, args);
const payment = ExecutableDeployItem.standardPayment(paymentAmount);
const deploy = Deploy.makeDeploy(deployHeader, payment, session);

deploy.sign(signingKey);

const result = await rpcClient.putDeploy(deploy);
console.log(`Deploy Hash: ${result.deployHash}`);
```

#### Calling a contract entry point

v5:

```typescript
import {
  Args, DeployHeader, ExecutableDeployItem,
  Deploy, StoredContractByHash, ContractHash,
} from 'casper-js-sdk';

const deployHeader = DeployHeader.default();
deployHeader.account = sender;
deployHeader.chainName = chainName;

const session = new ExecutableDeployItem();
session.storedContractByHash = new StoredContractByHash(
  ContractHash.newContract('93d923e336b20a4c4ca14d592b60e5bd3fe330775618290104f9beb326db7ae2'),
  entryPoint,
  args
);

const payment = ExecutableDeployItem.standardPayment(paymentAmount);
const deploy = Deploy.makeDeploy(deployHeader, payment, session);
deploy.sign(signingKeys);

const result = await rpcClient.putDeploy(deploy);
```

***

### 7. `Contracts` Abstraction Removed

The `install` and `callEntrypoint` utility functions have been removed. Developers now work directly with `DeployHeader`, `ExecutableDeployItem`, and `Deploy`. See examples above.

For frequently used contracts (auction, CEP-18, CEP-78), the SDK provides specific deploy builders in the utilities section.

***

### 8. `CasperNetwork` Utility

`CasperNetwork` provides a unified interface that works across both Casper 1.x and 2.x, automatically detecting the node version.

```typescript
import { RpcClient, HttpHandler, CasperNetwork } from 'casper-js-sdk';

const rpcClient = new RpcClient(new HttpHandler('http://<Node Address>:7777/rpc'));
const casperNetwork = await CasperNetwork.create(rpcClient);
```

#### Transaction methods

```typescript
// Delegate
const tx = casperNetwork.createDelegateTransaction(
  delegatorPublicKey, validatorPublicKey, 'casper-test',
  '1000000000', 5000000000, 1800000
);

// Undelegate
const tx = casperNetwork.createUndelegateTransaction(
  delegatorPublicKey, validatorPublicKey, 'casper-test',
  '1000000000', 5000000000, 1800000
);

// Redelegate
const tx = casperNetwork.createRedelegateTransaction(
  delegatorPublicKey, validatorPublicKey, newValidatorPublicKey,
  'casper-test', '1000000000', 5000000000, 1800000
);

// Transfer
const tx = casperNetwork.createTransferTransaction(
  senderPublicKey, recipientPublicKey, 'casper-test',
  '1000000000', 5000000000, 1800000, 1
);

// Contract call
const tx = casperNetwork.createContractCallTransaction(
  senderPublicKey, 'contract-hash', 'entryPoint',
  'casper-test', 5000000000, 1800000, args
);
```

#### Submit and retrieve

```typescript
// Submit
const result = await casperNetwork.putTransaction(transaction);

// Retrieve (auto-detects deploy vs transaction)
const info = await casperNetwork.getTransaction(transaction.hash);
```

#### Query balance

```typescript
const result = await casperNetwork.queryLatestBalance(
  PurseIdentifier.fromUref('uref-...')
);
console.log(`Balance: ${result.balance?.toNumber()}`);
```

***

### 9. Miscellaneous Changes

| v2                      | v5                           |
| ----------------------- | ---------------------------- |
| `EventStream`           | `SseClient`                  |
| `RuntimeArgs`           | `Args`                       |
| `CasperHDKey`           | Removed — use `@scure/bip39` |
| `CasperWallet` provider | Out of scope                 |
| `src/lib` classes       | Moved to `src/types`         |

***

For any issues, feel free to open a discussion or create a ticket in the [repository](https://github.com/casper-ecosystem/casper-js-sdk/issues).
