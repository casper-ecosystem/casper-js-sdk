import{u as i,j as e}from"./index-nmtYrWOa.js";const r={title:"RpcClient",description:"undefined"};function n(s){const a={a:"a",code:"code",div:"div",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...i(),...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(a.header,{children:e.jsxs(a.h1,{id:"rpcclient",children:["RpcClient",e.jsx(a.a,{"aria-hidden":"true",tabIndex:"-1",href:"#rpcclient",children:e.jsx(a.div,{"data-autolink-icon":!0})})]})}),`
`,e.jsxs(a.p,{children:["The ",e.jsx(a.code,{children:"RpcClient"})," is the primary interface for querying the Casper Network. It implements the full Casper JSON-RPC 2.0 API."]}),`
`,e.jsxs(a.h2,{id:"import",children:["Import",e.jsx(a.a,{"aria-hidden":"true",tabIndex:"-1",href:"#import",children:e.jsx(a.div,{"data-autolink-icon":!0})})]}),`
`,e.jsx(e.Fragment,{children:e.jsx(a.pre,{className:"shiki shiki-themes github-light github-dark-dimmed",style:{backgroundColor:"#fff","--shiki-dark-bg":"#22272e",color:"#24292e","--shiki-dark":"#adbac7"},tabIndex:"0",children:e.jsx(a.code,{children:e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"import"}),e.jsx(a.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:" { RpcClient, HttpHandler } "}),e.jsx(a.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"from"}),e.jsx(a.span,{style:{color:"#032F62","--shiki-dark":"#96D0FF"},children:" 'casper-js-sdk'"}),e.jsx(a.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:";"})]})})})}),`
`,e.jsxs(a.h2,{id:"usage",children:["Usage",e.jsx(a.a,{"aria-hidden":"true",tabIndex:"-1",href:"#usage",children:e.jsx(a.div,{"data-autolink-icon":!0})})]}),`
`,e.jsx(e.Fragment,{children:e.jsx(a.pre,{className:"shiki shiki-themes github-light github-dark-dimmed",style:{backgroundColor:"#fff","--shiki-dark-bg":"#22272e",color:"#24292e","--shiki-dark":"#adbac7"},tabIndex:"0",children:e.jsxs(a.code,{children:[e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"const"}),e.jsx(a.span,{style:{color:"#005CC5","--shiki-dark":"#6CB6FF"},children:" handler"}),e.jsx(a.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:" ="}),e.jsx(a.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:" new"}),e.jsx(a.span,{style:{color:"#6F42C1","--shiki-dark":"#DCBDFB"},children:" HttpHandler"}),e.jsx(a.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"("}),e.jsx(a.span,{style:{color:"#032F62","--shiki-dark":"#96D0FF"},children:"'http://<Node Address>:7777/rpc'"}),e.jsx(a.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:");"})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"const"}),e.jsx(a.span,{style:{color:"#005CC5","--shiki-dark":"#6CB6FF"},children:" rpcClient"}),e.jsx(a.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:" ="}),e.jsx(a.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:" new"}),e.jsx(a.span,{style:{color:"#6F42C1","--shiki-dark":"#DCBDFB"},children:" RpcClient"}),e.jsx(a.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"(handler);"})]}),`
`,e.jsx(a.span,{className:"line","data-empty-line":!0,children:" "}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"const"}),e.jsx(a.span,{style:{color:"#005CC5","--shiki-dark":"#6CB6FF"},children:" status"}),e.jsx(a.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:" ="}),e.jsx(a.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:" await"}),e.jsx(a.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:" rpcClient."}),e.jsx(a.span,{style:{color:"#6F42C1","--shiki-dark":"#DCBDFB"},children:"getStatus"}),e.jsx(a.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"();"})]})]})})}),`
`,e.jsxs(a.h2,{id:"constructor",children:["Constructor",e.jsx(a.a,{"aria-hidden":"true",tabIndex:"-1",href:"#constructor",children:e.jsx(a.div,{"data-autolink-icon":!0})})]}),`
`,e.jsx(e.Fragment,{children:e.jsx(a.pre,{className:"shiki shiki-themes github-light github-dark-dimmed",style:{backgroundColor:"#fff","--shiki-dark-bg":"#22272e",color:"#24292e","--shiki-dark":"#adbac7"},tabIndex:"0",children:e.jsx(a.code,{children:e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"new"}),e.jsx(a.span,{style:{color:"#6F42C1","--shiki-dark":"#DCBDFB"},children:" RpcClient"}),e.jsx(a.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"(handler: IHandler)"})]})})})}),`
`,e.jsxs(a.h3,{id:"parameters",children:["Parameters",e.jsx(a.a,{"aria-hidden":"true",tabIndex:"-1",href:"#parameters",children:e.jsx(a.div,{"data-autolink-icon":!0})})]}),`
`,e.jsxs(a.h4,{id:"handler",children:["handler",e.jsx(a.a,{"aria-hidden":"true",tabIndex:"-1",href:"#handler",children:e.jsx(a.div,{"data-autolink-icon":!0})})]}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsxs(a.li,{children:[e.jsx(a.strong,{children:"Type:"})," ",e.jsx(a.code,{children:"IHandler"})]}),`
`]}),`
`,e.jsxs(a.p,{children:["The transport to use for all requests. Typically an ",e.jsx(a.code,{children:"HttpHandler"})," instance."]}),`
`,e.jsxs(a.h2,{id:"methods",children:["Methods",e.jsx(a.a,{"aria-hidden":"true",tabIndex:"-1",href:"#methods",children:e.jsx(a.div,{"data-autolink-icon":!0})})]}),`
`,e.jsxs(a.h3,{id:"block-actions",children:["Block Actions",e.jsx(a.a,{"aria-hidden":"true",tabIndex:"-1",href:"#block-actions",children:e.jsx(a.div,{"data-autolink-icon":!0})})]}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/block/getLatestBlock",children:e.jsx(a.code,{children:"getLatestBlock"})})," - Get the most recent block"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/block/getBlockByHash",children:e.jsx(a.code,{children:"getBlockByHash"})})," - Get block by hash"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/block/getBlockByHeight",children:e.jsx(a.code,{children:"getBlockByHeight"})})," - Get block by height"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/block/getLatestBlockTransfers",children:e.jsx(a.code,{children:"getLatestBlockTransfers"})})," - Transfers in the latest block"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/block/getBlockTransfersByHash",children:e.jsx(a.code,{children:"getBlockTransfersByHash"})})," - Transfers in a block by hash"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/block/getBlockTransfersByHeight",children:e.jsx(a.code,{children:"getBlockTransfersByHeight"})})," - Transfers in a block by height"]}),`
`]}),`
`,e.jsxs(a.h3,{id:"balance-actions",children:["Balance Actions",e.jsx(a.a,{"aria-hidden":"true",tabIndex:"-1",href:"#balance-actions",children:e.jsx(a.div,{"data-autolink-icon":!0})})]}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/balance/queryLatestBalance",children:e.jsx(a.code,{children:"queryLatestBalance"})})," - Query latest balance by identifier"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/balance/queryLatestBalanceDetails",children:e.jsx(a.code,{children:"queryLatestBalanceDetails"})})," - Latest balance with hold breakdown"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/balance/getLatestBalance",children:e.jsx(a.code,{children:"getLatestBalance"})})," - Get latest balance (1.x format)"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/balance/queryBalanceByBlockHash",children:e.jsx(a.code,{children:"queryBalanceByBlockHash"})})," - Balance at a specific block hash"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/balance/queryBalanceByBlockHeight",children:e.jsx(a.code,{children:"queryBalanceByBlockHeight"})})," - Balance at a specific block height"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/balance/queryBalanceByStateRootHash",children:e.jsx(a.code,{children:"queryBalanceByStateRootHash"})})," - Balance at a state root hash"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/balance/queryBalanceDetailsByBlockHash",children:e.jsx(a.code,{children:"queryBalanceDetailsByBlockHash"})})," - Balance details at a block hash"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/balance/queryBalanceDetailsByBlockHeight",children:e.jsx(a.code,{children:"queryBalanceDetailsByBlockHeight"})})," - Balance details at a block height"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/balance/queryBalanceDetailsByStateRootHash",children:e.jsx(a.code,{children:"queryBalanceDetailsByStateRootHash"})})," - Balance details at a state root hash"]}),`
`]}),`
`,e.jsxs(a.h3,{id:"transaction-actions",children:["Transaction Actions",e.jsx(a.a,{"aria-hidden":"true",tabIndex:"-1",href:"#transaction-actions",children:e.jsx(a.div,{"data-autolink-icon":!0})})]}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/transactions/putTransaction",children:e.jsx(a.code,{children:"putTransaction"})})," - Submit a TransactionV1"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/transactions/putDeploy",children:e.jsx(a.code,{children:"putDeploy"})})," - Submit a legacy Deploy"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/transactions/waitForTransaction",children:e.jsx(a.code,{children:"waitForTransaction"})})," - Poll until a transaction is confirmed"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/transactions/waitForDeploy",children:e.jsx(a.code,{children:"waitForDeploy"})})," - Poll until a deploy is confirmed"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/transactions/getTransactionByTransactionHash",children:e.jsx(a.code,{children:"getTransactionByTransactionHash"})})," - Get transaction by hash"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/transactions/getTransactionByDeployHash",children:e.jsx(a.code,{children:"getTransactionByDeployHash"})})," - Get transaction by deploy hash"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/transactions/getDeploy",children:e.jsx(a.code,{children:"getDeploy"})})," - Get a legacy deploy by hash"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/transactions/getDeployFinalizedApproval",children:e.jsx(a.code,{children:"getDeployFinalizedApproval"})})," - Finalized approvals for a deploy"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/transactions/getTransactionFinalizedApprovalByDeployHash",children:e.jsx(a.code,{children:"getTransactionFinalizedApprovalByDeployHash"})})," - Finalized approvals by deploy hash"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/transactions/getTransactionFinalizedApprovalByTransactionHash",children:e.jsx(a.code,{children:"getTransactionFinalizedApprovalByTransactionHash"})})," - Finalized approvals by transaction hash"]}),`
`]}),`
`,e.jsxs(a.h3,{id:"account--entity-actions",children:["Account & Entity Actions",e.jsx(a.a,{"aria-hidden":"true",tabIndex:"-1",href:"#account--entity-actions",children:e.jsx(a.div,{"data-autolink-icon":!0})})]}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/account/getAccountInfo",children:e.jsx(a.code,{children:"getAccountInfo"})})," - Get account (1.x format, latest state)"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/account/getAccountInfoByBlockHash",children:e.jsx(a.code,{children:"getAccountInfoByBlockHash"})})," - Get account at a block hash"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/account/getAccountInfoByBlockHeight",children:e.jsx(a.code,{children:"getAccountInfoByBlockHeight"})})," - Get account at a block height"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/account/getLatestEntity",children:e.jsx(a.code,{children:"getLatestEntity"})})," - Get entity (2.x format, latest state)"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/account/getEntityByBlockHash",children:e.jsx(a.code,{children:"getEntityByBlockHash"})})," - Get entity at a block hash"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/account/getEntityByBlockHeight",children:e.jsx(a.code,{children:"getEntityByBlockHeight"})})," - Get entity at a block height"]}),`
`]}),`
`,e.jsxs(a.h3,{id:"global-state-actions",children:["Global State Actions",e.jsx(a.a,{"aria-hidden":"true",tabIndex:"-1",href:"#global-state-actions",children:e.jsx(a.div,{"data-autolink-icon":!0})})]}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/state/queryLatestGlobalState",children:e.jsx(a.code,{children:"queryLatestGlobalState"})})," - Query contract storage (latest state)"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/state/queryGlobalStateByBlockHash",children:e.jsx(a.code,{children:"queryGlobalStateByBlockHash"})})," - Query global state at a block hash"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/state/queryGlobalStateByBlockHeight",children:e.jsx(a.code,{children:"queryGlobalStateByBlockHeight"})})," - Query global state at a block height"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/state/queryGlobalStateByStateHash",children:e.jsx(a.code,{children:"queryGlobalStateByStateHash"})})," - Query global state at a state root hash"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/state/getDictionaryItem",children:e.jsx(a.code,{children:"getDictionaryItem"})})," - Read a dictionary entry"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/state/getDictionaryItemByIdentifier",children:e.jsx(a.code,{children:"getDictionaryItemByIdentifier"})})," - Read a dictionary entry by full identifier"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/state/getStateRootHashLatest",children:e.jsx(a.code,{children:"getStateRootHashLatest"})})," - Get the latest state root hash"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/state/getStateRootHashByHash",children:e.jsx(a.code,{children:"getStateRootHashByHash"})})," - Get state root hash at a block hash"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/state/getStateRootHashByHeight",children:e.jsx(a.code,{children:"getStateRootHashByHeight"})})," - Get state root hash at a block height"]}),`
`]}),`
`,e.jsxs(a.h3,{id:"auction--staking-actions",children:["Auction & Staking Actions",e.jsx(a.a,{"aria-hidden":"true",tabIndex:"-1",href:"#auction--staking-actions",children:e.jsx(a.div,{"data-autolink-icon":!0})})]}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/auction/getLatestAuctionInfo",children:e.jsx(a.code,{children:"getLatestAuctionInfo"})})," - Validator bids and delegations (latest)"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/auction/getAuctionInfoByHash",children:e.jsx(a.code,{children:"getAuctionInfoByHash"})})," - Auction info at a block hash"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/auction/getAuctionInfoByHeight",children:e.jsx(a.code,{children:"getAuctionInfoByHeight"})})," - Auction info at a block height"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/auction/getEraInfoLatest",children:e.jsx(a.code,{children:"getEraInfoLatest"})})," - Latest era info (1.x)"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/auction/getEraInfoByBlockHash",children:e.jsx(a.code,{children:"getEraInfoByBlockHash"})})," - Era info at a block hash"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/auction/getEraInfoByBlockHeight",children:e.jsx(a.code,{children:"getEraInfoByBlockHeight"})})," - Era info at a block height"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/auction/getEraSummaryLatest",children:e.jsx(a.code,{children:"getEraSummaryLatest"})})," - Latest era summary (2.x)"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/auction/getEraSummaryByHash",children:e.jsx(a.code,{children:"getEraSummaryByHash"})})," - Era summary at a block hash"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/auction/getEraSummaryByHeight",children:e.jsx(a.code,{children:"getEraSummaryByHeight"})})," - Era summary at a block height"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/auction/getValidatorChangesInfo",children:e.jsx(a.code,{children:"getValidatorChangesInfo"})})," - Validator status changes"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/auction/getLatestValidatorReward",children:e.jsx(a.code,{children:"getLatestValidatorReward"})})," - Latest validator reward"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/auction/getValidatorRewardByEraID",children:e.jsx(a.code,{children:"getValidatorRewardByEraID"})})," - Validator reward for an era"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/auction/getValidatorRewardByBlockHash",children:e.jsx(a.code,{children:"getValidatorRewardByBlockHash"})})," - Validator reward at a block hash"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/auction/getValidatorRewardByBlockHeight",children:e.jsx(a.code,{children:"getValidatorRewardByBlockHeight"})})," - Validator reward at a block height"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/auction/getLatestDelegatorReward",children:e.jsx(a.code,{children:"getLatestDelegatorReward"})})," - Latest delegator reward"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/auction/getDelegatorRewardByEraID",children:e.jsx(a.code,{children:"getDelegatorRewardByEraID"})})," - Delegator reward for an era"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/auction/getDelegatorRewardByBlockHash",children:e.jsx(a.code,{children:"getDelegatorRewardByBlockHash"})})," - Delegator reward at a block hash"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/auction/getDelegatorRewardByBlockHeight",children:e.jsx(a.code,{children:"getDelegatorRewardByBlockHeight"})})," - Delegator reward at a block height"]}),`
`]}),`
`,e.jsxs(a.h3,{id:"node-actions",children:["Node Actions",e.jsx(a.a,{"aria-hidden":"true",tabIndex:"-1",href:"#node-actions",children:e.jsx(a.div,{"data-autolink-icon":!0})})]}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/node/getStatus",children:e.jsx(a.code,{children:"getStatus"})})," - Node status and version"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/node/getPeers",children:e.jsx(a.code,{children:"getPeers"})})," - Connected peers"]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.a,{href:"/actions/node/getChainspec",children:e.jsx(a.code,{children:"getChainspec"})})," - Chainspec configuration"]}),`
`]}),`
`,e.jsxs(a.h2,{id:"raw-rpc-access",children:["Raw RPC Access",e.jsx(a.a,{"aria-hidden":"true",tabIndex:"-1",href:"#raw-rpc-access",children:e.jsx(a.div,{"data-autolink-icon":!0})})]}),`
`,e.jsx(e.Fragment,{children:e.jsx(a.pre,{className:"shiki shiki-themes github-light github-dark-dimmed",style:{backgroundColor:"#fff","--shiki-dark-bg":"#22272e",color:"#24292e","--shiki-dark":"#adbac7"},tabIndex:"0",children:e.jsxs(a.code,{children:[e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"const"}),e.jsx(a.span,{style:{color:"#005CC5","--shiki-dark":"#6CB6FF"},children:" response"}),e.jsx(a.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:" ="}),e.jsx(a.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:" await"}),e.jsx(a.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:" rpcClient."}),e.jsx(a.span,{style:{color:"#6F42C1","--shiki-dark":"#DCBDFB"},children:"processCall"}),e.jsx(a.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"({"})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"  id: "}),e.jsx(a.span,{style:{color:"#005CC5","--shiki-dark":"#6CB6FF"},children:"1"}),e.jsx(a.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:","})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"  jsonrpc: "}),e.jsx(a.span,{style:{color:"#032F62","--shiki-dark":"#96D0FF"},children:"'2.0'"}),e.jsx(a.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:","})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"  method: "}),e.jsx(a.span,{style:{color:"#032F62","--shiki-dark":"#96D0FF"},children:"'chain_get_block'"}),e.jsx(a.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:","})]}),`
`,e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"  params: { block_identifier: { Height: "}),e.jsx(a.span,{style:{color:"#005CC5","--shiki-dark":"#6CB6FF"},children:"1000000"}),e.jsx(a.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:" } },"})]}),`
`,e.jsx(a.span,{className:"line",children:e.jsx(a.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"});"})})]})})})]})}function c(s={}){const{wrapper:a}={...i(),...s.components};return a?e.jsx(a,{...s,children:e.jsx(n,{...s})}):n(s)}export{c as default,r as frontmatter};
