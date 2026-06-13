import{r as o,R,j as l,P as g,G as j,A as v,C as k,i as _}from"./index-BiXwOB6p.js";/**
 * @license lucide-react v0.510.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N=t=>t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),H=t=>t.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,n,r)=>r?r.toUpperCase():n.toLowerCase()),A=t=>{const e=H(t);return e.charAt(0).toUpperCase()+e.slice(1)},w=(...t)=>t.filter((e,n,r)=>!!e&&e.trim()!==""&&r.indexOf(e)===n).join(" ").trim(),M=t=>{for(const e in t)if(e.startsWith("aria-")||e==="role"||e==="title")return!0};/**
 * @license lucide-react v0.510.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var P={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.510.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $=o.forwardRef(({color:t="currentColor",size:e=24,strokeWidth:n=2,absoluteStrokeWidth:r,className:s="",children:a,iconNode:d,...i},u)=>o.createElement("svg",{ref:u,...P,width:e,height:e,stroke:t,strokeWidth:r?Number(n)*24/Number(e):n,className:w("lucide",s),...!a&&!M(i)&&{"aria-hidden":"true"},...i},[...d.map(([c,f])=>o.createElement(c,f)),...Array.isArray(a)?a:[a]]));/**
 * @license lucide-react v0.510.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const J=(t,e)=>{const n=o.forwardRef(({className:r,...s},a)=>o.createElement($,{ref:a,iconNode:e,className:w(`lucide-${N(A(t))}`,`lucide-${t}`,r),...s}));return n.displayName=A(t),n};var m=!1;function F(){const[t,e]=o.useState(m);return o.useEffect(()=>{m||(m=!0,e(!0))},[]),t}var x=R[" useSyncExternalStore ".trim().toString()];function B(){return()=>{}}function T(){return x(B,()=>!0,()=>!1)}var U=typeof x=="function"?T:F,p="Avatar",[W]=k(p),[G,C]=W(p),L=o.forwardRef((t,e)=>{const{__scopeAvatar:n,...r}=t,[s,a]=o.useState("idle");return l.jsx(G,{scope:n,imageLoadingStatus:s,onImageLoadingStatusChange:a,children:l.jsx(g.span,{...r,ref:e})})});L.displayName=p;var S="AvatarImage",y=o.forwardRef((t,e)=>{const{__scopeAvatar:n,src:r,onLoadingStatusChange:s=()=>{},...a}=t,d=C(S,n),i=K(r,a),u=j(c=>{s(c),d.onImageLoadingStatusChange(c)});return v(()=>{i!=="idle"&&u(i)},[i,u]),i==="loaded"?l.jsx(g.img,{...a,ref:e,src:r}):null});y.displayName=S;var E="AvatarFallback",b=o.forwardRef((t,e)=>{const{__scopeAvatar:n,delayMs:r,...s}=t,a=C(E,n),[d,i]=o.useState(r===void 0);return o.useEffect(()=>{if(r!==void 0){const u=window.setTimeout(()=>i(!0),r);return()=>window.clearTimeout(u)}},[r]),d&&a.imageLoadingStatus!=="loaded"?l.jsx(g.span,{...s,ref:e}):null});b.displayName=E;function h(t,e){return t?e?(t.src!==e&&(t.src=e),t.complete&&t.naturalWidth>0?"loaded":"loading"):"error":"idle"}function K(t,{referrerPolicy:e,crossOrigin:n}){const r=U(),s=o.useRef(null),a=r?(s.current||(s.current=new window.Image),s.current):null,[d,i]=o.useState(()=>h(a,t));return v(()=>{i(h(a,t))},[a,t]),v(()=>{const u=I=>()=>{i(I)};if(!a)return;const c=u("loaded"),f=u("error");return a.addEventListener("load",c),a.addEventListener("error",f),e&&(a.referrerPolicy=e),typeof n=="string"&&(a.crossOrigin=n),()=>{a.removeEventListener("load",c),a.removeEventListener("error",f)}},[a,n,e]),d}var Z=L,q=y,V=b;const z={sm:"h-8 w-8 text-xs",md:"h-10 w-10 text-sm",lg:"h-12 w-12 text-base",xl:"h-16 w-16 text-lg"};function O({src:t,alt:e="",size:n="md",className:r,...s}){var a;return l.jsxs(Z,{className:_("relative inline-flex shrink-0 overflow-hidden rounded-full",z[n],r),...s,children:[l.jsx(q,{src:t??void 0,alt:e,className:"aspect-square h-full w-full object-cover"}),l.jsx(V,{className:"flex h-full w-full items-center justify-center bg-brand-700 text-white font-medium",children:((a=e==null?void 0:e[0])==null?void 0:a.toUpperCase())??"?"})]})}export{O as A,J as c};
