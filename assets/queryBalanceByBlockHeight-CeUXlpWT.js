import{u as r,j as e}from"./index-BybjzhoQ.js";const l={title:"queryBalanceByBlockHeight",description:"undefined"};function n(s){const i={a:"a",code:"code",div:"div",h1:"h1",h2:"h2",h3:"h3",header:"header",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...r(),...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(i.header,{children:e.jsxs(i.h1,{id:"querybalancebyblockheight",children:["queryBalanceByBlockHeight",e.jsx(i.a,{"aria-hidden":"true",tabIndex:"-1",href:"#querybalancebyblockheight",children:e.jsx(i.div,{"data-autolink-icon":!0})})]})}),`
`,e.jsx(i.p,{children:"Returns the CSPR balance at a specific block height."}),`
`,e.jsxs(i.h2,{id:"import",children:["Import",e.jsx(i.a,{"aria-hidden":"true",tabIndex:"-1",href:"#import",children:e.jsx(i.div,{"data-autolink-icon":!0})})]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark-dimmed",style:{backgroundColor:"#fff","--shiki-dark-bg":"#22272e",color:"#24292e","--shiki-dark":"#adbac7"},tabIndex:"0",children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"import"}),e.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:" { RpcClient, HttpHandler } "}),e.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"from"}),e.jsx(i.span,{style:{color:"#032F62","--shiki-dark":"#96D0FF"},children:" 'casper-js-sdk'"}),e.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:";"})]})})})}),`
`,e.jsxs(i.h2,{id:"usage",children:["Usage",e.jsx(i.a,{"aria-hidden":"true",tabIndex:"-1",href:"#usage",children:e.jsx(i.div,{"data-autolink-icon":!0})})]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark-dimmed",style:{backgroundColor:"#fff","--shiki-dark-bg":"#22272e",color:"#24292e","--shiki-dark":"#adbac7"},tabIndex:"0",children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"const"}),e.jsx(i.span,{style:{color:"#005CC5","--shiki-dark":"#6CB6FF"},children:" result"}),e.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:" ="}),e.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:" await"}),e.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:" rpcClient."}),e.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#DCBDFB"},children:"queryBalanceByBlockHeight"}),e.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"("})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{color:"#005CC5","--shiki-dark":"#6CB6FF"},children:"  1_000_000"}),e.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"  { mainPurseUnderPublicKey: publicKey."}),e.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#DCBDFB"},children:"toHex"}),e.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"() }"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:");"})}),`
`,e.jsx(i.span,{className:"line","data-empty-line":!0,children:" "}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"console."}),e.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#DCBDFB"},children:"log"}),e.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"(result.balance."}),e.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#DCBDFB"},children:"toString"}),e.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"());"})]})]})})}),`
`,e.jsxs(i.h2,{id:"parameters",children:["Parameters",e.jsx(i.a,{"aria-hidden":"true",tabIndex:"-1",href:"#parameters",children:e.jsx(i.div,{"data-autolink-icon":!0})})]}),`
`,e.jsxs(i.h3,{id:"height",children:["height",e.jsx(i.a,{"aria-hidden":"true",tabIndex:"-1",href:"#height",children:e.jsx(i.div,{"data-autolink-icon":!0})})]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Type:"})," ",e.jsx(i.code,{children:"number"})]}),`
`]}),`
`,e.jsx(i.p,{children:"Block height."}),`
`,e.jsxs(i.h3,{id:"identifier",children:["identifier",e.jsx(i.a,{"aria-hidden":"true",tabIndex:"-1",href:"#identifier",children:e.jsx(i.div,{"data-autolink-icon":!0})})]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Type:"})," ",e.jsx(i.code,{children:"PurseIdentifier"})]}),`
`]}),`
`,e.jsx(i.p,{children:"Which purse to query."}),`
`,e.jsxs(i.h2,{id:"return-value",children:["Return Value",e.jsx(i.a,{"aria-hidden":"true",tabIndex:"-1",href:"#return-value",children:e.jsx(i.div,{"data-autolink-icon":!0})})]}),`
`,e.jsx(i.p,{children:e.jsx(i.code,{children:"Promise<QueryBalanceResult>"})}),`
`,e.jsxs(i.h2,{id:"related",children:["Related",e.jsx(i.a,{"aria-hidden":"true",tabIndex:"-1",href:"#related",children:e.jsx(i.div,{"data-autolink-icon":!0})})]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:e.jsx(i.a,{href:"/actions/balance/queryLatestBalance",children:e.jsx(i.code,{children:"queryLatestBalance"})})}),`
`,e.jsx(i.li,{children:e.jsx(i.a,{href:"/actions/balance/queryBalanceByBlockHash",children:e.jsx(i.code,{children:"queryBalanceByBlockHash"})})}),`
`]})]})}function d(s={}){const{wrapper:i}={...r(),...s.components};return i?e.jsx(i,{...s,children:e.jsx(n,{...s})}):n(s)}export{d as default,l as frontmatter};
