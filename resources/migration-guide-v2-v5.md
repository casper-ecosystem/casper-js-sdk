# V2 to V5 Migration Guide

`Casper JS SDK V5` introduces significant **breaking changes**, essentially rewriting the SDK from the ground up to enhance usability, align it with Casper SDKs in other languages, and incorporate new features for the Casper 2.0 update.

This guide will walk you through the key changes and provide detailed examples to help you transition your code seamlessly.

---

## Key Highlights of the Migration

1. Simplified APIs and modular design.
2. Improved alignment with Casper SDKs in other languages.
3. Enhanced functionality for Casper 2.0.
4. Transition from deploy-based operations to transaction-based architecture.

---

## Changes and Migration Steps

### 1. **`CasperServiceByJsonRPC` and `CasperClient` Replaced with `RpcClient`**

#### Overview

- The `CasperServiceByJsonRPC` and `CasperClient` classes have been **removed**.
- Introduced the new `RpcClient` class as their replacement.

#### Migration Example

##### Old Syntax (2.x)

```typescript
const client = new CasperServiceByJsonRPC(
  'http://<Node Address>:7777/rpc'
);
const stateRootHash = await client.getStateRootHash();
```

##### New Syntax (5.x)

```typescript
import { HttpHandler, RpcClient } from 'casper-js-sdk';

const httpHandler = new HttpHandler('http://<Node Address>:7777/rpc');
const rpcClient = new RpcClient(httpHandler);

try {
  const stateRootHash = await rpcClient.getStateRootHashLatest();
  console.log(stateRootHash);
} catch (error) {
  console.error(error);
}
```

For details on `RpcClient` methods, refer to the [documentation](https://github.com/casper-ecosystem/casper-js-sdk/blob/feat-5.0.0/src/rpc/README.md).

---

### 2. **`CLValueBuilder` Replaced by `CLValue` Constructors**

#### Overview

- The `CLValueBuilder` class has been **removed**.
- Use `CLValue` constructors like `newCL..` methods.

#### Migration Example

##### Old Syntax (2.x)

```typescript
const list = CLValueBuilder.list([
  CLValueBuilder.u32(1),
  CLValueBuilder.u32(2),
  CLValueBuilder.u32(3)
]);
const bool = CLValueBuilder.bool(false);
```

##### New Syntax (5.x)

```typescript
import {
  CLValueList,
  CLValueUInt32,
  CLValueBool
} from 'casper-js-sdk';

const list = CLValueList.newCLList(CLTypeUInt32, [
  CLValueUInt32.newCLUInt32(1),
  CLValueUInt32.newCLUInt32(2),
  CLValueUInt32.newCLUInt32(3)
]);
const bool = CLValueBool.newCLValueBool(false);
```

More examples are available in the [unit tests](https://github.com/casper-ecosystem/casper-js-sdk/tree/feat-5.0.0/src/types/clvalue).

---

### 3. **`CLPublicKey` Renamed to `PublicKey`**

#### Overview

- `CLPublicKey` is now `PublicKey` with added features for better cryptographic key management.

#### Migration Example

```typescript
import { Args, CLValue, PublicKey } from 'casper-js-sdk';

const args = Args.fromMap({
  target: CLValue.newCLPublicKey(PublicKey.fromHex('0202f5a92ab6...'))
});
```

Detailed documentation is available [here](https://github.com/casper-ecosystem/casper-js-sdk/blob/feat-5.0.0/src/types/keypair/PublicKey.ts).

---

### 4. **Key Management Overhaul**

#### Overview

- The `Keys` class from the old SDK (located in `src/lib/Keys.ts`) has been replaced with separate classes for `PublicKey` and `PrivateKey`, each tailored to specific cryptographic algorithms.
- These new classes are located in the [keypair folder](https://github.com/casper-ecosystem/casper-js-sdk/tree/feat-5.0.0/src/types/keypair).
- AsymmetricKey was split into two classes: [PrivateKey](../src/types/keypair/PrivateKey.ts) and [PublicKey](../src/types/keypair/PublicKey.ts).

#### Key Differences

1. **Structure**:
   - Old `Keys` class included functionality for both public and private keys in a single class.
   - New structure separates concerns into distinct `PublicKey` and `PrivateKey` classes.
2. **Enhanced Features**:
   - The new classes provide extended functionality, and better alignment with modern cryptographic standards.
   - Includes support for additional key generation, validation, and serialization methods.

#### Migration Example

#### Old Syntax (2.x):

```tsx
import { Keys } from 'casper-js-sdk';

const keyPair = Keys.Ed25519.new();
const publicKey = keyPair.publicKey.toHex();
const privateKey = keyPair.privateKey;
```

#### New Syntax (5.x):

```tsx
import { PublicKey, PrivateKey, KeyAlgorithm } from 'casper-js-sdk';

// Generating a new key pair
const keys = await PrivateKey.generate(KeyAlgorithm.ED25519);
const publicKey = keys.publicKey.toHex();

// Serialization
console.log('Public Key (Hex):', publicKey.toHex());
console.log('Private Key (PEM):', privateKey.toPem());
```

Refer to the [keypair folder](https://github.com/casper-ecosystem/casper-js-sdk/tree/feat-5.0.0/src/types/keypair) for detailed implementation and examples.

---

### 5. **`PurseIdentifier` Enum Replaced with a Class**

### Changes

- The PurseIdentifier enum has been replaced by a class with the same name, offering more flexibility and functionality.
- The new class is located in the [request.ts](https://github.com/casper-ecosystem/casper-js-sdk/blob/feat-5.0.0/src/rpc/request.ts#L542) file.

#### Migration Example

#### Old Syntax (2.x):

```tsx
import { PurseIdentifier } from 'casper-js-sdk';

const balanceByPublicKey = await client.queryBalance(
  PurseIdentifier.MainPurseUnderPublicKey,
  privateKey.publicKey.toHex(false)
);

const balanceByAccountHash = await client.queryBalance(
  PurseIdentifier.MainPurseUnderAccountHash,
  privateKey.publicKey.toAccountHashStr()
);
```

#### New Syntax (5.x):

```tsx
import {
  PurseIdentifier,
  RpcClient,
  HttpHandler
} from 'casper-js-sdk';

const httpHandler = new HttpHandler('http://<Node Address>:7777/rpc');
const rpcClient = new RpcClient(httpHandler);

try {
  const balanceByPublicKey = await rpcClient.queryLatestBalance(
    PurseIdentifier.fromPublicKey(privateKey.publicKey.toHex(false))
  );

  const balanceByAccountHash = await rpcClient.queryLatestBalance(
    PurseIdentifier.fromAccountHash(
      privateKey.publicKey.accountHash()
    )
  );
} catch (e) {}
```

Explore the new PurseIdentifier class [here](https://github.com/casper-ecosystem/casper-js-sdk/blob/feat-5.0.0/src/rpc/request.ts#L542).

---

### 6. **`DeployUtil` to `Deploy`**

The `DeployUtil` module in the previous versions of casper-js-sdk has been replaced with the `Deploy` class in version 5.x. Functionality for deploy creation `DeployUtil` become [Deploy](../src/types/Deploy.ts) class with static methods. [See how to create Deploy here](../README.md#creating-a-legacy-deploy-1)

### Key Differences

1. **Module Structure**:
   - The old `DeployUtil` module had multiple static utility methods.
   - The new `Deploy` class organizes these functionalities as methods on a single object.
2. **Serialization and Deserialization**:
   - The new module uses `TypedJSON` for serialization/deserialization, ensuring type safety.
3. **Improved Method Organization**:
   - Methods are grouped logically, providing a cleaner and more intuitive API.

#### Migration Examples

##### Old Syntax: Creating a Deploy (2.x)

```typescript
import { DeployUtil } from 'casper-js-sdk';

const deployParams = new DeployUtil.DeployParams(
  senderKey.publicKey,
  'casper-test'
);
const session = DeployUtil.ExecutableDeployItem.newTransfer(
  10,
  recipientKey.publicKey,
  undefined,
  1
);
const payment = DeployUtil.standardPayment(10000000000000);
let deploy = DeployUtil.makeDeploy(deployParams, session, payment);
deploy = DeployUtil.signDeploy(deploy, senderKey);

return deploy;
```

##### New Syntax: Creating a Deploy (5.x)

```typescript
import {
  Deploy,
  DeployHeader,
  ExecutableDeployItem
} from 'casper-js-sdk';

const session = new ExecutableDeployItem();

session.transfer = TransferDeployItem.newTransfer(
  10,
  recipientKey.publicKey,
  undefined,
  1
);

const deployHeader = DeployHeader.default();
deployHeader.account = senderKey.publicKey;
deployHeader.chainName = 'casper-test';

const payment = ExecutableDeployItem.standardPayment(10000000000000);
const deploy = Deploy.makeDeploy(deployHeader, payment, session);
deploy.sign(senderKey);
```

##### Old Syntax: Serialization and Deserialization (2.x)

```typescript
import { DeployUtil } from 'casper-js-sdk';

const deployJson = DeployUtil.deployToJson(deploy);
const deployFromJson = DeployUtil.deployFromJson(deployJson);
```

##### New Syntax: Serialization and Deserialization (5.x)

```typescript
import { Deploy } from 'casper-js-sdk';

const deployJson = Deploy.toJSON(deploy);
const deployFromJson = Deploy.fromJSON(deployJson);
```

### Additional Notes

- The new `Deploy` class provides a more type-safe and modular approach, reducing errors and improving code readability.
- Refer to the [Deploy Class Documentation](../src/types/Deploy.ts) for a complete list of available methods.
- Ensure that you update your dependencies and verify compatibility with the 5.x SDK before migrating.

---

### 7. **`Contracts` Abstraction Removed**

With the release of version 5.0 of the `casper-js-sdk`, we removed the old abstraction for creating and interacting with deploys, including the functions `install` and `callEntrypoint`. This guide provides detailed steps for migrating from the old abstraction to the new approach using the SDK's updated API.

#### Key Changes:

- Removed Custom Abstractions: Functions like `install` and `callEntrypoint` are no longer provided as utilities. Instead, the updated SDK expects developers to directly work with the core primitives of the SDK, offering more flexibility and transparency.
- Direct Use of Deploy Utilities: Developers now work directly with the SDK's deploy and contract management primitives, such as `DeployHeader`, `ExecutableDeployItem`, and `Deploy`.

Below are examples to help you transition smoothly:

**Example 1: Installing a Smart Contract on the Casper Network.**

The install function, used for deploying a smart contract to the Casper Network, can be replaced by following these steps:

```tsx
import {
  PrivateKey,
  PublicKey,
  Args,
  DeployHeader,
  ExecutableDeployItem,
  Deploy,
  DEFAULT_DEPLOY_TTL,
  StoredContractByHash,
  ContractHash
} from 'casper-js-sdk';

// Install a smart contract on a Casper Network
export const install = (
  wasm: Uint8Array,
  args: Args,
  paymentAmount: string,
  sender: PublicKey,
  chainName: string,
  signingKey: PrivateKey
): Deploy => {
  const deployHeader = DeployHeader.default();
  deployHeader.account = sender;
  deployHeader.chainName = chainName;

  const session = ExecutableDeployItem.newModuleBytes(wasm, args);
  const payment = ExecutableDeployItem.standardPayment(paymentAmount);
  const deploy = Deploy.makeDeploy(deployHeader, payment, session);

  deploy.sign(signingKey);

  return deploy;
};
```

**Example 2: Calling a Smart Contract Entrypoint.**

The `callEntrypoint` function, used for invoking an entry point in a stored contract, can be replaced using the updated API as shown below:

Key Changes

- `ExecutableDeployItem` used with additional wrapper classes (`StoredContractByHash`, etc.).
- Direct Control: Developers now have full control over contract installation and entry point calls.
- Improved Clarity: The separation of logic enhances readability and reduces confusion.

```tsx
import {
  PrivateKey,
  PublicKey,
  Args,
  DeployHeader,
  ExecutableDeployItem,
  Deploy,
  DEFAULT_DEPLOY_TTL,
  StoredContractByHash,
  ContractHash
} from 'casper-js-sdk';

// Call an entrypoint of a smart contract.
export const callEntrypoint = (
  entryPoint: string,
  args: Args,
  sender: PublicKey,
  chainName: string,
  paymentAmount: string,
  signingKeys: PrivateKey,
  ttl: number = DEFAULT_DEPLOY_TTL
): Deploy => {
  const deployHeader = DeployHeader.default();
  deployHeader.account = sender;
  deployHeader.chainName = chainName;
  deployHeader.ttl = ttl;
  deployHeader.gasPrice = 1;

  const session = new ExecutableDeployItem();
  session.storedContractByHash = new StoredContractByHash(
    ContractHash.newContract(
      '93d923e336b20a4c4ca14d592b60e5bd3fe330775618290104f9beb326db7ae2'
    ),
    entryPoint,
    args
  );

  const payment = ExecutableDeployItem.standardPayment(paymentAmount);
  const deploy = Deploy.makeDeploy(deployHeader, payment, session);

  deploy.sign(signingKeys);

  return deploy;
};
```

#### Once you have created and signed a deploy, you can send it to the network using the new RpcClient API.

```tsx
const httpHandler = new HttpHandler('http://<Node Address>:7777/rpc');
const rpcClient = new RpcClient(httpHandler);

const result = await rpcClient.putDeploy(deploy);

console.log(`Deploy Hash: ${result.deployHash}`);
```

---

### 8. **Miscellaneous Changes**

- `EventStream` become [SseClient](../src/sse/client.ts). The `SseClient` is the main place to interact with Casper events. [See more details here](../src/sse/README.md)
- `RuntimeArgs` become [Args](../src/types/Args.ts)
- `CasperHDKey`now deprecated and out of scope of this lib. You can use `@scure/bip39` lib to achieve same result as in previous SKD version.
- Injected `CasperWallet` provider now out of scope of this lib.
- Most classes that previously was in `src/lib` folder was redesigned and you can find them in `src/types` folder

---

For any issues, feel free to open a discussion or create a ticket in the [repository](https://github.com/casper-ecosystem/casper-js-sdk/issues).

---
