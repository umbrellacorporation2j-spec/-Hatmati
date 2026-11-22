const V='khadamati-v14',CORE=V+'-core',RT=V+'-rt';
const ASSETS=['./','./index.html','./manifest.json','./manus-routes.json','./assets/logo.png','./assets/icon-192.png','./assets/icon-512.png','./assets/icon-maskable-512.png','./assets/apple-touch-icon.png'];
const G='https://www.gstatic.com/firebasejs/10.14.1/',FB=['firebase-app.js','firebase-auth.js','firebase-firestore.js'].map(f=>G+f);
const EXT=/^https:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com|www\.gstatic\.com\/firebasejs)\//;
const LIVE=/firestore\.googleapis|identitytoolkit|securetoken|firebaseinstallations|jsonbin/;
self.addEventListener('install',e=>e.waitUntil(caches.open(CORE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CORE&&x!==RT).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('message',e=>{if(e.data==='SKIP')self.skipWaiting();if(e.data==='WARM')e.waitUntil(warm())});
async function warm(){const c=await caches.open(RT),seen=new Set();
  const walk=async u=>{if(seen.has(u))return;seen.add(u);try{const r=await fetch(u,{mode:'cors'});if(!r.ok)return;await c.put(u,r.clone());const t=await r.text();
    for(const m of t.matchAll(/(?:from|import)\s*\(?\s*["']([^"']+\.js)["']/g)){const n=new URL(m[1],u).href;if(n.startsWith(G))await walk(n)}}catch(x){}};
  await Promise.all(FB.map(walk))}
async function nav(req){const c=await caches.open(CORE);
  try{const r=await Promise.race([fetch(req),new Promise((_,j)=>setTimeout(j,4000))]);if(r&&r.ok)c.put('./index.html',r.clone());return r}
  catch(x){return (await c.match('./index.html'))||(await c.match('./'))||Response.error()}}
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(LIVE.test(u.href))return;
  if(r.mode==='navigate'){e.respondWith(nav(r));return}
  const same=u.origin===location.origin,ext=EXT.test(u.href);if(!same&&!ext)return;
  e.respondWith((async()=>{const c=await caches.open(same?CORE:RT),hit=await c.match(r,{ignoreSearch:same});
    if(hit&&u.pathname.includes('/firebasejs/'))return hit;
    const net=fetch(r).then(x=>{if(x&&x.ok)c.put(r,x.clone());return x}).catch(()=>null);
    if(hit){e.waitUntil(net);return hit}
    return (await net)||Response.error()})())});
