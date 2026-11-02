import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { createHash } from 'node:crypto';
const root=resolve(import.meta.dirname,'../public');
async function walk(dir){const results=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=resolve(dir,e.name);if(e.isDirectory())results.push(...await walk(p));else results.push(p);}return results;}
const files=await walk(root);
const textFiles=files.filter(p=>/\.(html|css|js|svg)$/.test(p));
test('strict security and privacy response headers are configured',async()=>{
 const h=await readFile(resolve(root,'_headers'),'utf8');
 for(const value of ["Strict-Transport-Security: max-age=31536000","default-src 'none'","script-src 'self'","style-src 'self'","font-src 'self'","connect-src 'none'","object-src 'none'","base-uri 'none'","frame-ancestors 'none'","form-action 'none'","script-src-attr 'none'","style-src-attr 'none'","X-Content-Type-Options: nosniff","X-Frame-Options: DENY","Referrer-Policy: no-referrer","Cross-Origin-Opener-Policy: same-origin","Cache-Control: private, no-store"]){assert.ok(h.includes(value),value);}
 assert.ok(!/unsafe-inline|unsafe-eval|https:\/\//.test(h));
});
test('page assets are local, exist, and cannot escape the public directory',async()=>{
 for(const p of textFiles){const s=await readFile(p,'utf8');
 assert.ok(!/@import\s|https?:\/\//i.test(s.replace('xmlns="http://www.w3.org/2000/svg"','')),`External network dependency in ${p}`);
 for(const match of s.matchAll(/(?:src|href)=["']([^"']+)["']|url\(["']?([^\s)'";]+)["']?\)/g)){
 const target=match[1]||match[2];if(target.startsWith('#')||target.startsWith('mailto:'))continue;
 assert.ok(!/^[a-z]+:|^\/\/|^data:/i.test(target),target);
 const clean=target.split(/[?#]/)[0];const local=resolve(dirname(p),clean.replace(/^\//,''));assert.ok(local.startsWith(root+'/'),target);assert.ok((await stat(local)).isFile(),target);
 }
 }
});
test('no inline executable content or dynamic injection sinks',async()=>{
 for(const p of textFiles){const s=await readFile(p,'utf8');assert.ok(!/\bon\w+\s*=|\bstyle\s*=|javascript:/i.test(s),p);
 if(p.endsWith('.html'))for(const m of s.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){assert.match(m[1],/\bsrc=/);assert.equal(m[2].trim(),'');}
 if(p.endsWith('.js'))assert.ok(!/\b(?:eval|Function)\s*\(|innerHTML|outerHTML|insertAdjacentHTML|document\.write|document\.cookie|localStorage|sessionStorage|\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(s),p);
 }
});
test('public payload has no legacy documents, debug files or phone patterns',async()=>{
 const allowed=new Set(['.html','.css','.js','.svg','.pdf','.webp','.ttf','.txt']);
 for(const p of files){const name=p.split('/').at(-1);if(['_headers','.assetsignore'].includes(name))continue;
 assert.ok(allowed.has(p.slice(p.lastIndexOf('.'))),p);assert.ok(!/\.(?:docx|map|zip|env|bak)$/.test(p),p);
 if(/\.(?:html|js|css|txt|svg)$/.test(p)){const s=await readFile(p,'utf8');assert.ok(!/\b0[127]\d[\d\s]{8,}\b/.test(s),`Phone-like number in ${p}`);assert.ok(!/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\bgh[pousr]_[A-Za-z0-9]{20,}|\bAKIA[A-Z0-9]{16}\b/.test(s),p);}
 }
});
test('displayed CV pages and PDF match the reviewed release manifest',async()=>{
 const manifest=JSON.parse(await readFile(resolve(root,'../cv-release.json'),'utf8'));
 for(const [name,sha] of Object.entries(manifest)){const b=await readFile(resolve(root,name));assert.equal(createHash('sha256').update(b).digest('hex'),sha,name);}
 const cv=await readFile(resolve(root,'cv.html'),'utf8');for(const name of Object.keys(manifest))assert.ok(cv.includes(name),name);
 const b=await readFile(resolve(root,'Mark-Cook-CV-v3.pdf'));assert.ok(b.subarray(0,5).toString()==='%PDF-');assert.ok(!/\/(?:JavaScript|Launch|EmbeddedFile|OpenAction)\b/.test(b.toString('latin1')));
});
test('deployment uses exact versions, integrity-locked packages and static assets only',async()=>{
 const pkg=JSON.parse(await readFile(resolve(root,'../package.json'),'utf8'));assert.match(pkg.devDependencies.wrangler,/^\d+\.\d+\.\d+$/);assert.equal(Object.keys(pkg.dependencies||{}).length,0);
 const lock=JSON.parse(await readFile(resolve(root,'../package-lock.json'),'utf8'));assert.equal(lock.packages['node_modules/wrangler'].version,pkg.devDependencies.wrangler);
 for(const [path,p] of Object.entries(lock.packages)){if(path&&p.resolved)assert.ok(p.integrity,path);}
 const config=JSON.parse(await readFile(resolve(root,'../wrangler.jsonc'),'utf8'));assert.equal(config.assets.directory,'./public');assert.ok(!config.main&&!config.vars&&!config.d1_databases&&!config.r2_buckets);
});
