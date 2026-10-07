/* =========================================================
   PSX-SUPER V8 - SPSL ONLY - Sitara Petroleum Service Ltd
   REAL ONLY - Full Page Fill - Quick Fetch
   Pehle sirf SPSL ka data perfect, phir baki add karenge
   ========================================================= */

const SINGLE_SYMBOL = "SPSL";

const COMPANY_MAP = {
  SPSL: { name: "Sitara Petroleum Service Ltd", sector: "Oil & Gas Marketing", yahoo: "SPSL.KA" },
  // Backup mapping
  "SPSL.KA": { name: "Sitara Petroleum Service Ltd", sector: "Oil & Gas Marketing", yahoo: "SPSL.KA" }
};

const CFG = {
  rest: "https://psx-rest-api.onrender.com",
  yahoo: "https://query1.finance.yahoo.com/v8/finance/chart",
  // Additional PSX sources
  dps: "https://dps.psx.com.pk"
};

const state = { symbol: "SPSL", loading: false, retryCount: 0, daily: [] };

const $ = id => document.getElementById(id);
const fmt = n => Number.isFinite(Number(n)) ? Number(n).toLocaleString("en-PK",{minimumFractionDigits:2,maximumFractionDigits:2}) : "—";
const num = n => { const v=Number(n); return Number.isFinite(v)? v : null; };
const pick = (o, keys) => { for(const k of keys){ if(o && o[k]!==undefined && o[k]!==null && o[k]!=="") return o[k]; } return null; };
function set(id, value){ const el=$(id); if(el) el.textContent=value??"—"; }

async function wakeAPI(){
  try { 
    await fetch(CFG.rest + "/", {mode:"no-cors", cache:"no-store"}); 
    console.log("SPSL: Wake ping sent");
  } catch {}
}

async function fetchWithTimeout(url, ms=8000){
  const c = new AbortController(); const t=setTimeout(()=>c.abort(), ms);
  try{ const r=await fetch(url, {signal:c.signal, cache:"no-store"}); clearTimeout(t); return r; }catch(e){ clearTimeout(t); throw e; }
}

async function getJSON(url){
  const proxies=[
    url, 
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    `https://corsproxy.io/?${encodeURIComponent(url)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
  ];
  for(const p of proxies){
    try{
      const r=await fetchWithTimeout(p, 8000);
      if(!r.ok) continue;
      const txt=await r.text();
      if(!txt || txt.trim().startsWith("<") || txt.length < 10) continue;
      const j=JSON.parse(txt);
      if(j) return j;
    }catch(e){ console.log("SPSL proxy fail", p); }
  }
  throw new Error("SPSL API unavailable");
}

function normalizeRows(raw){
  const arr=Array.isArray(raw)?raw:(raw?.data||raw?.prices||raw?.candles||raw?.history||[]);
  const out=[];
  for(const x of arr){
    if(Array.isArray(x)){ let t=Number(x[0]); if(t<1e12) t*=1000; out.push({t, o:num(x[1]), h:num(x[2]), l:num(x[3]), c:num(x[4]), v:num(x[5])||0}); continue; }
    const rt=pick(x,["date","datetime","timestamp","time","t","Date"]); let t=typeof rt==="number"? (rt<1e12?rt*1000:rt) : new Date(rt).getTime();
    const o=num(pick(x,["open","o","Open"])), h=num(pick(x,["high","h","High"])), l=num(pick(x,["low","l","Low"])), c=num(pick(x,["close","c","Close","price"])), v=num(pick(x,["volume","v","Volume"]))||0;
    if(Number.isFinite(t) && Number.isFinite(c)) out.push({t, o:o||c, h:h||c, l:l||c, c, v});
  }
  return out.filter(x=>Number.isFinite(x.t)&&Number.isFinite(x.c)).sort((a,b)=>a.t-b.t);
}

async function yahooHistory(symbol){
  const ySym = COMPANY_MAP[symbol]?.yahoo || `${symbol}.KA`;
  const url = `${CFG.yahoo}/${encodeURIComponent(ySym)}?period1=0&period2=${Math.floor(Date.now()/1000)}&interval=1d&range=2y`;
  console.log("SPSL: Trying Yahoo", ySym);
  const j=await getJSON(url);
  const res=j?.chart?.result?.[0]; 
  if(!res || !res.timestamp) throw new Error("Yahoo no timestamp");
  const ts=res.timestamp||[]; 
  const q=res.indicators?.quote?.[0]||{}; 
  const rows=[];
  for(let i=0;i<ts.length;i++){ 
    const o=num(q.open?.[i]), h=num(q.high?.[i]), l=num(q.low?.[i]), c=num(q.close?.[i]), v=num(q.volume?.[i])||0; 
    if(Number.isFinite(c)) rows.push({t:ts[i]*1000,o:o||c,h:h||c,l:l||c,c,v}); 
  }
  console.log("SPSL: Yahoo rows", rows.length);
  return rows;
}

async function restHistorical(symbol){
  const url = `${CFG.rest}/historical/${encodeURIComponent(symbol)}?limit=500&order=asc`;
  console.log("SPSL: Trying REST", url);
  const j=await getJSON(url); 
  const rows = normalizeRows(j);
  console.log("SPSL: REST rows", rows.length);
  return rows;
}

async function restLatest(symbol){
  const j=await getJSON(`${CFG.rest}/latest/${encodeURIComponent(symbol)}`);
  return j?.data||j;
}

function clearUI(){
  ["price","change","open","high","low","prev","volume","volumeState","ema9","ema20","ema50","ema100","ema200","p","s1","s2","r1","r2","rsiValue","macdValue"].forEach(id=> set(id,"—"));
  set("verdict","CONNECTING SPSL"); 
  set("verdictMessage","Sitara Petroleum Service Ltd ka real data fetch ho raha hai..."); 
  set("trendMessage","Thora wait karein - API waking up");
  const chart=$("chart"); if(chart){ const ctx=chart.getContext('2d'); ctx.clearRect(0,0,chart.width,chart.height); }
  ["intradayCard","shortCard","swingCard","rsiCard","macdCard","volCard"].forEach(id=>{ const el=$(id); if(el){ const b=el.querySelector("b"); if(b) b.textContent="—"; el.className="card signal-card neutral"; } });
}

// Technicals
function ema(values, period){ if(values.length<period) return []; const k=2/(period+1); let e=values.slice(0,period).reduce((a,b)=>a+b,0)/period; const out=Array(period-1).fill(null); out.push(e); for(let i=period;i<values.length;i++){ e=values[i]*k + e*(1-k); out.push(e); } return out; }
function rsi(values, p=14){ if(values.length<=p) return null; let g=0,l=0; for(let i=1;i<=p;i++){ const d=values[i]-values[i-1]; g+=Math.max(d,0); l+=Math.max(-d,0);} g/=p; l/=p; for(let i=p+1;i<values.length;i++){ const d=values[i]-values[i-1]; g=(g*(p-1)+Math.max(d,0))/p; l=(l*(p-1)+Math.max(-d,0))/p; } if(l===0) return 100; return 100-100/(1+g/l); }
function macd(values){ if(values.length<35) return {line:null,signal:null,histogram:null}; const e12=ema(values,12), e26=ema(values,26), line=[]; for(let i=0;i<values.length;i++) if(Number.isFinite(e12[i])&&Number.isFinite(e26[i])) line.push(e12[i]-e26[i]); const sig=ema(line,9); const l=line.at(-1), s=sig.at(-1); return {line:l, signal:s, histogram: Number.isFinite(l)&&Number.isFinite(s)? l-s : null}; }
function pivot(rows){ if(rows.length<2) return [null,null,null,null,null]; const x=rows[rows.length-2]; const p=(x.h+x.l+x.c)/3; return [p,2*p-x.h,p-(x.h-x.l),2*p-x.l,p+(x.h-x.l)]; }
function analyse(rows){ 
  if(rows.length<20) return {signal:"NO DATA", e9:null,e20:null,e50:null,e100:null,e200:null,rsi:null,macd:null};
  const c=rows.map(x=>x.c); 
  const e9=ema(c,9).at(-1), e20=ema(c,20).at(-1), e50=ema(c,50).at(-1), e100=ema(c,100).at(-1), e200=ema(c,200).at(-1); 
  const R=rsi(c), M=macd(c); 
  let s=0; 
  if(Number.isFinite(e9)&&Number.isFinite(e20)) s+= e9>e20?1:-1;
  if(Number.isFinite(e20)&&Number.isFinite(e50)) s+= e20>e50?1:-1;
  if(Number.isFinite(e50)&&Number.isFinite(e200)) s+= e50>e200?1:-1;
  if(Number.isFinite(R)){ if(R>=55) s++; if(R<=45) s--; }
  if(Number.isFinite(M?.histogram)){ if(M.histogram>0) s++; if(M.histogram<0) s--; }
  let sig="NO TRADE"; if(s>=3) sig="BUY"; else if(s<=-3) sig="SELL";
  return {signal:sig,e9,e20,e50,e100,e200,rsi:R,macd:M}; 
}

function colour(el, sig){ if(!el) return; el.classList.remove("buy","sell","neutral"); el.classList.add(sig==="BUY"?"buy": sig==="SELL"?"sell":"neutral"); }
function setVerdict(sig){ 
  set("verdict",sig); 
  const msg=sig==="BUY"?"SPSL Trend Up • BUY Opportunity": sig==="SELL"?"SPSL Trend Down • SELL Signal": sig==="NO DATA"?"SPSL ka real data ka wait...":"SPSL Wait • No Clear Direction";
  set("verdictMessage", msg); 
  set("trendMessage", msg);
  colour($("verdictCard"),sig); 
  const badge=$("statusBadge");
  if(badge){
    if(sig==="BUY"){ badge.style.background="#0a7a3d"; badge.textContent="● SPSL BUY - Live"; }
    else if(sig==="SELL"){ badge.style.background="#a12a24"; badge.textContent="● SPSL SELL - Live"; }
    else if(sig==="NO DATA"){ badge.style.background="#d97706"; }
    else { badge.style.background="#d97706"; badge.textContent="● SPSL NO TRADE - Live"; }
  }
}
function cardSignal(id,sig){ const c=$(id); if(!c) return; const b=c.querySelector("b"); if(b) b.textContent=sig; colour(c,sig); }

function render(rows,a){
  cardSignal("intradayCard",a.signal); 
  cardSignal("shortCard",a.signal); 
  cardSignal("swingCard",a.signal);
  let rs="NO TRADE"; if(Number.isFinite(a.rsi)){ if(a.rsi>=70) rs="SELL"; else if(a.rsi>=55) rs="BUY"; else if(a.rsi<=30) rs="BUY"; else if(a.rsi<=45) rs="SELL"; }
  cardSignal("rsiCard",rs);
  let ms="NO TRADE"; if(Number.isFinite(a.macd?.histogram)){ ms= a.macd.histogram>0?"BUY": a.macd.histogram<0?"SELL":"NO TRADE"; }
  cardSignal("macdCard",ms);
  
  // Volume analysis
  const vals=rows.slice(-22).map(x=>x.v).filter(v=>Number.isFinite(v)&&v>0);
  if(vals.length>=2){
    const cur=vals.at(-1), avg=vals.slice(0,-1).reduce((a,b)=>a+b,0)/(vals.length-1);
    let vSig="NO TRADE", vTxt="Average";
    if(cur>avg*1.5){ vSig="BUY"; vTxt="High Volume • Strong Interest in SPSL"; }
    else if(cur<avg*0.6){ vSig="SELL"; vTxt="Low Volume • Weak"; }
    set("volumeState", vTxt); cardSignal("volCard",vSig);
    set("volume", Math.round(cur).toLocaleString());
  }

  set("ema9",fmt(a.e9)); set("ema20",fmt(a.e20)); set("ema50",fmt(a.e50)); set("ema100",fmt(a.e100)); set("ema200",fmt(a.e200));
  set("rsiValue", a.rsi? a.rsi.toFixed(2):"—"); 
  set("macdValue", a.macd?.histogram!=null? a.macd.histogram.toFixed(4):"—");
  const pv=pivot(rows); 
  set("p",fmt(pv[0])); set("s1",fmt(pv[1])); set("s2",fmt(pv[2])); set("r1",fmt(pv[3])); set("r2",fmt(pv[4]));
}

function drawChart(data){
  const cv=$("chart"); if(!cv) return; 
  const ctx=cv.getContext('2d'); 
  const w=cv.width=cv.clientWidth*2, h=cv.height=280; 
  ctx.clearRect(0,0,w,h); 
  if(!data.length) return; 
  const min=Math.min(...data), max=Math.max(...data);
  const pad=20; 
  ctx.strokeStyle="#0a3d2e"; ctx.lineWidth=3; ctx.beginPath(); 
  data.forEach((v,i)=>{ 
    const x=pad+(i/(data.length-1))*(w-pad*2); 
    const y=h-pad-((v-min)/(max-min||1))*(h-pad*2); 
    if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); 
  }); 
  ctx.stroke(); 
  ctx.lineTo(w-pad,h-pad); ctx.lineTo(pad,h-pad); ctx.closePath(); 
  ctx.fillStyle="rgba(10,61,46,0.08)"; ctx.fill();
  // Draw price labels
  ctx.fillStyle="#0a3d2e"; ctx.font="12px monospace";
  ctx.fillText(`SPSL High: ${max.toFixed(2)}`, pad, 20);
  ctx.fillText(`SPSL Low: ${min.toFixed(2)}`, pad, h-5);
}

async function loadAll(){
  if(state.loading) return; state.loading=true;
  const badge=$("statusBadge"); 
  if(badge) badge.textContent = state.retryCount? `● Retrying SPSL (${state.retryCount})...` : "● Connecting SPSL - Sitara Petroleum...";
  clearUI();
  try{
    let rows=[];
    // Try REST first
    try{ 
      rows=await restHistorical("SPSL"); 
      console.log("SPSL REST OK", rows.length); 
    }catch(e){ console.log("SPSL REST fail", e.message); }
    
    // If REST fails, try Yahoo
    if(!rows.length){ 
      try {
        rows=await yahooHistory("SPSL"); 
        console.log("SPSL Yahoo OK", rows.length); 
      } catch(e){ console.log("SPSL Yahoo fail", e.message); }
    }
    
    if(!rows.length) throw new Error("SPSL No real data - API waking up");
    
    // Latest candle is real quote
    const last=rows[rows.length-1]; 
    const prev=rows[rows.length-2]||last;
    const price=last.c, open=last.o, high=last.h, low=last.l, prevClose=prev.c;
    const change=price-prevClose; 
    const pct=prevClose? change/prevClose*100 : 0;
    
    // FILL FULL PAGE
    set("price", `Rs. ${fmt(price)}`); 
    set("change", `${change>=0?"+":""}${fmt(change)} (${pct>=0?"+":""}${fmt(pct)}%)`);
    set("open", fmt(open)); 
    set("high", fmt(high)); 
    set("low", fmt(low)); 
    set("prev", fmt(prevClose));
    set("company", "Sitara Petroleum Service Ltd"); 
    set("sector", "Oil & Gas Marketing / Petroleum Services"); 
    set("symbolLabel", "SPSL");
    
    const chEl=$("change"); if(chEl) chEl.className="change "+(change>0?"up": change<0?"down":"");
    
    // Full analysis
    const analysis=analyse(rows);
    setVerdict(analysis.signal);
    render(rows, analysis);
    drawChart(rows.slice(-100).map(r=>r.c));
    
    if(badge){ badge.textContent=`● SPSL Live - ${analysis.signal} - Real Data`; }
    state.retryCount=0;
    
    console.log("SPSL FULLY LOADED", {price, change, pct, signal: analysis.signal, rows: rows.length});
    
  }catch(e){
    console.error("SPSL FAIL", e);
    if(badge){ badge.textContent=`● SPSL No Data - Retry in 10s (${state.retryCount+1})`; badge.style.background="#a12a24"; }
    set("verdict","NO DATA"); 
    set("verdictMessage",`SPSL API waking... ${e.message}`); 
    set("trendMessage", "Sitara Petroleum ka real data 10 sec me ayega - Auto retry");
    state.retryCount++;
    setTimeout(()=>{ state.loading=false; loadAll(); }, 10000);
    state.loading=false;
    return;
  }
  state.loading=false;
}

function init(){
  const chips=$("chips");
  if(chips){
    chips.innerHTML="";
    const btn=document.createElement("button");
    btn.dataset.sym="SPSL"; 
    btn.textContent="SPSL - Sitara Petroleum";
    btn.classList.add("active");
    btn.style.background="#0a3d2e";
    btn.style.color="#fff";
    chips.appendChild(btn);
  }
}

window.addEventListener('load', ()=>{
  try { fetch(CFG.rest + "/", {mode:"no-cors"}); } catch {}
  wakeAPI();
  init();
  loadAll();
  if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
});
