import assert from 'node:assert/strict';
const origin=new URL(process.argv[2]||'');assert.equal(origin.protocol,'https:','Use HTTPS');
for(const path of ['/','/cv.html','/privacy.html','/Mark-Cook-CV-v3.pdf','/cv-page-2-v3.webp','/missing-security-check']){
 const url=new URL(path,origin);const r=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(15000)});
 const location=r.headers.get('location')||'';
 if(r.status>=300&&r.status<400&&/cloudflareaccess|cdn-cgi\/access/.test(location)){console.error('BLOCKED: Cloudflare Access requires an authorized session. Application headers unverified.');process.exitCode=2;break;}
 assert.ok(r.status===200||(path==='/missing-security-check'&&r.status===404),`${path}: ${r.status}`);
 for(const [key,expected] of Object.entries({'x-content-type-options':'nosniff','x-frame-options':'DENY','referrer-policy':'no-referrer','cross-origin-opener-policy':'same-origin','cross-origin-resource-policy':'same-origin'}))assert.equal(r.headers.get(key),expected,`${path}: ${key}`);
 assert.match(r.headers.get('strict-transport-security')||'',/max-age=31536000/);
 assert.match(r.headers.get('content-security-policy')||'',/default-src 'none'/);
 assert.match(r.headers.get('cache-control')||'',/no-store/);
 console.log(`PASS ${path}`);
}
