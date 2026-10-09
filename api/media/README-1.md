# RPC

Provides access to the exported methods of RPC Client and data structures where serialized response.

The `RpcClient` implements RPC methods according to [spec](https://docs.casperlabs.io/developers/json-rpc/json-rpc-informational/). `RpcClient` unites implementation of `ClientInformational` interface related to [spec](https://docs.casperlabs.io/developers/json-rpc/json-rpc-informational/) and `ClientPOS` interface related to [spec](https://docs.casperlabs.io/developers/json-rpc/json-rpc-pos/).

## Usage

The configuration is flexible, and caller can provide custom configurations, the most common usage is to create `RpcClient` which depends on `HttpHandler` interface.

```ts
import { HttpHandler, RpcClient } from 'casper-js-sdk';

const rpcHandler = new HttpHandler('http://<Node Address>:7777/rpc');
const rpcCient = new RpcClient(rpcHandler);
```

## Methods

The `RpcClient` combines the functionalities of `ClientPOS`, `ClientInformational`, and `ClientTransactional`.

### [`ClientPOS`](https://github.com/casper-ecosystem/casper-js-sdk/blob/573b563d0bc038e46b07f12789286d336536f8c9/src/rpc/client.ts#L40)

The `ClientPOS` interface includes methods related to the Proof-of-Stake functionality of the Casper network.

- **`getLatestAuctionInfo()`** - Returns the latest auction information.  
  **Returns:** [`StateGetAuctionInfoResult`](https://github.com/casper-ecosystem/casper-js-sdk/blob/573b563d0bc038e46b07f12789286d336536f8c9/src/rpc/response.ts#L55)

* **`getAuctionInfoByHash(blockHash: string)`** -Retrieves auction information for a specific block by hash.  
  **Returns:** [`StateGetAuctionInfoResult`](https://github.com/casper-ecosystem/casper-js-sdk/blob/573b563d0bc038e46b07f12789286d336536f8c9/src/rpc/response.ts#L55)

- **`getAuctionInfoByHeight(height: number)`** - Retrieves auction information for a specific block by height.  
  **Returns:** [`StateGetAuctionInfoResult`](https://github.com/casper-ecosystem/casper-js-sdk/blob/573b563d0bc038e46b07f12789286d336536f8c9/src/rpc/response.ts#L55)

* **`getEraInfoLatest()`** - Fetches the latest era information.  
  **Returns:** [`ChainGetEraInfoResult`](https://github.com/casper-ecosystem/casper-js-sdk/blob/573b563d0bc038e46b07f12789286d336536f8c9/src/rpc/response.ts#L433)

- **`getEraInfoByBlockHeight(height: number)`** - Fetches era information for a specific block by height.  
  **Returns:** [`ChainGetEraInfoResult`](https://github.com/casper-ecosystem/casper-js-sdk/blob/573b563d0bc038e46b07f12789286d336536f8c9/src/rpc/response.ts#L433)

* **`getEraInfoByBlockHash(hash: string)`** - Fetches era information for a specific block by hash.  
  **Returns:** [`ChainGetEraInfoResult`](https://github.com/casper-ecosystem/casper-js-sdk/blob/573b563d0bc038e46b07f12789286d336536f8c9/src/rpc/response.ts#L433)

- **`getValidatorChangesInfo()`** - Retrieves validator status changes during an era.  
  **Returns:** [`InfoGetValidatorChangesResult`](https://github.com/casper-ecosystem/casper-js-sdk/blob/573b563d0bc038e46b07f12789286d336536f8c9/src/rpc/response.ts#L572)

### [`ClientInformational`](https://github.com/casper-ecosystem/casper-js-sdk/blob/573b563d0bc038e46b07f12789286d336536f8c9/src/rpc/client.ts#L52)

The `ClientInformational` interface provides methods for querying node-specific and network-wide information.

#### Balance Queries

- **`getLatestBalance(purseURef: string)`** - Retrieves the latest balance for a given purse.  
  **Returns:** [`StateGetBalanceResult`](https://github.com/casper-ecosystem/casper-js-sdk/blob/573b563d0bc038e46b07f12789286d336536f8c9/src/rpc/response.ts#L66)

* **`getBalanceByStateRootHash(purseURef: string, stateRootHash: string)`** - Retrieves the balance for a specific state root hash.  
  **Returns:** [`StateGetBalanceResult`](https://github.com/casper-ecosystem/casper-js-sdk/blob/573b563d0bc038e46b07f12789286d336536f8c9/src/rpc/response.ts#L66)

#### Deploy Queries

- **`getDeploy(hash: string)`** - Retrieves a deploy by its hash.  
  **Returns:** [`InfoGetDeployResult`](https://github.com/casper-ecosystem/casper-js-sdk/blob/573b563d0bc038e46b07f12789286d336536f8c9/src/rpc/response.ts#L223)

* **`getDeployFinalizedApproval(hash: string)`** - Retrieves a deploy with finalized approvals.  
  **Returns:** [`InfoGetDeployResult`](https://github.com/casper-ecosystem/casper-js-sdk/blob/573b563d0bc038e46b07f12789286d336536f8c9/src/rpc/response.ts#L223)

#### Transaction Queries

- **`getTransactionByTransactionHash(transactionHash: string)`** - Retrieves a transaction by its hash.  
  **Returns:** [`InfoGetTransactionResult`](https://github.com/casper-ecosystem/casper-js-sdk/blob/573b563d0bc038e46b07f12789286d336536f8c9/src/rpc/response.ts#L253)

* **`getTransactionByDeployHash(deployHash: string)`** - Retrieves a transaction by its deploy hash.  
  **Returns:** [`InfoGetTransactionResult`](https://github.com/casper-ecosystem/casper-js-sdk/blob/573b563d0bc038e46b07f12789286d336536f8c9/src/rpc/response.ts#L253)

#### Dictionary Queries

- **`getDictionaryItem(stateRootHash: string | null, uref: string, key: string)`** - Retrieves an item from a dictionary.  
  **Returns:** [`StateGetDictionaryResult`](https://github.com/casper-ecosystem/casper-js-sdk/blob/573b563d0bc038e46b07f12789286d336536f8c9/src/rpc/response.ts#L455)

* **`getDictionaryItemByIdentifier(stateRootHash: string | null, identifier: ParamDictionaryIdentifier)`** - Retrieves an item using a dictionary identifier.  
  **Returns:** [`StateGetDictionaryResult`](https://github.com/casper-ecosystem/casper-js-sdk/blob/573b563d0bc038e46b07f12789286d336536f8c9/src/rpc/response.ts#L455)

#### Global State Queries

- **`queryLatestGlobalState(key: string, path: string[])`** - Queries the latest global state.  
  **Returns:** [`QueryGlobalStateResult`](https://github.com/casper-ecosystem/casper-js-sdk/blob/573b563d0bc038e46b07f12789286d336536f8c9/src/rpc/response.ts#L892)

#### Account Queries

- **`getAccountInfoByBlockHash(blockHash: string, pub: PublicKey)`** - Retrieves account information using a block hash.  
  **Returns:** [`StateGetAccountInfo`](https://github.com/casper-ecosystem/casper-js-sdk/blob/573b563d0bc038e46b07f12789286d336536f8c9/src/rpc/response.ts#L82)

#### Block Queries

- **`getLatestBlock()`** - Retrieves the latest block.  
  **Returns:** [`ChainGetBlockResult`](https://github.com/casper-ecosystem/casper-js-sdk/blob/573b563d0bc038e46b07f12789286d336536f8c9/src/rpc/response.ts#L134)

#### Era Summary Queries

- **`getEraSummaryLatest()`** - Fetches the latest era summary.  
  **Returns:** [`ChainGetEraSummaryResult`](https://github.com/casper-ecosystem/casper-js-sdk/blob/573b563d0bc038e46b07f12789286d336536f8c9/src/rpc/response.ts#L212)

#### Status and Peers

- **`getStatus()`** - Fetches the node's current status.  
  **Returns:** [`InfoGetStatusResult`](https://github.com/casper-ecosystem/casper-js-sdk/blob/573b563d0bc038e46b07f12789286d336536f8c9/src/rpc/response.ts#L583)

### [`ClientTransactional`](https://github.com/casper-ecosystem/casper-js-sdk/blob/573b563d0bc038e46b07f12789286d336536f8c9/src/rpc/client.ts#L227)

The `ClientTransactional` interface provides methods for deploying transactions to the network.

- **`putDeploy(deploy: Deploy)`** - Sends a deploy to the network.  
  **Returns:** [`PutDeployResult`](https://github.com/casper-ecosystem/casper-js-sdk/blob/573b563d0bc038e46b07f12789286d336536f8c9/src/rpc/response.ts#L685)

* **`putTransactionV1(transaction: TransactionV1)`** - Sends a transaction (v1) to the network.  
  **Returns:** [`PutTransactionResult`](https://github.com/casper-ecosystem/casper-js-sdk/blob/573b563d0bc038e46b07f12789286d336536f8c9/src/rpc/response.ts#L707)
