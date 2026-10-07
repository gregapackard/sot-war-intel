// ==UserScript==
// @name         Cloudy's KAL Bridge
// @namespace    cloudy.sot.warintel
// @version      1.2.0
// @description  KAL transport bridge for Cloudy's SoT War Room v6.3
// @match        https://gregapackard.github.io/sot-war-intel/*
// @grant        GM_xmlhttpRequest
// @connect      api.kalends.dev
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';
  const ALLOWED_HOST='api.kalends.dev', ALLOWED_PATH_PREFIX='/script/';
  document.addEventListener('cloudy-kal-ping', ev => {
    const responseEvent=ev.detail && ev.detail.responseEvent;
    if(responseEvent) document.dispatchEvent(new CustomEvent(responseEvent,{detail:{ok:true,version:'1.2.0'}}));
  });
  document.addEventListener('cloudy-kal-request', ev => {
    const d=ev.detail||{};
    if(!d.requestId||!d.url||!d.responseEvent)return;
    let u;try{u=new URL(d.url)}catch{return}
    if(u.protocol!=='https:'||u.hostname!==ALLOWED_HOST||!u.pathname.startsWith(ALLOWED_PATH_PREFIX))return;
    const reply=detail=>document.dispatchEvent(new CustomEvent(d.responseEvent,{detail}));
    GM_xmlhttpRequest({
      method:'GET',url:u.href,headers:{Accept:'application/json'},timeout:30000,
      onload:r=>{
        let retryAfter=null;const m=String(r.responseHeaders||'').match(/^retry-after:\s*([^\r\n]+)/im);if(m)retryAfter=m[1].trim();
        reply({status:r.status,responseText:r.responseText||'',retryAfter});
      },
      ontimeout:()=>reply({error:'KAL request timed out'}),
      onerror:()=>reply({error:'GM_xmlhttpRequest network error'})
    });
  });
})();