/* =========================================================
   NH PSX SUPER ANALYSIS - COMPLETE FIXED VERSION
   GitHub Pages + PSX REST + Lens + Yahoo Mapping
   ========================================================= */

const CFG = {
  rest: "https://psx-rest-api.onrender.com",
  lens: "https://api.psxlens.com/v1",
  yahoo: "https://query1.finance.yahoo.com/v8/finance/chart"
};

const COMPANY_MAP = {
  KSE100: { name: "KSE 100 Index", sector: "Index", yahoo: "^KSE" },
  OGDC: { name: "Oil & Gas Development", sector: "Oil & Gas", yahoo: "OGDC.KA" },
  PPL: { name: "Pakistan Petroleum", sector: "Oil & Gas", yahoo: "PPL.KA" },
  MARI: { name: "Mari Petroleum", sector: "Oil & Gas", yahoo: "MARI.KA" },
  SYS: { name: "Systems Limited", sector: "Technology & Communication", yahoo: "SYS.KA" },
  HBL: { name: "Habib Bank Limited", sector: "Commercial Banks", yahoo: "HBL.KA" },
  UBL: { name: "United Bank Limited", sector: "Commercial Banks", yahoo: "UBL.KA" },
  LUCK: { name: "Lucky Cement", sector: "Cement", yahoo: "LUCK.KA" },
  ENGRO: { name: "Engro Corp", sector: "Fertilizer", yahoo: "ENGRO.KA" },
  MCB: { name: "MCB Bank", sector: "Banks", yahoo: "MCB.KA" },
};

const state = {
  symbol: "SYS",
  name: "Systems Limited",
  sector: "Technology & Communication",
  tf: "1D",
  daily: [],
  rows: [],
  quote: null,
  installPrompt: null,
  loading: false
};

const $ = id => document.getElementById(id);
const fmt = n => {
  n = Number(n);
  return Number.isFinite(n)? n.toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";
};
const num = n => { const v = Number(n); return Number.isFinite(v)? v : null; };
const pick = (o, keys) => { for (const k of keys) { if (o && o[k]!== undefined && o[k]!== null && o[k]!== "") return o[k]; } return null; };
function set(id, value) { const el = $(id); if (el) el.textContent = value?? "—"; }

// PROXY SUPPORT FOR GITHUB PAGES - Yeh sab se important fix hai
async function getJSON(url) {
  const proxyList = [
    url,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    `https://corsproxy.io/?${encodeURIComponent(url)}`
  ];
  let lastErr;
  for (const pUrl of proxyList) {
    try {
      const r = await fetch(pUrl, { cache: "no-store", headers: { Accept: "application/json" } });
      if (!r.ok) continue;
      const text = await r.text();
      try { return JSON.parse(text); } catch { continue; }
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error("Data unavailable");
}

function normalizeRows(raw) {
  const arr = Array.isArray(raw)? raw : (raw?.data || raw?.prices || raw?.candles || raw?.results || raw?.rows || []);
  const out = [];
  for (const x of arr) {
    if (Array.isArray(x)) {
      let t = Number(x[0]); if (t < 10000000000) t *= 1000;
      out.push({ t, o: num(x[1]), h: num(x[2]), l: num(x[3]), c: num(x[4]), v: num(x[5]) || 0 });
      continue;
    }
    const rawTime = pick(x, ["date","datetime","timestamp","time","t"]);
    let t; if (typeof rawTime === "number") t = rawTime < 10000000000? rawTime*1000 : rawTime; else t = new Date(rawTime).getTime();
    out.push({ t, o: num(pick(x, ["open","o"])), h: num(pick(x, ["high","h"])), l: num(pick(x, ["low","l"])), c: num(pick(x, ["close","c"])), v: num(pick(x, ["volume","v"])) || 0 });
  }
  return out.filter(x => Number.isFinite(x.t) && Number.isFinite(x.o) && Number.isFinite(x.h) && Number.isFinite(x.l) && Number.isFinite(x.c)).sort((a,b)=>a.t-b.t);
}

async function restLatest(symbol) { const j = await getJSON(`${CFG.rest}/latest/${encodeURIComponent(symbol)}`); return j?.data || j; }
async function restInfo(symbol) { try { const j = await getJSON(`${CFG.rest}/info/${encodeURIComponent(symbol)}`); return j?.data || j; } catch { return null; } }
async function restHistorical(symbol) { const j = await getJSON(`${CFG.rest}/historical/${encodeURIComponent(symbol)}?limit=1500&order=asc`); return normalizeRows(j); }
async function lensQuote(symbol) {
  const urls = [`${CFG.lens}/quotes/${encodeURIComponent(symbol)}`,`${CFG.lens}/quote/${encodeURIComponent(symbol)}`];
  for (const url of urls) { try { const j = await getJSON(url); const q = j?.data || j?.quote || j?.result || j; if (q && typeof q === "object") return q; } catch {} }
  return null;
}
async function lensHistory(symbol) {
  const urls = [`${CFG.lens}/prices/${encodeURIComponent(symbol)}?range=1Y`,`${CFG.lens}/history/${encodeURIComponent(symbol)}?range=1Y`,`${CFG.lens}/prices/${encodeURIComponent(symbol)}?period=1Y`];
  for (const url of urls) { try { const j = await getJSON(url); const rows = normalizeRows(j); if (rows.length) return rows; } catch {} }
  return [];
}
async function yahooHistory(symbol, interval, range) {
  const yahooSymbol = COMPANY_MAP[symbol]?.yahoo || `${symbol}.KA`;
  const url = `${CFG.yahoo}/${encodeURIComponent(yahooSymbol)}?period1=0&period2=${Math.floor(Date.now()/1000)}&interval=${interval}&range=${range}&includePrePost=false`;
  const j = await getJSON(url);
  const result = j?.chart?.result?.[0]; if (!result) throw new Error("No data");
  const timestamps = result.timestamp || []; const q = result.indicators?.quote?.[0] || {}; const rows = [];
  for (let i=0;i<timestamps.length;i++) {
    const o = num(q.open?.[i]), h = num(q.high?.[i]), l = num(q.low?.[i]), c = num(q.close?.[i]), v = num(q.volume?.[i])||0;
    if (Number.isFinite(o) && Number.isFinite(h) && Number.isFinite(l) && Number.isFinite(c)) rows.push({ t: timestamps[i]*1000, o, h, l, c, v });
  }
  return rows;
}

async function loadQuote() {
  let q = null;
  try { q = await restLatest(state.symbol); } catch {}
  if (!q) q = await lensQuote(state.symbol);
  const info = await restInfo(state.symbol);
  if (info) { state.name = pick(info, ["name","company_name","company"]) || COMPANY_MAP[state.symbol]?.name || state.name; state.sector = pick(info, ["sector","sector_name"]) || COMPANY_MAP[state.symbol]?.sector || state.sector; }
  if (q) { state.name = pick(q, ["name","company_name","company","title"]) || state.name; state.sector = pick(q, ["sector","sector_name"]) || state.sector; }
  if (!q) {
    set("price","—"); set("change","—"); set("open","—"); set("high","—"); set("low","—"); set("prev","—");
    set("company", state.name); set("sector", state.sector); return;
  }
  state.quote = q;
  const price = num(pick(q, ["price","last","close","current_price"]));
  const previous = num(pick(q, ["previous_close","prev_close","previous","previousClose","ldcp"]));
  let change = num(pick(q, ["change","change_amount","net_change"]));
  let pct = num(pick(q, ["change_pct","change_percent","percent_change"]));
  if (!Number.isFinite(change) && Number.isFinite(price) && Number.isFinite(previous)) change = price - previous;
  if (!Number.isFinite(pct) && Number.isFinite(change) && Number.isFinite(previous) && previous!==0) pct = (change/previous)*100;
  set("price", price? `Rs. ${fmt(price)}` : "—");
  if (Number.isFinite(change)) set("change", `${change>=0?"+":""}${fmt(change)}` + (Number.isFinite(pct)? ` (${pct>=0?"+":""}${fmt(pct)}%)` : ""));
  else set("change","—");
  set("open", fmt(pick(q, ["open"]))); set("high", fmt(pick(q, ["high"]))); set("low", fmt(pick(q, ["low"]))); set("prev", fmt(previous));
  set("company", state.name); set("sector", state.sector);
}

async function loadDaily() {
  let rows = [];
  try { rows = await restHistorical(state.symbol); } catch {}
  if (!rows.length) rows = await lensHistory(state.symbol);
  if (!rows.length) { try { rows = await yahooHistory(state.symbol,"1d","1y"); } catch {} }
  state.daily = rows; return rows;
}

function ema(values, period) {
  if (values.length < period) return [];
  const k = 2/(period+1);
  let e = values.slice(0,period).reduce((a,b)=>a+b,0)/period;
  const out = Array(period-1).fill(null); out.push(e);
  for (let i=period;i<values.length;i++) { e = values[i]*k + e*(1-k); out.push(e); }
  return out;
}
function rsi(values, period=14) {
  if (values.length <= period) return null;
  let gain=0,loss=0;
  for(let i=1;i<=period;i++){ const d=values[i]-values[i-1]; gain+=Math.max(d,0); loss+=Math.max(-d,0); }
  gain/=period; loss/=period;
  for(let i=period+1;i<values.length;i++){ const d=values[i]-values[i-1]; gain=(gain*(period-1)+Math.max(d,0))/period; loss=(loss*(period-1)+Math.max(-d,0))/period; }
  if(loss===0) return 100; const rs=gain/loss; return 100-100/(1+rs);
}
function macd(values) {
  if(values.length<35) return {line:null, signal:null, histogram:null};
  const e12=ema(values,12), e26=ema(values,26), line=[];
  for(let i=0;i<values.length;i++) if(Number.isFinite(e12[i]) && Number.isFinite(e26[i])) line.push(e12[i]-e26[i]);
  const signal=ema(line,9); const l=line.at(-1), s=signal.at(-1);
  return {line:l, signal:s, histogram: Number.isFinite(l)&&Number.isFinite(s)?l-s:null};
}
function pivot(rows) {
  if(rows.length<2) return [null,null,null,null,null];
  const x=rows[rows.length-2]; const p=(x.h+x.l+x.c)/3;
  return [p, 2*p-x.h, p-(x.h-x.l), 2*p-x.l, p+(x.h-x.l)];
}
function analyse(rows) {
  if(rows.length<55) return {signal:"NO TRADE", e9:null,e20:null,e50:null,e100:null,e200:null,rsi:null,macd:null};
  const c=rows.map(x=>x.c);
  const e9=ema(c,9).at(-1), e20=ema(c,20).at(-1), e50=ema(c,50).at(-1), e100=ema(c,100).at(-1), e200=ema(c,200).at(-1);
  const R=rsi(c), M=macd(c);
  let score=0;
  if(Number.isFinite(e9)&&Number.isFinite(e20)) score+= e9>e20?1:-1;
  if(Number.isFinite(e20)&&Number.isFinite(e50)) score+= e20>e50?1:-1;
  if(Number.isFinite(e50)&&Number.isFinite(e200)) score+= e50>e200?1:-1;
  if(Number.isFinite(R)){ if(R>=55) score++; if(R<=45) score--; }
  if(Number.isFinite(M?.histogram)){ if(M.histogram>0) score++; if(M.histogram<0) score--; }
  let signal="NO TRADE"; if(score>=3) signal="BUY"; else if(score<=-3) signal="SELL";
  return {signal,e9,e20,e50,e100,e200,rsi:R,macd:M};
}
function colour(el, signal) {
  if(!el) return; el.classList.remove("buy","sell","neutral");
  el.classList.add(signal==="BUY"?"buy": signal==="SELL"?"sell":"neutral");
}
function setVerdict(signal) {
  set("verdict", signal);
  const message = signal==="BUY"? "Trend is Up • Pullback can be a buying opportunity." : signal==="SELL"? "Trend is Down • Bounce Back is a Sell Opportunity." : "Wait Please • No Clear Direction.";
  set("verdictMessage", message); set("trendMessage", message);
  colour($("verdictCard"), signal); colour($("trendMessage"), signal);
}
function cardSignal(id, signal) {
  const card=$(id); if(!card) return; const b=card.querySelector("b"); if(b) b.textContent=signal; colour(card, signal);
}
function renderIndicators(rows,a){
  cardSignal("intradayCard",a.signal); cardSignal("shortCard",a.signal); cardSignal("swingCard",a.signal);
  let rs="NO TRADE"; if(Number.isFinite(a.rsi)){ if(a.rsi>=55) rs="BUY"; else if(a.rsi<=45) rs="SELL"; }
  cardSignal("rsiCard",rs);
  let ms="NO TRADE"; if(Number.isFinite(a.macd?.histogram)){ ms= a.macd.histogram>0?"BUY": a.macd.histogram<0?"SELL":"NO TRADE"; }
  cardSignal("macdCard",ms);
  renderVolume(rows);
  set("ema9", fmt(a.e9)); set("ema20", fmt(a.e20)); set("ema50", fmt(a.e50)); set("ema100", fmt(a.e100)); set("ema200", fmt(a.e200));
  if($("rsiValue")) set("rsiValue", a.rsi? a.rsi.toFixed(2) : "—");
  if($("macdValue")) set("macdValue", a.macd?.histogram? a.macd.histogram.toFixed(3) : "—");
  const pv = pivot(rows); set("p", fmt(pv[0])); set("s1", fmt(pv[1])); set("s2", fmt(pv[2])); set("r1", fmt(pv[3])); set("r2", fmt(pv[4]));
}
function renderVolume(rows){
  const values = rows.slice(-22).map(x=>x.v).filter(v=>Number.isFinite(v)&&v>0);
  if(values.length<2){ set("volumeState","—"); cardSignal("volCard","NO TRADE"); return; }
  const current = values.at(-1);
  const avg = values.slice(0,-1).reduce((a,b)=>a+b,0)/(values.length-1);
  let sig="NO TRADE", stateTxt="Normal";
  if(current > avg*1.5){ sig="BUY"; stateTxt="High Volume • Strong Interest"; }
  else if(current < avg*0.6){ sig="SELL"; stateTxt="Low Volume • Weak"; }
  else { sig="NO TRADE"; stateTxt="Average Volume"; }
  set("volumeState", stateTxt); cardSignal("volCard",sig);
  if($("volume")) set("volume", current.toLocaleString());
}
async function loadAll(){
  if(state.loading) return; state.loading=true;
  $("statusBadge") && ($("statusBadge").textContent="● Loading...");
  try{
    await loadQuote();
    const rows = await loadDaily();
    if(rows && rows.length){
      const analysis = analyse(rows);
      setVerdict(analysis.signal);
      renderIndicators(rows, analysis);
      drawChart(rows.slice(-100).map(r=>r.c));
      localStorage.setItem("psx_cache_"+state.symbol, JSON.stringify({t:Date.now(), rows: rows.slice(-300)}));
    } else {
      setVerdict("NO TRADE");
    }
    localStorage.setItem("psx_last_symbol", state.symbol);
    $("statusBadge") && ($("statusBadge").textContent="● Live");
  }catch(e){
    console.error(e);
    $("statusBadge") && ($("statusBadge").textContent="● Cached");
    const cached = localStorage.getItem("psx_cache_"+state.symbol);
    if(cached){ const {rows}=JSON.parse(cached); const analysis=analyse(rows); setVerdict(analysis.signal); renderIndicators(rows, analysis); }
  }finally{ state.loading=false; }
}
function drawChart(data){
  const canvas=$("chart"); if(!canvas) return;
  const ctx=canvas.getContext('2d');
  const w=canvas.width=canvas.clientWidth*2, h=canvas.height=280;
  ctx.clearRect(0,0,w,h); if(!data.length) return;
  const min=Math.min(...data), max=Math.max(...data);
  const pad=20; ctx.strokeStyle="#0a3d2e"; ctx.lineWidth=3; ctx.beginPath();
  data.forEach((v,i)=>{ const x=pad+(i/(data.length-1))*(w-pad*2); const y=h-pad-((v-min)/(max-min||1))*(h-pad*2); if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); });
  ctx.stroke(); ctx.lineTo(w-pad,h-pad); ctx.lineTo(pad,h-pad); ctx.closePath(); ctx.fillStyle="rgba(10,61,46,0.08)"; ctx.fill();
}
function initEvents(){
  const searchInput=$("searchInput") || $("searchBox");
  const searchBtn=$("searchBtn");
  const chips=document.getElementById("chips");
  if(chips){
    chips.addEventListener('click', e=>{ const btn=e.target.closest('[data-sym]'); if(btn){ state.symbol=btn.dataset.sym; document.querySelectorAll('[data-sym]').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); loadAll(); } });
  }
  if(searchBtn && searchInput){ searchBtn.addEventListener('click', ()=>{ const v=searchInput.value.trim().toUpperCase(); if(v){ state.symbol=v; loadAll(); } }); searchInput.addEventListener('keydown', e=>{ if(e.key==='Enter'){ const v=e.target.value.trim().toUpperCase(); if(v){ state.symbol=v; loadAll(); } } }); }
  document.querySelectorAll('[data-tf]').forEach(b=> b.addEventListener('click', ()=>{ document.querySelectorAll('[data-tf]').forEach(x=>x.classList.remove('active')); b.classList.add('active'); state.tf=b.dataset.tf; loadAll(); }));
}
window.addEventListener('beforeinstallprompt', e=>{ e.preventDefault(); state.installPrompt=e; const btn=$("installBtn"); if(btn) btn.style.display='block'; });
window.addEventListener('load', ()=>{
  const last = localStorage.getItem("psx_last_symbol") || "SYS";
  state.symbol = last;
  const chip = document.querySelector(`[data-sym="${last}"]`); if(chip) chip.classList.add('active');
  initEvents();
  loadAll();
  if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
  document.getElementById("installBtn")?.addEventListener('click', ()=> state.installPrompt?.prompt());
});
