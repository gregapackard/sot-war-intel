// ==UserScript==
// @name         Cloudy's KAL Bridge
// @namespace    cloudy.sot.warintel
// @version      1.1.0
// @description  Cross-origin KAL transport bridge for Cloudy's SoT War Intel Exporter v6.2
// @match        https://gregapackard.github.io/sot-war-intel/*
// @match        http://localhost/*
// @match        http://127.0.0.1/*
// @grant        GM_xmlhttpRequest
// @connect      api.kalends.dev
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';
  const ALLOWED_HOST = 'api.kalends.dev';
  const ALLOWED_PATH_PREFIX = '/script/';
  window.addEventListener('message', (ev) => {
    if (ev.source !== window) return;
    const d = ev.data;
    if (!d || d.source !== 'cloudy-war-exporter' || d.type !== 'KAL_REQUEST') return;
    let u; try { u = new URL(d.url); } catch { return; }
    if (u.protocol !== 'https:' || u.hostname !== ALLOWED_HOST || !u.pathname.startsWith(ALLOWED_PATH_PREFIX)) return;
    GM_xmlhttpRequest({
      method: 'GET', url: u.href, headers: { 'Accept': 'application/json' }, timeout: 30000,
      onload: (r) => {
        let retryAfter = null;
        const m = String(r.responseHeaders || '').match(/^retry-after:\s*([^\r\n]+)/im);
        if (m) retryAfter = m[1].trim();
        window.postMessage({source:'cloudy-kal-bridge',type:'KAL_RESPONSE',requestId:d.requestId,status:r.status,responseText:r.responseText||'',retryAfter}, '*');
      },
      ontimeout: () => window.postMessage({source:'cloudy-kal-bridge',type:'KAL_RESPONSE',requestId:d.requestId,error:'KAL request timed out'}, '*'),
      onerror: () => window.postMessage({source:'cloudy-kal-bridge',type:'KAL_RESPONSE',requestId:d.requestId,error:'GM_xmlhttpRequest network error'}, '*')
    });
  });
})();