self.addEventListener('install',event=>{self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(self.clients.claim())});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.mode!=='navigate') return;
  event.respondWith((async()=>{
    try{
      const res=await fetch(req,{cache:'no-store'});
      const ct=res.headers.get('content-type')||'';
      if(!ct.includes('text/html')) return res;
      let html=await res.text();
      const css=`<style id="mh-v3-switch-style">.athleteSwitch{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0 2px}.athleteSwitch button{border:1px solid var(--line);background:#101014;color:var(--muted);border-radius:14px;padding:11px 12px;font-weight:900;cursor:pointer}.athleteSwitch button.on{background:var(--lime);color:#09090b;border-color:var(--lime);box-shadow:0 8px 30px rgba(217,255,87,.12)}</style>`;
      const switcher=`<div class="athleteSwitch" id="athleteSwitch" aria-label="Choisir le profil"><button id="switchMomo">Momo</button><button id="switchMicky">⚡ Micky</button></div>`;
      if(!html.includes('mh-v3-switch-style')) html=html.replace('</head>',css+'</head>');
      if(!html.includes('id="athleteSwitch"')) html=html.replace('</header>','</header>'+switcher);
      if(!html.includes('src="./v3.js')) html=html.replace('</body>','<script src="./v3.js?v=3"></script></body>');
      return new Response(html,{status:res.status,statusText:res.statusText,headers:res.headers});
    }catch(e){return fetch(req)}
  })());
});