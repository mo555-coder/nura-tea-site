(()=>{
  if(typeof P==='undefined'||typeof S==='undefined'||typeof rows==='undefined'||typeof save!=='function') return;
  S.loads=S.loads||{};
  const loadKeyV4=(person,code,i)=>`${person}-${code}-${i}`;
  const fmt=(v)=>v===''||v==null?'':String(v).replace('.',',');
  const getLoad=(code,i,e)=>{
    const k=loadKeyV4(S.person,code,i);
    const saved=S.loads[k]?.current;
    if(saved!==undefined&&saved!==null&&saved!=='') return saved;
    return e[2]?parseFloat(e[2]):'';
  };
  const getSets=(code,i,e)=>{
    let n=parseInt((String(e[1]).match(/^(\d+)/)||['','3'])[1]);
    if(S.week===4)n=Math.max(2,n-1);
    if(S.person==='power'&&i===0)n=2;
    return n;
  };

  const st=document.createElement('style');
  st.textContent=`.quickWeight{display:flex;align-items:center;gap:6px;flex:0 0 auto}.quickWeight input{width:74px;background:#0e0e11;border:1px solid var(--line);border-radius:10px;padding:8px 7px;color:#fff;text-align:center;font:inherit}.quickWeight span{font-size:11px;color:var(--muted);font-weight:800}.exTop{align-items:center}.weightHint{font-size:10px;color:var(--muted);margin-top:4px}`;
  document.head.appendChild(st);

  rows=function(code,interactive){
    return P[code].ex.map((e,i)=>{
      const person=S.person||'momo',key=loadKeyV4(person,code,i),draft=S.drafts?.[key]||{},sets=getSets(code,i,e),suggested=getLoad(code,i,e);
      let setHtml='';
      if(interactive){
        for(let n=0;n<sets;n++){
          const x=(draft.sets||[])[n]||{};
          const defaultKg=x.kg??(suggested!==''?suggested:'');
          setHtml+=`<div class="setgrid"><span>S${n+1}</span><input data-set="${key}" data-i="${n}" data-f="kg" inputmode="decimal" placeholder="kg" value="${defaultKg}"><input data-set="${key}" data-i="${n}" data-f="reps" inputmode="numeric" placeholder="reps" value="${x.reps??''}"><button class="check ${x.done?'on':''}" data-check="${key}" data-i="${n}">${x.done?'✓':'○'}</button></div>`;
        }
      }
      let meta=(typeof planTextV3==='function'?planTextV3(e):e[1]);
      if(S.person==='power'&&i===0&&typeof power!=='undefined'&&power[code]) meta=power[code].main+' · '+e[3]; else meta+=' · '+e[3];
      const weightBox=interactive
        ? `<span class="tag">${suggested!==''?'cible '+fmt(suggested)+' kg':'poids à saisir'}</span>`
        : `<div class="quickWeight"><input class="js-quick-weight" data-load-code="${code}" data-load-i="${i}" inputmode="decimal" placeholder="kg" value="${suggested!==''?suggested:''}"><span>kg</span></div>`;
      return `<div class="exercise"><div class="exTop"><div><div class="exName">${e[0]}</div><div class="exMeta">${meta}</div><div class="weightHint">${suggested!==''?'Charge mémorisée : '+fmt(suggested)+' kg':'Entre ta charge de travail'}</div></div>${weightBox}</div>${setHtml}</div>`;
    }).join('');
  };

  const bindQuickWeights=()=>{
    document.querySelectorAll('.js-quick-weight').forEach(inp=>{
      inp.onchange=()=>{
        const code=inp.dataset.loadCode,i=+inp.dataset.loadI,key=loadKeyV4(S.person||'momo',code,i);
        const raw=String(inp.value).replace(',','.').trim();
        if(raw==='') return;
        const kg=parseFloat(raw);
        if(!Number.isFinite(kg)||kg<0) return;
        const prev=S.loads[key]||{};
        S.loads[key]={...prev,current:kg,last:kg,date:new Date().toISOString(),reason:'charge saisie manuellement'};
        save();
        if(typeof toast==='function') toast(`${P[code].ex[i][0]} · ${fmt(kg)} kg mémorisé`);
        if(typeof renderCoach==='function'){const t=typeof today==='function'?today():['rest','rest'];renderCoach(t[0],t[1]);}
      };
    });
  };

  const oldRenderProgram=renderProgram;
  renderProgram=function(){oldRenderProgram();bindQuickWeights();};
  const oldRenderAll=renderAll;
  renderAll=function(){oldRenderAll();bindQuickWeights();};
  renderProgram();
})();