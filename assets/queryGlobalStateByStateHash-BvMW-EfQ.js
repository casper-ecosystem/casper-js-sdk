import{u as i,j as s}from"./index-CnH0nEw-.js";const n={title:"queryGlobalStateByStateHash",description:"undefined"};function r(a){const e={a:"a",code:"code",div:"div",h1:"h1",h2:"h2",h3:"h3",header:"header",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...i(),...a.components};return s.jsxs(s.Fragment,{children:[s.jsx(e.header,{children:s.jsxs(e.h1,{id:"queryglobalstatebystatehash",children:["queryGlobalStateByStateHash",s.jsx(e.a,{"aria-hidden":"true",tabIndex:"-1",href:"#queryglobalstatebystatehash",children:s.jsx(e.div,{"data-autolink-icon":!0})})]})}),`
`,s.jsx(e.p,{children:"Queries a value from global state at a specific state root hash."}),`
`,s.jsxs(e.h2,{id:"import",children:["Import",s.jsx(e.a,{"aria-hidden":"true",tabIndex:"-1",href:"#import",children:s.jsx(e.div,{"data-autolink-icon":!0})})]}),`
`,s.jsx(s.Fragment,{children:s.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark-dimmed",style:{backgroundColor:"#fff","--shiki-dark-bg":"#22272e",color:"#24292e","--shiki-dark":"#adbac7"},tabIndex:"0",children:s.jsx(e.code,{children:s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"import"}),s.jsx(e.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:" { RpcClient, HttpHandler } "}),s.jsx(e.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"from"}),s.jsx(e.span,{style:{color:"#032F62","--shiki-dark":"#96D0FF"},children:" 'casper-js-sdk'"}),s.jsx(e.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:";"})]})})})}),`
`,s.jsxs(e.h2,{id:"usage",children:["Usage",s.jsx(e.a,{"aria-hidden":"true",tabIndex:"-1",href:"#usage",children:s.jsx(e.div,{"data-autolink-icon":!0})})]}),`
`,s.jsx(s.Fragment,{children:s.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark-dimmed",style:{backgroundColor:"#fff","--shiki-dark-bg":"#22272e",color:"#24292e","--shiki-dark":"#adbac7"},tabIndex:"0",children:s.jsxs(e.code,{children:[s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"const"}),s.jsx(e.span,{style:{color:"#005CC5","--shiki-dark":"#6CB6FF"},children:" result"}),s.jsx(e.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:" ="}),s.jsx(e.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:" await"}),s.jsx(e.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:" rpcClient."}),s.jsx(e.span,{style:{color:"#6F42C1","--shiki-dark":"#DCBDFB"},children:"queryGlobalStateByStateHash"}),s.jsx(e.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"("})]}),`
`,s.jsx(e.span,{className:"line",children:s.jsx(e.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"  stateRootHash,"})}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{color:"#032F62","--shiki-dark":"#96D0FF"},children:"  'hash-contract-abc...'"}),s.jsx(e.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:","})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"  ["}),s.jsx(e.span,{style:{color:"#032F62","--shiki-dark":"#96D0FF"},children:"'total_supply'"}),s.jsx(e.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"]"})]}),`
`,s.jsx(e.span,{className:"line",children:s.jsx(e.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:");"})}),`
`,s.jsx(e.span,{className:"line","data-empty-line":!0,children:" "}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"const"}),s.jsx(e.span,{style:{color:"#005CC5","--shiki-dark":"#6CB6FF"},children:" clValue"}),s.jsx(e.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:" ="}),s.jsx(e.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:" CLValueParser."}),s.jsx(e.span,{style:{color:"#6F42C1","--shiki-dark":"#DCBDFB"},children:"fromJSON"}),s.jsx(e.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"(result.storedValue.clValue);"})]})]})})}),`
`,s.jsxs(e.p,{children:["Pass ",s.jsx(e.code,{children:"null"})," to use the latest state root hash automatically."]}),`
`,s.jsx(s.Fragment,{children:s.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark-dimmed",style:{backgroundColor:"#fff","--shiki-dark-bg":"#22272e",color:"#24292e","--shiki-dark":"#adbac7"},tabIndex:"0",children:s.jsxs(e.code,{children:[s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"const"}),s.jsx(e.span,{style:{color:"#005CC5","--shiki-dark":"#6CB6FF"},children:" result"}),s.jsx(e.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:" ="}),s.jsx(e.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:" await"}),s.jsx(e.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:" rpcClient."}),s.jsx(e.span,{style:{color:"#6F42C1","--shiki-dark":"#DCBDFB"},children:"queryGlobalStateByStateHash"}),s.jsx(e.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"("})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{color:"#005CC5","--shiki-dark":"#6CB6FF"},children:"  null"}),s.jsx(e.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:","})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{color:"#032F62","--shiki-dark":"#96D0FF"},children:"  'hash-contract-abc...'"}),s.jsx(e.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:","})]}),`
`,s.jsx(e.span,{className:"line",children:s.jsx(e.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"  []"})}),`
`,s.jsx(e.span,{className:"line",children:s.jsx(e.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:");"})})]})})}),`
`,s.jsxs(e.h2,{id:"parameters",children:["Parameters",s.jsx(e.a,{"aria-hidden":"true",tabIndex:"-1",href:"#parameters",children:s.jsx(e.div,{"data-autolink-icon":!0})})]}),`
`,s.jsxs(e.h3,{id:"stateroothash",children:["stateRootHash",s.jsx(e.a,{"aria-hidden":"true",tabIndex:"-1",href:"#stateroothash",children:s.jsx(e.div,{"data-autolink-icon":!0})})]}),`
`,s.jsxs(e.ul,{children:[`
`,s.jsxs(e.li,{children:[s.jsx(e.strong,{children:"Type:"})," ",s.jsx(e.code,{children:"string | null"})]}),`
`]}),`
`,s.jsxs(e.p,{children:["State root hash as a hex string, or ",s.jsx(e.code,{children:"null"})," to query latest state."]}),`
`,s.jsxs(e.h3,{id:"key",children:["key",s.jsx(e.a,{"aria-hidden":"true",tabIndex:"-1",href:"#key",children:s.jsx(e.div,{"data-autolink-icon":!0})})]}),`
`,s.jsxs(e.ul,{children:[`
`,s.jsxs(e.li,{children:[s.jsx(e.strong,{children:"Type:"})," ",s.jsx(e.code,{children:"string"})]}),`
`]}),`
`,s.jsx(e.p,{children:"The global state key to query. Formats:"}),`
`,s.jsxs(e.ul,{children:[`
`,s.jsxs(e.li,{children:[s.jsx(e.code,{children:"hash-{hex}"})," - contract or package hash"]}),`
`,s.jsxs(e.li,{children:[s.jsx(e.code,{children:"account-hash-{hex}"})," - account"]}),`
`,s.jsxs(e.li,{children:[s.jsx(e.code,{children:"uref-{hex}-{octal}"})," - URef"]}),`
`]}),`
`,s.jsxs(e.h3,{id:"path",children:["path",s.jsx(e.a,{"aria-hidden":"true",tabIndex:"-1",href:"#path",children:s.jsx(e.div,{"data-autolink-icon":!0})})]}),`
`,s.jsxs(e.ul,{children:[`
`,s.jsxs(e.li,{children:[s.jsx(e.strong,{children:"Type:"})," ",s.jsx(e.code,{children:"string[]"})]}),`
`]}),`
`,s.jsxs(e.p,{children:["Storage path to traverse from the key. Use ",s.jsx(e.code,{children:"[]"})," for the root value."]}),`
`,s.jsxs(e.h2,{id:"return-value",children:["Return Value",s.jsx(e.a,{"aria-hidden":"true",tabIndex:"-1",href:"#return-value",children:s.jsx(e.div,{"data-autolink-icon":!0})})]}),`
`,s.jsx(e.p,{children:s.jsx(e.code,{children:"Promise<QueryGlobalStateResult>"})}),`
`,s.jsx(s.Fragment,{children:s.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark-dimmed",style:{backgroundColor:"#fff","--shiki-dark-bg":"#22272e",color:"#24292e","--shiki-dark":"#adbac7"},tabIndex:"0",children:s.jsxs(e.code,{children:[s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"interface"}),s.jsx(e.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:" QueryGlobalStateResult"}),s.jsx(e.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:" {"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{color:"#E36209","--shiki-dark":"#F69D50"},children:"  storedValue"}),s.jsx(e.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:":"}),s.jsx(e.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:" StoredValue"}),s.jsx(e.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:";"})]}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{color:"#E36209","--shiki-dark":"#F69D50"},children:"  blockHeader"}),s.jsx(e.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:":"}),s.jsx(e.span,{style:{color:"#6F42C1","--shiki-dark":"#F69D50"},children:" BlockHeader"}),s.jsx(e.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:";"})]}),`
`,s.jsx(e.span,{className:"line",children:s.jsx(e.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"}"})})]})})}),`
`,s.jsxs(e.h2,{id:"related",children:["Related",s.jsx(e.a,{"aria-hidden":"true",tabIndex:"-1",href:"#related",children:s.jsx(e.div,{"data-autolink-icon":!0})})]}),`
`,s.jsxs(e.ul,{children:[`
`,s.jsx(e.li,{children:s.jsx(e.a,{href:"/actions/state/queryLatestGlobalState",children:s.jsx(e.code,{children:"queryLatestGlobalState"})})}),`
`,s.jsx(e.li,{children:s.jsx(e.a,{href:"/actions/state/queryGlobalStateByBlockHash",children:s.jsx(e.code,{children:"queryGlobalStateByBlockHash"})})}),`
`,s.jsx(e.li,{children:s.jsx(e.a,{href:"/actions/state/queryGlobalStateByBlockHeight",children:s.jsx(e.code,{children:"queryGlobalStateByBlockHeight"})})}),`
`,s.jsx(e.li,{children:s.jsx(e.a,{href:"/actions/state/getStateRootHashLatest",children:s.jsx(e.code,{children:"getStateRootHashLatest"})})}),`
`]})]})}function t(a={}){const{wrapper:e}={...i(),...a.components};return e?s.jsx(e,{...a,children:s.jsx(r,{...a})}):r(a)}export{t as default,n as frontmatter};
