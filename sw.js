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

      const css=`<style id="mh-athlete-switch-style">.athleteSwitch{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0 2px}.athleteSwitch button{border:1px solid var(--line);background:#101014;color:var(--muted);border-radius:14px;padding:11px 12px;font-weight:900;cursor:pointer}.athleteSwitch button.on{background:var(--lime);color:#09090b;border-color:var(--lime);box-shadow:0 8px 30px rgba(217,255,87,.12)}</style>`;
      const switcher=`<div class="athleteSwitch" id="athleteSwitch" aria-label="Choisir le profil"><button id="switchMomo">Momo</button><button id="switchMicky">⚡ Micky</button></div>`;
      const script=`<script id="mh-athlete-switch-script">(()=>{const sync=()=>{const a=document.getElementById('switchMomo'),b=document.getElementById('switchMicky');if(!a||!b||typeof S==='undefined')return;a.classList.toggle('on',S.person!=='power');b.classList.toggle('on',S.person==='power')};const setProfile=p=>{if(typeof S==='undefined')return;S.person=p;if(typeof save==='function')save();if(typeof renderAll==='function')renderAll();sync();if(typeof toast==='function')toast(p==='power'?'Profil Micky · puissance':'Profil Momo')};const a=document.getElementById('switchMomo'),b=document.getElementById('switchMicky');if(a)a.addEventListener('click',()=>setProfile('momo'));if(b)b.addEventListener('click',()=>setProfile('power'));document.addEventListener('click',e=>{if(e.target&&e.target.matches&&e.target.matches('[data-person]'))setTimeout(sync,0)},true);sync()})();<\/script>`;
      if(!html.includes('mh-athlete-switch-style')) html=html.replace('</head>',css+'</head>');
      if(!html.includes('id="athleteSwitch"')) html=html.replace('</header>','</header>'+switcher);
      if(!html.includes('mh-athlete-switch-script')) html=html.replace('</body>',script+'</body>');
      return new Response(html,{status:res.status,statusText:res.statusText,headers:res.headers});
    })());
  }
});