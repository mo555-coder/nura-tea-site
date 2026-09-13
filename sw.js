self.addEventListener('install',event=>{self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(self.clients.claim())});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.mode==='navigate'){
    event.respondWith((async()=>{
      const res=await fetch(req,{cache:'no-store'});
      const ct=res.headers.get('content-type')||'';
      if(!ct.includes('text/html')) return res;
      let html=await res.text();
      html=html.replace("[['momo','Momo'],['same','Ami 1 · même séance'],['power','Ami 2 · puissance']]","[['momo','Momo'],['power','Micky · puissance'],['same','Ami 2 · même séance']]");
      html=html.replace('Ami 1 · même séance','Ami 2 · même séance');
      html=html.replace('Ami 2 · puissance','Micky · puissance');
      return new Response(html,{status:res.status,statusText:res.statusText,headers:res.headers});
    })());
  }
});