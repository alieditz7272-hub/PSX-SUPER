const CACHE="psx-super-v3"; 
const ASSETS=["./","./index.html","./styles.css","./app.js","./manifest.webmanifest"];
self.addEventListener('install', e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))); });
self.addEventListener('fetch', e=>{
  e.respondWith(caches.match(e.request).then(cached=>{
    return fetch(e.request).then(res=>{
      if(e.request.method==="GET"&&res.ok) caches.open(CACHE).then(cache=>cache.put(e.request,res.clone()));
      return res;
    }).catch(()=> cached||caches.match("./index.html"));
  }));
});
