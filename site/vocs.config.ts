import { defineConfig } from 'vocs';
import path from 'path';
import { version } from '../package.json';

export default defineConfig({
  title: 'Casper JS SDK',
  description: 'TypeScript/JavaScript SDK for the Casper Network',
  rootDir: '.',
  basePath: '/casper-js-sdk',
  vite: {
    server: {
      fs: {
        allow: [path.resolve(__dirname, '..')]
      }
    }
  },
  logoUrl:
    'https://cdn.prod.website-files.com/668fef77d8ac075ed5e3f57a/66900f439d0597692b64fcf2_Casper_Wordmark_Red_RGB.png',
  iconUrl:
    'https://cdn.prod.website-files.com/668fef77d8ac075ed5e3f57a/66e059771689ad5094578c10_faviconV2%20(1).png',
  ogImageUrl: 'https://casper-ecosystem.github.io/casper-js-sdk/og-image.png',
  editLink: {
    pattern:
      'https://github.com/casper-ecosystem/casper-js-sdk/edit/dev/site/pages/:path',
    text: 'Edit on GitHub'
  },
  topNav: [
    { text: 'Docs', link: '/docs/introduction', match: '/docs' },
    {
      text: `v${version}`,
      items: [
        {
          text: 'Changelog',
          link: 'https://github.com/casper-ecosystem/casper-js-sdk/releases'
        },
        { text: 'Migration Guide (v2 → v5)', link: '/docs/migration-guide' }
      ]
    }
  ],
  sidebar: [
    {
      text: 'Introduction',
      collapsed: false,
      items: [
        { text: 'Why Casper JS SDK', link: '/docs/introduction' },
        { text: 'Getting Started', link: '/docs/getting-started' },
        { text: 'Installation', link: '/docs/installation' },
        { text: 'TypeScript', link: '/docs/typescript' },
        { text: 'Error Handling', link: '/docs/error-handling' },
        { text: 'FAQ', link: '/docs/faq' },
        { text: 'Migration Guide (v2 → v5)', link: '/docs/migration-guide' }
      ]
    },
    {
      text: 'Clients',
      collapsed: false,
      items: [
        { text: 'Introduction', link: '/clients/intro' },
        { text: 'RPC Client', link: '/clients/rpc-client' },
        { text: 'SSE Client', link: '/clients/sse-client' },
        { text: 'Speculative Client', link: '/clients/speculative' },
        {
          text: 'Transports',
          collapsed: false,
          items: [{ text: 'HTTP', link: '/clients/transports/http' }]
        }
      ]
    },
    {
      text: 'Accounts',
      collapsed: false,
      items: [
        { text: 'Private Key', link: '/accounts/private-key' },
        { text: 'Public Key', link: '/accounts/public-key' }
      ]
    },
    {
      text: 'RPC Actions',
      collapsed: false,
      items: [
        {
          text: 'Block',
          collapsed: true,
          items: [
            { text: 'getLatestBlock', link: '/actions/block/getLatestBlock' },
            { text: 'getBlockByHash', link: '/actions/block/getBlockByHash' },
            {
              text: 'getBlockByHeight',
              link: '/actions/block/getBlockByHeight'
            },
            {
              text: 'getLatestBlockTransfers',
              link: '/actions/block/getLatestBlockTransfers'
            },
            {
              text: 'getBlockTransfersByHash',
              link: '/actions/block/getBlockTransfersByHash'
            },
            {
              text: 'getBlockTransfersByHeight',
              link: '/actions/block/getBlockTransfersByHeight'
            }
          ]
        },
        {
          text: 'Balance',
          collapsed: true,
          items: [
            {
              text: 'queryLatestBalance',
              link: '/actions/balance/queryLatestBalance'
            },
            {
              text: 'queryLatestBalanceDetails',
              link: '/actions/balance/queryLatestBalanceDetails'
            },
            {
              text: 'queryBalanceByBlockHash',
              link: '/actions/balance/queryBalanceByBlockHash'
            },
            {
              text: 'queryBalanceByBlockHeight',
              link: '/actions/balance/queryBalanceByBlockHeight'
            },
            {
              text: 'queryBalanceByStateRootHash',
              link: '/actions/balance/queryBalanceByStateRootHash'
            },
            {
              text: 'queryBalanceDetailsByBlockHash',
              link: '/actions/balance/queryBalanceDetailsByBlockHash'
            },
            {
              text: 'queryBalanceDetailsByBlockHeight',
              link: '/actions/balance/queryBalanceDetailsByBlockHeight'
            },
            {
              text: 'queryBalanceDetailsByStateRootHash',
              link: '/actions/balance/queryBalanceDetailsByStateRootHash'
            },
            {
              text: 'getLatestBalance',
              link: '/actions/balance/getLatestBalance'
            }
          ]
        },
        {
          text: 'Transactions',
          collapsed: true,
          items: [
            {
              text: 'putTransaction',
              link: '/actions/transactions/putTransaction'
            },
            { text: 'putDeploy', link: '/actions/transactions/putDeploy' },
            {
              text: 'getTransactionByTransactionHash',
              link: '/actions/transactions/getTransactionByTransactionHash'
            },
            {
              text: 'getTransactionByDeployHash',
              link: '/actions/transactions/getTransactionByDeployHash'
            },
            {
              text: 'getTransactionFinalizedApprovalByTransactionHash',
              link:
                '/actions/transactions/getTransactionFinalizedApprovalByTransactionHash'
            },
            {
              text: 'getTransactionFinalizedApprovalByDeployHash',
              link:
                '/actions/transactions/getTransactionFinalizedApprovalByDeployHash'
            },
            { text: 'getDeploy', link: '/actions/transactions/getDeploy' },
            {
              text: 'getDeployFinalizedApproval',
              link: '/actions/transactions/getDeployFinalizedApproval'
            },
            {
              text: 'waitForTransaction',
              link: '/actions/transactions/waitForTransaction'
            },
            {
              text: 'waitForDeploy',
              link: '/actions/transactions/waitForDeploy'
            }
          ]
        },
        {
          text: 'Account & Entity',
          collapsed: true,
          items: [
            { text: 'getAccountInfo', link: '/actions/account/getAccountInfo' },
            {
              text: 'getAccountInfoByBlockHash',
              link: '/actions/account/getAccountInfoByBlockHash'
            },
            {
              text: 'getAccountInfoByBlockHeight',
              link: '/actions/account/getAccountInfoByBlockHeight'
            },
            {
              text: 'getLatestEntity',
              link: '/actions/account/getLatestEntity'
            },
            {
              text: 'getEntityByBlockHash',
              link: '/actions/account/getEntityByBlockHash'
            },
            {
              text: 'getEntityByBlockHeight',
              link: '/actions/account/getEntityByBlockHeight'
            }
          ]
        },
        {
          text: 'Global State',
          collapsed: true,
          items: [
            {
              text: 'queryLatestGlobalState',
              link: '/actions/state/queryLatestGlobalState'
            },
            {
              text: 'queryGlobalStateByBlockHash',
              link: '/actions/state/queryGlobalStateByBlockHash'
            },
            {
              text: 'queryGlobalStateByBlockHeight',
              link: '/actions/state/queryGlobalStateByBlockHeight'
            },
            {
              text: 'queryGlobalStateByStateHash',
              link: '/actions/state/queryGlobalStateByStateHash'
            },
            {
              text: 'getDictionaryItem',
              link: '/actions/state/getDictionaryItem'
            },
            {
              text: 'getDictionaryItemByIdentifier',
              link: '/actions/state/getDictionaryItemByIdentifier'
            },
            {
              text: 'getStateRootHashLatest',
              link: '/actions/state/getStateRootHashLatest'
            },
            {
              text: 'getStateRootHashByHash',
              link: '/actions/state/getStateRootHashByHash'
            },
            {
              text: 'getStateRootHashByHeight',
              link: '/actions/state/getStateRootHashByHeight'
            }
          ]
        },
        {
          text: 'Auction & Staking',
          collapsed: true,
          items: [
            {
              text: 'getLatestAuctionInfo',
              link: '/actions/auction/getLatestAuctionInfo'
            },
            {
              text: 'getAuctionInfoByHash',
              link: '/actions/auction/getAuctionInfoByHash'
            },
            {
              text: 'getAuctionInfoByHeight',
              link: '/actions/auction/getAuctionInfoByHeight'
            },
            {
              text: 'getEraSummaryLatest',
              link: '/actions/auction/getEraSummaryLatest'
            },
            {
              text: 'getEraSummaryByHash',
              link: '/actions/auction/getEraSummaryByHash'
            },
            {
              text: 'getEraSummaryByHeight',
              link: '/actions/auction/getEraSummaryByHeight'
            },
            {
              text: 'getEraInfoLatest',
              link: '/actions/auction/getEraInfoLatest'
            },
            {
              text: 'getEraInfoByBlockHash',
              link: '/actions/auction/getEraInfoByBlockHash'
            },
            {
              text: 'getEraInfoByBlockHeight',
              link: '/actions/auction/getEraInfoByBlockHeight'
            },
            {
              text: 'getValidatorChangesInfo',
              link: '/actions/auction/getValidatorChangesInfo'
            },
            {
              text: 'getLatestValidatorReward',
              link: '/actions/auction/getLatestValidatorReward'
            },
            {
              text: 'getValidatorRewardByEraID',
              link: '/actions/auction/getValidatorRewardByEraID'
            },
            {
              text: 'getValidatorRewardByBlockHash',
              link: '/actions/auction/getValidatorRewardByBlockHash'
            },
            {
              text: 'getValidatorRewardByBlockHeight',
              link: '/actions/auction/getValidatorRewardByBlockHeight'
            },
            {
              text: 'getLatestDelegatorReward',
              link: '/actions/auction/getLatestDelegatorReward'
            },
            {
              text: 'getDelegatorRewardByEraID',
              link: '/actions/auction/getDelegatorRewardByEraID'
            },
            {
              text: 'getDelegatorRewardByBlockHash',
              link: '/actions/auction/getDelegatorRewardByBlockHash'
            },
            {
              text: 'getDelegatorRewardByBlockHeight',
              link: '/actions/auction/getDelegatorRewardByBlockHeight'
            }
          ]
        },
        {
          text: 'Node',
          collapsed: true,
          items: [
            { text: 'getStatus', link: '/actions/node/getStatus' },
            { text: 'getPeers', link: '/actions/node/getPeers' },
            { text: 'getChainspec', link: '/actions/node/getChainspec' }
          ]
        }
      ]
    },
    {
      text: 'SSE Events',
      collapsed: false,
      items: [
        { text: 'Introduction', link: '/sse/introduction' },
        { text: 'BlockAdded', link: '/sse/block-added' },
        { text: 'TransactionProcessed', link: '/sse/transaction-processed' },
        { text: 'TransactionAccepted', link: '/sse/transaction-accepted' },
        { text: 'TransactionExpired', link: '/sse/transaction-expired' },
        { text: 'DeployProcessed', link: '/sse/deploy-processed' },
        { text: 'FinalitySignature', link: '/sse/finality-signature' },
        { text: 'Fault', link: '/sse/fault' },
        { text: 'Step', link: '/sse/step' }
      ]
    },
    {
      text: 'Transaction Builders',
      collapsed: false,
      items: [
        { text: 'Introduction', link: '/builders/introduction' },
        {
          text: 'NativeTransferBuilder',
          link: '/builders/NativeTransferBuilder'
        },
        {
          text: 'NativeDelegateBuilder',
          link: '/builders/NativeDelegateBuilder'
        },
        {
          text: 'NativeUndelegateBuilder',
          link: '/builders/NativeUndelegateBuilder'
        },
        {
          text: 'NativeRedelegateBuilder',
          link: '/builders/NativeRedelegateBuilder'
        },
        { text: 'ContractCallBuilder', link: '/builders/ContractCallBuilder' },
        { text: 'SessionBuilder', link: '/builders/SessionBuilder' }
      ]
    },
    {
      text: 'CLValues',
      collapsed: false,
      items: [
        { text: 'Introduction', link: '/clvalues/introduction' },
        { text: 'Numeric Types', link: '/clvalues/numeric' },
        { text: 'newCLString', link: '/clvalues/newCLString' },
        { text: 'newCLBool', link: '/clvalues/newCLBool' },
        { text: 'newCLByteArray', link: '/clvalues/newCLByteArray' },
        { text: 'newCLKey', link: '/clvalues/newCLKey' },
        { text: 'newCLUref', link: '/clvalues/newCLUref' },
        { text: 'newCLPublicKey', link: '/clvalues/newCLPublicKey' },
        { text: 'Collections', link: '/clvalues/collections' },
        { text: 'Args', link: '/clvalues/Args' },
        { text: 'CLValueParser', link: '/clvalues/CLValueParser' }
      ]
    },
    {
      text: 'Utilities',
      collapsed: false,
      items: [
        { text: 'CasperNetwork', link: '/utilities/CasperNetwork' },
        {
          text: 'makeCsprTransferDeploy',
          link: '/utilities/makeCsprTransferDeploy'
        },
        {
          text: 'makeCsprTransferTransaction',
          link: '/utilities/makeCsprTransferTransaction'
        },
        {
          text: 'makeAuctionManagerDeploy',
          link: '/utilities/makeAuctionManagerDeploy'
        },
        {
          text: 'makeAuctionManagerTransaction',
          link: '/utilities/makeAuctionManagerTransaction'
        },
        {
          text: 'makeCep18TransferDeploy',
          link: '/utilities/makeCep18TransferDeploy'
        },
        {
          text: 'makeCep18TransferTransaction',
          link: '/utilities/makeCep18TransferTransaction'
        },
        {
          text: 'makeNftTransferDeploy',
          link: '/utilities/makeNftTransferDeploy'
        },
        {
          text: 'makeNftTransferTransaction',
          link: '/utilities/makeNftTransferTransaction'
        }
      ]
    },
    {
      text: 'Types',
      collapsed: false,
      items: [
        {
          text: 'Accounts & Entities',
          collapsed: true,
          items: [
            { text: 'Account', link: '/types/account' },
            { text: 'AddressableEntity', link: '/types/addressable-entity' },
            { text: 'InitiatorAddr', link: '/types/initiator-addr' },
            { text: 'NamedKey', link: '/types/named-key' }
          ]
        },
        {
          text: 'Blocks & Eras',
          collapsed: true,
          items: [
            { text: 'Block', link: '/types/block' },
            { text: 'BlockProposer', link: '/types/block-proposer' },
            { text: 'MinimalBlockInfo', link: '/types/minimal-block-info' },
            { text: 'EraEnd', link: '/types/era-end' },
            { text: 'EraInfo', link: '/types/era-info' },
            { text: 'EraSummary', link: '/types/era-summary' }
          ]
        },
        {
          text: 'Transactions & Deploys',
          collapsed: true,
          items: [
            { text: 'Transaction', link: '/types/transaction' },
            { text: 'Deploy', link: '/types/deploy' },
            { text: 'DeployInfo', link: '/types/deploy-info' },
            {
              text: 'ExecutableDeployItem',
              link: '/types/executable-deploy-item'
            },
            { text: 'ExecutionResult', link: '/types/execution-result' },
            { text: 'Transfer', link: '/types/transfer' },
            { text: 'Transform', link: '/types/transform' }
          ]
        },
        {
          text: 'Transaction Internals',
          collapsed: true,
          items: [
            {
              text: 'TransactionV1Payload',
              link: '/types/transaction-v1-payload'
            },
            { text: 'TransactionTarget', link: '/types/transaction-target' },
            {
              text: 'TransactionEntryPoint',
              link: '/types/transaction-entry-point'
            },
            {
              text: 'TransactionScheduling',
              link: '/types/transaction-scheduling'
            },
            { text: 'PricingMode', link: '/types/pricing-mode' }
          ]
        },
        {
          text: 'Auction & Staking',
          collapsed: true,
          items: [
            { text: 'AuctionState', link: '/types/auction-state' },
            { text: 'Bid', link: '/types/bid' },
            { text: 'BidKind', link: '/types/bid-kind' },
            { text: 'UnbondingPurse', link: '/types/unbonding-purse' }
          ]
        },
        {
          text: 'Contracts',
          collapsed: true,
          items: [
            { text: 'Contract', link: '/types/contract' },
            { text: 'ContractPackage', link: '/types/contract-package' },
            { text: 'ContractWasm', link: '/types/contract-wasm' },
            { text: 'ByteCode', link: '/types/byte-code' },
            { text: 'EntryPoint', link: '/types/entry-point' }
          ]
        },
        {
          text: 'State',
          collapsed: true,
          items: [
            { text: 'StoredValue', link: '/types/stored-value' },
            { text: 'Args', link: '/types/args' }
          ]
        },
        {
          text: 'Utilities',
          collapsed: true,
          items: [
            { text: 'Timestamp & Duration', link: '/types/time' },
            { text: 'HexBytes', link: '/types/hex-bytes' },
            { text: 'Conversions', link: '/types/conversions' },
            { text: 'ByteConverters', link: '/types/byte-converters' }
          ]
        }
      ]
    },
    {
      text: 'Blockchain Responses',
      collapsed: false,
      items: [
        { text: 'Introduction', link: '/responses/introduction' },
        { text: 'Block', link: '/responses/block' },
        { text: 'Transaction Result', link: '/responses/transaction' },
        { text: 'Deploy Result', link: '/responses/deploy' },
        { text: 'Account', link: '/responses/account' },
        { text: 'Auction Bid', link: '/responses/auction-bid' },
        { text: 'Node Status', link: '/responses/node-status' }
      ]
    },
    {
      text: 'Glossary',
      collapsed: false,
      items: [
        { text: 'Errors', link: '/glossary/errors' },
        { text: 'Types', link: '/glossary/types' },
        { text: 'Terms', link: '/glossary/terms' }
      ]
    }
  ],
  socials: [
    {
      icon: 'github',
      link: 'https://github.com/casper-ecosystem/casper-js-sdk'
    }
  ],
  theme: {
    accentColor: { dark: '#FF4D55', light: '#FF0012' }
  }
});
