import{u as r,j as e}from"./index-BybjzhoQ.js";const t={title:"Blockchain Responses",description:"undefined"};function d(n){const s={a:"a",code:"code",div:"div",h1:"h1",h2:"h2",header:"header",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...r(),...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(s.header,{children:e.jsxs(s.h1,{id:"blockchain-responses",children:["Blockchain Responses",e.jsx(s.a,{"aria-hidden":"true",tabIndex:"-1",href:"#blockchain-responses",children:e.jsx(s.div,{"data-autolink-icon":!0})})]})}),`
`,e.jsx(s.p,{children:"This section shows real RPC response payloads and how the SDK parses them into typed objects. All examples come directly from the SDK's test fixtures - real data from the Casper Network."}),`
`,e.jsxs(s.h2,{id:"why-this-matters",children:["Why this matters",e.jsx(s.a,{"aria-hidden":"true",tabIndex:"-1",href:"#why-this-matters",children:e.jsx(s.div,{"data-autolink-icon":!0})})]}),`
`,e.jsxs(s.p,{children:["Every ",e.jsx(s.code,{children:"rpcClient"})," method returns a typed object, but the underlying JSON has its own shape. Knowing what the raw response looks like helps you:"]}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"Debug unexpected values"}),`
`,e.jsx(s.li,{children:"Understand version differences (Casper 1.x vs 2.x)"}),`
`,e.jsx(s.li,{children:"Know which fields to expect before writing access code"}),`
`,e.jsx(s.li,{children:"Understand how amounts, keys, and hashes are encoded"}),`
`]}),`
`,e.jsxs(s.h2,{id:"key-encoding-conventions",children:["Key encoding conventions",e.jsx(s.a,{"aria-hidden":"true",tabIndex:"-1",href:"#key-encoding-conventions",children:e.jsx(s.div,{"data-autolink-icon":!0})})]}),`
`,e.jsx(s.p,{children:"All responses follow these conventions:"}),`
`,e.jsxs(s.table,{children:[e.jsx(s.thead,{children:e.jsxs(s.tr,{children:[e.jsx(s.th,{children:"Concept"}),e.jsx(s.th,{children:"Wire format"}),e.jsx(s.th,{children:"SDK type"})]})}),e.jsxs(s.tbody,{children:[e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"Public key"}),e.jsxs(s.td,{children:[e.jsx(s.code,{children:'"01..."'})," (ED25519) or ",e.jsx(s.code,{children:'"02..."'})," (SECP256K1)"]}),e.jsx(s.td,{children:e.jsx(s.code,{children:"PublicKey"})})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"Account hash"}),e.jsx(s.td,{children:e.jsx(s.code,{children:'"account-hash-<hex>"'})}),e.jsx(s.td,{children:e.jsx(s.code,{children:"AccountHash"})})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"Contract hash"}),e.jsx(s.td,{children:e.jsx(s.code,{children:'"hash-<hex>"'})}),e.jsx(s.td,{children:e.jsx(s.code,{children:"HashAddr"})})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"URef"}),e.jsx(s.td,{children:e.jsx(s.code,{children:'"uref-<hex>-<access>"'})}),e.jsx(s.td,{children:e.jsx(s.code,{children:"URef"})})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"Amount (CSPR)"}),e.jsxs(s.td,{children:[e.jsx(s.code,{children:'"900000000000"'})," (string, motes)"]}),e.jsx(s.td,{children:e.jsx(s.code,{children:"BigNumber"})})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"Block hash"}),e.jsx(s.td,{children:"64-char hex string"}),e.jsx(s.td,{children:e.jsx(s.code,{children:"HexBytes"})})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"Timestamp"}),e.jsx(s.td,{children:"ISO 8601 string"}),e.jsx(s.td,{children:e.jsx(s.code,{children:"Timestamp"})})]})]})]}),`
`,e.jsxs(s.h2,{id:"protocol-versions",children:["Protocol versions",e.jsx(s.a,{"aria-hidden":"true",tabIndex:"-1",href:"#protocol-versions",children:e.jsx(s.div,{"data-autolink-icon":!0})})]}),`
`,e.jsx(s.p,{children:"The Casper Network has two major protocol generations:"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"1.x"})," (",e.jsx(s.code,{children:'api_version: "1.5.x"'}),") - Deploy-based, older field names (",e.jsx(s.code,{children:"account"}),", ",e.jsx(s.code,{children:"deploy_hash"}),", flat delegator structure)"]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"2.x"})," (",e.jsx(s.code,{children:'api_version: "2.0.x"'}),") - Transaction-based, new entity model, ",e.jsx(s.code,{children:"delegator_kind"})," union type"]}),`
`]}),`
`,e.jsxs(s.p,{children:["The SDK handles both transparently via ",e.jsx(s.code,{children:"V1Compatible"})," wrapper classes."]}),`
`,e.jsxs(s.h2,{id:"pages-in-this-section",children:["Pages in this section",e.jsx(s.a,{"aria-hidden":"true",tabIndex:"-1",href:"#pages-in-this-section",children:e.jsx(s.div,{"data-autolink-icon":!0})})]}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:[e.jsx(s.a,{href:"/responses/block",children:"Block"})," - ",e.jsx(s.code,{children:"getBlockByHash"})," response anatomy"]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.a,{href:"/responses/transaction",children:"Transaction Result"})," - ",e.jsx(s.code,{children:"getTransactionByTransactionHash"})," result with execution info"]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.a,{href:"/responses/deploy",children:"Deploy Result"})," - Legacy ",e.jsx(s.code,{children:"getDeploy"})," result with transforms"]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.a,{href:"/responses/account",children:"Account"})," - ",e.jsx(s.code,{children:"getAccountInfo"})," with named keys"]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.a,{href:"/responses/auction-bid",children:"Auction Bid"})," - Validator bid structure, V1 vs V2"]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.a,{href:"/responses/node-status",children:"Node Status"})," - ",e.jsx(s.code,{children:"getStatus"})," response fields"]}),`
`]})]})}function c(n={}){const{wrapper:s}={...r(),...n.components};return s?e.jsx(s,{...n,children:e.jsx(d,{...n})}):d(n)}export{c as default,t as frontmatter};
