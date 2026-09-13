self.addEventListener('install',e=>{self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(self.clients.claim())});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.mode!=='navigate') return;
  event.respondWith((async()=>{
    try{
      const res=await fetch(req,{cache:'no-store'});
      const ct=res.headers.get('content-type')||'';
      if(!ct.includes('text/html')) return res;
      let html=await res.text();
      if(!html.includes('navfix.js')) html=html.replace('</body>','<script src="./navfix.js?v=1"></script></body>');
      return new Response(html,{status:res.status,statusText:res.statusText,headers:res.headers});
    }catch(e){return fetch(req,{cache:'no-store'})}
  })());
});