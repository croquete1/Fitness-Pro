const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./Login-DQaToyyA.js","./text-BCtmYr87.js","./stack-CMcmAi-G.js","./Register-NM_kihwG.js","./DashboardCliente-D8uyIdCr.js","./firebaseHelpers-ChKkbBAe.js","./DashboardTrainer-BUZkJJLM.js","./DashboardAdmin-BYUC2Lcm.js"])))=>i.map(i=>d[i]);
function Pw(r,e){for(var t=0;t<e.length;t++){const s=e[t];if(typeof s!="string"&&!Array.isArray(s)){for(const o in s)if(o!=="default"&&!(o in r)){const l=Object.getOwnPropertyDescriptor(s,o);l&&Object.defineProperty(r,o,l.get?l:{enumerable:!0,get:()=>s[o]})}}}return Object.freeze(Object.defineProperty(r,Symbol.toStringTag,{value:"Module"}))}(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))s(o);new MutationObserver(o=>{for(const l of o)if(l.type==="childList")for(const h of l.addedNodes)h.tagName==="LINK"&&h.rel==="modulepreload"&&s(h)}).observe(document,{childList:!0,subtree:!0});function t(o){const l={};return o.integrity&&(l.integrity=o.integrity),o.referrerPolicy&&(l.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?l.credentials="include":o.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function s(o){if(o.ep)return;o.ep=!0;const l=t(o);fetch(o.href,l)}})();var fP=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};function jy(r){return r&&r.__esModule&&Object.prototype.hasOwnProperty.call(r,"default")?r.default:r}var rd={exports:{}},Pa={},id={exports:{}},Ae={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Xm;function kw(){if(Xm)return Ae;Xm=1;var r=Symbol.for("react.element"),e=Symbol.for("react.portal"),t=Symbol.for("react.fragment"),s=Symbol.for("react.strict_mode"),o=Symbol.for("react.profiler"),l=Symbol.for("react.provider"),h=Symbol.for("react.context"),f=Symbol.for("react.forward_ref"),g=Symbol.for("react.suspense"),_=Symbol.for("react.memo"),E=Symbol.for("react.lazy"),T=Symbol.iterator;function R(V){return V===null||typeof V!="object"?null:(V=T&&V[T]||V["@@iterator"],typeof V=="function"?V:null)}var j={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},B=Object.assign,$={};function F(V,H,he){this.props=V,this.context=H,this.refs=$,this.updater=he||j}F.prototype.isReactComponent={},F.prototype.setState=function(V,H){if(typeof V!="object"&&typeof V!="function"&&V!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,V,H,"setState")},F.prototype.forceUpdate=function(V){this.updater.enqueueForceUpdate(this,V,"forceUpdate")};function ae(){}ae.prototype=F.prototype;function re(V,H,he){this.props=V,this.context=H,this.refs=$,this.updater=he||j}var ie=re.prototype=new ae;ie.constructor=re,B(ie,F.prototype),ie.isPureReactComponent=!0;var ge=Array.isArray,Le=Object.prototype.hasOwnProperty,Re={current:null},D={key:!0,ref:!0,__self:!0,__source:!0};function S(V,H,he){var Te,Se={},Ne=null,Me=null;if(H!=null)for(Te in H.ref!==void 0&&(Me=H.ref),H.key!==void 0&&(Ne=""+H.key),H)Le.call(H,Te)&&!D.hasOwnProperty(Te)&&(Se[Te]=H[Te]);var be=arguments.length-2;if(be===1)Se.children=he;else if(1<be){for(var Be=Array(be),_t=0;_t<be;_t++)Be[_t]=arguments[_t+2];Se.children=Be}if(V&&V.defaultProps)for(Te in be=V.defaultProps,be)Se[Te]===void 0&&(Se[Te]=be[Te]);return{$$typeof:r,type:V,key:Ne,ref:Me,props:Se,_owner:Re.current}}function C(V,H){return{$$typeof:r,type:V.type,key:H,ref:V.ref,props:V.props,_owner:V._owner}}function k(V){return typeof V=="object"&&V!==null&&V.$$typeof===r}function O(V){var H={"=":"=0",":":"=2"};return"$"+V.replace(/[=:]/g,function(he){return H[he]})}var x=/\/+/g;function A(V,H){return typeof V=="object"&&V!==null&&V.key!=null?O(""+V.key):H.toString(36)}function tt(V,H,he,Te,Se){var Ne=typeof V;(Ne==="undefined"||Ne==="boolean")&&(V=null);var Me=!1;if(V===null)Me=!0;else switch(Ne){case"string":case"number":Me=!0;break;case"object":switch(V.$$typeof){case r:case e:Me=!0}}if(Me)return Me=V,Se=Se(Me),V=Te===""?"."+A(Me,0):Te,ge(Se)?(he="",V!=null&&(he=V.replace(x,"$&/")+"/"),tt(Se,H,he,"",function(_t){return _t})):Se!=null&&(k(Se)&&(Se=C(Se,he+(!Se.key||Me&&Me.key===Se.key?"":(""+Se.key).replace(x,"$&/")+"/")+V)),H.push(Se)),1;if(Me=0,Te=Te===""?".":Te+":",ge(V))for(var be=0;be<V.length;be++){Ne=V[be];var Be=Te+A(Ne,be);Me+=tt(Ne,H,he,Be,Se)}else if(Be=R(V),typeof Be=="function")for(V=Be.call(V),be=0;!(Ne=V.next()).done;)Ne=Ne.value,Be=Te+A(Ne,be++),Me+=tt(Ne,H,he,Be,Se);else if(Ne==="object")throw H=String(V),Error("Objects are not valid as a React child (found: "+(H==="[object Object]"?"object with keys {"+Object.keys(V).join(", ")+"}":H)+"). If you meant to render a collection of children, use an array instead.");return Me}function Ot(V,H,he){if(V==null)return V;var Te=[],Se=0;return tt(V,Te,"","",function(Ne){return H.call(he,Ne,Se++)}),Te}function Vt(V){if(V._status===-1){var H=V._result;H=H(),H.then(function(he){(V._status===0||V._status===-1)&&(V._status=1,V._result=he)},function(he){(V._status===0||V._status===-1)&&(V._status=2,V._result=he)}),V._status===-1&&(V._status=0,V._result=H)}if(V._status===1)return V._result.default;throw V._result}var je={current:null},Z={transition:null},de={ReactCurrentDispatcher:je,ReactCurrentBatchConfig:Z,ReactCurrentOwner:Re};function ne(){throw Error("act(...) is not supported in production builds of React.")}return Ae.Children={map:Ot,forEach:function(V,H,he){Ot(V,function(){H.apply(this,arguments)},he)},count:function(V){var H=0;return Ot(V,function(){H++}),H},toArray:function(V){return Ot(V,function(H){return H})||[]},only:function(V){if(!k(V))throw Error("React.Children.only expected to receive a single React element child.");return V}},Ae.Component=F,Ae.Fragment=t,Ae.Profiler=o,Ae.PureComponent=re,Ae.StrictMode=s,Ae.Suspense=g,Ae.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=de,Ae.act=ne,Ae.cloneElement=function(V,H,he){if(V==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+V+".");var Te=B({},V.props),Se=V.key,Ne=V.ref,Me=V._owner;if(H!=null){if(H.ref!==void 0&&(Ne=H.ref,Me=Re.current),H.key!==void 0&&(Se=""+H.key),V.type&&V.type.defaultProps)var be=V.type.defaultProps;for(Be in H)Le.call(H,Be)&&!D.hasOwnProperty(Be)&&(Te[Be]=H[Be]===void 0&&be!==void 0?be[Be]:H[Be])}var Be=arguments.length-2;if(Be===1)Te.children=he;else if(1<Be){be=Array(Be);for(var _t=0;_t<Be;_t++)be[_t]=arguments[_t+2];Te.children=be}return{$$typeof:r,type:V.type,key:Se,ref:Ne,props:Te,_owner:Me}},Ae.createContext=function(V){return V={$$typeof:h,_currentValue:V,_currentValue2:V,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},V.Provider={$$typeof:l,_context:V},V.Consumer=V},Ae.createElement=S,Ae.createFactory=function(V){var H=S.bind(null,V);return H.type=V,H},Ae.createRef=function(){return{current:null}},Ae.forwardRef=function(V){return{$$typeof:f,render:V}},Ae.isValidElement=k,Ae.lazy=function(V){return{$$typeof:E,_payload:{_status:-1,_result:V},_init:Vt}},Ae.memo=function(V,H){return{$$typeof:_,type:V,compare:H===void 0?null:H}},Ae.startTransition=function(V){var H=Z.transition;Z.transition={};try{V()}finally{Z.transition=H}},Ae.unstable_act=ne,Ae.useCallback=function(V,H){return je.current.useCallback(V,H)},Ae.useContext=function(V){return je.current.useContext(V)},Ae.useDebugValue=function(){},Ae.useDeferredValue=function(V){return je.current.useDeferredValue(V)},Ae.useEffect=function(V,H){return je.current.useEffect(V,H)},Ae.useId=function(){return je.current.useId()},Ae.useImperativeHandle=function(V,H,he){return je.current.useImperativeHandle(V,H,he)},Ae.useInsertionEffect=function(V,H){return je.current.useInsertionEffect(V,H)},Ae.useLayoutEffect=function(V,H){return je.current.useLayoutEffect(V,H)},Ae.useMemo=function(V,H){return je.current.useMemo(V,H)},Ae.useReducer=function(V,H,he){return je.current.useReducer(V,H,he)},Ae.useRef=function(V){return je.current.useRef(V)},Ae.useState=function(V){return je.current.useState(V)},Ae.useSyncExternalStore=function(V,H,he){return je.current.useSyncExternalStore(V,H,he)},Ae.useTransition=function(){return je.current.useTransition()},Ae.version="18.3.1",Ae}var Jm;function Qd(){return Jm||(Jm=1,id.exports=kw()),id.exports}/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Ym;function Nw(){if(Ym)return Pa;Ym=1;var r=Qd(),e=Symbol.for("react.element"),t=Symbol.for("react.fragment"),s=Object.prototype.hasOwnProperty,o=r.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,l={key:!0,ref:!0,__self:!0,__source:!0};function h(f,g,_){var E,T={},R=null,j=null;_!==void 0&&(R=""+_),g.key!==void 0&&(R=""+g.key),g.ref!==void 0&&(j=g.ref);for(E in g)s.call(g,E)&&!l.hasOwnProperty(E)&&(T[E]=g[E]);if(f&&f.defaultProps)for(E in g=f.defaultProps,g)T[E]===void 0&&(T[E]=g[E]);return{$$typeof:e,type:f,key:R,ref:j,props:T,_owner:o.current}}return Pa.Fragment=t,Pa.jsx=h,Pa.jsxs=h,Pa}var Zm;function Dw(){return Zm||(Zm=1,rd.exports=Nw()),rd.exports}var ut=Dw(),Y=Qd();const zy=jy(Y),Ow=Pw({__proto__:null,default:zy},[Y]);var Nu={},sd={exports:{}},Zt={},od={exports:{}},ad={};/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var eg;function Vw(){return eg||(eg=1,function(r){function e(Z,de){var ne=Z.length;Z.push(de);e:for(;0<ne;){var V=ne-1>>>1,H=Z[V];if(0<o(H,de))Z[V]=de,Z[ne]=H,ne=V;else break e}}function t(Z){return Z.length===0?null:Z[0]}function s(Z){if(Z.length===0)return null;var de=Z[0],ne=Z.pop();if(ne!==de){Z[0]=ne;e:for(var V=0,H=Z.length,he=H>>>1;V<he;){var Te=2*(V+1)-1,Se=Z[Te],Ne=Te+1,Me=Z[Ne];if(0>o(Se,ne))Ne<H&&0>o(Me,Se)?(Z[V]=Me,Z[Ne]=ne,V=Ne):(Z[V]=Se,Z[Te]=ne,V=Te);else if(Ne<H&&0>o(Me,ne))Z[V]=Me,Z[Ne]=ne,V=Ne;else break e}}return de}function o(Z,de){var ne=Z.sortIndex-de.sortIndex;return ne!==0?ne:Z.id-de.id}if(typeof performance=="object"&&typeof performance.now=="function"){var l=performance;r.unstable_now=function(){return l.now()}}else{var h=Date,f=h.now();r.unstable_now=function(){return h.now()-f}}var g=[],_=[],E=1,T=null,R=3,j=!1,B=!1,$=!1,F=typeof setTimeout=="function"?setTimeout:null,ae=typeof clearTimeout=="function"?clearTimeout:null,re=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function ie(Z){for(var de=t(_);de!==null;){if(de.callback===null)s(_);else if(de.startTime<=Z)s(_),de.sortIndex=de.expirationTime,e(g,de);else break;de=t(_)}}function ge(Z){if($=!1,ie(Z),!B)if(t(g)!==null)B=!0,Vt(Le);else{var de=t(_);de!==null&&je(ge,de.startTime-Z)}}function Le(Z,de){B=!1,$&&($=!1,ae(S),S=-1),j=!0;var ne=R;try{for(ie(de),T=t(g);T!==null&&(!(T.expirationTime>de)||Z&&!O());){var V=T.callback;if(typeof V=="function"){T.callback=null,R=T.priorityLevel;var H=V(T.expirationTime<=de);de=r.unstable_now(),typeof H=="function"?T.callback=H:T===t(g)&&s(g),ie(de)}else s(g);T=t(g)}if(T!==null)var he=!0;else{var Te=t(_);Te!==null&&je(ge,Te.startTime-de),he=!1}return he}finally{T=null,R=ne,j=!1}}var Re=!1,D=null,S=-1,C=5,k=-1;function O(){return!(r.unstable_now()-k<C)}function x(){if(D!==null){var Z=r.unstable_now();k=Z;var de=!0;try{de=D(!0,Z)}finally{de?A():(Re=!1,D=null)}}else Re=!1}var A;if(typeof re=="function")A=function(){re(x)};else if(typeof MessageChannel<"u"){var tt=new MessageChannel,Ot=tt.port2;tt.port1.onmessage=x,A=function(){Ot.postMessage(null)}}else A=function(){F(x,0)};function Vt(Z){D=Z,Re||(Re=!0,A())}function je(Z,de){S=F(function(){Z(r.unstable_now())},de)}r.unstable_IdlePriority=5,r.unstable_ImmediatePriority=1,r.unstable_LowPriority=4,r.unstable_NormalPriority=3,r.unstable_Profiling=null,r.unstable_UserBlockingPriority=2,r.unstable_cancelCallback=function(Z){Z.callback=null},r.unstable_continueExecution=function(){B||j||(B=!0,Vt(Le))},r.unstable_forceFrameRate=function(Z){0>Z||125<Z?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):C=0<Z?Math.floor(1e3/Z):5},r.unstable_getCurrentPriorityLevel=function(){return R},r.unstable_getFirstCallbackNode=function(){return t(g)},r.unstable_next=function(Z){switch(R){case 1:case 2:case 3:var de=3;break;default:de=R}var ne=R;R=de;try{return Z()}finally{R=ne}},r.unstable_pauseExecution=function(){},r.unstable_requestPaint=function(){},r.unstable_runWithPriority=function(Z,de){switch(Z){case 1:case 2:case 3:case 4:case 5:break;default:Z=3}var ne=R;R=Z;try{return de()}finally{R=ne}},r.unstable_scheduleCallback=function(Z,de,ne){var V=r.unstable_now();switch(typeof ne=="object"&&ne!==null?(ne=ne.delay,ne=typeof ne=="number"&&0<ne?V+ne:V):ne=V,Z){case 1:var H=-1;break;case 2:H=250;break;case 5:H=1073741823;break;case 4:H=1e4;break;default:H=5e3}return H=ne+H,Z={id:E++,callback:de,priorityLevel:Z,startTime:ne,expirationTime:H,sortIndex:-1},ne>V?(Z.sortIndex=ne,e(_,Z),t(g)===null&&Z===t(_)&&($?(ae(S),S=-1):$=!0,je(ge,ne-V))):(Z.sortIndex=H,e(g,Z),B||j||(B=!0,Vt(Le))),Z},r.unstable_shouldYield=O,r.unstable_wrapCallback=function(Z){var de=R;return function(){var ne=R;R=de;try{return Z.apply(this,arguments)}finally{R=ne}}}}(ad)),ad}var tg;function xw(){return tg||(tg=1,od.exports=Vw()),od.exports}/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var ng;function Lw(){if(ng)return Zt;ng=1;var r=Qd(),e=xw();function t(n){for(var i="https://reactjs.org/docs/error-decoder.html?invariant="+n,a=1;a<arguments.length;a++)i+="&args[]="+encodeURIComponent(arguments[a]);return"Minified React error #"+n+"; visit "+i+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var s=new Set,o={};function l(n,i){h(n,i),h(n+"Capture",i)}function h(n,i){for(o[n]=i,n=0;n<i.length;n++)s.add(i[n])}var f=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),g=Object.prototype.hasOwnProperty,_=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,E={},T={};function R(n){return g.call(T,n)?!0:g.call(E,n)?!1:_.test(n)?T[n]=!0:(E[n]=!0,!1)}function j(n,i,a,c){if(a!==null&&a.type===0)return!1;switch(typeof i){case"function":case"symbol":return!0;case"boolean":return c?!1:a!==null?!a.acceptsBooleans:(n=n.toLowerCase().slice(0,5),n!=="data-"&&n!=="aria-");default:return!1}}function B(n,i,a,c){if(i===null||typeof i>"u"||j(n,i,a,c))return!0;if(c)return!1;if(a!==null)switch(a.type){case 3:return!i;case 4:return i===!1;case 5:return isNaN(i);case 6:return isNaN(i)||1>i}return!1}function $(n,i,a,c,d,m,v){this.acceptsBooleans=i===2||i===3||i===4,this.attributeName=c,this.attributeNamespace=d,this.mustUseProperty=a,this.propertyName=n,this.type=i,this.sanitizeURL=m,this.removeEmptyString=v}var F={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(n){F[n]=new $(n,0,!1,n,null,!1,!1)}),[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(n){var i=n[0];F[i]=new $(i,1,!1,n[1],null,!1,!1)}),["contentEditable","draggable","spellCheck","value"].forEach(function(n){F[n]=new $(n,2,!1,n.toLowerCase(),null,!1,!1)}),["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(n){F[n]=new $(n,2,!1,n,null,!1,!1)}),"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(n){F[n]=new $(n,3,!1,n.toLowerCase(),null,!1,!1)}),["checked","multiple","muted","selected"].forEach(function(n){F[n]=new $(n,3,!0,n,null,!1,!1)}),["capture","download"].forEach(function(n){F[n]=new $(n,4,!1,n,null,!1,!1)}),["cols","rows","size","span"].forEach(function(n){F[n]=new $(n,6,!1,n,null,!1,!1)}),["rowSpan","start"].forEach(function(n){F[n]=new $(n,5,!1,n.toLowerCase(),null,!1,!1)});var ae=/[\-:]([a-z])/g;function re(n){return n[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(n){var i=n.replace(ae,re);F[i]=new $(i,1,!1,n,null,!1,!1)}),"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(n){var i=n.replace(ae,re);F[i]=new $(i,1,!1,n,"http://www.w3.org/1999/xlink",!1,!1)}),["xml:base","xml:lang","xml:space"].forEach(function(n){var i=n.replace(ae,re);F[i]=new $(i,1,!1,n,"http://www.w3.org/XML/1998/namespace",!1,!1)}),["tabIndex","crossOrigin"].forEach(function(n){F[n]=new $(n,1,!1,n.toLowerCase(),null,!1,!1)}),F.xlinkHref=new $("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1),["src","href","action","formAction"].forEach(function(n){F[n]=new $(n,1,!1,n.toLowerCase(),null,!0,!0)});function ie(n,i,a,c){var d=F.hasOwnProperty(i)?F[i]:null;(d!==null?d.type!==0:c||!(2<i.length)||i[0]!=="o"&&i[0]!=="O"||i[1]!=="n"&&i[1]!=="N")&&(B(i,a,d,c)&&(a=null),c||d===null?R(i)&&(a===null?n.removeAttribute(i):n.setAttribute(i,""+a)):d.mustUseProperty?n[d.propertyName]=a===null?d.type===3?!1:"":a:(i=d.attributeName,c=d.attributeNamespace,a===null?n.removeAttribute(i):(d=d.type,a=d===3||d===4&&a===!0?"":""+a,c?n.setAttributeNS(c,i,a):n.setAttribute(i,a))))}var ge=r.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,Le=Symbol.for("react.element"),Re=Symbol.for("react.portal"),D=Symbol.for("react.fragment"),S=Symbol.for("react.strict_mode"),C=Symbol.for("react.profiler"),k=Symbol.for("react.provider"),O=Symbol.for("react.context"),x=Symbol.for("react.forward_ref"),A=Symbol.for("react.suspense"),tt=Symbol.for("react.suspense_list"),Ot=Symbol.for("react.memo"),Vt=Symbol.for("react.lazy"),je=Symbol.for("react.offscreen"),Z=Symbol.iterator;function de(n){return n===null||typeof n!="object"?null:(n=Z&&n[Z]||n["@@iterator"],typeof n=="function"?n:null)}var ne=Object.assign,V;function H(n){if(V===void 0)try{throw Error()}catch(a){var i=a.stack.trim().match(/\n( *(at )?)/);V=i&&i[1]||""}return`
`+V+n}var he=!1;function Te(n,i){if(!n||he)return"";he=!0;var a=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(i)if(i=function(){throw Error()},Object.defineProperty(i.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(i,[])}catch(U){var c=U}Reflect.construct(n,[],i)}else{try{i.call()}catch(U){c=U}n.call(i.prototype)}else{try{throw Error()}catch(U){c=U}n()}}catch(U){if(U&&c&&typeof U.stack=="string"){for(var d=U.stack.split(`
`),m=c.stack.split(`
`),v=d.length-1,I=m.length-1;1<=v&&0<=I&&d[v]!==m[I];)I--;for(;1<=v&&0<=I;v--,I--)if(d[v]!==m[I]){if(v!==1||I!==1)do if(v--,I--,0>I||d[v]!==m[I]){var P=`
`+d[v].replace(" at new "," at ");return n.displayName&&P.includes("<anonymous>")&&(P=P.replace("<anonymous>",n.displayName)),P}while(1<=v&&0<=I);break}}}finally{he=!1,Error.prepareStackTrace=a}return(n=n?n.displayName||n.name:"")?H(n):""}function Se(n){switch(n.tag){case 5:return H(n.type);case 16:return H("Lazy");case 13:return H("Suspense");case 19:return H("SuspenseList");case 0:case 2:case 15:return n=Te(n.type,!1),n;case 11:return n=Te(n.type.render,!1),n;case 1:return n=Te(n.type,!0),n;default:return""}}function Ne(n){if(n==null)return null;if(typeof n=="function")return n.displayName||n.name||null;if(typeof n=="string")return n;switch(n){case D:return"Fragment";case Re:return"Portal";case C:return"Profiler";case S:return"StrictMode";case A:return"Suspense";case tt:return"SuspenseList"}if(typeof n=="object")switch(n.$$typeof){case O:return(n.displayName||"Context")+".Consumer";case k:return(n._context.displayName||"Context")+".Provider";case x:var i=n.render;return n=n.displayName,n||(n=i.displayName||i.name||"",n=n!==""?"ForwardRef("+n+")":"ForwardRef"),n;case Ot:return i=n.displayName||null,i!==null?i:Ne(n.type)||"Memo";case Vt:i=n._payload,n=n._init;try{return Ne(n(i))}catch{}}return null}function Me(n){var i=n.type;switch(n.tag){case 24:return"Cache";case 9:return(i.displayName||"Context")+".Consumer";case 10:return(i._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return n=i.render,n=n.displayName||n.name||"",i.displayName||(n!==""?"ForwardRef("+n+")":"ForwardRef");case 7:return"Fragment";case 5:return i;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return Ne(i);case 8:return i===S?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof i=="function")return i.displayName||i.name||null;if(typeof i=="string")return i}return null}function be(n){switch(typeof n){case"boolean":case"number":case"string":case"undefined":return n;case"object":return n;default:return""}}function Be(n){var i=n.type;return(n=n.nodeName)&&n.toLowerCase()==="input"&&(i==="checkbox"||i==="radio")}function _t(n){var i=Be(n)?"checked":"value",a=Object.getOwnPropertyDescriptor(n.constructor.prototype,i),c=""+n[i];if(!n.hasOwnProperty(i)&&typeof a<"u"&&typeof a.get=="function"&&typeof a.set=="function"){var d=a.get,m=a.set;return Object.defineProperty(n,i,{configurable:!0,get:function(){return d.call(this)},set:function(v){c=""+v,m.call(this,v)}}),Object.defineProperty(n,i,{enumerable:a.enumerable}),{getValue:function(){return c},setValue:function(v){c=""+v},stopTracking:function(){n._valueTracker=null,delete n[i]}}}}function ar(n){n._valueTracker||(n._valueTracker=_t(n))}function ys(n){if(!n)return!1;var i=n._valueTracker;if(!i)return!0;var a=i.getValue(),c="";return n&&(c=Be(n)?n.checked?"true":"false":n.value),n=c,n!==a?(i.setValue(n),!0):!1}function xr(n){if(n=n||(typeof document<"u"?document:void 0),typeof n>"u")return null;try{return n.activeElement||n.body}catch{return n.body}}function ki(n,i){var a=i.checked;return ne({},i,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:a??n._wrapperState.initialChecked})}function _s(n,i){var a=i.defaultValue==null?"":i.defaultValue,c=i.checked!=null?i.checked:i.defaultChecked;a=be(i.value!=null?i.value:a),n._wrapperState={initialChecked:c,initialValue:a,controlled:i.type==="checkbox"||i.type==="radio"?i.checked!=null:i.value!=null}}function xo(n,i){i=i.checked,i!=null&&ie(n,"checked",i,!1)}function Lo(n,i){xo(n,i);var a=be(i.value),c=i.type;if(a!=null)c==="number"?(a===0&&n.value===""||n.value!=a)&&(n.value=""+a):n.value!==""+a&&(n.value=""+a);else if(c==="submit"||c==="reset"){n.removeAttribute("value");return}i.hasOwnProperty("value")?vs(n,i.type,a):i.hasOwnProperty("defaultValue")&&vs(n,i.type,be(i.defaultValue)),i.checked==null&&i.defaultChecked!=null&&(n.defaultChecked=!!i.defaultChecked)}function ml(n,i,a){if(i.hasOwnProperty("value")||i.hasOwnProperty("defaultValue")){var c=i.type;if(!(c!=="submit"&&c!=="reset"||i.value!==void 0&&i.value!==null))return;i=""+n._wrapperState.initialValue,a||i===n.value||(n.value=i),n.defaultValue=i}a=n.name,a!==""&&(n.name=""),n.defaultChecked=!!n._wrapperState.initialChecked,a!==""&&(n.name=a)}function vs(n,i,a){(i!=="number"||xr(n.ownerDocument)!==n)&&(a==null?n.defaultValue=""+n._wrapperState.initialValue:n.defaultValue!==""+a&&(n.defaultValue=""+a))}var lr=Array.isArray;function ur(n,i,a,c){if(n=n.options,i){i={};for(var d=0;d<a.length;d++)i["$"+a[d]]=!0;for(a=0;a<n.length;a++)d=i.hasOwnProperty("$"+n[a].value),n[a].selected!==d&&(n[a].selected=d),d&&c&&(n[a].defaultSelected=!0)}else{for(a=""+be(a),i=null,d=0;d<n.length;d++){if(n[d].value===a){n[d].selected=!0,c&&(n[d].defaultSelected=!0);return}i!==null||n[d].disabled||(i=n[d])}i!==null&&(i.selected=!0)}}function Mo(n,i){if(i.dangerouslySetInnerHTML!=null)throw Error(t(91));return ne({},i,{value:void 0,defaultValue:void 0,children:""+n._wrapperState.initialValue})}function Es(n,i){var a=i.value;if(a==null){if(a=i.children,i=i.defaultValue,a!=null){if(i!=null)throw Error(t(92));if(lr(a)){if(1<a.length)throw Error(t(93));a=a[0]}i=a}i==null&&(i=""),a=i}n._wrapperState={initialValue:be(a)}}function ws(n,i){var a=be(i.value),c=be(i.defaultValue);a!=null&&(a=""+a,a!==n.value&&(n.value=a),i.defaultValue==null&&n.defaultValue!==a&&(n.defaultValue=a)),c!=null&&(n.defaultValue=""+c)}function bo(n){var i=n.textContent;i===n._wrapperState.initialValue&&i!==""&&i!==null&&(n.value=i)}function ht(n){switch(n){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function dt(n,i){return n==null||n==="http://www.w3.org/1999/xhtml"?ht(i):n==="http://www.w3.org/2000/svg"&&i==="foreignObject"?"http://www.w3.org/1999/xhtml":n}var cr,Fo=function(n){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(i,a,c,d){MSApp.execUnsafeLocalFunction(function(){return n(i,a,c,d)})}:n}(function(n,i){if(n.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in n)n.innerHTML=i;else{for(cr=cr||document.createElement("div"),cr.innerHTML="<svg>"+i.valueOf().toString()+"</svg>",i=cr.firstChild;n.firstChild;)n.removeChild(n.firstChild);for(;i.firstChild;)n.appendChild(i.firstChild)}});function Lr(n,i){if(i){var a=n.firstChild;if(a&&a===n.lastChild&&a.nodeType===3){a.nodeValue=i;return}}n.textContent=i}var Ni={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},Di=["Webkit","ms","Moz","O"];Object.keys(Ni).forEach(function(n){Di.forEach(function(i){i=i+n.charAt(0).toUpperCase()+n.substring(1),Ni[i]=Ni[n]})});function Uo(n,i,a){return i==null||typeof i=="boolean"||i===""?"":a||typeof i!="number"||i===0||Ni.hasOwnProperty(n)&&Ni[n]?(""+i).trim():i+"px"}function jo(n,i){n=n.style;for(var a in i)if(i.hasOwnProperty(a)){var c=a.indexOf("--")===0,d=Uo(a,i[a],c);a==="float"&&(a="cssFloat"),c?n.setProperty(a,d):n[a]=d}}var zo=ne({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function Bo(n,i){if(i){if(zo[n]&&(i.children!=null||i.dangerouslySetInnerHTML!=null))throw Error(t(137,n));if(i.dangerouslySetInnerHTML!=null){if(i.children!=null)throw Error(t(60));if(typeof i.dangerouslySetInnerHTML!="object"||!("__html"in i.dangerouslySetInnerHTML))throw Error(t(61))}if(i.style!=null&&typeof i.style!="object")throw Error(t(62))}}function $o(n,i){if(n.indexOf("-")===-1)return typeof i.is=="string";switch(n){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var Oi=null;function Ts(n){return n=n.target||n.srcElement||window,n.correspondingUseElement&&(n=n.correspondingUseElement),n.nodeType===3?n.parentNode:n}var Is=null,un=null,zn=null;function Ss(n){if(n=fa(n)){if(typeof Is!="function")throw Error(t(280));var i=n.stateNode;i&&(i=Hl(i),Is(n.stateNode,n.type,i))}}function Bn(n){un?zn?zn.push(n):zn=[n]:un=n}function Wo(){if(un){var n=un,i=zn;if(zn=un=null,Ss(n),i)for(n=0;n<i.length;n++)Ss(i[n])}}function Vi(n,i){return n(i)}function Ho(){}var hr=!1;function qo(n,i,a){if(hr)return n(i,a);hr=!0;try{return Vi(n,i,a)}finally{hr=!1,(un!==null||zn!==null)&&(Ho(),Wo())}}function nt(n,i){var a=n.stateNode;if(a===null)return null;var c=Hl(a);if(c===null)return null;a=c[i];e:switch(i){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(c=!c.disabled)||(n=n.type,c=!(n==="button"||n==="input"||n==="select"||n==="textarea")),n=!c;break e;default:n=!1}if(n)return null;if(a&&typeof a!="function")throw Error(t(231,i,typeof a));return a}var As=!1;if(f)try{var In={};Object.defineProperty(In,"passive",{get:function(){As=!0}}),window.addEventListener("test",In,In),window.removeEventListener("test",In,In)}catch{As=!1}function xi(n,i,a,c,d,m,v,I,P){var U=Array.prototype.slice.call(arguments,3);try{i.apply(a,U)}catch(K){this.onError(K)}}var Li=!1,Rs=null,Sn=!1,Ko=null,Dc={onError:function(n){Li=!0,Rs=n}};function Cs(n,i,a,c,d,m,v,I,P){Li=!1,Rs=null,xi.apply(Dc,arguments)}function gl(n,i,a,c,d,m,v,I,P){if(Cs.apply(this,arguments),Li){if(Li){var U=Rs;Li=!1,Rs=null}else throw Error(t(198));Sn||(Sn=!0,Ko=U)}}function An(n){var i=n,a=n;if(n.alternate)for(;i.return;)i=i.return;else{n=i;do i=n,(i.flags&4098)!==0&&(a=i.return),n=i.return;while(n)}return i.tag===3?a:null}function Mi(n){if(n.tag===13){var i=n.memoizedState;if(i===null&&(n=n.alternate,n!==null&&(i=n.memoizedState)),i!==null)return i.dehydrated}return null}function Rn(n){if(An(n)!==n)throw Error(t(188))}function yl(n){var i=n.alternate;if(!i){if(i=An(n),i===null)throw Error(t(188));return i!==n?null:n}for(var a=n,c=i;;){var d=a.return;if(d===null)break;var m=d.alternate;if(m===null){if(c=d.return,c!==null){a=c;continue}break}if(d.child===m.child){for(m=d.child;m;){if(m===a)return Rn(d),n;if(m===c)return Rn(d),i;m=m.sibling}throw Error(t(188))}if(a.return!==c.return)a=d,c=m;else{for(var v=!1,I=d.child;I;){if(I===a){v=!0,a=d,c=m;break}if(I===c){v=!0,c=d,a=m;break}I=I.sibling}if(!v){for(I=m.child;I;){if(I===a){v=!0,a=m,c=d;break}if(I===c){v=!0,c=m,a=d;break}I=I.sibling}if(!v)throw Error(t(189))}}if(a.alternate!==c)throw Error(t(190))}if(a.tag!==3)throw Error(t(188));return a.stateNode.current===a?n:i}function Go(n){return n=yl(n),n!==null?Ps(n):null}function Ps(n){if(n.tag===5||n.tag===6)return n;for(n=n.child;n!==null;){var i=Ps(n);if(i!==null)return i;n=n.sibling}return null}var ks=e.unstable_scheduleCallback,Qo=e.unstable_cancelCallback,_l=e.unstable_shouldYield,Oc=e.unstable_requestPaint,$e=e.unstable_now,vl=e.unstable_getCurrentPriorityLevel,bi=e.unstable_ImmediatePriority,Mr=e.unstable_UserBlockingPriority,cn=e.unstable_NormalPriority,Xo=e.unstable_LowPriority,El=e.unstable_IdlePriority,Fi=null,tn=null;function wl(n){if(tn&&typeof tn.onCommitFiberRoot=="function")try{tn.onCommitFiberRoot(Fi,n,void 0,(n.current.flags&128)===128)}catch{}}var Bt=Math.clz32?Math.clz32:Il,Jo=Math.log,Tl=Math.LN2;function Il(n){return n>>>=0,n===0?32:31-(Jo(n)/Tl|0)|0}var Ns=64,Ds=4194304;function br(n){switch(n&-n){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return n&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return n&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return n}}function Ui(n,i){var a=n.pendingLanes;if(a===0)return 0;var c=0,d=n.suspendedLanes,m=n.pingedLanes,v=a&268435455;if(v!==0){var I=v&~d;I!==0?c=br(I):(m&=v,m!==0&&(c=br(m)))}else v=a&~d,v!==0?c=br(v):m!==0&&(c=br(m));if(c===0)return 0;if(i!==0&&i!==c&&(i&d)===0&&(d=c&-c,m=i&-i,d>=m||d===16&&(m&4194240)!==0))return i;if((c&4)!==0&&(c|=a&16),i=n.entangledLanes,i!==0)for(n=n.entanglements,i&=c;0<i;)a=31-Bt(i),d=1<<a,c|=n[a],i&=~d;return c}function Vc(n,i){switch(n){case 1:case 2:case 4:return i+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return i+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function dr(n,i){for(var a=n.suspendedLanes,c=n.pingedLanes,d=n.expirationTimes,m=n.pendingLanes;0<m;){var v=31-Bt(m),I=1<<v,P=d[v];P===-1?((I&a)===0||(I&c)!==0)&&(d[v]=Vc(I,i)):P<=i&&(n.expiredLanes|=I),m&=~I}}function nn(n){return n=n.pendingLanes&-1073741825,n!==0?n:n&1073741824?1073741824:0}function ji(){var n=Ns;return Ns<<=1,(Ns&4194240)===0&&(Ns=64),n}function Fr(n){for(var i=[],a=0;31>a;a++)i.push(n);return i}function Ur(n,i,a){n.pendingLanes|=i,i!==536870912&&(n.suspendedLanes=0,n.pingedLanes=0),n=n.eventTimes,i=31-Bt(i),n[i]=a}function ze(n,i){var a=n.pendingLanes&~i;n.pendingLanes=i,n.suspendedLanes=0,n.pingedLanes=0,n.expiredLanes&=i,n.mutableReadLanes&=i,n.entangledLanes&=i,i=n.entanglements;var c=n.eventTimes;for(n=n.expirationTimes;0<a;){var d=31-Bt(a),m=1<<d;i[d]=0,c[d]=-1,n[d]=-1,a&=~m}}function jr(n,i){var a=n.entangledLanes|=i;for(n=n.entanglements;a;){var c=31-Bt(a),d=1<<c;d&i|n[c]&i&&(n[c]|=i),a&=~d}}var ke=0;function zr(n){return n&=-n,1<n?4<n?(n&268435455)!==0?16:536870912:4:1}var Sl,Os,Al,Rl,Cl,Yo=!1,$n=[],At=null,Cn=null,Pn=null,Br=new Map,hn=new Map,Wn=[],xc="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function Pl(n,i){switch(n){case"focusin":case"focusout":At=null;break;case"dragenter":case"dragleave":Cn=null;break;case"mouseover":case"mouseout":Pn=null;break;case"pointerover":case"pointerout":Br.delete(i.pointerId);break;case"gotpointercapture":case"lostpointercapture":hn.delete(i.pointerId)}}function qt(n,i,a,c,d,m){return n===null||n.nativeEvent!==m?(n={blockedOn:i,domEventName:a,eventSystemFlags:c,nativeEvent:m,targetContainers:[d]},i!==null&&(i=fa(i),i!==null&&Os(i)),n):(n.eventSystemFlags|=c,i=n.targetContainers,d!==null&&i.indexOf(d)===-1&&i.push(d),n)}function Lc(n,i,a,c,d){switch(i){case"focusin":return At=qt(At,n,i,a,c,d),!0;case"dragenter":return Cn=qt(Cn,n,i,a,c,d),!0;case"mouseover":return Pn=qt(Pn,n,i,a,c,d),!0;case"pointerover":var m=d.pointerId;return Br.set(m,qt(Br.get(m)||null,n,i,a,c,d)),!0;case"gotpointercapture":return m=d.pointerId,hn.set(m,qt(hn.get(m)||null,n,i,a,c,d)),!0}return!1}function kl(n){var i=Hi(n.target);if(i!==null){var a=An(i);if(a!==null){if(i=a.tag,i===13){if(i=Mi(a),i!==null){n.blockedOn=i,Cl(n.priority,function(){Al(a)});return}}else if(i===3&&a.stateNode.current.memoizedState.isDehydrated){n.blockedOn=a.tag===3?a.stateNode.containerInfo:null;return}}}n.blockedOn=null}function fr(n){if(n.blockedOn!==null)return!1;for(var i=n.targetContainers;0<i.length;){var a=Vs(n.domEventName,n.eventSystemFlags,i[0],n.nativeEvent);if(a===null){a=n.nativeEvent;var c=new a.constructor(a.type,a);Oi=c,a.target.dispatchEvent(c),Oi=null}else return i=fa(a),i!==null&&Os(i),n.blockedOn=a,!1;i.shift()}return!0}function zi(n,i,a){fr(n)&&a.delete(i)}function Nl(){Yo=!1,At!==null&&fr(At)&&(At=null),Cn!==null&&fr(Cn)&&(Cn=null),Pn!==null&&fr(Pn)&&(Pn=null),Br.forEach(zi),hn.forEach(zi)}function kn(n,i){n.blockedOn===i&&(n.blockedOn=null,Yo||(Yo=!0,e.unstable_scheduleCallback(e.unstable_NormalPriority,Nl)))}function Nn(n){function i(d){return kn(d,n)}if(0<$n.length){kn($n[0],n);for(var a=1;a<$n.length;a++){var c=$n[a];c.blockedOn===n&&(c.blockedOn=null)}}for(At!==null&&kn(At,n),Cn!==null&&kn(Cn,n),Pn!==null&&kn(Pn,n),Br.forEach(i),hn.forEach(i),a=0;a<Wn.length;a++)c=Wn[a],c.blockedOn===n&&(c.blockedOn=null);for(;0<Wn.length&&(a=Wn[0],a.blockedOn===null);)kl(a),a.blockedOn===null&&Wn.shift()}var pr=ge.ReactCurrentBatchConfig,$r=!0;function Ge(n,i,a,c){var d=ke,m=pr.transition;pr.transition=null;try{ke=1,Zo(n,i,a,c)}finally{ke=d,pr.transition=m}}function Mc(n,i,a,c){var d=ke,m=pr.transition;pr.transition=null;try{ke=4,Zo(n,i,a,c)}finally{ke=d,pr.transition=m}}function Zo(n,i,a,c){if($r){var d=Vs(n,i,a,c);if(d===null)Kc(n,i,c,Bi,a),Pl(n,c);else if(Lc(d,n,i,a,c))c.stopPropagation();else if(Pl(n,c),i&4&&-1<xc.indexOf(n)){for(;d!==null;){var m=fa(d);if(m!==null&&Sl(m),m=Vs(n,i,a,c),m===null&&Kc(n,i,c,Bi,a),m===d)break;d=m}d!==null&&c.stopPropagation()}else Kc(n,i,c,null,a)}}var Bi=null;function Vs(n,i,a,c){if(Bi=null,n=Ts(c),n=Hi(n),n!==null)if(i=An(n),i===null)n=null;else if(a=i.tag,a===13){if(n=Mi(i),n!==null)return n;n=null}else if(a===3){if(i.stateNode.current.memoizedState.isDehydrated)return i.tag===3?i.stateNode.containerInfo:null;n=null}else i!==n&&(n=null);return Bi=n,null}function ea(n){switch(n){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(vl()){case bi:return 1;case Mr:return 4;case cn:case Xo:return 16;case El:return 536870912;default:return 16}default:return 16}}var rn=null,xs=null,Kt=null;function ta(){if(Kt)return Kt;var n,i=xs,a=i.length,c,d="value"in rn?rn.value:rn.textContent,m=d.length;for(n=0;n<a&&i[n]===d[n];n++);var v=a-n;for(c=1;c<=v&&i[a-c]===d[m-c];c++);return Kt=d.slice(n,1<c?1-c:void 0)}function Ls(n){var i=n.keyCode;return"charCode"in n?(n=n.charCode,n===0&&i===13&&(n=13)):n=i,n===10&&(n=13),32<=n||n===13?n:0}function Hn(){return!0}function na(){return!1}function Rt(n){function i(a,c,d,m,v){this._reactName=a,this._targetInst=d,this.type=c,this.nativeEvent=m,this.target=v,this.currentTarget=null;for(var I in n)n.hasOwnProperty(I)&&(a=n[I],this[I]=a?a(m):m[I]);return this.isDefaultPrevented=(m.defaultPrevented!=null?m.defaultPrevented:m.returnValue===!1)?Hn:na,this.isPropagationStopped=na,this}return ne(i.prototype,{preventDefault:function(){this.defaultPrevented=!0;var a=this.nativeEvent;a&&(a.preventDefault?a.preventDefault():typeof a.returnValue!="unknown"&&(a.returnValue=!1),this.isDefaultPrevented=Hn)},stopPropagation:function(){var a=this.nativeEvent;a&&(a.stopPropagation?a.stopPropagation():typeof a.cancelBubble!="unknown"&&(a.cancelBubble=!0),this.isPropagationStopped=Hn)},persist:function(){},isPersistent:Hn}),i}var Dn={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(n){return n.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Ms=Rt(Dn),qn=ne({},Dn,{view:0,detail:0}),bc=Rt(qn),bs,mr,Wr,$i=ne({},qn,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Kn,button:0,buttons:0,relatedTarget:function(n){return n.relatedTarget===void 0?n.fromElement===n.srcElement?n.toElement:n.fromElement:n.relatedTarget},movementX:function(n){return"movementX"in n?n.movementX:(n!==Wr&&(Wr&&n.type==="mousemove"?(bs=n.screenX-Wr.screenX,mr=n.screenY-Wr.screenY):mr=bs=0,Wr=n),bs)},movementY:function(n){return"movementY"in n?n.movementY:mr}}),Fs=Rt($i),ra=ne({},$i,{dataTransfer:0}),Dl=Rt(ra),Us=ne({},qn,{relatedTarget:0}),js=Rt(Us),Ol=ne({},Dn,{animationName:0,elapsedTime:0,pseudoElement:0}),gr=Rt(Ol),Vl=ne({},Dn,{clipboardData:function(n){return"clipboardData"in n?n.clipboardData:window.clipboardData}}),xl=Rt(Vl),Ll=ne({},Dn,{data:0}),ia=Rt(Ll),zs={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},$t={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},Ml={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function bl(n){var i=this.nativeEvent;return i.getModifierState?i.getModifierState(n):(n=Ml[n])?!!i[n]:!1}function Kn(){return bl}var u=ne({},qn,{key:function(n){if(n.key){var i=zs[n.key]||n.key;if(i!=="Unidentified")return i}return n.type==="keypress"?(n=Ls(n),n===13?"Enter":String.fromCharCode(n)):n.type==="keydown"||n.type==="keyup"?$t[n.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Kn,charCode:function(n){return n.type==="keypress"?Ls(n):0},keyCode:function(n){return n.type==="keydown"||n.type==="keyup"?n.keyCode:0},which:function(n){return n.type==="keypress"?Ls(n):n.type==="keydown"||n.type==="keyup"?n.keyCode:0}}),p=Rt(u),y=ne({},$i,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),w=Rt(y),L=ne({},qn,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Kn}),z=Rt(L),J=ne({},Dn,{propertyName:0,elapsedTime:0,pseudoElement:0}),Ue=Rt(J),ft=ne({},$i,{deltaX:function(n){return"deltaX"in n?n.deltaX:"wheelDeltaX"in n?-n.wheelDeltaX:0},deltaY:function(n){return"deltaY"in n?n.deltaY:"wheelDeltaY"in n?-n.wheelDeltaY:"wheelDelta"in n?-n.wheelDelta:0},deltaZ:0,deltaMode:0}),De=Rt(ft),vt=[9,13,27,32],ot=f&&"CompositionEvent"in window,dn=null;f&&"documentMode"in document&&(dn=document.documentMode);var sn=f&&"TextEvent"in window&&!dn,Wi=f&&(!ot||dn&&8<dn&&11>=dn),Bs=" ",Wf=!1;function Hf(n,i){switch(n){case"keyup":return vt.indexOf(i.keyCode)!==-1;case"keydown":return i.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function qf(n){return n=n.detail,typeof n=="object"&&"data"in n?n.data:null}var $s=!1;function AE(n,i){switch(n){case"compositionend":return qf(i);case"keypress":return i.which!==32?null:(Wf=!0,Bs);case"textInput":return n=i.data,n===Bs&&Wf?null:n;default:return null}}function RE(n,i){if($s)return n==="compositionend"||!ot&&Hf(n,i)?(n=ta(),Kt=xs=rn=null,$s=!1,n):null;switch(n){case"paste":return null;case"keypress":if(!(i.ctrlKey||i.altKey||i.metaKey)||i.ctrlKey&&i.altKey){if(i.char&&1<i.char.length)return i.char;if(i.which)return String.fromCharCode(i.which)}return null;case"compositionend":return Wi&&i.locale!=="ko"?null:i.data;default:return null}}var CE={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Kf(n){var i=n&&n.nodeName&&n.nodeName.toLowerCase();return i==="input"?!!CE[n.type]:i==="textarea"}function Gf(n,i,a,c){Bn(c),i=Bl(i,"onChange"),0<i.length&&(a=new Ms("onChange","change",null,a,c),n.push({event:a,listeners:i}))}var sa=null,oa=null;function PE(n){dp(n,0)}function Fl(n){var i=Gs(n);if(ys(i))return n}function kE(n,i){if(n==="change")return i}var Qf=!1;if(f){var Fc;if(f){var Uc="oninput"in document;if(!Uc){var Xf=document.createElement("div");Xf.setAttribute("oninput","return;"),Uc=typeof Xf.oninput=="function"}Fc=Uc}else Fc=!1;Qf=Fc&&(!document.documentMode||9<document.documentMode)}function Jf(){sa&&(sa.detachEvent("onpropertychange",Yf),oa=sa=null)}function Yf(n){if(n.propertyName==="value"&&Fl(oa)){var i=[];Gf(i,oa,n,Ts(n)),qo(PE,i)}}function NE(n,i,a){n==="focusin"?(Jf(),sa=i,oa=a,sa.attachEvent("onpropertychange",Yf)):n==="focusout"&&Jf()}function DE(n){if(n==="selectionchange"||n==="keyup"||n==="keydown")return Fl(oa)}function OE(n,i){if(n==="click")return Fl(i)}function VE(n,i){if(n==="input"||n==="change")return Fl(i)}function xE(n,i){return n===i&&(n!==0||1/n===1/i)||n!==n&&i!==i}var On=typeof Object.is=="function"?Object.is:xE;function aa(n,i){if(On(n,i))return!0;if(typeof n!="object"||n===null||typeof i!="object"||i===null)return!1;var a=Object.keys(n),c=Object.keys(i);if(a.length!==c.length)return!1;for(c=0;c<a.length;c++){var d=a[c];if(!g.call(i,d)||!On(n[d],i[d]))return!1}return!0}function Zf(n){for(;n&&n.firstChild;)n=n.firstChild;return n}function ep(n,i){var a=Zf(n);n=0;for(var c;a;){if(a.nodeType===3){if(c=n+a.textContent.length,n<=i&&c>=i)return{node:a,offset:i-n};n=c}e:{for(;a;){if(a.nextSibling){a=a.nextSibling;break e}a=a.parentNode}a=void 0}a=Zf(a)}}function tp(n,i){return n&&i?n===i?!0:n&&n.nodeType===3?!1:i&&i.nodeType===3?tp(n,i.parentNode):"contains"in n?n.contains(i):n.compareDocumentPosition?!!(n.compareDocumentPosition(i)&16):!1:!1}function np(){for(var n=window,i=xr();i instanceof n.HTMLIFrameElement;){try{var a=typeof i.contentWindow.location.href=="string"}catch{a=!1}if(a)n=i.contentWindow;else break;i=xr(n.document)}return i}function jc(n){var i=n&&n.nodeName&&n.nodeName.toLowerCase();return i&&(i==="input"&&(n.type==="text"||n.type==="search"||n.type==="tel"||n.type==="url"||n.type==="password")||i==="textarea"||n.contentEditable==="true")}function LE(n){var i=np(),a=n.focusedElem,c=n.selectionRange;if(i!==a&&a&&a.ownerDocument&&tp(a.ownerDocument.documentElement,a)){if(c!==null&&jc(a)){if(i=c.start,n=c.end,n===void 0&&(n=i),"selectionStart"in a)a.selectionStart=i,a.selectionEnd=Math.min(n,a.value.length);else if(n=(i=a.ownerDocument||document)&&i.defaultView||window,n.getSelection){n=n.getSelection();var d=a.textContent.length,m=Math.min(c.start,d);c=c.end===void 0?m:Math.min(c.end,d),!n.extend&&m>c&&(d=c,c=m,m=d),d=ep(a,m);var v=ep(a,c);d&&v&&(n.rangeCount!==1||n.anchorNode!==d.node||n.anchorOffset!==d.offset||n.focusNode!==v.node||n.focusOffset!==v.offset)&&(i=i.createRange(),i.setStart(d.node,d.offset),n.removeAllRanges(),m>c?(n.addRange(i),n.extend(v.node,v.offset)):(i.setEnd(v.node,v.offset),n.addRange(i)))}}for(i=[],n=a;n=n.parentNode;)n.nodeType===1&&i.push({element:n,left:n.scrollLeft,top:n.scrollTop});for(typeof a.focus=="function"&&a.focus(),a=0;a<i.length;a++)n=i[a],n.element.scrollLeft=n.left,n.element.scrollTop=n.top}}var ME=f&&"documentMode"in document&&11>=document.documentMode,Ws=null,zc=null,la=null,Bc=!1;function rp(n,i,a){var c=a.window===a?a.document:a.nodeType===9?a:a.ownerDocument;Bc||Ws==null||Ws!==xr(c)||(c=Ws,"selectionStart"in c&&jc(c)?c={start:c.selectionStart,end:c.selectionEnd}:(c=(c.ownerDocument&&c.ownerDocument.defaultView||window).getSelection(),c={anchorNode:c.anchorNode,anchorOffset:c.anchorOffset,focusNode:c.focusNode,focusOffset:c.focusOffset}),la&&aa(la,c)||(la=c,c=Bl(zc,"onSelect"),0<c.length&&(i=new Ms("onSelect","select",null,i,a),n.push({event:i,listeners:c}),i.target=Ws)))}function Ul(n,i){var a={};return a[n.toLowerCase()]=i.toLowerCase(),a["Webkit"+n]="webkit"+i,a["Moz"+n]="moz"+i,a}var Hs={animationend:Ul("Animation","AnimationEnd"),animationiteration:Ul("Animation","AnimationIteration"),animationstart:Ul("Animation","AnimationStart"),transitionend:Ul("Transition","TransitionEnd")},$c={},ip={};f&&(ip=document.createElement("div").style,"AnimationEvent"in window||(delete Hs.animationend.animation,delete Hs.animationiteration.animation,delete Hs.animationstart.animation),"TransitionEvent"in window||delete Hs.transitionend.transition);function jl(n){if($c[n])return $c[n];if(!Hs[n])return n;var i=Hs[n],a;for(a in i)if(i.hasOwnProperty(a)&&a in ip)return $c[n]=i[a];return n}var sp=jl("animationend"),op=jl("animationiteration"),ap=jl("animationstart"),lp=jl("transitionend"),up=new Map,cp="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function Hr(n,i){up.set(n,i),l(i,[n])}for(var Wc=0;Wc<cp.length;Wc++){var Hc=cp[Wc],bE=Hc.toLowerCase(),FE=Hc[0].toUpperCase()+Hc.slice(1);Hr(bE,"on"+FE)}Hr(sp,"onAnimationEnd"),Hr(op,"onAnimationIteration"),Hr(ap,"onAnimationStart"),Hr("dblclick","onDoubleClick"),Hr("focusin","onFocus"),Hr("focusout","onBlur"),Hr(lp,"onTransitionEnd"),h("onMouseEnter",["mouseout","mouseover"]),h("onMouseLeave",["mouseout","mouseover"]),h("onPointerEnter",["pointerout","pointerover"]),h("onPointerLeave",["pointerout","pointerover"]),l("onChange","change click focusin focusout input keydown keyup selectionchange".split(" ")),l("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")),l("onBeforeInput",["compositionend","keypress","textInput","paste"]),l("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" ")),l("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" ")),l("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var ua="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),UE=new Set("cancel close invalid load scroll toggle".split(" ").concat(ua));function hp(n,i,a){var c=n.type||"unknown-event";n.currentTarget=a,gl(c,i,void 0,n),n.currentTarget=null}function dp(n,i){i=(i&4)!==0;for(var a=0;a<n.length;a++){var c=n[a],d=c.event;c=c.listeners;e:{var m=void 0;if(i)for(var v=c.length-1;0<=v;v--){var I=c[v],P=I.instance,U=I.currentTarget;if(I=I.listener,P!==m&&d.isPropagationStopped())break e;hp(d,I,U),m=P}else for(v=0;v<c.length;v++){if(I=c[v],P=I.instance,U=I.currentTarget,I=I.listener,P!==m&&d.isPropagationStopped())break e;hp(d,I,U),m=P}}}if(Sn)throw n=Ko,Sn=!1,Ko=null,n}function He(n,i){var a=i[Zc];a===void 0&&(a=i[Zc]=new Set);var c=n+"__bubble";a.has(c)||(fp(i,n,2,!1),a.add(c))}function qc(n,i,a){var c=0;i&&(c|=4),fp(a,n,c,i)}var zl="_reactListening"+Math.random().toString(36).slice(2);function ca(n){if(!n[zl]){n[zl]=!0,s.forEach(function(a){a!=="selectionchange"&&(UE.has(a)||qc(a,!1,n),qc(a,!0,n))});var i=n.nodeType===9?n:n.ownerDocument;i===null||i[zl]||(i[zl]=!0,qc("selectionchange",!1,i))}}function fp(n,i,a,c){switch(ea(i)){case 1:var d=Ge;break;case 4:d=Mc;break;default:d=Zo}a=d.bind(null,i,a,n),d=void 0,!As||i!=="touchstart"&&i!=="touchmove"&&i!=="wheel"||(d=!0),c?d!==void 0?n.addEventListener(i,a,{capture:!0,passive:d}):n.addEventListener(i,a,!0):d!==void 0?n.addEventListener(i,a,{passive:d}):n.addEventListener(i,a,!1)}function Kc(n,i,a,c,d){var m=c;if((i&1)===0&&(i&2)===0&&c!==null)e:for(;;){if(c===null)return;var v=c.tag;if(v===3||v===4){var I=c.stateNode.containerInfo;if(I===d||I.nodeType===8&&I.parentNode===d)break;if(v===4)for(v=c.return;v!==null;){var P=v.tag;if((P===3||P===4)&&(P=v.stateNode.containerInfo,P===d||P.nodeType===8&&P.parentNode===d))return;v=v.return}for(;I!==null;){if(v=Hi(I),v===null)return;if(P=v.tag,P===5||P===6){c=m=v;continue e}I=I.parentNode}}c=c.return}qo(function(){var U=m,K=Ts(a),Q=[];e:{var q=up.get(n);if(q!==void 0){var ee=Ms,oe=n;switch(n){case"keypress":if(Ls(a)===0)break e;case"keydown":case"keyup":ee=p;break;case"focusin":oe="focus",ee=js;break;case"focusout":oe="blur",ee=js;break;case"beforeblur":case"afterblur":ee=js;break;case"click":if(a.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":ee=Fs;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":ee=Dl;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":ee=z;break;case sp:case op:case ap:ee=gr;break;case lp:ee=Ue;break;case"scroll":ee=bc;break;case"wheel":ee=De;break;case"copy":case"cut":case"paste":ee=xl;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":ee=w}var le=(i&4)!==0,rt=!le&&n==="scroll",M=le?q!==null?q+"Capture":null:q;le=[];for(var N=U,b;N!==null;){b=N;var X=b.stateNode;if(b.tag===5&&X!==null&&(b=X,M!==null&&(X=nt(N,M),X!=null&&le.push(ha(N,X,b)))),rt)break;N=N.return}0<le.length&&(q=new ee(q,oe,null,a,K),Q.push({event:q,listeners:le}))}}if((i&7)===0){e:{if(q=n==="mouseover"||n==="pointerover",ee=n==="mouseout"||n==="pointerout",q&&a!==Oi&&(oe=a.relatedTarget||a.fromElement)&&(Hi(oe)||oe[yr]))break e;if((ee||q)&&(q=K.window===K?K:(q=K.ownerDocument)?q.defaultView||q.parentWindow:window,ee?(oe=a.relatedTarget||a.toElement,ee=U,oe=oe?Hi(oe):null,oe!==null&&(rt=An(oe),oe!==rt||oe.tag!==5&&oe.tag!==6)&&(oe=null)):(ee=null,oe=U),ee!==oe)){if(le=Fs,X="onMouseLeave",M="onMouseEnter",N="mouse",(n==="pointerout"||n==="pointerover")&&(le=w,X="onPointerLeave",M="onPointerEnter",N="pointer"),rt=ee==null?q:Gs(ee),b=oe==null?q:Gs(oe),q=new le(X,N+"leave",ee,a,K),q.target=rt,q.relatedTarget=b,X=null,Hi(K)===U&&(le=new le(M,N+"enter",oe,a,K),le.target=b,le.relatedTarget=rt,X=le),rt=X,ee&&oe)t:{for(le=ee,M=oe,N=0,b=le;b;b=qs(b))N++;for(b=0,X=M;X;X=qs(X))b++;for(;0<N-b;)le=qs(le),N--;for(;0<b-N;)M=qs(M),b--;for(;N--;){if(le===M||M!==null&&le===M.alternate)break t;le=qs(le),M=qs(M)}le=null}else le=null;ee!==null&&pp(Q,q,ee,le,!1),oe!==null&&rt!==null&&pp(Q,rt,oe,le,!0)}}e:{if(q=U?Gs(U):window,ee=q.nodeName&&q.nodeName.toLowerCase(),ee==="select"||ee==="input"&&q.type==="file")var ue=kE;else if(Kf(q))if(Qf)ue=VE;else{ue=DE;var fe=NE}else(ee=q.nodeName)&&ee.toLowerCase()==="input"&&(q.type==="checkbox"||q.type==="radio")&&(ue=OE);if(ue&&(ue=ue(n,U))){Gf(Q,ue,a,K);break e}fe&&fe(n,q,U),n==="focusout"&&(fe=q._wrapperState)&&fe.controlled&&q.type==="number"&&vs(q,"number",q.value)}switch(fe=U?Gs(U):window,n){case"focusin":(Kf(fe)||fe.contentEditable==="true")&&(Ws=fe,zc=U,la=null);break;case"focusout":la=zc=Ws=null;break;case"mousedown":Bc=!0;break;case"contextmenu":case"mouseup":case"dragend":Bc=!1,rp(Q,a,K);break;case"selectionchange":if(ME)break;case"keydown":case"keyup":rp(Q,a,K)}var pe;if(ot)e:{switch(n){case"compositionstart":var ve="onCompositionStart";break e;case"compositionend":ve="onCompositionEnd";break e;case"compositionupdate":ve="onCompositionUpdate";break e}ve=void 0}else $s?Hf(n,a)&&(ve="onCompositionEnd"):n==="keydown"&&a.keyCode===229&&(ve="onCompositionStart");ve&&(Wi&&a.locale!=="ko"&&($s||ve!=="onCompositionStart"?ve==="onCompositionEnd"&&$s&&(pe=ta()):(rn=K,xs="value"in rn?rn.value:rn.textContent,$s=!0)),fe=Bl(U,ve),0<fe.length&&(ve=new ia(ve,n,null,a,K),Q.push({event:ve,listeners:fe}),pe?ve.data=pe:(pe=qf(a),pe!==null&&(ve.data=pe)))),(pe=sn?AE(n,a):RE(n,a))&&(U=Bl(U,"onBeforeInput"),0<U.length&&(K=new ia("onBeforeInput","beforeinput",null,a,K),Q.push({event:K,listeners:U}),K.data=pe))}dp(Q,i)})}function ha(n,i,a){return{instance:n,listener:i,currentTarget:a}}function Bl(n,i){for(var a=i+"Capture",c=[];n!==null;){var d=n,m=d.stateNode;d.tag===5&&m!==null&&(d=m,m=nt(n,a),m!=null&&c.unshift(ha(n,m,d)),m=nt(n,i),m!=null&&c.push(ha(n,m,d))),n=n.return}return c}function qs(n){if(n===null)return null;do n=n.return;while(n&&n.tag!==5);return n||null}function pp(n,i,a,c,d){for(var m=i._reactName,v=[];a!==null&&a!==c;){var I=a,P=I.alternate,U=I.stateNode;if(P!==null&&P===c)break;I.tag===5&&U!==null&&(I=U,d?(P=nt(a,m),P!=null&&v.unshift(ha(a,P,I))):d||(P=nt(a,m),P!=null&&v.push(ha(a,P,I)))),a=a.return}v.length!==0&&n.push({event:i,listeners:v})}var jE=/\r\n?/g,zE=/\u0000|\uFFFD/g;function mp(n){return(typeof n=="string"?n:""+n).replace(jE,`
`).replace(zE,"")}function $l(n,i,a){if(i=mp(i),mp(n)!==i&&a)throw Error(t(425))}function Wl(){}var Gc=null,Qc=null;function Xc(n,i){return n==="textarea"||n==="noscript"||typeof i.children=="string"||typeof i.children=="number"||typeof i.dangerouslySetInnerHTML=="object"&&i.dangerouslySetInnerHTML!==null&&i.dangerouslySetInnerHTML.__html!=null}var Jc=typeof setTimeout=="function"?setTimeout:void 0,BE=typeof clearTimeout=="function"?clearTimeout:void 0,gp=typeof Promise=="function"?Promise:void 0,$E=typeof queueMicrotask=="function"?queueMicrotask:typeof gp<"u"?function(n){return gp.resolve(null).then(n).catch(WE)}:Jc;function WE(n){setTimeout(function(){throw n})}function Yc(n,i){var a=i,c=0;do{var d=a.nextSibling;if(n.removeChild(a),d&&d.nodeType===8)if(a=d.data,a==="/$"){if(c===0){n.removeChild(d),Nn(i);return}c--}else a!=="$"&&a!=="$?"&&a!=="$!"||c++;a=d}while(a);Nn(i)}function qr(n){for(;n!=null;n=n.nextSibling){var i=n.nodeType;if(i===1||i===3)break;if(i===8){if(i=n.data,i==="$"||i==="$!"||i==="$?")break;if(i==="/$")return null}}return n}function yp(n){n=n.previousSibling;for(var i=0;n;){if(n.nodeType===8){var a=n.data;if(a==="$"||a==="$!"||a==="$?"){if(i===0)return n;i--}else a==="/$"&&i++}n=n.previousSibling}return null}var Ks=Math.random().toString(36).slice(2),Gn="__reactFiber$"+Ks,da="__reactProps$"+Ks,yr="__reactContainer$"+Ks,Zc="__reactEvents$"+Ks,HE="__reactListeners$"+Ks,qE="__reactHandles$"+Ks;function Hi(n){var i=n[Gn];if(i)return i;for(var a=n.parentNode;a;){if(i=a[yr]||a[Gn]){if(a=i.alternate,i.child!==null||a!==null&&a.child!==null)for(n=yp(n);n!==null;){if(a=n[Gn])return a;n=yp(n)}return i}n=a,a=n.parentNode}return null}function fa(n){return n=n[Gn]||n[yr],!n||n.tag!==5&&n.tag!==6&&n.tag!==13&&n.tag!==3?null:n}function Gs(n){if(n.tag===5||n.tag===6)return n.stateNode;throw Error(t(33))}function Hl(n){return n[da]||null}var eh=[],Qs=-1;function Kr(n){return{current:n}}function qe(n){0>Qs||(n.current=eh[Qs],eh[Qs]=null,Qs--)}function We(n,i){Qs++,eh[Qs]=n.current,n.current=i}var Gr={},xt=Kr(Gr),Gt=Kr(!1),qi=Gr;function Xs(n,i){var a=n.type.contextTypes;if(!a)return Gr;var c=n.stateNode;if(c&&c.__reactInternalMemoizedUnmaskedChildContext===i)return c.__reactInternalMemoizedMaskedChildContext;var d={},m;for(m in a)d[m]=i[m];return c&&(n=n.stateNode,n.__reactInternalMemoizedUnmaskedChildContext=i,n.__reactInternalMemoizedMaskedChildContext=d),d}function Qt(n){return n=n.childContextTypes,n!=null}function ql(){qe(Gt),qe(xt)}function _p(n,i,a){if(xt.current!==Gr)throw Error(t(168));We(xt,i),We(Gt,a)}function vp(n,i,a){var c=n.stateNode;if(i=i.childContextTypes,typeof c.getChildContext!="function")return a;c=c.getChildContext();for(var d in c)if(!(d in i))throw Error(t(108,Me(n)||"Unknown",d));return ne({},a,c)}function Kl(n){return n=(n=n.stateNode)&&n.__reactInternalMemoizedMergedChildContext||Gr,qi=xt.current,We(xt,n),We(Gt,Gt.current),!0}function Ep(n,i,a){var c=n.stateNode;if(!c)throw Error(t(169));a?(n=vp(n,i,qi),c.__reactInternalMemoizedMergedChildContext=n,qe(Gt),qe(xt),We(xt,n)):qe(Gt),We(Gt,a)}var _r=null,Gl=!1,th=!1;function wp(n){_r===null?_r=[n]:_r.push(n)}function KE(n){Gl=!0,wp(n)}function Qr(){if(!th&&_r!==null){th=!0;var n=0,i=ke;try{var a=_r;for(ke=1;n<a.length;n++){var c=a[n];do c=c(!0);while(c!==null)}_r=null,Gl=!1}catch(d){throw _r!==null&&(_r=_r.slice(n+1)),ks(bi,Qr),d}finally{ke=i,th=!1}}return null}var Js=[],Ys=0,Ql=null,Xl=0,fn=[],pn=0,Ki=null,vr=1,Er="";function Gi(n,i){Js[Ys++]=Xl,Js[Ys++]=Ql,Ql=n,Xl=i}function Tp(n,i,a){fn[pn++]=vr,fn[pn++]=Er,fn[pn++]=Ki,Ki=n;var c=vr;n=Er;var d=32-Bt(c)-1;c&=~(1<<d),a+=1;var m=32-Bt(i)+d;if(30<m){var v=d-d%5;m=(c&(1<<v)-1).toString(32),c>>=v,d-=v,vr=1<<32-Bt(i)+d|a<<d|c,Er=m+n}else vr=1<<m|a<<d|c,Er=n}function nh(n){n.return!==null&&(Gi(n,1),Tp(n,1,0))}function rh(n){for(;n===Ql;)Ql=Js[--Ys],Js[Ys]=null,Xl=Js[--Ys],Js[Ys]=null;for(;n===Ki;)Ki=fn[--pn],fn[pn]=null,Er=fn[--pn],fn[pn]=null,vr=fn[--pn],fn[pn]=null}var on=null,an=null,Qe=!1,Vn=null;function Ip(n,i){var a=_n(5,null,null,0);a.elementType="DELETED",a.stateNode=i,a.return=n,i=n.deletions,i===null?(n.deletions=[a],n.flags|=16):i.push(a)}function Sp(n,i){switch(n.tag){case 5:var a=n.type;return i=i.nodeType!==1||a.toLowerCase()!==i.nodeName.toLowerCase()?null:i,i!==null?(n.stateNode=i,on=n,an=qr(i.firstChild),!0):!1;case 6:return i=n.pendingProps===""||i.nodeType!==3?null:i,i!==null?(n.stateNode=i,on=n,an=null,!0):!1;case 13:return i=i.nodeType!==8?null:i,i!==null?(a=Ki!==null?{id:vr,overflow:Er}:null,n.memoizedState={dehydrated:i,treeContext:a,retryLane:1073741824},a=_n(18,null,null,0),a.stateNode=i,a.return=n,n.child=a,on=n,an=null,!0):!1;default:return!1}}function ih(n){return(n.mode&1)!==0&&(n.flags&128)===0}function sh(n){if(Qe){var i=an;if(i){var a=i;if(!Sp(n,i)){if(ih(n))throw Error(t(418));i=qr(a.nextSibling);var c=on;i&&Sp(n,i)?Ip(c,a):(n.flags=n.flags&-4097|2,Qe=!1,on=n)}}else{if(ih(n))throw Error(t(418));n.flags=n.flags&-4097|2,Qe=!1,on=n}}}function Ap(n){for(n=n.return;n!==null&&n.tag!==5&&n.tag!==3&&n.tag!==13;)n=n.return;on=n}function Jl(n){if(n!==on)return!1;if(!Qe)return Ap(n),Qe=!0,!1;var i;if((i=n.tag!==3)&&!(i=n.tag!==5)&&(i=n.type,i=i!=="head"&&i!=="body"&&!Xc(n.type,n.memoizedProps)),i&&(i=an)){if(ih(n))throw Rp(),Error(t(418));for(;i;)Ip(n,i),i=qr(i.nextSibling)}if(Ap(n),n.tag===13){if(n=n.memoizedState,n=n!==null?n.dehydrated:null,!n)throw Error(t(317));e:{for(n=n.nextSibling,i=0;n;){if(n.nodeType===8){var a=n.data;if(a==="/$"){if(i===0){an=qr(n.nextSibling);break e}i--}else a!=="$"&&a!=="$!"&&a!=="$?"||i++}n=n.nextSibling}an=null}}else an=on?qr(n.stateNode.nextSibling):null;return!0}function Rp(){for(var n=an;n;)n=qr(n.nextSibling)}function Zs(){an=on=null,Qe=!1}function oh(n){Vn===null?Vn=[n]:Vn.push(n)}var GE=ge.ReactCurrentBatchConfig;function pa(n,i,a){if(n=a.ref,n!==null&&typeof n!="function"&&typeof n!="object"){if(a._owner){if(a=a._owner,a){if(a.tag!==1)throw Error(t(309));var c=a.stateNode}if(!c)throw Error(t(147,n));var d=c,m=""+n;return i!==null&&i.ref!==null&&typeof i.ref=="function"&&i.ref._stringRef===m?i.ref:(i=function(v){var I=d.refs;v===null?delete I[m]:I[m]=v},i._stringRef=m,i)}if(typeof n!="string")throw Error(t(284));if(!a._owner)throw Error(t(290,n))}return n}function Yl(n,i){throw n=Object.prototype.toString.call(i),Error(t(31,n==="[object Object]"?"object with keys {"+Object.keys(i).join(", ")+"}":n))}function Cp(n){var i=n._init;return i(n._payload)}function Pp(n){function i(M,N){if(n){var b=M.deletions;b===null?(M.deletions=[N],M.flags|=16):b.push(N)}}function a(M,N){if(!n)return null;for(;N!==null;)i(M,N),N=N.sibling;return null}function c(M,N){for(M=new Map;N!==null;)N.key!==null?M.set(N.key,N):M.set(N.index,N),N=N.sibling;return M}function d(M,N){return M=ri(M,N),M.index=0,M.sibling=null,M}function m(M,N,b){return M.index=b,n?(b=M.alternate,b!==null?(b=b.index,b<N?(M.flags|=2,N):b):(M.flags|=2,N)):(M.flags|=1048576,N)}function v(M){return n&&M.alternate===null&&(M.flags|=2),M}function I(M,N,b,X){return N===null||N.tag!==6?(N=Jh(b,M.mode,X),N.return=M,N):(N=d(N,b),N.return=M,N)}function P(M,N,b,X){var ue=b.type;return ue===D?K(M,N,b.props.children,X,b.key):N!==null&&(N.elementType===ue||typeof ue=="object"&&ue!==null&&ue.$$typeof===Vt&&Cp(ue)===N.type)?(X=d(N,b.props),X.ref=pa(M,N,b),X.return=M,X):(X=Tu(b.type,b.key,b.props,null,M.mode,X),X.ref=pa(M,N,b),X.return=M,X)}function U(M,N,b,X){return N===null||N.tag!==4||N.stateNode.containerInfo!==b.containerInfo||N.stateNode.implementation!==b.implementation?(N=Yh(b,M.mode,X),N.return=M,N):(N=d(N,b.children||[]),N.return=M,N)}function K(M,N,b,X,ue){return N===null||N.tag!==7?(N=ns(b,M.mode,X,ue),N.return=M,N):(N=d(N,b),N.return=M,N)}function Q(M,N,b){if(typeof N=="string"&&N!==""||typeof N=="number")return N=Jh(""+N,M.mode,b),N.return=M,N;if(typeof N=="object"&&N!==null){switch(N.$$typeof){case Le:return b=Tu(N.type,N.key,N.props,null,M.mode,b),b.ref=pa(M,null,N),b.return=M,b;case Re:return N=Yh(N,M.mode,b),N.return=M,N;case Vt:var X=N._init;return Q(M,X(N._payload),b)}if(lr(N)||de(N))return N=ns(N,M.mode,b,null),N.return=M,N;Yl(M,N)}return null}function q(M,N,b,X){var ue=N!==null?N.key:null;if(typeof b=="string"&&b!==""||typeof b=="number")return ue!==null?null:I(M,N,""+b,X);if(typeof b=="object"&&b!==null){switch(b.$$typeof){case Le:return b.key===ue?P(M,N,b,X):null;case Re:return b.key===ue?U(M,N,b,X):null;case Vt:return ue=b._init,q(M,N,ue(b._payload),X)}if(lr(b)||de(b))return ue!==null?null:K(M,N,b,X,null);Yl(M,b)}return null}function ee(M,N,b,X,ue){if(typeof X=="string"&&X!==""||typeof X=="number")return M=M.get(b)||null,I(N,M,""+X,ue);if(typeof X=="object"&&X!==null){switch(X.$$typeof){case Le:return M=M.get(X.key===null?b:X.key)||null,P(N,M,X,ue);case Re:return M=M.get(X.key===null?b:X.key)||null,U(N,M,X,ue);case Vt:var fe=X._init;return ee(M,N,b,fe(X._payload),ue)}if(lr(X)||de(X))return M=M.get(b)||null,K(N,M,X,ue,null);Yl(N,X)}return null}function oe(M,N,b,X){for(var ue=null,fe=null,pe=N,ve=N=0,Tt=null;pe!==null&&ve<b.length;ve++){pe.index>ve?(Tt=pe,pe=null):Tt=pe.sibling;var xe=q(M,pe,b[ve],X);if(xe===null){pe===null&&(pe=Tt);break}n&&pe&&xe.alternate===null&&i(M,pe),N=m(xe,N,ve),fe===null?ue=xe:fe.sibling=xe,fe=xe,pe=Tt}if(ve===b.length)return a(M,pe),Qe&&Gi(M,ve),ue;if(pe===null){for(;ve<b.length;ve++)pe=Q(M,b[ve],X),pe!==null&&(N=m(pe,N,ve),fe===null?ue=pe:fe.sibling=pe,fe=pe);return Qe&&Gi(M,ve),ue}for(pe=c(M,pe);ve<b.length;ve++)Tt=ee(pe,M,ve,b[ve],X),Tt!==null&&(n&&Tt.alternate!==null&&pe.delete(Tt.key===null?ve:Tt.key),N=m(Tt,N,ve),fe===null?ue=Tt:fe.sibling=Tt,fe=Tt);return n&&pe.forEach(function(ii){return i(M,ii)}),Qe&&Gi(M,ve),ue}function le(M,N,b,X){var ue=de(b);if(typeof ue!="function")throw Error(t(150));if(b=ue.call(b),b==null)throw Error(t(151));for(var fe=ue=null,pe=N,ve=N=0,Tt=null,xe=b.next();pe!==null&&!xe.done;ve++,xe=b.next()){pe.index>ve?(Tt=pe,pe=null):Tt=pe.sibling;var ii=q(M,pe,xe.value,X);if(ii===null){pe===null&&(pe=Tt);break}n&&pe&&ii.alternate===null&&i(M,pe),N=m(ii,N,ve),fe===null?ue=ii:fe.sibling=ii,fe=ii,pe=Tt}if(xe.done)return a(M,pe),Qe&&Gi(M,ve),ue;if(pe===null){for(;!xe.done;ve++,xe=b.next())xe=Q(M,xe.value,X),xe!==null&&(N=m(xe,N,ve),fe===null?ue=xe:fe.sibling=xe,fe=xe);return Qe&&Gi(M,ve),ue}for(pe=c(M,pe);!xe.done;ve++,xe=b.next())xe=ee(pe,M,ve,xe.value,X),xe!==null&&(n&&xe.alternate!==null&&pe.delete(xe.key===null?ve:xe.key),N=m(xe,N,ve),fe===null?ue=xe:fe.sibling=xe,fe=xe);return n&&pe.forEach(function(Cw){return i(M,Cw)}),Qe&&Gi(M,ve),ue}function rt(M,N,b,X){if(typeof b=="object"&&b!==null&&b.type===D&&b.key===null&&(b=b.props.children),typeof b=="object"&&b!==null){switch(b.$$typeof){case Le:e:{for(var ue=b.key,fe=N;fe!==null;){if(fe.key===ue){if(ue=b.type,ue===D){if(fe.tag===7){a(M,fe.sibling),N=d(fe,b.props.children),N.return=M,M=N;break e}}else if(fe.elementType===ue||typeof ue=="object"&&ue!==null&&ue.$$typeof===Vt&&Cp(ue)===fe.type){a(M,fe.sibling),N=d(fe,b.props),N.ref=pa(M,fe,b),N.return=M,M=N;break e}a(M,fe);break}else i(M,fe);fe=fe.sibling}b.type===D?(N=ns(b.props.children,M.mode,X,b.key),N.return=M,M=N):(X=Tu(b.type,b.key,b.props,null,M.mode,X),X.ref=pa(M,N,b),X.return=M,M=X)}return v(M);case Re:e:{for(fe=b.key;N!==null;){if(N.key===fe)if(N.tag===4&&N.stateNode.containerInfo===b.containerInfo&&N.stateNode.implementation===b.implementation){a(M,N.sibling),N=d(N,b.children||[]),N.return=M,M=N;break e}else{a(M,N);break}else i(M,N);N=N.sibling}N=Yh(b,M.mode,X),N.return=M,M=N}return v(M);case Vt:return fe=b._init,rt(M,N,fe(b._payload),X)}if(lr(b))return oe(M,N,b,X);if(de(b))return le(M,N,b,X);Yl(M,b)}return typeof b=="string"&&b!==""||typeof b=="number"?(b=""+b,N!==null&&N.tag===6?(a(M,N.sibling),N=d(N,b),N.return=M,M=N):(a(M,N),N=Jh(b,M.mode,X),N.return=M,M=N),v(M)):a(M,N)}return rt}var eo=Pp(!0),kp=Pp(!1),Zl=Kr(null),eu=null,to=null,ah=null;function lh(){ah=to=eu=null}function uh(n){var i=Zl.current;qe(Zl),n._currentValue=i}function ch(n,i,a){for(;n!==null;){var c=n.alternate;if((n.childLanes&i)!==i?(n.childLanes|=i,c!==null&&(c.childLanes|=i)):c!==null&&(c.childLanes&i)!==i&&(c.childLanes|=i),n===a)break;n=n.return}}function no(n,i){eu=n,ah=to=null,n=n.dependencies,n!==null&&n.firstContext!==null&&((n.lanes&i)!==0&&(Xt=!0),n.firstContext=null)}function mn(n){var i=n._currentValue;if(ah!==n)if(n={context:n,memoizedValue:i,next:null},to===null){if(eu===null)throw Error(t(308));to=n,eu.dependencies={lanes:0,firstContext:n}}else to=to.next=n;return i}var Qi=null;function hh(n){Qi===null?Qi=[n]:Qi.push(n)}function Np(n,i,a,c){var d=i.interleaved;return d===null?(a.next=a,hh(i)):(a.next=d.next,d.next=a),i.interleaved=a,wr(n,c)}function wr(n,i){n.lanes|=i;var a=n.alternate;for(a!==null&&(a.lanes|=i),a=n,n=n.return;n!==null;)n.childLanes|=i,a=n.alternate,a!==null&&(a.childLanes|=i),a=n,n=n.return;return a.tag===3?a.stateNode:null}var Xr=!1;function dh(n){n.updateQueue={baseState:n.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function Dp(n,i){n=n.updateQueue,i.updateQueue===n&&(i.updateQueue={baseState:n.baseState,firstBaseUpdate:n.firstBaseUpdate,lastBaseUpdate:n.lastBaseUpdate,shared:n.shared,effects:n.effects})}function Tr(n,i){return{eventTime:n,lane:i,tag:0,payload:null,callback:null,next:null}}function Jr(n,i,a){var c=n.updateQueue;if(c===null)return null;if(c=c.shared,(Ve&2)!==0){var d=c.pending;return d===null?i.next=i:(i.next=d.next,d.next=i),c.pending=i,wr(n,a)}return d=c.interleaved,d===null?(i.next=i,hh(c)):(i.next=d.next,d.next=i),c.interleaved=i,wr(n,a)}function tu(n,i,a){if(i=i.updateQueue,i!==null&&(i=i.shared,(a&4194240)!==0)){var c=i.lanes;c&=n.pendingLanes,a|=c,i.lanes=a,jr(n,a)}}function Op(n,i){var a=n.updateQueue,c=n.alternate;if(c!==null&&(c=c.updateQueue,a===c)){var d=null,m=null;if(a=a.firstBaseUpdate,a!==null){do{var v={eventTime:a.eventTime,lane:a.lane,tag:a.tag,payload:a.payload,callback:a.callback,next:null};m===null?d=m=v:m=m.next=v,a=a.next}while(a!==null);m===null?d=m=i:m=m.next=i}else d=m=i;a={baseState:c.baseState,firstBaseUpdate:d,lastBaseUpdate:m,shared:c.shared,effects:c.effects},n.updateQueue=a;return}n=a.lastBaseUpdate,n===null?a.firstBaseUpdate=i:n.next=i,a.lastBaseUpdate=i}function nu(n,i,a,c){var d=n.updateQueue;Xr=!1;var m=d.firstBaseUpdate,v=d.lastBaseUpdate,I=d.shared.pending;if(I!==null){d.shared.pending=null;var P=I,U=P.next;P.next=null,v===null?m=U:v.next=U,v=P;var K=n.alternate;K!==null&&(K=K.updateQueue,I=K.lastBaseUpdate,I!==v&&(I===null?K.firstBaseUpdate=U:I.next=U,K.lastBaseUpdate=P))}if(m!==null){var Q=d.baseState;v=0,K=U=P=null,I=m;do{var q=I.lane,ee=I.eventTime;if((c&q)===q){K!==null&&(K=K.next={eventTime:ee,lane:0,tag:I.tag,payload:I.payload,callback:I.callback,next:null});e:{var oe=n,le=I;switch(q=i,ee=a,le.tag){case 1:if(oe=le.payload,typeof oe=="function"){Q=oe.call(ee,Q,q);break e}Q=oe;break e;case 3:oe.flags=oe.flags&-65537|128;case 0:if(oe=le.payload,q=typeof oe=="function"?oe.call(ee,Q,q):oe,q==null)break e;Q=ne({},Q,q);break e;case 2:Xr=!0}}I.callback!==null&&I.lane!==0&&(n.flags|=64,q=d.effects,q===null?d.effects=[I]:q.push(I))}else ee={eventTime:ee,lane:q,tag:I.tag,payload:I.payload,callback:I.callback,next:null},K===null?(U=K=ee,P=Q):K=K.next=ee,v|=q;if(I=I.next,I===null){if(I=d.shared.pending,I===null)break;q=I,I=q.next,q.next=null,d.lastBaseUpdate=q,d.shared.pending=null}}while(!0);if(K===null&&(P=Q),d.baseState=P,d.firstBaseUpdate=U,d.lastBaseUpdate=K,i=d.shared.interleaved,i!==null){d=i;do v|=d.lane,d=d.next;while(d!==i)}else m===null&&(d.shared.lanes=0);Yi|=v,n.lanes=v,n.memoizedState=Q}}function Vp(n,i,a){if(n=i.effects,i.effects=null,n!==null)for(i=0;i<n.length;i++){var c=n[i],d=c.callback;if(d!==null){if(c.callback=null,c=a,typeof d!="function")throw Error(t(191,d));d.call(c)}}}var ma={},Qn=Kr(ma),ga=Kr(ma),ya=Kr(ma);function Xi(n){if(n===ma)throw Error(t(174));return n}function fh(n,i){switch(We(ya,i),We(ga,n),We(Qn,ma),n=i.nodeType,n){case 9:case 11:i=(i=i.documentElement)?i.namespaceURI:dt(null,"");break;default:n=n===8?i.parentNode:i,i=n.namespaceURI||null,n=n.tagName,i=dt(i,n)}qe(Qn),We(Qn,i)}function ro(){qe(Qn),qe(ga),qe(ya)}function xp(n){Xi(ya.current);var i=Xi(Qn.current),a=dt(i,n.type);i!==a&&(We(ga,n),We(Qn,a))}function ph(n){ga.current===n&&(qe(Qn),qe(ga))}var Xe=Kr(0);function ru(n){for(var i=n;i!==null;){if(i.tag===13){var a=i.memoizedState;if(a!==null&&(a=a.dehydrated,a===null||a.data==="$?"||a.data==="$!"))return i}else if(i.tag===19&&i.memoizedProps.revealOrder!==void 0){if((i.flags&128)!==0)return i}else if(i.child!==null){i.child.return=i,i=i.child;continue}if(i===n)break;for(;i.sibling===null;){if(i.return===null||i.return===n)return null;i=i.return}i.sibling.return=i.return,i=i.sibling}return null}var mh=[];function gh(){for(var n=0;n<mh.length;n++)mh[n]._workInProgressVersionPrimary=null;mh.length=0}var iu=ge.ReactCurrentDispatcher,yh=ge.ReactCurrentBatchConfig,Ji=0,Je=null,pt=null,Et=null,su=!1,_a=!1,va=0,QE=0;function Lt(){throw Error(t(321))}function _h(n,i){if(i===null)return!1;for(var a=0;a<i.length&&a<n.length;a++)if(!On(n[a],i[a]))return!1;return!0}function vh(n,i,a,c,d,m){if(Ji=m,Je=i,i.memoizedState=null,i.updateQueue=null,i.lanes=0,iu.current=n===null||n.memoizedState===null?ZE:ew,n=a(c,d),_a){m=0;do{if(_a=!1,va=0,25<=m)throw Error(t(301));m+=1,Et=pt=null,i.updateQueue=null,iu.current=tw,n=a(c,d)}while(_a)}if(iu.current=lu,i=pt!==null&&pt.next!==null,Ji=0,Et=pt=Je=null,su=!1,i)throw Error(t(300));return n}function Eh(){var n=va!==0;return va=0,n}function Xn(){var n={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return Et===null?Je.memoizedState=Et=n:Et=Et.next=n,Et}function gn(){if(pt===null){var n=Je.alternate;n=n!==null?n.memoizedState:null}else n=pt.next;var i=Et===null?Je.memoizedState:Et.next;if(i!==null)Et=i,pt=n;else{if(n===null)throw Error(t(310));pt=n,n={memoizedState:pt.memoizedState,baseState:pt.baseState,baseQueue:pt.baseQueue,queue:pt.queue,next:null},Et===null?Je.memoizedState=Et=n:Et=Et.next=n}return Et}function Ea(n,i){return typeof i=="function"?i(n):i}function wh(n){var i=gn(),a=i.queue;if(a===null)throw Error(t(311));a.lastRenderedReducer=n;var c=pt,d=c.baseQueue,m=a.pending;if(m!==null){if(d!==null){var v=d.next;d.next=m.next,m.next=v}c.baseQueue=d=m,a.pending=null}if(d!==null){m=d.next,c=c.baseState;var I=v=null,P=null,U=m;do{var K=U.lane;if((Ji&K)===K)P!==null&&(P=P.next={lane:0,action:U.action,hasEagerState:U.hasEagerState,eagerState:U.eagerState,next:null}),c=U.hasEagerState?U.eagerState:n(c,U.action);else{var Q={lane:K,action:U.action,hasEagerState:U.hasEagerState,eagerState:U.eagerState,next:null};P===null?(I=P=Q,v=c):P=P.next=Q,Je.lanes|=K,Yi|=K}U=U.next}while(U!==null&&U!==m);P===null?v=c:P.next=I,On(c,i.memoizedState)||(Xt=!0),i.memoizedState=c,i.baseState=v,i.baseQueue=P,a.lastRenderedState=c}if(n=a.interleaved,n!==null){d=n;do m=d.lane,Je.lanes|=m,Yi|=m,d=d.next;while(d!==n)}else d===null&&(a.lanes=0);return[i.memoizedState,a.dispatch]}function Th(n){var i=gn(),a=i.queue;if(a===null)throw Error(t(311));a.lastRenderedReducer=n;var c=a.dispatch,d=a.pending,m=i.memoizedState;if(d!==null){a.pending=null;var v=d=d.next;do m=n(m,v.action),v=v.next;while(v!==d);On(m,i.memoizedState)||(Xt=!0),i.memoizedState=m,i.baseQueue===null&&(i.baseState=m),a.lastRenderedState=m}return[m,c]}function Lp(){}function Mp(n,i){var a=Je,c=gn(),d=i(),m=!On(c.memoizedState,d);if(m&&(c.memoizedState=d,Xt=!0),c=c.queue,Ih(Up.bind(null,a,c,n),[n]),c.getSnapshot!==i||m||Et!==null&&Et.memoizedState.tag&1){if(a.flags|=2048,wa(9,Fp.bind(null,a,c,d,i),void 0,null),wt===null)throw Error(t(349));(Ji&30)!==0||bp(a,i,d)}return d}function bp(n,i,a){n.flags|=16384,n={getSnapshot:i,value:a},i=Je.updateQueue,i===null?(i={lastEffect:null,stores:null},Je.updateQueue=i,i.stores=[n]):(a=i.stores,a===null?i.stores=[n]:a.push(n))}function Fp(n,i,a,c){i.value=a,i.getSnapshot=c,jp(i)&&zp(n)}function Up(n,i,a){return a(function(){jp(i)&&zp(n)})}function jp(n){var i=n.getSnapshot;n=n.value;try{var a=i();return!On(n,a)}catch{return!0}}function zp(n){var i=wr(n,1);i!==null&&bn(i,n,1,-1)}function Bp(n){var i=Xn();return typeof n=="function"&&(n=n()),i.memoizedState=i.baseState=n,n={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:Ea,lastRenderedState:n},i.queue=n,n=n.dispatch=YE.bind(null,Je,n),[i.memoizedState,n]}function wa(n,i,a,c){return n={tag:n,create:i,destroy:a,deps:c,next:null},i=Je.updateQueue,i===null?(i={lastEffect:null,stores:null},Je.updateQueue=i,i.lastEffect=n.next=n):(a=i.lastEffect,a===null?i.lastEffect=n.next=n:(c=a.next,a.next=n,n.next=c,i.lastEffect=n)),n}function $p(){return gn().memoizedState}function ou(n,i,a,c){var d=Xn();Je.flags|=n,d.memoizedState=wa(1|i,a,void 0,c===void 0?null:c)}function au(n,i,a,c){var d=gn();c=c===void 0?null:c;var m=void 0;if(pt!==null){var v=pt.memoizedState;if(m=v.destroy,c!==null&&_h(c,v.deps)){d.memoizedState=wa(i,a,m,c);return}}Je.flags|=n,d.memoizedState=wa(1|i,a,m,c)}function Wp(n,i){return ou(8390656,8,n,i)}function Ih(n,i){return au(2048,8,n,i)}function Hp(n,i){return au(4,2,n,i)}function qp(n,i){return au(4,4,n,i)}function Kp(n,i){if(typeof i=="function")return n=n(),i(n),function(){i(null)};if(i!=null)return n=n(),i.current=n,function(){i.current=null}}function Gp(n,i,a){return a=a!=null?a.concat([n]):null,au(4,4,Kp.bind(null,i,n),a)}function Sh(){}function Qp(n,i){var a=gn();i=i===void 0?null:i;var c=a.memoizedState;return c!==null&&i!==null&&_h(i,c[1])?c[0]:(a.memoizedState=[n,i],n)}function Xp(n,i){var a=gn();i=i===void 0?null:i;var c=a.memoizedState;return c!==null&&i!==null&&_h(i,c[1])?c[0]:(n=n(),a.memoizedState=[n,i],n)}function Jp(n,i,a){return(Ji&21)===0?(n.baseState&&(n.baseState=!1,Xt=!0),n.memoizedState=a):(On(a,i)||(a=ji(),Je.lanes|=a,Yi|=a,n.baseState=!0),i)}function XE(n,i){var a=ke;ke=a!==0&&4>a?a:4,n(!0);var c=yh.transition;yh.transition={};try{n(!1),i()}finally{ke=a,yh.transition=c}}function Yp(){return gn().memoizedState}function JE(n,i,a){var c=ti(n);if(a={lane:c,action:a,hasEagerState:!1,eagerState:null,next:null},Zp(n))em(i,a);else if(a=Np(n,i,a,c),a!==null){var d=Ht();bn(a,n,c,d),tm(a,i,c)}}function YE(n,i,a){var c=ti(n),d={lane:c,action:a,hasEagerState:!1,eagerState:null,next:null};if(Zp(n))em(i,d);else{var m=n.alternate;if(n.lanes===0&&(m===null||m.lanes===0)&&(m=i.lastRenderedReducer,m!==null))try{var v=i.lastRenderedState,I=m(v,a);if(d.hasEagerState=!0,d.eagerState=I,On(I,v)){var P=i.interleaved;P===null?(d.next=d,hh(i)):(d.next=P.next,P.next=d),i.interleaved=d;return}}catch{}finally{}a=Np(n,i,d,c),a!==null&&(d=Ht(),bn(a,n,c,d),tm(a,i,c))}}function Zp(n){var i=n.alternate;return n===Je||i!==null&&i===Je}function em(n,i){_a=su=!0;var a=n.pending;a===null?i.next=i:(i.next=a.next,a.next=i),n.pending=i}function tm(n,i,a){if((a&4194240)!==0){var c=i.lanes;c&=n.pendingLanes,a|=c,i.lanes=a,jr(n,a)}}var lu={readContext:mn,useCallback:Lt,useContext:Lt,useEffect:Lt,useImperativeHandle:Lt,useInsertionEffect:Lt,useLayoutEffect:Lt,useMemo:Lt,useReducer:Lt,useRef:Lt,useState:Lt,useDebugValue:Lt,useDeferredValue:Lt,useTransition:Lt,useMutableSource:Lt,useSyncExternalStore:Lt,useId:Lt,unstable_isNewReconciler:!1},ZE={readContext:mn,useCallback:function(n,i){return Xn().memoizedState=[n,i===void 0?null:i],n},useContext:mn,useEffect:Wp,useImperativeHandle:function(n,i,a){return a=a!=null?a.concat([n]):null,ou(4194308,4,Kp.bind(null,i,n),a)},useLayoutEffect:function(n,i){return ou(4194308,4,n,i)},useInsertionEffect:function(n,i){return ou(4,2,n,i)},useMemo:function(n,i){var a=Xn();return i=i===void 0?null:i,n=n(),a.memoizedState=[n,i],n},useReducer:function(n,i,a){var c=Xn();return i=a!==void 0?a(i):i,c.memoizedState=c.baseState=i,n={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:n,lastRenderedState:i},c.queue=n,n=n.dispatch=JE.bind(null,Je,n),[c.memoizedState,n]},useRef:function(n){var i=Xn();return n={current:n},i.memoizedState=n},useState:Bp,useDebugValue:Sh,useDeferredValue:function(n){return Xn().memoizedState=n},useTransition:function(){var n=Bp(!1),i=n[0];return n=XE.bind(null,n[1]),Xn().memoizedState=n,[i,n]},useMutableSource:function(){},useSyncExternalStore:function(n,i,a){var c=Je,d=Xn();if(Qe){if(a===void 0)throw Error(t(407));a=a()}else{if(a=i(),wt===null)throw Error(t(349));(Ji&30)!==0||bp(c,i,a)}d.memoizedState=a;var m={value:a,getSnapshot:i};return d.queue=m,Wp(Up.bind(null,c,m,n),[n]),c.flags|=2048,wa(9,Fp.bind(null,c,m,a,i),void 0,null),a},useId:function(){var n=Xn(),i=wt.identifierPrefix;if(Qe){var a=Er,c=vr;a=(c&~(1<<32-Bt(c)-1)).toString(32)+a,i=":"+i+"R"+a,a=va++,0<a&&(i+="H"+a.toString(32)),i+=":"}else a=QE++,i=":"+i+"r"+a.toString(32)+":";return n.memoizedState=i},unstable_isNewReconciler:!1},ew={readContext:mn,useCallback:Qp,useContext:mn,useEffect:Ih,useImperativeHandle:Gp,useInsertionEffect:Hp,useLayoutEffect:qp,useMemo:Xp,useReducer:wh,useRef:$p,useState:function(){return wh(Ea)},useDebugValue:Sh,useDeferredValue:function(n){var i=gn();return Jp(i,pt.memoizedState,n)},useTransition:function(){var n=wh(Ea)[0],i=gn().memoizedState;return[n,i]},useMutableSource:Lp,useSyncExternalStore:Mp,useId:Yp,unstable_isNewReconciler:!1},tw={readContext:mn,useCallback:Qp,useContext:mn,useEffect:Ih,useImperativeHandle:Gp,useInsertionEffect:Hp,useLayoutEffect:qp,useMemo:Xp,useReducer:Th,useRef:$p,useState:function(){return Th(Ea)},useDebugValue:Sh,useDeferredValue:function(n){var i=gn();return pt===null?i.memoizedState=n:Jp(i,pt.memoizedState,n)},useTransition:function(){var n=Th(Ea)[0],i=gn().memoizedState;return[n,i]},useMutableSource:Lp,useSyncExternalStore:Mp,useId:Yp,unstable_isNewReconciler:!1};function xn(n,i){if(n&&n.defaultProps){i=ne({},i),n=n.defaultProps;for(var a in n)i[a]===void 0&&(i[a]=n[a]);return i}return i}function Ah(n,i,a,c){i=n.memoizedState,a=a(c,i),a=a==null?i:ne({},i,a),n.memoizedState=a,n.lanes===0&&(n.updateQueue.baseState=a)}var uu={isMounted:function(n){return(n=n._reactInternals)?An(n)===n:!1},enqueueSetState:function(n,i,a){n=n._reactInternals;var c=Ht(),d=ti(n),m=Tr(c,d);m.payload=i,a!=null&&(m.callback=a),i=Jr(n,m,d),i!==null&&(bn(i,n,d,c),tu(i,n,d))},enqueueReplaceState:function(n,i,a){n=n._reactInternals;var c=Ht(),d=ti(n),m=Tr(c,d);m.tag=1,m.payload=i,a!=null&&(m.callback=a),i=Jr(n,m,d),i!==null&&(bn(i,n,d,c),tu(i,n,d))},enqueueForceUpdate:function(n,i){n=n._reactInternals;var a=Ht(),c=ti(n),d=Tr(a,c);d.tag=2,i!=null&&(d.callback=i),i=Jr(n,d,c),i!==null&&(bn(i,n,c,a),tu(i,n,c))}};function nm(n,i,a,c,d,m,v){return n=n.stateNode,typeof n.shouldComponentUpdate=="function"?n.shouldComponentUpdate(c,m,v):i.prototype&&i.prototype.isPureReactComponent?!aa(a,c)||!aa(d,m):!0}function rm(n,i,a){var c=!1,d=Gr,m=i.contextType;return typeof m=="object"&&m!==null?m=mn(m):(d=Qt(i)?qi:xt.current,c=i.contextTypes,m=(c=c!=null)?Xs(n,d):Gr),i=new i(a,m),n.memoizedState=i.state!==null&&i.state!==void 0?i.state:null,i.updater=uu,n.stateNode=i,i._reactInternals=n,c&&(n=n.stateNode,n.__reactInternalMemoizedUnmaskedChildContext=d,n.__reactInternalMemoizedMaskedChildContext=m),i}function im(n,i,a,c){n=i.state,typeof i.componentWillReceiveProps=="function"&&i.componentWillReceiveProps(a,c),typeof i.UNSAFE_componentWillReceiveProps=="function"&&i.UNSAFE_componentWillReceiveProps(a,c),i.state!==n&&uu.enqueueReplaceState(i,i.state,null)}function Rh(n,i,a,c){var d=n.stateNode;d.props=a,d.state=n.memoizedState,d.refs={},dh(n);var m=i.contextType;typeof m=="object"&&m!==null?d.context=mn(m):(m=Qt(i)?qi:xt.current,d.context=Xs(n,m)),d.state=n.memoizedState,m=i.getDerivedStateFromProps,typeof m=="function"&&(Ah(n,i,m,a),d.state=n.memoizedState),typeof i.getDerivedStateFromProps=="function"||typeof d.getSnapshotBeforeUpdate=="function"||typeof d.UNSAFE_componentWillMount!="function"&&typeof d.componentWillMount!="function"||(i=d.state,typeof d.componentWillMount=="function"&&d.componentWillMount(),typeof d.UNSAFE_componentWillMount=="function"&&d.UNSAFE_componentWillMount(),i!==d.state&&uu.enqueueReplaceState(d,d.state,null),nu(n,a,d,c),d.state=n.memoizedState),typeof d.componentDidMount=="function"&&(n.flags|=4194308)}function io(n,i){try{var a="",c=i;do a+=Se(c),c=c.return;while(c);var d=a}catch(m){d=`
Error generating stack: `+m.message+`
`+m.stack}return{value:n,source:i,stack:d,digest:null}}function Ch(n,i,a){return{value:n,source:null,stack:a??null,digest:i??null}}function Ph(n,i){try{console.error(i.value)}catch(a){setTimeout(function(){throw a})}}var nw=typeof WeakMap=="function"?WeakMap:Map;function sm(n,i,a){a=Tr(-1,a),a.tag=3,a.payload={element:null};var c=i.value;return a.callback=function(){gu||(gu=!0,$h=c),Ph(n,i)},a}function om(n,i,a){a=Tr(-1,a),a.tag=3;var c=n.type.getDerivedStateFromError;if(typeof c=="function"){var d=i.value;a.payload=function(){return c(d)},a.callback=function(){Ph(n,i)}}var m=n.stateNode;return m!==null&&typeof m.componentDidCatch=="function"&&(a.callback=function(){Ph(n,i),typeof c!="function"&&(Zr===null?Zr=new Set([this]):Zr.add(this));var v=i.stack;this.componentDidCatch(i.value,{componentStack:v!==null?v:""})}),a}function am(n,i,a){var c=n.pingCache;if(c===null){c=n.pingCache=new nw;var d=new Set;c.set(i,d)}else d=c.get(i),d===void 0&&(d=new Set,c.set(i,d));d.has(a)||(d.add(a),n=gw.bind(null,n,i,a),i.then(n,n))}function lm(n){do{var i;if((i=n.tag===13)&&(i=n.memoizedState,i=i!==null?i.dehydrated!==null:!0),i)return n;n=n.return}while(n!==null);return null}function um(n,i,a,c,d){return(n.mode&1)===0?(n===i?n.flags|=65536:(n.flags|=128,a.flags|=131072,a.flags&=-52805,a.tag===1&&(a.alternate===null?a.tag=17:(i=Tr(-1,1),i.tag=2,Jr(a,i,1))),a.lanes|=1),n):(n.flags|=65536,n.lanes=d,n)}var rw=ge.ReactCurrentOwner,Xt=!1;function Wt(n,i,a,c){i.child=n===null?kp(i,null,a,c):eo(i,n.child,a,c)}function cm(n,i,a,c,d){a=a.render;var m=i.ref;return no(i,d),c=vh(n,i,a,c,m,d),a=Eh(),n!==null&&!Xt?(i.updateQueue=n.updateQueue,i.flags&=-2053,n.lanes&=~d,Ir(n,i,d)):(Qe&&a&&nh(i),i.flags|=1,Wt(n,i,c,d),i.child)}function hm(n,i,a,c,d){if(n===null){var m=a.type;return typeof m=="function"&&!Xh(m)&&m.defaultProps===void 0&&a.compare===null&&a.defaultProps===void 0?(i.tag=15,i.type=m,dm(n,i,m,c,d)):(n=Tu(a.type,null,c,i,i.mode,d),n.ref=i.ref,n.return=i,i.child=n)}if(m=n.child,(n.lanes&d)===0){var v=m.memoizedProps;if(a=a.compare,a=a!==null?a:aa,a(v,c)&&n.ref===i.ref)return Ir(n,i,d)}return i.flags|=1,n=ri(m,c),n.ref=i.ref,n.return=i,i.child=n}function dm(n,i,a,c,d){if(n!==null){var m=n.memoizedProps;if(aa(m,c)&&n.ref===i.ref)if(Xt=!1,i.pendingProps=c=m,(n.lanes&d)!==0)(n.flags&131072)!==0&&(Xt=!0);else return i.lanes=n.lanes,Ir(n,i,d)}return kh(n,i,a,c,d)}function fm(n,i,a){var c=i.pendingProps,d=c.children,m=n!==null?n.memoizedState:null;if(c.mode==="hidden")if((i.mode&1)===0)i.memoizedState={baseLanes:0,cachePool:null,transitions:null},We(oo,ln),ln|=a;else{if((a&1073741824)===0)return n=m!==null?m.baseLanes|a:a,i.lanes=i.childLanes=1073741824,i.memoizedState={baseLanes:n,cachePool:null,transitions:null},i.updateQueue=null,We(oo,ln),ln|=n,null;i.memoizedState={baseLanes:0,cachePool:null,transitions:null},c=m!==null?m.baseLanes:a,We(oo,ln),ln|=c}else m!==null?(c=m.baseLanes|a,i.memoizedState=null):c=a,We(oo,ln),ln|=c;return Wt(n,i,d,a),i.child}function pm(n,i){var a=i.ref;(n===null&&a!==null||n!==null&&n.ref!==a)&&(i.flags|=512,i.flags|=2097152)}function kh(n,i,a,c,d){var m=Qt(a)?qi:xt.current;return m=Xs(i,m),no(i,d),a=vh(n,i,a,c,m,d),c=Eh(),n!==null&&!Xt?(i.updateQueue=n.updateQueue,i.flags&=-2053,n.lanes&=~d,Ir(n,i,d)):(Qe&&c&&nh(i),i.flags|=1,Wt(n,i,a,d),i.child)}function mm(n,i,a,c,d){if(Qt(a)){var m=!0;Kl(i)}else m=!1;if(no(i,d),i.stateNode===null)hu(n,i),rm(i,a,c),Rh(i,a,c,d),c=!0;else if(n===null){var v=i.stateNode,I=i.memoizedProps;v.props=I;var P=v.context,U=a.contextType;typeof U=="object"&&U!==null?U=mn(U):(U=Qt(a)?qi:xt.current,U=Xs(i,U));var K=a.getDerivedStateFromProps,Q=typeof K=="function"||typeof v.getSnapshotBeforeUpdate=="function";Q||typeof v.UNSAFE_componentWillReceiveProps!="function"&&typeof v.componentWillReceiveProps!="function"||(I!==c||P!==U)&&im(i,v,c,U),Xr=!1;var q=i.memoizedState;v.state=q,nu(i,c,v,d),P=i.memoizedState,I!==c||q!==P||Gt.current||Xr?(typeof K=="function"&&(Ah(i,a,K,c),P=i.memoizedState),(I=Xr||nm(i,a,I,c,q,P,U))?(Q||typeof v.UNSAFE_componentWillMount!="function"&&typeof v.componentWillMount!="function"||(typeof v.componentWillMount=="function"&&v.componentWillMount(),typeof v.UNSAFE_componentWillMount=="function"&&v.UNSAFE_componentWillMount()),typeof v.componentDidMount=="function"&&(i.flags|=4194308)):(typeof v.componentDidMount=="function"&&(i.flags|=4194308),i.memoizedProps=c,i.memoizedState=P),v.props=c,v.state=P,v.context=U,c=I):(typeof v.componentDidMount=="function"&&(i.flags|=4194308),c=!1)}else{v=i.stateNode,Dp(n,i),I=i.memoizedProps,U=i.type===i.elementType?I:xn(i.type,I),v.props=U,Q=i.pendingProps,q=v.context,P=a.contextType,typeof P=="object"&&P!==null?P=mn(P):(P=Qt(a)?qi:xt.current,P=Xs(i,P));var ee=a.getDerivedStateFromProps;(K=typeof ee=="function"||typeof v.getSnapshotBeforeUpdate=="function")||typeof v.UNSAFE_componentWillReceiveProps!="function"&&typeof v.componentWillReceiveProps!="function"||(I!==Q||q!==P)&&im(i,v,c,P),Xr=!1,q=i.memoizedState,v.state=q,nu(i,c,v,d);var oe=i.memoizedState;I!==Q||q!==oe||Gt.current||Xr?(typeof ee=="function"&&(Ah(i,a,ee,c),oe=i.memoizedState),(U=Xr||nm(i,a,U,c,q,oe,P)||!1)?(K||typeof v.UNSAFE_componentWillUpdate!="function"&&typeof v.componentWillUpdate!="function"||(typeof v.componentWillUpdate=="function"&&v.componentWillUpdate(c,oe,P),typeof v.UNSAFE_componentWillUpdate=="function"&&v.UNSAFE_componentWillUpdate(c,oe,P)),typeof v.componentDidUpdate=="function"&&(i.flags|=4),typeof v.getSnapshotBeforeUpdate=="function"&&(i.flags|=1024)):(typeof v.componentDidUpdate!="function"||I===n.memoizedProps&&q===n.memoizedState||(i.flags|=4),typeof v.getSnapshotBeforeUpdate!="function"||I===n.memoizedProps&&q===n.memoizedState||(i.flags|=1024),i.memoizedProps=c,i.memoizedState=oe),v.props=c,v.state=oe,v.context=P,c=U):(typeof v.componentDidUpdate!="function"||I===n.memoizedProps&&q===n.memoizedState||(i.flags|=4),typeof v.getSnapshotBeforeUpdate!="function"||I===n.memoizedProps&&q===n.memoizedState||(i.flags|=1024),c=!1)}return Nh(n,i,a,c,m,d)}function Nh(n,i,a,c,d,m){pm(n,i);var v=(i.flags&128)!==0;if(!c&&!v)return d&&Ep(i,a,!1),Ir(n,i,m);c=i.stateNode,rw.current=i;var I=v&&typeof a.getDerivedStateFromError!="function"?null:c.render();return i.flags|=1,n!==null&&v?(i.child=eo(i,n.child,null,m),i.child=eo(i,null,I,m)):Wt(n,i,I,m),i.memoizedState=c.state,d&&Ep(i,a,!0),i.child}function gm(n){var i=n.stateNode;i.pendingContext?_p(n,i.pendingContext,i.pendingContext!==i.context):i.context&&_p(n,i.context,!1),fh(n,i.containerInfo)}function ym(n,i,a,c,d){return Zs(),oh(d),i.flags|=256,Wt(n,i,a,c),i.child}var Dh={dehydrated:null,treeContext:null,retryLane:0};function Oh(n){return{baseLanes:n,cachePool:null,transitions:null}}function _m(n,i,a){var c=i.pendingProps,d=Xe.current,m=!1,v=(i.flags&128)!==0,I;if((I=v)||(I=n!==null&&n.memoizedState===null?!1:(d&2)!==0),I?(m=!0,i.flags&=-129):(n===null||n.memoizedState!==null)&&(d|=1),We(Xe,d&1),n===null)return sh(i),n=i.memoizedState,n!==null&&(n=n.dehydrated,n!==null)?((i.mode&1)===0?i.lanes=1:n.data==="$!"?i.lanes=8:i.lanes=1073741824,null):(v=c.children,n=c.fallback,m?(c=i.mode,m=i.child,v={mode:"hidden",children:v},(c&1)===0&&m!==null?(m.childLanes=0,m.pendingProps=v):m=Iu(v,c,0,null),n=ns(n,c,a,null),m.return=i,n.return=i,m.sibling=n,i.child=m,i.child.memoizedState=Oh(a),i.memoizedState=Dh,n):Vh(i,v));if(d=n.memoizedState,d!==null&&(I=d.dehydrated,I!==null))return iw(n,i,v,c,I,d,a);if(m){m=c.fallback,v=i.mode,d=n.child,I=d.sibling;var P={mode:"hidden",children:c.children};return(v&1)===0&&i.child!==d?(c=i.child,c.childLanes=0,c.pendingProps=P,i.deletions=null):(c=ri(d,P),c.subtreeFlags=d.subtreeFlags&14680064),I!==null?m=ri(I,m):(m=ns(m,v,a,null),m.flags|=2),m.return=i,c.return=i,c.sibling=m,i.child=c,c=m,m=i.child,v=n.child.memoizedState,v=v===null?Oh(a):{baseLanes:v.baseLanes|a,cachePool:null,transitions:v.transitions},m.memoizedState=v,m.childLanes=n.childLanes&~a,i.memoizedState=Dh,c}return m=n.child,n=m.sibling,c=ri(m,{mode:"visible",children:c.children}),(i.mode&1)===0&&(c.lanes=a),c.return=i,c.sibling=null,n!==null&&(a=i.deletions,a===null?(i.deletions=[n],i.flags|=16):a.push(n)),i.child=c,i.memoizedState=null,c}function Vh(n,i){return i=Iu({mode:"visible",children:i},n.mode,0,null),i.return=n,n.child=i}function cu(n,i,a,c){return c!==null&&oh(c),eo(i,n.child,null,a),n=Vh(i,i.pendingProps.children),n.flags|=2,i.memoizedState=null,n}function iw(n,i,a,c,d,m,v){if(a)return i.flags&256?(i.flags&=-257,c=Ch(Error(t(422))),cu(n,i,v,c)):i.memoizedState!==null?(i.child=n.child,i.flags|=128,null):(m=c.fallback,d=i.mode,c=Iu({mode:"visible",children:c.children},d,0,null),m=ns(m,d,v,null),m.flags|=2,c.return=i,m.return=i,c.sibling=m,i.child=c,(i.mode&1)!==0&&eo(i,n.child,null,v),i.child.memoizedState=Oh(v),i.memoizedState=Dh,m);if((i.mode&1)===0)return cu(n,i,v,null);if(d.data==="$!"){if(c=d.nextSibling&&d.nextSibling.dataset,c)var I=c.dgst;return c=I,m=Error(t(419)),c=Ch(m,c,void 0),cu(n,i,v,c)}if(I=(v&n.childLanes)!==0,Xt||I){if(c=wt,c!==null){switch(v&-v){case 4:d=2;break;case 16:d=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:d=32;break;case 536870912:d=268435456;break;default:d=0}d=(d&(c.suspendedLanes|v))!==0?0:d,d!==0&&d!==m.retryLane&&(m.retryLane=d,wr(n,d),bn(c,n,d,-1))}return Qh(),c=Ch(Error(t(421))),cu(n,i,v,c)}return d.data==="$?"?(i.flags|=128,i.child=n.child,i=yw.bind(null,n),d._reactRetry=i,null):(n=m.treeContext,an=qr(d.nextSibling),on=i,Qe=!0,Vn=null,n!==null&&(fn[pn++]=vr,fn[pn++]=Er,fn[pn++]=Ki,vr=n.id,Er=n.overflow,Ki=i),i=Vh(i,c.children),i.flags|=4096,i)}function vm(n,i,a){n.lanes|=i;var c=n.alternate;c!==null&&(c.lanes|=i),ch(n.return,i,a)}function xh(n,i,a,c,d){var m=n.memoizedState;m===null?n.memoizedState={isBackwards:i,rendering:null,renderingStartTime:0,last:c,tail:a,tailMode:d}:(m.isBackwards=i,m.rendering=null,m.renderingStartTime=0,m.last=c,m.tail=a,m.tailMode=d)}function Em(n,i,a){var c=i.pendingProps,d=c.revealOrder,m=c.tail;if(Wt(n,i,c.children,a),c=Xe.current,(c&2)!==0)c=c&1|2,i.flags|=128;else{if(n!==null&&(n.flags&128)!==0)e:for(n=i.child;n!==null;){if(n.tag===13)n.memoizedState!==null&&vm(n,a,i);else if(n.tag===19)vm(n,a,i);else if(n.child!==null){n.child.return=n,n=n.child;continue}if(n===i)break e;for(;n.sibling===null;){if(n.return===null||n.return===i)break e;n=n.return}n.sibling.return=n.return,n=n.sibling}c&=1}if(We(Xe,c),(i.mode&1)===0)i.memoizedState=null;else switch(d){case"forwards":for(a=i.child,d=null;a!==null;)n=a.alternate,n!==null&&ru(n)===null&&(d=a),a=a.sibling;a=d,a===null?(d=i.child,i.child=null):(d=a.sibling,a.sibling=null),xh(i,!1,d,a,m);break;case"backwards":for(a=null,d=i.child,i.child=null;d!==null;){if(n=d.alternate,n!==null&&ru(n)===null){i.child=d;break}n=d.sibling,d.sibling=a,a=d,d=n}xh(i,!0,a,null,m);break;case"together":xh(i,!1,null,null,void 0);break;default:i.memoizedState=null}return i.child}function hu(n,i){(i.mode&1)===0&&n!==null&&(n.alternate=null,i.alternate=null,i.flags|=2)}function Ir(n,i,a){if(n!==null&&(i.dependencies=n.dependencies),Yi|=i.lanes,(a&i.childLanes)===0)return null;if(n!==null&&i.child!==n.child)throw Error(t(153));if(i.child!==null){for(n=i.child,a=ri(n,n.pendingProps),i.child=a,a.return=i;n.sibling!==null;)n=n.sibling,a=a.sibling=ri(n,n.pendingProps),a.return=i;a.sibling=null}return i.child}function sw(n,i,a){switch(i.tag){case 3:gm(i),Zs();break;case 5:xp(i);break;case 1:Qt(i.type)&&Kl(i);break;case 4:fh(i,i.stateNode.containerInfo);break;case 10:var c=i.type._context,d=i.memoizedProps.value;We(Zl,c._currentValue),c._currentValue=d;break;case 13:if(c=i.memoizedState,c!==null)return c.dehydrated!==null?(We(Xe,Xe.current&1),i.flags|=128,null):(a&i.child.childLanes)!==0?_m(n,i,a):(We(Xe,Xe.current&1),n=Ir(n,i,a),n!==null?n.sibling:null);We(Xe,Xe.current&1);break;case 19:if(c=(a&i.childLanes)!==0,(n.flags&128)!==0){if(c)return Em(n,i,a);i.flags|=128}if(d=i.memoizedState,d!==null&&(d.rendering=null,d.tail=null,d.lastEffect=null),We(Xe,Xe.current),c)break;return null;case 22:case 23:return i.lanes=0,fm(n,i,a)}return Ir(n,i,a)}var wm,Lh,Tm,Im;wm=function(n,i){for(var a=i.child;a!==null;){if(a.tag===5||a.tag===6)n.appendChild(a.stateNode);else if(a.tag!==4&&a.child!==null){a.child.return=a,a=a.child;continue}if(a===i)break;for(;a.sibling===null;){if(a.return===null||a.return===i)return;a=a.return}a.sibling.return=a.return,a=a.sibling}},Lh=function(){},Tm=function(n,i,a,c){var d=n.memoizedProps;if(d!==c){n=i.stateNode,Xi(Qn.current);var m=null;switch(a){case"input":d=ki(n,d),c=ki(n,c),m=[];break;case"select":d=ne({},d,{value:void 0}),c=ne({},c,{value:void 0}),m=[];break;case"textarea":d=Mo(n,d),c=Mo(n,c),m=[];break;default:typeof d.onClick!="function"&&typeof c.onClick=="function"&&(n.onclick=Wl)}Bo(a,c);var v;a=null;for(U in d)if(!c.hasOwnProperty(U)&&d.hasOwnProperty(U)&&d[U]!=null)if(U==="style"){var I=d[U];for(v in I)I.hasOwnProperty(v)&&(a||(a={}),a[v]="")}else U!=="dangerouslySetInnerHTML"&&U!=="children"&&U!=="suppressContentEditableWarning"&&U!=="suppressHydrationWarning"&&U!=="autoFocus"&&(o.hasOwnProperty(U)?m||(m=[]):(m=m||[]).push(U,null));for(U in c){var P=c[U];if(I=d?.[U],c.hasOwnProperty(U)&&P!==I&&(P!=null||I!=null))if(U==="style")if(I){for(v in I)!I.hasOwnProperty(v)||P&&P.hasOwnProperty(v)||(a||(a={}),a[v]="");for(v in P)P.hasOwnProperty(v)&&I[v]!==P[v]&&(a||(a={}),a[v]=P[v])}else a||(m||(m=[]),m.push(U,a)),a=P;else U==="dangerouslySetInnerHTML"?(P=P?P.__html:void 0,I=I?I.__html:void 0,P!=null&&I!==P&&(m=m||[]).push(U,P)):U==="children"?typeof P!="string"&&typeof P!="number"||(m=m||[]).push(U,""+P):U!=="suppressContentEditableWarning"&&U!=="suppressHydrationWarning"&&(o.hasOwnProperty(U)?(P!=null&&U==="onScroll"&&He("scroll",n),m||I===P||(m=[])):(m=m||[]).push(U,P))}a&&(m=m||[]).push("style",a);var U=m;(i.updateQueue=U)&&(i.flags|=4)}},Im=function(n,i,a,c){a!==c&&(i.flags|=4)};function Ta(n,i){if(!Qe)switch(n.tailMode){case"hidden":i=n.tail;for(var a=null;i!==null;)i.alternate!==null&&(a=i),i=i.sibling;a===null?n.tail=null:a.sibling=null;break;case"collapsed":a=n.tail;for(var c=null;a!==null;)a.alternate!==null&&(c=a),a=a.sibling;c===null?i||n.tail===null?n.tail=null:n.tail.sibling=null:c.sibling=null}}function Mt(n){var i=n.alternate!==null&&n.alternate.child===n.child,a=0,c=0;if(i)for(var d=n.child;d!==null;)a|=d.lanes|d.childLanes,c|=d.subtreeFlags&14680064,c|=d.flags&14680064,d.return=n,d=d.sibling;else for(d=n.child;d!==null;)a|=d.lanes|d.childLanes,c|=d.subtreeFlags,c|=d.flags,d.return=n,d=d.sibling;return n.subtreeFlags|=c,n.childLanes=a,i}function ow(n,i,a){var c=i.pendingProps;switch(rh(i),i.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return Mt(i),null;case 1:return Qt(i.type)&&ql(),Mt(i),null;case 3:return c=i.stateNode,ro(),qe(Gt),qe(xt),gh(),c.pendingContext&&(c.context=c.pendingContext,c.pendingContext=null),(n===null||n.child===null)&&(Jl(i)?i.flags|=4:n===null||n.memoizedState.isDehydrated&&(i.flags&256)===0||(i.flags|=1024,Vn!==null&&(qh(Vn),Vn=null))),Lh(n,i),Mt(i),null;case 5:ph(i);var d=Xi(ya.current);if(a=i.type,n!==null&&i.stateNode!=null)Tm(n,i,a,c,d),n.ref!==i.ref&&(i.flags|=512,i.flags|=2097152);else{if(!c){if(i.stateNode===null)throw Error(t(166));return Mt(i),null}if(n=Xi(Qn.current),Jl(i)){c=i.stateNode,a=i.type;var m=i.memoizedProps;switch(c[Gn]=i,c[da]=m,n=(i.mode&1)!==0,a){case"dialog":He("cancel",c),He("close",c);break;case"iframe":case"object":case"embed":He("load",c);break;case"video":case"audio":for(d=0;d<ua.length;d++)He(ua[d],c);break;case"source":He("error",c);break;case"img":case"image":case"link":He("error",c),He("load",c);break;case"details":He("toggle",c);break;case"input":_s(c,m),He("invalid",c);break;case"select":c._wrapperState={wasMultiple:!!m.multiple},He("invalid",c);break;case"textarea":Es(c,m),He("invalid",c)}Bo(a,m),d=null;for(var v in m)if(m.hasOwnProperty(v)){var I=m[v];v==="children"?typeof I=="string"?c.textContent!==I&&(m.suppressHydrationWarning!==!0&&$l(c.textContent,I,n),d=["children",I]):typeof I=="number"&&c.textContent!==""+I&&(m.suppressHydrationWarning!==!0&&$l(c.textContent,I,n),d=["children",""+I]):o.hasOwnProperty(v)&&I!=null&&v==="onScroll"&&He("scroll",c)}switch(a){case"input":ar(c),ml(c,m,!0);break;case"textarea":ar(c),bo(c);break;case"select":case"option":break;default:typeof m.onClick=="function"&&(c.onclick=Wl)}c=d,i.updateQueue=c,c!==null&&(i.flags|=4)}else{v=d.nodeType===9?d:d.ownerDocument,n==="http://www.w3.org/1999/xhtml"&&(n=ht(a)),n==="http://www.w3.org/1999/xhtml"?a==="script"?(n=v.createElement("div"),n.innerHTML="<script><\/script>",n=n.removeChild(n.firstChild)):typeof c.is=="string"?n=v.createElement(a,{is:c.is}):(n=v.createElement(a),a==="select"&&(v=n,c.multiple?v.multiple=!0:c.size&&(v.size=c.size))):n=v.createElementNS(n,a),n[Gn]=i,n[da]=c,wm(n,i,!1,!1),i.stateNode=n;e:{switch(v=$o(a,c),a){case"dialog":He("cancel",n),He("close",n),d=c;break;case"iframe":case"object":case"embed":He("load",n),d=c;break;case"video":case"audio":for(d=0;d<ua.length;d++)He(ua[d],n);d=c;break;case"source":He("error",n),d=c;break;case"img":case"image":case"link":He("error",n),He("load",n),d=c;break;case"details":He("toggle",n),d=c;break;case"input":_s(n,c),d=ki(n,c),He("invalid",n);break;case"option":d=c;break;case"select":n._wrapperState={wasMultiple:!!c.multiple},d=ne({},c,{value:void 0}),He("invalid",n);break;case"textarea":Es(n,c),d=Mo(n,c),He("invalid",n);break;default:d=c}Bo(a,d),I=d;for(m in I)if(I.hasOwnProperty(m)){var P=I[m];m==="style"?jo(n,P):m==="dangerouslySetInnerHTML"?(P=P?P.__html:void 0,P!=null&&Fo(n,P)):m==="children"?typeof P=="string"?(a!=="textarea"||P!=="")&&Lr(n,P):typeof P=="number"&&Lr(n,""+P):m!=="suppressContentEditableWarning"&&m!=="suppressHydrationWarning"&&m!=="autoFocus"&&(o.hasOwnProperty(m)?P!=null&&m==="onScroll"&&He("scroll",n):P!=null&&ie(n,m,P,v))}switch(a){case"input":ar(n),ml(n,c,!1);break;case"textarea":ar(n),bo(n);break;case"option":c.value!=null&&n.setAttribute("value",""+be(c.value));break;case"select":n.multiple=!!c.multiple,m=c.value,m!=null?ur(n,!!c.multiple,m,!1):c.defaultValue!=null&&ur(n,!!c.multiple,c.defaultValue,!0);break;default:typeof d.onClick=="function"&&(n.onclick=Wl)}switch(a){case"button":case"input":case"select":case"textarea":c=!!c.autoFocus;break e;case"img":c=!0;break e;default:c=!1}}c&&(i.flags|=4)}i.ref!==null&&(i.flags|=512,i.flags|=2097152)}return Mt(i),null;case 6:if(n&&i.stateNode!=null)Im(n,i,n.memoizedProps,c);else{if(typeof c!="string"&&i.stateNode===null)throw Error(t(166));if(a=Xi(ya.current),Xi(Qn.current),Jl(i)){if(c=i.stateNode,a=i.memoizedProps,c[Gn]=i,(m=c.nodeValue!==a)&&(n=on,n!==null))switch(n.tag){case 3:$l(c.nodeValue,a,(n.mode&1)!==0);break;case 5:n.memoizedProps.suppressHydrationWarning!==!0&&$l(c.nodeValue,a,(n.mode&1)!==0)}m&&(i.flags|=4)}else c=(a.nodeType===9?a:a.ownerDocument).createTextNode(c),c[Gn]=i,i.stateNode=c}return Mt(i),null;case 13:if(qe(Xe),c=i.memoizedState,n===null||n.memoizedState!==null&&n.memoizedState.dehydrated!==null){if(Qe&&an!==null&&(i.mode&1)!==0&&(i.flags&128)===0)Rp(),Zs(),i.flags|=98560,m=!1;else if(m=Jl(i),c!==null&&c.dehydrated!==null){if(n===null){if(!m)throw Error(t(318));if(m=i.memoizedState,m=m!==null?m.dehydrated:null,!m)throw Error(t(317));m[Gn]=i}else Zs(),(i.flags&128)===0&&(i.memoizedState=null),i.flags|=4;Mt(i),m=!1}else Vn!==null&&(qh(Vn),Vn=null),m=!0;if(!m)return i.flags&65536?i:null}return(i.flags&128)!==0?(i.lanes=a,i):(c=c!==null,c!==(n!==null&&n.memoizedState!==null)&&c&&(i.child.flags|=8192,(i.mode&1)!==0&&(n===null||(Xe.current&1)!==0?mt===0&&(mt=3):Qh())),i.updateQueue!==null&&(i.flags|=4),Mt(i),null);case 4:return ro(),Lh(n,i),n===null&&ca(i.stateNode.containerInfo),Mt(i),null;case 10:return uh(i.type._context),Mt(i),null;case 17:return Qt(i.type)&&ql(),Mt(i),null;case 19:if(qe(Xe),m=i.memoizedState,m===null)return Mt(i),null;if(c=(i.flags&128)!==0,v=m.rendering,v===null)if(c)Ta(m,!1);else{if(mt!==0||n!==null&&(n.flags&128)!==0)for(n=i.child;n!==null;){if(v=ru(n),v!==null){for(i.flags|=128,Ta(m,!1),c=v.updateQueue,c!==null&&(i.updateQueue=c,i.flags|=4),i.subtreeFlags=0,c=a,a=i.child;a!==null;)m=a,n=c,m.flags&=14680066,v=m.alternate,v===null?(m.childLanes=0,m.lanes=n,m.child=null,m.subtreeFlags=0,m.memoizedProps=null,m.memoizedState=null,m.updateQueue=null,m.dependencies=null,m.stateNode=null):(m.childLanes=v.childLanes,m.lanes=v.lanes,m.child=v.child,m.subtreeFlags=0,m.deletions=null,m.memoizedProps=v.memoizedProps,m.memoizedState=v.memoizedState,m.updateQueue=v.updateQueue,m.type=v.type,n=v.dependencies,m.dependencies=n===null?null:{lanes:n.lanes,firstContext:n.firstContext}),a=a.sibling;return We(Xe,Xe.current&1|2),i.child}n=n.sibling}m.tail!==null&&$e()>ao&&(i.flags|=128,c=!0,Ta(m,!1),i.lanes=4194304)}else{if(!c)if(n=ru(v),n!==null){if(i.flags|=128,c=!0,a=n.updateQueue,a!==null&&(i.updateQueue=a,i.flags|=4),Ta(m,!0),m.tail===null&&m.tailMode==="hidden"&&!v.alternate&&!Qe)return Mt(i),null}else 2*$e()-m.renderingStartTime>ao&&a!==1073741824&&(i.flags|=128,c=!0,Ta(m,!1),i.lanes=4194304);m.isBackwards?(v.sibling=i.child,i.child=v):(a=m.last,a!==null?a.sibling=v:i.child=v,m.last=v)}return m.tail!==null?(i=m.tail,m.rendering=i,m.tail=i.sibling,m.renderingStartTime=$e(),i.sibling=null,a=Xe.current,We(Xe,c?a&1|2:a&1),i):(Mt(i),null);case 22:case 23:return Gh(),c=i.memoizedState!==null,n!==null&&n.memoizedState!==null!==c&&(i.flags|=8192),c&&(i.mode&1)!==0?(ln&1073741824)!==0&&(Mt(i),i.subtreeFlags&6&&(i.flags|=8192)):Mt(i),null;case 24:return null;case 25:return null}throw Error(t(156,i.tag))}function aw(n,i){switch(rh(i),i.tag){case 1:return Qt(i.type)&&ql(),n=i.flags,n&65536?(i.flags=n&-65537|128,i):null;case 3:return ro(),qe(Gt),qe(xt),gh(),n=i.flags,(n&65536)!==0&&(n&128)===0?(i.flags=n&-65537|128,i):null;case 5:return ph(i),null;case 13:if(qe(Xe),n=i.memoizedState,n!==null&&n.dehydrated!==null){if(i.alternate===null)throw Error(t(340));Zs()}return n=i.flags,n&65536?(i.flags=n&-65537|128,i):null;case 19:return qe(Xe),null;case 4:return ro(),null;case 10:return uh(i.type._context),null;case 22:case 23:return Gh(),null;case 24:return null;default:return null}}var du=!1,bt=!1,lw=typeof WeakSet=="function"?WeakSet:Set,se=null;function so(n,i){var a=n.ref;if(a!==null)if(typeof a=="function")try{a(null)}catch(c){et(n,i,c)}else a.current=null}function Mh(n,i,a){try{a()}catch(c){et(n,i,c)}}var Sm=!1;function uw(n,i){if(Gc=$r,n=np(),jc(n)){if("selectionStart"in n)var a={start:n.selectionStart,end:n.selectionEnd};else e:{a=(a=n.ownerDocument)&&a.defaultView||window;var c=a.getSelection&&a.getSelection();if(c&&c.rangeCount!==0){a=c.anchorNode;var d=c.anchorOffset,m=c.focusNode;c=c.focusOffset;try{a.nodeType,m.nodeType}catch{a=null;break e}var v=0,I=-1,P=-1,U=0,K=0,Q=n,q=null;t:for(;;){for(var ee;Q!==a||d!==0&&Q.nodeType!==3||(I=v+d),Q!==m||c!==0&&Q.nodeType!==3||(P=v+c),Q.nodeType===3&&(v+=Q.nodeValue.length),(ee=Q.firstChild)!==null;)q=Q,Q=ee;for(;;){if(Q===n)break t;if(q===a&&++U===d&&(I=v),q===m&&++K===c&&(P=v),(ee=Q.nextSibling)!==null)break;Q=q,q=Q.parentNode}Q=ee}a=I===-1||P===-1?null:{start:I,end:P}}else a=null}a=a||{start:0,end:0}}else a=null;for(Qc={focusedElem:n,selectionRange:a},$r=!1,se=i;se!==null;)if(i=se,n=i.child,(i.subtreeFlags&1028)!==0&&n!==null)n.return=i,se=n;else for(;se!==null;){i=se;try{var oe=i.alternate;if((i.flags&1024)!==0)switch(i.tag){case 0:case 11:case 15:break;case 1:if(oe!==null){var le=oe.memoizedProps,rt=oe.memoizedState,M=i.stateNode,N=M.getSnapshotBeforeUpdate(i.elementType===i.type?le:xn(i.type,le),rt);M.__reactInternalSnapshotBeforeUpdate=N}break;case 3:var b=i.stateNode.containerInfo;b.nodeType===1?b.textContent="":b.nodeType===9&&b.documentElement&&b.removeChild(b.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(t(163))}}catch(X){et(i,i.return,X)}if(n=i.sibling,n!==null){n.return=i.return,se=n;break}se=i.return}return oe=Sm,Sm=!1,oe}function Ia(n,i,a){var c=i.updateQueue;if(c=c!==null?c.lastEffect:null,c!==null){var d=c=c.next;do{if((d.tag&n)===n){var m=d.destroy;d.destroy=void 0,m!==void 0&&Mh(i,a,m)}d=d.next}while(d!==c)}}function fu(n,i){if(i=i.updateQueue,i=i!==null?i.lastEffect:null,i!==null){var a=i=i.next;do{if((a.tag&n)===n){var c=a.create;a.destroy=c()}a=a.next}while(a!==i)}}function bh(n){var i=n.ref;if(i!==null){var a=n.stateNode;switch(n.tag){case 5:n=a;break;default:n=a}typeof i=="function"?i(n):i.current=n}}function Am(n){var i=n.alternate;i!==null&&(n.alternate=null,Am(i)),n.child=null,n.deletions=null,n.sibling=null,n.tag===5&&(i=n.stateNode,i!==null&&(delete i[Gn],delete i[da],delete i[Zc],delete i[HE],delete i[qE])),n.stateNode=null,n.return=null,n.dependencies=null,n.memoizedProps=null,n.memoizedState=null,n.pendingProps=null,n.stateNode=null,n.updateQueue=null}function Rm(n){return n.tag===5||n.tag===3||n.tag===4}function Cm(n){e:for(;;){for(;n.sibling===null;){if(n.return===null||Rm(n.return))return null;n=n.return}for(n.sibling.return=n.return,n=n.sibling;n.tag!==5&&n.tag!==6&&n.tag!==18;){if(n.flags&2||n.child===null||n.tag===4)continue e;n.child.return=n,n=n.child}if(!(n.flags&2))return n.stateNode}}function Fh(n,i,a){var c=n.tag;if(c===5||c===6)n=n.stateNode,i?a.nodeType===8?a.parentNode.insertBefore(n,i):a.insertBefore(n,i):(a.nodeType===8?(i=a.parentNode,i.insertBefore(n,a)):(i=a,i.appendChild(n)),a=a._reactRootContainer,a!=null||i.onclick!==null||(i.onclick=Wl));else if(c!==4&&(n=n.child,n!==null))for(Fh(n,i,a),n=n.sibling;n!==null;)Fh(n,i,a),n=n.sibling}function Uh(n,i,a){var c=n.tag;if(c===5||c===6)n=n.stateNode,i?a.insertBefore(n,i):a.appendChild(n);else if(c!==4&&(n=n.child,n!==null))for(Uh(n,i,a),n=n.sibling;n!==null;)Uh(n,i,a),n=n.sibling}var Ct=null,Ln=!1;function Yr(n,i,a){for(a=a.child;a!==null;)Pm(n,i,a),a=a.sibling}function Pm(n,i,a){if(tn&&typeof tn.onCommitFiberUnmount=="function")try{tn.onCommitFiberUnmount(Fi,a)}catch{}switch(a.tag){case 5:bt||so(a,i);case 6:var c=Ct,d=Ln;Ct=null,Yr(n,i,a),Ct=c,Ln=d,Ct!==null&&(Ln?(n=Ct,a=a.stateNode,n.nodeType===8?n.parentNode.removeChild(a):n.removeChild(a)):Ct.removeChild(a.stateNode));break;case 18:Ct!==null&&(Ln?(n=Ct,a=a.stateNode,n.nodeType===8?Yc(n.parentNode,a):n.nodeType===1&&Yc(n,a),Nn(n)):Yc(Ct,a.stateNode));break;case 4:c=Ct,d=Ln,Ct=a.stateNode.containerInfo,Ln=!0,Yr(n,i,a),Ct=c,Ln=d;break;case 0:case 11:case 14:case 15:if(!bt&&(c=a.updateQueue,c!==null&&(c=c.lastEffect,c!==null))){d=c=c.next;do{var m=d,v=m.destroy;m=m.tag,v!==void 0&&((m&2)!==0||(m&4)!==0)&&Mh(a,i,v),d=d.next}while(d!==c)}Yr(n,i,a);break;case 1:if(!bt&&(so(a,i),c=a.stateNode,typeof c.componentWillUnmount=="function"))try{c.props=a.memoizedProps,c.state=a.memoizedState,c.componentWillUnmount()}catch(I){et(a,i,I)}Yr(n,i,a);break;case 21:Yr(n,i,a);break;case 22:a.mode&1?(bt=(c=bt)||a.memoizedState!==null,Yr(n,i,a),bt=c):Yr(n,i,a);break;default:Yr(n,i,a)}}function km(n){var i=n.updateQueue;if(i!==null){n.updateQueue=null;var a=n.stateNode;a===null&&(a=n.stateNode=new lw),i.forEach(function(c){var d=_w.bind(null,n,c);a.has(c)||(a.add(c),c.then(d,d))})}}function Mn(n,i){var a=i.deletions;if(a!==null)for(var c=0;c<a.length;c++){var d=a[c];try{var m=n,v=i,I=v;e:for(;I!==null;){switch(I.tag){case 5:Ct=I.stateNode,Ln=!1;break e;case 3:Ct=I.stateNode.containerInfo,Ln=!0;break e;case 4:Ct=I.stateNode.containerInfo,Ln=!0;break e}I=I.return}if(Ct===null)throw Error(t(160));Pm(m,v,d),Ct=null,Ln=!1;var P=d.alternate;P!==null&&(P.return=null),d.return=null}catch(U){et(d,i,U)}}if(i.subtreeFlags&12854)for(i=i.child;i!==null;)Nm(i,n),i=i.sibling}function Nm(n,i){var a=n.alternate,c=n.flags;switch(n.tag){case 0:case 11:case 14:case 15:if(Mn(i,n),Jn(n),c&4){try{Ia(3,n,n.return),fu(3,n)}catch(le){et(n,n.return,le)}try{Ia(5,n,n.return)}catch(le){et(n,n.return,le)}}break;case 1:Mn(i,n),Jn(n),c&512&&a!==null&&so(a,a.return);break;case 5:if(Mn(i,n),Jn(n),c&512&&a!==null&&so(a,a.return),n.flags&32){var d=n.stateNode;try{Lr(d,"")}catch(le){et(n,n.return,le)}}if(c&4&&(d=n.stateNode,d!=null)){var m=n.memoizedProps,v=a!==null?a.memoizedProps:m,I=n.type,P=n.updateQueue;if(n.updateQueue=null,P!==null)try{I==="input"&&m.type==="radio"&&m.name!=null&&xo(d,m),$o(I,v);var U=$o(I,m);for(v=0;v<P.length;v+=2){var K=P[v],Q=P[v+1];K==="style"?jo(d,Q):K==="dangerouslySetInnerHTML"?Fo(d,Q):K==="children"?Lr(d,Q):ie(d,K,Q,U)}switch(I){case"input":Lo(d,m);break;case"textarea":ws(d,m);break;case"select":var q=d._wrapperState.wasMultiple;d._wrapperState.wasMultiple=!!m.multiple;var ee=m.value;ee!=null?ur(d,!!m.multiple,ee,!1):q!==!!m.multiple&&(m.defaultValue!=null?ur(d,!!m.multiple,m.defaultValue,!0):ur(d,!!m.multiple,m.multiple?[]:"",!1))}d[da]=m}catch(le){et(n,n.return,le)}}break;case 6:if(Mn(i,n),Jn(n),c&4){if(n.stateNode===null)throw Error(t(162));d=n.stateNode,m=n.memoizedProps;try{d.nodeValue=m}catch(le){et(n,n.return,le)}}break;case 3:if(Mn(i,n),Jn(n),c&4&&a!==null&&a.memoizedState.isDehydrated)try{Nn(i.containerInfo)}catch(le){et(n,n.return,le)}break;case 4:Mn(i,n),Jn(n);break;case 13:Mn(i,n),Jn(n),d=n.child,d.flags&8192&&(m=d.memoizedState!==null,d.stateNode.isHidden=m,!m||d.alternate!==null&&d.alternate.memoizedState!==null||(Bh=$e())),c&4&&km(n);break;case 22:if(K=a!==null&&a.memoizedState!==null,n.mode&1?(bt=(U=bt)||K,Mn(i,n),bt=U):Mn(i,n),Jn(n),c&8192){if(U=n.memoizedState!==null,(n.stateNode.isHidden=U)&&!K&&(n.mode&1)!==0)for(se=n,K=n.child;K!==null;){for(Q=se=K;se!==null;){switch(q=se,ee=q.child,q.tag){case 0:case 11:case 14:case 15:Ia(4,q,q.return);break;case 1:so(q,q.return);var oe=q.stateNode;if(typeof oe.componentWillUnmount=="function"){c=q,a=q.return;try{i=c,oe.props=i.memoizedProps,oe.state=i.memoizedState,oe.componentWillUnmount()}catch(le){et(c,a,le)}}break;case 5:so(q,q.return);break;case 22:if(q.memoizedState!==null){Vm(Q);continue}}ee!==null?(ee.return=q,se=ee):Vm(Q)}K=K.sibling}e:for(K=null,Q=n;;){if(Q.tag===5){if(K===null){K=Q;try{d=Q.stateNode,U?(m=d.style,typeof m.setProperty=="function"?m.setProperty("display","none","important"):m.display="none"):(I=Q.stateNode,P=Q.memoizedProps.style,v=P!=null&&P.hasOwnProperty("display")?P.display:null,I.style.display=Uo("display",v))}catch(le){et(n,n.return,le)}}}else if(Q.tag===6){if(K===null)try{Q.stateNode.nodeValue=U?"":Q.memoizedProps}catch(le){et(n,n.return,le)}}else if((Q.tag!==22&&Q.tag!==23||Q.memoizedState===null||Q===n)&&Q.child!==null){Q.child.return=Q,Q=Q.child;continue}if(Q===n)break e;for(;Q.sibling===null;){if(Q.return===null||Q.return===n)break e;K===Q&&(K=null),Q=Q.return}K===Q&&(K=null),Q.sibling.return=Q.return,Q=Q.sibling}}break;case 19:Mn(i,n),Jn(n),c&4&&km(n);break;case 21:break;default:Mn(i,n),Jn(n)}}function Jn(n){var i=n.flags;if(i&2){try{e:{for(var a=n.return;a!==null;){if(Rm(a)){var c=a;break e}a=a.return}throw Error(t(160))}switch(c.tag){case 5:var d=c.stateNode;c.flags&32&&(Lr(d,""),c.flags&=-33);var m=Cm(n);Uh(n,m,d);break;case 3:case 4:var v=c.stateNode.containerInfo,I=Cm(n);Fh(n,I,v);break;default:throw Error(t(161))}}catch(P){et(n,n.return,P)}n.flags&=-3}i&4096&&(n.flags&=-4097)}function cw(n,i,a){se=n,Dm(n)}function Dm(n,i,a){for(var c=(n.mode&1)!==0;se!==null;){var d=se,m=d.child;if(d.tag===22&&c){var v=d.memoizedState!==null||du;if(!v){var I=d.alternate,P=I!==null&&I.memoizedState!==null||bt;I=du;var U=bt;if(du=v,(bt=P)&&!U)for(se=d;se!==null;)v=se,P=v.child,v.tag===22&&v.memoizedState!==null?xm(d):P!==null?(P.return=v,se=P):xm(d);for(;m!==null;)se=m,Dm(m),m=m.sibling;se=d,du=I,bt=U}Om(n)}else(d.subtreeFlags&8772)!==0&&m!==null?(m.return=d,se=m):Om(n)}}function Om(n){for(;se!==null;){var i=se;if((i.flags&8772)!==0){var a=i.alternate;try{if((i.flags&8772)!==0)switch(i.tag){case 0:case 11:case 15:bt||fu(5,i);break;case 1:var c=i.stateNode;if(i.flags&4&&!bt)if(a===null)c.componentDidMount();else{var d=i.elementType===i.type?a.memoizedProps:xn(i.type,a.memoizedProps);c.componentDidUpdate(d,a.memoizedState,c.__reactInternalSnapshotBeforeUpdate)}var m=i.updateQueue;m!==null&&Vp(i,m,c);break;case 3:var v=i.updateQueue;if(v!==null){if(a=null,i.child!==null)switch(i.child.tag){case 5:a=i.child.stateNode;break;case 1:a=i.child.stateNode}Vp(i,v,a)}break;case 5:var I=i.stateNode;if(a===null&&i.flags&4){a=I;var P=i.memoizedProps;switch(i.type){case"button":case"input":case"select":case"textarea":P.autoFocus&&a.focus();break;case"img":P.src&&(a.src=P.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(i.memoizedState===null){var U=i.alternate;if(U!==null){var K=U.memoizedState;if(K!==null){var Q=K.dehydrated;Q!==null&&Nn(Q)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(t(163))}bt||i.flags&512&&bh(i)}catch(q){et(i,i.return,q)}}if(i===n){se=null;break}if(a=i.sibling,a!==null){a.return=i.return,se=a;break}se=i.return}}function Vm(n){for(;se!==null;){var i=se;if(i===n){se=null;break}var a=i.sibling;if(a!==null){a.return=i.return,se=a;break}se=i.return}}function xm(n){for(;se!==null;){var i=se;try{switch(i.tag){case 0:case 11:case 15:var a=i.return;try{fu(4,i)}catch(P){et(i,a,P)}break;case 1:var c=i.stateNode;if(typeof c.componentDidMount=="function"){var d=i.return;try{c.componentDidMount()}catch(P){et(i,d,P)}}var m=i.return;try{bh(i)}catch(P){et(i,m,P)}break;case 5:var v=i.return;try{bh(i)}catch(P){et(i,v,P)}}}catch(P){et(i,i.return,P)}if(i===n){se=null;break}var I=i.sibling;if(I!==null){I.return=i.return,se=I;break}se=i.return}}var hw=Math.ceil,pu=ge.ReactCurrentDispatcher,jh=ge.ReactCurrentOwner,yn=ge.ReactCurrentBatchConfig,Ve=0,wt=null,at=null,Pt=0,ln=0,oo=Kr(0),mt=0,Sa=null,Yi=0,mu=0,zh=0,Aa=null,Jt=null,Bh=0,ao=1/0,Sr=null,gu=!1,$h=null,Zr=null,yu=!1,ei=null,_u=0,Ra=0,Wh=null,vu=-1,Eu=0;function Ht(){return(Ve&6)!==0?$e():vu!==-1?vu:vu=$e()}function ti(n){return(n.mode&1)===0?1:(Ve&2)!==0&&Pt!==0?Pt&-Pt:GE.transition!==null?(Eu===0&&(Eu=ji()),Eu):(n=ke,n!==0||(n=window.event,n=n===void 0?16:ea(n.type)),n)}function bn(n,i,a,c){if(50<Ra)throw Ra=0,Wh=null,Error(t(185));Ur(n,a,c),((Ve&2)===0||n!==wt)&&(n===wt&&((Ve&2)===0&&(mu|=a),mt===4&&ni(n,Pt)),Yt(n,c),a===1&&Ve===0&&(i.mode&1)===0&&(ao=$e()+500,Gl&&Qr()))}function Yt(n,i){var a=n.callbackNode;dr(n,i);var c=Ui(n,n===wt?Pt:0);if(c===0)a!==null&&Qo(a),n.callbackNode=null,n.callbackPriority=0;else if(i=c&-c,n.callbackPriority!==i){if(a!=null&&Qo(a),i===1)n.tag===0?KE(Mm.bind(null,n)):wp(Mm.bind(null,n)),$E(function(){(Ve&6)===0&&Qr()}),a=null;else{switch(zr(c)){case 1:a=bi;break;case 4:a=Mr;break;case 16:a=cn;break;case 536870912:a=El;break;default:a=cn}a=Wm(a,Lm.bind(null,n))}n.callbackPriority=i,n.callbackNode=a}}function Lm(n,i){if(vu=-1,Eu=0,(Ve&6)!==0)throw Error(t(327));var a=n.callbackNode;if(lo()&&n.callbackNode!==a)return null;var c=Ui(n,n===wt?Pt:0);if(c===0)return null;if((c&30)!==0||(c&n.expiredLanes)!==0||i)i=wu(n,c);else{i=c;var d=Ve;Ve|=2;var m=Fm();(wt!==n||Pt!==i)&&(Sr=null,ao=$e()+500,es(n,i));do try{pw();break}catch(I){bm(n,I)}while(!0);lh(),pu.current=m,Ve=d,at!==null?i=0:(wt=null,Pt=0,i=mt)}if(i!==0){if(i===2&&(d=nn(n),d!==0&&(c=d,i=Hh(n,d))),i===1)throw a=Sa,es(n,0),ni(n,c),Yt(n,$e()),a;if(i===6)ni(n,c);else{if(d=n.current.alternate,(c&30)===0&&!dw(d)&&(i=wu(n,c),i===2&&(m=nn(n),m!==0&&(c=m,i=Hh(n,m))),i===1))throw a=Sa,es(n,0),ni(n,c),Yt(n,$e()),a;switch(n.finishedWork=d,n.finishedLanes=c,i){case 0:case 1:throw Error(t(345));case 2:ts(n,Jt,Sr);break;case 3:if(ni(n,c),(c&130023424)===c&&(i=Bh+500-$e(),10<i)){if(Ui(n,0)!==0)break;if(d=n.suspendedLanes,(d&c)!==c){Ht(),n.pingedLanes|=n.suspendedLanes&d;break}n.timeoutHandle=Jc(ts.bind(null,n,Jt,Sr),i);break}ts(n,Jt,Sr);break;case 4:if(ni(n,c),(c&4194240)===c)break;for(i=n.eventTimes,d=-1;0<c;){var v=31-Bt(c);m=1<<v,v=i[v],v>d&&(d=v),c&=~m}if(c=d,c=$e()-c,c=(120>c?120:480>c?480:1080>c?1080:1920>c?1920:3e3>c?3e3:4320>c?4320:1960*hw(c/1960))-c,10<c){n.timeoutHandle=Jc(ts.bind(null,n,Jt,Sr),c);break}ts(n,Jt,Sr);break;case 5:ts(n,Jt,Sr);break;default:throw Error(t(329))}}}return Yt(n,$e()),n.callbackNode===a?Lm.bind(null,n):null}function Hh(n,i){var a=Aa;return n.current.memoizedState.isDehydrated&&(es(n,i).flags|=256),n=wu(n,i),n!==2&&(i=Jt,Jt=a,i!==null&&qh(i)),n}function qh(n){Jt===null?Jt=n:Jt.push.apply(Jt,n)}function dw(n){for(var i=n;;){if(i.flags&16384){var a=i.updateQueue;if(a!==null&&(a=a.stores,a!==null))for(var c=0;c<a.length;c++){var d=a[c],m=d.getSnapshot;d=d.value;try{if(!On(m(),d))return!1}catch{return!1}}}if(a=i.child,i.subtreeFlags&16384&&a!==null)a.return=i,i=a;else{if(i===n)break;for(;i.sibling===null;){if(i.return===null||i.return===n)return!0;i=i.return}i.sibling.return=i.return,i=i.sibling}}return!0}function ni(n,i){for(i&=~zh,i&=~mu,n.suspendedLanes|=i,n.pingedLanes&=~i,n=n.expirationTimes;0<i;){var a=31-Bt(i),c=1<<a;n[a]=-1,i&=~c}}function Mm(n){if((Ve&6)!==0)throw Error(t(327));lo();var i=Ui(n,0);if((i&1)===0)return Yt(n,$e()),null;var a=wu(n,i);if(n.tag!==0&&a===2){var c=nn(n);c!==0&&(i=c,a=Hh(n,c))}if(a===1)throw a=Sa,es(n,0),ni(n,i),Yt(n,$e()),a;if(a===6)throw Error(t(345));return n.finishedWork=n.current.alternate,n.finishedLanes=i,ts(n,Jt,Sr),Yt(n,$e()),null}function Kh(n,i){var a=Ve;Ve|=1;try{return n(i)}finally{Ve=a,Ve===0&&(ao=$e()+500,Gl&&Qr())}}function Zi(n){ei!==null&&ei.tag===0&&(Ve&6)===0&&lo();var i=Ve;Ve|=1;var a=yn.transition,c=ke;try{if(yn.transition=null,ke=1,n)return n()}finally{ke=c,yn.transition=a,Ve=i,(Ve&6)===0&&Qr()}}function Gh(){ln=oo.current,qe(oo)}function es(n,i){n.finishedWork=null,n.finishedLanes=0;var a=n.timeoutHandle;if(a!==-1&&(n.timeoutHandle=-1,BE(a)),at!==null)for(a=at.return;a!==null;){var c=a;switch(rh(c),c.tag){case 1:c=c.type.childContextTypes,c!=null&&ql();break;case 3:ro(),qe(Gt),qe(xt),gh();break;case 5:ph(c);break;case 4:ro();break;case 13:qe(Xe);break;case 19:qe(Xe);break;case 10:uh(c.type._context);break;case 22:case 23:Gh()}a=a.return}if(wt=n,at=n=ri(n.current,null),Pt=ln=i,mt=0,Sa=null,zh=mu=Yi=0,Jt=Aa=null,Qi!==null){for(i=0;i<Qi.length;i++)if(a=Qi[i],c=a.interleaved,c!==null){a.interleaved=null;var d=c.next,m=a.pending;if(m!==null){var v=m.next;m.next=d,c.next=v}a.pending=c}Qi=null}return n}function bm(n,i){do{var a=at;try{if(lh(),iu.current=lu,su){for(var c=Je.memoizedState;c!==null;){var d=c.queue;d!==null&&(d.pending=null),c=c.next}su=!1}if(Ji=0,Et=pt=Je=null,_a=!1,va=0,jh.current=null,a===null||a.return===null){mt=1,Sa=i,at=null;break}e:{var m=n,v=a.return,I=a,P=i;if(i=Pt,I.flags|=32768,P!==null&&typeof P=="object"&&typeof P.then=="function"){var U=P,K=I,Q=K.tag;if((K.mode&1)===0&&(Q===0||Q===11||Q===15)){var q=K.alternate;q?(K.updateQueue=q.updateQueue,K.memoizedState=q.memoizedState,K.lanes=q.lanes):(K.updateQueue=null,K.memoizedState=null)}var ee=lm(v);if(ee!==null){ee.flags&=-257,um(ee,v,I,m,i),ee.mode&1&&am(m,U,i),i=ee,P=U;var oe=i.updateQueue;if(oe===null){var le=new Set;le.add(P),i.updateQueue=le}else oe.add(P);break e}else{if((i&1)===0){am(m,U,i),Qh();break e}P=Error(t(426))}}else if(Qe&&I.mode&1){var rt=lm(v);if(rt!==null){(rt.flags&65536)===0&&(rt.flags|=256),um(rt,v,I,m,i),oh(io(P,I));break e}}m=P=io(P,I),mt!==4&&(mt=2),Aa===null?Aa=[m]:Aa.push(m),m=v;do{switch(m.tag){case 3:m.flags|=65536,i&=-i,m.lanes|=i;var M=sm(m,P,i);Op(m,M);break e;case 1:I=P;var N=m.type,b=m.stateNode;if((m.flags&128)===0&&(typeof N.getDerivedStateFromError=="function"||b!==null&&typeof b.componentDidCatch=="function"&&(Zr===null||!Zr.has(b)))){m.flags|=65536,i&=-i,m.lanes|=i;var X=om(m,I,i);Op(m,X);break e}}m=m.return}while(m!==null)}jm(a)}catch(ue){i=ue,at===a&&a!==null&&(at=a=a.return);continue}break}while(!0)}function Fm(){var n=pu.current;return pu.current=lu,n===null?lu:n}function Qh(){(mt===0||mt===3||mt===2)&&(mt=4),wt===null||(Yi&268435455)===0&&(mu&268435455)===0||ni(wt,Pt)}function wu(n,i){var a=Ve;Ve|=2;var c=Fm();(wt!==n||Pt!==i)&&(Sr=null,es(n,i));do try{fw();break}catch(d){bm(n,d)}while(!0);if(lh(),Ve=a,pu.current=c,at!==null)throw Error(t(261));return wt=null,Pt=0,mt}function fw(){for(;at!==null;)Um(at)}function pw(){for(;at!==null&&!_l();)Um(at)}function Um(n){var i=$m(n.alternate,n,ln);n.memoizedProps=n.pendingProps,i===null?jm(n):at=i,jh.current=null}function jm(n){var i=n;do{var a=i.alternate;if(n=i.return,(i.flags&32768)===0){if(a=ow(a,i,ln),a!==null){at=a;return}}else{if(a=aw(a,i),a!==null){a.flags&=32767,at=a;return}if(n!==null)n.flags|=32768,n.subtreeFlags=0,n.deletions=null;else{mt=6,at=null;return}}if(i=i.sibling,i!==null){at=i;return}at=i=n}while(i!==null);mt===0&&(mt=5)}function ts(n,i,a){var c=ke,d=yn.transition;try{yn.transition=null,ke=1,mw(n,i,a,c)}finally{yn.transition=d,ke=c}return null}function mw(n,i,a,c){do lo();while(ei!==null);if((Ve&6)!==0)throw Error(t(327));a=n.finishedWork;var d=n.finishedLanes;if(a===null)return null;if(n.finishedWork=null,n.finishedLanes=0,a===n.current)throw Error(t(177));n.callbackNode=null,n.callbackPriority=0;var m=a.lanes|a.childLanes;if(ze(n,m),n===wt&&(at=wt=null,Pt=0),(a.subtreeFlags&2064)===0&&(a.flags&2064)===0||yu||(yu=!0,Wm(cn,function(){return lo(),null})),m=(a.flags&15990)!==0,(a.subtreeFlags&15990)!==0||m){m=yn.transition,yn.transition=null;var v=ke;ke=1;var I=Ve;Ve|=4,jh.current=null,uw(n,a),Nm(a,n),LE(Qc),$r=!!Gc,Qc=Gc=null,n.current=a,cw(a),Oc(),Ve=I,ke=v,yn.transition=m}else n.current=a;if(yu&&(yu=!1,ei=n,_u=d),m=n.pendingLanes,m===0&&(Zr=null),wl(a.stateNode),Yt(n,$e()),i!==null)for(c=n.onRecoverableError,a=0;a<i.length;a++)d=i[a],c(d.value,{componentStack:d.stack,digest:d.digest});if(gu)throw gu=!1,n=$h,$h=null,n;return(_u&1)!==0&&n.tag!==0&&lo(),m=n.pendingLanes,(m&1)!==0?n===Wh?Ra++:(Ra=0,Wh=n):Ra=0,Qr(),null}function lo(){if(ei!==null){var n=zr(_u),i=yn.transition,a=ke;try{if(yn.transition=null,ke=16>n?16:n,ei===null)var c=!1;else{if(n=ei,ei=null,_u=0,(Ve&6)!==0)throw Error(t(331));var d=Ve;for(Ve|=4,se=n.current;se!==null;){var m=se,v=m.child;if((se.flags&16)!==0){var I=m.deletions;if(I!==null){for(var P=0;P<I.length;P++){var U=I[P];for(se=U;se!==null;){var K=se;switch(K.tag){case 0:case 11:case 15:Ia(8,K,m)}var Q=K.child;if(Q!==null)Q.return=K,se=Q;else for(;se!==null;){K=se;var q=K.sibling,ee=K.return;if(Am(K),K===U){se=null;break}if(q!==null){q.return=ee,se=q;break}se=ee}}}var oe=m.alternate;if(oe!==null){var le=oe.child;if(le!==null){oe.child=null;do{var rt=le.sibling;le.sibling=null,le=rt}while(le!==null)}}se=m}}if((m.subtreeFlags&2064)!==0&&v!==null)v.return=m,se=v;else e:for(;se!==null;){if(m=se,(m.flags&2048)!==0)switch(m.tag){case 0:case 11:case 15:Ia(9,m,m.return)}var M=m.sibling;if(M!==null){M.return=m.return,se=M;break e}se=m.return}}var N=n.current;for(se=N;se!==null;){v=se;var b=v.child;if((v.subtreeFlags&2064)!==0&&b!==null)b.return=v,se=b;else e:for(v=N;se!==null;){if(I=se,(I.flags&2048)!==0)try{switch(I.tag){case 0:case 11:case 15:fu(9,I)}}catch(ue){et(I,I.return,ue)}if(I===v){se=null;break e}var X=I.sibling;if(X!==null){X.return=I.return,se=X;break e}se=I.return}}if(Ve=d,Qr(),tn&&typeof tn.onPostCommitFiberRoot=="function")try{tn.onPostCommitFiberRoot(Fi,n)}catch{}c=!0}return c}finally{ke=a,yn.transition=i}}return!1}function zm(n,i,a){i=io(a,i),i=sm(n,i,1),n=Jr(n,i,1),i=Ht(),n!==null&&(Ur(n,1,i),Yt(n,i))}function et(n,i,a){if(n.tag===3)zm(n,n,a);else for(;i!==null;){if(i.tag===3){zm(i,n,a);break}else if(i.tag===1){var c=i.stateNode;if(typeof i.type.getDerivedStateFromError=="function"||typeof c.componentDidCatch=="function"&&(Zr===null||!Zr.has(c))){n=io(a,n),n=om(i,n,1),i=Jr(i,n,1),n=Ht(),i!==null&&(Ur(i,1,n),Yt(i,n));break}}i=i.return}}function gw(n,i,a){var c=n.pingCache;c!==null&&c.delete(i),i=Ht(),n.pingedLanes|=n.suspendedLanes&a,wt===n&&(Pt&a)===a&&(mt===4||mt===3&&(Pt&130023424)===Pt&&500>$e()-Bh?es(n,0):zh|=a),Yt(n,i)}function Bm(n,i){i===0&&((n.mode&1)===0?i=1:(i=Ds,Ds<<=1,(Ds&130023424)===0&&(Ds=4194304)));var a=Ht();n=wr(n,i),n!==null&&(Ur(n,i,a),Yt(n,a))}function yw(n){var i=n.memoizedState,a=0;i!==null&&(a=i.retryLane),Bm(n,a)}function _w(n,i){var a=0;switch(n.tag){case 13:var c=n.stateNode,d=n.memoizedState;d!==null&&(a=d.retryLane);break;case 19:c=n.stateNode;break;default:throw Error(t(314))}c!==null&&c.delete(i),Bm(n,a)}var $m;$m=function(n,i,a){if(n!==null)if(n.memoizedProps!==i.pendingProps||Gt.current)Xt=!0;else{if((n.lanes&a)===0&&(i.flags&128)===0)return Xt=!1,sw(n,i,a);Xt=(n.flags&131072)!==0}else Xt=!1,Qe&&(i.flags&1048576)!==0&&Tp(i,Xl,i.index);switch(i.lanes=0,i.tag){case 2:var c=i.type;hu(n,i),n=i.pendingProps;var d=Xs(i,xt.current);no(i,a),d=vh(null,i,c,n,d,a);var m=Eh();return i.flags|=1,typeof d=="object"&&d!==null&&typeof d.render=="function"&&d.$$typeof===void 0?(i.tag=1,i.memoizedState=null,i.updateQueue=null,Qt(c)?(m=!0,Kl(i)):m=!1,i.memoizedState=d.state!==null&&d.state!==void 0?d.state:null,dh(i),d.updater=uu,i.stateNode=d,d._reactInternals=i,Rh(i,c,n,a),i=Nh(null,i,c,!0,m,a)):(i.tag=0,Qe&&m&&nh(i),Wt(null,i,d,a),i=i.child),i;case 16:c=i.elementType;e:{switch(hu(n,i),n=i.pendingProps,d=c._init,c=d(c._payload),i.type=c,d=i.tag=Ew(c),n=xn(c,n),d){case 0:i=kh(null,i,c,n,a);break e;case 1:i=mm(null,i,c,n,a);break e;case 11:i=cm(null,i,c,n,a);break e;case 14:i=hm(null,i,c,xn(c.type,n),a);break e}throw Error(t(306,c,""))}return i;case 0:return c=i.type,d=i.pendingProps,d=i.elementType===c?d:xn(c,d),kh(n,i,c,d,a);case 1:return c=i.type,d=i.pendingProps,d=i.elementType===c?d:xn(c,d),mm(n,i,c,d,a);case 3:e:{if(gm(i),n===null)throw Error(t(387));c=i.pendingProps,m=i.memoizedState,d=m.element,Dp(n,i),nu(i,c,null,a);var v=i.memoizedState;if(c=v.element,m.isDehydrated)if(m={element:c,isDehydrated:!1,cache:v.cache,pendingSuspenseBoundaries:v.pendingSuspenseBoundaries,transitions:v.transitions},i.updateQueue.baseState=m,i.memoizedState=m,i.flags&256){d=io(Error(t(423)),i),i=ym(n,i,c,a,d);break e}else if(c!==d){d=io(Error(t(424)),i),i=ym(n,i,c,a,d);break e}else for(an=qr(i.stateNode.containerInfo.firstChild),on=i,Qe=!0,Vn=null,a=kp(i,null,c,a),i.child=a;a;)a.flags=a.flags&-3|4096,a=a.sibling;else{if(Zs(),c===d){i=Ir(n,i,a);break e}Wt(n,i,c,a)}i=i.child}return i;case 5:return xp(i),n===null&&sh(i),c=i.type,d=i.pendingProps,m=n!==null?n.memoizedProps:null,v=d.children,Xc(c,d)?v=null:m!==null&&Xc(c,m)&&(i.flags|=32),pm(n,i),Wt(n,i,v,a),i.child;case 6:return n===null&&sh(i),null;case 13:return _m(n,i,a);case 4:return fh(i,i.stateNode.containerInfo),c=i.pendingProps,n===null?i.child=eo(i,null,c,a):Wt(n,i,c,a),i.child;case 11:return c=i.type,d=i.pendingProps,d=i.elementType===c?d:xn(c,d),cm(n,i,c,d,a);case 7:return Wt(n,i,i.pendingProps,a),i.child;case 8:return Wt(n,i,i.pendingProps.children,a),i.child;case 12:return Wt(n,i,i.pendingProps.children,a),i.child;case 10:e:{if(c=i.type._context,d=i.pendingProps,m=i.memoizedProps,v=d.value,We(Zl,c._currentValue),c._currentValue=v,m!==null)if(On(m.value,v)){if(m.children===d.children&&!Gt.current){i=Ir(n,i,a);break e}}else for(m=i.child,m!==null&&(m.return=i);m!==null;){var I=m.dependencies;if(I!==null){v=m.child;for(var P=I.firstContext;P!==null;){if(P.context===c){if(m.tag===1){P=Tr(-1,a&-a),P.tag=2;var U=m.updateQueue;if(U!==null){U=U.shared;var K=U.pending;K===null?P.next=P:(P.next=K.next,K.next=P),U.pending=P}}m.lanes|=a,P=m.alternate,P!==null&&(P.lanes|=a),ch(m.return,a,i),I.lanes|=a;break}P=P.next}}else if(m.tag===10)v=m.type===i.type?null:m.child;else if(m.tag===18){if(v=m.return,v===null)throw Error(t(341));v.lanes|=a,I=v.alternate,I!==null&&(I.lanes|=a),ch(v,a,i),v=m.sibling}else v=m.child;if(v!==null)v.return=m;else for(v=m;v!==null;){if(v===i){v=null;break}if(m=v.sibling,m!==null){m.return=v.return,v=m;break}v=v.return}m=v}Wt(n,i,d.children,a),i=i.child}return i;case 9:return d=i.type,c=i.pendingProps.children,no(i,a),d=mn(d),c=c(d),i.flags|=1,Wt(n,i,c,a),i.child;case 14:return c=i.type,d=xn(c,i.pendingProps),d=xn(c.type,d),hm(n,i,c,d,a);case 15:return dm(n,i,i.type,i.pendingProps,a);case 17:return c=i.type,d=i.pendingProps,d=i.elementType===c?d:xn(c,d),hu(n,i),i.tag=1,Qt(c)?(n=!0,Kl(i)):n=!1,no(i,a),rm(i,c,d),Rh(i,c,d,a),Nh(null,i,c,!0,n,a);case 19:return Em(n,i,a);case 22:return fm(n,i,a)}throw Error(t(156,i.tag))};function Wm(n,i){return ks(n,i)}function vw(n,i,a,c){this.tag=n,this.key=a,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=i,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=c,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function _n(n,i,a,c){return new vw(n,i,a,c)}function Xh(n){return n=n.prototype,!(!n||!n.isReactComponent)}function Ew(n){if(typeof n=="function")return Xh(n)?1:0;if(n!=null){if(n=n.$$typeof,n===x)return 11;if(n===Ot)return 14}return 2}function ri(n,i){var a=n.alternate;return a===null?(a=_n(n.tag,i,n.key,n.mode),a.elementType=n.elementType,a.type=n.type,a.stateNode=n.stateNode,a.alternate=n,n.alternate=a):(a.pendingProps=i,a.type=n.type,a.flags=0,a.subtreeFlags=0,a.deletions=null),a.flags=n.flags&14680064,a.childLanes=n.childLanes,a.lanes=n.lanes,a.child=n.child,a.memoizedProps=n.memoizedProps,a.memoizedState=n.memoizedState,a.updateQueue=n.updateQueue,i=n.dependencies,a.dependencies=i===null?null:{lanes:i.lanes,firstContext:i.firstContext},a.sibling=n.sibling,a.index=n.index,a.ref=n.ref,a}function Tu(n,i,a,c,d,m){var v=2;if(c=n,typeof n=="function")Xh(n)&&(v=1);else if(typeof n=="string")v=5;else e:switch(n){case D:return ns(a.children,d,m,i);case S:v=8,d|=8;break;case C:return n=_n(12,a,i,d|2),n.elementType=C,n.lanes=m,n;case A:return n=_n(13,a,i,d),n.elementType=A,n.lanes=m,n;case tt:return n=_n(19,a,i,d),n.elementType=tt,n.lanes=m,n;case je:return Iu(a,d,m,i);default:if(typeof n=="object"&&n!==null)switch(n.$$typeof){case k:v=10;break e;case O:v=9;break e;case x:v=11;break e;case Ot:v=14;break e;case Vt:v=16,c=null;break e}throw Error(t(130,n==null?n:typeof n,""))}return i=_n(v,a,i,d),i.elementType=n,i.type=c,i.lanes=m,i}function ns(n,i,a,c){return n=_n(7,n,c,i),n.lanes=a,n}function Iu(n,i,a,c){return n=_n(22,n,c,i),n.elementType=je,n.lanes=a,n.stateNode={isHidden:!1},n}function Jh(n,i,a){return n=_n(6,n,null,i),n.lanes=a,n}function Yh(n,i,a){return i=_n(4,n.children!==null?n.children:[],n.key,i),i.lanes=a,i.stateNode={containerInfo:n.containerInfo,pendingChildren:null,implementation:n.implementation},i}function ww(n,i,a,c,d){this.tag=i,this.containerInfo=n,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=Fr(0),this.expirationTimes=Fr(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Fr(0),this.identifierPrefix=c,this.onRecoverableError=d,this.mutableSourceEagerHydrationData=null}function Zh(n,i,a,c,d,m,v,I,P){return n=new ww(n,i,a,I,P),i===1?(i=1,m===!0&&(i|=8)):i=0,m=_n(3,null,null,i),n.current=m,m.stateNode=n,m.memoizedState={element:c,isDehydrated:a,cache:null,transitions:null,pendingSuspenseBoundaries:null},dh(m),n}function Tw(n,i,a){var c=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:Re,key:c==null?null:""+c,children:n,containerInfo:i,implementation:a}}function Hm(n){if(!n)return Gr;n=n._reactInternals;e:{if(An(n)!==n||n.tag!==1)throw Error(t(170));var i=n;do{switch(i.tag){case 3:i=i.stateNode.context;break e;case 1:if(Qt(i.type)){i=i.stateNode.__reactInternalMemoizedMergedChildContext;break e}}i=i.return}while(i!==null);throw Error(t(171))}if(n.tag===1){var a=n.type;if(Qt(a))return vp(n,a,i)}return i}function qm(n,i,a,c,d,m,v,I,P){return n=Zh(a,c,!0,n,d,m,v,I,P),n.context=Hm(null),a=n.current,c=Ht(),d=ti(a),m=Tr(c,d),m.callback=i??null,Jr(a,m,d),n.current.lanes=d,Ur(n,d,c),Yt(n,c),n}function Su(n,i,a,c){var d=i.current,m=Ht(),v=ti(d);return a=Hm(a),i.context===null?i.context=a:i.pendingContext=a,i=Tr(m,v),i.payload={element:n},c=c===void 0?null:c,c!==null&&(i.callback=c),n=Jr(d,i,v),n!==null&&(bn(n,d,v,m),tu(n,d,v)),v}function Au(n){if(n=n.current,!n.child)return null;switch(n.child.tag){case 5:return n.child.stateNode;default:return n.child.stateNode}}function Km(n,i){if(n=n.memoizedState,n!==null&&n.dehydrated!==null){var a=n.retryLane;n.retryLane=a!==0&&a<i?a:i}}function ed(n,i){Km(n,i),(n=n.alternate)&&Km(n,i)}function Iw(){return null}var Gm=typeof reportError=="function"?reportError:function(n){console.error(n)};function td(n){this._internalRoot=n}Ru.prototype.render=td.prototype.render=function(n){var i=this._internalRoot;if(i===null)throw Error(t(409));Su(n,i,null,null)},Ru.prototype.unmount=td.prototype.unmount=function(){var n=this._internalRoot;if(n!==null){this._internalRoot=null;var i=n.containerInfo;Zi(function(){Su(null,n,null,null)}),i[yr]=null}};function Ru(n){this._internalRoot=n}Ru.prototype.unstable_scheduleHydration=function(n){if(n){var i=Rl();n={blockedOn:null,target:n,priority:i};for(var a=0;a<Wn.length&&i!==0&&i<Wn[a].priority;a++);Wn.splice(a,0,n),a===0&&kl(n)}};function nd(n){return!(!n||n.nodeType!==1&&n.nodeType!==9&&n.nodeType!==11)}function Cu(n){return!(!n||n.nodeType!==1&&n.nodeType!==9&&n.nodeType!==11&&(n.nodeType!==8||n.nodeValue!==" react-mount-point-unstable "))}function Qm(){}function Sw(n,i,a,c,d){if(d){if(typeof c=="function"){var m=c;c=function(){var U=Au(v);m.call(U)}}var v=qm(i,c,n,0,null,!1,!1,"",Qm);return n._reactRootContainer=v,n[yr]=v.current,ca(n.nodeType===8?n.parentNode:n),Zi(),v}for(;d=n.lastChild;)n.removeChild(d);if(typeof c=="function"){var I=c;c=function(){var U=Au(P);I.call(U)}}var P=Zh(n,0,!1,null,null,!1,!1,"",Qm);return n._reactRootContainer=P,n[yr]=P.current,ca(n.nodeType===8?n.parentNode:n),Zi(function(){Su(i,P,a,c)}),P}function Pu(n,i,a,c,d){var m=a._reactRootContainer;if(m){var v=m;if(typeof d=="function"){var I=d;d=function(){var P=Au(v);I.call(P)}}Su(i,v,n,d)}else v=Sw(a,i,n,d,c);return Au(v)}Sl=function(n){switch(n.tag){case 3:var i=n.stateNode;if(i.current.memoizedState.isDehydrated){var a=br(i.pendingLanes);a!==0&&(jr(i,a|1),Yt(i,$e()),(Ve&6)===0&&(ao=$e()+500,Qr()))}break;case 13:Zi(function(){var c=wr(n,1);if(c!==null){var d=Ht();bn(c,n,1,d)}}),ed(n,1)}},Os=function(n){if(n.tag===13){var i=wr(n,134217728);if(i!==null){var a=Ht();bn(i,n,134217728,a)}ed(n,134217728)}},Al=function(n){if(n.tag===13){var i=ti(n),a=wr(n,i);if(a!==null){var c=Ht();bn(a,n,i,c)}ed(n,i)}},Rl=function(){return ke},Cl=function(n,i){var a=ke;try{return ke=n,i()}finally{ke=a}},Is=function(n,i,a){switch(i){case"input":if(Lo(n,a),i=a.name,a.type==="radio"&&i!=null){for(a=n;a.parentNode;)a=a.parentNode;for(a=a.querySelectorAll("input[name="+JSON.stringify(""+i)+'][type="radio"]'),i=0;i<a.length;i++){var c=a[i];if(c!==n&&c.form===n.form){var d=Hl(c);if(!d)throw Error(t(90));ys(c),Lo(c,d)}}}break;case"textarea":ws(n,a);break;case"select":i=a.value,i!=null&&ur(n,!!a.multiple,i,!1)}},Vi=Kh,Ho=Zi;var Aw={usingClientEntryPoint:!1,Events:[fa,Gs,Hl,Bn,Wo,Kh]},Ca={findFiberByHostInstance:Hi,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},Rw={bundleType:Ca.bundleType,version:Ca.version,rendererPackageName:Ca.rendererPackageName,rendererConfig:Ca.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:ge.ReactCurrentDispatcher,findHostInstanceByFiber:function(n){return n=Go(n),n===null?null:n.stateNode},findFiberByHostInstance:Ca.findFiberByHostInstance||Iw,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var ku=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!ku.isDisabled&&ku.supportsFiber)try{Fi=ku.inject(Rw),tn=ku}catch{}}return Zt.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=Aw,Zt.createPortal=function(n,i){var a=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!nd(i))throw Error(t(200));return Tw(n,i,null,a)},Zt.createRoot=function(n,i){if(!nd(n))throw Error(t(299));var a=!1,c="",d=Gm;return i!=null&&(i.unstable_strictMode===!0&&(a=!0),i.identifierPrefix!==void 0&&(c=i.identifierPrefix),i.onRecoverableError!==void 0&&(d=i.onRecoverableError)),i=Zh(n,1,!1,null,null,a,!1,c,d),n[yr]=i.current,ca(n.nodeType===8?n.parentNode:n),new td(i)},Zt.findDOMNode=function(n){if(n==null)return null;if(n.nodeType===1)return n;var i=n._reactInternals;if(i===void 0)throw typeof n.render=="function"?Error(t(188)):(n=Object.keys(n).join(","),Error(t(268,n)));return n=Go(i),n=n===null?null:n.stateNode,n},Zt.flushSync=function(n){return Zi(n)},Zt.hydrate=function(n,i,a){if(!Cu(i))throw Error(t(200));return Pu(null,n,i,!0,a)},Zt.hydrateRoot=function(n,i,a){if(!nd(n))throw Error(t(405));var c=a!=null&&a.hydratedSources||null,d=!1,m="",v=Gm;if(a!=null&&(a.unstable_strictMode===!0&&(d=!0),a.identifierPrefix!==void 0&&(m=a.identifierPrefix),a.onRecoverableError!==void 0&&(v=a.onRecoverableError)),i=qm(i,null,n,1,a??null,d,!1,m,v),n[yr]=i.current,ca(n),c)for(n=0;n<c.length;n++)a=c[n],d=a._getVersion,d=d(a._source),i.mutableSourceEagerHydrationData==null?i.mutableSourceEagerHydrationData=[a,d]:i.mutableSourceEagerHydrationData.push(a,d);return new Ru(i)},Zt.render=function(n,i,a){if(!Cu(i))throw Error(t(200));return Pu(null,n,i,!1,a)},Zt.unmountComponentAtNode=function(n){if(!Cu(n))throw Error(t(40));return n._reactRootContainer?(Zi(function(){Pu(null,null,n,!1,function(){n._reactRootContainer=null,n[yr]=null})}),!0):!1},Zt.unstable_batchedUpdates=Kh,Zt.unstable_renderSubtreeIntoContainer=function(n,i,a,c){if(!Cu(a))throw Error(t(200));if(n==null||n._reactInternals===void 0)throw Error(t(38));return Pu(n,i,a,!1,c)},Zt.version="18.3.1-next-f1338f8080-20240426",Zt}var rg;function By(){if(rg)return sd.exports;rg=1;function r(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(r)}catch(e){console.error(e)}}return r(),sd.exports=Lw(),sd.exports}var ig;function Mw(){if(ig)return Nu;ig=1;var r=By();return Nu.createRoot=r.createRoot,Nu.hydrateRoot=r.hydrateRoot,Nu}var bw=Mw();const Fw=jy(bw);By();/**
 * @remix-run/router v1.23.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function $a(){return $a=Object.assign?Object.assign.bind():function(r){for(var e=1;e<arguments.length;e++){var t=arguments[e];for(var s in t)Object.prototype.hasOwnProperty.call(t,s)&&(r[s]=t[s])}return r},$a.apply(this,arguments)}var ci;(function(r){r.Pop="POP",r.Push="PUSH",r.Replace="REPLACE"})(ci||(ci={}));const sg="popstate";function Uw(r){r===void 0&&(r={});function e(s,o){let{pathname:l,search:h,hash:f}=s.location;return wd("",{pathname:l,search:h,hash:f},o.state&&o.state.usr||null,o.state&&o.state.key||"default")}function t(s,o){return typeof o=="string"?o:Ku(o)}return zw(e,t,null,r)}function st(r,e){if(r===!1||r===null||typeof r>"u")throw new Error(e)}function $y(r,e){if(!r){typeof console<"u"&&console.warn(e);try{throw new Error(e)}catch{}}}function jw(){return Math.random().toString(36).substr(2,8)}function og(r,e){return{usr:r.state,key:r.key,idx:e}}function wd(r,e,t,s){return t===void 0&&(t=null),$a({pathname:typeof r=="string"?r:r.pathname,search:"",hash:""},typeof e=="string"?Ao(e):e,{state:t,key:e&&e.key||s||jw()})}function Ku(r){let{pathname:e="/",search:t="",hash:s=""}=r;return t&&t!=="?"&&(e+=t.charAt(0)==="?"?t:"?"+t),s&&s!=="#"&&(e+=s.charAt(0)==="#"?s:"#"+s),e}function Ao(r){let e={};if(r){let t=r.indexOf("#");t>=0&&(e.hash=r.substr(t),r=r.substr(0,t));let s=r.indexOf("?");s>=0&&(e.search=r.substr(s),r=r.substr(0,s)),r&&(e.pathname=r)}return e}function zw(r,e,t,s){s===void 0&&(s={});let{window:o=document.defaultView,v5Compat:l=!1}=s,h=o.history,f=ci.Pop,g=null,_=E();_==null&&(_=0,h.replaceState($a({},h.state,{idx:_}),""));function E(){return(h.state||{idx:null}).idx}function T(){f=ci.Pop;let F=E(),ae=F==null?null:F-_;_=F,g&&g({action:f,location:$.location,delta:ae})}function R(F,ae){f=ci.Push;let re=wd($.location,F,ae);_=E()+1;let ie=og(re,_),ge=$.createHref(re);try{h.pushState(ie,"",ge)}catch(Le){if(Le instanceof DOMException&&Le.name==="DataCloneError")throw Le;o.location.assign(ge)}l&&g&&g({action:f,location:$.location,delta:1})}function j(F,ae){f=ci.Replace;let re=wd($.location,F,ae);_=E();let ie=og(re,_),ge=$.createHref(re);h.replaceState(ie,"",ge),l&&g&&g({action:f,location:$.location,delta:0})}function B(F){let ae=o.location.origin!=="null"?o.location.origin:o.location.href,re=typeof F=="string"?F:Ku(F);return re=re.replace(/ $/,"%20"),st(ae,"No window.location.(origin|href) available to create URL for href: "+re),new URL(re,ae)}let $={get action(){return f},get location(){return r(o,h)},listen(F){if(g)throw new Error("A history only accepts one active listener");return o.addEventListener(sg,T),g=F,()=>{o.removeEventListener(sg,T),g=null}},createHref(F){return e(o,F)},createURL:B,encodeLocation(F){let ae=B(F);return{pathname:ae.pathname,search:ae.search,hash:ae.hash}},push:R,replace:j,go(F){return h.go(F)}};return $}var ag;(function(r){r.data="data",r.deferred="deferred",r.redirect="redirect",r.error="error"})(ag||(ag={}));function Bw(r,e,t){return t===void 0&&(t="/"),$w(r,e,t)}function $w(r,e,t,s){let o=typeof e=="string"?Ao(e):e,l=Xd(o.pathname||"/",t);if(l==null)return null;let h=Wy(r);Ww(h);let f=null;for(let g=0;f==null&&g<h.length;++g){let _=n0(l);f=Zw(h[g],_)}return f}function Wy(r,e,t,s){e===void 0&&(e=[]),t===void 0&&(t=[]),s===void 0&&(s="");let o=(l,h,f)=>{let g={relativePath:f===void 0?l.path||"":f,caseSensitive:l.caseSensitive===!0,childrenIndex:h,route:l};g.relativePath.startsWith("/")&&(st(g.relativePath.startsWith(s),'Absolute route path "'+g.relativePath+'" nested under path '+('"'+s+'" is not valid. An absolute child route path ')+"must start with the combined path of all its parent routes."),g.relativePath=g.relativePath.slice(s.length));let _=di([s,g.relativePath]),E=t.concat(g);l.children&&l.children.length>0&&(st(l.index!==!0,"Index routes must not have child routes. Please remove "+('all child routes from route path "'+_+'".')),Wy(l.children,e,E,_)),!(l.path==null&&!l.index)&&e.push({path:_,score:Jw(_,l.index),routesMeta:E})};return r.forEach((l,h)=>{var f;if(l.path===""||!((f=l.path)!=null&&f.includes("?")))o(l,h);else for(let g of Hy(l.path))o(l,h,g)}),e}function Hy(r){let e=r.split("/");if(e.length===0)return[];let[t,...s]=e,o=t.endsWith("?"),l=t.replace(/\?$/,"");if(s.length===0)return o?[l,""]:[l];let h=Hy(s.join("/")),f=[];return f.push(...h.map(g=>g===""?l:[l,g].join("/"))),o&&f.push(...h),f.map(g=>r.startsWith("/")&&g===""?"/":g)}function Ww(r){r.sort((e,t)=>e.score!==t.score?t.score-e.score:Yw(e.routesMeta.map(s=>s.childrenIndex),t.routesMeta.map(s=>s.childrenIndex)))}const Hw=/^:[\w-]+$/,qw=3,Kw=2,Gw=1,Qw=10,Xw=-2,lg=r=>r==="*";function Jw(r,e){let t=r.split("/"),s=t.length;return t.some(lg)&&(s+=Xw),e&&(s+=Kw),t.filter(o=>!lg(o)).reduce((o,l)=>o+(Hw.test(l)?qw:l===""?Gw:Qw),s)}function Yw(r,e){return r.length===e.length&&r.slice(0,-1).every((s,o)=>s===e[o])?r[r.length-1]-e[e.length-1]:0}function Zw(r,e,t){let{routesMeta:s}=r,o={},l="/",h=[];for(let f=0;f<s.length;++f){let g=s[f],_=f===s.length-1,E=l==="/"?e:e.slice(l.length)||"/",T=e0({path:g.relativePath,caseSensitive:g.caseSensitive,end:_},E),R=g.route;if(!T)return null;Object.assign(o,T.params),h.push({params:o,pathname:di([l,T.pathname]),pathnameBase:o0(di([l,T.pathnameBase])),route:R}),T.pathnameBase!=="/"&&(l=di([l,T.pathnameBase]))}return h}function e0(r,e){typeof r=="string"&&(r={path:r,caseSensitive:!1,end:!0});let[t,s]=t0(r.path,r.caseSensitive,r.end),o=e.match(t);if(!o)return null;let l=o[0],h=l.replace(/(.)\/+$/,"$1"),f=o.slice(1);return{params:s.reduce((_,E,T)=>{let{paramName:R,isOptional:j}=E;if(R==="*"){let $=f[T]||"";h=l.slice(0,l.length-$.length).replace(/(.)\/+$/,"$1")}const B=f[T];return j&&!B?_[R]=void 0:_[R]=(B||"").replace(/%2F/g,"/"),_},{}),pathname:l,pathnameBase:h,pattern:r}}function t0(r,e,t){e===void 0&&(e=!1),t===void 0&&(t=!0),$y(r==="*"||!r.endsWith("*")||r.endsWith("/*"),'Route path "'+r+'" will be treated as if it were '+('"'+r.replace(/\*$/,"/*")+'" because the `*` character must ')+"always follow a `/` in the pattern. To get rid of this warning, "+('please change the route path to "'+r.replace(/\*$/,"/*")+'".'));let s=[],o="^"+r.replace(/\/*\*?$/,"").replace(/^\/*/,"/").replace(/[\\.*+^${}|()[\]]/g,"\\$&").replace(/\/:([\w-]+)(\?)?/g,(h,f,g)=>(s.push({paramName:f,isOptional:g!=null}),g?"/?([^\\/]+)?":"/([^\\/]+)"));return r.endsWith("*")?(s.push({paramName:"*"}),o+=r==="*"||r==="/*"?"(.*)$":"(?:\\/(.+)|\\/*)$"):t?o+="\\/*$":r!==""&&r!=="/"&&(o+="(?:(?=\\/|$))"),[new RegExp(o,e?void 0:"i"),s]}function n0(r){try{return r.split("/").map(e=>decodeURIComponent(e).replace(/\//g,"%2F")).join("/")}catch(e){return $y(!1,'The URL path "'+r+'" could not be decoded because it is is a malformed URL segment. This is probably due to a bad percent '+("encoding ("+e+").")),r}}function Xd(r,e){if(e==="/")return r;if(!r.toLowerCase().startsWith(e.toLowerCase()))return null;let t=e.endsWith("/")?e.length-1:e.length,s=r.charAt(t);return s&&s!=="/"?null:r.slice(t)||"/"}function r0(r,e){e===void 0&&(e="/");let{pathname:t,search:s="",hash:o=""}=typeof r=="string"?Ao(r):r;return{pathname:t?t.startsWith("/")?t:i0(t,e):e,search:a0(s),hash:l0(o)}}function i0(r,e){let t=e.replace(/\/+$/,"").split("/");return r.split("/").forEach(o=>{o===".."?t.length>1&&t.pop():o!=="."&&t.push(o)}),t.length>1?t.join("/"):"/"}function ld(r,e,t,s){return"Cannot include a '"+r+"' character in a manually specified "+("`to."+e+"` field ["+JSON.stringify(s)+"].  Please separate it out to the ")+("`to."+t+"` field. Alternatively you may provide the full path as ")+'a string in <Link to="..."> and the router will parse it for you.'}function s0(r){return r.filter((e,t)=>t===0||e.route.path&&e.route.path.length>0)}function Jd(r,e){let t=s0(r);return e?t.map((s,o)=>o===t.length-1?s.pathname:s.pathnameBase):t.map(s=>s.pathnameBase)}function Yd(r,e,t,s){s===void 0&&(s=!1);let o;typeof r=="string"?o=Ao(r):(o=$a({},r),st(!o.pathname||!o.pathname.includes("?"),ld("?","pathname","search",o)),st(!o.pathname||!o.pathname.includes("#"),ld("#","pathname","hash",o)),st(!o.search||!o.search.includes("#"),ld("#","search","hash",o)));let l=r===""||o.pathname==="",h=l?"/":o.pathname,f;if(h==null)f=t;else{let T=e.length-1;if(!s&&h.startsWith("..")){let R=h.split("/");for(;R[0]==="..";)R.shift(),T-=1;o.pathname=R.join("/")}f=T>=0?e[T]:"/"}let g=r0(o,f),_=h&&h!=="/"&&h.endsWith("/"),E=(l||h===".")&&t.endsWith("/");return!g.pathname.endsWith("/")&&(_||E)&&(g.pathname+="/"),g}const di=r=>r.join("/").replace(/\/\/+/g,"/"),o0=r=>r.replace(/\/+$/,"").replace(/^\/*/,"/"),a0=r=>!r||r==="?"?"":r.startsWith("?")?r:"?"+r,l0=r=>!r||r==="#"?"":r.startsWith("#")?r:"#"+r;function u0(r){return r!=null&&typeof r.status=="number"&&typeof r.statusText=="string"&&typeof r.internal=="boolean"&&"data"in r}const qy=["post","put","patch","delete"];new Set(qy);const c0=["get",...qy];new Set(c0);/**
 * React Router v6.30.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function Wa(){return Wa=Object.assign?Object.assign.bind():function(r){for(var e=1;e<arguments.length;e++){var t=arguments[e];for(var s in t)Object.prototype.hasOwnProperty.call(t,s)&&(r[s]=t[s])}return r},Wa.apply(this,arguments)}const Zd=Y.createContext(null),h0=Y.createContext(null),Ai=Y.createContext(null),pc=Y.createContext(null),Ri=Y.createContext({outlet:null,matches:[],isDataRoute:!1}),Ky=Y.createContext(null);function d0(r,e){let{relative:t}=e===void 0?{}:e;Ro()||st(!1);let{basename:s,navigator:o}=Y.useContext(Ai),{hash:l,pathname:h,search:f}=Xy(r,{relative:t}),g=h;return s!=="/"&&(g=h==="/"?s:di([s,h])),o.createHref({pathname:g,search:f,hash:l})}function Ro(){return Y.useContext(pc)!=null}function nl(){return Ro()||st(!1),Y.useContext(pc).location}function Gy(r){Y.useContext(Ai).static||Y.useLayoutEffect(r)}function Qy(){let{isDataRoute:r}=Y.useContext(Ri);return r?A0():f0()}function f0(){Ro()||st(!1);let r=Y.useContext(Zd),{basename:e,future:t,navigator:s}=Y.useContext(Ai),{matches:o}=Y.useContext(Ri),{pathname:l}=nl(),h=JSON.stringify(Jd(o,t.v7_relativeSplatPath)),f=Y.useRef(!1);return Gy(()=>{f.current=!0}),Y.useCallback(function(_,E){if(E===void 0&&(E={}),!f.current)return;if(typeof _=="number"){s.go(_);return}let T=Yd(_,JSON.parse(h),l,E.relative==="path");r==null&&e!=="/"&&(T.pathname=T.pathname==="/"?e:di([e,T.pathname])),(E.replace?s.replace:s.push)(T,E.state,E)},[e,s,h,l,r])}function Xy(r,e){let{relative:t}=e===void 0?{}:e,{future:s}=Y.useContext(Ai),{matches:o}=Y.useContext(Ri),{pathname:l}=nl(),h=JSON.stringify(Jd(o,s.v7_relativeSplatPath));return Y.useMemo(()=>Yd(r,JSON.parse(h),l,t==="path"),[r,h,l,t])}function p0(r,e){return m0(r,e)}function m0(r,e,t,s){Ro()||st(!1);let{navigator:o}=Y.useContext(Ai),{matches:l}=Y.useContext(Ri),h=l[l.length-1],f=h?h.params:{};h&&h.pathname;let g=h?h.pathnameBase:"/";h&&h.route;let _=nl(),E;if(e){var T;let F=typeof e=="string"?Ao(e):e;g==="/"||(T=F.pathname)!=null&&T.startsWith(g)||st(!1),E=F}else E=_;let R=E.pathname||"/",j=R;if(g!=="/"){let F=g.replace(/^\//,"").split("/");j="/"+R.replace(/^\//,"").split("/").slice(F.length).join("/")}let B=Bw(r,{pathname:j}),$=E0(B&&B.map(F=>Object.assign({},F,{params:Object.assign({},f,F.params),pathname:di([g,o.encodeLocation?o.encodeLocation(F.pathname).pathname:F.pathname]),pathnameBase:F.pathnameBase==="/"?g:di([g,o.encodeLocation?o.encodeLocation(F.pathnameBase).pathname:F.pathnameBase])})),l,t,s);return e&&$?Y.createElement(pc.Provider,{value:{location:Wa({pathname:"/",search:"",hash:"",state:null,key:"default"},E),navigationType:ci.Pop}},$):$}function g0(){let r=S0(),e=u0(r)?r.status+" "+r.statusText:r instanceof Error?r.message:JSON.stringify(r),t=r instanceof Error?r.stack:null,o={padding:"0.5rem",backgroundColor:"rgba(200,200,200, 0.5)"};return Y.createElement(Y.Fragment,null,Y.createElement("h2",null,"Unexpected Application Error!"),Y.createElement("h3",{style:{fontStyle:"italic"}},e),t?Y.createElement("pre",{style:o},t):null,null)}const y0=Y.createElement(g0,null);class _0 extends Y.Component{constructor(e){super(e),this.state={location:e.location,revalidation:e.revalidation,error:e.error}}static getDerivedStateFromError(e){return{error:e}}static getDerivedStateFromProps(e,t){return t.location!==e.location||t.revalidation!=="idle"&&e.revalidation==="idle"?{error:e.error,location:e.location,revalidation:e.revalidation}:{error:e.error!==void 0?e.error:t.error,location:t.location,revalidation:e.revalidation||t.revalidation}}componentDidCatch(e,t){console.error("React Router caught the following error during render",e,t)}render(){return this.state.error!==void 0?Y.createElement(Ri.Provider,{value:this.props.routeContext},Y.createElement(Ky.Provider,{value:this.state.error,children:this.props.component})):this.props.children}}function v0(r){let{routeContext:e,match:t,children:s}=r,o=Y.useContext(Zd);return o&&o.static&&o.staticContext&&(t.route.errorElement||t.route.ErrorBoundary)&&(o.staticContext._deepestRenderedBoundaryId=t.route.id),Y.createElement(Ri.Provider,{value:e},s)}function E0(r,e,t,s){var o;if(e===void 0&&(e=[]),t===void 0&&(t=null),s===void 0&&(s=null),r==null){var l;if(!t)return null;if(t.errors)r=t.matches;else if((l=s)!=null&&l.v7_partialHydration&&e.length===0&&!t.initialized&&t.matches.length>0)r=t.matches;else return null}let h=r,f=(o=t)==null?void 0:o.errors;if(f!=null){let E=h.findIndex(T=>T.route.id&&f?.[T.route.id]!==void 0);E>=0||st(!1),h=h.slice(0,Math.min(h.length,E+1))}let g=!1,_=-1;if(t&&s&&s.v7_partialHydration)for(let E=0;E<h.length;E++){let T=h[E];if((T.route.HydrateFallback||T.route.hydrateFallbackElement)&&(_=E),T.route.id){let{loaderData:R,errors:j}=t,B=T.route.loader&&R[T.route.id]===void 0&&(!j||j[T.route.id]===void 0);if(T.route.lazy||B){g=!0,_>=0?h=h.slice(0,_+1):h=[h[0]];break}}}return h.reduceRight((E,T,R)=>{let j,B=!1,$=null,F=null;t&&(j=f&&T.route.id?f[T.route.id]:void 0,$=T.route.errorElement||y0,g&&(_<0&&R===0?(R0("route-fallback"),B=!0,F=null):_===R&&(B=!0,F=T.route.hydrateFallbackElement||null)));let ae=e.concat(h.slice(0,R+1)),re=()=>{let ie;return j?ie=$:B?ie=F:T.route.Component?ie=Y.createElement(T.route.Component,null):T.route.element?ie=T.route.element:ie=E,Y.createElement(v0,{match:T,routeContext:{outlet:E,matches:ae,isDataRoute:t!=null},children:ie})};return t&&(T.route.ErrorBoundary||T.route.errorElement||R===0)?Y.createElement(_0,{location:t.location,revalidation:t.revalidation,component:$,error:j,children:re(),routeContext:{outlet:null,matches:ae,isDataRoute:!0}}):re()},null)}var Jy=function(r){return r.UseBlocker="useBlocker",r.UseRevalidator="useRevalidator",r.UseNavigateStable="useNavigate",r}(Jy||{}),Yy=function(r){return r.UseBlocker="useBlocker",r.UseLoaderData="useLoaderData",r.UseActionData="useActionData",r.UseRouteError="useRouteError",r.UseNavigation="useNavigation",r.UseRouteLoaderData="useRouteLoaderData",r.UseMatches="useMatches",r.UseRevalidator="useRevalidator",r.UseNavigateStable="useNavigate",r.UseRouteId="useRouteId",r}(Yy||{});function w0(r){let e=Y.useContext(Zd);return e||st(!1),e}function T0(r){let e=Y.useContext(h0);return e||st(!1),e}function I0(r){let e=Y.useContext(Ri);return e||st(!1),e}function Zy(r){let e=I0(),t=e.matches[e.matches.length-1];return t.route.id||st(!1),t.route.id}function S0(){var r;let e=Y.useContext(Ky),t=T0(),s=Zy();return e!==void 0?e:(r=t.errors)==null?void 0:r[s]}function A0(){let{router:r}=w0(Jy.UseNavigateStable),e=Zy(Yy.UseNavigateStable),t=Y.useRef(!1);return Gy(()=>{t.current=!0}),Y.useCallback(function(o,l){l===void 0&&(l={}),t.current&&(typeof o=="number"?r.navigate(o):r.navigate(o,Wa({fromRouteId:e},l)))},[r,e])}const ug={};function R0(r,e,t){ug[r]||(ug[r]=!0)}function C0(r,e){r?.v7_startTransition,r?.v7_relativeSplatPath}function ud(r){let{to:e,replace:t,state:s,relative:o}=r;Ro()||st(!1);let{future:l,static:h}=Y.useContext(Ai),{matches:f}=Y.useContext(Ri),{pathname:g}=nl(),_=Qy(),E=Yd(e,Jd(f,l.v7_relativeSplatPath),g,o==="path"),T=JSON.stringify(E);return Y.useEffect(()=>_(JSON.parse(T),{replace:t,state:s,relative:o}),[_,T,o,t,s]),null}function ka(r){st(!1)}function P0(r){let{basename:e="/",children:t=null,location:s,navigationType:o=ci.Pop,navigator:l,static:h=!1,future:f}=r;Ro()&&st(!1);let g=e.replace(/^\/*/,"/"),_=Y.useMemo(()=>({basename:g,navigator:l,static:h,future:Wa({v7_relativeSplatPath:!1},f)}),[g,f,l,h]);typeof s=="string"&&(s=Ao(s));let{pathname:E="/",search:T="",hash:R="",state:j=null,key:B="default"}=s,$=Y.useMemo(()=>{let F=Xd(E,g);return F==null?null:{location:{pathname:F,search:T,hash:R,state:j,key:B},navigationType:o}},[g,E,T,R,j,B,o]);return $==null?null:Y.createElement(Ai.Provider,{value:_},Y.createElement(pc.Provider,{children:t,value:$}))}function k0(r){let{children:e,location:t}=r;return p0(Td(e),t)}new Promise(()=>{});function Td(r,e){e===void 0&&(e=[]);let t=[];return Y.Children.forEach(r,(s,o)=>{if(!Y.isValidElement(s))return;let l=[...e,o];if(s.type===Y.Fragment){t.push.apply(t,Td(s.props.children,l));return}s.type!==ka&&st(!1),!s.props.index||!s.props.children||st(!1);let h={id:s.props.id||l.join("-"),caseSensitive:s.props.caseSensitive,element:s.props.element,Component:s.props.Component,index:s.props.index,path:s.props.path,loader:s.props.loader,action:s.props.action,errorElement:s.props.errorElement,ErrorBoundary:s.props.ErrorBoundary,hasErrorBoundary:s.props.ErrorBoundary!=null||s.props.errorElement!=null,shouldRevalidate:s.props.shouldRevalidate,handle:s.props.handle,lazy:s.props.lazy};s.props.children&&(h.children=Td(s.props.children,l)),t.push(h)}),t}/**
 * React Router DOM v6.30.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function Id(){return Id=Object.assign?Object.assign.bind():function(r){for(var e=1;e<arguments.length;e++){var t=arguments[e];for(var s in t)Object.prototype.hasOwnProperty.call(t,s)&&(r[s]=t[s])}return r},Id.apply(this,arguments)}function N0(r,e){if(r==null)return{};var t={},s=Object.keys(r),o,l;for(l=0;l<s.length;l++)o=s[l],!(e.indexOf(o)>=0)&&(t[o]=r[o]);return t}function D0(r){return!!(r.metaKey||r.altKey||r.ctrlKey||r.shiftKey)}function O0(r,e){return r.button===0&&(!e||e==="_self")&&!D0(r)}const V0=["onClick","relative","reloadDocument","replace","state","target","to","preventScrollReset","viewTransition"],x0="6";try{window.__reactRouterVersion=x0}catch{}const L0="startTransition",cg=Ow[L0];function M0(r){let{basename:e,children:t,future:s,window:o}=r,l=Y.useRef();l.current==null&&(l.current=Uw({window:o,v5Compat:!0}));let h=l.current,[f,g]=Y.useState({action:h.action,location:h.location}),{v7_startTransition:_}=s||{},E=Y.useCallback(T=>{_&&cg?cg(()=>g(T)):g(T)},[g,_]);return Y.useLayoutEffect(()=>h.listen(E),[h,E]),Y.useEffect(()=>C0(s),[s]),Y.createElement(P0,{basename:e,children:t,location:f.location,navigationType:f.action,navigator:h,future:s})}const b0=typeof window<"u"&&typeof window.document<"u"&&typeof window.document.createElement<"u",F0=/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i,pP=Y.forwardRef(function(e,t){let{onClick:s,relative:o,reloadDocument:l,replace:h,state:f,target:g,to:_,preventScrollReset:E,viewTransition:T}=e,R=N0(e,V0),{basename:j}=Y.useContext(Ai),B,$=!1;if(typeof _=="string"&&F0.test(_)&&(B=_,b0))try{let ie=new URL(window.location.href),ge=_.startsWith("//")?new URL(ie.protocol+_):new URL(_),Le=Xd(ge.pathname,j);ge.origin===ie.origin&&Le!=null?_=Le+ge.search+ge.hash:$=!0}catch{}let F=d0(_,{relative:o}),ae=U0(_,{replace:h,state:f,target:g,preventScrollReset:E,relative:o,viewTransition:T});function re(ie){s&&s(ie),ie.defaultPrevented||ae(ie)}return Y.createElement("a",Id({},R,{href:B||F,onClick:$||l?s:re,ref:t,target:g}))});var hg;(function(r){r.UseScrollRestoration="useScrollRestoration",r.UseSubmit="useSubmit",r.UseSubmitFetcher="useSubmitFetcher",r.UseFetcher="useFetcher",r.useViewTransitionState="useViewTransitionState"})(hg||(hg={}));var dg;(function(r){r.UseFetcher="useFetcher",r.UseFetchers="useFetchers",r.UseScrollRestoration="useScrollRestoration"})(dg||(dg={}));function U0(r,e){let{target:t,replace:s,state:o,preventScrollReset:l,relative:h,viewTransition:f}=e===void 0?{}:e,g=Qy(),_=nl(),E=Xy(r,{relative:h});return Y.useCallback(T=>{if(O0(T,t)){T.preventDefault();let R=s!==void 0?s:Ku(_)===Ku(E);g(r,{replace:R,state:o,preventScrollReset:l,relative:h,viewTransition:f})}},[_,g,E,s,o,t,r,l,h,f])}const j0="modulepreload",z0=function(r,e){return new URL(r,e).href},fg={},rl=function(e,t,s){let o=Promise.resolve();if(t&&t.length>0){let _=function(E){return Promise.all(E.map(T=>Promise.resolve(T).then(R=>({status:"fulfilled",value:R}),R=>({status:"rejected",reason:R}))))};const h=document.getElementsByTagName("link"),f=document.querySelector("meta[property=csp-nonce]"),g=f?.nonce||f?.getAttribute("nonce");o=_(t.map(E=>{if(E=z0(E,s),E in fg)return;fg[E]=!0;const T=E.endsWith(".css"),R=T?'[rel="stylesheet"]':"";if(!!s)for(let $=h.length-1;$>=0;$--){const F=h[$];if(F.href===E&&(!T||F.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${E}"]${R}`))return;const B=document.createElement("link");if(B.rel=T?"stylesheet":j0,T||(B.as="script"),B.crossOrigin="",B.href=E,g&&B.setAttribute("nonce",g),document.head.appendChild(B),T)return new Promise(($,F)=>{B.addEventListener("load",$),B.addEventListener("error",()=>F(new Error(`Unable to preload CSS for ${E}`)))})}))}function l(h){const f=new Event("vite:preloadError",{cancelable:!0});if(f.payload=h,window.dispatchEvent(f),!f.defaultPrevented)throw h}return o.then(h=>{for(const f of h||[])f.status==="rejected"&&l(f.reason);return e().catch(l)})},B0=()=>{};var pg={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const e_=function(r){const e=[];let t=0;for(let s=0;s<r.length;s++){let o=r.charCodeAt(s);o<128?e[t++]=o:o<2048?(e[t++]=o>>6|192,e[t++]=o&63|128):(o&64512)===55296&&s+1<r.length&&(r.charCodeAt(s+1)&64512)===56320?(o=65536+((o&1023)<<10)+(r.charCodeAt(++s)&1023),e[t++]=o>>18|240,e[t++]=o>>12&63|128,e[t++]=o>>6&63|128,e[t++]=o&63|128):(e[t++]=o>>12|224,e[t++]=o>>6&63|128,e[t++]=o&63|128)}return e},$0=function(r){const e=[];let t=0,s=0;for(;t<r.length;){const o=r[t++];if(o<128)e[s++]=String.fromCharCode(o);else if(o>191&&o<224){const l=r[t++];e[s++]=String.fromCharCode((o&31)<<6|l&63)}else if(o>239&&o<365){const l=r[t++],h=r[t++],f=r[t++],g=((o&7)<<18|(l&63)<<12|(h&63)<<6|f&63)-65536;e[s++]=String.fromCharCode(55296+(g>>10)),e[s++]=String.fromCharCode(56320+(g&1023))}else{const l=r[t++],h=r[t++];e[s++]=String.fromCharCode((o&15)<<12|(l&63)<<6|h&63)}}return e.join("")},t_={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(r,e){if(!Array.isArray(r))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,s=[];for(let o=0;o<r.length;o+=3){const l=r[o],h=o+1<r.length,f=h?r[o+1]:0,g=o+2<r.length,_=g?r[o+2]:0,E=l>>2,T=(l&3)<<4|f>>4;let R=(f&15)<<2|_>>6,j=_&63;g||(j=64,h||(R=64)),s.push(t[E],t[T],t[R],t[j])}return s.join("")},encodeString(r,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(r):this.encodeByteArray(e_(r),e)},decodeString(r,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(r):$0(this.decodeStringToByteArray(r,e))},decodeStringToByteArray(r,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,s=[];for(let o=0;o<r.length;){const l=t[r.charAt(o++)],f=o<r.length?t[r.charAt(o)]:0;++o;const _=o<r.length?t[r.charAt(o)]:64;++o;const T=o<r.length?t[r.charAt(o)]:64;if(++o,l==null||f==null||_==null||T==null)throw new W0;const R=l<<2|f>>4;if(s.push(R),_!==64){const j=f<<4&240|_>>2;if(s.push(j),T!==64){const B=_<<6&192|T;s.push(B)}}}return s},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let r=0;r<this.ENCODED_VALS.length;r++)this.byteToCharMap_[r]=this.ENCODED_VALS.charAt(r),this.charToByteMap_[this.byteToCharMap_[r]]=r,this.byteToCharMapWebSafe_[r]=this.ENCODED_VALS_WEBSAFE.charAt(r),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[r]]=r,r>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(r)]=r,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(r)]=r)}}};class W0 extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const H0=function(r){const e=e_(r);return t_.encodeByteArray(e,!0)},Gu=function(r){return H0(r).replace(/\./g,"")},n_=function(r){try{return t_.decodeString(r,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function q0(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const K0=()=>q0().__FIREBASE_DEFAULTS__,G0=()=>{if(typeof process>"u"||typeof pg>"u")return;const r=pg.__FIREBASE_DEFAULTS__;if(r)return JSON.parse(r)},Q0=()=>{if(typeof document>"u")return;let r;try{r=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=r&&n_(r[1]);return e&&JSON.parse(e)},mc=()=>{try{return B0()||K0()||G0()||Q0()}catch(r){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${r}`);return}},r_=r=>{var e,t;return(t=(e=mc())===null||e===void 0?void 0:e.emulatorHosts)===null||t===void 0?void 0:t[r]},X0=r=>{const e=r_(r);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const s=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),s]:[e.substring(0,t),s]},i_=()=>{var r;return(r=mc())===null||r===void 0?void 0:r.config},s_=r=>{var e;return(e=mc())===null||e===void 0?void 0:e[`_${r}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class J0{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,s)=>{t?this.reject(t):this.resolve(s),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,s))}}}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Co(r){try{return(r.startsWith("http://")||r.startsWith("https://")?new URL(r).hostname:r).endsWith(".cloudworkstations.dev")}catch{return!1}}async function o_(r){return(await fetch(r,{credentials:"include"})).ok}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Y0(r,e){if(r.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},s=e||"demo-project",o=r.iat||0,l=r.sub||r.user_id;if(!l)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const h=Object.assign({iss:`https://securetoken.google.com/${s}`,aud:s,iat:o,exp:o+3600,auth_time:o,sub:l,user_id:l,firebase:{sign_in_provider:"custom",identities:{}}},r);return[Gu(JSON.stringify(t)),Gu(JSON.stringify(h)),""].join(".")}const Ma={};function Z0(){const r={prod:[],emulator:[]};for(const e of Object.keys(Ma))Ma[e]?r.emulator.push(e):r.prod.push(e);return r}function eT(r){let e=document.getElementById(r),t=!1;return e||(e=document.createElement("div"),e.setAttribute("id",r),t=!0),{created:t,element:e}}let mg=!1;function a_(r,e){if(typeof window>"u"||typeof document>"u"||!Co(window.location.host)||Ma[r]===e||Ma[r]||mg)return;Ma[r]=e;function t(R){return`__firebase__banner__${R}`}const s="__firebase__banner",l=Z0().prod.length>0;function h(){const R=document.getElementById(s);R&&R.remove()}function f(R){R.style.display="flex",R.style.background="#7faaf0",R.style.position="fixed",R.style.bottom="5px",R.style.left="5px",R.style.padding=".5em",R.style.borderRadius="5px",R.style.alignItems="center"}function g(R,j){R.setAttribute("width","24"),R.setAttribute("id",j),R.setAttribute("height","24"),R.setAttribute("viewBox","0 0 24 24"),R.setAttribute("fill","none"),R.style.marginLeft="-6px"}function _(){const R=document.createElement("span");return R.style.cursor="pointer",R.style.marginLeft="16px",R.style.fontSize="24px",R.innerHTML=" &times;",R.onclick=()=>{mg=!0,h()},R}function E(R,j){R.setAttribute("id",j),R.innerText="Learn more",R.href="https://firebase.google.com/docs/studio/preview-apps#preview-backend",R.setAttribute("target","__blank"),R.style.paddingLeft="5px",R.style.textDecoration="underline"}function T(){const R=eT(s),j=t("text"),B=document.getElementById(j)||document.createElement("span"),$=t("learnmore"),F=document.getElementById($)||document.createElement("a"),ae=t("preprendIcon"),re=document.getElementById(ae)||document.createElementNS("http://www.w3.org/2000/svg","svg");if(R.created){const ie=R.element;f(ie),E(F,$);const ge=_();g(re,ae),ie.append(re,B,F,ge),document.body.appendChild(ie)}l?(B.innerText="Preview backend disconnected.",re.innerHTML=`<g clip-path="url(#clip0_6013_33858)">
<path d="M4.8 17.6L12 5.6L19.2 17.6H4.8ZM6.91667 16.4H17.0833L12 7.93333L6.91667 16.4ZM12 15.6C12.1667 15.6 12.3056 15.5444 12.4167 15.4333C12.5389 15.3111 12.6 15.1667 12.6 15C12.6 14.8333 12.5389 14.6944 12.4167 14.5833C12.3056 14.4611 12.1667 14.4 12 14.4C11.8333 14.4 11.6889 14.4611 11.5667 14.5833C11.4556 14.6944 11.4 14.8333 11.4 15C11.4 15.1667 11.4556 15.3111 11.5667 15.4333C11.6889 15.5444 11.8333 15.6 12 15.6ZM11.4 13.6H12.6V10.4H11.4V13.6Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6013_33858">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`):(re.innerHTML=`<g clip-path="url(#clip0_6083_34804)">
<path d="M11.4 15.2H12.6V11.2H11.4V15.2ZM12 10C12.1667 10 12.3056 9.94444 12.4167 9.83333C12.5389 9.71111 12.6 9.56667 12.6 9.4C12.6 9.23333 12.5389 9.09444 12.4167 8.98333C12.3056 8.86111 12.1667 8.8 12 8.8C11.8333 8.8 11.6889 8.86111 11.5667 8.98333C11.4556 9.09444 11.4 9.23333 11.4 9.4C11.4 9.56667 11.4556 9.71111 11.5667 9.83333C11.6889 9.94444 11.8333 10 12 10ZM12 18.4C11.1222 18.4 10.2944 18.2333 9.51667 17.9C8.73889 17.5667 8.05556 17.1111 7.46667 16.5333C6.88889 15.9444 6.43333 15.2611 6.1 14.4833C5.76667 13.7056 5.6 12.8778 5.6 12C5.6 11.1111 5.76667 10.2833 6.1 9.51667C6.43333 8.73889 6.88889 8.06111 7.46667 7.48333C8.05556 6.89444 8.73889 6.43333 9.51667 6.1C10.2944 5.76667 11.1222 5.6 12 5.6C12.8889 5.6 13.7167 5.76667 14.4833 6.1C15.2611 6.43333 15.9389 6.89444 16.5167 7.48333C17.1056 8.06111 17.5667 8.73889 17.9 9.51667C18.2333 10.2833 18.4 11.1111 18.4 12C18.4 12.8778 18.2333 13.7056 17.9 14.4833C17.5667 15.2611 17.1056 15.9444 16.5167 16.5333C15.9389 17.1111 15.2611 17.5667 14.4833 17.9C13.7167 18.2333 12.8889 18.4 12 18.4ZM12 17.2C13.4444 17.2 14.6722 16.6944 15.6833 15.6833C16.6944 14.6722 17.2 13.4444 17.2 12C17.2 10.5556 16.6944 9.32778 15.6833 8.31667C14.6722 7.30555 13.4444 6.8 12 6.8C10.5556 6.8 9.32778 7.30555 8.31667 8.31667C7.30556 9.32778 6.8 10.5556 6.8 12C6.8 13.4444 7.30556 14.6722 8.31667 15.6833C9.32778 16.6944 10.5556 17.2 12 17.2Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6083_34804">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`,B.innerText="Preview backend running in this workspace."),B.setAttribute("id",j)}document.readyState==="loading"?window.addEventListener("DOMContentLoaded",T):T()}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zt(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function tT(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(zt())}function nT(){var r;const e=(r=mc())===null||r===void 0?void 0:r.forceEnvironment;if(e==="node")return!0;if(e==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function rT(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function iT(){const r=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof r=="object"&&r.id!==void 0}function sT(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function oT(){const r=zt();return r.indexOf("MSIE ")>=0||r.indexOf("Trident/")>=0}function aT(){return!nT()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function lT(){try{return typeof indexedDB=="object"}catch{return!1}}function uT(){return new Promise((r,e)=>{try{let t=!0;const s="validate-browser-context-for-indexeddb-analytics-module",o=self.indexedDB.open(s);o.onsuccess=()=>{o.result.close(),t||self.indexedDB.deleteDatabase(s),r(!0)},o.onupgradeneeded=()=>{t=!1},o.onerror=()=>{var l;e(((l=o.error)===null||l===void 0?void 0:l.message)||"")}}catch(t){e(t)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const cT="FirebaseError";class Vr extends Error{constructor(e,t,s){super(t),this.code=e,this.customData=s,this.name=cT,Object.setPrototypeOf(this,Vr.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,il.prototype.create)}}class il{constructor(e,t,s){this.service=e,this.serviceName=t,this.errors=s}create(e,...t){const s=t[0]||{},o=`${this.service}/${e}`,l=this.errors[e],h=l?hT(l,s):"Error",f=`${this.serviceName}: ${h} (${o}).`;return new Vr(o,f,s)}}function hT(r,e){return r.replace(dT,(t,s)=>{const o=e[s];return o!=null?String(o):`<${s}?>`})}const dT=/\{\$([^}]+)}/g;function fT(r){for(const e in r)if(Object.prototype.hasOwnProperty.call(r,e))return!1;return!0}function os(r,e){if(r===e)return!0;const t=Object.keys(r),s=Object.keys(e);for(const o of t){if(!s.includes(o))return!1;const l=r[o],h=e[o];if(gg(l)&&gg(h)){if(!os(l,h))return!1}else if(l!==h)return!1}for(const o of s)if(!t.includes(o))return!1;return!0}function gg(r){return r!==null&&typeof r=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function sl(r){const e=[];for(const[t,s]of Object.entries(r))Array.isArray(s)?s.forEach(o=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(o))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(s));return e.length?"&"+e.join("&"):""}function Na(r){const e={};return r.replace(/^\?/,"").split("&").forEach(s=>{if(s){const[o,l]=s.split("=");e[decodeURIComponent(o)]=decodeURIComponent(l)}}),e}function Da(r){const e=r.indexOf("?");if(!e)return"";const t=r.indexOf("#",e);return r.substring(e,t>0?t:void 0)}function pT(r,e){const t=new mT(r,e);return t.subscribe.bind(t)}class mT{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(s=>{this.error(s)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,s){let o;if(e===void 0&&t===void 0&&s===void 0)throw new Error("Missing Observer.");gT(e,["next","error","complete"])?o=e:o={next:e,error:t,complete:s},o.next===void 0&&(o.next=cd),o.error===void 0&&(o.error=cd),o.complete===void 0&&(o.complete=cd);const l=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?o.error(this.finalError):o.complete()}catch{}}),this.observers.push(o),l}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(s){typeof console<"u"&&console.error&&console.error(s)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function gT(r,e){if(typeof r!="object"||r===null)return!1;for(const t of e)if(t in r&&typeof r[t]=="function")return!0;return!1}function cd(){}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Tn(r){return r&&r._delegate?r._delegate:r}class as{constructor(e,t,s){this.name=e,this.instanceFactory=t,this.type=s,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const rs="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yT{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const s=new J0;if(this.instancesDeferred.set(t,s),this.isInitialized(t)||this.shouldAutoInitialize())try{const o=this.getOrInitializeService({instanceIdentifier:t});o&&s.resolve(o)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){var t;const s=this.normalizeInstanceIdentifier(e?.identifier),o=(t=e?.optional)!==null&&t!==void 0?t:!1;if(this.isInitialized(s)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:s})}catch(l){if(o)return null;throw l}else{if(o)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(vT(e))try{this.getOrInitializeService({instanceIdentifier:rs})}catch{}for(const[t,s]of this.instancesDeferred.entries()){const o=this.normalizeInstanceIdentifier(t);try{const l=this.getOrInitializeService({instanceIdentifier:o});s.resolve(l)}catch{}}}}clearInstance(e=rs){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=rs){return this.instances.has(e)}getOptions(e=rs){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,s=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(s))throw Error(`${this.name}(${s}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const o=this.getOrInitializeService({instanceIdentifier:s,options:t});for(const[l,h]of this.instancesDeferred.entries()){const f=this.normalizeInstanceIdentifier(l);s===f&&h.resolve(o)}return o}onInit(e,t){var s;const o=this.normalizeInstanceIdentifier(t),l=(s=this.onInitCallbacks.get(o))!==null&&s!==void 0?s:new Set;l.add(e),this.onInitCallbacks.set(o,l);const h=this.instances.get(o);return h&&e(h,o),()=>{l.delete(e)}}invokeOnInitCallbacks(e,t){const s=this.onInitCallbacks.get(t);if(s)for(const o of s)try{o(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let s=this.instances.get(e);if(!s&&this.component&&(s=this.component.instanceFactory(this.container,{instanceIdentifier:_T(e),options:t}),this.instances.set(e,s),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(s,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,s)}catch{}return s||null}normalizeInstanceIdentifier(e=rs){return this.component?this.component.multipleInstances?e:rs:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function _T(r){return r===rs?void 0:r}function vT(r){return r.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ET{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new yT(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var Ce;(function(r){r[r.DEBUG=0]="DEBUG",r[r.VERBOSE=1]="VERBOSE",r[r.INFO=2]="INFO",r[r.WARN=3]="WARN",r[r.ERROR=4]="ERROR",r[r.SILENT=5]="SILENT"})(Ce||(Ce={}));const wT={debug:Ce.DEBUG,verbose:Ce.VERBOSE,info:Ce.INFO,warn:Ce.WARN,error:Ce.ERROR,silent:Ce.SILENT},TT=Ce.INFO,IT={[Ce.DEBUG]:"log",[Ce.VERBOSE]:"log",[Ce.INFO]:"info",[Ce.WARN]:"warn",[Ce.ERROR]:"error"},ST=(r,e,...t)=>{if(e<r.logLevel)return;const s=new Date().toISOString(),o=IT[e];if(o)console[o](`[${s}]  ${r.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class ef{constructor(e){this.name=e,this._logLevel=TT,this._logHandler=ST,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in Ce))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?wT[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,Ce.DEBUG,...e),this._logHandler(this,Ce.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,Ce.VERBOSE,...e),this._logHandler(this,Ce.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,Ce.INFO,...e),this._logHandler(this,Ce.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,Ce.WARN,...e),this._logHandler(this,Ce.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,Ce.ERROR,...e),this._logHandler(this,Ce.ERROR,...e)}}const AT=(r,e)=>e.some(t=>r instanceof t);let yg,_g;function RT(){return yg||(yg=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function CT(){return _g||(_g=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const l_=new WeakMap,Sd=new WeakMap,u_=new WeakMap,hd=new WeakMap,tf=new WeakMap;function PT(r){const e=new Promise((t,s)=>{const o=()=>{r.removeEventListener("success",l),r.removeEventListener("error",h)},l=()=>{t(fi(r.result)),o()},h=()=>{s(r.error),o()};r.addEventListener("success",l),r.addEventListener("error",h)});return e.then(t=>{t instanceof IDBCursor&&l_.set(t,r)}).catch(()=>{}),tf.set(e,r),e}function kT(r){if(Sd.has(r))return;const e=new Promise((t,s)=>{const o=()=>{r.removeEventListener("complete",l),r.removeEventListener("error",h),r.removeEventListener("abort",h)},l=()=>{t(),o()},h=()=>{s(r.error||new DOMException("AbortError","AbortError")),o()};r.addEventListener("complete",l),r.addEventListener("error",h),r.addEventListener("abort",h)});Sd.set(r,e)}let Ad={get(r,e,t){if(r instanceof IDBTransaction){if(e==="done")return Sd.get(r);if(e==="objectStoreNames")return r.objectStoreNames||u_.get(r);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return fi(r[e])},set(r,e,t){return r[e]=t,!0},has(r,e){return r instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in r}};function NT(r){Ad=r(Ad)}function DT(r){return r===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...t){const s=r.call(dd(this),e,...t);return u_.set(s,e.sort?e.sort():[e]),fi(s)}:CT().includes(r)?function(...e){return r.apply(dd(this),e),fi(l_.get(this))}:function(...e){return fi(r.apply(dd(this),e))}}function OT(r){return typeof r=="function"?DT(r):(r instanceof IDBTransaction&&kT(r),AT(r,RT())?new Proxy(r,Ad):r)}function fi(r){if(r instanceof IDBRequest)return PT(r);if(hd.has(r))return hd.get(r);const e=OT(r);return e!==r&&(hd.set(r,e),tf.set(e,r)),e}const dd=r=>tf.get(r);function VT(r,e,{blocked:t,upgrade:s,blocking:o,terminated:l}={}){const h=indexedDB.open(r,e),f=fi(h);return s&&h.addEventListener("upgradeneeded",g=>{s(fi(h.result),g.oldVersion,g.newVersion,fi(h.transaction),g)}),t&&h.addEventListener("blocked",g=>t(g.oldVersion,g.newVersion,g)),f.then(g=>{l&&g.addEventListener("close",()=>l()),o&&g.addEventListener("versionchange",_=>o(_.oldVersion,_.newVersion,_))}).catch(()=>{}),f}const xT=["get","getKey","getAll","getAllKeys","count"],LT=["put","add","delete","clear"],fd=new Map;function vg(r,e){if(!(r instanceof IDBDatabase&&!(e in r)&&typeof e=="string"))return;if(fd.get(e))return fd.get(e);const t=e.replace(/FromIndex$/,""),s=e!==t,o=LT.includes(t);if(!(t in(s?IDBIndex:IDBObjectStore).prototype)||!(o||xT.includes(t)))return;const l=async function(h,...f){const g=this.transaction(h,o?"readwrite":"readonly");let _=g.store;return s&&(_=_.index(f.shift())),(await Promise.all([_[t](...f),o&&g.done]))[0]};return fd.set(e,l),l}NT(r=>({...r,get:(e,t,s)=>vg(e,t)||r.get(e,t,s),has:(e,t)=>!!vg(e,t)||r.has(e,t)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class MT{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(bT(t)){const s=t.getImmediate();return`${s.library}/${s.version}`}else return null}).filter(t=>t).join(" ")}}function bT(r){const e=r.getComponent();return e?.type==="VERSION"}const Rd="@firebase/app",Eg="0.13.2";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const kr=new ef("@firebase/app"),FT="@firebase/app-compat",UT="@firebase/analytics-compat",jT="@firebase/analytics",zT="@firebase/app-check-compat",BT="@firebase/app-check",$T="@firebase/auth",WT="@firebase/auth-compat",HT="@firebase/database",qT="@firebase/data-connect",KT="@firebase/database-compat",GT="@firebase/functions",QT="@firebase/functions-compat",XT="@firebase/installations",JT="@firebase/installations-compat",YT="@firebase/messaging",ZT="@firebase/messaging-compat",eI="@firebase/performance",tI="@firebase/performance-compat",nI="@firebase/remote-config",rI="@firebase/remote-config-compat",iI="@firebase/storage",sI="@firebase/storage-compat",oI="@firebase/firestore",aI="@firebase/ai",lI="@firebase/firestore-compat",uI="firebase",cI="11.10.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Cd="[DEFAULT]",hI={[Rd]:"fire-core",[FT]:"fire-core-compat",[jT]:"fire-analytics",[UT]:"fire-analytics-compat",[BT]:"fire-app-check",[zT]:"fire-app-check-compat",[$T]:"fire-auth",[WT]:"fire-auth-compat",[HT]:"fire-rtdb",[qT]:"fire-data-connect",[KT]:"fire-rtdb-compat",[GT]:"fire-fn",[QT]:"fire-fn-compat",[XT]:"fire-iid",[JT]:"fire-iid-compat",[YT]:"fire-fcm",[ZT]:"fire-fcm-compat",[eI]:"fire-perf",[tI]:"fire-perf-compat",[nI]:"fire-rc",[rI]:"fire-rc-compat",[iI]:"fire-gcs",[sI]:"fire-gcs-compat",[oI]:"fire-fst",[lI]:"fire-fst-compat",[aI]:"fire-vertex","fire-js":"fire-js",[uI]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Qu=new Map,dI=new Map,Pd=new Map;function wg(r,e){try{r.container.addComponent(e)}catch(t){kr.debug(`Component ${e.name} failed to register with FirebaseApp ${r.name}`,t)}}function vo(r){const e=r.name;if(Pd.has(e))return kr.debug(`There were multiple attempts to register component ${e}.`),!1;Pd.set(e,r);for(const t of Qu.values())wg(t,r);for(const t of dI.values())wg(t,r);return!0}function nf(r,e){const t=r.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),r.container.getProvider(e)}function vn(r){return r==null?!1:r.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fI={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},pi=new il("app","Firebase",fI);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pI{constructor(e,t,s){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},t),this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=s,this.container.addComponent(new as("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw pi.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Po=cI;function c_(r,e={}){let t=r;typeof e!="object"&&(e={name:e});const s=Object.assign({name:Cd,automaticDataCollectionEnabled:!0},e),o=s.name;if(typeof o!="string"||!o)throw pi.create("bad-app-name",{appName:String(o)});if(t||(t=i_()),!t)throw pi.create("no-options");const l=Qu.get(o);if(l){if(os(t,l.options)&&os(s,l.config))return l;throw pi.create("duplicate-app",{appName:o})}const h=new ET(o);for(const g of Pd.values())h.addComponent(g);const f=new pI(t,s,h);return Qu.set(o,f),f}function h_(r=Cd){const e=Qu.get(r);if(!e&&r===Cd&&i_())return c_();if(!e)throw pi.create("no-app",{appName:r});return e}function mi(r,e,t){var s;let o=(s=hI[r])!==null&&s!==void 0?s:r;t&&(o+=`-${t}`);const l=o.match(/\s|\//),h=e.match(/\s|\//);if(l||h){const f=[`Unable to register library "${o}" with version "${e}":`];l&&f.push(`library name "${o}" contains illegal characters (whitespace or "/")`),l&&h&&f.push("and"),h&&f.push(`version name "${e}" contains illegal characters (whitespace or "/")`),kr.warn(f.join(" "));return}vo(new as(`${o}-version`,()=>({library:o,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const mI="firebase-heartbeat-database",gI=1,Ha="firebase-heartbeat-store";let pd=null;function d_(){return pd||(pd=VT(mI,gI,{upgrade:(r,e)=>{switch(e){case 0:try{r.createObjectStore(Ha)}catch(t){console.warn(t)}}}}).catch(r=>{throw pi.create("idb-open",{originalErrorMessage:r.message})})),pd}async function yI(r){try{const t=(await d_()).transaction(Ha),s=await t.objectStore(Ha).get(f_(r));return await t.done,s}catch(e){if(e instanceof Vr)kr.warn(e.message);else{const t=pi.create("idb-get",{originalErrorMessage:e?.message});kr.warn(t.message)}}}async function Tg(r,e){try{const s=(await d_()).transaction(Ha,"readwrite");await s.objectStore(Ha).put(e,f_(r)),await s.done}catch(t){if(t instanceof Vr)kr.warn(t.message);else{const s=pi.create("idb-set",{originalErrorMessage:t?.message});kr.warn(s.message)}}}function f_(r){return`${r.name}!${r.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _I=1024,vI=30;class EI{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new TI(t),this._heartbeatsCachePromise=this._storage.read().then(s=>(this._heartbeatsCache=s,s))}async triggerHeartbeat(){var e,t;try{const o=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),l=Ig();if(((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)===null||t===void 0?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===l||this._heartbeatsCache.heartbeats.some(h=>h.date===l))return;if(this._heartbeatsCache.heartbeats.push({date:l,agent:o}),this._heartbeatsCache.heartbeats.length>vI){const h=II(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(h,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(s){kr.warn(s)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=Ig(),{heartbeatsToSend:s,unsentEntries:o}=wI(this._heartbeatsCache.heartbeats),l=Gu(JSON.stringify({version:2,heartbeats:s}));return this._heartbeatsCache.lastSentHeartbeatDate=t,o.length>0?(this._heartbeatsCache.heartbeats=o,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),l}catch(t){return kr.warn(t),""}}}function Ig(){return new Date().toISOString().substring(0,10)}function wI(r,e=_I){const t=[];let s=r.slice();for(const o of r){const l=t.find(h=>h.agent===o.agent);if(l){if(l.dates.push(o.date),Sg(t)>e){l.dates.pop();break}}else if(t.push({agent:o.agent,dates:[o.date]}),Sg(t)>e){t.pop();break}s=s.slice(1)}return{heartbeatsToSend:t,unsentEntries:s}}class TI{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return lT()?uT().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await yI(this.app);return t?.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var t;if(await this._canUseIndexedDBPromise){const o=await this.read();return Tg(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:o.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var t;if(await this._canUseIndexedDBPromise){const o=await this.read();return Tg(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:o.lastSentHeartbeatDate,heartbeats:[...o.heartbeats,...e.heartbeats]})}else return}}function Sg(r){return Gu(JSON.stringify({version:2,heartbeats:r})).length}function II(r){if(r.length===0)return-1;let e=0,t=r[0].date;for(let s=1;s<r.length;s++)r[s].date<t&&(t=r[s].date,e=s);return e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function SI(r){vo(new as("platform-logger",e=>new MT(e),"PRIVATE")),vo(new as("heartbeat",e=>new EI(e),"PRIVATE")),mi(Rd,Eg,r),mi(Rd,Eg,"esm2017"),mi("fire-js","")}SI("");function rf(r,e){var t={};for(var s in r)Object.prototype.hasOwnProperty.call(r,s)&&e.indexOf(s)<0&&(t[s]=r[s]);if(r!=null&&typeof Object.getOwnPropertySymbols=="function")for(var o=0,s=Object.getOwnPropertySymbols(r);o<s.length;o++)e.indexOf(s[o])<0&&Object.prototype.propertyIsEnumerable.call(r,s[o])&&(t[s[o]]=r[s[o]]);return t}function p_(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const AI=p_,m_=new il("auth","Firebase",p_());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Xu=new ef("@firebase/auth");function RI(r,...e){Xu.logLevel<=Ce.WARN&&Xu.warn(`Auth (${Po}): ${r}`,...e)}function bu(r,...e){Xu.logLevel<=Ce.ERROR&&Xu.error(`Auth (${Po}): ${r}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function jn(r,...e){throw sf(r,...e)}function Zn(r,...e){return sf(r,...e)}function g_(r,e,t){const s=Object.assign(Object.assign({},AI()),{[e]:t});return new il("auth","Firebase",s).create(e,{appName:r.name})}function Cr(r){return g_(r,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function sf(r,...e){if(typeof r!="string"){const t=e[0],s=[...e.slice(1)];return s[0]&&(s[0].appName=r.name),r._errorFactory.create(t,...s)}return m_.create(r,...e)}function ye(r,e,...t){if(!r)throw sf(e,...t)}function Ar(r){const e="INTERNAL ASSERTION FAILED: "+r;throw bu(e),new Error(e)}function Nr(r,e){r||Ar(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function kd(){var r;return typeof self<"u"&&((r=self.location)===null||r===void 0?void 0:r.href)||""}function CI(){return Ag()==="http:"||Ag()==="https:"}function Ag(){var r;return typeof self<"u"&&((r=self.location)===null||r===void 0?void 0:r.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function PI(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(CI()||iT()||"connection"in navigator)?navigator.onLine:!0}function kI(){if(typeof navigator>"u")return null;const r=navigator;return r.languages&&r.languages[0]||r.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ol{constructor(e,t){this.shortDelay=e,this.longDelay=t,Nr(t>e,"Short delay should be less than long delay!"),this.isMobile=tT()||sT()}get(){return PI()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function of(r,e){Nr(r.emulator,"Emulator should always be set here");const{url:t}=r.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class y_{static initialize(e,t,s){this.fetchImpl=e,t&&(this.headersImpl=t),s&&(this.responseImpl=s)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;Ar("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;Ar("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;Ar("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const NI={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const DI=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],OI=new ol(3e4,6e4);function Ci(r,e){return r.tenantId&&!e.tenantId?Object.assign(Object.assign({},e),{tenantId:r.tenantId}):e}async function Pi(r,e,t,s,o={}){return __(r,o,async()=>{let l={},h={};s&&(e==="GET"?h=s:l={body:JSON.stringify(s)});const f=sl(Object.assign({key:r.config.apiKey},h)).slice(1),g=await r._getAdditionalHeaders();g["Content-Type"]="application/json",r.languageCode&&(g["X-Firebase-Locale"]=r.languageCode);const _=Object.assign({method:e,headers:g},l);return rT()||(_.referrerPolicy="no-referrer"),r.emulatorConfig&&Co(r.emulatorConfig.host)&&(_.credentials="include"),y_.fetch()(await v_(r,r.config.apiHost,t,f),_)})}async function __(r,e,t){r._canInitEmulator=!1;const s=Object.assign(Object.assign({},NI),e);try{const o=new xI(r),l=await Promise.race([t(),o.promise]);o.clearNetworkTimeout();const h=await l.json();if("needConfirmation"in h)throw Du(r,"account-exists-with-different-credential",h);if(l.ok&&!("errorMessage"in h))return h;{const f=l.ok?h.errorMessage:h.error.message,[g,_]=f.split(" : ");if(g==="FEDERATED_USER_ID_ALREADY_LINKED")throw Du(r,"credential-already-in-use",h);if(g==="EMAIL_EXISTS")throw Du(r,"email-already-in-use",h);if(g==="USER_DISABLED")throw Du(r,"user-disabled",h);const E=s[g]||g.toLowerCase().replace(/[_\s]+/g,"-");if(_)throw g_(r,E,_);jn(r,E)}}catch(o){if(o instanceof Vr)throw o;jn(r,"network-request-failed",{message:String(o)})}}async function al(r,e,t,s,o={}){const l=await Pi(r,e,t,s,o);return"mfaPendingCredential"in l&&jn(r,"multi-factor-auth-required",{_serverResponse:l}),l}async function v_(r,e,t,s){const o=`${e}${t}?${s}`,l=r,h=l.config.emulator?of(r.config,o):`${r.config.apiScheme}://${o}`;return DI.includes(t)&&(await l._persistenceManagerAvailable,l._getPersistenceType()==="COOKIE")?l._getPersistence()._getFinalTarget(h).toString():h}function VI(r){switch(r){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}class xI{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,s)=>{this.timer=setTimeout(()=>s(Zn(this.auth,"network-request-failed")),OI.get())})}}function Du(r,e,t){const s={appName:r.name};t.email&&(s.email=t.email),t.phoneNumber&&(s.phoneNumber=t.phoneNumber);const o=Zn(r,e,s);return o.customData._tokenResponse=t,o}function Rg(r){return r!==void 0&&r.enterprise!==void 0}class LI{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(const t of this.recaptchaEnforcementState)if(t.provider&&t.provider===e)return VI(t.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}}async function MI(r,e){return Pi(r,"GET","/v2/recaptchaConfig",Ci(r,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function bI(r,e){return Pi(r,"POST","/v1/accounts:delete",e)}async function Ju(r,e){return Pi(r,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ba(r){if(r)try{const e=new Date(Number(r));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function FI(r,e=!1){const t=Tn(r),s=await t.getIdToken(e),o=af(s);ye(o&&o.exp&&o.auth_time&&o.iat,t.auth,"internal-error");const l=typeof o.firebase=="object"?o.firebase:void 0,h=l?.sign_in_provider;return{claims:o,token:s,authTime:ba(md(o.auth_time)),issuedAtTime:ba(md(o.iat)),expirationTime:ba(md(o.exp)),signInProvider:h||null,signInSecondFactor:l?.sign_in_second_factor||null}}function md(r){return Number(r)*1e3}function af(r){const[e,t,s]=r.split(".");if(e===void 0||t===void 0||s===void 0)return bu("JWT malformed, contained fewer than 3 sections"),null;try{const o=n_(t);return o?JSON.parse(o):(bu("Failed to decode base64 JWT payload"),null)}catch(o){return bu("Caught error parsing JWT payload as JSON",o?.toString()),null}}function Cg(r){const e=af(r);return ye(e,"internal-error"),ye(typeof e.exp<"u","internal-error"),ye(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function qa(r,e,t=!1){if(t)return e;try{return await e}catch(s){throw s instanceof Vr&&UI(s)&&r.auth.currentUser===r&&await r.auth.signOut(),s}}function UI({code:r}){return r==="auth/user-disabled"||r==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jI{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){var t;if(e){const s=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),s}else{this.errorBackoff=3e4;const o=((t=this.user.stsTokenManager.expirationTime)!==null&&t!==void 0?t:0)-Date.now()-3e5;return Math.max(0,o)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){e?.code==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nd{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=ba(this.lastLoginAt),this.creationTime=ba(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Yu(r){var e;const t=r.auth,s=await r.getIdToken(),o=await qa(r,Ju(t,{idToken:s}));ye(o?.users.length,t,"internal-error");const l=o.users[0];r._notifyReloadListener(l);const h=!((e=l.providerUserInfo)===null||e===void 0)&&e.length?E_(l.providerUserInfo):[],f=BI(r.providerData,h),g=r.isAnonymous,_=!(r.email&&l.passwordHash)&&!f?.length,E=g?_:!1,T={uid:l.localId,displayName:l.displayName||null,photoURL:l.photoUrl||null,email:l.email||null,emailVerified:l.emailVerified||!1,phoneNumber:l.phoneNumber||null,tenantId:l.tenantId||null,providerData:f,metadata:new Nd(l.createdAt,l.lastLoginAt),isAnonymous:E};Object.assign(r,T)}async function zI(r){const e=Tn(r);await Yu(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function BI(r,e){return[...r.filter(s=>!e.some(o=>o.providerId===s.providerId)),...e]}function E_(r){return r.map(e=>{var{providerId:t}=e,s=rf(e,["providerId"]);return{providerId:t,uid:s.rawId||"",displayName:s.displayName||null,email:s.email||null,phoneNumber:s.phoneNumber||null,photoURL:s.photoUrl||null}})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function $I(r,e){const t=await __(r,{},async()=>{const s=sl({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:o,apiKey:l}=r.config,h=await v_(r,o,"/v1/token",`key=${l}`),f=await r._getAdditionalHeaders();f["Content-Type"]="application/x-www-form-urlencoded";const g={method:"POST",headers:f,body:s};return r.emulatorConfig&&Co(r.emulatorConfig.host)&&(g.credentials="include"),y_.fetch()(h,g)});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function WI(r,e){return Pi(r,"POST","/v2/accounts:revokeToken",Ci(r,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mo{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){ye(e.idToken,"internal-error"),ye(typeof e.idToken<"u","internal-error"),ye(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):Cg(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){ye(e.length!==0,"internal-error");const t=Cg(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(ye(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:s,refreshToken:o,expiresIn:l}=await $I(e,t);this.updateTokensAndExpiration(s,o,Number(l))}updateTokensAndExpiration(e,t,s){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+s*1e3}static fromJSON(e,t){const{refreshToken:s,accessToken:o,expirationTime:l}=t,h=new mo;return s&&(ye(typeof s=="string","internal-error",{appName:e}),h.refreshToken=s),o&&(ye(typeof o=="string","internal-error",{appName:e}),h.accessToken=o),l&&(ye(typeof l=="number","internal-error",{appName:e}),h.expirationTime=l),h}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new mo,this.toJSON())}_performRefresh(){return Ar("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function si(r,e){ye(typeof r=="string"||typeof r>"u","internal-error",{appName:e})}class Fn{constructor(e){var{uid:t,auth:s,stsTokenManager:o}=e,l=rf(e,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new jI(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=t,this.auth=s,this.stsTokenManager=o,this.accessToken=o.accessToken,this.displayName=l.displayName||null,this.email=l.email||null,this.emailVerified=l.emailVerified||!1,this.phoneNumber=l.phoneNumber||null,this.photoURL=l.photoURL||null,this.isAnonymous=l.isAnonymous||!1,this.tenantId=l.tenantId||null,this.providerData=l.providerData?[...l.providerData]:[],this.metadata=new Nd(l.createdAt||void 0,l.lastLoginAt||void 0)}async getIdToken(e){const t=await qa(this,this.stsTokenManager.getToken(this.auth,e));return ye(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return FI(this,e)}reload(){return zI(this)}_assign(e){this!==e&&(ye(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>Object.assign({},t)),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new Fn(Object.assign(Object.assign({},this),{auth:e,stsTokenManager:this.stsTokenManager._clone()}));return t.metadata._copy(this.metadata),t}_onReload(e){ye(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let s=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),s=!0),t&&await Yu(this),await this.auth._persistUserIfCurrent(this),s&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(vn(this.auth.app))return Promise.reject(Cr(this.auth));const e=await this.getIdToken();return await qa(this,bI(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>Object.assign({},e)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){var s,o,l,h,f,g,_,E;const T=(s=t.displayName)!==null&&s!==void 0?s:void 0,R=(o=t.email)!==null&&o!==void 0?o:void 0,j=(l=t.phoneNumber)!==null&&l!==void 0?l:void 0,B=(h=t.photoURL)!==null&&h!==void 0?h:void 0,$=(f=t.tenantId)!==null&&f!==void 0?f:void 0,F=(g=t._redirectEventId)!==null&&g!==void 0?g:void 0,ae=(_=t.createdAt)!==null&&_!==void 0?_:void 0,re=(E=t.lastLoginAt)!==null&&E!==void 0?E:void 0,{uid:ie,emailVerified:ge,isAnonymous:Le,providerData:Re,stsTokenManager:D}=t;ye(ie&&D,e,"internal-error");const S=mo.fromJSON(this.name,D);ye(typeof ie=="string",e,"internal-error"),si(T,e.name),si(R,e.name),ye(typeof ge=="boolean",e,"internal-error"),ye(typeof Le=="boolean",e,"internal-error"),si(j,e.name),si(B,e.name),si($,e.name),si(F,e.name),si(ae,e.name),si(re,e.name);const C=new Fn({uid:ie,auth:e,email:R,emailVerified:ge,displayName:T,isAnonymous:Le,photoURL:B,phoneNumber:j,tenantId:$,stsTokenManager:S,createdAt:ae,lastLoginAt:re});return Re&&Array.isArray(Re)&&(C.providerData=Re.map(k=>Object.assign({},k))),F&&(C._redirectEventId=F),C}static async _fromIdTokenResponse(e,t,s=!1){const o=new mo;o.updateFromServerResponse(t);const l=new Fn({uid:t.localId,auth:e,stsTokenManager:o,isAnonymous:s});return await Yu(l),l}static async _fromGetAccountInfoResponse(e,t,s){const o=t.users[0];ye(o.localId!==void 0,"internal-error");const l=o.providerUserInfo!==void 0?E_(o.providerUserInfo):[],h=!(o.email&&o.passwordHash)&&!l?.length,f=new mo;f.updateFromIdToken(s);const g=new Fn({uid:o.localId,auth:e,stsTokenManager:f,isAnonymous:h}),_={uid:o.localId,displayName:o.displayName||null,photoURL:o.photoUrl||null,email:o.email||null,emailVerified:o.emailVerified||!1,phoneNumber:o.phoneNumber||null,tenantId:o.tenantId||null,providerData:l,metadata:new Nd(o.createdAt,o.lastLoginAt),isAnonymous:!(o.email&&o.passwordHash)&&!l?.length};return Object.assign(g,_),g}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Pg=new Map;function Rr(r){Nr(r instanceof Function,"Expected a class definition");let e=Pg.get(r);return e?(Nr(e instanceof r,"Instance stored in cache mismatched with class"),e):(e=new r,Pg.set(r,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class w_{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}w_.type="NONE";const kg=w_;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Fu(r,e,t){return`firebase:${r}:${e}:${t}`}class go{constructor(e,t,s){this.persistence=e,this.auth=t,this.userKey=s;const{config:o,name:l}=this.auth;this.fullUserKey=Fu(this.userKey,o.apiKey,l),this.fullPersistenceKey=Fu("persistence",o.apiKey,l),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const t=await Ju(this.auth,{idToken:e}).catch(()=>{});return t?Fn._fromGetAccountInfoResponse(this.auth,t,e):null}return Fn._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,t,s="authUser"){if(!t.length)return new go(Rr(kg),e,s);const o=(await Promise.all(t.map(async _=>{if(await _._isAvailable())return _}))).filter(_=>_);let l=o[0]||Rr(kg);const h=Fu(s,e.config.apiKey,e.name);let f=null;for(const _ of t)try{const E=await _._get(h);if(E){let T;if(typeof E=="string"){const R=await Ju(e,{idToken:E}).catch(()=>{});if(!R)break;T=await Fn._fromGetAccountInfoResponse(e,R,E)}else T=Fn._fromJSON(e,E);_!==l&&(f=T),l=_;break}}catch{}const g=o.filter(_=>_._shouldAllowMigration);return!l._shouldAllowMigration||!g.length?new go(l,e,s):(l=g[0],f&&await l._set(h,f.toJSON()),await Promise.all(t.map(async _=>{if(_!==l)try{await _._remove(h)}catch{}})),new go(l,e,s))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ng(r){const e=r.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(A_(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(T_(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(C_(e))return"Blackberry";if(P_(e))return"Webos";if(I_(e))return"Safari";if((e.includes("chrome/")||S_(e))&&!e.includes("edge/"))return"Chrome";if(R_(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,s=r.match(t);if(s?.length===2)return s[1]}return"Other"}function T_(r=zt()){return/firefox\//i.test(r)}function I_(r=zt()){const e=r.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function S_(r=zt()){return/crios\//i.test(r)}function A_(r=zt()){return/iemobile/i.test(r)}function R_(r=zt()){return/android/i.test(r)}function C_(r=zt()){return/blackberry/i.test(r)}function P_(r=zt()){return/webos/i.test(r)}function lf(r=zt()){return/iphone|ipad|ipod/i.test(r)||/macintosh/i.test(r)&&/mobile/i.test(r)}function HI(r=zt()){var e;return lf(r)&&!!(!((e=window.navigator)===null||e===void 0)&&e.standalone)}function qI(){return oT()&&document.documentMode===10}function k_(r=zt()){return lf(r)||R_(r)||P_(r)||C_(r)||/windows phone/i.test(r)||A_(r)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function N_(r,e=[]){let t;switch(r){case"Browser":t=Ng(zt());break;case"Worker":t=`${Ng(zt())}-${r}`;break;default:t=r}const s=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${Po}/${s}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class KI{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const s=l=>new Promise((h,f)=>{try{const g=e(l);h(g)}catch(g){f(g)}});s.onAbort=t,this.queue.push(s);const o=this.queue.length-1;return()=>{this.queue[o]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const s of this.queue)await s(e),s.onAbort&&t.push(s.onAbort)}catch(s){t.reverse();for(const o of t)try{o()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:s?.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function GI(r,e={}){return Pi(r,"GET","/v2/passwordPolicy",Ci(r,e))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const QI=6;class XI{constructor(e){var t,s,o,l;const h=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=(t=h.minPasswordLength)!==null&&t!==void 0?t:QI,h.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=h.maxPasswordLength),h.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=h.containsLowercaseCharacter),h.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=h.containsUppercaseCharacter),h.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=h.containsNumericCharacter),h.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=h.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=(o=(s=e.allowedNonAlphanumericCharacters)===null||s===void 0?void 0:s.join(""))!==null&&o!==void 0?o:"",this.forceUpgradeOnSignin=(l=e.forceUpgradeOnSignin)!==null&&l!==void 0?l:!1,this.schemaVersion=e.schemaVersion}validatePassword(e){var t,s,o,l,h,f;const g={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,g),this.validatePasswordCharacterOptions(e,g),g.isValid&&(g.isValid=(t=g.meetsMinPasswordLength)!==null&&t!==void 0?t:!0),g.isValid&&(g.isValid=(s=g.meetsMaxPasswordLength)!==null&&s!==void 0?s:!0),g.isValid&&(g.isValid=(o=g.containsLowercaseLetter)!==null&&o!==void 0?o:!0),g.isValid&&(g.isValid=(l=g.containsUppercaseLetter)!==null&&l!==void 0?l:!0),g.isValid&&(g.isValid=(h=g.containsNumericCharacter)!==null&&h!==void 0?h:!0),g.isValid&&(g.isValid=(f=g.containsNonAlphanumericCharacter)!==null&&f!==void 0?f:!0),g}validatePasswordLengthOptions(e,t){const s=this.customStrengthOptions.minPasswordLength,o=this.customStrengthOptions.maxPasswordLength;s&&(t.meetsMinPasswordLength=e.length>=s),o&&(t.meetsMaxPasswordLength=e.length<=o)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let s;for(let o=0;o<e.length;o++)s=e.charAt(o),this.updatePasswordCharacterOptionsStatuses(t,s>="a"&&s<="z",s>="A"&&s<="Z",s>="0"&&s<="9",this.allowedNonAlphanumericCharacters.includes(s))}updatePasswordCharacterOptionsStatuses(e,t,s,o,l){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=s)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=o)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=l))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class JI{constructor(e,t,s,o){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=s,this.config=o,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new Dg(this),this.idTokenSubscription=new Dg(this),this.beforeStateQueue=new KI(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=m_,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=o.sdkClientVersion,this._persistenceManagerAvailable=new Promise(l=>this._resolvePersistenceManagerAvailable=l)}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=Rr(t)),this._initializationPromise=this.queue(async()=>{var s,o,l;if(!this._deleted&&(this.persistenceManager=await go.create(this,e),(s=this._resolvePersistenceManagerAvailable)===null||s===void 0||s.call(this),!this._deleted)){if(!((o=this._popupRedirectResolver)===null||o===void 0)&&o._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(t),this.lastNotifiedUid=((l=this.currentUser)===null||l===void 0?void 0:l.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const t=await Ju(this,{idToken:e}),s=await Fn._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(s)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var t;if(vn(this.app)){const h=this.app.settings.authIdToken;return h?new Promise(f=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(h).then(f,f))}):this.directlySetCurrentUser(null)}const s=await this.assertedPersistence.getCurrentUser();let o=s,l=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const h=(t=this.redirectUser)===null||t===void 0?void 0:t._redirectEventId,f=o?._redirectEventId,g=await this.tryRedirectSignIn(e);(!h||h===f)&&g?.user&&(o=g.user,l=!0)}if(!o)return this.directlySetCurrentUser(null);if(!o._redirectEventId){if(l)try{await this.beforeStateQueue.runMiddleware(o)}catch(h){o=s,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(h))}return o?this.reloadAndSetCurrentUserOrClear(o):this.directlySetCurrentUser(null)}return ye(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===o._redirectEventId?this.directlySetCurrentUser(o):this.reloadAndSetCurrentUserOrClear(o)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await Yu(e)}catch(t){if(t?.code!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=kI()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(vn(this.app))return Promise.reject(Cr(this));const t=e?Tn(e):null;return t&&ye(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&ye(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return vn(this.app)?Promise.reject(Cr(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return vn(this.app)?Promise.reject(Cr(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(Rr(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await GI(this),t=new XI(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new il("auth","Firebase",e())}onAuthStateChanged(e,t,s){return this.registerStateListener(this.authStateSubscription,e,t,s)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,s){return this.registerStateListener(this.idTokenSubscription,e,t,s)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const s=this.onAuthStateChanged(()=>{s(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),s={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(s.tenantId=this.tenantId),await WI(this,s)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)===null||e===void 0?void 0:e.toJSON()}}async _setRedirectUser(e,t){const s=await this.getOrInitRedirectPersistenceManager(t);return e===null?s.removeCurrentUser():s.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&Rr(e)||this._popupRedirectResolver;ye(t,this,"argument-error"),this.redirectPersistenceManager=await go.create(this,[Rr(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,s;return this._isInitialized&&await this.queue(async()=>{}),((t=this._currentUser)===null||t===void 0?void 0:t._redirectEventId)===e?this._currentUser:((s=this.redirectUser)===null||s===void 0?void 0:s._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var e,t;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const s=(t=(e=this.currentUser)===null||e===void 0?void 0:e.uid)!==null&&t!==void 0?t:null;this.lastNotifiedUid!==s&&(this.lastNotifiedUid=s,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,s,o){if(this._deleted)return()=>{};const l=typeof t=="function"?t:t.next.bind(t);let h=!1;const f=this._isInitialized?Promise.resolve():this._initializationPromise;if(ye(f,this,"internal-error"),f.then(()=>{h||l(this.currentUser)}),typeof t=="function"){const g=e.addObserver(t,s,o);return()=>{h=!0,g()}}else{const g=e.addObserver(t);return()=>{h=!0,g()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return ye(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=N_(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var e;const t={"X-Client-Version":this.clientVersion};this.app.options.appId&&(t["X-Firebase-gmpid"]=this.app.options.appId);const s=await((e=this.heartbeatServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getHeartbeatsHeader());s&&(t["X-Firebase-Client"]=s);const o=await this._getAppCheckToken();return o&&(t["X-Firebase-AppCheck"]=o),t}async _getAppCheckToken(){var e;if(vn(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const t=await((e=this.appCheckServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getToken());return t?.error&&RI(`Error while retrieving App Check token: ${t.error}`),t?.token}}function ds(r){return Tn(r)}class Dg{constructor(e){this.auth=e,this.observer=null,this.addObserver=pT(t=>this.observer=t)}get next(){return ye(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let gc={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function YI(r){gc=r}function D_(r){return gc.loadJS(r)}function ZI(){return gc.recaptchaEnterpriseScript}function eS(){return gc.gapiScript}function tS(r){return`__${r}${Math.floor(Math.random()*1e6)}`}class nS{constructor(){this.enterprise=new rS}ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}class rS{ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}const iS="recaptcha-enterprise",O_="NO_RECAPTCHA";class sS{constructor(e){this.type=iS,this.auth=ds(e)}async verify(e="verify",t=!1){async function s(l){if(!t){if(l.tenantId==null&&l._agentRecaptchaConfig!=null)return l._agentRecaptchaConfig.siteKey;if(l.tenantId!=null&&l._tenantRecaptchaConfigs[l.tenantId]!==void 0)return l._tenantRecaptchaConfigs[l.tenantId].siteKey}return new Promise(async(h,f)=>{MI(l,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(g=>{if(g.recaptchaKey===void 0)f(new Error("recaptcha Enterprise site key undefined"));else{const _=new LI(g);return l.tenantId==null?l._agentRecaptchaConfig=_:l._tenantRecaptchaConfigs[l.tenantId]=_,h(_.siteKey)}}).catch(g=>{f(g)})})}function o(l,h,f){const g=window.grecaptcha;Rg(g)?g.enterprise.ready(()=>{g.enterprise.execute(l,{action:e}).then(_=>{h(_)}).catch(()=>{h(O_)})}):f(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new nS().execute("siteKey",{action:"verify"}):new Promise((l,h)=>{s(this.auth).then(f=>{if(!t&&Rg(window.grecaptcha))o(f,l,h);else{if(typeof window>"u"){h(new Error("RecaptchaVerifier is only supported in browser"));return}let g=ZI();g.length!==0&&(g+=f),D_(g).then(()=>{o(f,l,h)}).catch(_=>{h(_)})}}).catch(f=>{h(f)})})}}async function Og(r,e,t,s=!1,o=!1){const l=new sS(r);let h;if(o)h=O_;else try{h=await l.verify(t)}catch{h=await l.verify(t,!0)}const f=Object.assign({},e);if(t==="mfaSmsEnrollment"||t==="mfaSmsSignIn"){if("phoneEnrollmentInfo"in f){const g=f.phoneEnrollmentInfo.phoneNumber,_=f.phoneEnrollmentInfo.recaptchaToken;Object.assign(f,{phoneEnrollmentInfo:{phoneNumber:g,recaptchaToken:_,captchaResponse:h,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in f){const g=f.phoneSignInInfo.recaptchaToken;Object.assign(f,{phoneSignInInfo:{recaptchaToken:g,captchaResponse:h,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return f}return s?Object.assign(f,{captchaResp:h}):Object.assign(f,{captchaResponse:h}),Object.assign(f,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(f,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),f}async function Dd(r,e,t,s,o){var l;if(!((l=r._getRecaptchaConfig())===null||l===void 0)&&l.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){const h=await Og(r,e,t,t==="getOobCode");return s(r,h)}else return s(r,e).catch(async h=>{if(h.code==="auth/missing-recaptcha-token"){console.log(`${t} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);const f=await Og(r,e,t,t==="getOobCode");return s(r,f)}else return Promise.reject(h)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function oS(r,e){const t=nf(r,"auth");if(t.isInitialized()){const o=t.getImmediate(),l=t.getOptions();if(os(l,e??{}))return o;jn(o,"already-initialized")}return t.initialize({options:e})}function aS(r,e){const t=e?.persistence||[],s=(Array.isArray(t)?t:[t]).map(Rr);e?.errorMap&&r._updateErrorMap(e.errorMap),r._initializeWithPersistence(s,e?.popupRedirectResolver)}function lS(r,e,t){const s=ds(r);ye(/^https?:\/\//.test(e),s,"invalid-emulator-scheme");const o=!1,l=V_(e),{host:h,port:f}=uS(e),g=f===null?"":`:${f}`,_={url:`${l}//${h}${g}/`},E=Object.freeze({host:h,port:f,protocol:l.replace(":",""),options:Object.freeze({disableWarnings:o})});if(!s._canInitEmulator){ye(s.config.emulator&&s.emulatorConfig,s,"emulator-config-failed"),ye(os(_,s.config.emulator)&&os(E,s.emulatorConfig),s,"emulator-config-failed");return}s.config.emulator=_,s.emulatorConfig=E,s.settings.appVerificationDisabledForTesting=!0,Co(h)?(o_(`${l}//${h}${g}`),a_("Auth",!0)):cS()}function V_(r){const e=r.indexOf(":");return e<0?"":r.substr(0,e+1)}function uS(r){const e=V_(r),t=/(\/\/)?([^?#/]+)/.exec(r.substr(e.length));if(!t)return{host:"",port:null};const s=t[2].split("@").pop()||"",o=/^(\[[^\]]+\])(:|$)/.exec(s);if(o){const l=o[1];return{host:l,port:Vg(s.substr(l.length+1))}}else{const[l,h]=s.split(":");return{host:l,port:Vg(h)}}}function Vg(r){if(!r)return null;const e=Number(r);return isNaN(e)?null:e}function cS(){function r(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",r):r())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class uf{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return Ar("not implemented")}_getIdTokenResponse(e){return Ar("not implemented")}_linkToIdToken(e,t){return Ar("not implemented")}_getReauthenticationResolver(e){return Ar("not implemented")}}async function hS(r,e){return Pi(r,"POST","/v1/accounts:signUp",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function dS(r,e){return al(r,"POST","/v1/accounts:signInWithPassword",Ci(r,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function fS(r,e){return al(r,"POST","/v1/accounts:signInWithEmailLink",Ci(r,e))}async function pS(r,e){return al(r,"POST","/v1/accounts:signInWithEmailLink",Ci(r,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ka extends uf{constructor(e,t,s,o=null){super("password",s),this._email=e,this._password=t,this._tenantId=o}static _fromEmailAndPassword(e,t){return new Ka(e,t,"password")}static _fromEmailAndCode(e,t,s=null){return new Ka(e,t,"emailLink",s)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e;if(t?.email&&t?.password){if(t.signInMethod==="password")return this._fromEmailAndPassword(t.email,t.password);if(t.signInMethod==="emailLink")return this._fromEmailAndCode(t.email,t.password,t.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":const t={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Dd(e,t,"signInWithPassword",dS);case"emailLink":return fS(e,{email:this._email,oobCode:this._password});default:jn(e,"internal-error")}}async _linkToIdToken(e,t){switch(this.signInMethod){case"password":const s={idToken:t,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Dd(e,s,"signUpPassword",hS);case"emailLink":return pS(e,{idToken:t,email:this._email,oobCode:this._password});default:jn(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function yo(r,e){return al(r,"POST","/v1/accounts:signInWithIdp",Ci(r,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const mS="http://localhost";class ls extends uf{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new ls(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):jn("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:s,signInMethod:o}=t,l=rf(t,["providerId","signInMethod"]);if(!s||!o)return null;const h=new ls(s,o);return h.idToken=l.idToken||void 0,h.accessToken=l.accessToken||void 0,h.secret=l.secret,h.nonce=l.nonce,h.pendingToken=l.pendingToken||null,h}_getIdTokenResponse(e){const t=this.buildRequest();return yo(e,t)}_linkToIdToken(e,t){const s=this.buildRequest();return s.idToken=t,yo(e,s)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,yo(e,t)}buildRequest(){const e={requestUri:mS,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=sl(t)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function gS(r){switch(r){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function yS(r){const e=Na(Da(r)).link,t=e?Na(Da(e)).deep_link_id:null,s=Na(Da(r)).deep_link_id;return(s?Na(Da(s)).link:null)||s||t||e||r}class cf{constructor(e){var t,s,o,l,h,f;const g=Na(Da(e)),_=(t=g.apiKey)!==null&&t!==void 0?t:null,E=(s=g.oobCode)!==null&&s!==void 0?s:null,T=gS((o=g.mode)!==null&&o!==void 0?o:null);ye(_&&E&&T,"argument-error"),this.apiKey=_,this.operation=T,this.code=E,this.continueUrl=(l=g.continueUrl)!==null&&l!==void 0?l:null,this.languageCode=(h=g.lang)!==null&&h!==void 0?h:null,this.tenantId=(f=g.tenantId)!==null&&f!==void 0?f:null}static parseLink(e){const t=yS(e);try{return new cf(t)}catch{return null}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ko{constructor(){this.providerId=ko.PROVIDER_ID}static credential(e,t){return Ka._fromEmailAndPassword(e,t)}static credentialWithLink(e,t){const s=cf.parseLink(t);return ye(s,"argument-error"),Ka._fromEmailAndCode(e,s.code,s.tenantId)}}ko.PROVIDER_ID="password";ko.EMAIL_PASSWORD_SIGN_IN_METHOD="password";ko.EMAIL_LINK_SIGN_IN_METHOD="emailLink";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class x_{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ll extends x_{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oi extends ll{constructor(){super("facebook.com")}static credential(e){return ls._fromParams({providerId:oi.PROVIDER_ID,signInMethod:oi.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return oi.credentialFromTaggedObject(e)}static credentialFromError(e){return oi.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return oi.credential(e.oauthAccessToken)}catch{return null}}}oi.FACEBOOK_SIGN_IN_METHOD="facebook.com";oi.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ai extends ll{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return ls._fromParams({providerId:ai.PROVIDER_ID,signInMethod:ai.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return ai.credentialFromTaggedObject(e)}static credentialFromError(e){return ai.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:s}=e;if(!t&&!s)return null;try{return ai.credential(t,s)}catch{return null}}}ai.GOOGLE_SIGN_IN_METHOD="google.com";ai.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class li extends ll{constructor(){super("github.com")}static credential(e){return ls._fromParams({providerId:li.PROVIDER_ID,signInMethod:li.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return li.credentialFromTaggedObject(e)}static credentialFromError(e){return li.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return li.credential(e.oauthAccessToken)}catch{return null}}}li.GITHUB_SIGN_IN_METHOD="github.com";li.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ui extends ll{constructor(){super("twitter.com")}static credential(e,t){return ls._fromParams({providerId:ui.PROVIDER_ID,signInMethod:ui.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return ui.credentialFromTaggedObject(e)}static credentialFromError(e){return ui.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:s}=e;if(!t||!s)return null;try{return ui.credential(t,s)}catch{return null}}}ui.TWITTER_SIGN_IN_METHOD="twitter.com";ui.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function _S(r,e){return al(r,"POST","/v1/accounts:signUp",Ci(r,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class us{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,s,o=!1){const l=await Fn._fromIdTokenResponse(e,s,o),h=xg(s);return new us({user:l,providerId:h,_tokenResponse:s,operationType:t})}static async _forOperation(e,t,s){await e._updateTokensIfNecessary(s,!0);const o=xg(s);return new us({user:e,providerId:o,_tokenResponse:s,operationType:t})}}function xg(r){return r.providerId?r.providerId:"phoneNumber"in r?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zu extends Vr{constructor(e,t,s,o){var l;super(t.code,t.message),this.operationType=s,this.user=o,Object.setPrototypeOf(this,Zu.prototype),this.customData={appName:e.name,tenantId:(l=e.tenantId)!==null&&l!==void 0?l:void 0,_serverResponse:t.customData._serverResponse,operationType:s}}static _fromErrorAndOperation(e,t,s,o){return new Zu(e,t,s,o)}}function L_(r,e,t,s){return(e==="reauthenticate"?t._getReauthenticationResolver(r):t._getIdTokenResponse(r)).catch(l=>{throw l.code==="auth/multi-factor-auth-required"?Zu._fromErrorAndOperation(r,l,e,s):l})}async function vS(r,e,t=!1){const s=await qa(r,e._linkToIdToken(r.auth,await r.getIdToken()),t);return us._forOperation(r,"link",s)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ES(r,e,t=!1){const{auth:s}=r;if(vn(s.app))return Promise.reject(Cr(s));const o="reauthenticate";try{const l=await qa(r,L_(s,o,e,r),t);ye(l.idToken,s,"internal-error");const h=af(l.idToken);ye(h,s,"internal-error");const{sub:f}=h;return ye(r.uid===f,s,"user-mismatch"),us._forOperation(r,o,l)}catch(l){throw l?.code==="auth/user-not-found"&&jn(s,"user-mismatch"),l}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function M_(r,e,t=!1){if(vn(r.app))return Promise.reject(Cr(r));const s="signIn",o=await L_(r,s,e),l=await us._fromIdTokenResponse(r,s,o);return t||await r._updateCurrentUser(l.user),l}async function wS(r,e){return M_(ds(r),e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function b_(r){const e=ds(r);e._getPasswordPolicyInternal()&&await e._updatePasswordPolicy()}async function mP(r,e,t){if(vn(r.app))return Promise.reject(Cr(r));const s=ds(r),h=await Dd(s,{returnSecureToken:!0,email:e,password:t,clientType:"CLIENT_TYPE_WEB"},"signUpPassword",_S).catch(g=>{throw g.code==="auth/password-does-not-meet-requirements"&&b_(r),g}),f=await us._fromIdTokenResponse(s,"signIn",h);return await s._updateCurrentUser(f.user),f}function gP(r,e,t){return vn(r.app)?Promise.reject(Cr(r)):wS(Tn(r),ko.credential(e,t)).catch(async s=>{throw s.code==="auth/password-does-not-meet-requirements"&&b_(r),s})}function TS(r,e,t,s){return Tn(r).onIdTokenChanged(e,t,s)}function IS(r,e,t){return Tn(r).beforeAuthStateChanged(e,t)}function F_(r,e,t,s){return Tn(r).onAuthStateChanged(e,t,s)}const ec="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class U_{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(ec,"1"),this.storage.removeItem(ec),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const SS=1e3,AS=10;class j_ extends U_{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=k_(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const s=this.storage.getItem(t),o=this.localCache[t];s!==o&&e(t,o,s)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((h,f,g)=>{this.notifyListeners(h,g)});return}const s=e.key;t?this.detachListener():this.stopPolling();const o=()=>{const h=this.storage.getItem(s);!t&&this.localCache[s]===h||this.notifyListeners(s,h)},l=this.storage.getItem(s);qI()&&l!==e.newValue&&e.newValue!==e.oldValue?setTimeout(o,AS):o()}notifyListeners(e,t){this.localCache[e]=t;const s=this.listeners[e];if(s)for(const o of Array.from(s))o(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,s)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:s}),!0)})},SS)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}j_.type="LOCAL";const RS=j_;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class z_ extends U_{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}z_.type="SESSION";const B_=z_;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function CS(r){return Promise.all(r.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yc{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(o=>o.isListeningto(e));if(t)return t;const s=new yc(e);return this.receivers.push(s),s}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:s,eventType:o,data:l}=t.data,h=this.handlersMap[o];if(!h?.size)return;t.ports[0].postMessage({status:"ack",eventId:s,eventType:o});const f=Array.from(h).map(async _=>_(t.origin,l)),g=await CS(f);t.ports[0].postMessage({status:"done",eventId:s,eventType:o,response:g})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}yc.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function hf(r="",e=10){let t="";for(let s=0;s<e;s++)t+=Math.floor(Math.random()*10);return r+t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class PS{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,s=50){const o=typeof MessageChannel<"u"?new MessageChannel:null;if(!o)throw new Error("connection_unavailable");let l,h;return new Promise((f,g)=>{const _=hf("",20);o.port1.start();const E=setTimeout(()=>{g(new Error("unsupported_event"))},s);h={messageChannel:o,onMessage(T){const R=T;if(R.data.eventId===_)switch(R.data.status){case"ack":clearTimeout(E),l=setTimeout(()=>{g(new Error("timeout"))},3e3);break;case"done":clearTimeout(l),f(R.data.response);break;default:clearTimeout(E),clearTimeout(l),g(new Error("invalid_response"));break}}},this.handlers.add(h),o.port1.addEventListener("message",h.onMessage),this.target.postMessage({eventType:e,eventId:_,data:t},[o.port2])}).finally(()=>{h&&this.removeMessageHandler(h)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function er(){return window}function kS(r){er().location.href=r}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $_(){return typeof er().WorkerGlobalScope<"u"&&typeof er().importScripts=="function"}async function NS(){if(!navigator?.serviceWorker)return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function DS(){var r;return((r=navigator?.serviceWorker)===null||r===void 0?void 0:r.controller)||null}function OS(){return $_()?self:null}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const W_="firebaseLocalStorageDb",VS=1,tc="firebaseLocalStorage",H_="fbase_key";class ul{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function _c(r,e){return r.transaction([tc],e?"readwrite":"readonly").objectStore(tc)}function xS(){const r=indexedDB.deleteDatabase(W_);return new ul(r).toPromise()}function Od(){const r=indexedDB.open(W_,VS);return new Promise((e,t)=>{r.addEventListener("error",()=>{t(r.error)}),r.addEventListener("upgradeneeded",()=>{const s=r.result;try{s.createObjectStore(tc,{keyPath:H_})}catch(o){t(o)}}),r.addEventListener("success",async()=>{const s=r.result;s.objectStoreNames.contains(tc)?e(s):(s.close(),await xS(),e(await Od()))})})}async function Lg(r,e,t){const s=_c(r,!0).put({[H_]:e,value:t});return new ul(s).toPromise()}async function LS(r,e){const t=_c(r,!1).get(e),s=await new ul(t).toPromise();return s===void 0?null:s.value}function Mg(r,e){const t=_c(r,!0).delete(e);return new ul(t).toPromise()}const MS=800,bS=3;class q_{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await Od(),this.db)}async _withRetries(e){let t=0;for(;;)try{const s=await this._openDb();return await e(s)}catch(s){if(t++>bS)throw s;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return $_()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=yc._getInstance(OS()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){var e,t;if(this.activeServiceWorker=await NS(),!this.activeServiceWorker)return;this.sender=new PS(this.activeServiceWorker);const s=await this.sender._send("ping",{},800);s&&!((e=s[0])===null||e===void 0)&&e.fulfilled&&!((t=s[0])===null||t===void 0)&&t.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||DS()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await Od();return await Lg(e,ec,"1"),await Mg(e,ec),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(s=>Lg(s,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(s=>LS(s,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>Mg(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(o=>{const l=_c(o,!1).getAll();return new ul(l).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],s=new Set;if(e.length!==0)for(const{fbase_key:o,value:l}of e)s.add(o),JSON.stringify(this.localCache[o])!==JSON.stringify(l)&&(this.notifyListeners(o,l),t.push(o));for(const o of Object.keys(this.localCache))this.localCache[o]&&!s.has(o)&&(this.notifyListeners(o,null),t.push(o));return t}notifyListeners(e,t){this.localCache[e]=t;const s=this.listeners[e];if(s)for(const o of Array.from(s))o(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),MS)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}q_.type="LOCAL";const FS=q_;new ol(3e4,6e4);/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function US(r,e){return e?Rr(e):(ye(r._popupRedirectResolver,r,"argument-error"),r._popupRedirectResolver)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class df extends uf{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return yo(e,this._buildIdpRequest())}_linkToIdToken(e,t){return yo(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return yo(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function jS(r){return M_(r.auth,new df(r),r.bypassAuthState)}function zS(r){const{auth:e,user:t}=r;return ye(t,e,"internal-error"),ES(t,new df(r),r.bypassAuthState)}async function BS(r){const{auth:e,user:t}=r;return ye(t,e,"internal-error"),vS(t,new df(r),r.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class K_{constructor(e,t,s,o,l=!1){this.auth=e,this.resolver=s,this.user=o,this.bypassAuthState=l,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(s){this.reject(s)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:s,postBody:o,tenantId:l,error:h,type:f}=e;if(h){this.reject(h);return}const g={auth:this.auth,requestUri:t,sessionId:s,tenantId:l||void 0,postBody:o||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(f)(g))}catch(_){this.reject(_)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return jS;case"linkViaPopup":case"linkViaRedirect":return BS;case"reauthViaPopup":case"reauthViaRedirect":return zS;default:jn(this.auth,"internal-error")}}resolve(e){Nr(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Nr(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $S=new ol(2e3,1e4);class po extends K_{constructor(e,t,s,o,l){super(e,t,o,l),this.provider=s,this.authWindow=null,this.pollId=null,po.currentPopupAction&&po.currentPopupAction.cancel(),po.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return ye(e,this.auth,"internal-error"),e}async onExecution(){Nr(this.filter.length===1,"Popup operations only handle one event");const e=hf();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(Zn(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)===null||e===void 0?void 0:e.associatedEvent)||null}cancel(){this.reject(Zn(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,po.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,s;if(!((s=(t=this.authWindow)===null||t===void 0?void 0:t.window)===null||s===void 0)&&s.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(Zn(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,$S.get())};e()}}po.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const WS="pendingRedirect",Uu=new Map;class HS extends K_{constructor(e,t,s=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,s),this.eventId=null}async execute(){let e=Uu.get(this.auth._key());if(!e){try{const s=await qS(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(s)}catch(t){e=()=>Promise.reject(t)}Uu.set(this.auth._key(),e)}return this.bypassAuthState||Uu.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function qS(r,e){const t=QS(e),s=GS(r);if(!await s._isAvailable())return!1;const o=await s._get(t)==="true";return await s._remove(t),o}function KS(r,e){Uu.set(r._key(),e)}function GS(r){return Rr(r._redirectPersistence)}function QS(r){return Fu(WS,r.config.apiKey,r.name)}async function XS(r,e,t=!1){if(vn(r.app))return Promise.reject(Cr(r));const s=ds(r),o=US(s,e),h=await new HS(s,o,t).execute();return h&&!t&&(delete h.user._redirectEventId,await s._persistUserIfCurrent(h.user),await s._setRedirectUser(null,e)),h}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const JS=10*60*1e3;class YS{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(s=>{this.isEventForConsumer(e,s)&&(t=!0,this.sendToConsumer(e,s),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!ZS(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var s;if(e.error&&!G_(e)){const o=((s=e.error.code)===null||s===void 0?void 0:s.split("auth/")[1])||"internal-error";t.onError(Zn(this.auth,o))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const s=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&s}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=JS&&this.cachedEventUids.clear(),this.cachedEventUids.has(bg(e))}saveEventToCache(e){this.cachedEventUids.add(bg(e)),this.lastProcessedEventTime=Date.now()}}function bg(r){return[r.type,r.eventId,r.sessionId,r.tenantId].filter(e=>e).join("-")}function G_({type:r,error:e}){return r==="unknown"&&e?.code==="auth/no-auth-event"}function ZS(r){switch(r.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return G_(r);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function e1(r,e={}){return Pi(r,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const t1=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,n1=/^https?/;async function r1(r){if(r.config.emulator)return;const{authorizedDomains:e}=await e1(r);for(const t of e)try{if(i1(t))return}catch{}jn(r,"unauthorized-domain")}function i1(r){const e=kd(),{protocol:t,hostname:s}=new URL(e);if(r.startsWith("chrome-extension://")){const h=new URL(r);return h.hostname===""&&s===""?t==="chrome-extension:"&&r.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&h.hostname===s}if(!n1.test(t))return!1;if(t1.test(r))return s===r;const o=r.replace(/\./g,"\\.");return new RegExp("^(.+\\."+o+"|"+o+")$","i").test(s)}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const s1=new ol(3e4,6e4);function Fg(){const r=er().___jsl;if(r?.H){for(const e of Object.keys(r.H))if(r.H[e].r=r.H[e].r||[],r.H[e].L=r.H[e].L||[],r.H[e].r=[...r.H[e].L],r.CP)for(let t=0;t<r.CP.length;t++)r.CP[t]=null}}function o1(r){return new Promise((e,t)=>{var s,o,l;function h(){Fg(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{Fg(),t(Zn(r,"network-request-failed"))},timeout:s1.get()})}if(!((o=(s=er().gapi)===null||s===void 0?void 0:s.iframes)===null||o===void 0)&&o.Iframe)e(gapi.iframes.getContext());else if(!((l=er().gapi)===null||l===void 0)&&l.load)h();else{const f=tS("iframefcb");return er()[f]=()=>{gapi.load?h():t(Zn(r,"network-request-failed"))},D_(`${eS()}?onload=${f}`).catch(g=>t(g))}}).catch(e=>{throw ju=null,e})}let ju=null;function a1(r){return ju=ju||o1(r),ju}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const l1=new ol(5e3,15e3),u1="__/auth/iframe",c1="emulator/auth/iframe",h1={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},d1=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function f1(r){const e=r.config;ye(e.authDomain,r,"auth-domain-config-required");const t=e.emulator?of(e,c1):`https://${r.config.authDomain}/${u1}`,s={apiKey:e.apiKey,appName:r.name,v:Po},o=d1.get(r.config.apiHost);o&&(s.eid=o);const l=r._getFrameworks();return l.length&&(s.fw=l.join(",")),`${t}?${sl(s).slice(1)}`}async function p1(r){const e=await a1(r),t=er().gapi;return ye(t,r,"internal-error"),e.open({where:document.body,url:f1(r),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:h1,dontclear:!0},s=>new Promise(async(o,l)=>{await s.restyle({setHideOnLeave:!1});const h=Zn(r,"network-request-failed"),f=er().setTimeout(()=>{l(h)},l1.get());function g(){er().clearTimeout(f),o(s)}s.ping(g).then(g,()=>{l(h)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const m1={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},g1=500,y1=600,_1="_blank",v1="http://localhost";class Ug{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function E1(r,e,t,s=g1,o=y1){const l=Math.max((window.screen.availHeight-o)/2,0).toString(),h=Math.max((window.screen.availWidth-s)/2,0).toString();let f="";const g=Object.assign(Object.assign({},m1),{width:s.toString(),height:o.toString(),top:l,left:h}),_=zt().toLowerCase();t&&(f=S_(_)?_1:t),T_(_)&&(e=e||v1,g.scrollbars="yes");const E=Object.entries(g).reduce((R,[j,B])=>`${R}${j}=${B},`,"");if(HI(_)&&f!=="_self")return w1(e||"",f),new Ug(null);const T=window.open(e||"",f,E);ye(T,r,"popup-blocked");try{T.focus()}catch{}return new Ug(T)}function w1(r,e){const t=document.createElement("a");t.href=r,t.target=e;const s=document.createEvent("MouseEvent");s.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(s)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const T1="__/auth/handler",I1="emulator/auth/handler",S1=encodeURIComponent("fac");async function jg(r,e,t,s,o,l){ye(r.config.authDomain,r,"auth-domain-config-required"),ye(r.config.apiKey,r,"invalid-api-key");const h={apiKey:r.config.apiKey,appName:r.name,authType:t,redirectUrl:s,v:Po,eventId:o};if(e instanceof x_){e.setDefaultLanguage(r.languageCode),h.providerId=e.providerId||"",fT(e.getCustomParameters())||(h.customParameters=JSON.stringify(e.getCustomParameters()));for(const[E,T]of Object.entries({}))h[E]=T}if(e instanceof ll){const E=e.getScopes().filter(T=>T!=="");E.length>0&&(h.scopes=E.join(","))}r.tenantId&&(h.tid=r.tenantId);const f=h;for(const E of Object.keys(f))f[E]===void 0&&delete f[E];const g=await r._getAppCheckToken(),_=g?`#${S1}=${encodeURIComponent(g)}`:"";return`${A1(r)}?${sl(f).slice(1)}${_}`}function A1({config:r}){return r.emulator?of(r,I1):`https://${r.authDomain}/${T1}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const gd="webStorageSupport";class R1{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=B_,this._completeRedirectFn=XS,this._overrideRedirectResult=KS}async _openPopup(e,t,s,o){var l;Nr((l=this.eventManagers[e._key()])===null||l===void 0?void 0:l.manager,"_initialize() not called before _openPopup()");const h=await jg(e,t,s,kd(),o);return E1(e,h,hf())}async _openRedirect(e,t,s,o){await this._originValidation(e);const l=await jg(e,t,s,kd(),o);return kS(l),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:o,promise:l}=this.eventManagers[t];return o?Promise.resolve(o):(Nr(l,"If manager is not set, promise should be"),l)}const s=this.initAndGetManager(e);return this.eventManagers[t]={promise:s},s.catch(()=>{delete this.eventManagers[t]}),s}async initAndGetManager(e){const t=await p1(e),s=new YS(e);return t.register("authEvent",o=>(ye(o?.authEvent,e,"invalid-auth-event"),{status:s.onEvent(o.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:s},this.iframes[e._key()]=t,s}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(gd,{type:gd},o=>{var l;const h=(l=o?.[0])===null||l===void 0?void 0:l[gd];h!==void 0&&t(!!h),jn(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=r1(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return k_()||I_()||lf()}}const C1=R1;var zg="@firebase/auth",Bg="1.10.8";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class P1{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)===null||e===void 0?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(s=>{e(s?.stsTokenManager.accessToken||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){ye(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function k1(r){switch(r){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function N1(r){vo(new as("auth",(e,{options:t})=>{const s=e.getProvider("app").getImmediate(),o=e.getProvider("heartbeat"),l=e.getProvider("app-check-internal"),{apiKey:h,authDomain:f}=s.options;ye(h&&!h.includes(":"),"invalid-api-key",{appName:s.name});const g={apiKey:h,authDomain:f,clientPlatform:r,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:N_(r)},_=new JI(s,o,l,g);return aS(_,t),_},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,s)=>{e.getProvider("auth-internal").initialize()})),vo(new as("auth-internal",e=>{const t=ds(e.getProvider("auth").getImmediate());return(s=>new P1(s))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),mi(zg,Bg,k1(r)),mi(zg,Bg,"esm2017")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const D1=5*60,O1=s_("authIdTokenMaxAge")||D1;let $g=null;const V1=r=>async e=>{const t=e&&await e.getIdTokenResult(),s=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(s&&s>O1)return;const o=t?.token;$g!==o&&($g=o,await fetch(r,{method:o?"POST":"DELETE",headers:o?{Authorization:`Bearer ${o}`}:{}}))};function x1(r=h_()){const e=nf(r,"auth");if(e.isInitialized())return e.getImmediate();const t=oS(r,{popupRedirectResolver:C1,persistence:[FS,RS,B_]}),s=s_("authTokenSyncURL");if(s&&typeof isSecureContext=="boolean"&&isSecureContext){const l=new URL(s,location.origin);if(location.origin===l.origin){const h=V1(l.toString());IS(t,h,()=>h(t.currentUser)),TS(t,f=>h(f))}}const o=r_("auth");return o&&lS(t,`http://${o}`),t}function L1(){var r,e;return(e=(r=document.getElementsByTagName("head"))===null||r===void 0?void 0:r[0])!==null&&e!==void 0?e:document}YI({loadJS(r){return new Promise((e,t)=>{const s=document.createElement("script");s.setAttribute("src",r),s.onload=e,s.onerror=o=>{const l=Zn("internal-error");l.customData=o,t(l)},s.type="text/javascript",s.charset="UTF-8",L1().appendChild(s)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});N1("Browser");var Wg=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var gi,Q_;(function(){var r;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(D,S){function C(){}C.prototype=S.prototype,D.D=S.prototype,D.prototype=new C,D.prototype.constructor=D,D.C=function(k,O,x){for(var A=Array(arguments.length-2),tt=2;tt<arguments.length;tt++)A[tt-2]=arguments[tt];return S.prototype[O].apply(k,A)}}function t(){this.blockSize=-1}function s(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}e(s,t),s.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function o(D,S,C){C||(C=0);var k=Array(16);if(typeof S=="string")for(var O=0;16>O;++O)k[O]=S.charCodeAt(C++)|S.charCodeAt(C++)<<8|S.charCodeAt(C++)<<16|S.charCodeAt(C++)<<24;else for(O=0;16>O;++O)k[O]=S[C++]|S[C++]<<8|S[C++]<<16|S[C++]<<24;S=D.g[0],C=D.g[1],O=D.g[2];var x=D.g[3],A=S+(x^C&(O^x))+k[0]+3614090360&4294967295;S=C+(A<<7&4294967295|A>>>25),A=x+(O^S&(C^O))+k[1]+3905402710&4294967295,x=S+(A<<12&4294967295|A>>>20),A=O+(C^x&(S^C))+k[2]+606105819&4294967295,O=x+(A<<17&4294967295|A>>>15),A=C+(S^O&(x^S))+k[3]+3250441966&4294967295,C=O+(A<<22&4294967295|A>>>10),A=S+(x^C&(O^x))+k[4]+4118548399&4294967295,S=C+(A<<7&4294967295|A>>>25),A=x+(O^S&(C^O))+k[5]+1200080426&4294967295,x=S+(A<<12&4294967295|A>>>20),A=O+(C^x&(S^C))+k[6]+2821735955&4294967295,O=x+(A<<17&4294967295|A>>>15),A=C+(S^O&(x^S))+k[7]+4249261313&4294967295,C=O+(A<<22&4294967295|A>>>10),A=S+(x^C&(O^x))+k[8]+1770035416&4294967295,S=C+(A<<7&4294967295|A>>>25),A=x+(O^S&(C^O))+k[9]+2336552879&4294967295,x=S+(A<<12&4294967295|A>>>20),A=O+(C^x&(S^C))+k[10]+4294925233&4294967295,O=x+(A<<17&4294967295|A>>>15),A=C+(S^O&(x^S))+k[11]+2304563134&4294967295,C=O+(A<<22&4294967295|A>>>10),A=S+(x^C&(O^x))+k[12]+1804603682&4294967295,S=C+(A<<7&4294967295|A>>>25),A=x+(O^S&(C^O))+k[13]+4254626195&4294967295,x=S+(A<<12&4294967295|A>>>20),A=O+(C^x&(S^C))+k[14]+2792965006&4294967295,O=x+(A<<17&4294967295|A>>>15),A=C+(S^O&(x^S))+k[15]+1236535329&4294967295,C=O+(A<<22&4294967295|A>>>10),A=S+(O^x&(C^O))+k[1]+4129170786&4294967295,S=C+(A<<5&4294967295|A>>>27),A=x+(C^O&(S^C))+k[6]+3225465664&4294967295,x=S+(A<<9&4294967295|A>>>23),A=O+(S^C&(x^S))+k[11]+643717713&4294967295,O=x+(A<<14&4294967295|A>>>18),A=C+(x^S&(O^x))+k[0]+3921069994&4294967295,C=O+(A<<20&4294967295|A>>>12),A=S+(O^x&(C^O))+k[5]+3593408605&4294967295,S=C+(A<<5&4294967295|A>>>27),A=x+(C^O&(S^C))+k[10]+38016083&4294967295,x=S+(A<<9&4294967295|A>>>23),A=O+(S^C&(x^S))+k[15]+3634488961&4294967295,O=x+(A<<14&4294967295|A>>>18),A=C+(x^S&(O^x))+k[4]+3889429448&4294967295,C=O+(A<<20&4294967295|A>>>12),A=S+(O^x&(C^O))+k[9]+568446438&4294967295,S=C+(A<<5&4294967295|A>>>27),A=x+(C^O&(S^C))+k[14]+3275163606&4294967295,x=S+(A<<9&4294967295|A>>>23),A=O+(S^C&(x^S))+k[3]+4107603335&4294967295,O=x+(A<<14&4294967295|A>>>18),A=C+(x^S&(O^x))+k[8]+1163531501&4294967295,C=O+(A<<20&4294967295|A>>>12),A=S+(O^x&(C^O))+k[13]+2850285829&4294967295,S=C+(A<<5&4294967295|A>>>27),A=x+(C^O&(S^C))+k[2]+4243563512&4294967295,x=S+(A<<9&4294967295|A>>>23),A=O+(S^C&(x^S))+k[7]+1735328473&4294967295,O=x+(A<<14&4294967295|A>>>18),A=C+(x^S&(O^x))+k[12]+2368359562&4294967295,C=O+(A<<20&4294967295|A>>>12),A=S+(C^O^x)+k[5]+4294588738&4294967295,S=C+(A<<4&4294967295|A>>>28),A=x+(S^C^O)+k[8]+2272392833&4294967295,x=S+(A<<11&4294967295|A>>>21),A=O+(x^S^C)+k[11]+1839030562&4294967295,O=x+(A<<16&4294967295|A>>>16),A=C+(O^x^S)+k[14]+4259657740&4294967295,C=O+(A<<23&4294967295|A>>>9),A=S+(C^O^x)+k[1]+2763975236&4294967295,S=C+(A<<4&4294967295|A>>>28),A=x+(S^C^O)+k[4]+1272893353&4294967295,x=S+(A<<11&4294967295|A>>>21),A=O+(x^S^C)+k[7]+4139469664&4294967295,O=x+(A<<16&4294967295|A>>>16),A=C+(O^x^S)+k[10]+3200236656&4294967295,C=O+(A<<23&4294967295|A>>>9),A=S+(C^O^x)+k[13]+681279174&4294967295,S=C+(A<<4&4294967295|A>>>28),A=x+(S^C^O)+k[0]+3936430074&4294967295,x=S+(A<<11&4294967295|A>>>21),A=O+(x^S^C)+k[3]+3572445317&4294967295,O=x+(A<<16&4294967295|A>>>16),A=C+(O^x^S)+k[6]+76029189&4294967295,C=O+(A<<23&4294967295|A>>>9),A=S+(C^O^x)+k[9]+3654602809&4294967295,S=C+(A<<4&4294967295|A>>>28),A=x+(S^C^O)+k[12]+3873151461&4294967295,x=S+(A<<11&4294967295|A>>>21),A=O+(x^S^C)+k[15]+530742520&4294967295,O=x+(A<<16&4294967295|A>>>16),A=C+(O^x^S)+k[2]+3299628645&4294967295,C=O+(A<<23&4294967295|A>>>9),A=S+(O^(C|~x))+k[0]+4096336452&4294967295,S=C+(A<<6&4294967295|A>>>26),A=x+(C^(S|~O))+k[7]+1126891415&4294967295,x=S+(A<<10&4294967295|A>>>22),A=O+(S^(x|~C))+k[14]+2878612391&4294967295,O=x+(A<<15&4294967295|A>>>17),A=C+(x^(O|~S))+k[5]+4237533241&4294967295,C=O+(A<<21&4294967295|A>>>11),A=S+(O^(C|~x))+k[12]+1700485571&4294967295,S=C+(A<<6&4294967295|A>>>26),A=x+(C^(S|~O))+k[3]+2399980690&4294967295,x=S+(A<<10&4294967295|A>>>22),A=O+(S^(x|~C))+k[10]+4293915773&4294967295,O=x+(A<<15&4294967295|A>>>17),A=C+(x^(O|~S))+k[1]+2240044497&4294967295,C=O+(A<<21&4294967295|A>>>11),A=S+(O^(C|~x))+k[8]+1873313359&4294967295,S=C+(A<<6&4294967295|A>>>26),A=x+(C^(S|~O))+k[15]+4264355552&4294967295,x=S+(A<<10&4294967295|A>>>22),A=O+(S^(x|~C))+k[6]+2734768916&4294967295,O=x+(A<<15&4294967295|A>>>17),A=C+(x^(O|~S))+k[13]+1309151649&4294967295,C=O+(A<<21&4294967295|A>>>11),A=S+(O^(C|~x))+k[4]+4149444226&4294967295,S=C+(A<<6&4294967295|A>>>26),A=x+(C^(S|~O))+k[11]+3174756917&4294967295,x=S+(A<<10&4294967295|A>>>22),A=O+(S^(x|~C))+k[2]+718787259&4294967295,O=x+(A<<15&4294967295|A>>>17),A=C+(x^(O|~S))+k[9]+3951481745&4294967295,D.g[0]=D.g[0]+S&4294967295,D.g[1]=D.g[1]+(O+(A<<21&4294967295|A>>>11))&4294967295,D.g[2]=D.g[2]+O&4294967295,D.g[3]=D.g[3]+x&4294967295}s.prototype.u=function(D,S){S===void 0&&(S=D.length);for(var C=S-this.blockSize,k=this.B,O=this.h,x=0;x<S;){if(O==0)for(;x<=C;)o(this,D,x),x+=this.blockSize;if(typeof D=="string"){for(;x<S;)if(k[O++]=D.charCodeAt(x++),O==this.blockSize){o(this,k),O=0;break}}else for(;x<S;)if(k[O++]=D[x++],O==this.blockSize){o(this,k),O=0;break}}this.h=O,this.o+=S},s.prototype.v=function(){var D=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);D[0]=128;for(var S=1;S<D.length-8;++S)D[S]=0;var C=8*this.o;for(S=D.length-8;S<D.length;++S)D[S]=C&255,C/=256;for(this.u(D),D=Array(16),S=C=0;4>S;++S)for(var k=0;32>k;k+=8)D[C++]=this.g[S]>>>k&255;return D};function l(D,S){var C=f;return Object.prototype.hasOwnProperty.call(C,D)?C[D]:C[D]=S(D)}function h(D,S){this.h=S;for(var C=[],k=!0,O=D.length-1;0<=O;O--){var x=D[O]|0;k&&x==S||(C[O]=x,k=!1)}this.g=C}var f={};function g(D){return-128<=D&&128>D?l(D,function(S){return new h([S|0],0>S?-1:0)}):new h([D|0],0>D?-1:0)}function _(D){if(isNaN(D)||!isFinite(D))return T;if(0>D)return F(_(-D));for(var S=[],C=1,k=0;D>=C;k++)S[k]=D/C|0,C*=4294967296;return new h(S,0)}function E(D,S){if(D.length==0)throw Error("number format error: empty string");if(S=S||10,2>S||36<S)throw Error("radix out of range: "+S);if(D.charAt(0)=="-")return F(E(D.substring(1),S));if(0<=D.indexOf("-"))throw Error('number format error: interior "-" character');for(var C=_(Math.pow(S,8)),k=T,O=0;O<D.length;O+=8){var x=Math.min(8,D.length-O),A=parseInt(D.substring(O,O+x),S);8>x?(x=_(Math.pow(S,x)),k=k.j(x).add(_(A))):(k=k.j(C),k=k.add(_(A)))}return k}var T=g(0),R=g(1),j=g(16777216);r=h.prototype,r.m=function(){if($(this))return-F(this).m();for(var D=0,S=1,C=0;C<this.g.length;C++){var k=this.i(C);D+=(0<=k?k:4294967296+k)*S,S*=4294967296}return D},r.toString=function(D){if(D=D||10,2>D||36<D)throw Error("radix out of range: "+D);if(B(this))return"0";if($(this))return"-"+F(this).toString(D);for(var S=_(Math.pow(D,6)),C=this,k="";;){var O=ge(C,S).g;C=ae(C,O.j(S));var x=((0<C.g.length?C.g[0]:C.h)>>>0).toString(D);if(C=O,B(C))return x+k;for(;6>x.length;)x="0"+x;k=x+k}},r.i=function(D){return 0>D?0:D<this.g.length?this.g[D]:this.h};function B(D){if(D.h!=0)return!1;for(var S=0;S<D.g.length;S++)if(D.g[S]!=0)return!1;return!0}function $(D){return D.h==-1}r.l=function(D){return D=ae(this,D),$(D)?-1:B(D)?0:1};function F(D){for(var S=D.g.length,C=[],k=0;k<S;k++)C[k]=~D.g[k];return new h(C,~D.h).add(R)}r.abs=function(){return $(this)?F(this):this},r.add=function(D){for(var S=Math.max(this.g.length,D.g.length),C=[],k=0,O=0;O<=S;O++){var x=k+(this.i(O)&65535)+(D.i(O)&65535),A=(x>>>16)+(this.i(O)>>>16)+(D.i(O)>>>16);k=A>>>16,x&=65535,A&=65535,C[O]=A<<16|x}return new h(C,C[C.length-1]&-2147483648?-1:0)};function ae(D,S){return D.add(F(S))}r.j=function(D){if(B(this)||B(D))return T;if($(this))return $(D)?F(this).j(F(D)):F(F(this).j(D));if($(D))return F(this.j(F(D)));if(0>this.l(j)&&0>D.l(j))return _(this.m()*D.m());for(var S=this.g.length+D.g.length,C=[],k=0;k<2*S;k++)C[k]=0;for(k=0;k<this.g.length;k++)for(var O=0;O<D.g.length;O++){var x=this.i(k)>>>16,A=this.i(k)&65535,tt=D.i(O)>>>16,Ot=D.i(O)&65535;C[2*k+2*O]+=A*Ot,re(C,2*k+2*O),C[2*k+2*O+1]+=x*Ot,re(C,2*k+2*O+1),C[2*k+2*O+1]+=A*tt,re(C,2*k+2*O+1),C[2*k+2*O+2]+=x*tt,re(C,2*k+2*O+2)}for(k=0;k<S;k++)C[k]=C[2*k+1]<<16|C[2*k];for(k=S;k<2*S;k++)C[k]=0;return new h(C,0)};function re(D,S){for(;(D[S]&65535)!=D[S];)D[S+1]+=D[S]>>>16,D[S]&=65535,S++}function ie(D,S){this.g=D,this.h=S}function ge(D,S){if(B(S))throw Error("division by zero");if(B(D))return new ie(T,T);if($(D))return S=ge(F(D),S),new ie(F(S.g),F(S.h));if($(S))return S=ge(D,F(S)),new ie(F(S.g),S.h);if(30<D.g.length){if($(D)||$(S))throw Error("slowDivide_ only works with positive integers.");for(var C=R,k=S;0>=k.l(D);)C=Le(C),k=Le(k);var O=Re(C,1),x=Re(k,1);for(k=Re(k,2),C=Re(C,2);!B(k);){var A=x.add(k);0>=A.l(D)&&(O=O.add(C),x=A),k=Re(k,1),C=Re(C,1)}return S=ae(D,O.j(S)),new ie(O,S)}for(O=T;0<=D.l(S);){for(C=Math.max(1,Math.floor(D.m()/S.m())),k=Math.ceil(Math.log(C)/Math.LN2),k=48>=k?1:Math.pow(2,k-48),x=_(C),A=x.j(S);$(A)||0<A.l(D);)C-=k,x=_(C),A=x.j(S);B(x)&&(x=R),O=O.add(x),D=ae(D,A)}return new ie(O,D)}r.A=function(D){return ge(this,D).h},r.and=function(D){for(var S=Math.max(this.g.length,D.g.length),C=[],k=0;k<S;k++)C[k]=this.i(k)&D.i(k);return new h(C,this.h&D.h)},r.or=function(D){for(var S=Math.max(this.g.length,D.g.length),C=[],k=0;k<S;k++)C[k]=this.i(k)|D.i(k);return new h(C,this.h|D.h)},r.xor=function(D){for(var S=Math.max(this.g.length,D.g.length),C=[],k=0;k<S;k++)C[k]=this.i(k)^D.i(k);return new h(C,this.h^D.h)};function Le(D){for(var S=D.g.length+1,C=[],k=0;k<S;k++)C[k]=D.i(k)<<1|D.i(k-1)>>>31;return new h(C,D.h)}function Re(D,S){var C=S>>5;S%=32;for(var k=D.g.length-C,O=[],x=0;x<k;x++)O[x]=0<S?D.i(x+C)>>>S|D.i(x+C+1)<<32-S:D.i(x+C);return new h(O,D.h)}s.prototype.digest=s.prototype.v,s.prototype.reset=s.prototype.s,s.prototype.update=s.prototype.u,Q_=s,h.prototype.add=h.prototype.add,h.prototype.multiply=h.prototype.j,h.prototype.modulo=h.prototype.A,h.prototype.compare=h.prototype.l,h.prototype.toNumber=h.prototype.m,h.prototype.toString=h.prototype.toString,h.prototype.getBits=h.prototype.i,h.fromNumber=_,h.fromString=E,gi=h}).apply(typeof Wg<"u"?Wg:typeof self<"u"?self:typeof window<"u"?window:{});var Ou=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var X_,Oa,J_,zu,Vd,Y_,Z_,ev;(function(){var r,e=typeof Object.defineProperties=="function"?Object.defineProperty:function(u,p,y){return u==Array.prototype||u==Object.prototype||(u[p]=y.value),u};function t(u){u=[typeof globalThis=="object"&&globalThis,u,typeof window=="object"&&window,typeof self=="object"&&self,typeof Ou=="object"&&Ou];for(var p=0;p<u.length;++p){var y=u[p];if(y&&y.Math==Math)return y}throw Error("Cannot find global object")}var s=t(this);function o(u,p){if(p)e:{var y=s;u=u.split(".");for(var w=0;w<u.length-1;w++){var L=u[w];if(!(L in y))break e;y=y[L]}u=u[u.length-1],w=y[u],p=p(w),p!=w&&p!=null&&e(y,u,{configurable:!0,writable:!0,value:p})}}function l(u,p){u instanceof String&&(u+="");var y=0,w=!1,L={next:function(){if(!w&&y<u.length){var z=y++;return{value:p(z,u[z]),done:!1}}return w=!0,{done:!0,value:void 0}}};return L[Symbol.iterator]=function(){return L},L}o("Array.prototype.values",function(u){return u||function(){return l(this,function(p,y){return y})}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var h=h||{},f=this||self;function g(u){var p=typeof u;return p=p!="object"?p:u?Array.isArray(u)?"array":p:"null",p=="array"||p=="object"&&typeof u.length=="number"}function _(u){var p=typeof u;return p=="object"&&u!=null||p=="function"}function E(u,p,y){return u.call.apply(u.bind,arguments)}function T(u,p,y){if(!u)throw Error();if(2<arguments.length){var w=Array.prototype.slice.call(arguments,2);return function(){var L=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(L,w),u.apply(p,L)}}return function(){return u.apply(p,arguments)}}function R(u,p,y){return R=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?E:T,R.apply(null,arguments)}function j(u,p){var y=Array.prototype.slice.call(arguments,1);return function(){var w=y.slice();return w.push.apply(w,arguments),u.apply(this,w)}}function B(u,p){function y(){}y.prototype=p.prototype,u.aa=p.prototype,u.prototype=new y,u.prototype.constructor=u,u.Qb=function(w,L,z){for(var J=Array(arguments.length-2),Ue=2;Ue<arguments.length;Ue++)J[Ue-2]=arguments[Ue];return p.prototype[L].apply(w,J)}}function $(u){const p=u.length;if(0<p){const y=Array(p);for(let w=0;w<p;w++)y[w]=u[w];return y}return[]}function F(u,p){for(let y=1;y<arguments.length;y++){const w=arguments[y];if(g(w)){const L=u.length||0,z=w.length||0;u.length=L+z;for(let J=0;J<z;J++)u[L+J]=w[J]}else u.push(w)}}class ae{constructor(p,y){this.i=p,this.j=y,this.h=0,this.g=null}get(){let p;return 0<this.h?(this.h--,p=this.g,this.g=p.next,p.next=null):p=this.i(),p}}function re(u){return/^[\s\xa0]*$/.test(u)}function ie(){var u=f.navigator;return u&&(u=u.userAgent)?u:""}function ge(u){return ge[" "](u),u}ge[" "]=function(){};var Le=ie().indexOf("Gecko")!=-1&&!(ie().toLowerCase().indexOf("webkit")!=-1&&ie().indexOf("Edge")==-1)&&!(ie().indexOf("Trident")!=-1||ie().indexOf("MSIE")!=-1)&&ie().indexOf("Edge")==-1;function Re(u,p,y){for(const w in u)p.call(y,u[w],w,u)}function D(u,p){for(const y in u)p.call(void 0,u[y],y,u)}function S(u){const p={};for(const y in u)p[y]=u[y];return p}const C="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function k(u,p){let y,w;for(let L=1;L<arguments.length;L++){w=arguments[L];for(y in w)u[y]=w[y];for(let z=0;z<C.length;z++)y=C[z],Object.prototype.hasOwnProperty.call(w,y)&&(u[y]=w[y])}}function O(u){var p=1;u=u.split(":");const y=[];for(;0<p&&u.length;)y.push(u.shift()),p--;return u.length&&y.push(u.join(":")),y}function x(u){f.setTimeout(()=>{throw u},0)}function A(){var u=de;let p=null;return u.g&&(p=u.g,u.g=u.g.next,u.g||(u.h=null),p.next=null),p}class tt{constructor(){this.h=this.g=null}add(p,y){const w=Ot.get();w.set(p,y),this.h?this.h.next=w:this.g=w,this.h=w}}var Ot=new ae(()=>new Vt,u=>u.reset());class Vt{constructor(){this.next=this.g=this.h=null}set(p,y){this.h=p,this.g=y,this.next=null}reset(){this.next=this.g=this.h=null}}let je,Z=!1,de=new tt,ne=()=>{const u=f.Promise.resolve(void 0);je=()=>{u.then(V)}};var V=()=>{for(var u;u=A();){try{u.h.call(u.g)}catch(y){x(y)}var p=Ot;p.j(u),100>p.h&&(p.h++,u.next=p.g,p.g=u)}Z=!1};function H(){this.s=this.s,this.C=this.C}H.prototype.s=!1,H.prototype.ma=function(){this.s||(this.s=!0,this.N())},H.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function he(u,p){this.type=u,this.g=this.target=p,this.defaultPrevented=!1}he.prototype.h=function(){this.defaultPrevented=!0};var Te=function(){if(!f.addEventListener||!Object.defineProperty)return!1;var u=!1,p=Object.defineProperty({},"passive",{get:function(){u=!0}});try{const y=()=>{};f.addEventListener("test",y,p),f.removeEventListener("test",y,p)}catch{}return u}();function Se(u,p){if(he.call(this,u?u.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,u){var y=this.type=u.type,w=u.changedTouches&&u.changedTouches.length?u.changedTouches[0]:null;if(this.target=u.target||u.srcElement,this.g=p,p=u.relatedTarget){if(Le){e:{try{ge(p.nodeName);var L=!0;break e}catch{}L=!1}L||(p=null)}}else y=="mouseover"?p=u.fromElement:y=="mouseout"&&(p=u.toElement);this.relatedTarget=p,w?(this.clientX=w.clientX!==void 0?w.clientX:w.pageX,this.clientY=w.clientY!==void 0?w.clientY:w.pageY,this.screenX=w.screenX||0,this.screenY=w.screenY||0):(this.clientX=u.clientX!==void 0?u.clientX:u.pageX,this.clientY=u.clientY!==void 0?u.clientY:u.pageY,this.screenX=u.screenX||0,this.screenY=u.screenY||0),this.button=u.button,this.key=u.key||"",this.ctrlKey=u.ctrlKey,this.altKey=u.altKey,this.shiftKey=u.shiftKey,this.metaKey=u.metaKey,this.pointerId=u.pointerId||0,this.pointerType=typeof u.pointerType=="string"?u.pointerType:Ne[u.pointerType]||"",this.state=u.state,this.i=u,u.defaultPrevented&&Se.aa.h.call(this)}}B(Se,he);var Ne={2:"touch",3:"pen",4:"mouse"};Se.prototype.h=function(){Se.aa.h.call(this);var u=this.i;u.preventDefault?u.preventDefault():u.returnValue=!1};var Me="closure_listenable_"+(1e6*Math.random()|0),be=0;function Be(u,p,y,w,L){this.listener=u,this.proxy=null,this.src=p,this.type=y,this.capture=!!w,this.ha=L,this.key=++be,this.da=this.fa=!1}function _t(u){u.da=!0,u.listener=null,u.proxy=null,u.src=null,u.ha=null}function ar(u){this.src=u,this.g={},this.h=0}ar.prototype.add=function(u,p,y,w,L){var z=u.toString();u=this.g[z],u||(u=this.g[z]=[],this.h++);var J=xr(u,p,w,L);return-1<J?(p=u[J],y||(p.fa=!1)):(p=new Be(p,this.src,z,!!w,L),p.fa=y,u.push(p)),p};function ys(u,p){var y=p.type;if(y in u.g){var w=u.g[y],L=Array.prototype.indexOf.call(w,p,void 0),z;(z=0<=L)&&Array.prototype.splice.call(w,L,1),z&&(_t(p),u.g[y].length==0&&(delete u.g[y],u.h--))}}function xr(u,p,y,w){for(var L=0;L<u.length;++L){var z=u[L];if(!z.da&&z.listener==p&&z.capture==!!y&&z.ha==w)return L}return-1}var ki="closure_lm_"+(1e6*Math.random()|0),_s={};function xo(u,p,y,w,L){if(Array.isArray(p)){for(var z=0;z<p.length;z++)xo(u,p[z],y,w,L);return null}return y=bo(y),u&&u[Me]?u.K(p,y,_(w)?!!w.capture:!1,L):Lo(u,p,y,!1,w,L)}function Lo(u,p,y,w,L,z){if(!p)throw Error("Invalid event type");var J=_(L)?!!L.capture:!!L,Ue=Es(u);if(Ue||(u[ki]=Ue=new ar(u)),y=Ue.add(p,y,w,J,z),y.proxy)return y;if(w=ml(),y.proxy=w,w.src=u,w.listener=y,u.addEventListener)Te||(L=J),L===void 0&&(L=!1),u.addEventListener(p.toString(),w,L);else if(u.attachEvent)u.attachEvent(ur(p.toString()),w);else if(u.addListener&&u.removeListener)u.addListener(w);else throw Error("addEventListener and attachEvent are unavailable.");return y}function ml(){function u(y){return p.call(u.src,u.listener,y)}const p=Mo;return u}function vs(u,p,y,w,L){if(Array.isArray(p))for(var z=0;z<p.length;z++)vs(u,p[z],y,w,L);else w=_(w)?!!w.capture:!!w,y=bo(y),u&&u[Me]?(u=u.i,p=String(p).toString(),p in u.g&&(z=u.g[p],y=xr(z,y,w,L),-1<y&&(_t(z[y]),Array.prototype.splice.call(z,y,1),z.length==0&&(delete u.g[p],u.h--)))):u&&(u=Es(u))&&(p=u.g[p.toString()],u=-1,p&&(u=xr(p,y,w,L)),(y=-1<u?p[u]:null)&&lr(y))}function lr(u){if(typeof u!="number"&&u&&!u.da){var p=u.src;if(p&&p[Me])ys(p.i,u);else{var y=u.type,w=u.proxy;p.removeEventListener?p.removeEventListener(y,w,u.capture):p.detachEvent?p.detachEvent(ur(y),w):p.addListener&&p.removeListener&&p.removeListener(w),(y=Es(p))?(ys(y,u),y.h==0&&(y.src=null,p[ki]=null)):_t(u)}}}function ur(u){return u in _s?_s[u]:_s[u]="on"+u}function Mo(u,p){if(u.da)u=!0;else{p=new Se(p,this);var y=u.listener,w=u.ha||u.src;u.fa&&lr(u),u=y.call(w,p)}return u}function Es(u){return u=u[ki],u instanceof ar?u:null}var ws="__closure_events_fn_"+(1e9*Math.random()>>>0);function bo(u){return typeof u=="function"?u:(u[ws]||(u[ws]=function(p){return u.handleEvent(p)}),u[ws])}function ht(){H.call(this),this.i=new ar(this),this.M=this,this.F=null}B(ht,H),ht.prototype[Me]=!0,ht.prototype.removeEventListener=function(u,p,y,w){vs(this,u,p,y,w)};function dt(u,p){var y,w=u.F;if(w)for(y=[];w;w=w.F)y.push(w);if(u=u.M,w=p.type||p,typeof p=="string")p=new he(p,u);else if(p instanceof he)p.target=p.target||u;else{var L=p;p=new he(w,u),k(p,L)}if(L=!0,y)for(var z=y.length-1;0<=z;z--){var J=p.g=y[z];L=cr(J,w,!0,p)&&L}if(J=p.g=u,L=cr(J,w,!0,p)&&L,L=cr(J,w,!1,p)&&L,y)for(z=0;z<y.length;z++)J=p.g=y[z],L=cr(J,w,!1,p)&&L}ht.prototype.N=function(){if(ht.aa.N.call(this),this.i){var u=this.i,p;for(p in u.g){for(var y=u.g[p],w=0;w<y.length;w++)_t(y[w]);delete u.g[p],u.h--}}this.F=null},ht.prototype.K=function(u,p,y,w){return this.i.add(String(u),p,!1,y,w)},ht.prototype.L=function(u,p,y,w){return this.i.add(String(u),p,!0,y,w)};function cr(u,p,y,w){if(p=u.i.g[String(p)],!p)return!0;p=p.concat();for(var L=!0,z=0;z<p.length;++z){var J=p[z];if(J&&!J.da&&J.capture==y){var Ue=J.listener,ft=J.ha||J.src;J.fa&&ys(u.i,J),L=Ue.call(ft,w)!==!1&&L}}return L&&!w.defaultPrevented}function Fo(u,p,y){if(typeof u=="function")y&&(u=R(u,y));else if(u&&typeof u.handleEvent=="function")u=R(u.handleEvent,u);else throw Error("Invalid listener argument");return 2147483647<Number(p)?-1:f.setTimeout(u,p||0)}function Lr(u){u.g=Fo(()=>{u.g=null,u.i&&(u.i=!1,Lr(u))},u.l);const p=u.h;u.h=null,u.m.apply(null,p)}class Ni extends H{constructor(p,y){super(),this.m=p,this.l=y,this.h=null,this.i=!1,this.g=null}j(p){this.h=arguments,this.g?this.i=!0:Lr(this)}N(){super.N(),this.g&&(f.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function Di(u){H.call(this),this.h=u,this.g={}}B(Di,H);var Uo=[];function jo(u){Re(u.g,function(p,y){this.g.hasOwnProperty(y)&&lr(p)},u),u.g={}}Di.prototype.N=function(){Di.aa.N.call(this),jo(this)},Di.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var zo=f.JSON.stringify,Bo=f.JSON.parse,$o=class{stringify(u){return f.JSON.stringify(u,void 0)}parse(u){return f.JSON.parse(u,void 0)}};function Oi(){}Oi.prototype.h=null;function Ts(u){return u.h||(u.h=u.i())}function Is(){}var un={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function zn(){he.call(this,"d")}B(zn,he);function Ss(){he.call(this,"c")}B(Ss,he);var Bn={},Wo=null;function Vi(){return Wo=Wo||new ht}Bn.La="serverreachability";function Ho(u){he.call(this,Bn.La,u)}B(Ho,he);function hr(u){const p=Vi();dt(p,new Ho(p))}Bn.STAT_EVENT="statevent";function qo(u,p){he.call(this,Bn.STAT_EVENT,u),this.stat=p}B(qo,he);function nt(u){const p=Vi();dt(p,new qo(p,u))}Bn.Ma="timingevent";function As(u,p){he.call(this,Bn.Ma,u),this.size=p}B(As,he);function In(u,p){if(typeof u!="function")throw Error("Fn must not be null and must be a function");return f.setTimeout(function(){u()},p)}function xi(){this.g=!0}xi.prototype.xa=function(){this.g=!1};function Li(u,p,y,w,L,z){u.info(function(){if(u.g)if(z)for(var J="",Ue=z.split("&"),ft=0;ft<Ue.length;ft++){var De=Ue[ft].split("=");if(1<De.length){var vt=De[0];De=De[1];var ot=vt.split("_");J=2<=ot.length&&ot[1]=="type"?J+(vt+"="+De+"&"):J+(vt+"=redacted&")}}else J=null;else J=z;return"XMLHTTP REQ ("+w+") [attempt "+L+"]: "+p+`
`+y+`
`+J})}function Rs(u,p,y,w,L,z,J){u.info(function(){return"XMLHTTP RESP ("+w+") [ attempt "+L+"]: "+p+`
`+y+`
`+z+" "+J})}function Sn(u,p,y,w){u.info(function(){return"XMLHTTP TEXT ("+p+"): "+Dc(u,y)+(w?" "+w:"")})}function Ko(u,p){u.info(function(){return"TIMEOUT: "+p})}xi.prototype.info=function(){};function Dc(u,p){if(!u.g)return p;if(!p)return null;try{var y=JSON.parse(p);if(y){for(u=0;u<y.length;u++)if(Array.isArray(y[u])){var w=y[u];if(!(2>w.length)){var L=w[1];if(Array.isArray(L)&&!(1>L.length)){var z=L[0];if(z!="noop"&&z!="stop"&&z!="close")for(var J=1;J<L.length;J++)L[J]=""}}}}return zo(y)}catch{return p}}var Cs={NO_ERROR:0,gb:1,tb:2,sb:3,nb:4,rb:5,ub:6,Ia:7,TIMEOUT:8,xb:9},gl={lb:"complete",Hb:"success",Ja:"error",Ia:"abort",zb:"ready",Ab:"readystatechange",TIMEOUT:"timeout",vb:"incrementaldata",yb:"progress",ob:"downloadprogress",Pb:"uploadprogress"},An;function Mi(){}B(Mi,Oi),Mi.prototype.g=function(){return new XMLHttpRequest},Mi.prototype.i=function(){return{}},An=new Mi;function Rn(u,p,y,w){this.j=u,this.i=p,this.l=y,this.R=w||1,this.U=new Di(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new yl}function yl(){this.i=null,this.g="",this.h=!1}var Go={},Ps={};function ks(u,p,y){u.L=1,u.v=jr(nn(p)),u.m=y,u.P=!0,Qo(u,null)}function Qo(u,p){u.F=Date.now(),$e(u),u.A=nn(u.v);var y=u.A,w=u.R;Array.isArray(w)||(w=[String(w)]),Br(y.i,"t",w),u.C=0,y=u.j.J,u.h=new yl,u.g=Ll(u.j,y?p:null,!u.m),0<u.O&&(u.M=new Ni(R(u.Y,u,u.g),u.O)),p=u.U,y=u.g,w=u.ca;var L="readystatechange";Array.isArray(L)||(L&&(Uo[0]=L.toString()),L=Uo);for(var z=0;z<L.length;z++){var J=xo(y,L[z],w||p.handleEvent,!1,p.h||p);if(!J)break;p.g[J.key]=J}p=u.H?S(u.H):{},u.m?(u.u||(u.u="POST"),p["Content-Type"]="application/x-www-form-urlencoded",u.g.ea(u.A,u.u,u.m,p)):(u.u="GET",u.g.ea(u.A,u.u,null,p)),hr(),Li(u.i,u.u,u.A,u.l,u.R,u.m)}Rn.prototype.ca=function(u){u=u.target;const p=this.M;p&&Kt(u)==3?p.j():this.Y(u)},Rn.prototype.Y=function(u){try{if(u==this.g)e:{const ot=Kt(this.g);var p=this.g.Ba();const dn=this.g.Z();if(!(3>ot)&&(ot!=3||this.g&&(this.h.h||this.g.oa()||ta(this.g)))){this.J||ot!=4||p==7||(p==8||0>=dn?hr(3):hr(2)),bi(this);var y=this.g.Z();this.X=y;t:if(_l(this)){var w=ta(this.g);u="";var L=w.length,z=Kt(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){cn(this),Mr(this);var J="";break t}this.h.i=new f.TextDecoder}for(p=0;p<L;p++)this.h.h=!0,u+=this.h.i.decode(w[p],{stream:!(z&&p==L-1)});w.length=0,this.h.g+=u,this.C=0,J=this.h.g}else J=this.g.oa();if(this.o=y==200,Rs(this.i,this.u,this.A,this.l,this.R,ot,y),this.o){if(this.T&&!this.K){t:{if(this.g){var Ue,ft=this.g;if((Ue=ft.g?ft.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!re(Ue)){var De=Ue;break t}}De=null}if(y=De)Sn(this.i,this.l,y,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,Xo(this,y);else{this.o=!1,this.s=3,nt(12),cn(this),Mr(this);break e}}if(this.P){y=!0;let sn;for(;!this.J&&this.C<J.length;)if(sn=Oc(this,J),sn==Ps){ot==4&&(this.s=4,nt(14),y=!1),Sn(this.i,this.l,null,"[Incomplete Response]");break}else if(sn==Go){this.s=4,nt(15),Sn(this.i,this.l,J,"[Invalid Chunk]"),y=!1;break}else Sn(this.i,this.l,sn,null),Xo(this,sn);if(_l(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),ot!=4||J.length!=0||this.h.h||(this.s=1,nt(16),y=!1),this.o=this.o&&y,!y)Sn(this.i,this.l,J,"[Invalid Chunked Response]"),cn(this),Mr(this);else if(0<J.length&&!this.W){this.W=!0;var vt=this.j;vt.g==this&&vt.ba&&!vt.M&&(vt.j.info("Great, no buffering proxy detected. Bytes received: "+J.length),ra(vt),vt.M=!0,nt(11))}}else Sn(this.i,this.l,J,null),Xo(this,J);ot==4&&cn(this),this.o&&!this.J&&(ot==4?js(this.j,this):(this.o=!1,$e(this)))}else Ls(this.g),y==400&&0<J.indexOf("Unknown SID")?(this.s=3,nt(12)):(this.s=0,nt(13)),cn(this),Mr(this)}}}catch{}finally{}};function _l(u){return u.g?u.u=="GET"&&u.L!=2&&u.j.Ca:!1}function Oc(u,p){var y=u.C,w=p.indexOf(`
`,y);return w==-1?Ps:(y=Number(p.substring(y,w)),isNaN(y)?Go:(w+=1,w+y>p.length?Ps:(p=p.slice(w,w+y),u.C=w+y,p)))}Rn.prototype.cancel=function(){this.J=!0,cn(this)};function $e(u){u.S=Date.now()+u.I,vl(u,u.I)}function vl(u,p){if(u.B!=null)throw Error("WatchDog timer not null");u.B=In(R(u.ba,u),p)}function bi(u){u.B&&(f.clearTimeout(u.B),u.B=null)}Rn.prototype.ba=function(){this.B=null;const u=Date.now();0<=u-this.S?(Ko(this.i,this.A),this.L!=2&&(hr(),nt(17)),cn(this),this.s=2,Mr(this)):vl(this,this.S-u)};function Mr(u){u.j.G==0||u.J||js(u.j,u)}function cn(u){bi(u);var p=u.M;p&&typeof p.ma=="function"&&p.ma(),u.M=null,jo(u.U),u.g&&(p=u.g,u.g=null,p.abort(),p.ma())}function Xo(u,p){try{var y=u.j;if(y.G!=0&&(y.g==u||Bt(y.h,u))){if(!u.K&&Bt(y.h,u)&&y.G==3){try{var w=y.Da.g.parse(p)}catch{w=null}if(Array.isArray(w)&&w.length==3){var L=w;if(L[0]==0){e:if(!y.u){if(y.g)if(y.g.F+3e3<u.F)Us(y),Dn(y);else break e;Fs(y),nt(18)}}else y.za=L[1],0<y.za-y.T&&37500>L[2]&&y.F&&y.v==0&&!y.C&&(y.C=In(R(y.Za,y),6e3));if(1>=wl(y.h)&&y.ca){try{y.ca()}catch{}y.ca=void 0}}else gr(y,11)}else if((u.K||y.g==u)&&Us(y),!re(p))for(L=y.Da.g.parse(p),p=0;p<L.length;p++){let De=L[p];if(y.T=De[0],De=De[1],y.G==2)if(De[0]=="c"){y.K=De[1],y.ia=De[2];const vt=De[3];vt!=null&&(y.la=vt,y.j.info("VER="+y.la));const ot=De[4];ot!=null&&(y.Aa=ot,y.j.info("SVER="+y.Aa));const dn=De[5];dn!=null&&typeof dn=="number"&&0<dn&&(w=1.5*dn,y.L=w,y.j.info("backChannelRequestTimeoutMs_="+w)),w=y;const sn=u.g;if(sn){const Wi=sn.g?sn.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(Wi){var z=w.h;z.g||Wi.indexOf("spdy")==-1&&Wi.indexOf("quic")==-1&&Wi.indexOf("h2")==-1||(z.j=z.l,z.g=new Set,z.h&&(Jo(z,z.h),z.h=null))}if(w.D){const Bs=sn.g?sn.g.getResponseHeader("X-HTTP-Session-Id"):null;Bs&&(w.ya=Bs,ze(w.I,w.D,Bs))}}y.G=3,y.l&&y.l.ua(),y.ba&&(y.R=Date.now()-u.F,y.j.info("Handshake RTT: "+y.R+"ms")),w=y;var J=u;if(w.qa=xl(w,w.J?w.ia:null,w.W),J.K){Tl(w.h,J);var Ue=J,ft=w.L;ft&&(Ue.I=ft),Ue.B&&(bi(Ue),$e(Ue)),w.g=J}else $i(w);0<y.i.length&&qn(y)}else De[0]!="stop"&&De[0]!="close"||gr(y,7);else y.G==3&&(De[0]=="stop"||De[0]=="close"?De[0]=="stop"?gr(y,7):Rt(y):De[0]!="noop"&&y.l&&y.l.ta(De),y.v=0)}}hr(4)}catch{}}var El=class{constructor(u,p){this.g=u,this.map=p}};function Fi(u){this.l=u||10,f.PerformanceNavigationTiming?(u=f.performance.getEntriesByType("navigation"),u=0<u.length&&(u[0].nextHopProtocol=="hq"||u[0].nextHopProtocol=="h2")):u=!!(f.chrome&&f.chrome.loadTimes&&f.chrome.loadTimes()&&f.chrome.loadTimes().wasFetchedViaSpdy),this.j=u?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function tn(u){return u.h?!0:u.g?u.g.size>=u.j:!1}function wl(u){return u.h?1:u.g?u.g.size:0}function Bt(u,p){return u.h?u.h==p:u.g?u.g.has(p):!1}function Jo(u,p){u.g?u.g.add(p):u.h=p}function Tl(u,p){u.h&&u.h==p?u.h=null:u.g&&u.g.has(p)&&u.g.delete(p)}Fi.prototype.cancel=function(){if(this.i=Il(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const u of this.g.values())u.cancel();this.g.clear()}};function Il(u){if(u.h!=null)return u.i.concat(u.h.D);if(u.g!=null&&u.g.size!==0){let p=u.i;for(const y of u.g.values())p=p.concat(y.D);return p}return $(u.i)}function Ns(u){if(u.V&&typeof u.V=="function")return u.V();if(typeof Map<"u"&&u instanceof Map||typeof Set<"u"&&u instanceof Set)return Array.from(u.values());if(typeof u=="string")return u.split("");if(g(u)){for(var p=[],y=u.length,w=0;w<y;w++)p.push(u[w]);return p}p=[],y=0;for(w in u)p[y++]=u[w];return p}function Ds(u){if(u.na&&typeof u.na=="function")return u.na();if(!u.V||typeof u.V!="function"){if(typeof Map<"u"&&u instanceof Map)return Array.from(u.keys());if(!(typeof Set<"u"&&u instanceof Set)){if(g(u)||typeof u=="string"){var p=[];u=u.length;for(var y=0;y<u;y++)p.push(y);return p}p=[],y=0;for(const w in u)p[y++]=w;return p}}}function br(u,p){if(u.forEach&&typeof u.forEach=="function")u.forEach(p,void 0);else if(g(u)||typeof u=="string")Array.prototype.forEach.call(u,p,void 0);else for(var y=Ds(u),w=Ns(u),L=w.length,z=0;z<L;z++)p.call(void 0,w[z],y&&y[z],u)}var Ui=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function Vc(u,p){if(u){u=u.split("&");for(var y=0;y<u.length;y++){var w=u[y].indexOf("="),L=null;if(0<=w){var z=u[y].substring(0,w);L=u[y].substring(w+1)}else z=u[y];p(z,L?decodeURIComponent(L.replace(/\+/g," ")):"")}}}function dr(u){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,u instanceof dr){this.h=u.h,ji(this,u.j),this.o=u.o,this.g=u.g,Fr(this,u.s),this.l=u.l;var p=u.i,y=new $n;y.i=p.i,p.g&&(y.g=new Map(p.g),y.h=p.h),Ur(this,y),this.m=u.m}else u&&(p=String(u).match(Ui))?(this.h=!1,ji(this,p[1]||"",!0),this.o=ke(p[2]||""),this.g=ke(p[3]||"",!0),Fr(this,p[4]),this.l=ke(p[5]||"",!0),Ur(this,p[6]||"",!0),this.m=ke(p[7]||"")):(this.h=!1,this.i=new $n(null,this.h))}dr.prototype.toString=function(){var u=[],p=this.j;p&&u.push(zr(p,Os,!0),":");var y=this.g;return(y||p=="file")&&(u.push("//"),(p=this.o)&&u.push(zr(p,Os,!0),"@"),u.push(encodeURIComponent(String(y)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),y=this.s,y!=null&&u.push(":",String(y))),(y=this.l)&&(this.g&&y.charAt(0)!="/"&&u.push("/"),u.push(zr(y,y.charAt(0)=="/"?Rl:Al,!0))),(y=this.i.toString())&&u.push("?",y),(y=this.m)&&u.push("#",zr(y,Yo)),u.join("")};function nn(u){return new dr(u)}function ji(u,p,y){u.j=y?ke(p,!0):p,u.j&&(u.j=u.j.replace(/:$/,""))}function Fr(u,p){if(p){if(p=Number(p),isNaN(p)||0>p)throw Error("Bad port number "+p);u.s=p}else u.s=null}function Ur(u,p,y){p instanceof $n?(u.i=p,Wn(u.i,u.h)):(y||(p=zr(p,Cl)),u.i=new $n(p,u.h))}function ze(u,p,y){u.i.set(p,y)}function jr(u){return ze(u,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),u}function ke(u,p){return u?p?decodeURI(u.replace(/%25/g,"%2525")):decodeURIComponent(u):""}function zr(u,p,y){return typeof u=="string"?(u=encodeURI(u).replace(p,Sl),y&&(u=u.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),u):null}function Sl(u){return u=u.charCodeAt(0),"%"+(u>>4&15).toString(16)+(u&15).toString(16)}var Os=/[#\/\?@]/g,Al=/[#\?:]/g,Rl=/[#\?]/g,Cl=/[#\?@]/g,Yo=/#/g;function $n(u,p){this.h=this.g=null,this.i=u||null,this.j=!!p}function At(u){u.g||(u.g=new Map,u.h=0,u.i&&Vc(u.i,function(p,y){u.add(decodeURIComponent(p.replace(/\+/g," ")),y)}))}r=$n.prototype,r.add=function(u,p){At(this),this.i=null,u=hn(this,u);var y=this.g.get(u);return y||this.g.set(u,y=[]),y.push(p),this.h+=1,this};function Cn(u,p){At(u),p=hn(u,p),u.g.has(p)&&(u.i=null,u.h-=u.g.get(p).length,u.g.delete(p))}function Pn(u,p){return At(u),p=hn(u,p),u.g.has(p)}r.forEach=function(u,p){At(this),this.g.forEach(function(y,w){y.forEach(function(L){u.call(p,L,w,this)},this)},this)},r.na=function(){At(this);const u=Array.from(this.g.values()),p=Array.from(this.g.keys()),y=[];for(let w=0;w<p.length;w++){const L=u[w];for(let z=0;z<L.length;z++)y.push(p[w])}return y},r.V=function(u){At(this);let p=[];if(typeof u=="string")Pn(this,u)&&(p=p.concat(this.g.get(hn(this,u))));else{u=Array.from(this.g.values());for(let y=0;y<u.length;y++)p=p.concat(u[y])}return p},r.set=function(u,p){return At(this),this.i=null,u=hn(this,u),Pn(this,u)&&(this.h-=this.g.get(u).length),this.g.set(u,[p]),this.h+=1,this},r.get=function(u,p){return u?(u=this.V(u),0<u.length?String(u[0]):p):p};function Br(u,p,y){Cn(u,p),0<y.length&&(u.i=null,u.g.set(hn(u,p),$(y)),u.h+=y.length)}r.toString=function(){if(this.i)return this.i;if(!this.g)return"";const u=[],p=Array.from(this.g.keys());for(var y=0;y<p.length;y++){var w=p[y];const z=encodeURIComponent(String(w)),J=this.V(w);for(w=0;w<J.length;w++){var L=z;J[w]!==""&&(L+="="+encodeURIComponent(String(J[w]))),u.push(L)}}return this.i=u.join("&")};function hn(u,p){return p=String(p),u.j&&(p=p.toLowerCase()),p}function Wn(u,p){p&&!u.j&&(At(u),u.i=null,u.g.forEach(function(y,w){var L=w.toLowerCase();w!=L&&(Cn(this,w),Br(this,L,y))},u)),u.j=p}function xc(u,p){const y=new xi;if(f.Image){const w=new Image;w.onload=j(qt,y,"TestLoadImage: loaded",!0,p,w),w.onerror=j(qt,y,"TestLoadImage: error",!1,p,w),w.onabort=j(qt,y,"TestLoadImage: abort",!1,p,w),w.ontimeout=j(qt,y,"TestLoadImage: timeout",!1,p,w),f.setTimeout(function(){w.ontimeout&&w.ontimeout()},1e4),w.src=u}else p(!1)}function Pl(u,p){const y=new xi,w=new AbortController,L=setTimeout(()=>{w.abort(),qt(y,"TestPingServer: timeout",!1,p)},1e4);fetch(u,{signal:w.signal}).then(z=>{clearTimeout(L),z.ok?qt(y,"TestPingServer: ok",!0,p):qt(y,"TestPingServer: server error",!1,p)}).catch(()=>{clearTimeout(L),qt(y,"TestPingServer: error",!1,p)})}function qt(u,p,y,w,L){try{L&&(L.onload=null,L.onerror=null,L.onabort=null,L.ontimeout=null),w(y)}catch{}}function Lc(){this.g=new $o}function kl(u,p,y){const w=y||"";try{br(u,function(L,z){let J=L;_(L)&&(J=zo(L)),p.push(w+z+"="+encodeURIComponent(J))})}catch(L){throw p.push(w+"type="+encodeURIComponent("_badmap")),L}}function fr(u){this.l=u.Ub||null,this.j=u.eb||!1}B(fr,Oi),fr.prototype.g=function(){return new zi(this.l,this.j)},fr.prototype.i=function(u){return function(){return u}}({});function zi(u,p){ht.call(this),this.D=u,this.o=p,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}B(zi,ht),r=zi.prototype,r.open=function(u,p){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.B=u,this.A=p,this.readyState=1,Nn(this)},r.send=function(u){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const p={headers:this.u,method:this.B,credentials:this.m,cache:void 0};u&&(p.body=u),(this.D||f).fetch(new Request(this.A,p)).then(this.Sa.bind(this),this.ga.bind(this))},r.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,kn(this)),this.readyState=0},r.Sa=function(u){if(this.g&&(this.l=u,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=u.headers,this.readyState=2,Nn(this)),this.g&&(this.readyState=3,Nn(this),this.g)))if(this.responseType==="arraybuffer")u.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(typeof f.ReadableStream<"u"&&"body"in u){if(this.j=u.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;Nl(this)}else u.text().then(this.Ra.bind(this),this.ga.bind(this))};function Nl(u){u.j.read().then(u.Pa.bind(u)).catch(u.ga.bind(u))}r.Pa=function(u){if(this.g){if(this.o&&u.value)this.response.push(u.value);else if(!this.o){var p=u.value?u.value:new Uint8Array(0);(p=this.v.decode(p,{stream:!u.done}))&&(this.response=this.responseText+=p)}u.done?kn(this):Nn(this),this.readyState==3&&Nl(this)}},r.Ra=function(u){this.g&&(this.response=this.responseText=u,kn(this))},r.Qa=function(u){this.g&&(this.response=u,kn(this))},r.ga=function(){this.g&&kn(this)};function kn(u){u.readyState=4,u.l=null,u.j=null,u.v=null,Nn(u)}r.setRequestHeader=function(u,p){this.u.append(u,p)},r.getResponseHeader=function(u){return this.h&&this.h.get(u.toLowerCase())||""},r.getAllResponseHeaders=function(){if(!this.h)return"";const u=[],p=this.h.entries();for(var y=p.next();!y.done;)y=y.value,u.push(y[0]+": "+y[1]),y=p.next();return u.join(`\r
`)};function Nn(u){u.onreadystatechange&&u.onreadystatechange.call(u)}Object.defineProperty(zi.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(u){this.m=u?"include":"same-origin"}});function pr(u){let p="";return Re(u,function(y,w){p+=w,p+=":",p+=y,p+=`\r
`}),p}function $r(u,p,y){e:{for(w in y){var w=!1;break e}w=!0}w||(y=pr(y),typeof u=="string"?y!=null&&encodeURIComponent(String(y)):ze(u,p,y))}function Ge(u){ht.call(this),this.headers=new Map,this.o=u||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}B(Ge,ht);var Mc=/^https?$/i,Zo=["POST","PUT"];r=Ge.prototype,r.Ha=function(u){this.J=u},r.ea=function(u,p,y,w){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+u);p=p?p.toUpperCase():"GET",this.D=u,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():An.g(),this.v=this.o?Ts(this.o):Ts(An),this.g.onreadystatechange=R(this.Ea,this);try{this.B=!0,this.g.open(p,String(u),!0),this.B=!1}catch(z){Bi(this,z);return}if(u=y||"",y=new Map(this.headers),w)if(Object.getPrototypeOf(w)===Object.prototype)for(var L in w)y.set(L,w[L]);else if(typeof w.keys=="function"&&typeof w.get=="function")for(const z of w.keys())y.set(z,w.get(z));else throw Error("Unknown input type for opt_headers: "+String(w));w=Array.from(y.keys()).find(z=>z.toLowerCase()=="content-type"),L=f.FormData&&u instanceof f.FormData,!(0<=Array.prototype.indexOf.call(Zo,p,void 0))||w||L||y.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[z,J]of y)this.g.setRequestHeader(z,J);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{xs(this),this.u=!0,this.g.send(u),this.u=!1}catch(z){Bi(this,z)}};function Bi(u,p){u.h=!1,u.g&&(u.j=!0,u.g.abort(),u.j=!1),u.l=p,u.m=5,Vs(u),rn(u)}function Vs(u){u.A||(u.A=!0,dt(u,"complete"),dt(u,"error"))}r.abort=function(u){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=u||7,dt(this,"complete"),dt(this,"abort"),rn(this))},r.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),rn(this,!0)),Ge.aa.N.call(this)},r.Ea=function(){this.s||(this.B||this.u||this.j?ea(this):this.bb())},r.bb=function(){ea(this)};function ea(u){if(u.h&&typeof h<"u"&&(!u.v[1]||Kt(u)!=4||u.Z()!=2)){if(u.u&&Kt(u)==4)Fo(u.Ea,0,u);else if(dt(u,"readystatechange"),Kt(u)==4){u.h=!1;try{const J=u.Z();e:switch(J){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var p=!0;break e;default:p=!1}var y;if(!(y=p)){var w;if(w=J===0){var L=String(u.D).match(Ui)[1]||null;!L&&f.self&&f.self.location&&(L=f.self.location.protocol.slice(0,-1)),w=!Mc.test(L?L.toLowerCase():"")}y=w}if(y)dt(u,"complete"),dt(u,"success");else{u.m=6;try{var z=2<Kt(u)?u.g.statusText:""}catch{z=""}u.l=z+" ["+u.Z()+"]",Vs(u)}}finally{rn(u)}}}}function rn(u,p){if(u.g){xs(u);const y=u.g,w=u.v[0]?()=>{}:null;u.g=null,u.v=null,p||dt(u,"ready");try{y.onreadystatechange=w}catch{}}}function xs(u){u.I&&(f.clearTimeout(u.I),u.I=null)}r.isActive=function(){return!!this.g};function Kt(u){return u.g?u.g.readyState:0}r.Z=function(){try{return 2<Kt(this)?this.g.status:-1}catch{return-1}},r.oa=function(){try{return this.g?this.g.responseText:""}catch{return""}},r.Oa=function(u){if(this.g){var p=this.g.responseText;return u&&p.indexOf(u)==0&&(p=p.substring(u.length)),Bo(p)}};function ta(u){try{if(!u.g)return null;if("response"in u.g)return u.g.response;switch(u.H){case"":case"text":return u.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in u.g)return u.g.mozResponseArrayBuffer}return null}catch{return null}}function Ls(u){const p={};u=(u.g&&2<=Kt(u)&&u.g.getAllResponseHeaders()||"").split(`\r
`);for(let w=0;w<u.length;w++){if(re(u[w]))continue;var y=O(u[w]);const L=y[0];if(y=y[1],typeof y!="string")continue;y=y.trim();const z=p[L]||[];p[L]=z,z.push(y)}D(p,function(w){return w.join(", ")})}r.Ba=function(){return this.m},r.Ka=function(){return typeof this.l=="string"?this.l:String(this.l)};function Hn(u,p,y){return y&&y.internalChannelParams&&y.internalChannelParams[u]||p}function na(u){this.Aa=0,this.i=[],this.j=new xi,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=Hn("failFast",!1,u),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=Hn("baseRetryDelayMs",5e3,u),this.cb=Hn("retryDelaySeedMs",1e4,u),this.Wa=Hn("forwardChannelMaxRetries",2,u),this.wa=Hn("forwardChannelRequestTimeoutMs",2e4,u),this.pa=u&&u.xmlHttpFactory||void 0,this.Xa=u&&u.Tb||void 0,this.Ca=u&&u.useFetchStreams||!1,this.L=void 0,this.J=u&&u.supportsCrossDomainXhr||!1,this.K="",this.h=new Fi(u&&u.concurrentRequestLimit),this.Da=new Lc,this.P=u&&u.fastHandshake||!1,this.O=u&&u.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=u&&u.Rb||!1,u&&u.xa&&this.j.xa(),u&&u.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&u&&u.detectBufferingProxy||!1,this.ja=void 0,u&&u.longPollingTimeout&&0<u.longPollingTimeout&&(this.ja=u.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}r=na.prototype,r.la=8,r.G=1,r.connect=function(u,p,y,w){nt(0),this.W=u,this.H=p||{},y&&w!==void 0&&(this.H.OSID=y,this.H.OAID=w),this.F=this.X,this.I=xl(this,null,this.W),qn(this)};function Rt(u){if(Ms(u),u.G==3){var p=u.U++,y=nn(u.I);if(ze(y,"SID",u.K),ze(y,"RID",p),ze(y,"TYPE","terminate"),mr(u,y),p=new Rn(u,u.j,p),p.L=2,p.v=jr(nn(y)),y=!1,f.navigator&&f.navigator.sendBeacon)try{y=f.navigator.sendBeacon(p.v.toString(),"")}catch{}!y&&f.Image&&(new Image().src=p.v,y=!0),y||(p.g=Ll(p.j,null),p.g.ea(p.v)),p.F=Date.now(),$e(p)}Vl(u)}function Dn(u){u.g&&(ra(u),u.g.cancel(),u.g=null)}function Ms(u){Dn(u),u.u&&(f.clearTimeout(u.u),u.u=null),Us(u),u.h.cancel(),u.s&&(typeof u.s=="number"&&f.clearTimeout(u.s),u.s=null)}function qn(u){if(!tn(u.h)&&!u.s){u.s=!0;var p=u.Ga;je||ne(),Z||(je(),Z=!0),de.add(p,u),u.B=0}}function bc(u,p){return wl(u.h)>=u.h.j-(u.s?1:0)?!1:u.s?(u.i=p.D.concat(u.i),!0):u.G==1||u.G==2||u.B>=(u.Va?0:u.Wa)?!1:(u.s=In(R(u.Ga,u,p),Ol(u,u.B)),u.B++,!0)}r.Ga=function(u){if(this.s)if(this.s=null,this.G==1){if(!u){this.U=Math.floor(1e5*Math.random()),u=this.U++;const L=new Rn(this,this.j,u);let z=this.o;if(this.S&&(z?(z=S(z),k(z,this.S)):z=this.S),this.m!==null||this.O||(L.H=z,z=null),this.P)e:{for(var p=0,y=0;y<this.i.length;y++){t:{var w=this.i[y];if("__data__"in w.map&&(w=w.map.__data__,typeof w=="string")){w=w.length;break t}w=void 0}if(w===void 0)break;if(p+=w,4096<p){p=y;break e}if(p===4096||y===this.i.length-1){p=y+1;break e}}p=1e3}else p=1e3;p=Wr(this,L,p),y=nn(this.I),ze(y,"RID",u),ze(y,"CVER",22),this.D&&ze(y,"X-HTTP-Session-Id",this.D),mr(this,y),z&&(this.O?p="headers="+encodeURIComponent(String(pr(z)))+"&"+p:this.m&&$r(y,this.m,z)),Jo(this.h,L),this.Ua&&ze(y,"TYPE","init"),this.P?(ze(y,"$req",p),ze(y,"SID","null"),L.T=!0,ks(L,y,null)):ks(L,y,p),this.G=2}}else this.G==3&&(u?bs(this,u):this.i.length==0||tn(this.h)||bs(this))};function bs(u,p){var y;p?y=p.l:y=u.U++;const w=nn(u.I);ze(w,"SID",u.K),ze(w,"RID",y),ze(w,"AID",u.T),mr(u,w),u.m&&u.o&&$r(w,u.m,u.o),y=new Rn(u,u.j,y,u.B+1),u.m===null&&(y.H=u.o),p&&(u.i=p.D.concat(u.i)),p=Wr(u,y,1e3),y.I=Math.round(.5*u.wa)+Math.round(.5*u.wa*Math.random()),Jo(u.h,y),ks(y,w,p)}function mr(u,p){u.H&&Re(u.H,function(y,w){ze(p,w,y)}),u.l&&br({},function(y,w){ze(p,w,y)})}function Wr(u,p,y){y=Math.min(u.i.length,y);var w=u.l?R(u.l.Na,u.l,u):null;e:{var L=u.i;let z=-1;for(;;){const J=["count="+y];z==-1?0<y?(z=L[0].g,J.push("ofs="+z)):z=0:J.push("ofs="+z);let Ue=!0;for(let ft=0;ft<y;ft++){let De=L[ft].g;const vt=L[ft].map;if(De-=z,0>De)z=Math.max(0,L[ft].g-100),Ue=!1;else try{kl(vt,J,"req"+De+"_")}catch{w&&w(vt)}}if(Ue){w=J.join("&");break e}}}return u=u.i.splice(0,y),p.D=u,w}function $i(u){if(!u.g&&!u.u){u.Y=1;var p=u.Fa;je||ne(),Z||(je(),Z=!0),de.add(p,u),u.v=0}}function Fs(u){return u.g||u.u||3<=u.v?!1:(u.Y++,u.u=In(R(u.Fa,u),Ol(u,u.v)),u.v++,!0)}r.Fa=function(){if(this.u=null,Dl(this),this.ba&&!(this.M||this.g==null||0>=this.R)){var u=2*this.R;this.j.info("BP detection timer enabled: "+u),this.A=In(R(this.ab,this),u)}},r.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,nt(10),Dn(this),Dl(this))};function ra(u){u.A!=null&&(f.clearTimeout(u.A),u.A=null)}function Dl(u){u.g=new Rn(u,u.j,"rpc",u.Y),u.m===null&&(u.g.H=u.o),u.g.O=0;var p=nn(u.qa);ze(p,"RID","rpc"),ze(p,"SID",u.K),ze(p,"AID",u.T),ze(p,"CI",u.F?"0":"1"),!u.F&&u.ja&&ze(p,"TO",u.ja),ze(p,"TYPE","xmlhttp"),mr(u,p),u.m&&u.o&&$r(p,u.m,u.o),u.L&&(u.g.I=u.L);var y=u.g;u=u.ia,y.L=1,y.v=jr(nn(p)),y.m=null,y.P=!0,Qo(y,u)}r.Za=function(){this.C!=null&&(this.C=null,Dn(this),Fs(this),nt(19))};function Us(u){u.C!=null&&(f.clearTimeout(u.C),u.C=null)}function js(u,p){var y=null;if(u.g==p){Us(u),ra(u),u.g=null;var w=2}else if(Bt(u.h,p))y=p.D,Tl(u.h,p),w=1;else return;if(u.G!=0){if(p.o)if(w==1){y=p.m?p.m.length:0,p=Date.now()-p.F;var L=u.B;w=Vi(),dt(w,new As(w,y)),qn(u)}else $i(u);else if(L=p.s,L==3||L==0&&0<p.X||!(w==1&&bc(u,p)||w==2&&Fs(u)))switch(y&&0<y.length&&(p=u.h,p.i=p.i.concat(y)),L){case 1:gr(u,5);break;case 4:gr(u,10);break;case 3:gr(u,6);break;default:gr(u,2)}}}function Ol(u,p){let y=u.Ta+Math.floor(Math.random()*u.cb);return u.isActive()||(y*=2),y*p}function gr(u,p){if(u.j.info("Error code "+p),p==2){var y=R(u.fb,u),w=u.Xa;const L=!w;w=new dr(w||"//www.google.com/images/cleardot.gif"),f.location&&f.location.protocol=="http"||ji(w,"https"),jr(w),L?xc(w.toString(),y):Pl(w.toString(),y)}else nt(2);u.G=0,u.l&&u.l.sa(p),Vl(u),Ms(u)}r.fb=function(u){u?(this.j.info("Successfully pinged google.com"),nt(2)):(this.j.info("Failed to ping google.com"),nt(1))};function Vl(u){if(u.G=0,u.ka=[],u.l){const p=Il(u.h);(p.length!=0||u.i.length!=0)&&(F(u.ka,p),F(u.ka,u.i),u.h.i.length=0,$(u.i),u.i.length=0),u.l.ra()}}function xl(u,p,y){var w=y instanceof dr?nn(y):new dr(y);if(w.g!="")p&&(w.g=p+"."+w.g),Fr(w,w.s);else{var L=f.location;w=L.protocol,p=p?p+"."+L.hostname:L.hostname,L=+L.port;var z=new dr(null);w&&ji(z,w),p&&(z.g=p),L&&Fr(z,L),y&&(z.l=y),w=z}return y=u.D,p=u.ya,y&&p&&ze(w,y,p),ze(w,"VER",u.la),mr(u,w),w}function Ll(u,p,y){if(p&&!u.J)throw Error("Can't create secondary domain capable XhrIo object.");return p=u.Ca&&!u.pa?new Ge(new fr({eb:y})):new Ge(u.pa),p.Ha(u.J),p}r.isActive=function(){return!!this.l&&this.l.isActive(this)};function ia(){}r=ia.prototype,r.ua=function(){},r.ta=function(){},r.sa=function(){},r.ra=function(){},r.isActive=function(){return!0},r.Na=function(){};function zs(){}zs.prototype.g=function(u,p){return new $t(u,p)};function $t(u,p){ht.call(this),this.g=new na(p),this.l=u,this.h=p&&p.messageUrlParams||null,u=p&&p.messageHeaders||null,p&&p.clientProtocolHeaderRequired&&(u?u["X-Client-Protocol"]="webchannel":u={"X-Client-Protocol":"webchannel"}),this.g.o=u,u=p&&p.initMessageHeaders||null,p&&p.messageContentType&&(u?u["X-WebChannel-Content-Type"]=p.messageContentType:u={"X-WebChannel-Content-Type":p.messageContentType}),p&&p.va&&(u?u["X-WebChannel-Client-Profile"]=p.va:u={"X-WebChannel-Client-Profile":p.va}),this.g.S=u,(u=p&&p.Sb)&&!re(u)&&(this.g.m=u),this.v=p&&p.supportsCrossDomainXhr||!1,this.u=p&&p.sendRawJson||!1,(p=p&&p.httpSessionIdParam)&&!re(p)&&(this.g.D=p,u=this.h,u!==null&&p in u&&(u=this.h,p in u&&delete u[p])),this.j=new Kn(this)}B($t,ht),$t.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},$t.prototype.close=function(){Rt(this.g)},$t.prototype.o=function(u){var p=this.g;if(typeof u=="string"){var y={};y.__data__=u,u=y}else this.u&&(y={},y.__data__=zo(u),u=y);p.i.push(new El(p.Ya++,u)),p.G==3&&qn(p)},$t.prototype.N=function(){this.g.l=null,delete this.j,Rt(this.g),delete this.g,$t.aa.N.call(this)};function Ml(u){zn.call(this),u.__headers__&&(this.headers=u.__headers__,this.statusCode=u.__status__,delete u.__headers__,delete u.__status__);var p=u.__sm__;if(p){e:{for(const y in p){u=y;break e}u=void 0}(this.i=u)&&(u=this.i,p=p!==null&&u in p?p[u]:void 0),this.data=p}else this.data=u}B(Ml,zn);function bl(){Ss.call(this),this.status=1}B(bl,Ss);function Kn(u){this.g=u}B(Kn,ia),Kn.prototype.ua=function(){dt(this.g,"a")},Kn.prototype.ta=function(u){dt(this.g,new Ml(u))},Kn.prototype.sa=function(u){dt(this.g,new bl)},Kn.prototype.ra=function(){dt(this.g,"b")},zs.prototype.createWebChannel=zs.prototype.g,$t.prototype.send=$t.prototype.o,$t.prototype.open=$t.prototype.m,$t.prototype.close=$t.prototype.close,ev=function(){return new zs},Z_=function(){return Vi()},Y_=Bn,Vd={mb:0,pb:1,qb:2,Jb:3,Ob:4,Lb:5,Mb:6,Kb:7,Ib:8,Nb:9,PROXY:10,NOPROXY:11,Gb:12,Cb:13,Db:14,Bb:15,Eb:16,Fb:17,ib:18,hb:19,jb:20},Cs.NO_ERROR=0,Cs.TIMEOUT=8,Cs.HTTP_ERROR=6,zu=Cs,gl.COMPLETE="complete",J_=gl,Is.EventType=un,un.OPEN="a",un.CLOSE="b",un.ERROR="c",un.MESSAGE="d",ht.prototype.listen=ht.prototype.K,Oa=Is,Ge.prototype.listenOnce=Ge.prototype.L,Ge.prototype.getLastError=Ge.prototype.Ka,Ge.prototype.getLastErrorCode=Ge.prototype.Ba,Ge.prototype.getStatus=Ge.prototype.Z,Ge.prototype.getResponseJson=Ge.prototype.Oa,Ge.prototype.getResponseText=Ge.prototype.oa,Ge.prototype.send=Ge.prototype.ea,Ge.prototype.setWithCredentials=Ge.prototype.Ha,X_=Ge}).apply(typeof Ou<"u"?Ou:typeof self<"u"?self:typeof window<"u"?window:{});const Hg="@firebase/firestore",qg="4.8.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ut{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}Ut.UNAUTHENTICATED=new Ut(null),Ut.GOOGLE_CREDENTIALS=new Ut("google-credentials-uid"),Ut.FIRST_PARTY=new Ut("first-party-uid"),Ut.MOCK_USER=new Ut("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let No="11.10.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const cs=new ef("@firebase/firestore");function uo(){return cs.logLevel}function te(r,...e){if(cs.logLevel<=Ce.DEBUG){const t=e.map(ff);cs.debug(`Firestore (${No}): ${r}`,...t)}}function Dr(r,...e){if(cs.logLevel<=Ce.ERROR){const t=e.map(ff);cs.error(`Firestore (${No}): ${r}`,...t)}}function _i(r,...e){if(cs.logLevel<=Ce.WARN){const t=e.map(ff);cs.warn(`Firestore (${No}): ${r}`,...t)}}function ff(r){if(typeof r=="string")return r;try{/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/return function(t){return JSON.stringify(t)}(r)}catch{return r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _e(r,e,t){let s="Unexpected state";typeof e=="string"?s=e:t=e,tv(r,s,t)}function tv(r,e,t){let s=`FIRESTORE (${No}) INTERNAL ASSERTION FAILED: ${e} (ID: ${r.toString(16)})`;if(t!==void 0)try{s+=" CONTEXT: "+JSON.stringify(t)}catch{s+=" CONTEXT: "+t}throw Dr(s),new Error(s)}function Fe(r,e,t,s){let o="Unexpected state";typeof t=="string"?o=t:s=t,r||tv(e,o,s)}function we(r,e){return r}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const G={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class ce extends Vr{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yi{constructor(){this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nv{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class M1{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable(()=>t(Ut.UNAUTHENTICATED))}shutdown(){}}class b1{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable(()=>t(this.token.user))}shutdown(){this.changeListener=null}}class F1{constructor(e){this.t=e,this.currentUser=Ut.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,t){Fe(this.o===void 0,42304);let s=this.i;const o=g=>this.i!==s?(s=this.i,t(g)):Promise.resolve();let l=new yi;this.o=()=>{this.i++,this.currentUser=this.u(),l.resolve(),l=new yi,e.enqueueRetryable(()=>o(this.currentUser))};const h=()=>{const g=l;e.enqueueRetryable(async()=>{await g.promise,await o(this.currentUser)})},f=g=>{te("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=g,this.o&&(this.auth.addAuthTokenListener(this.o),h())};this.t.onInit(g=>f(g)),setTimeout(()=>{if(!this.auth){const g=this.t.getImmediate({optional:!0});g?f(g):(te("FirebaseAuthCredentialsProvider","Auth not yet detected"),l.resolve(),l=new yi)}},0),h()}getToken(){const e=this.i,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then(s=>this.i!==e?(te("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):s?(Fe(typeof s.accessToken=="string",31837,{l:s}),new nv(s.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return Fe(e===null||typeof e=="string",2055,{h:e}),new Ut(e)}}class U1{constructor(e,t,s){this.P=e,this.T=t,this.I=s,this.type="FirstParty",this.user=Ut.FIRST_PARTY,this.A=new Map}R(){return this.I?this.I():null}get headers(){this.A.set("X-Goog-AuthUser",this.P);const e=this.R();return e&&this.A.set("Authorization",e),this.T&&this.A.set("X-Goog-Iam-Authorization-Token",this.T),this.A}}class j1{constructor(e,t,s){this.P=e,this.T=t,this.I=s}getToken(){return Promise.resolve(new U1(this.P,this.T,this.I))}start(e,t){e.enqueueRetryable(()=>t(Ut.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class Kg{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class z1{constructor(e,t){this.V=t,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,vn(e)&&e.settings.appCheckToken&&(this.p=e.settings.appCheckToken)}start(e,t){Fe(this.o===void 0,3512);const s=l=>{l.error!=null&&te("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${l.error.message}`);const h=l.token!==this.m;return this.m=l.token,te("FirebaseAppCheckTokenProvider",`Received ${h?"new":"existing"} token.`),h?t(l.token):Promise.resolve()};this.o=l=>{e.enqueueRetryable(()=>s(l))};const o=l=>{te("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=l,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit(l=>o(l)),setTimeout(()=>{if(!this.appCheck){const l=this.V.getImmediate({optional:!0});l?o(l):te("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){if(this.p)return Promise.resolve(new Kg(this.p));const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(t=>t?(Fe(typeof t.token=="string",44558,{tokenResult:t}),this.m=t.token,new Kg(t.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function B1(r){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(r);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let s=0;s<r;s++)t[s]=Math.floor(256*Math.random());return t}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function rv(){return new TextEncoder}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pf{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=62*Math.floor(4.129032258064516);let s="";for(;s.length<20;){const o=B1(40);for(let l=0;l<o.length;++l)s.length<20&&o[l]<t&&(s+=e.charAt(o[l]%62))}return s}}function Ie(r,e){return r<e?-1:r>e?1:0}function xd(r,e){let t=0;for(;t<r.length&&t<e.length;){const s=r.codePointAt(t),o=e.codePointAt(t);if(s!==o){if(s<128&&o<128)return Ie(s,o);{const l=rv(),h=$1(l.encode(Gg(r,t)),l.encode(Gg(e,t)));return h!==0?h:Ie(s,o)}}t+=s>65535?2:1}return Ie(r.length,e.length)}function Gg(r,e){return r.codePointAt(e)>65535?r.substring(e,e+2):r.substring(e,e+1)}function $1(r,e){for(let t=0;t<r.length&&t<e.length;++t)if(r[t]!==e[t])return Ie(r[t],e[t]);return Ie(r.length,e.length)}function Eo(r,e,t){return r.length===e.length&&r.every((s,o)=>t(s,e[o]))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Qg="__name__";class Yn{constructor(e,t,s){t===void 0?t=0:t>e.length&&_e(637,{offset:t,range:e.length}),s===void 0?s=e.length-t:s>e.length-t&&_e(1746,{length:s,range:e.length-t}),this.segments=e,this.offset=t,this.len=s}get length(){return this.len}isEqual(e){return Yn.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof Yn?e.forEach(s=>{t.push(s)}):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,s=this.limit();t<s;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const s=Math.min(e.length,t.length);for(let o=0;o<s;o++){const l=Yn.compareSegments(e.get(o),t.get(o));if(l!==0)return l}return Ie(e.length,t.length)}static compareSegments(e,t){const s=Yn.isNumericId(e),o=Yn.isNumericId(t);return s&&!o?-1:!s&&o?1:s&&o?Yn.extractNumericId(e).compare(Yn.extractNumericId(t)):xd(e,t)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return gi.fromString(e.substring(4,e.length-2))}}class Ye extends Yn{construct(e,t,s){return new Ye(e,t,s)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const s of e){if(s.indexOf("//")>=0)throw new ce(G.INVALID_ARGUMENT,`Invalid segment (${s}). Paths must not contain // in them.`);t.push(...s.split("/").filter(o=>o.length>0))}return new Ye(t)}static emptyPath(){return new Ye([])}}const W1=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class Nt extends Yn{construct(e,t,s){return new Nt(e,t,s)}static isValidIdentifier(e){return W1.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),Nt.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===Qg}static keyField(){return new Nt([Qg])}static fromServerFormat(e){const t=[];let s="",o=0;const l=()=>{if(s.length===0)throw new ce(G.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(s),s=""};let h=!1;for(;o<e.length;){const f=e[o];if(f==="\\"){if(o+1===e.length)throw new ce(G.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const g=e[o+1];if(g!=="\\"&&g!=="."&&g!=="`")throw new ce(G.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);s+=g,o+=2}else f==="`"?(h=!h,o++):f!=="."||h?(s+=f,o++):(l(),o++)}if(l(),h)throw new ce(G.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new Nt(t)}static emptyPath(){return new Nt([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class me{constructor(e){this.path=e}static fromPath(e){return new me(Ye.fromString(e))}static fromName(e){return new me(Ye.fromString(e).popFirst(5))}static empty(){return new me(Ye.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&Ye.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return Ye.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new me(new Ye(e.slice()))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function H1(r,e,t){if(!t)throw new ce(G.INVALID_ARGUMENT,`Function ${r}() cannot be called with an empty ${e}.`)}function q1(r,e,t,s){if(e===!0&&s===!0)throw new ce(G.INVALID_ARGUMENT,`${r} and ${t} cannot be used together.`)}function Xg(r){if(!me.isDocumentKey(r))throw new ce(G.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${r} has ${r.length}.`)}function iv(r){return typeof r=="object"&&r!==null&&(Object.getPrototypeOf(r)===Object.prototype||Object.getPrototypeOf(r)===null)}function mf(r){if(r===void 0)return"undefined";if(r===null)return"null";if(typeof r=="string")return r.length>20&&(r=`${r.substring(0,20)}...`),JSON.stringify(r);if(typeof r=="number"||typeof r=="boolean")return""+r;if(typeof r=="object"){if(r instanceof Array)return"an array";{const e=function(s){return s.constructor?s.constructor.name:null}(r);return e?`a custom ${e} object`:"an object"}}return typeof r=="function"?"a function":_e(12329,{type:typeof r})}function Ga(r,e){if("_delegate"in r&&(r=r._delegate),!(r instanceof e)){if(e.name===r.constructor.name)throw new ce(G.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=mf(r);throw new ce(G.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return r}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ct(r,e){const t={typeString:r};return e&&(t.value=e),t}function cl(r,e){if(!iv(r))throw new ce(G.INVALID_ARGUMENT,"JSON must be an object");let t;for(const s in e)if(e[s]){const o=e[s].typeString,l="value"in e[s]?{value:e[s].value}:void 0;if(!(s in r)){t=`JSON missing required field: '${s}'`;break}const h=r[s];if(o&&typeof h!==o){t=`JSON field '${s}' must be a ${o}.`;break}if(l!==void 0&&h!==l.value){t=`Expected '${s}' field to equal '${l.value}'`;break}}if(t)throw new ce(G.INVALID_ARGUMENT,t);return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Jg=-62135596800,Yg=1e6;class Ke{static now(){return Ke.fromMillis(Date.now())}static fromDate(e){return Ke.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),s=Math.floor((e-1e3*t)*Yg);return new Ke(t,s)}constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new ce(G.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new ce(G.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<Jg)throw new ce(G.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new ce(G.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/Yg}_compareTo(e){return this.seconds===e.seconds?Ie(this.nanoseconds,e.nanoseconds):Ie(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:Ke._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(cl(e,Ke._jsonSchema))return new Ke(e.seconds,e.nanoseconds)}valueOf(){const e=this.seconds-Jg;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}Ke._jsonSchemaVersion="firestore/timestamp/1.0",Ke._jsonSchema={type:ct("string",Ke._jsonSchemaVersion),seconds:ct("number"),nanoseconds:ct("number")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ee{static fromTimestamp(e){return new Ee(e)}static min(){return new Ee(new Ke(0,0))}static max(){return new Ee(new Ke(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Qa=-1;function K1(r,e){const t=r.toTimestamp().seconds,s=r.toTimestamp().nanoseconds+1,o=Ee.fromTimestamp(s===1e9?new Ke(t+1,0):new Ke(t,s));return new vi(o,me.empty(),e)}function G1(r){return new vi(r.readTime,r.key,Qa)}class vi{constructor(e,t,s){this.readTime=e,this.documentKey=t,this.largestBatchId=s}static min(){return new vi(Ee.min(),me.empty(),Qa)}static max(){return new vi(Ee.max(),me.empty(),Qa)}}function Q1(r,e){let t=r.readTime.compareTo(e.readTime);return t!==0?t:(t=me.comparator(r.documentKey,e.documentKey),t!==0?t:Ie(r.largestBatchId,e.largestBatchId))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const X1="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class J1{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Do(r){if(r.code!==G.FAILED_PRECONDITION||r.message!==X1)throw r;te("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class W{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)},t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)})}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&_e(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new W((s,o)=>{this.nextCallback=l=>{this.wrapSuccess(e,l).next(s,o)},this.catchCallback=l=>{this.wrapFailure(t,l).next(s,o)}})}toPromise(){return new Promise((e,t)=>{this.next(e,t)})}wrapUserFunction(e){try{const t=e();return t instanceof W?t:W.resolve(t)}catch(t){return W.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction(()=>e(t)):W.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction(()=>e(t)):W.reject(t)}static resolve(e){return new W((t,s)=>{t(e)})}static reject(e){return new W((t,s)=>{s(e)})}static waitFor(e){return new W((t,s)=>{let o=0,l=0,h=!1;e.forEach(f=>{++o,f.next(()=>{++l,h&&l===o&&t()},g=>s(g))}),h=!0,l===o&&t()})}static or(e){let t=W.resolve(!1);for(const s of e)t=t.next(o=>o?W.resolve(o):s());return t}static forEach(e,t){const s=[];return e.forEach((o,l)=>{s.push(t.call(this,o,l))}),this.waitFor(s)}static mapArray(e,t){return new W((s,o)=>{const l=e.length,h=new Array(l);let f=0;for(let g=0;g<l;g++){const _=g;t(e[_]).next(E=>{h[_]=E,++f,f===l&&s(h)},E=>o(E))}})}static doWhile(e,t){return new W((s,o)=>{const l=()=>{e()===!0?t().next(()=>{l()},o):s()};l()})}}function Y1(r){const e=r.match(/Android ([\d.]+)/i),t=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(t)}function Oo(r){return r.name==="IndexedDbTransactionError"}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vc{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=s=>this._e(s),this.ae=s=>t.writeSequenceNumber(s))}_e(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.ae&&this.ae(e),e}}vc.ue=-1;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const gf=-1;function Ec(r){return r==null}function nc(r){return r===0&&1/r==-1/0}function Z1(r){return typeof r=="number"&&Number.isInteger(r)&&!nc(r)&&r<=Number.MAX_SAFE_INTEGER&&r>=Number.MIN_SAFE_INTEGER}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const sv="";function eA(r){let e="";for(let t=0;t<r.length;t++)e.length>0&&(e=Zg(e)),e=tA(r.get(t),e);return Zg(e)}function tA(r,e){let t=e;const s=r.length;for(let o=0;o<s;o++){const l=r.charAt(o);switch(l){case"\0":t+="";break;case sv:t+="";break;default:t+=l}}return t}function Zg(r){return r+sv+""}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ey(r){let e=0;for(const t in r)Object.prototype.hasOwnProperty.call(r,t)&&e++;return e}function fs(r,e){for(const t in r)Object.prototype.hasOwnProperty.call(r,t)&&e(t,r[t])}function ov(r){for(const e in r)if(Object.prototype.hasOwnProperty.call(r,e))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ze{constructor(e,t){this.comparator=e,this.root=t||kt.EMPTY}insert(e,t){return new Ze(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,kt.BLACK,null,null))}remove(e){return new Ze(this.comparator,this.root.remove(e,this.comparator).copy(null,null,kt.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const s=this.comparator(e,t.key);if(s===0)return t.value;s<0?t=t.left:s>0&&(t=t.right)}return null}indexOf(e){let t=0,s=this.root;for(;!s.isEmpty();){const o=this.comparator(e,s.key);if(o===0)return t+s.left.size;o<0?s=s.left:(t+=s.left.size+1,s=s.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((t,s)=>(e(t,s),!1))}toString(){const e=[];return this.inorderTraversal((t,s)=>(e.push(`${t}:${s}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new Vu(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new Vu(this.root,e,this.comparator,!1)}getReverseIterator(){return new Vu(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new Vu(this.root,e,this.comparator,!0)}}class Vu{constructor(e,t,s,o){this.isReverse=o,this.nodeStack=[];let l=1;for(;!e.isEmpty();)if(l=t?s(e.key,t):1,t&&o&&(l*=-1),l<0)e=this.isReverse?e.left:e.right;else{if(l===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class kt{constructor(e,t,s,o,l){this.key=e,this.value=t,this.color=s??kt.RED,this.left=o??kt.EMPTY,this.right=l??kt.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,s,o,l){return new kt(e??this.key,t??this.value,s??this.color,o??this.left,l??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,s){let o=this;const l=s(e,o.key);return o=l<0?o.copy(null,null,null,o.left.insert(e,t,s),null):l===0?o.copy(null,t,null,null,null):o.copy(null,null,null,null,o.right.insert(e,t,s)),o.fixUp()}removeMin(){if(this.left.isEmpty())return kt.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let s,o=this;if(t(e,o.key)<0)o.left.isEmpty()||o.left.isRed()||o.left.left.isRed()||(o=o.moveRedLeft()),o=o.copy(null,null,null,o.left.remove(e,t),null);else{if(o.left.isRed()&&(o=o.rotateRight()),o.right.isEmpty()||o.right.isRed()||o.right.left.isRed()||(o=o.moveRedRight()),t(e,o.key)===0){if(o.right.isEmpty())return kt.EMPTY;s=o.right.min(),o=o.copy(s.key,s.value,null,null,o.right.removeMin())}o=o.copy(null,null,null,null,o.right.remove(e,t))}return o.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,kt.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,kt.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw _e(43730,{key:this.key,value:this.value});if(this.right.isRed())throw _e(14113,{key:this.key,value:this.value});const e=this.left.check();if(e!==this.right.check())throw _e(27949);return e+(this.isRed()?0:1)}}kt.EMPTY=null,kt.RED=!0,kt.BLACK=!1;kt.EMPTY=new class{constructor(){this.size=0}get key(){throw _e(57766)}get value(){throw _e(16141)}get color(){throw _e(16727)}get left(){throw _e(29726)}get right(){throw _e(36894)}copy(e,t,s,o,l){return this}insert(e,t,s){return new kt(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yt{constructor(e){this.comparator=e,this.data=new Ze(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((t,s)=>(e(t),!1))}forEachInRange(e,t){const s=this.data.getIteratorFrom(e[0]);for(;s.hasNext();){const o=s.getNext();if(this.comparator(o.key,e[1])>=0)return;t(o.key)}}forEachWhile(e,t){let s;for(s=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();s.hasNext();)if(!e(s.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new ty(this.data.getIterator())}getIteratorFrom(e){return new ty(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach(s=>{t=t.add(s)}),t}isEqual(e){if(!(e instanceof yt)||this.size!==e.size)return!1;const t=this.data.getIterator(),s=e.data.getIterator();for(;t.hasNext();){const o=t.getNext().key,l=s.getNext().key;if(this.comparator(o,l)!==0)return!1}return!0}toArray(){const e=[];return this.forEach(t=>{e.push(t)}),e}toString(){const e=[];return this.forEach(t=>e.push(t)),"SortedSet("+e.toString()+")"}copy(e){const t=new yt(this.comparator);return t.data=e,t}}class ty{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Un{constructor(e){this.fields=e,e.sort(Nt.comparator)}static empty(){return new Un([])}unionWith(e){let t=new yt(Nt.comparator);for(const s of this.fields)t=t.add(s);for(const s of e)t=t.add(s);return new Un(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return Eo(this.fields,e.fields,(t,s)=>t.isEqual(s))}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class av extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dt{constructor(e){this.binaryString=e}static fromBase64String(e){const t=function(o){try{return atob(o)}catch(l){throw typeof DOMException<"u"&&l instanceof DOMException?new av("Invalid base64 string: "+l):l}}(e);return new Dt(t)}static fromUint8Array(e){const t=function(o){let l="";for(let h=0;h<o.length;++h)l+=String.fromCharCode(o[h]);return l}(e);return new Dt(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(t){return btoa(t)}(this.binaryString)}toUint8Array(){return function(t){const s=new Uint8Array(t.length);for(let o=0;o<t.length;o++)s[o]=t.charCodeAt(o);return s}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return Ie(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}Dt.EMPTY_BYTE_STRING=new Dt("");const nA=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function Ei(r){if(Fe(!!r,39018),typeof r=="string"){let e=0;const t=nA.exec(r);if(Fe(!!t,46558,{timestamp:r}),t[1]){let o=t[1];o=(o+"000000000").substr(0,9),e=Number(o)}const s=new Date(r);return{seconds:Math.floor(s.getTime()/1e3),nanos:e}}return{seconds:it(r.seconds),nanos:it(r.nanos)}}function it(r){return typeof r=="number"?r:typeof r=="string"?Number(r):0}function wi(r){return typeof r=="string"?Dt.fromBase64String(r):Dt.fromUint8Array(r)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const lv="server_timestamp",uv="__type__",cv="__previous_value__",hv="__local_write_time__";function yf(r){var e,t;return((t=(((e=r?.mapValue)===null||e===void 0?void 0:e.fields)||{})[uv])===null||t===void 0?void 0:t.stringValue)===lv}function wc(r){const e=r.mapValue.fields[cv];return yf(e)?wc(e):e}function Xa(r){const e=Ei(r.mapValue.fields[hv].timestampValue);return new Ke(e.seconds,e.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rA{constructor(e,t,s,o,l,h,f,g,_,E){this.databaseId=e,this.appId=t,this.persistenceKey=s,this.host=o,this.ssl=l,this.forceLongPolling=h,this.autoDetectLongPolling=f,this.longPollingOptions=g,this.useFetchStreams=_,this.isUsingEmulator=E}}const rc="(default)";class Ja{constructor(e,t){this.projectId=e,this.database=t||rc}static empty(){return new Ja("","")}get isDefaultDatabase(){return this.database===rc}isEqual(e){return e instanceof Ja&&e.projectId===this.projectId&&e.database===this.database}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dv="__type__",iA="__max__",xu={mapValue:{}},fv="__vector__",ic="value";function Ti(r){return"nullValue"in r?0:"booleanValue"in r?1:"integerValue"in r||"doubleValue"in r?2:"timestampValue"in r?3:"stringValue"in r?5:"bytesValue"in r?6:"referenceValue"in r?7:"geoPointValue"in r?8:"arrayValue"in r?9:"mapValue"in r?yf(r)?4:oA(r)?9007199254740991:sA(r)?10:11:_e(28295,{value:r})}function sr(r,e){if(r===e)return!0;const t=Ti(r);if(t!==Ti(e))return!1;switch(t){case 0:case 9007199254740991:return!0;case 1:return r.booleanValue===e.booleanValue;case 4:return Xa(r).isEqual(Xa(e));case 3:return function(o,l){if(typeof o.timestampValue=="string"&&typeof l.timestampValue=="string"&&o.timestampValue.length===l.timestampValue.length)return o.timestampValue===l.timestampValue;const h=Ei(o.timestampValue),f=Ei(l.timestampValue);return h.seconds===f.seconds&&h.nanos===f.nanos}(r,e);case 5:return r.stringValue===e.stringValue;case 6:return function(o,l){return wi(o.bytesValue).isEqual(wi(l.bytesValue))}(r,e);case 7:return r.referenceValue===e.referenceValue;case 8:return function(o,l){return it(o.geoPointValue.latitude)===it(l.geoPointValue.latitude)&&it(o.geoPointValue.longitude)===it(l.geoPointValue.longitude)}(r,e);case 2:return function(o,l){if("integerValue"in o&&"integerValue"in l)return it(o.integerValue)===it(l.integerValue);if("doubleValue"in o&&"doubleValue"in l){const h=it(o.doubleValue),f=it(l.doubleValue);return h===f?nc(h)===nc(f):isNaN(h)&&isNaN(f)}return!1}(r,e);case 9:return Eo(r.arrayValue.values||[],e.arrayValue.values||[],sr);case 10:case 11:return function(o,l){const h=o.mapValue.fields||{},f=l.mapValue.fields||{};if(ey(h)!==ey(f))return!1;for(const g in h)if(h.hasOwnProperty(g)&&(f[g]===void 0||!sr(h[g],f[g])))return!1;return!0}(r,e);default:return _e(52216,{left:r})}}function Ya(r,e){return(r.values||[]).find(t=>sr(t,e))!==void 0}function wo(r,e){if(r===e)return 0;const t=Ti(r),s=Ti(e);if(t!==s)return Ie(t,s);switch(t){case 0:case 9007199254740991:return 0;case 1:return Ie(r.booleanValue,e.booleanValue);case 2:return function(l,h){const f=it(l.integerValue||l.doubleValue),g=it(h.integerValue||h.doubleValue);return f<g?-1:f>g?1:f===g?0:isNaN(f)?isNaN(g)?0:-1:1}(r,e);case 3:return ny(r.timestampValue,e.timestampValue);case 4:return ny(Xa(r),Xa(e));case 5:return xd(r.stringValue,e.stringValue);case 6:return function(l,h){const f=wi(l),g=wi(h);return f.compareTo(g)}(r.bytesValue,e.bytesValue);case 7:return function(l,h){const f=l.split("/"),g=h.split("/");for(let _=0;_<f.length&&_<g.length;_++){const E=Ie(f[_],g[_]);if(E!==0)return E}return Ie(f.length,g.length)}(r.referenceValue,e.referenceValue);case 8:return function(l,h){const f=Ie(it(l.latitude),it(h.latitude));return f!==0?f:Ie(it(l.longitude),it(h.longitude))}(r.geoPointValue,e.geoPointValue);case 9:return ry(r.arrayValue,e.arrayValue);case 10:return function(l,h){var f,g,_,E;const T=l.fields||{},R=h.fields||{},j=(f=T[ic])===null||f===void 0?void 0:f.arrayValue,B=(g=R[ic])===null||g===void 0?void 0:g.arrayValue,$=Ie(((_=j?.values)===null||_===void 0?void 0:_.length)||0,((E=B?.values)===null||E===void 0?void 0:E.length)||0);return $!==0?$:ry(j,B)}(r.mapValue,e.mapValue);case 11:return function(l,h){if(l===xu.mapValue&&h===xu.mapValue)return 0;if(l===xu.mapValue)return 1;if(h===xu.mapValue)return-1;const f=l.fields||{},g=Object.keys(f),_=h.fields||{},E=Object.keys(_);g.sort(),E.sort();for(let T=0;T<g.length&&T<E.length;++T){const R=xd(g[T],E[T]);if(R!==0)return R;const j=wo(f[g[T]],_[E[T]]);if(j!==0)return j}return Ie(g.length,E.length)}(r.mapValue,e.mapValue);default:throw _e(23264,{le:t})}}function ny(r,e){if(typeof r=="string"&&typeof e=="string"&&r.length===e.length)return Ie(r,e);const t=Ei(r),s=Ei(e),o=Ie(t.seconds,s.seconds);return o!==0?o:Ie(t.nanos,s.nanos)}function ry(r,e){const t=r.values||[],s=e.values||[];for(let o=0;o<t.length&&o<s.length;++o){const l=wo(t[o],s[o]);if(l)return l}return Ie(t.length,s.length)}function To(r){return Ld(r)}function Ld(r){return"nullValue"in r?"null":"booleanValue"in r?""+r.booleanValue:"integerValue"in r?""+r.integerValue:"doubleValue"in r?""+r.doubleValue:"timestampValue"in r?function(t){const s=Ei(t);return`time(${s.seconds},${s.nanos})`}(r.timestampValue):"stringValue"in r?r.stringValue:"bytesValue"in r?function(t){return wi(t).toBase64()}(r.bytesValue):"referenceValue"in r?function(t){return me.fromName(t).toString()}(r.referenceValue):"geoPointValue"in r?function(t){return`geo(${t.latitude},${t.longitude})`}(r.geoPointValue):"arrayValue"in r?function(t){let s="[",o=!0;for(const l of t.values||[])o?o=!1:s+=",",s+=Ld(l);return s+"]"}(r.arrayValue):"mapValue"in r?function(t){const s=Object.keys(t.fields||{}).sort();let o="{",l=!0;for(const h of s)l?l=!1:o+=",",o+=`${h}:${Ld(t.fields[h])}`;return o+"}"}(r.mapValue):_e(61005,{value:r})}function Bu(r){switch(Ti(r)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const e=wc(r);return e?16+Bu(e):16;case 5:return 2*r.stringValue.length;case 6:return wi(r.bytesValue).approximateByteSize();case 7:return r.referenceValue.length;case 9:return function(s){return(s.values||[]).reduce((o,l)=>o+Bu(l),0)}(r.arrayValue);case 10:case 11:return function(s){let o=0;return fs(s.fields,(l,h)=>{o+=l.length+Bu(h)}),o}(r.mapValue);default:throw _e(13486,{value:r})}}function Md(r){return!!r&&"integerValue"in r}function _f(r){return!!r&&"arrayValue"in r}function iy(r){return!!r&&"nullValue"in r}function sy(r){return!!r&&"doubleValue"in r&&isNaN(Number(r.doubleValue))}function $u(r){return!!r&&"mapValue"in r}function sA(r){var e,t;return((t=(((e=r?.mapValue)===null||e===void 0?void 0:e.fields)||{})[dv])===null||t===void 0?void 0:t.stringValue)===fv}function Fa(r){if(r.geoPointValue)return{geoPointValue:Object.assign({},r.geoPointValue)};if(r.timestampValue&&typeof r.timestampValue=="object")return{timestampValue:Object.assign({},r.timestampValue)};if(r.mapValue){const e={mapValue:{fields:{}}};return fs(r.mapValue.fields,(t,s)=>e.mapValue.fields[t]=Fa(s)),e}if(r.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(r.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=Fa(r.arrayValue.values[t]);return e}return Object.assign({},r)}function oA(r){return(((r.mapValue||{}).fields||{}).__type__||{}).stringValue===iA}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class En{constructor(e){this.value=e}static empty(){return new En({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let s=0;s<e.length-1;++s)if(t=(t.mapValue.fields||{})[e.get(s)],!$u(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=Fa(t)}setAll(e){let t=Nt.emptyPath(),s={},o=[];e.forEach((h,f)=>{if(!t.isImmediateParentOf(f)){const g=this.getFieldsMap(t);this.applyChanges(g,s,o),s={},o=[],t=f.popLast()}h?s[f.lastSegment()]=Fa(h):o.push(f.lastSegment())});const l=this.getFieldsMap(t);this.applyChanges(l,s,o)}delete(e){const t=this.field(e.popLast());$u(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return sr(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let s=0;s<e.length;++s){let o=t.mapValue.fields[e.get(s)];$u(o)&&o.mapValue.fields||(o={mapValue:{fields:{}}},t.mapValue.fields[e.get(s)]=o),t=o}return t.mapValue.fields}applyChanges(e,t,s){fs(t,(o,l)=>e[o]=l);for(const o of s)delete e[o]}clone(){return new En(Fa(this.value))}}function pv(r){const e=[];return fs(r.fields,(t,s)=>{const o=new Nt([t]);if($u(s)){const l=pv(s.mapValue).fields;if(l.length===0)e.push(o);else for(const h of l)e.push(o.child(h))}else e.push(o)}),new Un(e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jt{constructor(e,t,s,o,l,h,f){this.key=e,this.documentType=t,this.version=s,this.readTime=o,this.createTime=l,this.data=h,this.documentState=f}static newInvalidDocument(e){return new jt(e,0,Ee.min(),Ee.min(),Ee.min(),En.empty(),0)}static newFoundDocument(e,t,s,o){return new jt(e,1,t,Ee.min(),s,o,0)}static newNoDocument(e,t){return new jt(e,2,t,Ee.min(),Ee.min(),En.empty(),0)}static newUnknownDocument(e,t){return new jt(e,3,t,Ee.min(),Ee.min(),En.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(Ee.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=En.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=En.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=Ee.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof jt&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new jt(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sc{constructor(e,t){this.position=e,this.inclusive=t}}function oy(r,e,t){let s=0;for(let o=0;o<r.position.length;o++){const l=e[o],h=r.position[o];if(l.field.isKeyField()?s=me.comparator(me.fromName(h.referenceValue),t.key):s=wo(h,t.data.field(l.field)),l.dir==="desc"&&(s*=-1),s!==0)break}return s}function ay(r,e){if(r===null)return e===null;if(e===null||r.inclusive!==e.inclusive||r.position.length!==e.position.length)return!1;for(let t=0;t<r.position.length;t++)if(!sr(r.position[t],e.position[t]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oc{constructor(e,t="asc"){this.field=e,this.dir=t}}function aA(r,e){return r.dir===e.dir&&r.field.isEqual(e.field)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mv{}class gt extends mv{constructor(e,t,s){super(),this.field=e,this.op=t,this.value=s}static create(e,t,s){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,s):new uA(e,t,s):t==="array-contains"?new dA(e,s):t==="in"?new fA(e,s):t==="not-in"?new pA(e,s):t==="array-contains-any"?new mA(e,s):new gt(e,t,s)}static createKeyFieldInFilter(e,t,s){return t==="in"?new cA(e,s):new hA(e,s)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&t.nullValue===void 0&&this.matchesComparison(wo(t,this.value)):t!==null&&Ti(this.value)===Ti(t)&&this.matchesComparison(wo(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return _e(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class or extends mv{constructor(e,t){super(),this.filters=e,this.op=t,this.he=null}static create(e,t){return new or(e,t)}matches(e){return gv(this)?this.filters.find(t=>!t.matches(e))===void 0:this.filters.find(t=>t.matches(e))!==void 0}getFlattenedFilters(){return this.he!==null||(this.he=this.filters.reduce((e,t)=>e.concat(t.getFlattenedFilters()),[])),this.he}getFilters(){return Object.assign([],this.filters)}}function gv(r){return r.op==="and"}function yv(r){return lA(r)&&gv(r)}function lA(r){for(const e of r.filters)if(e instanceof or)return!1;return!0}function bd(r){if(r instanceof gt)return r.field.canonicalString()+r.op.toString()+To(r.value);if(yv(r))return r.filters.map(e=>bd(e)).join(",");{const e=r.filters.map(t=>bd(t)).join(",");return`${r.op}(${e})`}}function _v(r,e){return r instanceof gt?function(s,o){return o instanceof gt&&s.op===o.op&&s.field.isEqual(o.field)&&sr(s.value,o.value)}(r,e):r instanceof or?function(s,o){return o instanceof or&&s.op===o.op&&s.filters.length===o.filters.length?s.filters.reduce((l,h,f)=>l&&_v(h,o.filters[f]),!0):!1}(r,e):void _e(19439)}function vv(r){return r instanceof gt?function(t){return`${t.field.canonicalString()} ${t.op} ${To(t.value)}`}(r):r instanceof or?function(t){return t.op.toString()+" {"+t.getFilters().map(vv).join(" ,")+"}"}(r):"Filter"}class uA extends gt{constructor(e,t,s){super(e,t,s),this.key=me.fromName(s.referenceValue)}matches(e){const t=me.comparator(e.key,this.key);return this.matchesComparison(t)}}class cA extends gt{constructor(e,t){super(e,"in",t),this.keys=Ev("in",t)}matches(e){return this.keys.some(t=>t.isEqual(e.key))}}class hA extends gt{constructor(e,t){super(e,"not-in",t),this.keys=Ev("not-in",t)}matches(e){return!this.keys.some(t=>t.isEqual(e.key))}}function Ev(r,e){var t;return(((t=e.arrayValue)===null||t===void 0?void 0:t.values)||[]).map(s=>me.fromName(s.referenceValue))}class dA extends gt{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return _f(t)&&Ya(t.arrayValue,this.value)}}class fA extends gt{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&Ya(this.value.arrayValue,t)}}class pA extends gt{constructor(e,t){super(e,"not-in",t)}matches(e){if(Ya(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&t.nullValue===void 0&&!Ya(this.value.arrayValue,t)}}class mA extends gt{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!_f(t)||!t.arrayValue.values)&&t.arrayValue.values.some(s=>Ya(this.value.arrayValue,s))}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gA{constructor(e,t=null,s=[],o=[],l=null,h=null,f=null){this.path=e,this.collectionGroup=t,this.orderBy=s,this.filters=o,this.limit=l,this.startAt=h,this.endAt=f,this.Pe=null}}function ly(r,e=null,t=[],s=[],o=null,l=null,h=null){return new gA(r,e,t,s,o,l,h)}function vf(r){const e=we(r);if(e.Pe===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map(s=>bd(s)).join(","),t+="|ob:",t+=e.orderBy.map(s=>function(l){return l.field.canonicalString()+l.dir}(s)).join(","),Ec(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map(s=>To(s)).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map(s=>To(s)).join(",")),e.Pe=t}return e.Pe}function Ef(r,e){if(r.limit!==e.limit||r.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<r.orderBy.length;t++)if(!aA(r.orderBy[t],e.orderBy[t]))return!1;if(r.filters.length!==e.filters.length)return!1;for(let t=0;t<r.filters.length;t++)if(!_v(r.filters[t],e.filters[t]))return!1;return r.collectionGroup===e.collectionGroup&&!!r.path.isEqual(e.path)&&!!ay(r.startAt,e.startAt)&&ay(r.endAt,e.endAt)}function Fd(r){return me.isDocumentKey(r.path)&&r.collectionGroup===null&&r.filters.length===0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Tc{constructor(e,t=null,s=[],o=[],l=null,h="F",f=null,g=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=s,this.filters=o,this.limit=l,this.limitType=h,this.startAt=f,this.endAt=g,this.Te=null,this.Ie=null,this.de=null,this.startAt,this.endAt}}function yA(r,e,t,s,o,l,h,f){return new Tc(r,e,t,s,o,l,h,f)}function wf(r){return new Tc(r)}function uy(r){return r.filters.length===0&&r.limit===null&&r.startAt==null&&r.endAt==null&&(r.explicitOrderBy.length===0||r.explicitOrderBy.length===1&&r.explicitOrderBy[0].field.isKeyField())}function _A(r){return r.collectionGroup!==null}function Ua(r){const e=we(r);if(e.Te===null){e.Te=[];const t=new Set;for(const l of e.explicitOrderBy)e.Te.push(l),t.add(l.field.canonicalString());const s=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(h){let f=new yt(Nt.comparator);return h.filters.forEach(g=>{g.getFlattenedFilters().forEach(_=>{_.isInequality()&&(f=f.add(_.field))})}),f})(e).forEach(l=>{t.has(l.canonicalString())||l.isKeyField()||e.Te.push(new oc(l,s))}),t.has(Nt.keyField().canonicalString())||e.Te.push(new oc(Nt.keyField(),s))}return e.Te}function tr(r){const e=we(r);return e.Ie||(e.Ie=vA(e,Ua(r))),e.Ie}function vA(r,e){if(r.limitType==="F")return ly(r.path,r.collectionGroup,e,r.filters,r.limit,r.startAt,r.endAt);{e=e.map(o=>{const l=o.dir==="desc"?"asc":"desc";return new oc(o.field,l)});const t=r.endAt?new sc(r.endAt.position,r.endAt.inclusive):null,s=r.startAt?new sc(r.startAt.position,r.startAt.inclusive):null;return ly(r.path,r.collectionGroup,e,r.filters,r.limit,t,s)}}function Ud(r,e,t){return new Tc(r.path,r.collectionGroup,r.explicitOrderBy.slice(),r.filters.slice(),e,t,r.startAt,r.endAt)}function Ic(r,e){return Ef(tr(r),tr(e))&&r.limitType===e.limitType}function wv(r){return`${vf(tr(r))}|lt:${r.limitType}`}function co(r){return`Query(target=${function(t){let s=t.path.canonicalString();return t.collectionGroup!==null&&(s+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(s+=`, filters: [${t.filters.map(o=>vv(o)).join(", ")}]`),Ec(t.limit)||(s+=", limit: "+t.limit),t.orderBy.length>0&&(s+=`, orderBy: [${t.orderBy.map(o=>function(h){return`${h.field.canonicalString()} (${h.dir})`}(o)).join(", ")}]`),t.startAt&&(s+=", startAt: ",s+=t.startAt.inclusive?"b:":"a:",s+=t.startAt.position.map(o=>To(o)).join(",")),t.endAt&&(s+=", endAt: ",s+=t.endAt.inclusive?"a:":"b:",s+=t.endAt.position.map(o=>To(o)).join(",")),`Target(${s})`}(tr(r))}; limitType=${r.limitType})`}function Sc(r,e){return e.isFoundDocument()&&function(s,o){const l=o.key.path;return s.collectionGroup!==null?o.key.hasCollectionId(s.collectionGroup)&&s.path.isPrefixOf(l):me.isDocumentKey(s.path)?s.path.isEqual(l):s.path.isImmediateParentOf(l)}(r,e)&&function(s,o){for(const l of Ua(s))if(!l.field.isKeyField()&&o.data.field(l.field)===null)return!1;return!0}(r,e)&&function(s,o){for(const l of s.filters)if(!l.matches(o))return!1;return!0}(r,e)&&function(s,o){return!(s.startAt&&!function(h,f,g){const _=oy(h,f,g);return h.inclusive?_<=0:_<0}(s.startAt,Ua(s),o)||s.endAt&&!function(h,f,g){const _=oy(h,f,g);return h.inclusive?_>=0:_>0}(s.endAt,Ua(s),o))}(r,e)}function EA(r){return r.collectionGroup||(r.path.length%2==1?r.path.lastSegment():r.path.get(r.path.length-2))}function Tv(r){return(e,t)=>{let s=!1;for(const o of Ua(r)){const l=wA(o,e,t);if(l!==0)return l;s=s||o.field.isKeyField()}return 0}}function wA(r,e,t){const s=r.field.isKeyField()?me.comparator(e.key,t.key):function(l,h,f){const g=h.data.field(l),_=f.data.field(l);return g!==null&&_!==null?wo(g,_):_e(42886)}(r.field,e,t);switch(r.dir){case"asc":return s;case"desc":return-1*s;default:return _e(19790,{direction:r.dir})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ps{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),s=this.inner[t];if(s!==void 0){for(const[o,l]of s)if(this.equalsFn(o,e))return l}}has(e){return this.get(e)!==void 0}set(e,t){const s=this.mapKeyFn(e),o=this.inner[s];if(o===void 0)return this.inner[s]=[[e,t]],void this.innerSize++;for(let l=0;l<o.length;l++)if(this.equalsFn(o[l][0],e))return void(o[l]=[e,t]);o.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),s=this.inner[t];if(s===void 0)return!1;for(let o=0;o<s.length;o++)if(this.equalsFn(s[o][0],e))return s.length===1?delete this.inner[t]:s.splice(o,1),this.innerSize--,!0;return!1}forEach(e){fs(this.inner,(t,s)=>{for(const[o,l]of s)e(o,l)})}isEmpty(){return ov(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const TA=new Ze(me.comparator);function Or(){return TA}const Iv=new Ze(me.comparator);function Va(...r){let e=Iv;for(const t of r)e=e.insert(t.key,t);return e}function Sv(r){let e=Iv;return r.forEach((t,s)=>e=e.insert(t,s.overlayedDocument)),e}function is(){return ja()}function Av(){return ja()}function ja(){return new ps(r=>r.toString(),(r,e)=>r.isEqual(e))}const IA=new Ze(me.comparator),SA=new yt(me.comparator);function Pe(...r){let e=SA;for(const t of r)e=e.add(t);return e}const AA=new yt(Ie);function RA(){return AA}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Tf(r,e){if(r.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:nc(e)?"-0":e}}function Rv(r){return{integerValue:""+r}}function CA(r,e){return Z1(e)?Rv(e):Tf(r,e)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ac{constructor(){this._=void 0}}function PA(r,e,t){return r instanceof ac?function(o,l){const h={fields:{[uv]:{stringValue:lv},[hv]:{timestampValue:{seconds:o.seconds,nanos:o.nanoseconds}}}};return l&&yf(l)&&(l=wc(l)),l&&(h.fields[cv]=l),{mapValue:h}}(t,e):r instanceof Za?Pv(r,e):r instanceof el?kv(r,e):function(o,l){const h=Cv(o,l),f=cy(h)+cy(o.Ee);return Md(h)&&Md(o.Ee)?Rv(f):Tf(o.serializer,f)}(r,e)}function kA(r,e,t){return r instanceof Za?Pv(r,e):r instanceof el?kv(r,e):t}function Cv(r,e){return r instanceof lc?function(s){return Md(s)||function(l){return!!l&&"doubleValue"in l}(s)}(e)?e:{integerValue:0}:null}class ac extends Ac{}class Za extends Ac{constructor(e){super(),this.elements=e}}function Pv(r,e){const t=Nv(e);for(const s of r.elements)t.some(o=>sr(o,s))||t.push(s);return{arrayValue:{values:t}}}class el extends Ac{constructor(e){super(),this.elements=e}}function kv(r,e){let t=Nv(e);for(const s of r.elements)t=t.filter(o=>!sr(o,s));return{arrayValue:{values:t}}}class lc extends Ac{constructor(e,t){super(),this.serializer=e,this.Ee=t}}function cy(r){return it(r.integerValue||r.doubleValue)}function Nv(r){return _f(r)&&r.arrayValue.values?r.arrayValue.values.slice():[]}function NA(r,e){return r.field.isEqual(e.field)&&function(s,o){return s instanceof Za&&o instanceof Za||s instanceof el&&o instanceof el?Eo(s.elements,o.elements,sr):s instanceof lc&&o instanceof lc?sr(s.Ee,o.Ee):s instanceof ac&&o instanceof ac}(r.transform,e.transform)}class DA{constructor(e,t){this.version=e,this.transformResults=t}}class Pr{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new Pr}static exists(e){return new Pr(void 0,e)}static updateTime(e){return new Pr(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function Wu(r,e){return r.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(r.updateTime):r.exists===void 0||r.exists===e.isFoundDocument()}class Rc{}function Dv(r,e){if(!r.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return r.isNoDocument()?new Vv(r.key,Pr.none()):new hl(r.key,r.data,Pr.none());{const t=r.data,s=En.empty();let o=new yt(Nt.comparator);for(let l of e.fields)if(!o.has(l)){let h=t.field(l);h===null&&l.length>1&&(l=l.popLast(),h=t.field(l)),h===null?s.delete(l):s.set(l,h),o=o.add(l)}return new ms(r.key,s,new Un(o.toArray()),Pr.none())}}function OA(r,e,t){r instanceof hl?function(o,l,h){const f=o.value.clone(),g=dy(o.fieldTransforms,l,h.transformResults);f.setAll(g),l.convertToFoundDocument(h.version,f).setHasCommittedMutations()}(r,e,t):r instanceof ms?function(o,l,h){if(!Wu(o.precondition,l))return void l.convertToUnknownDocument(h.version);const f=dy(o.fieldTransforms,l,h.transformResults),g=l.data;g.setAll(Ov(o)),g.setAll(f),l.convertToFoundDocument(h.version,g).setHasCommittedMutations()}(r,e,t):function(o,l,h){l.convertToNoDocument(h.version).setHasCommittedMutations()}(0,e,t)}function za(r,e,t,s){return r instanceof hl?function(l,h,f,g){if(!Wu(l.precondition,h))return f;const _=l.value.clone(),E=fy(l.fieldTransforms,g,h);return _.setAll(E),h.convertToFoundDocument(h.version,_).setHasLocalMutations(),null}(r,e,t,s):r instanceof ms?function(l,h,f,g){if(!Wu(l.precondition,h))return f;const _=fy(l.fieldTransforms,g,h),E=h.data;return E.setAll(Ov(l)),E.setAll(_),h.convertToFoundDocument(h.version,E).setHasLocalMutations(),f===null?null:f.unionWith(l.fieldMask.fields).unionWith(l.fieldTransforms.map(T=>T.field))}(r,e,t,s):function(l,h,f){return Wu(l.precondition,h)?(h.convertToNoDocument(h.version).setHasLocalMutations(),null):f}(r,e,t)}function VA(r,e){let t=null;for(const s of r.fieldTransforms){const o=e.data.field(s.field),l=Cv(s.transform,o||null);l!=null&&(t===null&&(t=En.empty()),t.set(s.field,l))}return t||null}function hy(r,e){return r.type===e.type&&!!r.key.isEqual(e.key)&&!!r.precondition.isEqual(e.precondition)&&!!function(s,o){return s===void 0&&o===void 0||!(!s||!o)&&Eo(s,o,(l,h)=>NA(l,h))}(r.fieldTransforms,e.fieldTransforms)&&(r.type===0?r.value.isEqual(e.value):r.type!==1||r.data.isEqual(e.data)&&r.fieldMask.isEqual(e.fieldMask))}class hl extends Rc{constructor(e,t,s,o=[]){super(),this.key=e,this.value=t,this.precondition=s,this.fieldTransforms=o,this.type=0}getFieldMask(){return null}}class ms extends Rc{constructor(e,t,s,o,l=[]){super(),this.key=e,this.data=t,this.fieldMask=s,this.precondition=o,this.fieldTransforms=l,this.type=1}getFieldMask(){return this.fieldMask}}function Ov(r){const e=new Map;return r.fieldMask.fields.forEach(t=>{if(!t.isEmpty()){const s=r.data.field(t);e.set(t,s)}}),e}function dy(r,e,t){const s=new Map;Fe(r.length===t.length,32656,{Ae:t.length,Re:r.length});for(let o=0;o<t.length;o++){const l=r[o],h=l.transform,f=e.data.field(l.field);s.set(l.field,kA(h,f,t[o]))}return s}function fy(r,e,t){const s=new Map;for(const o of r){const l=o.transform,h=t.data.field(o.field);s.set(o.field,PA(l,h,e))}return s}class Vv extends Rc{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class xA extends Rc{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class LA{constructor(e,t,s,o){this.batchId=e,this.localWriteTime=t,this.baseMutations=s,this.mutations=o}applyToRemoteDocument(e,t){const s=t.mutationResults;for(let o=0;o<this.mutations.length;o++){const l=this.mutations[o];l.key.isEqual(e.key)&&OA(l,e,s[o])}}applyToLocalView(e,t){for(const s of this.baseMutations)s.key.isEqual(e.key)&&(t=za(s,e,t,this.localWriteTime));for(const s of this.mutations)s.key.isEqual(e.key)&&(t=za(s,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const s=Av();return this.mutations.forEach(o=>{const l=e.get(o.key),h=l.overlayedDocument;let f=this.applyToLocalView(h,l.mutatedFields);f=t.has(o.key)?null:f;const g=Dv(h,f);g!==null&&s.set(o.key,g),h.isValidDocument()||h.convertToNoDocument(Ee.min())}),s}keys(){return this.mutations.reduce((e,t)=>e.add(t.key),Pe())}isEqual(e){return this.batchId===e.batchId&&Eo(this.mutations,e.mutations,(t,s)=>hy(t,s))&&Eo(this.baseMutations,e.baseMutations,(t,s)=>hy(t,s))}}class If{constructor(e,t,s,o){this.batch=e,this.commitVersion=t,this.mutationResults=s,this.docVersions=o}static from(e,t,s){Fe(e.mutations.length===s.length,58842,{Ve:e.mutations.length,me:s.length});let o=function(){return IA}();const l=e.mutations;for(let h=0;h<l.length;h++)o=o.insert(l[h].key,s[h].version);return new If(e,t,s,o)}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class MA{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bA{constructor(e,t){this.count=e,this.unchangedNames=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var lt,Oe;function FA(r){switch(r){case G.OK:return _e(64938);case G.CANCELLED:case G.UNKNOWN:case G.DEADLINE_EXCEEDED:case G.RESOURCE_EXHAUSTED:case G.INTERNAL:case G.UNAVAILABLE:case G.UNAUTHENTICATED:return!1;case G.INVALID_ARGUMENT:case G.NOT_FOUND:case G.ALREADY_EXISTS:case G.PERMISSION_DENIED:case G.FAILED_PRECONDITION:case G.ABORTED:case G.OUT_OF_RANGE:case G.UNIMPLEMENTED:case G.DATA_LOSS:return!0;default:return _e(15467,{code:r})}}function xv(r){if(r===void 0)return Dr("GRPC error has no .code"),G.UNKNOWN;switch(r){case lt.OK:return G.OK;case lt.CANCELLED:return G.CANCELLED;case lt.UNKNOWN:return G.UNKNOWN;case lt.DEADLINE_EXCEEDED:return G.DEADLINE_EXCEEDED;case lt.RESOURCE_EXHAUSTED:return G.RESOURCE_EXHAUSTED;case lt.INTERNAL:return G.INTERNAL;case lt.UNAVAILABLE:return G.UNAVAILABLE;case lt.UNAUTHENTICATED:return G.UNAUTHENTICATED;case lt.INVALID_ARGUMENT:return G.INVALID_ARGUMENT;case lt.NOT_FOUND:return G.NOT_FOUND;case lt.ALREADY_EXISTS:return G.ALREADY_EXISTS;case lt.PERMISSION_DENIED:return G.PERMISSION_DENIED;case lt.FAILED_PRECONDITION:return G.FAILED_PRECONDITION;case lt.ABORTED:return G.ABORTED;case lt.OUT_OF_RANGE:return G.OUT_OF_RANGE;case lt.UNIMPLEMENTED:return G.UNIMPLEMENTED;case lt.DATA_LOSS:return G.DATA_LOSS;default:return _e(39323,{code:r})}}(Oe=lt||(lt={}))[Oe.OK=0]="OK",Oe[Oe.CANCELLED=1]="CANCELLED",Oe[Oe.UNKNOWN=2]="UNKNOWN",Oe[Oe.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",Oe[Oe.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",Oe[Oe.NOT_FOUND=5]="NOT_FOUND",Oe[Oe.ALREADY_EXISTS=6]="ALREADY_EXISTS",Oe[Oe.PERMISSION_DENIED=7]="PERMISSION_DENIED",Oe[Oe.UNAUTHENTICATED=16]="UNAUTHENTICATED",Oe[Oe.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",Oe[Oe.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",Oe[Oe.ABORTED=10]="ABORTED",Oe[Oe.OUT_OF_RANGE=11]="OUT_OF_RANGE",Oe[Oe.UNIMPLEMENTED=12]="UNIMPLEMENTED",Oe[Oe.INTERNAL=13]="INTERNAL",Oe[Oe.UNAVAILABLE=14]="UNAVAILABLE",Oe[Oe.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const UA=new gi([4294967295,4294967295],0);function py(r){const e=rv().encode(r),t=new Q_;return t.update(e),new Uint8Array(t.digest())}function my(r){const e=new DataView(r.buffer),t=e.getUint32(0,!0),s=e.getUint32(4,!0),o=e.getUint32(8,!0),l=e.getUint32(12,!0);return[new gi([t,s],0),new gi([o,l],0)]}class Sf{constructor(e,t,s){if(this.bitmap=e,this.padding=t,this.hashCount=s,t<0||t>=8)throw new xa(`Invalid padding: ${t}`);if(s<0)throw new xa(`Invalid hash count: ${s}`);if(e.length>0&&this.hashCount===0)throw new xa(`Invalid hash count: ${s}`);if(e.length===0&&t!==0)throw new xa(`Invalid padding when bitmap length is 0: ${t}`);this.fe=8*e.length-t,this.ge=gi.fromNumber(this.fe)}pe(e,t,s){let o=e.add(t.multiply(gi.fromNumber(s)));return o.compare(UA)===1&&(o=new gi([o.getBits(0),o.getBits(1)],0)),o.modulo(this.ge).toNumber()}ye(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(this.fe===0)return!1;const t=py(e),[s,o]=my(t);for(let l=0;l<this.hashCount;l++){const h=this.pe(s,o,l);if(!this.ye(h))return!1}return!0}static create(e,t,s){const o=e%8==0?0:8-e%8,l=new Uint8Array(Math.ceil(e/8)),h=new Sf(l,o,t);return s.forEach(f=>h.insert(f)),h}insert(e){if(this.fe===0)return;const t=py(e),[s,o]=my(t);for(let l=0;l<this.hashCount;l++){const h=this.pe(s,o,l);this.we(h)}}we(e){const t=Math.floor(e/8),s=e%8;this.bitmap[t]|=1<<s}}class xa extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Cc{constructor(e,t,s,o,l){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=s,this.documentUpdates=o,this.resolvedLimboDocuments=l}static createSynthesizedRemoteEventForCurrentChange(e,t,s){const o=new Map;return o.set(e,dl.createSynthesizedTargetChangeForCurrentChange(e,t,s)),new Cc(Ee.min(),o,new Ze(Ie),Or(),Pe())}}class dl{constructor(e,t,s,o,l){this.resumeToken=e,this.current=t,this.addedDocuments=s,this.modifiedDocuments=o,this.removedDocuments=l}static createSynthesizedTargetChangeForCurrentChange(e,t,s){return new dl(s,t,Pe(),Pe(),Pe())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hu{constructor(e,t,s,o){this.Se=e,this.removedTargetIds=t,this.key=s,this.be=o}}class Lv{constructor(e,t){this.targetId=e,this.De=t}}class Mv{constructor(e,t,s=Dt.EMPTY_BYTE_STRING,o=null){this.state=e,this.targetIds=t,this.resumeToken=s,this.cause=o}}class gy{constructor(){this.ve=0,this.Ce=yy(),this.Fe=Dt.EMPTY_BYTE_STRING,this.Me=!1,this.xe=!0}get current(){return this.Me}get resumeToken(){return this.Fe}get Oe(){return this.ve!==0}get Ne(){return this.xe}Be(e){e.approximateByteSize()>0&&(this.xe=!0,this.Fe=e)}Le(){let e=Pe(),t=Pe(),s=Pe();return this.Ce.forEach((o,l)=>{switch(l){case 0:e=e.add(o);break;case 2:t=t.add(o);break;case 1:s=s.add(o);break;default:_e(38017,{changeType:l})}}),new dl(this.Fe,this.Me,e,t,s)}ke(){this.xe=!1,this.Ce=yy()}qe(e,t){this.xe=!0,this.Ce=this.Ce.insert(e,t)}Qe(e){this.xe=!0,this.Ce=this.Ce.remove(e)}$e(){this.ve+=1}Ue(){this.ve-=1,Fe(this.ve>=0,3241,{ve:this.ve})}Ke(){this.xe=!0,this.Me=!0}}class jA{constructor(e){this.We=e,this.Ge=new Map,this.ze=Or(),this.je=Lu(),this.Je=Lu(),this.He=new Ze(Ie)}Ye(e){for(const t of e.Se)e.be&&e.be.isFoundDocument()?this.Ze(t,e.be):this.Xe(t,e.key,e.be);for(const t of e.removedTargetIds)this.Xe(t,e.key,e.be)}et(e){this.forEachTarget(e,t=>{const s=this.tt(t);switch(e.state){case 0:this.nt(t)&&s.Be(e.resumeToken);break;case 1:s.Ue(),s.Oe||s.ke(),s.Be(e.resumeToken);break;case 2:s.Ue(),s.Oe||this.removeTarget(t);break;case 3:this.nt(t)&&(s.Ke(),s.Be(e.resumeToken));break;case 4:this.nt(t)&&(this.rt(t),s.Be(e.resumeToken));break;default:_e(56790,{state:e.state})}})}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.Ge.forEach((s,o)=>{this.nt(o)&&t(o)})}it(e){const t=e.targetId,s=e.De.count,o=this.st(t);if(o){const l=o.target;if(Fd(l))if(s===0){const h=new me(l.path);this.Xe(t,h,jt.newNoDocument(h,Ee.min()))}else Fe(s===1,20013,{expectedCount:s});else{const h=this.ot(t);if(h!==s){const f=this._t(e),g=f?this.ut(f,e,h):1;if(g!==0){this.rt(t);const _=g===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.He=this.He.insert(t,_)}}}}}_t(e){const t=e.De.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:s="",padding:o=0},hashCount:l=0}=t;let h,f;try{h=wi(s).toUint8Array()}catch(g){if(g instanceof av)return _i("Decoding the base64 bloom filter in existence filter failed ("+g.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw g}try{f=new Sf(h,o,l)}catch(g){return _i(g instanceof xa?"BloomFilter error: ":"Applying bloom filter failed: ",g),null}return f.fe===0?null:f}ut(e,t,s){return t.De.count===s-this.ht(e,t.targetId)?0:2}ht(e,t){const s=this.We.getRemoteKeysForTarget(t);let o=0;return s.forEach(l=>{const h=this.We.lt(),f=`projects/${h.projectId}/databases/${h.database}/documents/${l.path.canonicalString()}`;e.mightContain(f)||(this.Xe(t,l,null),o++)}),o}Pt(e){const t=new Map;this.Ge.forEach((l,h)=>{const f=this.st(h);if(f){if(l.current&&Fd(f.target)){const g=new me(f.target.path);this.Tt(g).has(h)||this.It(h,g)||this.Xe(h,g,jt.newNoDocument(g,e))}l.Ne&&(t.set(h,l.Le()),l.ke())}});let s=Pe();this.Je.forEach((l,h)=>{let f=!0;h.forEachWhile(g=>{const _=this.st(g);return!_||_.purpose==="TargetPurposeLimboResolution"||(f=!1,!1)}),f&&(s=s.add(l))}),this.ze.forEach((l,h)=>h.setReadTime(e));const o=new Cc(e,t,this.He,this.ze,s);return this.ze=Or(),this.je=Lu(),this.Je=Lu(),this.He=new Ze(Ie),o}Ze(e,t){if(!this.nt(e))return;const s=this.It(e,t.key)?2:0;this.tt(e).qe(t.key,s),this.ze=this.ze.insert(t.key,t),this.je=this.je.insert(t.key,this.Tt(t.key).add(e)),this.Je=this.Je.insert(t.key,this.dt(t.key).add(e))}Xe(e,t,s){if(!this.nt(e))return;const o=this.tt(e);this.It(e,t)?o.qe(t,1):o.Qe(t),this.Je=this.Je.insert(t,this.dt(t).delete(e)),this.Je=this.Je.insert(t,this.dt(t).add(e)),s&&(this.ze=this.ze.insert(t,s))}removeTarget(e){this.Ge.delete(e)}ot(e){const t=this.tt(e).Le();return this.We.getRemoteKeysForTarget(e).size+t.addedDocuments.size-t.removedDocuments.size}$e(e){this.tt(e).$e()}tt(e){let t=this.Ge.get(e);return t||(t=new gy,this.Ge.set(e,t)),t}dt(e){let t=this.Je.get(e);return t||(t=new yt(Ie),this.Je=this.Je.insert(e,t)),t}Tt(e){let t=this.je.get(e);return t||(t=new yt(Ie),this.je=this.je.insert(e,t)),t}nt(e){const t=this.st(e)!==null;return t||te("WatchChangeAggregator","Detected inactive target",e),t}st(e){const t=this.Ge.get(e);return t&&t.Oe?null:this.We.Et(e)}rt(e){this.Ge.set(e,new gy),this.We.getRemoteKeysForTarget(e).forEach(t=>{this.Xe(e,t,null)})}It(e,t){return this.We.getRemoteKeysForTarget(e).has(t)}}function Lu(){return new Ze(me.comparator)}function yy(){return new Ze(me.comparator)}const zA={asc:"ASCENDING",desc:"DESCENDING"},BA={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},$A={and:"AND",or:"OR"};class WA{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function jd(r,e){return r.useProto3Json||Ec(e)?e:{value:e}}function uc(r,e){return r.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function bv(r,e){return r.useProto3Json?e.toBase64():e.toUint8Array()}function HA(r,e){return uc(r,e.toTimestamp())}function nr(r){return Fe(!!r,49232),Ee.fromTimestamp(function(t){const s=Ei(t);return new Ke(s.seconds,s.nanos)}(r))}function Af(r,e){return zd(r,e).canonicalString()}function zd(r,e){const t=function(o){return new Ye(["projects",o.projectId,"databases",o.database])}(r).child("documents");return e===void 0?t:t.child(e)}function Fv(r){const e=Ye.fromString(r);return Fe($v(e),10190,{key:e.toString()}),e}function Bd(r,e){return Af(r.databaseId,e.path)}function yd(r,e){const t=Fv(e);if(t.get(1)!==r.databaseId.projectId)throw new ce(G.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+r.databaseId.projectId);if(t.get(3)!==r.databaseId.database)throw new ce(G.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+r.databaseId.database);return new me(jv(t))}function Uv(r,e){return Af(r.databaseId,e)}function qA(r){const e=Fv(r);return e.length===4?Ye.emptyPath():jv(e)}function $d(r){return new Ye(["projects",r.databaseId.projectId,"databases",r.databaseId.database]).canonicalString()}function jv(r){return Fe(r.length>4&&r.get(4)==="documents",29091,{key:r.toString()}),r.popFirst(5)}function _y(r,e,t){return{name:Bd(r,e),fields:t.value.mapValue.fields}}function KA(r,e){let t;if("targetChange"in e){e.targetChange;const s=function(_){return _==="NO_CHANGE"?0:_==="ADD"?1:_==="REMOVE"?2:_==="CURRENT"?3:_==="RESET"?4:_e(39313,{state:_})}(e.targetChange.targetChangeType||"NO_CHANGE"),o=e.targetChange.targetIds||[],l=function(_,E){return _.useProto3Json?(Fe(E===void 0||typeof E=="string",58123),Dt.fromBase64String(E||"")):(Fe(E===void 0||E instanceof Buffer||E instanceof Uint8Array,16193),Dt.fromUint8Array(E||new Uint8Array))}(r,e.targetChange.resumeToken),h=e.targetChange.cause,f=h&&function(_){const E=_.code===void 0?G.UNKNOWN:xv(_.code);return new ce(E,_.message||"")}(h);t=new Mv(s,o,l,f||null)}else if("documentChange"in e){e.documentChange;const s=e.documentChange;s.document,s.document.name,s.document.updateTime;const o=yd(r,s.document.name),l=nr(s.document.updateTime),h=s.document.createTime?nr(s.document.createTime):Ee.min(),f=new En({mapValue:{fields:s.document.fields}}),g=jt.newFoundDocument(o,l,h,f),_=s.targetIds||[],E=s.removedTargetIds||[];t=new Hu(_,E,g.key,g)}else if("documentDelete"in e){e.documentDelete;const s=e.documentDelete;s.document;const o=yd(r,s.document),l=s.readTime?nr(s.readTime):Ee.min(),h=jt.newNoDocument(o,l),f=s.removedTargetIds||[];t=new Hu([],f,h.key,h)}else if("documentRemove"in e){e.documentRemove;const s=e.documentRemove;s.document;const o=yd(r,s.document),l=s.removedTargetIds||[];t=new Hu([],l,o,null)}else{if(!("filter"in e))return _e(11601,{At:e});{e.filter;const s=e.filter;s.targetId;const{count:o=0,unchangedNames:l}=s,h=new bA(o,l),f=s.targetId;t=new Lv(f,h)}}return t}function GA(r,e){let t;if(e instanceof hl)t={update:_y(r,e.key,e.value)};else if(e instanceof Vv)t={delete:Bd(r,e.key)};else if(e instanceof ms)t={update:_y(r,e.key,e.data),updateMask:rR(e.fieldMask)};else{if(!(e instanceof xA))return _e(16599,{Rt:e.type});t={verify:Bd(r,e.key)}}return e.fieldTransforms.length>0&&(t.updateTransforms=e.fieldTransforms.map(s=>function(l,h){const f=h.transform;if(f instanceof ac)return{fieldPath:h.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(f instanceof Za)return{fieldPath:h.field.canonicalString(),appendMissingElements:{values:f.elements}};if(f instanceof el)return{fieldPath:h.field.canonicalString(),removeAllFromArray:{values:f.elements}};if(f instanceof lc)return{fieldPath:h.field.canonicalString(),increment:f.Ee};throw _e(20930,{transform:h.transform})}(0,s))),e.precondition.isNone||(t.currentDocument=function(o,l){return l.updateTime!==void 0?{updateTime:HA(o,l.updateTime)}:l.exists!==void 0?{exists:l.exists}:_e(27497)}(r,e.precondition)),t}function QA(r,e){return r&&r.length>0?(Fe(e!==void 0,14353),r.map(t=>function(o,l){let h=o.updateTime?nr(o.updateTime):nr(l);return h.isEqual(Ee.min())&&(h=nr(l)),new DA(h,o.transformResults||[])}(t,e))):[]}function XA(r,e){return{documents:[Uv(r,e.path)]}}function JA(r,e){const t={structuredQuery:{}},s=e.path;let o;e.collectionGroup!==null?(o=s,t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(o=s.popLast(),t.structuredQuery.from=[{collectionId:s.lastSegment()}]),t.parent=Uv(r,o);const l=function(_){if(_.length!==0)return Bv(or.create(_,"and"))}(e.filters);l&&(t.structuredQuery.where=l);const h=function(_){if(_.length!==0)return _.map(E=>function(R){return{field:ho(R.field),direction:eR(R.dir)}}(E))}(e.orderBy);h&&(t.structuredQuery.orderBy=h);const f=jd(r,e.limit);return f!==null&&(t.structuredQuery.limit=f),e.startAt&&(t.structuredQuery.startAt=function(_){return{before:_.inclusive,values:_.position}}(e.startAt)),e.endAt&&(t.structuredQuery.endAt=function(_){return{before:!_.inclusive,values:_.position}}(e.endAt)),{Vt:t,parent:o}}function YA(r){let e=qA(r.parent);const t=r.structuredQuery,s=t.from?t.from.length:0;let o=null;if(s>0){Fe(s===1,65062);const E=t.from[0];E.allDescendants?o=E.collectionId:e=e.child(E.collectionId)}let l=[];t.where&&(l=function(T){const R=zv(T);return R instanceof or&&yv(R)?R.getFilters():[R]}(t.where));let h=[];t.orderBy&&(h=function(T){return T.map(R=>function(B){return new oc(fo(B.field),function(F){switch(F){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(B.direction))}(R))}(t.orderBy));let f=null;t.limit&&(f=function(T){let R;return R=typeof T=="object"?T.value:T,Ec(R)?null:R}(t.limit));let g=null;t.startAt&&(g=function(T){const R=!!T.before,j=T.values||[];return new sc(j,R)}(t.startAt));let _=null;return t.endAt&&(_=function(T){const R=!T.before,j=T.values||[];return new sc(j,R)}(t.endAt)),yA(e,o,h,l,f,"F",g,_)}function ZA(r,e){const t=function(o){switch(o){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return _e(28987,{purpose:o})}}(e.purpose);return t==null?null:{"goog-listen-tags":t}}function zv(r){return r.unaryFilter!==void 0?function(t){switch(t.unaryFilter.op){case"IS_NAN":const s=fo(t.unaryFilter.field);return gt.create(s,"==",{doubleValue:NaN});case"IS_NULL":const o=fo(t.unaryFilter.field);return gt.create(o,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const l=fo(t.unaryFilter.field);return gt.create(l,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const h=fo(t.unaryFilter.field);return gt.create(h,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return _e(61313);default:return _e(60726)}}(r):r.fieldFilter!==void 0?function(t){return gt.create(fo(t.fieldFilter.field),function(o){switch(o){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return _e(58110);default:return _e(50506)}}(t.fieldFilter.op),t.fieldFilter.value)}(r):r.compositeFilter!==void 0?function(t){return or.create(t.compositeFilter.filters.map(s=>zv(s)),function(o){switch(o){case"AND":return"and";case"OR":return"or";default:return _e(1026)}}(t.compositeFilter.op))}(r):_e(30097,{filter:r})}function eR(r){return zA[r]}function tR(r){return BA[r]}function nR(r){return $A[r]}function ho(r){return{fieldPath:r.canonicalString()}}function fo(r){return Nt.fromServerFormat(r.fieldPath)}function Bv(r){return r instanceof gt?function(t){if(t.op==="=="){if(sy(t.value))return{unaryFilter:{field:ho(t.field),op:"IS_NAN"}};if(iy(t.value))return{unaryFilter:{field:ho(t.field),op:"IS_NULL"}}}else if(t.op==="!="){if(sy(t.value))return{unaryFilter:{field:ho(t.field),op:"IS_NOT_NAN"}};if(iy(t.value))return{unaryFilter:{field:ho(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:ho(t.field),op:tR(t.op),value:t.value}}}(r):r instanceof or?function(t){const s=t.getFilters().map(o=>Bv(o));return s.length===1?s[0]:{compositeFilter:{op:nR(t.op),filters:s}}}(r):_e(54877,{filter:r})}function rR(r){const e=[];return r.fields.forEach(t=>e.push(t.canonicalString())),{fieldPaths:e}}function $v(r){return r.length>=4&&r.get(0)==="projects"&&r.get(2)==="databases"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hi{constructor(e,t,s,o,l=Ee.min(),h=Ee.min(),f=Dt.EMPTY_BYTE_STRING,g=null){this.target=e,this.targetId=t,this.purpose=s,this.sequenceNumber=o,this.snapshotVersion=l,this.lastLimboFreeSnapshotVersion=h,this.resumeToken=f,this.expectedCount=g}withSequenceNumber(e){return new hi(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new hi(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new hi(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new hi(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class iR{constructor(e){this.gt=e}}function sR(r){const e=YA({parent:r.parent,structuredQuery:r.structuredQuery});return r.limitType==="LAST"?Ud(e,e.limit,"L"):e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oR{constructor(){this.Dn=new aR}addToCollectionParentIndex(e,t){return this.Dn.add(t),W.resolve()}getCollectionParents(e,t){return W.resolve(this.Dn.getEntries(t))}addFieldIndex(e,t){return W.resolve()}deleteFieldIndex(e,t){return W.resolve()}deleteAllFieldIndexes(e){return W.resolve()}createTargetIndexes(e,t){return W.resolve()}getDocumentsMatchingTarget(e,t){return W.resolve(null)}getIndexType(e,t){return W.resolve(0)}getFieldIndexes(e,t){return W.resolve([])}getNextCollectionGroupToUpdate(e){return W.resolve(null)}getMinOffset(e,t){return W.resolve(vi.min())}getMinOffsetFromCollectionGroup(e,t){return W.resolve(vi.min())}updateCollectionGroup(e,t,s){return W.resolve()}updateIndexEntries(e,t){return W.resolve()}}class aR{constructor(){this.index={}}add(e){const t=e.lastSegment(),s=e.popLast(),o=this.index[t]||new yt(Ye.comparator),l=!o.has(s);return this.index[t]=o.add(s),l}has(e){const t=e.lastSegment(),s=e.popLast(),o=this.index[t];return o&&o.has(s)}getEntries(e){return(this.index[e]||new yt(Ye.comparator)).toArray()}}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vy={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},Wv=41943040;class en{static withCacheSize(e){return new en(e,en.DEFAULT_COLLECTION_PERCENTILE,en.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,t,s){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=t,this.maximumSequenceNumbersToCollect=s}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */en.DEFAULT_COLLECTION_PERCENTILE=10,en.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,en.DEFAULT=new en(Wv,en.DEFAULT_COLLECTION_PERCENTILE,en.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),en.DISABLED=new en(-1,0,0);/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Io{constructor(e){this._r=e}next(){return this._r+=2,this._r}static ar(){return new Io(0)}static ur(){return new Io(-1)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ey="LruGarbageCollector",lR=1048576;function wy([r,e],[t,s]){const o=Ie(r,t);return o===0?Ie(e,s):o}class uR{constructor(e){this.Tr=e,this.buffer=new yt(wy),this.Ir=0}dr(){return++this.Ir}Er(e){const t=[e,this.dr()];if(this.buffer.size<this.Tr)this.buffer=this.buffer.add(t);else{const s=this.buffer.last();wy(t,s)<0&&(this.buffer=this.buffer.delete(s).add(t))}}get maxValue(){return this.buffer.last()[0]}}class cR{constructor(e,t,s){this.garbageCollector=e,this.asyncQueue=t,this.localStore=s,this.Ar=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.Rr(6e4)}stop(){this.Ar&&(this.Ar.cancel(),this.Ar=null)}get started(){return this.Ar!==null}Rr(e){te(Ey,`Garbage collection scheduled in ${e}ms`),this.Ar=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,async()=>{this.Ar=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(t){Oo(t)?te(Ey,"Ignoring IndexedDB error during garbage collection: ",t):await Do(t)}await this.Rr(3e5)})}}class hR{constructor(e,t){this.Vr=e,this.params=t}calculateTargetCount(e,t){return this.Vr.mr(e).next(s=>Math.floor(t/100*s))}nthSequenceNumber(e,t){if(t===0)return W.resolve(vc.ue);const s=new uR(t);return this.Vr.forEachTarget(e,o=>s.Er(o.sequenceNumber)).next(()=>this.Vr.gr(e,o=>s.Er(o))).next(()=>s.maxValue)}removeTargets(e,t,s){return this.Vr.removeTargets(e,t,s)}removeOrphanedDocuments(e,t){return this.Vr.removeOrphanedDocuments(e,t)}collect(e,t){return this.params.cacheSizeCollectionThreshold===-1?(te("LruGarbageCollector","Garbage collection skipped; disabled"),W.resolve(vy)):this.getCacheSize(e).next(s=>s<this.params.cacheSizeCollectionThreshold?(te("LruGarbageCollector",`Garbage collection skipped; Cache size ${s} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),vy):this.pr(e,t))}getCacheSize(e){return this.Vr.getCacheSize(e)}pr(e,t){let s,o,l,h,f,g,_;const E=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next(T=>(T>this.params.maximumSequenceNumbersToCollect?(te("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${T}`),o=this.params.maximumSequenceNumbersToCollect):o=T,h=Date.now(),this.nthSequenceNumber(e,o))).next(T=>(s=T,f=Date.now(),this.removeTargets(e,s,t))).next(T=>(l=T,g=Date.now(),this.removeOrphanedDocuments(e,s))).next(T=>(_=Date.now(),uo()<=Ce.DEBUG&&te("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${h-E}ms
	Determined least recently used ${o} in `+(f-h)+`ms
	Removed ${l} targets in `+(g-f)+`ms
	Removed ${T} documents in `+(_-g)+`ms
Total Duration: ${_-E}ms`),W.resolve({didRun:!0,sequenceNumbersCollected:o,targetsRemoved:l,documentsRemoved:T})))}}function dR(r,e){return new hR(r,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fR{constructor(){this.changes=new ps(e=>e.toString(),(e,t)=>e.isEqual(t)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,jt.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const s=this.changes.get(t);return s!==void 0?W.resolve(s):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pR{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mR{constructor(e,t,s,o){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=s,this.indexManager=o}getDocument(e,t){let s=null;return this.documentOverlayCache.getOverlay(e,t).next(o=>(s=o,this.remoteDocumentCache.getEntry(e,t))).next(o=>(s!==null&&za(s.mutation,o,Un.empty(),Ke.now()),o))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next(s=>this.getLocalViewOfDocuments(e,s,Pe()).next(()=>s))}getLocalViewOfDocuments(e,t,s=Pe()){const o=is();return this.populateOverlays(e,o,t).next(()=>this.computeViews(e,t,o,s).next(l=>{let h=Va();return l.forEach((f,g)=>{h=h.insert(f,g.overlayedDocument)}),h}))}getOverlayedDocuments(e,t){const s=is();return this.populateOverlays(e,s,t).next(()=>this.computeViews(e,t,s,Pe()))}populateOverlays(e,t,s){const o=[];return s.forEach(l=>{t.has(l)||o.push(l)}),this.documentOverlayCache.getOverlays(e,o).next(l=>{l.forEach((h,f)=>{t.set(h,f)})})}computeViews(e,t,s,o){let l=Or();const h=ja(),f=function(){return ja()}();return t.forEach((g,_)=>{const E=s.get(_.key);o.has(_.key)&&(E===void 0||E.mutation instanceof ms)?l=l.insert(_.key,_):E!==void 0?(h.set(_.key,E.mutation.getFieldMask()),za(E.mutation,_,E.mutation.getFieldMask(),Ke.now())):h.set(_.key,Un.empty())}),this.recalculateAndSaveOverlays(e,l).next(g=>(g.forEach((_,E)=>h.set(_,E)),t.forEach((_,E)=>{var T;return f.set(_,new pR(E,(T=h.get(_))!==null&&T!==void 0?T:null))}),f))}recalculateAndSaveOverlays(e,t){const s=ja();let o=new Ze((h,f)=>h-f),l=Pe();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next(h=>{for(const f of h)f.keys().forEach(g=>{const _=t.get(g);if(_===null)return;let E=s.get(g)||Un.empty();E=f.applyToLocalView(_,E),s.set(g,E);const T=(o.get(f.batchId)||Pe()).add(g);o=o.insert(f.batchId,T)})}).next(()=>{const h=[],f=o.getReverseIterator();for(;f.hasNext();){const g=f.getNext(),_=g.key,E=g.value,T=Av();E.forEach(R=>{if(!l.has(R)){const j=Dv(t.get(R),s.get(R));j!==null&&T.set(R,j),l=l.add(R)}}),h.push(this.documentOverlayCache.saveOverlays(e,_,T))}return W.waitFor(h)}).next(()=>s)}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next(s=>this.recalculateAndSaveOverlays(e,s))}getDocumentsMatchingQuery(e,t,s,o){return function(h){return me.isDocumentKey(h.path)&&h.collectionGroup===null&&h.filters.length===0}(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):_A(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,s,o):this.getDocumentsMatchingCollectionQuery(e,t,s,o)}getNextDocuments(e,t,s,o){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,s,o).next(l=>{const h=o-l.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,s.largestBatchId,o-l.size):W.resolve(is());let f=Qa,g=l;return h.next(_=>W.forEach(_,(E,T)=>(f<T.largestBatchId&&(f=T.largestBatchId),l.get(E)?W.resolve():this.remoteDocumentCache.getEntry(e,E).next(R=>{g=g.insert(E,R)}))).next(()=>this.populateOverlays(e,_,l)).next(()=>this.computeViews(e,g,_,Pe())).next(E=>({batchId:f,changes:Sv(E)})))})}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new me(t)).next(s=>{let o=Va();return s.isFoundDocument()&&(o=o.insert(s.key,s)),o})}getDocumentsMatchingCollectionGroupQuery(e,t,s,o){const l=t.collectionGroup;let h=Va();return this.indexManager.getCollectionParents(e,l).next(f=>W.forEach(f,g=>{const _=function(T,R){return new Tc(R,null,T.explicitOrderBy.slice(),T.filters.slice(),T.limit,T.limitType,T.startAt,T.endAt)}(t,g.child(l));return this.getDocumentsMatchingCollectionQuery(e,_,s,o).next(E=>{E.forEach((T,R)=>{h=h.insert(T,R)})})}).next(()=>h))}getDocumentsMatchingCollectionQuery(e,t,s,o){let l;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,s.largestBatchId).next(h=>(l=h,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,s,l,o))).next(h=>{l.forEach((g,_)=>{const E=_.getKey();h.get(E)===null&&(h=h.insert(E,jt.newInvalidDocument(E)))});let f=Va();return h.forEach((g,_)=>{const E=l.get(g);E!==void 0&&za(E.mutation,_,Un.empty(),Ke.now()),Sc(t,_)&&(f=f.insert(g,_))}),f})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gR{constructor(e){this.serializer=e,this.Br=new Map,this.Lr=new Map}getBundleMetadata(e,t){return W.resolve(this.Br.get(t))}saveBundleMetadata(e,t){return this.Br.set(t.id,function(o){return{id:o.id,version:o.version,createTime:nr(o.createTime)}}(t)),W.resolve()}getNamedQuery(e,t){return W.resolve(this.Lr.get(t))}saveNamedQuery(e,t){return this.Lr.set(t.name,function(o){return{name:o.name,query:sR(o.bundledQuery),readTime:nr(o.readTime)}}(t)),W.resolve()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yR{constructor(){this.overlays=new Ze(me.comparator),this.kr=new Map}getOverlay(e,t){return W.resolve(this.overlays.get(t))}getOverlays(e,t){const s=is();return W.forEach(t,o=>this.getOverlay(e,o).next(l=>{l!==null&&s.set(o,l)})).next(()=>s)}saveOverlays(e,t,s){return s.forEach((o,l)=>{this.wt(e,t,l)}),W.resolve()}removeOverlaysForBatchId(e,t,s){const o=this.kr.get(s);return o!==void 0&&(o.forEach(l=>this.overlays=this.overlays.remove(l)),this.kr.delete(s)),W.resolve()}getOverlaysForCollection(e,t,s){const o=is(),l=t.length+1,h=new me(t.child("")),f=this.overlays.getIteratorFrom(h);for(;f.hasNext();){const g=f.getNext().value,_=g.getKey();if(!t.isPrefixOf(_.path))break;_.path.length===l&&g.largestBatchId>s&&o.set(g.getKey(),g)}return W.resolve(o)}getOverlaysForCollectionGroup(e,t,s,o){let l=new Ze((_,E)=>_-E);const h=this.overlays.getIterator();for(;h.hasNext();){const _=h.getNext().value;if(_.getKey().getCollectionGroup()===t&&_.largestBatchId>s){let E=l.get(_.largestBatchId);E===null&&(E=is(),l=l.insert(_.largestBatchId,E)),E.set(_.getKey(),_)}}const f=is(),g=l.getIterator();for(;g.hasNext()&&(g.getNext().value.forEach((_,E)=>f.set(_,E)),!(f.size()>=o)););return W.resolve(f)}wt(e,t,s){const o=this.overlays.get(s.key);if(o!==null){const h=this.kr.get(o.largestBatchId).delete(s.key);this.kr.set(o.largestBatchId,h)}this.overlays=this.overlays.insert(s.key,new MA(t,s));let l=this.kr.get(t);l===void 0&&(l=Pe(),this.kr.set(t,l)),this.kr.set(t,l.add(s.key))}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _R{constructor(){this.sessionToken=Dt.EMPTY_BYTE_STRING}getSessionToken(e){return W.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,W.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rf{constructor(){this.qr=new yt(It.Qr),this.$r=new yt(It.Ur)}isEmpty(){return this.qr.isEmpty()}addReference(e,t){const s=new It(e,t);this.qr=this.qr.add(s),this.$r=this.$r.add(s)}Kr(e,t){e.forEach(s=>this.addReference(s,t))}removeReference(e,t){this.Wr(new It(e,t))}Gr(e,t){e.forEach(s=>this.removeReference(s,t))}zr(e){const t=new me(new Ye([])),s=new It(t,e),o=new It(t,e+1),l=[];return this.$r.forEachInRange([s,o],h=>{this.Wr(h),l.push(h.key)}),l}jr(){this.qr.forEach(e=>this.Wr(e))}Wr(e){this.qr=this.qr.delete(e),this.$r=this.$r.delete(e)}Jr(e){const t=new me(new Ye([])),s=new It(t,e),o=new It(t,e+1);let l=Pe();return this.$r.forEachInRange([s,o],h=>{l=l.add(h.key)}),l}containsKey(e){const t=new It(e,0),s=this.qr.firstAfterOrEqual(t);return s!==null&&e.isEqual(s.key)}}class It{constructor(e,t){this.key=e,this.Hr=t}static Qr(e,t){return me.comparator(e.key,t.key)||Ie(e.Hr,t.Hr)}static Ur(e,t){return Ie(e.Hr,t.Hr)||me.comparator(e.key,t.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vR{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.er=1,this.Yr=new yt(It.Qr)}checkEmpty(e){return W.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,s,o){const l=this.er;this.er++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const h=new LA(l,t,s,o);this.mutationQueue.push(h);for(const f of o)this.Yr=this.Yr.add(new It(f.key,l)),this.indexManager.addToCollectionParentIndex(e,f.key.path.popLast());return W.resolve(h)}lookupMutationBatch(e,t){return W.resolve(this.Zr(t))}getNextMutationBatchAfterBatchId(e,t){const s=t+1,o=this.Xr(s),l=o<0?0:o;return W.resolve(this.mutationQueue.length>l?this.mutationQueue[l]:null)}getHighestUnacknowledgedBatchId(){return W.resolve(this.mutationQueue.length===0?gf:this.er-1)}getAllMutationBatches(e){return W.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const s=new It(t,0),o=new It(t,Number.POSITIVE_INFINITY),l=[];return this.Yr.forEachInRange([s,o],h=>{const f=this.Zr(h.Hr);l.push(f)}),W.resolve(l)}getAllMutationBatchesAffectingDocumentKeys(e,t){let s=new yt(Ie);return t.forEach(o=>{const l=new It(o,0),h=new It(o,Number.POSITIVE_INFINITY);this.Yr.forEachInRange([l,h],f=>{s=s.add(f.Hr)})}),W.resolve(this.ei(s))}getAllMutationBatchesAffectingQuery(e,t){const s=t.path,o=s.length+1;let l=s;me.isDocumentKey(l)||(l=l.child(""));const h=new It(new me(l),0);let f=new yt(Ie);return this.Yr.forEachWhile(g=>{const _=g.key.path;return!!s.isPrefixOf(_)&&(_.length===o&&(f=f.add(g.Hr)),!0)},h),W.resolve(this.ei(f))}ei(e){const t=[];return e.forEach(s=>{const o=this.Zr(s);o!==null&&t.push(o)}),t}removeMutationBatch(e,t){Fe(this.ti(t.batchId,"removed")===0,55003),this.mutationQueue.shift();let s=this.Yr;return W.forEach(t.mutations,o=>{const l=new It(o.key,t.batchId);return s=s.delete(l),this.referenceDelegate.markPotentiallyOrphaned(e,o.key)}).next(()=>{this.Yr=s})}rr(e){}containsKey(e,t){const s=new It(t,0),o=this.Yr.firstAfterOrEqual(s);return W.resolve(t.isEqual(o&&o.key))}performConsistencyCheck(e){return this.mutationQueue.length,W.resolve()}ti(e,t){return this.Xr(e)}Xr(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Zr(e){const t=this.Xr(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ER{constructor(e){this.ni=e,this.docs=function(){return new Ze(me.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const s=t.key,o=this.docs.get(s),l=o?o.size:0,h=this.ni(t);return this.docs=this.docs.insert(s,{document:t.mutableCopy(),size:h}),this.size+=h-l,this.indexManager.addToCollectionParentIndex(e,s.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const s=this.docs.get(t);return W.resolve(s?s.document.mutableCopy():jt.newInvalidDocument(t))}getEntries(e,t){let s=Or();return t.forEach(o=>{const l=this.docs.get(o);s=s.insert(o,l?l.document.mutableCopy():jt.newInvalidDocument(o))}),W.resolve(s)}getDocumentsMatchingQuery(e,t,s,o){let l=Or();const h=t.path,f=new me(h.child("__id-9223372036854775808__")),g=this.docs.getIteratorFrom(f);for(;g.hasNext();){const{key:_,value:{document:E}}=g.getNext();if(!h.isPrefixOf(_.path))break;_.path.length>h.length+1||Q1(G1(E),s)<=0||(o.has(E.key)||Sc(t,E))&&(l=l.insert(E.key,E.mutableCopy()))}return W.resolve(l)}getAllFromCollectionGroup(e,t,s,o){_e(9500)}ri(e,t){return W.forEach(this.docs,s=>t(s))}newChangeBuffer(e){return new wR(this)}getSize(e){return W.resolve(this.size)}}class wR extends fR{constructor(e){super(),this.Or=e}applyChanges(e){const t=[];return this.changes.forEach((s,o)=>{o.isValidDocument()?t.push(this.Or.addEntry(e,o)):this.Or.removeEntry(s)}),W.waitFor(t)}getFromCache(e,t){return this.Or.getEntry(e,t)}getAllFromCache(e,t){return this.Or.getEntries(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class TR{constructor(e){this.persistence=e,this.ii=new ps(t=>vf(t),Ef),this.lastRemoteSnapshotVersion=Ee.min(),this.highestTargetId=0,this.si=0,this.oi=new Rf,this.targetCount=0,this._i=Io.ar()}forEachTarget(e,t){return this.ii.forEach((s,o)=>t(o)),W.resolve()}getLastRemoteSnapshotVersion(e){return W.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return W.resolve(this.si)}allocateTargetId(e){return this.highestTargetId=this._i.next(),W.resolve(this.highestTargetId)}setTargetsMetadata(e,t,s){return s&&(this.lastRemoteSnapshotVersion=s),t>this.si&&(this.si=t),W.resolve()}hr(e){this.ii.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this._i=new Io(t),this.highestTargetId=t),e.sequenceNumber>this.si&&(this.si=e.sequenceNumber)}addTargetData(e,t){return this.hr(t),this.targetCount+=1,W.resolve()}updateTargetData(e,t){return this.hr(t),W.resolve()}removeTargetData(e,t){return this.ii.delete(t.target),this.oi.zr(t.targetId),this.targetCount-=1,W.resolve()}removeTargets(e,t,s){let o=0;const l=[];return this.ii.forEach((h,f)=>{f.sequenceNumber<=t&&s.get(f.targetId)===null&&(this.ii.delete(h),l.push(this.removeMatchingKeysForTargetId(e,f.targetId)),o++)}),W.waitFor(l).next(()=>o)}getTargetCount(e){return W.resolve(this.targetCount)}getTargetData(e,t){const s=this.ii.get(t)||null;return W.resolve(s)}addMatchingKeys(e,t,s){return this.oi.Kr(t,s),W.resolve()}removeMatchingKeys(e,t,s){this.oi.Gr(t,s);const o=this.persistence.referenceDelegate,l=[];return o&&t.forEach(h=>{l.push(o.markPotentiallyOrphaned(e,h))}),W.waitFor(l)}removeMatchingKeysForTargetId(e,t){return this.oi.zr(t),W.resolve()}getMatchingKeysForTargetId(e,t){const s=this.oi.Jr(t);return W.resolve(s)}containsKey(e,t){return W.resolve(this.oi.containsKey(t))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hv{constructor(e,t){this.ai={},this.overlays={},this.ui=new vc(0),this.ci=!1,this.ci=!0,this.li=new _R,this.referenceDelegate=e(this),this.hi=new TR(this),this.indexManager=new oR,this.remoteDocumentCache=function(o){return new ER(o)}(s=>this.referenceDelegate.Pi(s)),this.serializer=new iR(t),this.Ti=new gR(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.ci=!1,Promise.resolve()}get started(){return this.ci}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new yR,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let s=this.ai[e.toKey()];return s||(s=new vR(t,this.referenceDelegate),this.ai[e.toKey()]=s),s}getGlobalsCache(){return this.li}getTargetCache(){return this.hi}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Ti}runTransaction(e,t,s){te("MemoryPersistence","Starting transaction:",e);const o=new IR(this.ui.next());return this.referenceDelegate.Ii(),s(o).next(l=>this.referenceDelegate.di(o).next(()=>l)).toPromise().then(l=>(o.raiseOnCommittedEvent(),l))}Ei(e,t){return W.or(Object.values(this.ai).map(s=>()=>s.containsKey(e,t)))}}class IR extends J1{constructor(e){super(),this.currentSequenceNumber=e}}class Cf{constructor(e){this.persistence=e,this.Ai=new Rf,this.Ri=null}static Vi(e){return new Cf(e)}get mi(){if(this.Ri)return this.Ri;throw _e(60996)}addReference(e,t,s){return this.Ai.addReference(s,t),this.mi.delete(s.toString()),W.resolve()}removeReference(e,t,s){return this.Ai.removeReference(s,t),this.mi.add(s.toString()),W.resolve()}markPotentiallyOrphaned(e,t){return this.mi.add(t.toString()),W.resolve()}removeTarget(e,t){this.Ai.zr(t.targetId).forEach(o=>this.mi.add(o.toString()));const s=this.persistence.getTargetCache();return s.getMatchingKeysForTargetId(e,t.targetId).next(o=>{o.forEach(l=>this.mi.add(l.toString()))}).next(()=>s.removeTargetData(e,t))}Ii(){this.Ri=new Set}di(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return W.forEach(this.mi,s=>{const o=me.fromPath(s);return this.fi(e,o).next(l=>{l||t.removeEntry(o,Ee.min())})}).next(()=>(this.Ri=null,t.apply(e)))}updateLimboDocument(e,t){return this.fi(e,t).next(s=>{s?this.mi.delete(t.toString()):this.mi.add(t.toString())})}Pi(e){return 0}fi(e,t){return W.or([()=>W.resolve(this.Ai.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.Ei(e,t)])}}class cc{constructor(e,t){this.persistence=e,this.gi=new ps(s=>eA(s.path),(s,o)=>s.isEqual(o)),this.garbageCollector=dR(this,t)}static Vi(e,t){return new cc(e,t)}Ii(){}di(e){return W.resolve()}forEachTarget(e,t){return this.persistence.getTargetCache().forEachTarget(e,t)}mr(e){const t=this.yr(e);return this.persistence.getTargetCache().getTargetCount(e).next(s=>t.next(o=>s+o))}yr(e){let t=0;return this.gr(e,s=>{t++}).next(()=>t)}gr(e,t){return W.forEach(this.gi,(s,o)=>this.Sr(e,s,o).next(l=>l?W.resolve():t(o)))}removeTargets(e,t,s){return this.persistence.getTargetCache().removeTargets(e,t,s)}removeOrphanedDocuments(e,t){let s=0;const o=this.persistence.getRemoteDocumentCache(),l=o.newChangeBuffer();return o.ri(e,h=>this.Sr(e,h,t).next(f=>{f||(s++,l.removeEntry(h,Ee.min()))})).next(()=>l.apply(e)).next(()=>s)}markPotentiallyOrphaned(e,t){return this.gi.set(t,e.currentSequenceNumber),W.resolve()}removeTarget(e,t){const s=t.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,s)}addReference(e,t,s){return this.gi.set(s,e.currentSequenceNumber),W.resolve()}removeReference(e,t,s){return this.gi.set(s,e.currentSequenceNumber),W.resolve()}updateLimboDocument(e,t){return this.gi.set(t,e.currentSequenceNumber),W.resolve()}Pi(e){let t=e.key.toString().length;return e.isFoundDocument()&&(t+=Bu(e.data.value)),t}Sr(e,t,s){return W.or([()=>this.persistence.Ei(e,t),()=>this.persistence.getTargetCache().containsKey(e,t),()=>{const o=this.gi.get(t);return W.resolve(o!==void 0&&o>s)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pf{constructor(e,t,s,o){this.targetId=e,this.fromCache=t,this.Is=s,this.ds=o}static Es(e,t){let s=Pe(),o=Pe();for(const l of t.docChanges)switch(l.type){case 0:s=s.add(l.doc.key);break;case 1:o=o.add(l.doc.key)}return new Pf(e,t.fromCache,s,o)}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class SR{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class AR{constructor(){this.As=!1,this.Rs=!1,this.Vs=100,this.fs=function(){return aT()?8:Y1(zt())>0?6:4}()}initialize(e,t){this.gs=e,this.indexManager=t,this.As=!0}getDocumentsMatchingQuery(e,t,s,o){const l={result:null};return this.ps(e,t).next(h=>{l.result=h}).next(()=>{if(!l.result)return this.ys(e,t,o,s).next(h=>{l.result=h})}).next(()=>{if(l.result)return;const h=new SR;return this.ws(e,t,h).next(f=>{if(l.result=f,this.Rs)return this.Ss(e,t,h,f.size)})}).next(()=>l.result)}Ss(e,t,s,o){return s.documentReadCount<this.Vs?(uo()<=Ce.DEBUG&&te("QueryEngine","SDK will not create cache indexes for query:",co(t),"since it only creates cache indexes for collection contains","more than or equal to",this.Vs,"documents"),W.resolve()):(uo()<=Ce.DEBUG&&te("QueryEngine","Query:",co(t),"scans",s.documentReadCount,"local documents and returns",o,"documents as results."),s.documentReadCount>this.fs*o?(uo()<=Ce.DEBUG&&te("QueryEngine","The SDK decides to create cache indexes for query:",co(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,tr(t))):W.resolve())}ps(e,t){if(uy(t))return W.resolve(null);let s=tr(t);return this.indexManager.getIndexType(e,s).next(o=>o===0?null:(t.limit!==null&&o===1&&(t=Ud(t,null,"F"),s=tr(t)),this.indexManager.getDocumentsMatchingTarget(e,s).next(l=>{const h=Pe(...l);return this.gs.getDocuments(e,h).next(f=>this.indexManager.getMinOffset(e,s).next(g=>{const _=this.bs(t,f);return this.Ds(t,_,h,g.readTime)?this.ps(e,Ud(t,null,"F")):this.vs(e,_,t,g)}))})))}ys(e,t,s,o){return uy(t)||o.isEqual(Ee.min())?W.resolve(null):this.gs.getDocuments(e,s).next(l=>{const h=this.bs(t,l);return this.Ds(t,h,s,o)?W.resolve(null):(uo()<=Ce.DEBUG&&te("QueryEngine","Re-using previous result from %s to execute query: %s",o.toString(),co(t)),this.vs(e,h,t,K1(o,Qa)).next(f=>f))})}bs(e,t){let s=new yt(Tv(e));return t.forEach((o,l)=>{Sc(e,l)&&(s=s.add(l))}),s}Ds(e,t,s,o){if(e.limit===null)return!1;if(s.size!==t.size)return!0;const l=e.limitType==="F"?t.last():t.first();return!!l&&(l.hasPendingWrites||l.version.compareTo(o)>0)}ws(e,t,s){return uo()<=Ce.DEBUG&&te("QueryEngine","Using full collection scan to execute query:",co(t)),this.gs.getDocumentsMatchingQuery(e,t,vi.min(),s)}vs(e,t,s,o){return this.gs.getDocumentsMatchingQuery(e,s,o).next(l=>(t.forEach(h=>{l=l.insert(h.key,h)}),l))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const kf="LocalStore",RR=3e8;class CR{constructor(e,t,s,o){this.persistence=e,this.Cs=t,this.serializer=o,this.Fs=new Ze(Ie),this.Ms=new ps(l=>vf(l),Ef),this.xs=new Map,this.Os=e.getRemoteDocumentCache(),this.hi=e.getTargetCache(),this.Ti=e.getBundleCache(),this.Ns(s)}Ns(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new mR(this.Os,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.Os.setIndexManager(this.indexManager),this.Cs.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",t=>e.collect(t,this.Fs))}}function PR(r,e,t,s){return new CR(r,e,t,s)}async function qv(r,e){const t=we(r);return await t.persistence.runTransaction("Handle user change","readonly",s=>{let o;return t.mutationQueue.getAllMutationBatches(s).next(l=>(o=l,t.Ns(e),t.mutationQueue.getAllMutationBatches(s))).next(l=>{const h=[],f=[];let g=Pe();for(const _ of o){h.push(_.batchId);for(const E of _.mutations)g=g.add(E.key)}for(const _ of l){f.push(_.batchId);for(const E of _.mutations)g=g.add(E.key)}return t.localDocuments.getDocuments(s,g).next(_=>({Bs:_,removedBatchIds:h,addedBatchIds:f}))})})}function kR(r,e){const t=we(r);return t.persistence.runTransaction("Acknowledge batch","readwrite-primary",s=>{const o=e.batch.keys(),l=t.Os.newChangeBuffer({trackRemovals:!0});return function(f,g,_,E){const T=_.batch,R=T.keys();let j=W.resolve();return R.forEach(B=>{j=j.next(()=>E.getEntry(g,B)).next($=>{const F=_.docVersions.get(B);Fe(F!==null,48541),$.version.compareTo(F)<0&&(T.applyToRemoteDocument($,_),$.isValidDocument()&&($.setReadTime(_.commitVersion),E.addEntry($)))})}),j.next(()=>f.mutationQueue.removeMutationBatch(g,T))}(t,s,e,l).next(()=>l.apply(s)).next(()=>t.mutationQueue.performConsistencyCheck(s)).next(()=>t.documentOverlayCache.removeOverlaysForBatchId(s,o,e.batch.batchId)).next(()=>t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(s,function(f){let g=Pe();for(let _=0;_<f.mutationResults.length;++_)f.mutationResults[_].transformResults.length>0&&(g=g.add(f.batch.mutations[_].key));return g}(e))).next(()=>t.localDocuments.getDocuments(s,o))})}function Kv(r){const e=we(r);return e.persistence.runTransaction("Get last remote snapshot version","readonly",t=>e.hi.getLastRemoteSnapshotVersion(t))}function NR(r,e){const t=we(r),s=e.snapshotVersion;let o=t.Fs;return t.persistence.runTransaction("Apply remote event","readwrite-primary",l=>{const h=t.Os.newChangeBuffer({trackRemovals:!0});o=t.Fs;const f=[];e.targetChanges.forEach((E,T)=>{const R=o.get(T);if(!R)return;f.push(t.hi.removeMatchingKeys(l,E.removedDocuments,T).next(()=>t.hi.addMatchingKeys(l,E.addedDocuments,T)));let j=R.withSequenceNumber(l.currentSequenceNumber);e.targetMismatches.get(T)!==null?j=j.withResumeToken(Dt.EMPTY_BYTE_STRING,Ee.min()).withLastLimboFreeSnapshotVersion(Ee.min()):E.resumeToken.approximateByteSize()>0&&(j=j.withResumeToken(E.resumeToken,s)),o=o.insert(T,j),function($,F,ae){return $.resumeToken.approximateByteSize()===0||F.snapshotVersion.toMicroseconds()-$.snapshotVersion.toMicroseconds()>=RR?!0:ae.addedDocuments.size+ae.modifiedDocuments.size+ae.removedDocuments.size>0}(R,j,E)&&f.push(t.hi.updateTargetData(l,j))});let g=Or(),_=Pe();if(e.documentUpdates.forEach(E=>{e.resolvedLimboDocuments.has(E)&&f.push(t.persistence.referenceDelegate.updateLimboDocument(l,E))}),f.push(DR(l,h,e.documentUpdates).next(E=>{g=E.Ls,_=E.ks})),!s.isEqual(Ee.min())){const E=t.hi.getLastRemoteSnapshotVersion(l).next(T=>t.hi.setTargetsMetadata(l,l.currentSequenceNumber,s));f.push(E)}return W.waitFor(f).next(()=>h.apply(l)).next(()=>t.localDocuments.getLocalViewOfDocuments(l,g,_)).next(()=>g)}).then(l=>(t.Fs=o,l))}function DR(r,e,t){let s=Pe(),o=Pe();return t.forEach(l=>s=s.add(l)),e.getEntries(r,s).next(l=>{let h=Or();return t.forEach((f,g)=>{const _=l.get(f);g.isFoundDocument()!==_.isFoundDocument()&&(o=o.add(f)),g.isNoDocument()&&g.version.isEqual(Ee.min())?(e.removeEntry(f,g.readTime),h=h.insert(f,g)):!_.isValidDocument()||g.version.compareTo(_.version)>0||g.version.compareTo(_.version)===0&&_.hasPendingWrites?(e.addEntry(g),h=h.insert(f,g)):te(kf,"Ignoring outdated watch update for ",f,". Current version:",_.version," Watch version:",g.version)}),{Ls:h,ks:o}})}function OR(r,e){const t=we(r);return t.persistence.runTransaction("Get next mutation batch","readonly",s=>(e===void 0&&(e=gf),t.mutationQueue.getNextMutationBatchAfterBatchId(s,e)))}function VR(r,e){const t=we(r);return t.persistence.runTransaction("Allocate target","readwrite",s=>{let o;return t.hi.getTargetData(s,e).next(l=>l?(o=l,W.resolve(o)):t.hi.allocateTargetId(s).next(h=>(o=new hi(e,h,"TargetPurposeListen",s.currentSequenceNumber),t.hi.addTargetData(s,o).next(()=>o))))}).then(s=>{const o=t.Fs.get(s.targetId);return(o===null||s.snapshotVersion.compareTo(o.snapshotVersion)>0)&&(t.Fs=t.Fs.insert(s.targetId,s),t.Ms.set(e,s.targetId)),s})}async function Wd(r,e,t){const s=we(r),o=s.Fs.get(e),l=t?"readwrite":"readwrite-primary";try{t||await s.persistence.runTransaction("Release target",l,h=>s.persistence.referenceDelegate.removeTarget(h,o))}catch(h){if(!Oo(h))throw h;te(kf,`Failed to update sequence numbers for target ${e}: ${h}`)}s.Fs=s.Fs.remove(e),s.Ms.delete(o.target)}function Ty(r,e,t){const s=we(r);let o=Ee.min(),l=Pe();return s.persistence.runTransaction("Execute query","readwrite",h=>function(g,_,E){const T=we(g),R=T.Ms.get(E);return R!==void 0?W.resolve(T.Fs.get(R)):T.hi.getTargetData(_,E)}(s,h,tr(e)).next(f=>{if(f)return o=f.lastLimboFreeSnapshotVersion,s.hi.getMatchingKeysForTargetId(h,f.targetId).next(g=>{l=g})}).next(()=>s.Cs.getDocumentsMatchingQuery(h,e,t?o:Ee.min(),t?l:Pe())).next(f=>(xR(s,EA(e),f),{documents:f,qs:l})))}function xR(r,e,t){let s=r.xs.get(e)||Ee.min();t.forEach((o,l)=>{l.readTime.compareTo(s)>0&&(s=l.readTime)}),r.xs.set(e,s)}class Iy{constructor(){this.activeTargetIds=RA()}Gs(e){this.activeTargetIds=this.activeTargetIds.add(e)}zs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Ws(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class LR{constructor(){this.Fo=new Iy,this.Mo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,s){}addLocalQueryTarget(e,t=!0){return t&&this.Fo.Gs(e),this.Mo[e]||"not-current"}updateQueryState(e,t,s){this.Mo[e]=t}removeLocalQueryTarget(e){this.Fo.zs(e)}isLocalQueryTarget(e){return this.Fo.activeTargetIds.has(e)}clearQueryState(e){delete this.Mo[e]}getAllActiveQueryTargets(){return this.Fo.activeTargetIds}isActiveQueryTarget(e){return this.Fo.activeTargetIds.has(e)}start(){return this.Fo=new Iy,Promise.resolve()}handleUserChange(e,t,s){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class MR{xo(e){}shutdown(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Sy="ConnectivityMonitor";class Ay{constructor(){this.Oo=()=>this.No(),this.Bo=()=>this.Lo(),this.ko=[],this.qo()}xo(e){this.ko.push(e)}shutdown(){window.removeEventListener("online",this.Oo),window.removeEventListener("offline",this.Bo)}qo(){window.addEventListener("online",this.Oo),window.addEventListener("offline",this.Bo)}No(){te(Sy,"Network connectivity changed: AVAILABLE");for(const e of this.ko)e(0)}Lo(){te(Sy,"Network connectivity changed: UNAVAILABLE");for(const e of this.ko)e(1)}static C(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Mu=null;function Hd(){return Mu===null?Mu=function(){return 268435456+Math.round(2147483648*Math.random())}():Mu++,"0x"+Mu.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _d="RestConnection",bR={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};class FR{get Qo(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const t=e.ssl?"https":"http",s=encodeURIComponent(this.databaseId.projectId),o=encodeURIComponent(this.databaseId.database);this.$o=t+"://"+e.host,this.Uo=`projects/${s}/databases/${o}`,this.Ko=this.databaseId.database===rc?`project_id=${s}`:`project_id=${s}&database_id=${o}`}Wo(e,t,s,o,l){const h=Hd(),f=this.Go(e,t.toUriEncodedString());te(_d,`Sending RPC '${e}' ${h}:`,f,s);const g={"google-cloud-resource-prefix":this.Uo,"x-goog-request-params":this.Ko};this.zo(g,o,l);const{host:_}=new URL(f),E=Co(_);return this.jo(e,f,g,s,E).then(T=>(te(_d,`Received RPC '${e}' ${h}: `,T),T),T=>{throw _i(_d,`RPC '${e}' ${h} failed with error: `,T,"url: ",f,"request:",s),T})}Jo(e,t,s,o,l,h){return this.Wo(e,t,s,o,l)}zo(e,t,s){e["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+No}(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),t&&t.headers.forEach((o,l)=>e[l]=o),s&&s.headers.forEach((o,l)=>e[l]=o)}Go(e,t){const s=bR[e];return`${this.$o}/v1/${t}:${s}`}terminate(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class UR{constructor(e){this.Ho=e.Ho,this.Yo=e.Yo}Zo(e){this.Xo=e}e_(e){this.t_=e}n_(e){this.r_=e}onMessage(e){this.i_=e}close(){this.Yo()}send(e){this.Ho(e)}s_(){this.Xo()}o_(){this.t_()}__(e){this.r_(e)}a_(e){this.i_(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ft="WebChannelConnection";class jR extends FR{constructor(e){super(e),this.u_=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}jo(e,t,s,o,l){const h=Hd();return new Promise((f,g)=>{const _=new X_;_.setWithCredentials(!0),_.listenOnce(J_.COMPLETE,()=>{try{switch(_.getLastErrorCode()){case zu.NO_ERROR:const T=_.getResponseJson();te(Ft,`XHR for RPC '${e}' ${h} received:`,JSON.stringify(T)),f(T);break;case zu.TIMEOUT:te(Ft,`RPC '${e}' ${h} timed out`),g(new ce(G.DEADLINE_EXCEEDED,"Request time out"));break;case zu.HTTP_ERROR:const R=_.getStatus();if(te(Ft,`RPC '${e}' ${h} failed with status:`,R,"response text:",_.getResponseText()),R>0){let j=_.getResponseJson();Array.isArray(j)&&(j=j[0]);const B=j?.error;if(B&&B.status&&B.message){const $=function(ae){const re=ae.toLowerCase().replace(/_/g,"-");return Object.values(G).indexOf(re)>=0?re:G.UNKNOWN}(B.status);g(new ce($,B.message))}else g(new ce(G.UNKNOWN,"Server responded with status "+_.getStatus()))}else g(new ce(G.UNAVAILABLE,"Connection failed."));break;default:_e(9055,{c_:e,streamId:h,l_:_.getLastErrorCode(),h_:_.getLastError()})}}finally{te(Ft,`RPC '${e}' ${h} completed.`)}});const E=JSON.stringify(o);te(Ft,`RPC '${e}' ${h} sending request:`,o),_.send(t,"POST",E,s,15)})}P_(e,t,s){const o=Hd(),l=[this.$o,"/","google.firestore.v1.Firestore","/",e,"/channel"],h=ev(),f=Z_(),g={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},_=this.longPollingOptions.timeoutSeconds;_!==void 0&&(g.longPollingTimeout=Math.round(1e3*_)),this.useFetchStreams&&(g.useFetchStreams=!0),this.zo(g.initMessageHeaders,t,s),g.encodeInitMessageHeaders=!0;const E=l.join("");te(Ft,`Creating RPC '${e}' stream ${o}: ${E}`,g);const T=h.createWebChannel(E,g);this.T_(T);let R=!1,j=!1;const B=new UR({Ho:F=>{j?te(Ft,`Not sending because RPC '${e}' stream ${o} is closed:`,F):(R||(te(Ft,`Opening RPC '${e}' stream ${o} transport.`),T.open(),R=!0),te(Ft,`RPC '${e}' stream ${o} sending:`,F),T.send(F))},Yo:()=>T.close()}),$=(F,ae,re)=>{F.listen(ae,ie=>{try{re(ie)}catch(ge){setTimeout(()=>{throw ge},0)}})};return $(T,Oa.EventType.OPEN,()=>{j||(te(Ft,`RPC '${e}' stream ${o} transport opened.`),B.s_())}),$(T,Oa.EventType.CLOSE,()=>{j||(j=!0,te(Ft,`RPC '${e}' stream ${o} transport closed`),B.__(),this.I_(T))}),$(T,Oa.EventType.ERROR,F=>{j||(j=!0,_i(Ft,`RPC '${e}' stream ${o} transport errored. Name:`,F.name,"Message:",F.message),B.__(new ce(G.UNAVAILABLE,"The operation could not be completed")))}),$(T,Oa.EventType.MESSAGE,F=>{var ae;if(!j){const re=F.data[0];Fe(!!re,16349);const ie=re,ge=ie?.error||((ae=ie[0])===null||ae===void 0?void 0:ae.error);if(ge){te(Ft,`RPC '${e}' stream ${o} received error:`,ge);const Le=ge.status;let Re=function(C){const k=lt[C];if(k!==void 0)return xv(k)}(Le),D=ge.message;Re===void 0&&(Re=G.INTERNAL,D="Unknown error status: "+Le+" with message "+ge.message),j=!0,B.__(new ce(Re,D)),T.close()}else te(Ft,`RPC '${e}' stream ${o} received:`,re),B.a_(re)}}),$(f,Y_.STAT_EVENT,F=>{F.stat===Vd.PROXY?te(Ft,`RPC '${e}' stream ${o} detected buffering proxy`):F.stat===Vd.NOPROXY&&te(Ft,`RPC '${e}' stream ${o} detected no buffering proxy`)}),setTimeout(()=>{B.o_()},0),B}terminate(){this.u_.forEach(e=>e.close()),this.u_=[]}T_(e){this.u_.push(e)}I_(e){this.u_=this.u_.filter(t=>t===e)}}function vd(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Pc(r){return new WA(r,!0)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gv{constructor(e,t,s=1e3,o=1.5,l=6e4){this.Fi=e,this.timerId=t,this.d_=s,this.E_=o,this.A_=l,this.R_=0,this.V_=null,this.m_=Date.now(),this.reset()}reset(){this.R_=0}f_(){this.R_=this.A_}g_(e){this.cancel();const t=Math.floor(this.R_+this.p_()),s=Math.max(0,Date.now()-this.m_),o=Math.max(0,t-s);o>0&&te("ExponentialBackoff",`Backing off for ${o} ms (base delay: ${this.R_} ms, delay with jitter: ${t} ms, last attempt: ${s} ms ago)`),this.V_=this.Fi.enqueueAfterDelay(this.timerId,o,()=>(this.m_=Date.now(),e())),this.R_*=this.E_,this.R_<this.d_&&(this.R_=this.d_),this.R_>this.A_&&(this.R_=this.A_)}y_(){this.V_!==null&&(this.V_.skipDelay(),this.V_=null)}cancel(){this.V_!==null&&(this.V_.cancel(),this.V_=null)}p_(){return(Math.random()-.5)*this.R_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ry="PersistentStream";class Qv{constructor(e,t,s,o,l,h,f,g){this.Fi=e,this.w_=s,this.S_=o,this.connection=l,this.authCredentialsProvider=h,this.appCheckCredentialsProvider=f,this.listener=g,this.state=0,this.b_=0,this.D_=null,this.v_=null,this.stream=null,this.C_=0,this.F_=new Gv(e,t)}M_(){return this.state===1||this.state===5||this.x_()}x_(){return this.state===2||this.state===3}start(){this.C_=0,this.state!==4?this.auth():this.O_()}async stop(){this.M_()&&await this.close(0)}N_(){this.state=0,this.F_.reset()}B_(){this.x_()&&this.D_===null&&(this.D_=this.Fi.enqueueAfterDelay(this.w_,6e4,()=>this.L_()))}k_(e){this.q_(),this.stream.send(e)}async L_(){if(this.x_())return this.close(0)}q_(){this.D_&&(this.D_.cancel(),this.D_=null)}Q_(){this.v_&&(this.v_.cancel(),this.v_=null)}async close(e,t){this.q_(),this.Q_(),this.F_.cancel(),this.b_++,e!==4?this.F_.reset():t&&t.code===G.RESOURCE_EXHAUSTED?(Dr(t.toString()),Dr("Using maximum backoff delay to prevent overloading the backend."),this.F_.f_()):t&&t.code===G.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.U_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.n_(t)}U_(){}auth(){this.state=1;const e=this.K_(this.b_),t=this.b_;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([s,o])=>{this.b_===t&&this.W_(s,o)},s=>{e(()=>{const o=new ce(G.UNKNOWN,"Fetching auth token failed: "+s.message);return this.G_(o)})})}W_(e,t){const s=this.K_(this.b_);this.stream=this.z_(e,t),this.stream.Zo(()=>{s(()=>this.listener.Zo())}),this.stream.e_(()=>{s(()=>(this.state=2,this.v_=this.Fi.enqueueAfterDelay(this.S_,1e4,()=>(this.x_()&&(this.state=3),Promise.resolve())),this.listener.e_()))}),this.stream.n_(o=>{s(()=>this.G_(o))}),this.stream.onMessage(o=>{s(()=>++this.C_==1?this.j_(o):this.onNext(o))})}O_(){this.state=5,this.F_.g_(async()=>{this.state=0,this.start()})}G_(e){return te(Ry,`close with error: ${e}`),this.stream=null,this.close(4,e)}K_(e){return t=>{this.Fi.enqueueAndForget(()=>this.b_===e?t():(te(Ry,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class zR extends Qv{constructor(e,t,s,o,l,h){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,s,o,h),this.serializer=l}z_(e,t){return this.connection.P_("Listen",e,t)}j_(e){return this.onNext(e)}onNext(e){this.F_.reset();const t=KA(this.serializer,e),s=function(l){if(!("targetChange"in l))return Ee.min();const h=l.targetChange;return h.targetIds&&h.targetIds.length?Ee.min():h.readTime?nr(h.readTime):Ee.min()}(e);return this.listener.J_(t,s)}H_(e){const t={};t.database=$d(this.serializer),t.addTarget=function(l,h){let f;const g=h.target;if(f=Fd(g)?{documents:XA(l,g)}:{query:JA(l,g).Vt},f.targetId=h.targetId,h.resumeToken.approximateByteSize()>0){f.resumeToken=bv(l,h.resumeToken);const _=jd(l,h.expectedCount);_!==null&&(f.expectedCount=_)}else if(h.snapshotVersion.compareTo(Ee.min())>0){f.readTime=uc(l,h.snapshotVersion.toTimestamp());const _=jd(l,h.expectedCount);_!==null&&(f.expectedCount=_)}return f}(this.serializer,e);const s=ZA(this.serializer,e);s&&(t.labels=s),this.k_(t)}Y_(e){const t={};t.database=$d(this.serializer),t.removeTarget=e,this.k_(t)}}class BR extends Qv{constructor(e,t,s,o,l,h){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,s,o,h),this.serializer=l}get Z_(){return this.C_>0}start(){this.lastStreamToken=void 0,super.start()}U_(){this.Z_&&this.X_([])}z_(e,t){return this.connection.P_("Write",e,t)}j_(e){return Fe(!!e.streamToken,31322),this.lastStreamToken=e.streamToken,Fe(!e.writeResults||e.writeResults.length===0,55816),this.listener.ea()}onNext(e){Fe(!!e.streamToken,12678),this.lastStreamToken=e.streamToken,this.F_.reset();const t=QA(e.writeResults,e.commitTime),s=nr(e.commitTime);return this.listener.ta(s,t)}na(){const e={};e.database=$d(this.serializer),this.k_(e)}X_(e){const t={streamToken:this.lastStreamToken,writes:e.map(s=>GA(this.serializer,s))};this.k_(t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $R{}class WR extends $R{constructor(e,t,s,o){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=s,this.serializer=o,this.ra=!1}ia(){if(this.ra)throw new ce(G.FAILED_PRECONDITION,"The client has already been terminated.")}Wo(e,t,s,o){return this.ia(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([l,h])=>this.connection.Wo(e,zd(t,s),o,l,h)).catch(l=>{throw l.name==="FirebaseError"?(l.code===G.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),l):new ce(G.UNKNOWN,l.toString())})}Jo(e,t,s,o,l){return this.ia(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([h,f])=>this.connection.Jo(e,zd(t,s),o,h,f,l)).catch(h=>{throw h.name==="FirebaseError"?(h.code===G.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),h):new ce(G.UNKNOWN,h.toString())})}terminate(){this.ra=!0,this.connection.terminate()}}class HR{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.sa=0,this.oa=null,this._a=!0}aa(){this.sa===0&&(this.ua("Unknown"),this.oa=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this.oa=null,this.ca("Backend didn't respond within 10 seconds."),this.ua("Offline"),Promise.resolve())))}la(e){this.state==="Online"?this.ua("Unknown"):(this.sa++,this.sa>=1&&(this.ha(),this.ca(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.ua("Offline")))}set(e){this.ha(),this.sa=0,e==="Online"&&(this._a=!1),this.ua(e)}ua(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}ca(e){const t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this._a?(Dr(t),this._a=!1):te("OnlineStateTracker",t)}ha(){this.oa!==null&&(this.oa.cancel(),this.oa=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const hs="RemoteStore";class qR{constructor(e,t,s,o,l){this.localStore=e,this.datastore=t,this.asyncQueue=s,this.remoteSyncer={},this.Pa=[],this.Ta=new Map,this.Ia=new Set,this.da=[],this.Ea=l,this.Ea.xo(h=>{s.enqueueAndForget(async()=>{gs(this)&&(te(hs,"Restarting streams for network reachability change."),await async function(g){const _=we(g);_.Ia.add(4),await fl(_),_.Aa.set("Unknown"),_.Ia.delete(4),await kc(_)}(this))})}),this.Aa=new HR(s,o)}}async function kc(r){if(gs(r))for(const e of r.da)await e(!0)}async function fl(r){for(const e of r.da)await e(!1)}function Xv(r,e){const t=we(r);t.Ta.has(e.targetId)||(t.Ta.set(e.targetId,e),Vf(t)?Of(t):Vo(t).x_()&&Df(t,e))}function Nf(r,e){const t=we(r),s=Vo(t);t.Ta.delete(e),s.x_()&&Jv(t,e),t.Ta.size===0&&(s.x_()?s.B_():gs(t)&&t.Aa.set("Unknown"))}function Df(r,e){if(r.Ra.$e(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(Ee.min())>0){const t=r.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(t)}Vo(r).H_(e)}function Jv(r,e){r.Ra.$e(e),Vo(r).Y_(e)}function Of(r){r.Ra=new jA({getRemoteKeysForTarget:e=>r.remoteSyncer.getRemoteKeysForTarget(e),Et:e=>r.Ta.get(e)||null,lt:()=>r.datastore.serializer.databaseId}),Vo(r).start(),r.Aa.aa()}function Vf(r){return gs(r)&&!Vo(r).M_()&&r.Ta.size>0}function gs(r){return we(r).Ia.size===0}function Yv(r){r.Ra=void 0}async function KR(r){r.Aa.set("Online")}async function GR(r){r.Ta.forEach((e,t)=>{Df(r,e)})}async function QR(r,e){Yv(r),Vf(r)?(r.Aa.la(e),Of(r)):r.Aa.set("Unknown")}async function XR(r,e,t){if(r.Aa.set("Online"),e instanceof Mv&&e.state===2&&e.cause)try{await async function(o,l){const h=l.cause;for(const f of l.targetIds)o.Ta.has(f)&&(await o.remoteSyncer.rejectListen(f,h),o.Ta.delete(f),o.Ra.removeTarget(f))}(r,e)}catch(s){te(hs,"Failed to remove targets %s: %s ",e.targetIds.join(","),s),await hc(r,s)}else if(e instanceof Hu?r.Ra.Ye(e):e instanceof Lv?r.Ra.it(e):r.Ra.et(e),!t.isEqual(Ee.min()))try{const s=await Kv(r.localStore);t.compareTo(s)>=0&&await function(l,h){const f=l.Ra.Pt(h);return f.targetChanges.forEach((g,_)=>{if(g.resumeToken.approximateByteSize()>0){const E=l.Ta.get(_);E&&l.Ta.set(_,E.withResumeToken(g.resumeToken,h))}}),f.targetMismatches.forEach((g,_)=>{const E=l.Ta.get(g);if(!E)return;l.Ta.set(g,E.withResumeToken(Dt.EMPTY_BYTE_STRING,E.snapshotVersion)),Jv(l,g);const T=new hi(E.target,g,_,E.sequenceNumber);Df(l,T)}),l.remoteSyncer.applyRemoteEvent(f)}(r,t)}catch(s){te(hs,"Failed to raise snapshot:",s),await hc(r,s)}}async function hc(r,e,t){if(!Oo(e))throw e;r.Ia.add(1),await fl(r),r.Aa.set("Offline"),t||(t=()=>Kv(r.localStore)),r.asyncQueue.enqueueRetryable(async()=>{te(hs,"Retrying IndexedDB access"),await t(),r.Ia.delete(1),await kc(r)})}function Zv(r,e){return e().catch(t=>hc(r,t,e))}async function Nc(r){const e=we(r),t=Ii(e);let s=e.Pa.length>0?e.Pa[e.Pa.length-1].batchId:gf;for(;JR(e);)try{const o=await OR(e.localStore,s);if(o===null){e.Pa.length===0&&t.B_();break}s=o.batchId,YR(e,o)}catch(o){await hc(e,o)}eE(e)&&tE(e)}function JR(r){return gs(r)&&r.Pa.length<10}function YR(r,e){r.Pa.push(e);const t=Ii(r);t.x_()&&t.Z_&&t.X_(e.mutations)}function eE(r){return gs(r)&&!Ii(r).M_()&&r.Pa.length>0}function tE(r){Ii(r).start()}async function ZR(r){Ii(r).na()}async function eC(r){const e=Ii(r);for(const t of r.Pa)e.X_(t.mutations)}async function tC(r,e,t){const s=r.Pa.shift(),o=If.from(s,e,t);await Zv(r,()=>r.remoteSyncer.applySuccessfulWrite(o)),await Nc(r)}async function nC(r,e){e&&Ii(r).Z_&&await async function(s,o){if(function(h){return FA(h)&&h!==G.ABORTED}(o.code)){const l=s.Pa.shift();Ii(s).N_(),await Zv(s,()=>s.remoteSyncer.rejectFailedWrite(l.batchId,o)),await Nc(s)}}(r,e),eE(r)&&tE(r)}async function Cy(r,e){const t=we(r);t.asyncQueue.verifyOperationInProgress(),te(hs,"RemoteStore received new credentials");const s=gs(t);t.Ia.add(3),await fl(t),s&&t.Aa.set("Unknown"),await t.remoteSyncer.handleCredentialChange(e),t.Ia.delete(3),await kc(t)}async function rC(r,e){const t=we(r);e?(t.Ia.delete(2),await kc(t)):e||(t.Ia.add(2),await fl(t),t.Aa.set("Unknown"))}function Vo(r){return r.Va||(r.Va=function(t,s,o){const l=we(t);return l.ia(),new zR(s,l.connection,l.authCredentials,l.appCheckCredentials,l.serializer,o)}(r.datastore,r.asyncQueue,{Zo:KR.bind(null,r),e_:GR.bind(null,r),n_:QR.bind(null,r),J_:XR.bind(null,r)}),r.da.push(async e=>{e?(r.Va.N_(),Vf(r)?Of(r):r.Aa.set("Unknown")):(await r.Va.stop(),Yv(r))})),r.Va}function Ii(r){return r.ma||(r.ma=function(t,s,o){const l=we(t);return l.ia(),new BR(s,l.connection,l.authCredentials,l.appCheckCredentials,l.serializer,o)}(r.datastore,r.asyncQueue,{Zo:()=>Promise.resolve(),e_:ZR.bind(null,r),n_:nC.bind(null,r),ea:eC.bind(null,r),ta:tC.bind(null,r)}),r.da.push(async e=>{e?(r.ma.N_(),await Nc(r)):(await r.ma.stop(),r.Pa.length>0&&(te(hs,`Stopping write stream with ${r.Pa.length} pending writes`),r.Pa=[]))})),r.ma}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xf{constructor(e,t,s,o,l){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=s,this.op=o,this.removalCallback=l,this.deferred=new yi,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(h=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,t,s,o,l){const h=Date.now()+s,f=new xf(e,t,h,o,l);return f.start(s),f}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new ce(G.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function Lf(r,e){if(Dr("AsyncQueue",`${e}: ${r}`),Oo(r))return new ce(G.UNAVAILABLE,`${e}: ${r}`);throw r}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _o{static emptySet(e){return new _o(e.comparator)}constructor(e){this.comparator=e?(t,s)=>e(t,s)||me.comparator(t.key,s.key):(t,s)=>me.comparator(t.key,s.key),this.keyedMap=Va(),this.sortedSet=new Ze(this.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((t,s)=>(e(t),!1))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof _o)||this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),s=e.sortedSet.getIterator();for(;t.hasNext();){const o=t.getNext().key,l=s.getNext().key;if(!o.isEqual(l))return!1}return!0}toString(){const e=[];return this.forEach(t=>{e.push(t.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,t){const s=new _o;return s.comparator=this.comparator,s.keyedMap=e,s.sortedSet=t,s}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Py{constructor(){this.fa=new Ze(me.comparator)}track(e){const t=e.doc.key,s=this.fa.get(t);s?e.type!==0&&s.type===3?this.fa=this.fa.insert(t,e):e.type===3&&s.type!==1?this.fa=this.fa.insert(t,{type:s.type,doc:e.doc}):e.type===2&&s.type===2?this.fa=this.fa.insert(t,{type:2,doc:e.doc}):e.type===2&&s.type===0?this.fa=this.fa.insert(t,{type:0,doc:e.doc}):e.type===1&&s.type===0?this.fa=this.fa.remove(t):e.type===1&&s.type===2?this.fa=this.fa.insert(t,{type:1,doc:s.doc}):e.type===0&&s.type===1?this.fa=this.fa.insert(t,{type:2,doc:e.doc}):_e(63341,{At:e,ga:s}):this.fa=this.fa.insert(t,e)}pa(){const e=[];return this.fa.inorderTraversal((t,s)=>{e.push(s)}),e}}class So{constructor(e,t,s,o,l,h,f,g,_){this.query=e,this.docs=t,this.oldDocs=s,this.docChanges=o,this.mutatedKeys=l,this.fromCache=h,this.syncStateChanged=f,this.excludesMetadataChanges=g,this.hasCachedResults=_}static fromInitialDocuments(e,t,s,o,l){const h=[];return t.forEach(f=>{h.push({type:0,doc:f})}),new So(e,t,_o.emptySet(t),h,s,o,!0,!1,l)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&Ic(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,s=e.docChanges;if(t.length!==s.length)return!1;for(let o=0;o<t.length;o++)if(t[o].type!==s[o].type||!t[o].doc.isEqual(s[o].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class iC{constructor(){this.ya=void 0,this.wa=[]}Sa(){return this.wa.some(e=>e.ba())}}class sC{constructor(){this.queries=ky(),this.onlineState="Unknown",this.Da=new Set}terminate(){(function(t,s){const o=we(t),l=o.queries;o.queries=ky(),l.forEach((h,f)=>{for(const g of f.wa)g.onError(s)})})(this,new ce(G.ABORTED,"Firestore shutting down"))}}function ky(){return new ps(r=>wv(r),Ic)}async function oC(r,e){const t=we(r);let s=3;const o=e.query;let l=t.queries.get(o);l?!l.Sa()&&e.ba()&&(s=2):(l=new iC,s=e.ba()?0:1);try{switch(s){case 0:l.ya=await t.onListen(o,!0);break;case 1:l.ya=await t.onListen(o,!1);break;case 2:await t.onFirstRemoteStoreListen(o)}}catch(h){const f=Lf(h,`Initialization of query '${co(e.query)}' failed`);return void e.onError(f)}t.queries.set(o,l),l.wa.push(e),e.va(t.onlineState),l.ya&&e.Ca(l.ya)&&Mf(t)}async function aC(r,e){const t=we(r),s=e.query;let o=3;const l=t.queries.get(s);if(l){const h=l.wa.indexOf(e);h>=0&&(l.wa.splice(h,1),l.wa.length===0?o=e.ba()?0:1:!l.Sa()&&e.ba()&&(o=2))}switch(o){case 0:return t.queries.delete(s),t.onUnlisten(s,!0);case 1:return t.queries.delete(s),t.onUnlisten(s,!1);case 2:return t.onLastRemoteStoreUnlisten(s);default:return}}function lC(r,e){const t=we(r);let s=!1;for(const o of e){const l=o.query,h=t.queries.get(l);if(h){for(const f of h.wa)f.Ca(o)&&(s=!0);h.ya=o}}s&&Mf(t)}function uC(r,e,t){const s=we(r),o=s.queries.get(e);if(o)for(const l of o.wa)l.onError(t);s.queries.delete(e)}function Mf(r){r.Da.forEach(e=>{e.next()})}var qd,Ny;(Ny=qd||(qd={})).Fa="default",Ny.Cache="cache";class cC{constructor(e,t,s){this.query=e,this.Ma=t,this.xa=!1,this.Oa=null,this.onlineState="Unknown",this.options=s||{}}Ca(e){if(!this.options.includeMetadataChanges){const s=[];for(const o of e.docChanges)o.type!==3&&s.push(o);e=new So(e.query,e.docs,e.oldDocs,s,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.xa?this.Na(e)&&(this.Ma.next(e),t=!0):this.Ba(e,this.onlineState)&&(this.La(e),t=!0),this.Oa=e,t}onError(e){this.Ma.error(e)}va(e){this.onlineState=e;let t=!1;return this.Oa&&!this.xa&&this.Ba(this.Oa,e)&&(this.La(this.Oa),t=!0),t}Ba(e,t){if(!e.fromCache||!this.ba())return!0;const s=t!=="Offline";return(!this.options.ka||!s)&&(!e.docs.isEmpty()||e.hasCachedResults||t==="Offline")}Na(e){if(e.docChanges.length>0)return!0;const t=this.Oa&&this.Oa.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&this.options.includeMetadataChanges===!0}La(e){e=So.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.xa=!0,this.Ma.next(e)}ba(){return this.options.source!==qd.Cache}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nE{constructor(e){this.key=e}}class rE{constructor(e){this.key=e}}class hC{constructor(e,t){this.query=e,this.Ha=t,this.Ya=null,this.hasCachedResults=!1,this.current=!1,this.Za=Pe(),this.mutatedKeys=Pe(),this.Xa=Tv(e),this.eu=new _o(this.Xa)}get tu(){return this.Ha}nu(e,t){const s=t?t.ru:new Py,o=t?t.eu:this.eu;let l=t?t.mutatedKeys:this.mutatedKeys,h=o,f=!1;const g=this.query.limitType==="F"&&o.size===this.query.limit?o.last():null,_=this.query.limitType==="L"&&o.size===this.query.limit?o.first():null;if(e.inorderTraversal((E,T)=>{const R=o.get(E),j=Sc(this.query,T)?T:null,B=!!R&&this.mutatedKeys.has(R.key),$=!!j&&(j.hasLocalMutations||this.mutatedKeys.has(j.key)&&j.hasCommittedMutations);let F=!1;R&&j?R.data.isEqual(j.data)?B!==$&&(s.track({type:3,doc:j}),F=!0):this.iu(R,j)||(s.track({type:2,doc:j}),F=!0,(g&&this.Xa(j,g)>0||_&&this.Xa(j,_)<0)&&(f=!0)):!R&&j?(s.track({type:0,doc:j}),F=!0):R&&!j&&(s.track({type:1,doc:R}),F=!0,(g||_)&&(f=!0)),F&&(j?(h=h.add(j),l=$?l.add(E):l.delete(E)):(h=h.delete(E),l=l.delete(E)))}),this.query.limit!==null)for(;h.size>this.query.limit;){const E=this.query.limitType==="F"?h.last():h.first();h=h.delete(E.key),l=l.delete(E.key),s.track({type:1,doc:E})}return{eu:h,ru:s,Ds:f,mutatedKeys:l}}iu(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,s,o){const l=this.eu;this.eu=e.eu,this.mutatedKeys=e.mutatedKeys;const h=e.ru.pa();h.sort((E,T)=>function(j,B){const $=F=>{switch(F){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return _e(20277,{At:F})}};return $(j)-$(B)}(E.type,T.type)||this.Xa(E.doc,T.doc)),this.su(s),o=o!=null&&o;const f=t&&!o?this.ou():[],g=this.Za.size===0&&this.current&&!o?1:0,_=g!==this.Ya;return this.Ya=g,h.length!==0||_?{snapshot:new So(this.query,e.eu,l,h,e.mutatedKeys,g===0,_,!1,!!s&&s.resumeToken.approximateByteSize()>0),_u:f}:{_u:f}}va(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({eu:this.eu,ru:new Py,mutatedKeys:this.mutatedKeys,Ds:!1},!1)):{_u:[]}}au(e){return!this.Ha.has(e)&&!!this.eu.has(e)&&!this.eu.get(e).hasLocalMutations}su(e){e&&(e.addedDocuments.forEach(t=>this.Ha=this.Ha.add(t)),e.modifiedDocuments.forEach(t=>{}),e.removedDocuments.forEach(t=>this.Ha=this.Ha.delete(t)),this.current=e.current)}ou(){if(!this.current)return[];const e=this.Za;this.Za=Pe(),this.eu.forEach(s=>{this.au(s.key)&&(this.Za=this.Za.add(s.key))});const t=[];return e.forEach(s=>{this.Za.has(s)||t.push(new rE(s))}),this.Za.forEach(s=>{e.has(s)||t.push(new nE(s))}),t}uu(e){this.Ha=e.qs,this.Za=Pe();const t=this.nu(e.documents);return this.applyChanges(t,!0)}cu(){return So.fromInitialDocuments(this.query,this.eu,this.mutatedKeys,this.Ya===0,this.hasCachedResults)}}const bf="SyncEngine";class dC{constructor(e,t,s){this.query=e,this.targetId=t,this.view=s}}class fC{constructor(e){this.key=e,this.lu=!1}}class pC{constructor(e,t,s,o,l,h){this.localStore=e,this.remoteStore=t,this.eventManager=s,this.sharedClientState=o,this.currentUser=l,this.maxConcurrentLimboResolutions=h,this.hu={},this.Pu=new ps(f=>wv(f),Ic),this.Tu=new Map,this.Iu=new Set,this.du=new Ze(me.comparator),this.Eu=new Map,this.Au=new Rf,this.Ru={},this.Vu=new Map,this.mu=Io.ur(),this.onlineState="Unknown",this.fu=void 0}get isPrimaryClient(){return this.fu===!0}}async function mC(r,e,t=!0){const s=uE(r);let o;const l=s.Pu.get(e);return l?(s.sharedClientState.addLocalQueryTarget(l.targetId),o=l.view.cu()):o=await iE(s,e,t,!0),o}async function gC(r,e){const t=uE(r);await iE(t,e,!0,!1)}async function iE(r,e,t,s){const o=await VR(r.localStore,tr(e)),l=o.targetId,h=r.sharedClientState.addLocalQueryTarget(l,t);let f;return s&&(f=await yC(r,e,l,h==="current",o.resumeToken)),r.isPrimaryClient&&t&&Xv(r.remoteStore,o),f}async function yC(r,e,t,s,o){r.gu=(T,R,j)=>async function($,F,ae,re){let ie=F.view.nu(ae);ie.Ds&&(ie=await Ty($.localStore,F.query,!1).then(({documents:D})=>F.view.nu(D,ie)));const ge=re&&re.targetChanges.get(F.targetId),Le=re&&re.targetMismatches.get(F.targetId)!=null,Re=F.view.applyChanges(ie,$.isPrimaryClient,ge,Le);return Oy($,F.targetId,Re._u),Re.snapshot}(r,T,R,j);const l=await Ty(r.localStore,e,!0),h=new hC(e,l.qs),f=h.nu(l.documents),g=dl.createSynthesizedTargetChangeForCurrentChange(t,s&&r.onlineState!=="Offline",o),_=h.applyChanges(f,r.isPrimaryClient,g);Oy(r,t,_._u);const E=new dC(e,t,h);return r.Pu.set(e,E),r.Tu.has(t)?r.Tu.get(t).push(e):r.Tu.set(t,[e]),_.snapshot}async function _C(r,e,t){const s=we(r),o=s.Pu.get(e),l=s.Tu.get(o.targetId);if(l.length>1)return s.Tu.set(o.targetId,l.filter(h=>!Ic(h,e))),void s.Pu.delete(e);s.isPrimaryClient?(s.sharedClientState.removeLocalQueryTarget(o.targetId),s.sharedClientState.isActiveQueryTarget(o.targetId)||await Wd(s.localStore,o.targetId,!1).then(()=>{s.sharedClientState.clearQueryState(o.targetId),t&&Nf(s.remoteStore,o.targetId),Kd(s,o.targetId)}).catch(Do)):(Kd(s,o.targetId),await Wd(s.localStore,o.targetId,!0))}async function vC(r,e){const t=we(r),s=t.Pu.get(e),o=t.Tu.get(s.targetId);t.isPrimaryClient&&o.length===1&&(t.sharedClientState.removeLocalQueryTarget(s.targetId),Nf(t.remoteStore,s.targetId))}async function EC(r,e,t){const s=CC(r);try{const o=await function(h,f){const g=we(h),_=Ke.now(),E=f.reduce((j,B)=>j.add(B.key),Pe());let T,R;return g.persistence.runTransaction("Locally write mutations","readwrite",j=>{let B=Or(),$=Pe();return g.Os.getEntries(j,E).next(F=>{B=F,B.forEach((ae,re)=>{re.isValidDocument()||($=$.add(ae))})}).next(()=>g.localDocuments.getOverlayedDocuments(j,B)).next(F=>{T=F;const ae=[];for(const re of f){const ie=VA(re,T.get(re.key).overlayedDocument);ie!=null&&ae.push(new ms(re.key,ie,pv(ie.value.mapValue),Pr.exists(!0)))}return g.mutationQueue.addMutationBatch(j,_,ae,f)}).next(F=>{R=F;const ae=F.applyToLocalDocumentSet(T,$);return g.documentOverlayCache.saveOverlays(j,F.batchId,ae)})}).then(()=>({batchId:R.batchId,changes:Sv(T)}))}(s.localStore,e);s.sharedClientState.addPendingMutation(o.batchId),function(h,f,g){let _=h.Ru[h.currentUser.toKey()];_||(_=new Ze(Ie)),_=_.insert(f,g),h.Ru[h.currentUser.toKey()]=_}(s,o.batchId,t),await pl(s,o.changes),await Nc(s.remoteStore)}catch(o){const l=Lf(o,"Failed to persist write");t.reject(l)}}async function sE(r,e){const t=we(r);try{const s=await NR(t.localStore,e);e.targetChanges.forEach((o,l)=>{const h=t.Eu.get(l);h&&(Fe(o.addedDocuments.size+o.modifiedDocuments.size+o.removedDocuments.size<=1,22616),o.addedDocuments.size>0?h.lu=!0:o.modifiedDocuments.size>0?Fe(h.lu,14607):o.removedDocuments.size>0&&(Fe(h.lu,42227),h.lu=!1))}),await pl(t,s,e)}catch(s){await Do(s)}}function Dy(r,e,t){const s=we(r);if(s.isPrimaryClient&&t===0||!s.isPrimaryClient&&t===1){const o=[];s.Pu.forEach((l,h)=>{const f=h.view.va(e);f.snapshot&&o.push(f.snapshot)}),function(h,f){const g=we(h);g.onlineState=f;let _=!1;g.queries.forEach((E,T)=>{for(const R of T.wa)R.va(f)&&(_=!0)}),_&&Mf(g)}(s.eventManager,e),o.length&&s.hu.J_(o),s.onlineState=e,s.isPrimaryClient&&s.sharedClientState.setOnlineState(e)}}async function wC(r,e,t){const s=we(r);s.sharedClientState.updateQueryState(e,"rejected",t);const o=s.Eu.get(e),l=o&&o.key;if(l){let h=new Ze(me.comparator);h=h.insert(l,jt.newNoDocument(l,Ee.min()));const f=Pe().add(l),g=new Cc(Ee.min(),new Map,new Ze(Ie),h,f);await sE(s,g),s.du=s.du.remove(l),s.Eu.delete(e),Ff(s)}else await Wd(s.localStore,e,!1).then(()=>Kd(s,e,t)).catch(Do)}async function TC(r,e){const t=we(r),s=e.batch.batchId;try{const o=await kR(t.localStore,e);aE(t,s,null),oE(t,s),t.sharedClientState.updateMutationState(s,"acknowledged"),await pl(t,o)}catch(o){await Do(o)}}async function IC(r,e,t){const s=we(r);try{const o=await function(h,f){const g=we(h);return g.persistence.runTransaction("Reject batch","readwrite-primary",_=>{let E;return g.mutationQueue.lookupMutationBatch(_,f).next(T=>(Fe(T!==null,37113),E=T.keys(),g.mutationQueue.removeMutationBatch(_,T))).next(()=>g.mutationQueue.performConsistencyCheck(_)).next(()=>g.documentOverlayCache.removeOverlaysForBatchId(_,E,f)).next(()=>g.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(_,E)).next(()=>g.localDocuments.getDocuments(_,E))})}(s.localStore,e);aE(s,e,t),oE(s,e),s.sharedClientState.updateMutationState(e,"rejected",t),await pl(s,o)}catch(o){await Do(o)}}function oE(r,e){(r.Vu.get(e)||[]).forEach(t=>{t.resolve()}),r.Vu.delete(e)}function aE(r,e,t){const s=we(r);let o=s.Ru[s.currentUser.toKey()];if(o){const l=o.get(e);l&&(t?l.reject(t):l.resolve(),o=o.remove(e)),s.Ru[s.currentUser.toKey()]=o}}function Kd(r,e,t=null){r.sharedClientState.removeLocalQueryTarget(e);for(const s of r.Tu.get(e))r.Pu.delete(s),t&&r.hu.pu(s,t);r.Tu.delete(e),r.isPrimaryClient&&r.Au.zr(e).forEach(s=>{r.Au.containsKey(s)||lE(r,s)})}function lE(r,e){r.Iu.delete(e.path.canonicalString());const t=r.du.get(e);t!==null&&(Nf(r.remoteStore,t),r.du=r.du.remove(e),r.Eu.delete(t),Ff(r))}function Oy(r,e,t){for(const s of t)s instanceof nE?(r.Au.addReference(s.key,e),SC(r,s)):s instanceof rE?(te(bf,"Document no longer in limbo: "+s.key),r.Au.removeReference(s.key,e),r.Au.containsKey(s.key)||lE(r,s.key)):_e(19791,{yu:s})}function SC(r,e){const t=e.key,s=t.path.canonicalString();r.du.get(t)||r.Iu.has(s)||(te(bf,"New document in limbo: "+t),r.Iu.add(s),Ff(r))}function Ff(r){for(;r.Iu.size>0&&r.du.size<r.maxConcurrentLimboResolutions;){const e=r.Iu.values().next().value;r.Iu.delete(e);const t=new me(Ye.fromString(e)),s=r.mu.next();r.Eu.set(s,new fC(t)),r.du=r.du.insert(t,s),Xv(r.remoteStore,new hi(tr(wf(t.path)),s,"TargetPurposeLimboResolution",vc.ue))}}async function pl(r,e,t){const s=we(r),o=[],l=[],h=[];s.Pu.isEmpty()||(s.Pu.forEach((f,g)=>{h.push(s.gu(g,e,t).then(_=>{var E;if((_||t)&&s.isPrimaryClient){const T=_?!_.fromCache:(E=t?.targetChanges.get(g.targetId))===null||E===void 0?void 0:E.current;s.sharedClientState.updateQueryState(g.targetId,T?"current":"not-current")}if(_){o.push(_);const T=Pf.Es(g.targetId,_);l.push(T)}}))}),await Promise.all(h),s.hu.J_(o),await async function(g,_){const E=we(g);try{await E.persistence.runTransaction("notifyLocalViewChanges","readwrite",T=>W.forEach(_,R=>W.forEach(R.Is,j=>E.persistence.referenceDelegate.addReference(T,R.targetId,j)).next(()=>W.forEach(R.ds,j=>E.persistence.referenceDelegate.removeReference(T,R.targetId,j)))))}catch(T){if(!Oo(T))throw T;te(kf,"Failed to update sequence numbers: "+T)}for(const T of _){const R=T.targetId;if(!T.fromCache){const j=E.Fs.get(R),B=j.snapshotVersion,$=j.withLastLimboFreeSnapshotVersion(B);E.Fs=E.Fs.insert(R,$)}}}(s.localStore,l))}async function AC(r,e){const t=we(r);if(!t.currentUser.isEqual(e)){te(bf,"User change. New user:",e.toKey());const s=await qv(t.localStore,e);t.currentUser=e,function(l,h){l.Vu.forEach(f=>{f.forEach(g=>{g.reject(new ce(G.CANCELLED,h))})}),l.Vu.clear()}(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,s.removedBatchIds,s.addedBatchIds),await pl(t,s.Bs)}}function RC(r,e){const t=we(r),s=t.Eu.get(e);if(s&&s.lu)return Pe().add(s.key);{let o=Pe();const l=t.Tu.get(e);if(!l)return o;for(const h of l){const f=t.Pu.get(h);o=o.unionWith(f.view.tu)}return o}}function uE(r){const e=we(r);return e.remoteStore.remoteSyncer.applyRemoteEvent=sE.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=RC.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=wC.bind(null,e),e.hu.J_=lC.bind(null,e.eventManager),e.hu.pu=uC.bind(null,e.eventManager),e}function CC(r){const e=we(r);return e.remoteStore.remoteSyncer.applySuccessfulWrite=TC.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=IC.bind(null,e),e}class dc{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=Pc(e.databaseInfo.databaseId),this.sharedClientState=this.bu(e),this.persistence=this.Du(e),await this.persistence.start(),this.localStore=this.vu(e),this.gcScheduler=this.Cu(e,this.localStore),this.indexBackfillerScheduler=this.Fu(e,this.localStore)}Cu(e,t){return null}Fu(e,t){return null}vu(e){return PR(this.persistence,new AR,e.initialUser,this.serializer)}Du(e){return new Hv(Cf.Vi,this.serializer)}bu(e){return new LR}async terminate(){var e,t;(e=this.gcScheduler)===null||e===void 0||e.stop(),(t=this.indexBackfillerScheduler)===null||t===void 0||t.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}dc.provider={build:()=>new dc};class PC extends dc{constructor(e){super(),this.cacheSizeBytes=e}Cu(e,t){Fe(this.persistence.referenceDelegate instanceof cc,46915);const s=this.persistence.referenceDelegate.garbageCollector;return new cR(s,e.asyncQueue,t)}Du(e){const t=this.cacheSizeBytes!==void 0?en.withCacheSize(this.cacheSizeBytes):en.DEFAULT;return new Hv(s=>cc.Vi(s,t),this.serializer)}}class Gd{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=s=>Dy(this.syncEngine,s,1),this.remoteStore.remoteSyncer.handleCredentialChange=AC.bind(null,this.syncEngine),await rC(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new sC}()}createDatastore(e){const t=Pc(e.databaseInfo.databaseId),s=function(l){return new jR(l)}(e.databaseInfo);return function(l,h,f,g){return new WR(l,h,f,g)}(e.authCredentials,e.appCheckCredentials,s,t)}createRemoteStore(e){return function(s,o,l,h,f){return new qR(s,o,l,h,f)}(this.localStore,this.datastore,e.asyncQueue,t=>Dy(this.syncEngine,t,0),function(){return Ay.C()?new Ay:new MR}())}createSyncEngine(e,t){return function(o,l,h,f,g,_,E){const T=new pC(o,l,h,f,g,_);return E&&(T.fu=!0),T}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){var e,t;await async function(o){const l=we(o);te(hs,"RemoteStore shutting down."),l.Ia.add(5),await fl(l),l.Ea.shutdown(),l.Aa.set("Unknown")}(this.remoteStore),(e=this.datastore)===null||e===void 0||e.terminate(),(t=this.eventManager)===null||t===void 0||t.terminate()}}Gd.provider={build:()=>new Gd};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kC{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.xu(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.xu(this.observer.error,e):Dr("Uncaught Error in snapshot listener:",e.toString()))}Ou(){this.muted=!0}xu(e,t){setTimeout(()=>{this.muted||e(t)},0)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Si="FirestoreClient";class NC{constructor(e,t,s,o,l){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=s,this.databaseInfo=o,this.user=Ut.UNAUTHENTICATED,this.clientId=pf.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=l,this.authCredentials.start(s,async h=>{te(Si,"Received user=",h.uid),await this.authCredentialListener(h),this.user=h}),this.appCheckCredentials.start(s,h=>(te(Si,"Received new app check token=",h),this.appCheckCredentialListener(h,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new yi;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const s=Lf(t,"Failed to shutdown persistence");e.reject(s)}}),e.promise}}async function Ed(r,e){r.asyncQueue.verifyOperationInProgress(),te(Si,"Initializing OfflineComponentProvider");const t=r.configuration;await e.initialize(t);let s=t.initialUser;r.setCredentialChangeListener(async o=>{s.isEqual(o)||(await qv(e.localStore,o),s=o)}),e.persistence.setDatabaseDeletedListener(()=>{_i("Terminating Firestore due to IndexedDb database deletion"),r.terminate().then(()=>{te("Terminating Firestore due to IndexedDb database deletion completed successfully")}).catch(o=>{_i("Terminating Firestore due to IndexedDb database deletion failed",o)})}),r._offlineComponents=e}async function Vy(r,e){r.asyncQueue.verifyOperationInProgress();const t=await DC(r);te(Si,"Initializing OnlineComponentProvider"),await e.initialize(t,r.configuration),r.setCredentialChangeListener(s=>Cy(e.remoteStore,s)),r.setAppCheckTokenChangeListener((s,o)=>Cy(e.remoteStore,o)),r._onlineComponents=e}async function DC(r){if(!r._offlineComponents)if(r._uninitializedComponentsProvider){te(Si,"Using user provided OfflineComponentProvider");try{await Ed(r,r._uninitializedComponentsProvider._offline)}catch(e){const t=e;if(!function(o){return o.name==="FirebaseError"?o.code===G.FAILED_PRECONDITION||o.code===G.UNIMPLEMENTED:!(typeof DOMException<"u"&&o instanceof DOMException)||o.code===22||o.code===20||o.code===11}(t))throw t;_i("Error using user provided cache. Falling back to memory cache: "+t),await Ed(r,new dc)}}else te(Si,"Using default OfflineComponentProvider"),await Ed(r,new PC(void 0));return r._offlineComponents}async function cE(r){return r._onlineComponents||(r._uninitializedComponentsProvider?(te(Si,"Using user provided OnlineComponentProvider"),await Vy(r,r._uninitializedComponentsProvider._online)):(te(Si,"Using default OnlineComponentProvider"),await Vy(r,new Gd))),r._onlineComponents}function OC(r){return cE(r).then(e=>e.syncEngine)}async function VC(r){const e=await cE(r),t=e.eventManager;return t.onListen=mC.bind(null,e.syncEngine),t.onUnlisten=_C.bind(null,e.syncEngine),t.onFirstRemoteStoreListen=gC.bind(null,e.syncEngine),t.onLastRemoteStoreUnlisten=vC.bind(null,e.syncEngine),t}function xC(r,e,t={}){const s=new yi;return r.asyncQueue.enqueueAndForget(async()=>function(l,h,f,g,_){const E=new kC({next:R=>{E.Ou(),h.enqueueAndForget(()=>aC(l,T));const j=R.docs.has(f);!j&&R.fromCache?_.reject(new ce(G.UNAVAILABLE,"Failed to get document because the client is offline.")):j&&R.fromCache&&g&&g.source==="server"?_.reject(new ce(G.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):_.resolve(R)},error:R=>_.reject(R)}),T=new cC(wf(f.path),E,{includeMetadataChanges:!0,ka:!0});return oC(l,T)}(await VC(r),r.asyncQueue,e,t,s)),s.promise}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function hE(r){const e={};return r.timeoutSeconds!==void 0&&(e.timeoutSeconds=r.timeoutSeconds),e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xy=new Map;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dE="firestore.googleapis.com",Ly=!0;class My{constructor(e){var t,s;if(e.host===void 0){if(e.ssl!==void 0)throw new ce(G.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=dE,this.ssl=Ly}else this.host=e.host,this.ssl=(t=e.ssl)!==null&&t!==void 0?t:Ly;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=Wv;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<lR)throw new ce(G.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}q1("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=hE((s=e.experimentalLongPollingOptions)!==null&&s!==void 0?s:{}),function(l){if(l.timeoutSeconds!==void 0){if(isNaN(l.timeoutSeconds))throw new ce(G.INVALID_ARGUMENT,`invalid long polling timeout: ${l.timeoutSeconds} (must not be NaN)`);if(l.timeoutSeconds<5)throw new ce(G.INVALID_ARGUMENT,`invalid long polling timeout: ${l.timeoutSeconds} (minimum allowed value is 5)`);if(l.timeoutSeconds>30)throw new ce(G.INVALID_ARGUMENT,`invalid long polling timeout: ${l.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(s,o){return s.timeoutSeconds===o.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class Uf{constructor(e,t,s,o){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=s,this._app=o,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new My({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new ce(G.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new ce(G.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new My(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=function(s){if(!s)return new M1;switch(s.type){case"firstParty":return new j1(s.sessionIndex||"0",s.iamToken||null,s.authTokenFactory||null);case"provider":return s.client;default:throw new ce(G.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(t){const s=xy.get(t);s&&(te("ComponentProvider","Removing Datastore"),xy.delete(t),s.terminate())}(this),Promise.resolve()}}function LC(r,e,t,s={}){var o;r=Ga(r,Uf);const l=Co(e),h=r._getSettings(),f=Object.assign(Object.assign({},h),{emulatorOptions:r._getEmulatorOptions()}),g=`${e}:${t}`;l&&(o_(`https://${g}`),a_("Firestore",!0)),h.host!==dE&&h.host!==g&&_i("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const _=Object.assign(Object.assign({},h),{host:g,ssl:l,emulatorOptions:s});if(!os(_,f)&&(r._setSettings(_),s.mockUserToken)){let E,T;if(typeof s.mockUserToken=="string")E=s.mockUserToken,T=Ut.MOCK_USER;else{E=Y0(s.mockUserToken,(o=r._app)===null||o===void 0?void 0:o.options.projectId);const R=s.mockUserToken.sub||s.mockUserToken.user_id;if(!R)throw new ce(G.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");T=new Ut(R)}r._authCredentials=new b1(new nv(E,T))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jf{constructor(e,t,s){this.converter=t,this._query=s,this.type="query",this.firestore=e}withConverter(e){return new jf(this.firestore,e,this._query)}}class St{constructor(e,t,s){this.converter=t,this._key=s,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new tl(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new St(this.firestore,e,this._key)}toJSON(){return{type:St._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,t,s){if(cl(t,St._jsonSchema))return new St(e,s||null,new me(Ye.fromString(t.referencePath)))}}St._jsonSchemaVersion="firestore/documentReference/1.0",St._jsonSchema={type:ct("string",St._jsonSchemaVersion),referencePath:ct("string")};class tl extends jf{constructor(e,t,s){super(e,t,wf(s)),this._path=s,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new St(this.firestore,null,new me(e))}withConverter(e){return new tl(this.firestore,e,this._path)}}function MC(r,e,...t){if(r=Tn(r),arguments.length===1&&(e=pf.newId()),H1("doc","path",e),r instanceof Uf){const s=Ye.fromString(e,...t);return Xg(s),new St(r,null,new me(s))}{if(!(r instanceof St||r instanceof tl))throw new ce(G.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const s=r._path.child(Ye.fromString(e,...t));return Xg(s),new St(r.firestore,r instanceof tl?r.converter:null,new me(s))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const by="AsyncQueue";class Fy{constructor(e=Promise.resolve()){this.Zu=[],this.Xu=!1,this.ec=[],this.tc=null,this.nc=!1,this.rc=!1,this.sc=[],this.F_=new Gv(this,"async_queue_retry"),this.oc=()=>{const s=vd();s&&te(by,"Visibility state changed to "+s.visibilityState),this.F_.y_()},this._c=e;const t=vd();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this.oc)}get isShuttingDown(){return this.Xu}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.ac(),this.uc(e)}enterRestrictedMode(e){if(!this.Xu){this.Xu=!0,this.rc=e||!1;const t=vd();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this.oc)}}enqueue(e){if(this.ac(),this.Xu)return new Promise(()=>{});const t=new yi;return this.uc(()=>this.Xu&&this.rc?Promise.resolve():(e().then(t.resolve,t.reject),t.promise)).then(()=>t.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Zu.push(e),this.cc()))}async cc(){if(this.Zu.length!==0){try{await this.Zu[0](),this.Zu.shift(),this.F_.reset()}catch(e){if(!Oo(e))throw e;te(by,"Operation failed with retryable error: "+e)}this.Zu.length>0&&this.F_.g_(()=>this.cc())}}uc(e){const t=this._c.then(()=>(this.nc=!0,e().catch(s=>{throw this.tc=s,this.nc=!1,Dr("INTERNAL UNHANDLED ERROR: ",Uy(s)),s}).then(s=>(this.nc=!1,s))));return this._c=t,t}enqueueAfterDelay(e,t,s){this.ac(),this.sc.indexOf(e)>-1&&(t=0);const o=xf.createAndSchedule(this,e,t,s,l=>this.lc(l));return this.ec.push(o),o}ac(){this.tc&&_e(47125,{hc:Uy(this.tc)})}verifyOperationInProgress(){}async Pc(){let e;do e=this._c,await e;while(e!==this._c)}Tc(e){for(const t of this.ec)if(t.timerId===e)return!0;return!1}Ic(e){return this.Pc().then(()=>{this.ec.sort((t,s)=>t.targetTimeMs-s.targetTimeMs);for(const t of this.ec)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.Pc()})}dc(e){this.sc.push(e)}lc(e){const t=this.ec.indexOf(e);this.ec.splice(t,1)}}function Uy(r){let e=r.message||"";return r.stack&&(e=r.stack.includes(r.message)?r.stack:r.message+`
`+r.stack),e}class zf extends Uf{constructor(e,t,s,o){super(e,t,s,o),this.type="firestore",this._queue=new Fy,this._persistenceKey=o?.name||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new Fy(e),this._firestoreClient=void 0,await e}}}function bC(r,e){const t=typeof r=="object"?r:h_(),s=typeof r=="string"?r:rc,o=nf(t,"firestore").getImmediate({identifier:s});if(!o._initialized){const l=X0("firestore");l&&LC(o,...l)}return o}function fE(r){if(r._terminated)throw new ce(G.FAILED_PRECONDITION,"The client has already been terminated.");return r._firestoreClient||FC(r),r._firestoreClient}function FC(r){var e,t,s;const o=r._freezeSettings(),l=function(f,g,_,E){return new rA(f,g,_,E.host,E.ssl,E.experimentalForceLongPolling,E.experimentalAutoDetectLongPolling,hE(E.experimentalLongPollingOptions),E.useFetchStreams,E.isUsingEmulator)}(r._databaseId,((e=r._app)===null||e===void 0?void 0:e.options.appId)||"",r._persistenceKey,o);r._componentsProvider||!((t=o.localCache)===null||t===void 0)&&t._offlineComponentProvider&&(!((s=o.localCache)===null||s===void 0)&&s._onlineComponentProvider)&&(r._componentsProvider={_offline:o.localCache._offlineComponentProvider,_online:o.localCache._onlineComponentProvider}),r._firestoreClient=new NC(r._authCredentials,r._appCheckCredentials,r._queue,l,r._componentsProvider&&function(f){const g=f?._online.build();return{_offline:f?._offline.build(g),_online:g}}(r._componentsProvider))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wn{constructor(e){this._byteString=e}static fromBase64String(e){try{return new wn(Dt.fromBase64String(e))}catch(t){throw new ce(G.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new wn(Dt.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:wn._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(cl(e,wn._jsonSchema))return wn.fromBase64String(e.bytes)}}wn._jsonSchemaVersion="firestore/bytes/1.0",wn._jsonSchema={type:ct("string",wn._jsonSchemaVersion),bytes:ct("string")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bf{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new ce(G.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new Nt(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pE{constructor(e){this._methodName=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rr{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new ce(G.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new ce(G.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return Ie(this._lat,e._lat)||Ie(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:rr._jsonSchemaVersion}}static fromJSON(e){if(cl(e,rr._jsonSchema))return new rr(e.latitude,e.longitude)}}rr._jsonSchemaVersion="firestore/geoPoint/1.0",rr._jsonSchema={type:ct("string",rr._jsonSchemaVersion),latitude:ct("number"),longitude:ct("number")};/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ir{constructor(e){this._values=(e||[]).map(t=>t)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(s,o){if(s.length!==o.length)return!1;for(let l=0;l<s.length;++l)if(s[l]!==o[l])return!1;return!0}(this._values,e._values)}toJSON(){return{type:ir._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(cl(e,ir._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every(t=>typeof t=="number"))return new ir(e.vectorValues);throw new ce(G.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}ir._jsonSchemaVersion="firestore/vectorValue/1.0",ir._jsonSchema={type:ct("string",ir._jsonSchemaVersion),vectorValues:ct("object")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const UC=/^__.*__$/;class jC{constructor(e,t,s){this.data=e,this.fieldMask=t,this.fieldTransforms=s}toMutation(e,t){return this.fieldMask!==null?new ms(e,this.data,this.fieldMask,t,this.fieldTransforms):new hl(e,this.data,t,this.fieldTransforms)}}function mE(r){switch(r){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw _e(40011,{Ec:r})}}class $f{constructor(e,t,s,o,l,h){this.settings=e,this.databaseId=t,this.serializer=s,this.ignoreUndefinedProperties=o,l===void 0&&this.Ac(),this.fieldTransforms=l||[],this.fieldMask=h||[]}get path(){return this.settings.path}get Ec(){return this.settings.Ec}Rc(e){return new $f(Object.assign(Object.assign({},this.settings),e),this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}Vc(e){var t;const s=(t=this.path)===null||t===void 0?void 0:t.child(e),o=this.Rc({path:s,mc:!1});return o.fc(e),o}gc(e){var t;const s=(t=this.path)===null||t===void 0?void 0:t.child(e),o=this.Rc({path:s,mc:!1});return o.Ac(),o}yc(e){return this.Rc({path:void 0,mc:!0})}wc(e){return fc(e,this.settings.methodName,this.settings.Sc||!1,this.path,this.settings.bc)}contains(e){return this.fieldMask.find(t=>e.isPrefixOf(t))!==void 0||this.fieldTransforms.find(t=>e.isPrefixOf(t.field))!==void 0}Ac(){if(this.path)for(let e=0;e<this.path.length;e++)this.fc(this.path.get(e))}fc(e){if(e.length===0)throw this.wc("Document fields must not be empty");if(mE(this.Ec)&&UC.test(e))throw this.wc('Document fields cannot begin and end with "__"')}}class zC{constructor(e,t,s){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=s||Pc(e)}Dc(e,t,s,o=!1){return new $f({Ec:e,methodName:t,bc:s,path:Nt.emptyPath(),mc:!1,Sc:o},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function BC(r){const e=r._freezeSettings(),t=Pc(r._databaseId);return new zC(r._databaseId,!!e.ignoreUndefinedProperties,t)}function $C(r,e,t,s,o,l={}){const h=r.Dc(l.merge||l.mergeFields?2:0,e,t,o);vE("Data must be an object, but it was:",h,s);const f=yE(s,h);let g,_;if(l.merge)g=new Un(h.fieldMask),_=h.fieldTransforms;else if(l.mergeFields){const E=[];for(const T of l.mergeFields){const R=WC(e,T,t);if(!h.contains(R))throw new ce(G.INVALID_ARGUMENT,`Field '${R}' is specified in your field mask but missing from your input data.`);qC(E,R)||E.push(R)}g=new Un(E),_=h.fieldTransforms.filter(T=>g.covers(T.field))}else g=null,_=h.fieldTransforms;return new jC(new En(f),g,_)}function gE(r,e){if(_E(r=Tn(r)))return vE("Unsupported field value:",e,r),yE(r,e);if(r instanceof pE)return function(s,o){if(!mE(o.Ec))throw o.wc(`${s._methodName}() can only be used with update() and set()`);if(!o.path)throw o.wc(`${s._methodName}() is not currently supported inside arrays`);const l=s._toFieldTransform(o);l&&o.fieldTransforms.push(l)}(r,e),null;if(r===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),r instanceof Array){if(e.settings.mc&&e.Ec!==4)throw e.wc("Nested arrays are not supported");return function(s,o){const l=[];let h=0;for(const f of s){let g=gE(f,o.yc(h));g==null&&(g={nullValue:"NULL_VALUE"}),l.push(g),h++}return{arrayValue:{values:l}}}(r,e)}return function(s,o){if((s=Tn(s))===null)return{nullValue:"NULL_VALUE"};if(typeof s=="number")return CA(o.serializer,s);if(typeof s=="boolean")return{booleanValue:s};if(typeof s=="string")return{stringValue:s};if(s instanceof Date){const l=Ke.fromDate(s);return{timestampValue:uc(o.serializer,l)}}if(s instanceof Ke){const l=new Ke(s.seconds,1e3*Math.floor(s.nanoseconds/1e3));return{timestampValue:uc(o.serializer,l)}}if(s instanceof rr)return{geoPointValue:{latitude:s.latitude,longitude:s.longitude}};if(s instanceof wn)return{bytesValue:bv(o.serializer,s._byteString)};if(s instanceof St){const l=o.databaseId,h=s.firestore._databaseId;if(!h.isEqual(l))throw o.wc(`Document reference is for database ${h.projectId}/${h.database} but should be for database ${l.projectId}/${l.database}`);return{referenceValue:Af(s.firestore._databaseId||o.databaseId,s._key.path)}}if(s instanceof ir)return function(h,f){return{mapValue:{fields:{[dv]:{stringValue:fv},[ic]:{arrayValue:{values:h.toArray().map(_=>{if(typeof _!="number")throw f.wc("VectorValues must only contain numeric values.");return Tf(f.serializer,_)})}}}}}}(s,o);throw o.wc(`Unsupported field value: ${mf(s)}`)}(r,e)}function yE(r,e){const t={};return ov(r)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):fs(r,(s,o)=>{const l=gE(o,e.Vc(s));l!=null&&(t[s]=l)}),{mapValue:{fields:t}}}function _E(r){return!(typeof r!="object"||r===null||r instanceof Array||r instanceof Date||r instanceof Ke||r instanceof rr||r instanceof wn||r instanceof St||r instanceof pE||r instanceof ir)}function vE(r,e,t){if(!_E(t)||!iv(t)){const s=mf(t);throw s==="an object"?e.wc(r+" a custom object"):e.wc(r+" "+s)}}function WC(r,e,t){if((e=Tn(e))instanceof Bf)return e._internalPath;if(typeof e=="string")return EE(r,e);throw fc("Field path arguments must be of type string or ",r,!1,void 0,t)}const HC=new RegExp("[~\\*/\\[\\]]");function EE(r,e,t){if(e.search(HC)>=0)throw fc(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,r,!1,void 0,t);try{return new Bf(...e.split("."))._internalPath}catch{throw fc(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,r,!1,void 0,t)}}function fc(r,e,t,s,o){const l=s&&!s.isEmpty(),h=o!==void 0;let f=`Function ${e}() called with invalid data`;t&&(f+=" (via `toFirestore()`)"),f+=". ";let g="";return(l||h)&&(g+=" (found",l&&(g+=` in field ${s}`),h&&(g+=` in document ${o}`),g+=")"),new ce(G.INVALID_ARGUMENT,f+r+g)}function qC(r,e){return r.some(t=>t.isEqual(e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wE{constructor(e,t,s,o,l){this._firestore=e,this._userDataWriter=t,this._key=s,this._document=o,this._converter=l}get id(){return this._key.path.lastSegment()}get ref(){return new St(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new KC(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){const t=this._document.data.field(TE("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}}class KC extends wE{data(){return super.data()}}function TE(r,e){return typeof e=="string"?EE(r,e):e instanceof Bf?e._internalPath:e._delegate._internalPath}class GC{convertValue(e,t="none"){switch(Ti(e)){case 0:return null;case 1:return e.booleanValue;case 2:return it(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(wi(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw _e(62114,{value:e})}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const s={};return fs(e,(o,l)=>{s[o]=this.convertValue(l,t)}),s}convertVectorValue(e){var t,s,o;const l=(o=(s=(t=e.fields)===null||t===void 0?void 0:t[ic].arrayValue)===null||s===void 0?void 0:s.values)===null||o===void 0?void 0:o.map(h=>it(h.doubleValue));return new ir(l)}convertGeoPoint(e){return new rr(it(e.latitude),it(e.longitude))}convertArray(e,t){return(e.values||[]).map(s=>this.convertValue(s,t))}convertServerTimestamp(e,t){switch(t){case"previous":const s=wc(e);return s==null?null:this.convertValue(s,t);case"estimate":return this.convertTimestamp(Xa(e));default:return null}}convertTimestamp(e){const t=Ei(e);return new Ke(t.seconds,t.nanos)}convertDocumentKey(e,t){const s=Ye.fromString(e);Fe($v(s),9688,{name:e});const o=new Ja(s.get(1),s.get(3)),l=new me(s.popFirst(5));return o.isEqual(t)||Dr(`Document ${l} contains a document reference within a different database (${o.projectId}/${o.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),l}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function QC(r,e,t){let s;return s=r?r.toFirestore(e):e,s}class La{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class ss extends wE{constructor(e,t,s,o,l,h){super(e,t,s,o,h),this._firestore=e,this._firestoreImpl=e,this.metadata=l}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new qu(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const s=this._document.data.field(TE("DocumentSnapshot.get",e));if(s!==null)return this._userDataWriter.convertValue(s,t.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new ce(G.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e=this._document,t={};return t.type=ss._jsonSchemaVersion,t.bundle="",t.bundleSource="DocumentSnapshot",t.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?t:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),t.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),t)}}ss._jsonSchemaVersion="firestore/documentSnapshot/1.0",ss._jsonSchema={type:ct("string",ss._jsonSchemaVersion),bundleSource:ct("string","DocumentSnapshot"),bundleName:ct("string"),bundle:ct("string")};class qu extends ss{data(e={}){return super.data(e)}}class Ba{constructor(e,t,s,o){this._firestore=e,this._userDataWriter=t,this._snapshot=o,this.metadata=new La(o.hasPendingWrites,o.fromCache),this.query=s}get docs(){const e=[];return this.forEach(t=>e.push(t)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach(s=>{e.call(t,new qu(this._firestore,this._userDataWriter,s.key,s,new La(this._snapshot.mutatedKeys.has(s.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new ce(G.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=function(o,l){if(o._snapshot.oldDocs.isEmpty()){let h=0;return o._snapshot.docChanges.map(f=>{const g=new qu(o._firestore,o._userDataWriter,f.doc.key,f.doc,new La(o._snapshot.mutatedKeys.has(f.doc.key),o._snapshot.fromCache),o.query.converter);return f.doc,{type:"added",doc:g,oldIndex:-1,newIndex:h++}})}{let h=o._snapshot.oldDocs;return o._snapshot.docChanges.filter(f=>l||f.type!==3).map(f=>{const g=new qu(o._firestore,o._userDataWriter,f.doc.key,f.doc,new La(o._snapshot.mutatedKeys.has(f.doc.key),o._snapshot.fromCache),o.query.converter);let _=-1,E=-1;return f.type!==0&&(_=h.indexOf(f.doc.key),h=h.delete(f.doc.key)),f.type!==1&&(h=h.add(f.doc),E=h.indexOf(f.doc.key)),{type:XC(f.type),doc:g,oldIndex:_,newIndex:E}})}}(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new ce(G.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e={};e.type=Ba._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=pf.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const t=[],s=[],o=[];return this.docs.forEach(l=>{l._document!==null&&(t.push(l._document),s.push(this._userDataWriter.convertObjectMap(l._document.data.value.mapValue.fields,"previous")),o.push(l.ref.path))}),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}}function XC(r){switch(r){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return _e(61501,{type:r})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function JC(r){r=Ga(r,St);const e=Ga(r.firestore,zf);return xC(fE(e),r._key).then(t=>eP(e,r,t))}Ba._jsonSchemaVersion="firestore/querySnapshot/1.0",Ba._jsonSchema={type:ct("string",Ba._jsonSchemaVersion),bundleSource:ct("string","QuerySnapshot"),bundleName:ct("string"),bundle:ct("string")};class YC extends GC{constructor(e){super(),this.firestore=e}convertBytes(e){return new wn(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new St(this.firestore,null,t)}}function _P(r,e,t){r=Ga(r,St);const s=Ga(r.firestore,zf),o=QC(r.converter,e);return ZC(s,[$C(BC(s),"setDoc",r._key,o,r.converter!==null,t).toMutation(r._key,Pr.none())])}function ZC(r,e){return function(s,o){const l=new yi;return s.asyncQueue.enqueueAndForget(async()=>EC(await OC(s),o,l)),l.promise}(fE(r),e)}function eP(r,e,t){const s=t.docs.get(e._key),o=new YC(r);return new ss(r,o,e._key,s,new La(t.hasPendingWrites,t.fromCache),e.converter)}(function(e,t=!0){(function(o){No=o})(Po),vo(new as("firestore",(s,{instanceIdentifier:o,options:l})=>{const h=s.getProvider("app").getImmediate(),f=new zf(new F1(s.getProvider("auth-internal")),new z1(h,s.getProvider("app-check-internal")),function(_,E){if(!Object.prototype.hasOwnProperty.apply(_.options,["projectId"]))throw new ce(G.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Ja(_.options.projectId,E)}(h,o),h);return l=Object.assign({useFetchStreams:t},l),f._setSettings(l),f},"PUBLIC").setMultipleInstances(!0)),mi(Hg,qg,e),mi(Hg,qg,"esm2017")})();var tP="firebase",nP="11.10.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */mi(tP,nP,"app");const rP={apiKey:"AIzaSyAcGGE37ZiTFcz8mo1pSECvDCDOXdzbSHY",authDomain:"fitnesspro-36d8b.firebaseapp.com",projectId:"fitnesspro-36d8b",storageBucket:"fitnesspro-36d8b.firebasestorage.app",messagingSenderId:"881881913799",appId:"1:881881913799:web:08399068acd96e83f0e1e2",measurementId:"G-G3XJ0741CW"},IE=c_(rP),SE=x1(IE),iP=bC(IE),sP=Y.lazy(()=>rl(()=>import("./Login-DQaToyyA.js"),__vite__mapDeps([0,1,2]),import.meta.url)),oP=Y.lazy(()=>rl(()=>import("./Register-NM_kihwG.js"),__vite__mapDeps([3,1,2]),import.meta.url)),aP=Y.lazy(()=>rl(()=>import("./DashboardCliente-D8uyIdCr.js"),__vite__mapDeps([4,5,1]),import.meta.url)),lP=Y.lazy(()=>rl(()=>import("./DashboardTrainer-BUZkJJLM.js"),__vite__mapDeps([6,5,1]),import.meta.url)),uP=Y.lazy(()=>rl(()=>import("./DashboardAdmin-BYUC2Lcm.js"),__vite__mapDeps([7,5,1]),import.meta.url));function cP(){const[r,e]=Y.useState(null),[t,s]=Y.useState(""),[o,l]=Y.useState(!0);if(Y.useEffect(()=>{const f=F_(SE,async g=>{if(g){e(g);const _=await JC(MC(iP,"users",g.uid));s(_.exists()?_.data().role:"")}else e(null),s("");l(!1)});return()=>f()},[]),o)return null;const h=()=>r?t==="cliente"?ut.jsx(aP,{user:r}):t==="trainer"?ut.jsx(lP,{user:r}):t==="admin"?ut.jsx(uP,{user:r}):ut.jsx(ud,{to:"/"}):ut.jsx(ud,{to:"/"});return ut.jsx(Y.Suspense,{fallback:ut.jsx("div",{children:"Carregando..."}),children:ut.jsxs(k0,{children:[ut.jsx(ka,{path:"/",element:ut.jsx(sP,{})}),ut.jsx(ka,{path:"/register",element:ut.jsx(oP,{})}),ut.jsx(ka,{path:"/dashboard",element:h()}),ut.jsx(ka,{path:"*",element:ut.jsx(ud,{to:"/"})})]})})}const hP=Y.createContext();function dP({children:r}){const[e,t]=Y.useState(null),[s,o]=Y.useState(null),[l,h]=Y.useState(!0);return Y.useEffect(()=>{const f=F_(SE,async g=>{if(g){t(g);const _=await fetchUserProfile(g.uid);o(_.role)}else t(null),o(null);h(!1)});return()=>f()},[]),ut.jsx(hP.Provider,{value:{user:e,role:s,loading:l},children:r})}Fw.createRoot(document.getElementById("root")).render(ut.jsx(zy.StrictMode,{children:ut.jsx(M0,{basename:"/",children:ut.jsx(dP,{children:ut.jsx(cP,{})})})}));export{pP as L,zy as R,SE as a,_P as b,mP as c,MC as d,iP as e,fP as f,JC as g,jy as h,Ow as i,ut as j,Y as r,gP as s,Qy as u};
