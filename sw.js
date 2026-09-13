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

      const css=`<style id="mh-athlete-switch-style">.athleteSwitch{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0 2px}.athleteSwitch button{border:1px solid var(--line);background:#101014;color:var(--muted);border-radius:14px;padding:11px 12px;font-weight:900;cursor:pointer}.athleteSwitch button.on{background:var(--lime);color:#09090b;border-color:var(--lime);box-shadow:0 8px 30px rgba(217,255,87,.12)}.mh-power-rule{margin-top:10px;padding:10px 12px;border-radius:13px;background:rgba(217,255,87,.06);border:1px solid rgba(217,255,87,.13);font-size:12px;color:var(--muted);line-height:1.45}.mh-power-rule b{color:var(--lime)}</style>`;
      const switcher=`<div class="athleteSwitch" id="athleteSwitch" aria-label="Choisir le profil"><button id="switchMomo">Momo</button><button id="switchMicky">⚡ Micky</button></div>`;
      const script=`<script id="mh-athlete-switch-script">(()=>{
        const schemes={A:{name:'Développé couché explosif',sets:2,reps:3,load:'50–60% de son max',main:'2×6–8 force'},B:{name:'Sauts explosifs',sets:2,reps:3,load:'poids du corps',main:'2×6–8 presse / hack'},C:{name:'Développé incliné explosif',sets:2,reps:3,load:'charge légère et rapide',main:'2×8–10 contrôle'}};
        const sync=()=>{const a=document.getElementById('switchMomo'),b=document.getElementById('switchMicky');if(!a||!b||typeof S==='undefined')return;a.classList.toggle('on',S.person!=='power');b.classList.toggle('on',S.person==='power')};
        const setProfile=p=>{if(typeof S==='undefined')return;S.person=p;if(typeof save==='function')save();if(typeof renderAll==='function')renderAll();sync();if(typeof toast==='function')toast(p==='power'?'Profil Micky · puissance':'Profil Momo')};
        const a=document.getElementById('switchMomo'),b=document.getElementById('switchMicky');if(a)a.addEventListener('click',()=>setProfile('momo'));if(b)b.addEventListener('click',()=>setProfile('power'));
        if(typeof rows==='function'&&typeof card==='function'&&typeof P!=='undefined'){
          rows=function(code,interactive){return P[code].ex.map(function(e,i){var person=(S.person||'momo'),k=person+'-'+code+'-'+i,d=S.drafts[k]||{},sets=parseInt((e[1].match(/^(\\d+)/)||['','3'])[1]);if(S.week===4)sets=Math.max(2,sets-1);var sc=S.person==='power'?schemes[code]:null;if(sc&&i===0)sets=2;var out='';if(interactive){for(var n=0;n<sets;n++){var x=(d.sets||[])[n]||{};out+='<div class="setgrid"><span>S'+(n+1)+'</span><input data-set="'+k+'" data-i="'+n+'" data-f="kg" inputmode="decimal" placeholder="kg" value="'+(x.kg!=null?x.kg:(n===0?e[2]:''))+'"><input data-set="'+k+'" data-i="'+n+'" data-f="reps" inputmode="numeric" placeholder="reps" value="'+(x.reps!=null?x.reps:'')+'"><button class="check '+(x.done?'on':'')+'" data-check="'+k+'" data-i="'+n+'">'+(x.done?'✓':'○')+'</button></div>'}}var meta=sc&&i===0?sc.main+' · '+e[3]:planText(e)+' · '+e[3];return '<div class="exercise"><div class="exTop"><div><div class="exName">'+e[0]+'</div><div class="exMeta">'+meta+'</div></div>'+(e[2]?'<span class="tag">'+e[2]+' kg</span>':'')+'</div>'+out+'</div>'}).join('')};
          card=function(code,interactive){var p=P[code],sc=S.person==='power'?schemes[code]:null,pow='';if(sc){var pk='power-'+code,pd=S.drafts[pk]||{},ps=S.week===4?1:sc.sets,pout='';if(interactive){for(var n=0;n<ps;n++){var x=(pd.sets||[])[n]||{};pout+='<div class="setgrid"><span>⚡'+(n+1)+'</span><input data-set="'+pk+'" data-i="'+n+'" data-f="kg" inputmode="decimal" placeholder="kg / PDC" value="'+(x.kg!=null?x.kg:'')+'"><input data-set="'+pk+'" data-i="'+n+'" data-f="reps" inputmode="numeric" placeholder="reps" value="'+(x.reps!=null?x.reps:sc.reps)+'"><button class="check '+(x.done?'on':'')+'" data-check="'+pk+'" data-i="'+n+'">'+(x.done?'✓':'○')+'</button></div>'}}pow='<div class="note"><strong>⚡ Micky · bloc puissance</strong><div class="small muted">'+sc.name+' · '+ps+'×'+sc.reps+' · '+sc.load+'. Ensuite '+sc.main+'.</div>'+pout+'<div class="mh-power-rule"><b>Rien en plus :</b> ces séries remplacent une partie des séries normales. Même durée de séance, mais plus orientée explosivité.</div></div>'}return '<div class="card daycard"><div class="dayhead"><div><b>'+p.title+'</b><div class="small muted">'+(S.person==='power'?'Micky · puissance · ':'')+W[S.week-1].phase+'</div></div><span class="tag">'+p.day+'</span></div>'+pow+rows(code,interactive)+'<div class="why"><b>Pourquoi :</b> '+p.why+'</div>'+(interactive?'<button class="btn" id="finishWorkout">Terminer & enregistrer</button>':'')+'</div>'};
          if(typeof finish==='function'){finish=function(){var q=today(),c=q[0],t=q[1];if(t!=='muscu')return;var v=0,person=S.person||'momo',prefixes=[person+'-'+c+'-','power-'+c];Object.keys(S.drafts).filter(function(k){return prefixes.some(function(p){return k.indexOf(p)===0})}).forEach(function(k){(S.drafts[k].sets||[]).forEach(function(x){if(x.done)v+=(parseFloat(x.kg)||0)*(parseInt(x.reps)||0)})});S.workouts.unshift({date:new Date().toISOString(),code:c,week:S.week,person:person,volume:v});Object.keys(S.drafts).filter(function(k){return prefixes.some(function(p){return k.indexOf(p)===0})}).forEach(function(k){delete S.drafts[k]});S.workouts=S.workouts.slice(0,50);save();toast('Séance enregistrée ✓');renderAll()}}
          const oldRenderProgram=renderProgram;renderProgram=function(){oldRenderProgram();sync()};
          renderAll();
        }
        document.addEventListener('click',e=>{if(e.target&&e.target.matches&&e.target.matches('[data-person]'))setTimeout(sync,0)},true);sync();
      })();<\/script>`;
      if(!html.includes('mh-athlete-switch-style')) html=html.replace('</head>',css+'</head>');
      if(!html.includes('id="athleteSwitch"')) html=html.replace('</header>','</header>'+switcher);
      if(!html.includes('mh-athlete-switch-script')) html=html.replace('</body>',script+'</body>');
      return new Response(html,{status:res.status,statusText:res.statusText,headers:res.headers});
    })());
  }
});