/* =========================================================
   PSX-SUPER KSE100-ONLY V6 - REAL ONLY
   Sirf KSE100 ke top 30 stocks - Fast & Reliable
   ========================================================= */

const KSE100_STOCKS = [
  "KSE100","OGDC","PPL","MARI","POL","HBL","UBL","MCB",
  "ABL","NBP","BAHL","FABL","MEBL","BOP","LUCK","DGKC",
  "MLCF","FCCL","CHCC","POWER","KOHC","PIOC","DCL","ENGRO",
  "EFERT","FFC","FFBL","FATIMA","HUBC","KAPCO","KEL","NCPL",
  "PSO","SNGP","SSGC","ATRL","NRL","PRL","SYS","TRG",
  "AVN","NETSOL","OCTOPUS","MTL","PSMC","HCAR","INDU","GHNI",
  "SAZEW","AHCL","AHL","ASL","SPSL","JVDC","AGL","AGP",
  "SEARL","GLAXO","NML","NCL","GATM","ILP","YOUW","WTL"
];

const COMPANY_MAP = {
  KSE100: { name: "KSE 100 Index", sector: "Index", yahoo: "^KSE" },
  OGDC: { name: "Oil & Gas Development", sector: "Oil & Gas", yahoo: "OGDC.KA" },
  PPL: { name: "Pakistan Petroleum", sector: "Oil & Gas", yahoo: "PPL.KA" },
  MARI: { name: "Mari Petroleum", sector: "Oil & Gas", yahoo: "MARI.KA" },
  POL: { name: "Pakistan Oilfields", sector: "Oil & Gas", yahoo: "POL.KA" },
  HBL: { name: "Habib Bank Limited", sector: "Bank", yahoo: "HBL.KA" },
  UBL: { name: "United Bank Limited", sector: "Bank", yahoo: "UBL.KA" },
  MCB: { name: "MCB Bank", sector: "Bank", yahoo: "MCB.KA" },
  ABL: { name: "Allied Bank", sector: "Bank", yahoo: "ABL.KA" },
  NBP: { name: "National Bank", sector: "Bank", yahoo: "NBP.KA" },
  BAHL: { name: "Bank Al Habib", sector: "Bank", yahoo: "BAHL.KA" },
  FABL: { name: "Faysal Bank", sector: "Bank", yahoo: "FABL.KA" },
  LUCK: { name: "Lucky Cement", sector: "Cement", yahoo: "LUCK.KA" },
  DGKC: { name: "DG Khan Cement", sector: "Cement", yahoo: "DGKC.KA" },
  MLCF: { name: "Maple Leaf Cement", sector: "Cement", yahoo: "MLCF.KA" },
  FCCL: { name: "Fauji Cement", sector: "Cement", yahoo: "FCCL.KA" },
  ENGRO: { name: "Engro Corporation", sector: "Fertilizer", yahoo: "ENGRO.KA" },
  EFERT: { name: "Engro Fertilizer", sector: "Fertilizer", yahoo: "EFERT.KA" },
  FFC: { name: "Fauji Fertilizer", sector: "Fertilizer", yahoo: "FFC.KA" },
  HUBC: { name: "Hub Power", sector: "Power", yahoo: "HUBC.KA" },
  HUBCO: { name: "Hub Power Co", sector: "Power", yahoo: "HUBC.KA" },
  KAPCO: { name: "Kot Addu Power", sector: "Power", yahoo: "KAPCO.KA" },
  KEL: { name: "K-Electric", sector: "Power", yahoo: "KEL.KA" },
  PSO: { name: "PSO", sector: "Oil Marketing", yahoo: "PSO.KA" },
  ATRL: { name: "Attock Refinery", sector: "Refinery", yahoo: "ATRL.KA" },
  SYS: { name: "Systems Limited", sector: "Technology", yahoo: "SYS.KA" },
  TRG: { name: "TRG Pakistan", sector: "Technology", yahoo: "TRG.KA" },
  AVN: { name: "Avanceon", sector: "Technology", yahoo: "AVN.KA" },
  SEARL: { name: "Searle Pakistan", sector: "Pharma", yahoo: "SEARL.KA" },
  MTL: { name: "Millat Tractors", sector: "Auto", yahoo: "MTL.KA" },
  AHCL: { name: "Arif Habib Corp", sector: "Investment", yahoo: "AHCL.KA" },
  SPSL: { name: "S. P. S. Limited", sector: "Misc", yahoo: "SPSL.KA" },
  ASL: { name: "Amreli Steels", sector: "Steel", yahoo: "ASL.KA" },
  POWER: { name: "Power Cement", sector: "Cement", yahoo: "POWER.KA" },
  FATIMA: { name: "Fatima Fertilizer", sector: "Fertilizer", yahoo: "FATIMA.KA" },
  AHL: { name: "Arif Habib Limited", sector: "Brokerage", yahoo: "AHL.KA" },
  JVDC: { name: "Javedan Corporation", sector: "Construction", yahoo: "JVDC.KA" },

  MEBL: { name: "Meezan Bank", sector: "Bank", yahoo: "MEBL.KA" },
  BOP: { name: "Bank of Punjab", sector: "Bank", yahoo: "BOP.KA" },
  CHCC: { name: "Cherat Cement", sector: "Cement", yahoo: "CHCC.KA" },
  KOHC: { name: "Kohat Cement", sector: "Cement", yahoo: "KOHC.KA" },
  PIOC: { name: "Pioneer Cement", sector: "Cement", yahoo: "PIOC.KA" },
  DCL: { name: "Dewan Cement", sector: "Cement", yahoo: "DCL.KA" },
  FFBL: { name: "Fauji Bin Qasim", sector: "Fertilizer", yahoo: "FFBL.KA" },
  NCPL: { name: "Nishat Chunian Power", sector: "Power", yahoo: "NCPL.KA" },
  SNGP: { name: "Sui Northern Gas", sector: "Gas", yahoo: "SNGP.KA" },
  SSGC: { name: "Sui Southern Gas", sector: "Gas", yahoo: "SSGC.KA" },
  NRL: { name: "National Refinery", sector: "Refinery", yahoo: "NRL.KA" },
  PRL: { name: "Pakistan Refinery", sector: "Refinery", yahoo: "PRL.KA" },
  NETSOL: { name: "NetSol Tech", sector: "Technology", yahoo: "NETSOL.KA" },
  OCTOPUS: { name: "Octopus Digital", sector: "Technology", yahoo: "OCTOPUS.KA" },
  PSMC: { name: "Pak Suzuki Motors", sector: "Auto", yahoo: "PSMC.KA" },
  HCAR: { name: "Honda Atlas Cars", sector: "Auto", yahoo: "HCAR.KA" },
  INDU: { name: "Indus Motors", sector: "Auto", yahoo: "INDU.KA" },
  GHNI: { name: "Ghandhara Nissan", sector: "Auto", yahoo: "GHNI.KA" },
  SAZEW: { name: "Sazgar Engineering", sector: "Auto", yahoo: "SAZEW.KA" },
  AGL: { name: "Agritech Limited", sector: "Chemical", yahoo: "AGL.KA" },
  AGP: { name: "AGP Limited", sector: "Pharma", yahoo: "AGP.KA" },
  GLAXO: { name: "GlaxoSmithKline", sector: "Pharma", yahoo: "GLAXO.KA" },
  NML: { name: "Nishat Mills", sector: "Textile", yahoo: "NML.KA" },
  NCL: { name: "Nishat Chunian", sector: "Textile", yahoo: "NCL.KA" },
  GATM: { name: "Gul Ahmed Textile", sector: "Textile", yahoo: "GATM.KA" },
  ILP: { name: "Interloop Limited", sector: "Textile", yahoo: "ILP.KA" },
  YOUW: { name: "YouWeCo", sector: "Misc", yahoo: "YOUW.KA" },
  WTL: { name: "WorldCall Telecom", sector: "Telecom", yahoo: "WTL.KA" },

};

const CFG = {
  rest: "https://psx-rest-api.onrender.com",
  yahoo: "https://query1.finance.yahoo.com/v8/finance/chart"
};

const state = { symbol: "KSE100", loading: false, retryCount: 0, daily: [] };

const $ = id => document.getElementById(id);
const fmt = n => Number.isFinite(Number(n)) ? Number(n).toLocaleString("en-PK",{minimumFractionDigits:2,maximumFractionDigits:2}) : "—";
const num = n => { const v=Number(n); return Number.isFinite(v)? v : null; };
const pick = (o, keys) => { for(const k of keys){ if(o && o[k]!==undefined && o[k]!==null && o[k]!=="") return o[k]; } return null; };
function set(id, value){ const el=$(id); if(el) el.textContent=value??"—"; }

async function fetchWithTimeout(url, ms=15000){
  const c = new AbortController(); const t=setTimeout(()=>c.abort(), ms);
  try{ const r=await fetch(url, {signal:c.signal, cache:"no-store"}); clearTimeout(t); return r; }catch(e){ clearTimeout(t); throw e; }
}
async function getJSON(url){
  const proxies=[url, `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`, `https://corsproxy.io/?${encodeURIComponent(url)}`];
  for(const p of proxies){
    try{
      const r=await fetchWithTimeout(p, 15000);
      if(!r.ok) continue;
      const txt=await r.text();
      if(!txt || txt.trim().startsWith("<")) continue;
      const j=JSON.parse(txt);
      if(j) return j;
    }catch(e){ console.log("proxy fail", p); }
  }
  throw new Error("Real API unavailable");
}

function normalizeRows(raw){
  const arr=Array.isArray(raw)?raw:(raw?.data||raw?.prices||raw?.candles||[]);
  const out=[];
  for(const x of arr){
    if(Array.isArray(x)){ let t=Number(x[0]); if(t<1e12) t*=1000; out.push({t, o:num(x[1]), h:num(x[2]), l:num(x[3]), c:num(x[4]), v:num(x[5])||0}); continue; }
    const rt=pick(x,["date","datetime","timestamp","time","t"]); let t=typeof rt==="number"? (rt<1e12?rt*1000:rt) : new Date(rt).getTime();
    out.push({t, o:num(pick(x,["open","o"])), h:num(pick(x,["high","h"])), l:num(pick(x,["low","l"])), c:num(pick(x,["close","c"])), v:num(pick(x,["volume","v"]))||0});
  }
  return out.filter(x=>Number.isFinite(x.t)&&Number.isFinite(x.c)).sort((a,b)=>a.t-b.t);
}

async function yahooHistory(symbol){
  const ySym = COMPANY_MAP[symbol]?.yahoo || `${symbol}.KA`;
  const url = `${CFG.yahoo}/${encodeURIComponent(ySym)}?period1=0&period2=${Math.floor(Date.now()/1000)}&interval=1d&range=1y`;
  const j=await getJSON(url);
  const res=j?.chart?.result?.[0]; if(!res) throw new Error("No data");
  const ts=res.timestamp||[]; const q=res.indicators?.quote?.[0]||{}; const rows=[];
  for(let i=0;i<ts.length;i++){ const o=num(q.open?.[i]), h=num(q.high?.[i]), l=num(q.low?.[i]), c=num(q.close?.[i]), v=num(q.volume?.[i])||0; if(Number.isFinite(c)) rows.push({t:ts[i]*1000,o:o||c,h:h||c,l:l||c,c,v}); }
  return rows;
}
async function restHistorical(symbol){ const j=await getJSON(`${CFG.rest}/historical/${encodeURIComponent(symbol)}?limit=500&order=asc`); return normalizeRows(j); }
async function restLatest(symbol){ const j=await getJSON(`${CFG.rest}/latest/${encodeURIComponent(symbol)}`); return j?.data||j; }

function clearUI(){
  ["price","change","open","high","low","prev","volume","volumeState","ema9","ema20","ema50","ema100","ema200","p","s1","s2","r1","r2","rsiValue","macdValue"].forEach(id=> set(id,"—"));
  set("verdict","CONNECTING"); set("verdictMessage","KSE100 real data connect ho raha hai..."); set("trendMessage","Thora wait karein");
}

function ema(values, period){ if(values.length<period) return []; const k=2/(period+1); let e=values.slice(0,period).reduce((a,b)=>a+b,0)/period; const out=Array(period-1).fill(null); out.push(e); for(let i=period;i<values.length;i++){ e=values[i]*k + e*(1-k); out.push(e); } return out; }
function rsi(values, p=14){ if(values.length<=p) return null; let g=0,l=0; for(let i=1;i<=p;i++){ const d=values[i]-values[i-1]; g+=Math.max(d,0); l+=Math.max(-d,0);} g/=p; l/=p; for(let i=p+1;i<values.length;i++){ const d=values[i]-values[i-1]; g=(g*(p-1)+Math.max(d,0))/p; l=(l*(p-1)+Math.max(-d,0))/p; } if(l===0) return 100; return 100-100/(1+g/l); }
function macd(values){ if(values.length<35) return {histogram:null}; const e12=ema(values,12), e26=ema(values,26), line=[]; for(let i=0;i<values.length;i++) if(Number.isFinite(e12[i])&&Number.isFinite(e26[i])) line.push(e12[i]-e26[i]); const sig=ema(line,9); return {histogram: line.at(-1)-sig.at(-1)}; }
function pivot(rows){ if(rows.length<2) return [null,null,null,null,null]; const x=rows[rows.length-2]; const p=(x.h+x.l+x.c)/3; return [p,2*p-x.h,p-(x.h-x.l),2*p-x.l,p+(x.h-x.l)]; }
function analyse(rows){ if(rows.length<55) return {signal:"NO DATA", e9:null,e20:null,e50:null,e100:null,e200:null,rsi:null,macd:null}; const c=rows.map(x=>x.c); const e9=ema(c,9).at(-1), e20=ema(c,20).at(-1), e50=ema(c,50).at(-1), e100=ema(c,100).at(-1), e200=ema(c,200).at(-1); const R=rsi(c), M=macd(c); let s=0; if(e9>e20) s++; else s--; if(e20>e50) s++; else s--; if(e50>e200) s++; else s--; if(R>=55) s++; if(R<=45) s--; if(M.histogram>0) s++; else if(M.histogram<0) s--; let sig="NO TRADE"; if(s>=3) sig="BUY"; else if(s<=-3) sig="SELL"; return {signal:sig,e9,e20,e50,e100,e200,rsi:R,macd:M}; }

function colour(el, sig){ if(!el) return; el.classList.remove("buy","sell","neutral"); el.classList.add(sig==="BUY"?"buy": sig==="SELL"?"sell":"neutral"); }
function setVerdict(sig){ set("verdict",sig); const msg=sig==="BUY"?"Trend Up • KSE100 Strong":"Trend Down • KSE100 Weak"; set("verdictMessage", sig==="NO DATA"?"Real data ka wait...":msg); colour($("verdictCard"),sig); }
function cardSignal(id,sig){ const c=$(id); if(!c) return; const b=c.querySelector("b"); if(b) b.textContent=sig; colour(c,sig); }

function render(rows,a){
  cardSignal("intradayCard",a.signal); cardSignal("shortCard",a.signal); cardSignal("swingCard",a.signal);
  cardSignal("rsiCard", a.rsi>=55?"BUY": a.rsi<=45?"SELL":"NO TRADE");
  cardSignal("macdCard", a.macd.histogram>0?"BUY": a.macd.histogram<0?"SELL":"NO TRADE");
  set("ema9",fmt(a.e9)); set("ema20",fmt(a.e20)); set("ema50",fmt(a.e50)); set("ema100",fmt(a.e100)); set("ema200",fmt(a.e200));
  set("rsiValue", a.rsi? a.rsi.toFixed(2):"—"); set("macdValue", a.macd.histogram? a.macd.histogram.toFixed(3):"—");
  const pv=pivot(rows); set("p",fmt(pv[0])); set("s1",fmt(pv[1])); set("s2",fmt(pv[2])); set("r1",fmt(pv[3])); set("r2",fmt(pv[4]));
  const vals=rows.slice(-22).map(x=>x.v); const cur=vals.at(-1); set("volume", cur? Math.round(cur).toLocaleString():"—");
}

function drawChart(data){ const cv=$("chart"); if(!cv) return; const ctx=cv.getContext('2d'); const w=cv.width=cv.clientWidth*2, h=cv.height=280; ctx.clearRect(0,0,w,h); if(!data.length) return; const min=Math.min(...data), max=Math.max(...data); const pad=20; ctx.strokeStyle="#0a3d2e"; ctx.lineWidth=3; ctx.beginPath(); data.forEach((v,i)=>{ const x=pad+(i/(data.length-1))*(w-pad*2); const y=h-pad-((v-min)/(max-min||1))*(h-pad*2); if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); }); ctx.stroke(); ctx.lineTo(w-pad,h-pad); ctx.lineTo(pad,h-pad); ctx.closePath(); ctx.fillStyle="rgba(10,61,46,0.08)"; ctx.fill(); }

async function loadAll(){
  if(state.loading) return; state.loading=true;
  const badge=$("statusBadge"); if(badge) badge.textContent = state.retryCount? `● Retrying KSE100 (${state.retryCount})...` : "● Connecting KSE100...";
  clearUI();
  try{
    let rows=[];
    try{ rows=await restHistorical(state.symbol); console.log("REST OK", rows.length); }catch(e){ console.log("REST fail", e.message); }
    if(!rows.length){ rows=await yahooHistory(state.symbol); console.log("Yahoo OK", rows.length); }
    if(!rows.length) throw new Error("No real KSE100 data");
    
    // Latest quote from last candle - REAL ONLY
    const last=rows[rows.length-1]; const prev=rows[rows.length-2]||last;
    const price=last.c, open=last.o, high=last.h, low=last.l, prevClose=prev.c;
    const change=price-prevClose; const pct=prevClose? change/prevClose*100 : 0;
    
    set("price", `Rs. ${fmt(price)}`); set("change", `${change>=0?"+":""}${fmt(change)} (${pct>=0?"+":""}${fmt(pct)}%)`);
    set("open", fmt(open)); set("high", fmt(high)); set("low", fmt(low)); set("prev", fmt(prevClose));
    set("company", COMPANY_MAP[state.symbol]?.name||state.symbol); set("sector", COMPANY_MAP[state.symbol]?.sector||"KSE100"); set("symbolLabel", state.symbol);
    const chEl=$("change"); if(chEl) chEl.className="change "+(change>0?"up": change<0?"down":"");
    
    const analysis=analyse(rows);
    setVerdict(analysis.signal);
    render(rows, analysis);
    drawChart(rows.slice(-100).map(r=>r.c));
    if(badge){ badge.textContent="● Live - KSE100 Real"; badge.style.background="#0a7a3d"; }
    state.retryCount=0;
    localStorage.setItem("psx_kse100_last", state.symbol);
  }catch(e){
    console.error("KSE100 REAL FAIL", e);
    if(badge){ badge.textContent=`● No Data - Retry in 15s (${state.retryCount+1})`; badge.style.background="#a12a24"; }
    set("verdict","NO DATA"); set("verdictMessage","KSE100 API waking up... 30 sec wait"); set("trendMessage", e.message);
    state.retryCount++;
    setTimeout(()=>{ state.loading=false; loadAll(); }, 15000);
    state.loading=false;
    return;
  }
  state.loading=false;
}

function init(){
  const chips=$("chips");
  if(chips){
    chips.innerHTML="";
    KSE100_STOCKS.forEach(sym=>{
      const btn=document.createElement("button");
      btn.dataset.sym=sym; btn.textContent=sym;
      if(sym===state.symbol) btn.classList.add("active");
      chips.appendChild(btn);
    });
    chips.addEventListener('click', e=>{
      const b=e.target.closest("[data-sym]"); if(!b) return;
      state.symbol=b.dataset.sym; state.daily=[]; state.retryCount=0;
      document.querySelectorAll("[data-sym]").forEach(x=>x.classList.remove("active")); b.classList.add("active");
      loadAll();
    });
  }
  const searchInput=$("searchInput"), searchBtn=$("searchBtn");
  if(searchBtn){ searchBtn.addEventListener('click', ()=>{ const v=searchInput.value.trim().toUpperCase(); if(KSE100_STOCKS.includes(v)){ state.symbol=v; loadAll(); } else { alert("Sirf KSE100 stocks: "+KSE100_STOCKS.join(", ")); } }); }
}

window.addEventListener('load', ()=>{
  state.symbol=localStorage.getItem("psx_kse100_last")||"KSE100";
  init();
  const chip=document.querySelector(`[data-sym="${state.symbol}"]`); if(chip) chip.classList.add("active");
  loadAll();
  if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
});
