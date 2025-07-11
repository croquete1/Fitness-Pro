(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))n(e);new MutationObserver(e=>{for(const r of e)if(r.type==="childList")for(const t of r.addedNodes)t.tagName==="LINK"&&t.rel==="modulepreload"&&n(t)}).observe(document,{childList:!0,subtree:!0});function s(e){const r={};return e.integrity&&(r.integrity=e.integrity),e.referrerPolicy&&(r.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?r.credentials="include":e.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(e){if(e.ep)return;e.ep=!0;const r=s(e);fetch(e.href,r)}})();var c={exports:{}},i={};/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var d;function a(){if(d)return i;d=1;var l=Symbol.for("react.transitional.element"),o=Symbol.for("react.fragment");function s(n,e,r){var t=null;if(r!==void 0&&(t=""+r),e.key!==void 0&&(t=""+e.key),"key"in e){r={};for(var u in e)u!=="key"&&(r[u]=e[u])}else r=e;return e=r.ref,{$$typeof:l,type:n,key:t,ref:e!==void 0?e:null,props:r}}return i.Fragment=o,i.jsx=s,i.jsxs=s,i}var f;function p(){return f||(f=1,c.exports=a()),c.exports}p();
