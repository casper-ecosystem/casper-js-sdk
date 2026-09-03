import{u as r,j as e}from"./index-CnH0nEw-.js";const l={title:"NativeDelegateBuilder",description:"undefined"};function n(s){const i={a:"a",code:"code",div:"div",h1:"h1",h2:"h2",h3:"h3",header:"header",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...r(),...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(i.header,{children:e.jsxs(i.h1,{id:"nativedelegatebuilder",children:["NativeDelegateBuilder",e.jsx(i.a,{"aria-hidden":"true",tabIndex:"-1",href:"#nativedelegatebuilder",children:e.jsx(i.div,{"data-autolink-icon":!0})})]})}),`
`,e.jsx(i.p,{children:"Builds a native delegate (stake) transaction to stake CSPR with a validator."}),`
`,e.jsxs(i.h2,{id:"import",children:["Import",e.jsx(i.a,{"aria-hidden":"true",tabIndex:"-1",href:"#import",children:e.jsx(i.div,{"data-autolink-icon":!0})})]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark-dimmed",style:{backgroundColor:"#fff","--shiki-dark-bg":"#22272e",color:"#24292e","--shiki-dark":"#adbac7"},tabIndex:"0",children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"import"}),e.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:" { NativeDelegateBuilder, PublicKey } "}),e.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"from"}),e.jsx(i.span,{style:{color:"#032F62","--shiki-dark":"#96D0FF"},children:" 'casper-js-sdk'"}),e.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:";"})]})})})}),`
`,e.jsxs(i.h2,{id:"usage",children:["Usage",e.jsx(i.a,{"aria-hidden":"true",tabIndex:"-1",href:"#usage",children:e.jsx(i.div,{"data-autolink-icon":!0})})]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark-dimmed",style:{backgroundColor:"#fff","--shiki-dark-bg":"#22272e",color:"#24292e","--shiki-dark":"#adbac7"},tabIndex:"0",children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"const"}),e.jsx(i.span,{style:{color:"#005CC5","--shiki-dark":"#6CB6FF"},children:" transaction"}),e.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:" ="}),e.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:" new"}),e.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#DCBDFB"},children:" NativeDelegateBuilder"}),e.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"()"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"  ."}),e.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#DCBDFB"},children:"from"}),e.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"(delegatorPublicKey)"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"  ."}),e.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#DCBDFB"},children:"validator"}),e.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"(validatorPublicKey)"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"  ."}),e.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#DCBDFB"},children:"amount"}),e.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"("}),e.jsx(i.span,{style:{color:"#032F62","--shiki-dark":"#96D0FF"},children:"'500000000000'"}),e.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:")  "}),e.jsx(i.span,{style:{color:"#6A737D","--shiki-dark":"#768390"},children:"// 500 CSPR"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"  ."}),e.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#DCBDFB"},children:"chainName"}),e.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"("}),e.jsx(i.span,{style:{color:"#032F62","--shiki-dark":"#96D0FF"},children:"'casper'"}),e.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"  ."}),e.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#DCBDFB"},children:"payment"}),e.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"("}),e.jsx(i.span,{style:{color:"#005CC5","--shiki-dark":"#6CB6FF"},children:"2_500_000_000"}),e.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"  ."}),e.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#DCBDFB"},children:"build"}),e.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"();"})]}),`
`,e.jsx(i.span,{className:"line","data-empty-line":!0,children:" "}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"transaction."}),e.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#DCBDFB"},children:"sign"}),e.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"(privateKey);"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"const"}),e.jsx(i.span,{style:{color:"#005CC5","--shiki-dark":"#6CB6FF"},children:" result"}),e.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:" ="}),e.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:" await"}),e.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:" rpcClient."}),e.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#DCBDFB"},children:"putTransaction"}),e.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"(transaction);"})]})]})})}),`
`,e.jsxs(i.h2,{id:"methods",children:["Methods",e.jsx(i.a,{"aria-hidden":"true",tabIndex:"-1",href:"#methods",children:e.jsx(i.div,{"data-autolink-icon":!0})})]}),`
`,e.jsxs(i.h3,{id:"frompublickey",children:[".from(publicKey)",e.jsx(i.a,{"aria-hidden":"true",tabIndex:"-1",href:"#frompublickey",children:e.jsx(i.div,{"data-autolink-icon":!0})})]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Type:"})," ",e.jsx(i.code,{children:"PublicKey"})," - required"]}),`
`]}),`
`,e.jsx(i.p,{children:"The delegator's public key."}),`
`,e.jsxs(i.h3,{id:"validatorpublickey",children:[".validator(publicKey)",e.jsx(i.a,{"aria-hidden":"true",tabIndex:"-1",href:"#validatorpublickey",children:e.jsx(i.div,{"data-autolink-icon":!0})})]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Type:"})," ",e.jsx(i.code,{children:"PublicKey"})," - required"]}),`
`]}),`
`,e.jsx(i.p,{children:"The validator to delegate to."}),`
`,e.jsxs(i.h3,{id:"amountmotes",children:[".amount(motes)",e.jsx(i.a,{"aria-hidden":"true",tabIndex:"-1",href:"#amountmotes",children:e.jsx(i.div,{"data-autolink-icon":!0})})]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Type:"})," ",e.jsx(i.code,{children:"BigNumber | string"})," - required"]}),`
`]}),`
`,e.jsx(i.p,{children:"Amount to stake in motes."}),`
`,e.jsxs(i.h3,{id:"chainnamename",children:[".chainName(name)",e.jsx(i.a,{"aria-hidden":"true",tabIndex:"-1",href:"#chainnamename",children:e.jsx(i.div,{"data-autolink-icon":!0})})]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Type:"})," ",e.jsx(i.code,{children:"string"})," - required"]}),`
`]}),`
`,e.jsxs(i.h3,{id:"paymentmotes",children:[".payment(motes)",e.jsx(i.a,{"aria-hidden":"true",tabIndex:"-1",href:"#paymentmotes",children:e.jsx(i.div,{"data-autolink-icon":!0})})]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Type:"})," ",e.jsx(i.code,{children:"number"})," - optional"]}),`
`]}),`
`,e.jsx(i.p,{children:"Gas payment in motes."}),`
`,e.jsxs(i.h2,{id:"return-value",children:["Return Value",e.jsx(i.a,{"aria-hidden":"true",tabIndex:"-1",href:"#return-value",children:e.jsx(i.div,{"data-autolink-icon":!0})})]}),`
`,e.jsx(i.p,{children:e.jsx(i.code,{children:"Transaction"})}),`
`,e.jsxs(i.h2,{id:"notes",children:["Notes",e.jsx(i.a,{"aria-hidden":"true",tabIndex:"-1",href:"#notes",children:e.jsx(i.div,{"data-autolink-icon":!0})})]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["Minimum delegation is ",e.jsx(i.code,{children:"500_000_000_000"})," motes (500 CSPR) on mainnet."]}),`
`,e.jsx(i.li,{children:"Delegated stake earns rewards each era (approximately every 2 hours)."}),`
`,e.jsxs(i.li,{children:["Use ",e.jsx(i.a,{href:"/builders/NativeUndelegateBuilder",children:e.jsx(i.code,{children:"NativeUndelegateBuilder"})})," to unstake."]}),`
`]}),`
`,e.jsxs(i.h2,{id:"related",children:["Related",e.jsx(i.a,{"aria-hidden":"true",tabIndex:"-1",href:"#related",children:e.jsx(i.div,{"data-autolink-icon":!0})})]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:e.jsx(i.a,{href:"/builders/NativeUndelegateBuilder",children:e.jsx(i.code,{children:"NativeUndelegateBuilder"})})}),`
`,e.jsx(i.li,{children:e.jsx(i.a,{href:"/builders/NativeRedelegateBuilder",children:e.jsx(i.code,{children:"NativeRedelegateBuilder"})})}),`
`,e.jsx(i.li,{children:e.jsx(i.a,{href:"/utilities/makeAuctionManagerDeploy",children:e.jsx(i.code,{children:"makeAuctionManagerDeploy"})})}),`
`]})]})}function d(s={}){const{wrapper:i}={...r(),...s.components};return i?e.jsx(i,{...s,children:e.jsx(n,{...s})}):n(s)}export{d as default,l as frontmatter};
