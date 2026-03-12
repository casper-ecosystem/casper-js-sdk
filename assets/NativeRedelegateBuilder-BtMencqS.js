import{u as r,j as e}from"./index-nmtYrWOa.js";const l={title:"NativeRedelegateBuilder",description:"undefined"};function n(s){const i={a:"a",code:"code",div:"div",h1:"h1",h2:"h2",h3:"h3",header:"header",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...r(),...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(i.header,{children:e.jsxs(i.h1,{id:"nativeredelegatebuilder",children:["NativeRedelegateBuilder",e.jsx(i.a,{"aria-hidden":"true",tabIndex:"-1",href:"#nativeredelegatebuilder",children:e.jsx(i.div,{"data-autolink-icon":!0})})]})}),`
`,e.jsx(i.p,{children:"Builds a native redelegate transaction to move stake from one validator to another without waiting for the unbonding period."}),`
`,e.jsxs(i.h2,{id:"import",children:["Import",e.jsx(i.a,{"aria-hidden":"true",tabIndex:"-1",href:"#import",children:e.jsx(i.div,{"data-autolink-icon":!0})})]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark-dimmed",style:{backgroundColor:"#fff","--shiki-dark-bg":"#22272e",color:"#24292e","--shiki-dark":"#adbac7"},tabIndex:"0",children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"import"}),e.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:" { NativeRedelegateBuilder, PublicKey } "}),e.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"from"}),e.jsx(i.span,{style:{color:"#032F62","--shiki-dark":"#96D0FF"},children:" 'casper-js-sdk'"}),e.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:";"})]})})})}),`
`,e.jsxs(i.h2,{id:"usage",children:["Usage",e.jsx(i.a,{"aria-hidden":"true",tabIndex:"-1",href:"#usage",children:e.jsx(i.div,{"data-autolink-icon":!0})})]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark-dimmed",style:{backgroundColor:"#fff","--shiki-dark-bg":"#22272e",color:"#24292e","--shiki-dark":"#adbac7"},tabIndex:"0",children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:"const"}),e.jsx(i.span,{style:{color:"#005CC5","--shiki-dark":"#6CB6FF"},children:" transaction"}),e.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:" ="}),e.jsx(i.span,{style:{color:"#D73A49","--shiki-dark":"#F47067"},children:" new"}),e.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#DCBDFB"},children:" NativeRedelegateBuilder"}),e.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"()"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"  ."}),e.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#DCBDFB"},children:"from"}),e.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"(delegatorPublicKey)"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"  ."}),e.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#DCBDFB"},children:"validator"}),e.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"(currentValidatorPublicKey)"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"  ."}),e.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#DCBDFB"},children:"newValidator"}),e.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"(newValidatorPublicKey)"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"  ."}),e.jsx(i.span,{style:{color:"#6F42C1","--shiki-dark":"#DCBDFB"},children:"amount"}),e.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:"("}),e.jsx(i.span,{style:{color:"#032F62","--shiki-dark":"#96D0FF"},children:"'500000000000'"}),e.jsx(i.span,{style:{color:"#24292E","--shiki-dark":"#ADBAC7"},children:")"})]}),`
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
`,e.jsxs(i.h3,{id:"validatorpublickey",children:[".validator(publicKey)",e.jsx(i.a,{"aria-hidden":"true",tabIndex:"-1",href:"#validatorpublickey",children:e.jsx(i.div,{"data-autolink-icon":!0})})]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Type:"})," ",e.jsx(i.code,{children:"PublicKey"})," - required"]}),`
`]}),`
`,e.jsx(i.p,{children:"The current validator to move stake away from."}),`
`,e.jsxs(i.h3,{id:"newvalidatorpublickey",children:[".newValidator(publicKey)",e.jsx(i.a,{"aria-hidden":"true",tabIndex:"-1",href:"#newvalidatorpublickey",children:e.jsx(i.div,{"data-autolink-icon":!0})})]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Type:"})," ",e.jsx(i.code,{children:"PublicKey"})," - required"]}),`
`]}),`
`,e.jsx(i.p,{children:"The new validator to move stake to."}),`
`,e.jsxs(i.h3,{id:"amountmotes",children:[".amount(motes)",e.jsx(i.a,{"aria-hidden":"true",tabIndex:"-1",href:"#amountmotes",children:e.jsx(i.div,{"data-autolink-icon":!0})})]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Type:"})," ",e.jsx(i.code,{children:"BigNumber | string"})," - required"]}),`
`]}),`
`,e.jsxs(i.h3,{id:"chainnamename",children:[".chainName(name)",e.jsx(i.a,{"aria-hidden":"true",tabIndex:"-1",href:"#chainnamename",children:e.jsx(i.div,{"data-autolink-icon":!0})})]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Type:"})," ",e.jsx(i.code,{children:"string"})," - required"]}),`
`]}),`
`,e.jsxs(i.h2,{id:"notes",children:["Notes",e.jsx(i.a,{"aria-hidden":"true",tabIndex:"-1",href:"#notes",children:e.jsx(i.div,{"data-autolink-icon":!0})})]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Redelegation avoids the 7-era unbonding period (~14 hours) that would apply to undelegating and re-delegating separately."}),`
`]}),`
`,e.jsxs(i.h2,{id:"related",children:["Related",e.jsx(i.a,{"aria-hidden":"true",tabIndex:"-1",href:"#related",children:e.jsx(i.div,{"data-autolink-icon":!0})})]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:e.jsx(i.a,{href:"/builders/NativeDelegateBuilder",children:e.jsx(i.code,{children:"NativeDelegateBuilder"})})}),`
`,e.jsx(i.li,{children:e.jsx(i.a,{href:"/builders/NativeUndelegateBuilder",children:e.jsx(i.code,{children:"NativeUndelegateBuilder"})})}),`
`]})]})}function d(s={}){const{wrapper:i}={...r(),...s.components};return i?e.jsx(i,{...s,children:e.jsx(n,{...s})}):n(s)}export{d as default,l as frontmatter};
