(()=>{
  if(typeof P==='undefined'||typeof W==='undefined'||typeof S==='undefined') return;

  // Data model upgrade — keep all existing local data.
  S.loads=S.loads||{};
  S.milestones=S.milestones||[];
  S.runStep=Math.min(8,Math.max(1,S.runStep||1));
  S.drafts=S.drafts||{};
  S.workouts=S.workouts||[];
  S.cardio=S.cardio||[];

  // Momo/Ami 2: 10–12 reps. One direct ab exercise every gym day.
  P.A.title='A — Haut du corps + abdos';
  P.A.ex=[
    ['Développé couché barre','4×10–12','52.5','RIR 2',2.5],
    ['Rowing horizontal lourd','4×10–12','','RIR 2',2.5],
    ['Développé épaules haltères','3×10–12','','RIR 2',2.5],
    ['Tirage vertical','3×10–12','','RIR 2',2.5],
    ['Face pull','3×12–15','','contrôle',2.5],
    ['Crunch poulie','3×10–12','','abdos',2.5]
  ];
  P.B.title='B — Jambes + abdos';
  P.B.ex=[
    ['Presse à cuisses / hack squat','4×10–12','','genou confortable',5],
    ['Soulevé de terre roumain','3×10–12','','RIR 2',5],
    ['Fente ou presse unilatérale','3×10–12/jambe','','stable',2.5],
    ['Mollets','4×12–15','','pause en haut',5],
    ['Ab-wheel','3×8–12','','gainage dynamique',0]
  ];
  P.C.title='C — Haut du corps volume + abdos';
  P.C.ex=[
    ['Développé incliné haltères','4×10–12','','RIR 2',2.5],
    ['Rowing haltère unilatéral','4×10–12','','RIR 2',2.5],
    ['Développé épaules assis','3×10–12','','RIR 2',2.5],
    ['Tirage poulie prise large','3×10–12','','dos',2.5],
    ['Biceps + triceps','3×10–12 chacun','','superset',2.5],
    ['Relevés de genoux suspendu','3×10–12','','abdos',0]
  ];

  const power={
    A:{name:'Développé couché explosif',sets:2,reps:3,load:'50–60% du max',main:'2×8–10 force'},
    B:{name:'Sauts explosifs',sets:2,reps:3,load:'poids du corps',main:'2×8–10 presse / hack'},
    C:{name:'Développé incliné explosif',sets:2,reps:3,load:'charge légère et rapide',main:'2×8–10 contrôle'}
  };

  const fmtKg=v=>v===''||v==null?'':String(Number(v)).replace('.',',')+' kg';
  const loadKey=(person,code,i)=>`${person}-${code}-${i}`;
  const repTop=txt=>{const m=String(txt).match(/(\d+)\s*[–-]\s*(\d+)/);return m?+m[2]:null};
  const planTextV3=e=>S.week===4?e[1].replace(/4×/,'3×').replace(/3×/,'2×')+' · deload':e[1];
  const powerScheme=code=>S.person==='power'?power[code]:null;
  const prescribedSets=(code,i,e)=>{let n=parseInt((planTextV3(e).match(/^(\d+)/)||['','3'])[1]);if(S.person==='power'&&i===0)n=2;return n};
  const currentLoad=(code,i,e)=>{const x=S.loads[loadKey(S.person,code,i)];return x?.current??(e[2]?parseFloat(e[2]):'')};

  // Premium utility styles + coach memory card.
  const st=document.createElement('style');
  st.textContent=`.coach{background:linear-gradient(145deg,rgba(217,255,87,.11),rgba(124,235,208,.05));border:1px solid rgba(217,255,87,.2);border-radius:20px;padding:15px}.coach .next{font-size:23px;font-weight:950;letter-spacing:-.7px;margin:5px 0}.chips{display:flex;gap:7px;flex-wrap:wrap;margin-top:9px}.chip{border:1px solid var(--line);background:#0f0f12;border-radius:999px;padding:7px 9px;font-size:11px;color:#ddd}.milestone{display:flex;justify-content:space-between;gap:12px;padding:11px 0;border-top:1px solid var(--line)}.milestone:first-child{border-top:0}.milestone strong{color:var(--lime)}.subtle{font-size:11px;color:var(--muted);line-height:1.45}.statusgood{color:var(--mint)}`;
  document.head.appendChild(st);

  const todayView=document.getElementById('today');
  const blockSection=todayView?.querySelector('.section');
  if(blockSection&&!document.getElementById('resumeCoach')){
    const sec=document.createElement('div');sec.className='section';
    sec.innerHTML='<div class="head"><h2>Tu en étais là</h2><span class="small muted">mémoire auto</span></div><div class="coach" id="resumeCoach"></div>';
    blockSection.parentNode.insertBefore(sec,blockSection);
  }

  // Replace the old static progression screen with live progression.
  const prog=document.getElementById('progress');
  if(prog){prog.innerHTML='<div class="head"><h2>Progrès</h2><span class="small muted">charges + paliers</span></div><div class="card"><div class="dayhead"><b>Charges de travail</b><span class="tag">AUTO</span></div><div id="loadProgress"></div><div class="why"><b>Règle Momo :</b> 10–12 reps. Toutes les séries à 12 reps → prochaine charge +2,5 kg haut du corps / +5 kg jambes.</div></div><div class="card daycard"><div class="dayhead"><b>Paliers validés</b><span class="tag">PR</span></div><div id="milestones"></div></div><div class="card daycard"><div class="bigstat" id="volumeStat">0 kg</div><div class="small muted">volume muscu enregistré</div></div><div class="card daycard"><div class="dayhead"><b>Historique</b><span class="small muted" id="historyCount"></span></div><div id="history"></div></div>'}

  // Upgrade cardio card with run progression memory.
  const runCard=document.getElementById('runPlan')?.closest('.card');
  if(runCard){const tag=runCard.querySelector('.tag');if(tag)tag.id='runStepTag';let sub=document.getElementById('runLast');if(!sub){sub=document.createElement('div');sub.id='runLast';sub.className='subtle';document.getElementById('runPlan').after(sub)}const why=runCard.querySelector('.why');if(why)why.innerHTML='<b>Progression auto :</b> dès que tu enregistres la durée prévue, l’app valide ce palier et prépare la course suivante.'}

  // Data backup button.
  const reset=document.getElementById('resetBtn');
  if(reset&&!document.getElementById('exportBtn')){const b=document.createElement('button');b.className='btn secondary';b.id='exportBtn';b.textContent='Exporter une sauvegarde';reset.before(b);b.onclick=()=>{const blob=new Blob([JSON.stringify(S,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='momo-hybrid-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast('Sauvegarde exportée ✓')}}

  rows=function(code,interactive){return P[code].ex.map((e,i)=>{const key=loadKey(S.person,code,i),draft=S.drafts[key]||{};let sets=prescribedSets(code,i,e),html='',suggested=currentLoad(code,i,e);if(interactive){for(let n=0;n<sets;n++){const x=(draft.sets||[])[n]||{};html+=`<div class="setgrid"><span>S${n+1}</span><input data-set="${key}" data-i="${n}" data-f="kg" inputmode="decimal" placeholder="kg" value="${x.kg??(n===0&&suggested!==''?suggested:'')}"><input data-set="${key}" data-i="${n}" data-f="reps" inputmode="numeric" placeholder="reps" value="${x.reps??''}"><button class="check ${x.done?'on':''}" data-check="${key}" data-i="${n}">${x.done?'✓':'○'}</button></div>`}}let meta=planTextV3(e);if(S.person==='power'&&i===0)meta=power[code].main+' · '+e[3];else meta+=' · '+e[3];return `<div class="exercise"><div class="exTop"><div><div class="exName">${e[0]}</div><div class="exMeta">${meta}</div></div>${suggested!==''?`<span class="tag">cible ${fmtKg(suggested)}</span>`:''}</div>${html}</div>`}).join('')};

  card=function(code,interactive){const p=P[code],sc=powerScheme(code);let pow='';if(sc){const k=`power-${code}`,d=S.drafts[k]||{},count=S.week===4?1:sc.sets;let sh='';if(interactive){for(let n=0;n<count;n++){const x=(d.sets||[])[n]||{};sh+=`<div class="setgrid"><span>⚡${n+1}</span><input data-set="${k}" data-i="${n}" data-f="kg" inputmode="decimal" placeholder="kg / PDC" value="${x.kg??''}"><input data-set="${k}" data-i="${n}" data-f="reps" inputmode="numeric" placeholder="reps" value="${x.reps??sc.reps}"><button class="check ${x.done?'on':''}" data-check="${k}" data-i="${n}">${x.done?'✓':'○'}</button></div>`}}pow=`<div class="note"><strong>⚡ Micky · puissance</strong><div class="small muted">${sc.name} · ${count}×${sc.reps} · ${sc.load}. Puis ${sc.main}. <b>Ça remplace des séries normales : séance pas plus longue.</b></div>${sh}</div>`}const label=S.person==='power'?'Micky · puissance':S.person==='same'?'Ami 2 · même séance':'Momo · 10–12 reps';return `<div class="card daycard"><div class="dayhead"><div><b>${p.title}</b><div class="small muted">${label} · ${W[S.week-1].phase}</div></div><span class="tag">${p.day}</span></div>${pow}${rows(code,interactive)}<div class="why"><b>Pourquoi :</b> ${p.why}</div>${interactive?'<button class="btn" id="finishWorkout">Terminer & enregistrer</button>':''}</div>`};

  finish=function(){const [code,type]=today();if(type!=='muscu')return;let volume=0;const promotions=[];P[code].ex.forEach((e,i)=>{const k=loadKey(S.person,code,i),arr=(S.drafts[k]?.sets||[]).filter(x=>x.done);arr.forEach(x=>volume+=(parseFloat(x.kg)||0)*(parseInt(x.reps)||0));const weighted=arr.filter(x=>(parseFloat(x.kg)||0)>0),need=prescribedSets(code,i,e);if(weighted.length<need)return;const workKg=Math.min(...weighted.map(x=>parseFloat(x.kg))),top=repTop(S.person==='power'&&i===0?power[code].main:e[1]),prev=S.loads[k]?.current??(e[2]?parseFloat(e[2]):0);let next=Math.max(prev||0,workKg),reason='charge de travail mémorisée';if(top&&e[4]>0&&weighted.every(x=>(parseInt(x.reps)||0)>=top)){next=Math.round((workKg+e[4])*2)/2;reason=`${top} reps validées sur toutes les séries`}if(next>prev){S.milestones.unshift({date:new Date().toISOString(),person:S.person,name:e[0],from:prev||workKg,to:next,reason});promotions.push(`${e[0]} → ${fmtKg(next)}`)}S.loads[k]={current:next,last:workKg,date:new Date().toISOString(),reason}});const prefixes=[`${S.person}-${code}-`,`power-${code}`];Object.keys(S.drafts).filter(k=>prefixes.some(p=>k.startsWith(p))).forEach(k=>(S.drafts[k].sets||[]).forEach(x=>{if(k.startsWith('power-')&&x.done)volume+=(parseFloat(x.kg)||0)*(parseInt(x.reps)||0)}));S.workouts.unshift({date:new Date().toISOString(),code,week:S.week,person:S.person,volume});S.workouts=S.workouts.slice(0,80);S.milestones=S.milestones.slice(0,50);Object.keys(S.drafts).filter(k=>prefixes.some(p=>k.startsWith(p))).forEach(k=>delete S.drafts[k]);save();toast(promotions.length?'Palier enregistré ✓':'Séance enregistrée ✓');renderAll()};

  const latestWorkout=(code,person=S.person)=>S.workouts.find(x=>x.code===code&&(x.person||'momo')===person);
  const latestRun=()=>S.cardio.find(x=>x.type==='Course facile');
  const targetChips=code=>P[code].ex.slice(0,4).map((e,i)=>{const l=currentLoad(code,i,e);return l!==''?`<span class="chip">${e[0].split(' ').slice(0,2).join(' ')} · ${fmtKg(l)}</span>`:''}).join('');
  const renderCoach=(code,type)=>{const el=document.getElementById('resumeCoach');if(!el)return;if(type==='muscu'){const last=latestWorkout(code),when=last?new Date(last.date).toLocaleDateString('fr-FR'):'aucune séance enregistrée';el.innerHTML=`<div class="eyebrow">PROCHAINE CIBLE · ${S.person==='power'?'MICKY':'MOMO'}</div><div class="next">${last?'Repars de tes dernières charges':'Commence : l’app mémorise tout'}</div><div class="subtle">Dernière ${P[code].title}: ${when}. Tes charges cibles montent automatiquement quand le palier est validé.</div><div class="chips">${targetChips(code)||'<span class="chip">Entre tes charges aujourd’hui</span>'}</div>`}else if(code==='run'){const last=latestRun(),rw=W[S.runStep-1];let txt='Pas encore de course enregistrée';if(last){const pace=last.dist&&+last.dist>0?(+last.min/+last.dist).toFixed(1).replace('.',',')+' min/km':'';txt=`Dernière : ${last.min} min${last.dist?' · '+last.dist+' km':''}${pace?' · '+pace:''}`};el.innerHTML=`<div class="eyebrow">COURSE · PALIER ${S.runStep}/8</div><div class="next">Maintenant : ${rw.run} facile</div><div class="subtle">${txt}. Enregistre la séance et l’app te donnera la suivante.</div>`}else{const last=S.workouts[0]||S.cardio[0];el.innerHTML=`<div class="eyebrow">MÉMOIRE D’ENTRAÎNEMENT</div><div class="next">${last?'Dernière séance enregistrée':'Ton historique commence ici'}</div><div class="subtle">${last?new Date(last.date).toLocaleDateString('fr-FR'):'Dès la prochaine séance, l’app te dira où tu en étais.'}</div>`}};

  renderToday=function(){const [code,type]=today(),box=document.getElementById('todayWorkout'),title=document.getElementById('todayTitle'),sub=document.getElementById('todaySub');if(type==='muscu'){title.textContent=P[code].title;sub.textContent=S.person==='power'?'Puissance sans séance plus longue':`Momo : 10–12 reps · ${W[S.week-1].phase}`;box.innerHTML=card(code,true);bind()}else if(code==='run'){const rw=W[S.runStep-1];title.textContent='Course facile';sub.textContent=`Palier ${S.runStep}/8 · ${rw.run} · allure conversationnelle`;box.innerHTML=`<div class="card"><div class="bigstat">${rw.run}</div><div class="why"><b>À faire :</b> allure facile. Ensuite Cardio → Journal pour enregistrer durée/distance/FC.</div></div>`}else if(code==='combat'){title.textContent=S.jjb?'JJB — cours réel':'Cardio spécifique JJB';sub.textContent=S.jjb?'Technique + régularité':'Effort dur mais contrôlé';box.innerHTML=`<div class="card"><div class="bigstat">${S.jjb?'Cours JJB':W[S.week-1].combat}</div><div class="why"><b>Objectif :</b> ${S.jjb?'le vrai JJB devient ton cardio spécifique.':'effort intense, récupération, puis recommencer.'}</div></div>`}else{title.textContent='Récupération active';sub.textContent='Marche, mobilité, sommeil';box.innerHTML='<div class="card"><b>Pas de séance dure aujourd’hui.</b><p class="small muted">Marche et récupère.</p></div>'}renderCoach(code,type);document.getElementById('weekPill').textContent=`Semaine ${S.week}/8`;document.getElementById('sessionCount').textContent=S.workouts.length+S.cardio.length;document.getElementById('modeStat').textContent=S.jjb?'1 course + JJB':'2 cardio';document.getElementById('modeSub').textContent=S.jjb?'mode JJB actif':'prépa JJB';const pct=Math.round(((S.week-1)/8)*100);document.getElementById('pct').textContent=pct+'%';document.getElementById('bar').style.width=Math.max(4,pct)+'%'};

  renderProgram=function(){document.getElementById('people').innerHTML=[['momo','Momo'],['power','Micky · puissance'],['same','Ami 2 · même séance']].map(x=>`<button class="${S.person===x[0]?'on':''}" data-person="${x[0]}">${x[1]}</button>`).join('');document.querySelectorAll('[data-person]').forEach(b=>b.onclick=()=>{S.person=b.dataset.person;save();renderAll()});document.getElementById('weeks').innerHTML=W.map((_,i)=>`<button class="${S.week===i+1?'on':''}" data-w="${i+1}">S${i+1}</button>`).join('');document.querySelectorAll('[data-w]').forEach(b=>b.onclick=()=>{S.week=+b.dataset.w;save();renderAll()});document.getElementById('programCards').innerHTML=['A','B','C'].map(c=>card(c,false)).join('')};

  renderCardio=function(){const w=W[S.week-1],rw=W[S.runStep-1],last=latestRun();document.getElementById('cardioWeek').textContent='S'+S.week;document.getElementById('runPlan').textContent=rw.run;const tag=document.getElementById('runStepTag');if(tag)tag.textContent=`RUN ${S.runStep}/8`;const rl=document.getElementById('runLast');if(rl)rl.textContent=last?`Tu en étais à ${last.min} min${last.dist?' · '+last.dist+' km':''}.`:'Aucune course enregistrée : commence ici.';document.getElementById('combatPlan').textContent=S.jjb?'Cours JJB':w.combat;document.getElementById('combatWhy').innerHTML='<b>Pourquoi :</b> '+(S.jjb?'le vrai sport remplace les intervalles artificiels.':'habituer ton corps à répéter des efforts intenses et récupérer vite.');document.getElementById('jjbSwitch').classList.toggle('on',S.jjb);document.getElementById('cardioTimeline').innerHTML=S.cardio.length?S.cardio.slice(0,10).map(x=>`<div class="event"><i class="eventdot"></i><div><b>${x.type} · ${x.min} min</b><small>${new Date(x.date).toLocaleDateString('fr-FR')}${x.dist?' · '+x.dist+' km':''}${x.hr?' · '+x.hr+' bpm':''}${x.pace?' · '+x.pace+' min/km':''}</small></div></div>`).join(''):'<div class="small muted">Aucune séance enregistrée.</div>'};

  renderProgress=function(){const vol=S.workouts.reduce((a,x)=>a+(x.volume||0),0);document.getElementById('volumeStat').textContent=Math.round(vol).toLocaleString('fr-FR')+' kg';const lp=[];['A','B','C'].forEach(c=>P[c].ex.forEach((e,i)=>{const v=S.loads[loadKey('momo',c,i)];if(v?.current)lp.push(`<div class="milestone"><div><b>${e[0]}</b><div class="subtle">prochaine charge mémorisée</div></div><strong>${fmtKg(v.current)}</strong></div>`)}));document.getElementById('loadProgress').innerHTML=lp.length?lp.join(''):'<div class="small muted">Finis une séance avec tes kg/reps : l’app mémorisera tes charges ici.</div>';document.getElementById('milestones').innerHTML=S.milestones.length?S.milestones.slice(0,8).map(m=>`<div class="milestone"><div><b>${m.name}</b><div class="subtle">${new Date(m.date).toLocaleDateString('fr-FR')} · ${m.reason}</div></div><strong>${fmtKg(m.to)}</strong></div>`).join(''):'<div class="small muted">Aucun palier encore.</div>';const all=[...S.workouts.map(x=>({date:x.date,title:`${(x.person||'momo')==='power'?'Micky · ':(x.person||'momo')==='same'?'Ami 2 · ':'Momo · '}${P[x.code]?.title||x.code} · S${x.week}`,sub:`Volume ${Math.round(x.volume||0)} kg`})),...S.cardio.map(x=>({date:x.date,title:`${x.type} · ${x.min} min`,sub:x.dist?`${x.dist} km${x.pace?' · '+x.pace+' min/km':''}`:''}))].sort((a,b)=>new Date(b.date)-new Date(a.date));document.getElementById('historyCount').textContent=all.length+' entrées';document.getElementById('history').innerHTML=all.length?all.slice(0,12).map(x=>`<div class="event"><i class="eventdot"></i><div><b>${x.title}</b><small>${new Date(x.date).toLocaleDateString('fr-FR')} ${x.sub?'· '+x.sub:''}</small></div></div>`).join(''):'<div class="small muted">Ton historique apparaîtra ici.</div>'};

  renderAll=function(){const a=document.getElementById('switchMomo'),b=document.getElementById('switchMicky');if(a)a.classList.toggle('on',S.person!=='power');if(b)b.classList.toggle('on',S.person==='power');renderToday();renderProgram();renderCardio();renderProgress()};

  // Switches and cardio logging with run progression.
  const sm=document.getElementById('switchMomo'),sk=document.getElementById('switchMicky');if(sm)sm.onclick=()=>{S.person='momo';save();renderAll();toast('Profil Momo')};if(sk)sk.onclick=()=>{S.person='power';save();renderAll();toast('Profil Micky · puissance')};
  const saveCardio=document.getElementById('saveCardio');if(saveCardio)saveCardio.onclick=()=>{const type=document.getElementById('cardioType').value,min=document.getElementById('cardioMin').value,dist=document.getElementById('cardioDist').value,hr=document.getElementById('cardioHr').value;if(!min)return toast('Ajoute la durée');const pace=dist&&+dist>0?(+min/+dist).toFixed(1):'';let advanced=false;if(type==='Course facile'){const target=parseInt(W[S.runStep-1].run);if(+min>=target&&S.runStep<8){S.runStep++;advanced=true}}S.cardio.unshift({date:new Date().toISOString(),type,min,dist,hr,pace});S.cardio=S.cardio.slice(0,80);save();['cardioMin','cardioDist','cardioHr'].forEach(id=>document.getElementById(id).value='');renderAll();toast(advanced?'Palier course validé ✓':'Cardio enregistré ✓')};

  save();renderAll();
})();
