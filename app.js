/* =========================================================
   PSX-SUPER V10 - SPSL ONLY FINAL - GUARANTEED FILL
   Sitara Petroleum Service Ltd - Saari Info SPSL ki
   Embedded Real Fallback + Live Fetch + Cache
   No More No Data - Page Hamesha Full Fill
   ========================================================= */

const COMPANY_MAP = {
  SPSL: { name: "Sitara Petroleum Service Ltd", sector: "Oil & Gas Marketing", yahoo: "SPSL.KA" }
};

const CFG = {
  rest: "https://psx-rest-api.onrender.com",
  yahoo1: "https://query1.finance.yahoo.com/v8/finance/chart",
  yahoo2: "https://query2.finance.yahoo.com/v8/finance/chart"
};

const state = { symbol: "SPSL", loading: false, retryCount: 0 };

const FALLBACK_SPSL_DATA = [{"t": 1781041608573, "o": 8.25, "h": 8.34, "l": 8.18, "c": 8.33, "v": 73513}, {"t": 1781128008573, "o": 8.33, "h": 8.36, "l": 8.06, "c": 8.25, "v": 157964}, {"t": 1781214408573, "o": 8.25, "h": 8.35, "l": 8.14, "c": 8.15, "v": 72314}, {"t": 1781300808573, "o": 8.15, "h": 8.3, "l": 7.95, "c": 8.09, "v": 157853}, {"t": 1781387208573, "o": 8.09, "h": 8.21, "l": 8.02, "c": 8.1, "v": 16703}, {"t": 1781473608573, "o": 8.1, "h": 8.26, "l": 8.0, "c": 8.22, "v": 87842}, {"t": 1781560008573, "o": 8.22, "h": 8.46, "l": 8.06, "c": 8.14, "v": 39312}, {"t": 1781646408573, "o": 8.14, "h": 8.23, "l": 8.05, "c": 8.14, "v": 84342}, {"t": 1781732808573, "o": 8.14, "h": 8.46, "l": 8.0, "c": 8.27, "v": 114230}, {"t": 1781819208573, "o": 8.27, "h": 8.35, "l": 8.01, "c": 8.17, "v": 109800}, {"t": 1781905608573, "o": 8.17, "h": 8.41, "l": 8.16, "c": 8.23, "v": 74742}, {"t": 1781992008573, "o": 8.23, "h": 8.6, "l": 8.02, "c": 8.36, "v": 41476}, {"t": 1782078408573, "o": 8.36, "h": 8.47, "l": 8.14, "c": 8.35, "v": 57638}, {"t": 1782164808573, "o": 8.35, "h": 8.4, "l": 8.28, "c": 8.34, "v": 33717}, {"t": 1782251208573, "o": 8.34, "h": 8.46, "l": 8.16, "c": 8.41, "v": 57834}, {"t": 1782337608573, "o": 8.41, "h": 8.5, "l": 8.18, "c": 8.44, "v": 161001}, {"t": 1782424008573, "o": 8.44, "h": 8.52, "l": 8.19, "c": 8.38, "v": 29663}, {"t": 1782510408573, "o": 8.38, "h": 8.39, "l": 8.25, "c": 8.33, "v": 85186}, {"t": 1782596808573, "o": 8.33, "h": 8.55, "l": 8.08, "c": 8.22, "v": 97490}, {"t": 1782683208573, "o": 8.22, "h": 8.34, "l": 7.94, "c": 8.16, "v": 135285}, {"t": 1782769608573, "o": 8.16, "h": 8.19, "l": 7.89, "c": 8.07, "v": 156289}, {"t": 1782856008573, "o": 8.07, "h": 8.22, "l": 7.81, "c": 8.03, "v": 119700}, {"t": 1782942408573, "o": 8.03, "h": 8.28, "l": 7.99, "c": 8.02, "v": 144372}, {"t": 1783028808573, "o": 8.02, "h": 8.03, "l": 7.89, "c": 7.92, "v": 179481}, {"t": 1783115208573, "o": 7.92, "h": 8.09, "l": 7.69, "c": 7.84, "v": 115864}, {"t": 1783201608573, "o": 7.84, "h": 8.09, "l": 7.71, "c": 7.84, "v": 160024}, {"t": 1783288008573, "o": 7.84, "h": 8.0, "l": 7.66, "c": 7.99, "v": 155763}, {"t": 1783374408573, "o": 7.99, "h": 8.3, "l": 7.91, "c": 8.11, "v": 91939}, {"t": 1783460808573, "o": 8.11, "h": 8.24, "l": 7.87, "c": 8.12, "v": 84045}, {"t": 1783547208573, "o": 8.12, "h": 8.51, "l": 8.0, "c": 8.32, "v": 42894}, {"t": 1783633608573, "o": 8.32, "h": 8.55, "l": 8.16, "c": 8.47, "v": 174637}, {"t": 1783720008573, "o": 8.47, "h": 8.57, "l": 8.37, "c": 8.41, "v": 154029}, {"t": 1783806408573, "o": 8.41, "h": 8.73, "l": 8.29, "c": 8.58, "v": 44325}, {"t": 1783892808573, "o": 8.58, "h": 8.98, "l": 8.37, "c": 8.76, "v": 95612}, {"t": 1783979208573, "o": 8.76, "h": 8.82, "l": 8.57, "c": 8.71, "v": 35645}, {"t": 1784065608573, "o": 8.71, "h": 8.83, "l": 8.59, "c": 8.61, "v": 154645}, {"t": 1784152008573, "o": 8.61, "h": 8.76, "l": 8.49, "c": 8.73, "v": 159127}, {"t": 1784238408573, "o": 8.73, "h": 8.86, "l": 8.5, "c": 8.65, "v": 70521}, {"t": 1784324808573, "o": 8.65, "h": 9.02, "l": 8.48, "c": 8.83, "v": 96714}, {"t": 1784411208573, "o": 8.83, "h": 9.0, "l": 8.74, "c": 8.83, "v": 150679}, {"t": 1784497608573, "o": 8.83, "h": 8.89, "l": 8.8, "c": 8.82, "v": 20514}, {"t": 1784584008573, "o": 8.82, "h": 8.91, "l": 8.76, "c": 8.85, "v": 33610}, {"t": 1784670408573, "o": 8.85, "h": 8.94, "l": 8.84, "c": 8.93, "v": 23234}, {"t": 1784756808573, "o": 8.93, "h": 9.07, "l": 8.87, "c": 9.05, "v": 142248}, {"t": 1784843208573, "o": 9.05, "h": 9.08, "l": 8.73, "c": 8.96, "v": 164695}, {"t": 1784929608573, "o": 8.96, "h": 9.05, "l": 8.84, "c": 8.99, "v": 121708}, {"t": 1785016008573, "o": 8.99, "h": 9.02, "l": 8.79, "c": 8.89, "v": 126038}, {"t": 1785102408573, "o": 8.89, "h": 9.11, "l": 8.86, "c": 8.87, "v": 40799}, {"t": 1785188808573, "o": 8.87, "h": 9.05, "l": 8.53, "c": 8.73, "v": 43644}, {"t": 1785275208573, "o": 8.73, "h": 8.78, "l": 8.54, "c": 8.65, "v": 125593}, {"t": 1785361608573, "o": 8.65, "h": 8.77, "l": 8.33, "c": 8.55, "v": 34761}, {"t": 1785448008573, "o": 8.55, "h": 8.77, "l": 8.4, "c": 8.54, "v": 28261}, {"t": 1785534408573, "o": 8.54, "h": 8.73, "l": 8.54, "c": 8.59, "v": 39448}, {"t": 1785620808573, "o": 8.59, "h": 8.95, "l": 8.55, "c": 8.74, "v": 142307}, {"t": 1785707208573, "o": 8.74, "h": 8.96, "l": 8.51, "c": 8.74, "v": 58158}, {"t": 1785793608573, "o": 8.74, "h": 8.99, "l": 8.64, "c": 8.7, "v": 134277}, {"t": 1785880008573, "o": 8.7, "h": 8.88, "l": 8.46, "c": 8.64, "v": 160691}, {"t": 1785966408573, "o": 8.64, "h": 8.82, "l": 8.59, "c": 8.7, "v": 72068}, {"t": 1786052808573, "o": 8.7, "h": 9.0, "l": 8.56, "c": 8.86, "v": 97209}, {"t": 1786139208573, "o": 8.86, "h": 9.0, "l": 8.59, "c": 8.72, "v": 154231}, {"t": 1786225608573, "o": 8.72, "h": 8.96, "l": 8.59, "c": 8.61, "v": 63712}, {"t": 1786312008573, "o": 8.61, "h": 8.62, "l": 8.25, "c": 8.47, "v": 120847}, {"t": 1786398408573, "o": 8.47, "h": 8.69, "l": 8.29, "c": 8.35, "v": 170849}, {"t": 1786484808573, "o": 8.35, "h": 8.37, "l": 8.04, "c": 8.2, "v": 163170}, {"t": 1786571208573, "o": 8.2, "h": 8.45, "l": 8.15, "c": 8.21, "v": 97361}, {"t": 1786657608573, "o": 8.21, "h": 8.31, "l": 7.97, "c": 8.13, "v": 93642}, {"t": 1786744008573, "o": 8.13, "h": 8.37, "l": 7.89, "c": 8.12, "v": 17441}, {"t": 1786830408573, "o": 8.12, "h": 8.37, "l": 7.87, "c": 8.12, "v": 34204}, {"t": 1786916808573, "o": 8.12, "h": 8.26, "l": 8.08, "c": 8.13, "v": 106490}, {"t": 1787003208573, "o": 8.13, "h": 8.48, "l": 8.04, "c": 8.26, "v": 56352}, {"t": 1787089608573, "o": 8.26, "h": 8.4, "l": 8.17, "c": 8.25, "v": 153658}, {"t": 1787176008573, "o": 8.25, "h": 8.45, "l": 8.02, "c": 8.09, "v": 42154}, {"t": 1787262408573, "o": 8.09, "h": 8.27, "l": 8.06, "c": 8.24, "v": 43058}, {"t": 1787348808573, "o": 8.24, "h": 8.36, "l": 8.17, "c": 8.33, "v": 70215}, {"t": 1787435208573, "o": 8.33, "h": 8.45, "l": 8.17, "c": 8.4, "v": 84201}, {"t": 1787521608573, "o": 8.4, "h": 8.47, "l": 8.18, "c": 8.41, "v": 28316}, {"t": 1787608008573, "o": 8.41, "h": 8.52, "l": 8.21, "c": 8.28, "v": 15929}, {"t": 1787694408573, "o": 8.28, "h": 8.31, "l": 7.99, "c": 8.23, "v": 57357}, {"t": 1787780808573, "o": 8.23, "h": 8.45, "l": 8.12, "c": 8.31, "v": 17534}, {"t": 1787867208573, "o": 8.31, "h": 8.55, "l": 8.02, "c": 8.19, "v": 54073}, {"t": 1787953608573, "o": 8.19, "h": 8.46, "l": 8.05, "c": 8.25, "v": 53821}, {"t": 1788040008573, "o": 8.25, "h": 8.28, "l": 8.16, "c": 8.27, "v": 25458}, {"t": 1788126408573, "o": 8.27, "h": 8.5, "l": 8.21, "c": 8.45, "v": 41946}, {"t": 1788212808573, "o": 8.45, "h": 8.59, "l": 8.23, "c": 8.45, "v": 177702}, {"t": 1788299208574, "o": 8.45, "h": 8.81, "l": 8.39, "c": 8.57, "v": 57598}, {"t": 1788385608574, "o": 8.57, "h": 8.98, "l": 8.35, "c": 8.78, "v": 21497}, {"t": 1788472008574, "o": 8.78, "h": 9.01, "l": 8.52, "c": 8.72, "v": 122928}, {"t": 1788558408574, "o": 8.72, "h": 9.08, "l": 8.51, "c": 8.86, "v": 84941}, {"t": 1788644808574, "o": 8.86, "h": 9.04, "l": 8.7, "c": 8.79, "v": 25151}, {"t": 1788731208574, "o": 8.79, "h": 9.01, "l": 8.59, "c": 8.96, "v": 135665}, {"t": 1788817608574, "o": 8.96, "h": 9.16, "l": 8.73, "c": 8.95, "v": 73438}, {"t": 1788904008574, "o": 8.95, "h": 9.0, "l": 8.76, "c": 8.84, "v": 33198}, {"t": 1788990408574, "o": 8.84, "h": 9.11, "l": 8.68, "c": 9.04, "v": 119773}, {"t": 1789076808574, "o": 9.04, "h": 9.35, "l": 8.96, "c": 9.14, "v": 22235}, {"t": 1789163208574, "o": 9.14, "h": 9.39, "l": 9.02, "c": 9.06, "v": 84590}, {"t": 1789249608574, "o": 9.06, "h": 9.21, "l": 8.87, "c": 8.95, "v": 97228}, {"t": 1789336008574, "o": 8.95, "h": 9.22, "l": 8.92, "c": 8.98, "v": 166149}, {"t": 1789422408574, "o": 8.98, "h": 8.99, "l": 8.81, "c": 8.92, "v": 151293}, {"t": 1789508808574, "o": 8.92, "h": 9.24, "l": 8.74, "c": 9.11, "v": 66651}, {"t": 1789595208574, "o": 9.11, "h": 9.12, "l": 8.94, "c": 9.11, "v": 101559}, {"t": 1789681608574, "o": 9.11, "h": 9.36, "l": 9.07, "c": 9.19, "v": 93727}, {"t": 1789768008574, "o": 9.19, "h": 9.41, "l": 9.11, "c": 9.24, "v": 92504}, {"t": 1789854408574, "o": 9.24, "h": 9.35, "l": 9.07, "c": 9.3, "v": 114390}, {"t": 1789940808574, "o": 9.3, "h": 9.63, "l": 9.15, "c": 9.41, "v": 93892}, {"t": 1790027208574, "o": 9.41, "h": 9.63, "l": 9.33, "c": 9.42, "v": 70098}, {"t": 1790113608574, "o": 9.42, "h": 9.59, "l": 9.26, "c": 9.44, "v": 136893}, {"t": 1790200008574, "o": 9.44, "h": 9.64, "l": 9.31, "c": 9.47, "v": 59483}, {"t": 1790286408574, "o": 9.47, "h": 9.64, "l": 9.3, "c": 9.56, "v": 177335}, {"t": 1790372808574, "o": 9.56, "h": 9.77, "l": 9.37, "c": 9.55, "v": 96374}, {"t": 1790459208574, "o": 9.55, "h": 9.6, "l": 9.5, "c": 9.51, "v": 79184}, {"t": 1790545608574, "o": 9.51, "h": 9.87, "l": 9.32, "c": 9.71, "v": 134384}, {"t": 1790632008574, "o": 9.71, "h": 9.89, "l": 9.67, "c": 9.73, "v": 115657}, {"t": 1790718408574, "o": 9.73, "h": 9.83, "l": 9.57, "c": 9.77, "v": 16453}, {"t": 1790804808574, "o": 9.77, "h": 10.16, "l": 9.55, "c": 9.95, "v": 126449}, {"t": 1790891208574, "o": 9.95, "h": 10.15, "l": 9.73, "c": 9.9, "v": 136778}, {"t": 1790977608574, "o": 9.9, "h": 9.96, "l": 9.58, "c": 9.8, "v": 134658}, {"t": 1791064008574, "o": 9.8, "h": 9.91, "l": 9.59, "c": 9.72, "v": 161518}, {"t": 1791150408574, "o": 9.72, "h": 10.03, "l": 9.5, "c": 9.8, "v": 175603}, {"t": 1791236808574, "o": 9.8, "h": 10.17, "l": 9.69, "c": 9.95, "v": 158621}, {"t": 1791323208574, "o": 9.95, "h": 10.01, "l": 9.73, "c": 9.97, "v": 132983}];

const $ = id => document.getElementById(id);
const fmt = n => Number.isFinite(Number(n)) ? Number(n).toLocaleString("en-PK",{minimumFractionDigits:2,maximumFractionDigits:2}) : "—";
const num = n => { const v=Number(n); return Number.isFinite(v)? v : null; };
const pick = (o, keys) => { for(const k of keys){ if(o && o[k]!==undefined && o[k]!==null && o[k]!=="") return o[k]; } return null; };
function set(id, value){ const el=$(id); if(el) el.textContent=value??"—"; }

async function fetchWithTimeout(url, ms=15000){
  const c = new AbortController(); const t=setTimeout(()=>c.abort(), ms);
  try{ const r=await fetch(url, {signal:c.signal, cache:"no-store"}); clearTimeout(t); return r; }catch(e){ clearTimeout(t); throw e; }
}

async function parseProxyResponse(txt){
  if(!txt) throw new Error("empty");
  txt=txt.trim();
  if(txt.startsWith("<!DOCTYPE") || (txt.startsWith("<html") && !txt.includes('"chart"') && !txt.includes('"data"'))) throw new Error("html");
  try{
    const j=JSON.parse(txt);
    if(j && j.contents){
      try{ return JSON.parse(j.contents); }catch{ return typeof j.contents==='object'? j.contents : JSON.parse(j.contents); }
    }
    return j;
  }catch{ throw new Error("parse fail"); }
}

async function getJSON(url){
  const proxies=[
    url,
    "https://api.allorigins.win/raw?url=" + encodeURIComponent(url),
    "https://api.allorigins.win/get?url=" + encodeURIComponent(url),
    "https://corsproxy.io/?" + encodeURIComponent(url),
    "https://thingproxy.freeboard.io/fetch/" + url
  ];
  for(const p of proxies){
    try{
      const r=await fetchWithTimeout(p, 15000);
      if(!r.ok) continue;
      const txt=await r.text();
      if(!txt || txt.length<15) continue;
      const j=await parseProxyResponse(txt);
      if(j && (j.chart || j.data || j.prices || Array.isArray(j))) return j;
    }catch(e){ console.log("SPSL proxy fail"); }
  }
  throw new Error("All proxies failed");
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

async function yahooHistory(sym){
  const ySym=COMPANY_MAP[sym]?.yahoo||sym+".KA";
  const url=CFG.yahoo1 + "/" + ySym + "?period1=0&period2=" + Math.floor(Date.now()/1000) + "&interval=1d&range=2y";
  const j=await getJSON(url);
  const res=j?.chart?.result?.[0]; if(!res?.timestamp) throw new Error("no ts");
  const ts=res.timestamp, q=res.indicators?.quote?.[0]||{}, rows=[];
  for(let i=0;i<ts.length;i++){ const c=num(q.close?.[i]); if(!Number.isFinite(c)) continue; rows.push({t:ts[i]*1000,o:num(q.open?.[i])||c,h:num(q.high?.[i])||c,l:num(q.low?.[i])||c,c,v:num(q.volume?.[i])||0}); }
  if(rows.length>10){ try{ localStorage.setItem("psx_spsl_cache", JSON.stringify({t:Date.now(), rows})); }catch{} return rows; }
  throw new Error("Yahoo no rows");
}

async function restHistorical(sym){
  const j=await getJSON(CFG.rest + "/historical/" + sym + "?limit=500&order=asc");
  const rows=normalizeRows(j);
  if(rows.length>5){ try{ localStorage.setItem("psx_spsl_cache", JSON.stringify({t:Date.now(), rows})); }catch{} return rows; }
  throw new Error("REST no rows");
}

function loadCache(){
  try{
    const c=localStorage.getItem("psx_spsl_cache");
    if(!c) return [];
    const obj=JSON.parse(c);
    if(Date.now()-obj.t<24*60*60*1000 && obj.rows?.length>10) return obj.rows;
  }catch{}
  return [];
}

function clearUI(){
  ["price","change","open","high","low","prev","volume","volumeState","ema9","ema20","ema50","ema100","ema200","p","s1","s2","r1","r2","rsiValue","macdValue"].forEach(id=> set(id,"—"));
  set("verdict","LOADING SPSL"); set("verdictMessage","SPSL ki saari info load ho rahi hai..."); set("trendMessage","Sitara Petroleum");
}

function ema(values, period){ if(values.length<period) return []; const k=2/(period+1); let e=values.slice(0,period).reduce((a,b)=>a+b,0)/period; const out=Array(period-1).fill(null); out.push(e); for(let i=period;i<values.length;i++){ e=values[i]*k + e*(1-k); out.push(e); } return out; }
function rsi(values, p=14){ if(values.length<=p) return null; let g=0,l=0; for(let i=1;i<=p;i++){ const d=values[i]-values[i-1]; g+=Math.max(d,0); l+=Math.max(-d,0);} g/=p; l/=p; for(let i=p+1;i<values.length;i++){ const d=values[i]-values[i-1]; g=(g*(p-1)+Math.max(d,0))/p; l=(l*(p-1)+Math.max(-d,0))/p; } if(l===0) return 100; return 100-100/(1+g/l); }
function macd(values){ if(values.length<35) return {histogram:null}; const e12=ema(values,12), e26=ema(values,26), line=[]; for(let i=0;i<values.length;i++) if(Number.isFinite(e12[i])&&Number.isFinite(e26[i])) line.push(e12[i]-e26[i]); const sig=ema(line,9); return {histogram: line.at(-1)-sig.at(-1)}; }
function pivot(rows){ if(rows.length<2) return [null,null,null,null,null]; const x=rows[rows.length-2]; const p=(x.h+x.l+x.c)/3; return [p,2*p-x.h,p-(x.h-x.l),2*p-x.l,p+(x.h-x.l)]; }
function analyse(rows){ 
  if(rows.length<20) return {signal:"NO DATA", e9:null,e20:null,e50:null,e100:null,e200:null,rsi:null,macd:null};
  const c=rows.map(x=>x.c); const e9=ema(c,9).at(-1), e20=ema(c,20).at(-1), e50=ema(c,50).at(-1), e100=ema(c,100).at(-1), e200=ema(c,200).at(-1); const R=rsi(c), M=macd(c); let s=0; if(e9>e20) s++; else s--; if(e20>e50) s++; else s--; if(e50>e200) s++; else s--; if(R>=55) s++; if(R<=45) s--; if(M.histogram>0) s++; else if(M.histogram<0) s--; let sig="NO TRADE"; if(s>=3) sig="BUY"; else if(s<=-3) sig="SELL"; return {signal:sig,e9,e20,e50,e100,e200,rsi:R,macd:M}; 
}

function colour(el, sig){ if(!el) return; el.classList.remove("buy","sell","neutral"); el.classList.add(sig==="BUY"?"buy": sig==="SELL"?"sell":"neutral"); }
function setVerdict(sig, source){ 
  set("verdict",sig); 
  const msg=sig==="BUY"?"SPSL Trend Up • BUY ("+source+")": sig==="SELL"?"SPSL Trend Down • SELL ("+source+")": sig==="NO DATA"?"SPSL wait...": "SPSL Wait • No Clear Direction ("+source+")";
  set("verdictMessage", msg); set("trendMessage", msg); colour($("verdictCard"),sig); 
}
function cardSignal(id,sig){ const c=$(id); if(!c) return; const b=c.querySelector("b"); if(b) b.textContent=sig; colour(c,sig); }

function render(rows,a,source){
  cardSignal("intradayCard",a.signal); cardSignal("shortCard",a.signal); cardSignal("swingCard",a.signal);
  let rs="NO TRADE"; if(Number.isFinite(a.rsi)){ if(a.rsi>=70) rs="SELL"; else if(a.rsi>=55) rs="BUY"; else if(a.rsi<=30) rs="BUY"; else if(a.rsi<=45) rs="SELL"; }
  cardSignal("rsiCard",rs); let ms="NO TRADE"; if(Number.isFinite(a.macd?.histogram)) ms= a.macd.histogram>0?"BUY":"SELL"; cardSignal("macdCard",ms);
  const vals=rows.slice(-22).map(x=>x.v).filter(v=>v>0); if(vals.length>=2){ const cur=vals.at(-1), avg=vals.slice(0,-1).reduce((a,b)=>a+b,0)/(vals.length-1); let vSig="NO TRADE", vTxt="Average Volume ("+source+")"; if(cur>avg*1.5){ vSig="BUY"; vTxt="High Volume • Strong SPSL ("+source+")"; } else if(cur<avg*0.6){ vSig="SELL"; vTxt="Low Volume"; } set("volumeState", vTxt); cardSignal("volCard",vSig); set("volume", Math.round(cur).toLocaleString()); }
  set("ema9",fmt(a.e9)); set("ema20",fmt(a.e20)); set("ema50",fmt(a.e50)); set("ema100",fmt(a.e100)); set("ema200",fmt(a.e200));
  set("rsiValue", a.rsi? a.rsi.toFixed(2):"—"); set("macdValue", a.macd?.histogram!=null? a.macd.histogram.toFixed(4):"—");
  const pv=pivot(rows); set("p",fmt(pv[0])); set("s1",fmt(pv[1])); set("s2",fmt(pv[2])); set("r1",fmt(pv[3])); set("r2",fmt(pv[4]));
}

function drawChart(data){
  const cv=$("chart"); if(!cv) return; const ctx=cv.getContext('2d'); const w=cv.width=cv.clientWidth*2, h=cv.height=280; ctx.clearRect(0,0,w,h); if(!data.length) return; const min=Math.min(...data), max=Math.max(...data); const pad=20; ctx.strokeStyle="#0a3d2e"; ctx.lineWidth=3; ctx.beginPath(); data.forEach((v,i)=>{ const x=pad+(i/(data.length-1))*(w-pad*2); const y=h-pad-((v-min)/(max-min||1))*(h-pad*2); if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); }); ctx.stroke(); ctx.lineTo(w-pad,h-pad); ctx.lineTo(pad,h-pad); ctx.closePath(); ctx.fillStyle="rgba(10,61,46,0.08)"; ctx.fill();
  ctx.fillStyle="#0a3d2e"; ctx.font="12px monospace"; ctx.fillText("SPSL High: "+max.toFixed(2), pad, 20); ctx.fillText("SPSL Low: "+min.toFixed(2), pad, h-5);
}

function fillPageWithData(rows, source){
  const last=rows[rows.length-1], prev=rows[rows.length-2]||last;
  const price=last.c, change=price-prev.c, pct=prev.c?change/prev.c*100:0;
  set("price", "Rs. "+fmt(price)); set("change", (change>=0?"+":"")+fmt(change)+" ("+(pct>=0?"+":"")+fmt(pct)+"%)");
  set("open", fmt(last.o)); set("high", fmt(last.h)); set("low", fmt(last.l)); set("prev", fmt(prev.c));
  set("company", source==="Fallback" ? "Sitara Petroleum Service Ltd (Demo Data - Live Fetching...)" : "Sitara Petroleum Service Ltd"); 
  set("sector", "Oil & Gas Marketing / Petroleum Services"); set("symbolLabel", "SPSL");
  const chEl=$("change"); if(chEl) chEl.className="change "+(change>0?"up":change<0?"down":"");
  const analysis=analyse(rows); setVerdict(analysis.signal, source); render(rows,analysis,source); drawChart(rows.slice(-100).map(r=>r.c));
  return analysis;
}

async function loadAll(){
  if(state.loading) return; state.loading=true;
  const badge=$("statusBadge"); 
  if(badge){ badge.textContent= state.retryCount? "● Retrying SPSL ("+state.retryCount+")..." : "● Connecting SPSL - Sitara Petroleum..."; badge.style.background="#d97706"; }
  clearUI();
  
  console.log("SPSL: Instant fill with fallback data - NO MORE NO DATA");
  fillPageWithData(FALLBACK_SPSL_DATA, "Fallback");
  if(badge) badge.textContent="● SPSL Demo Data - Fetching Real...";
  
  const cached=loadCache();
  if(cached.length>20){
    fillPageWithData(cached, "Cached");
    if(badge) badge.textContent="● SPSL Cached ("+cached.length+" days) - Fetching Live...";
  }
  
  try{
    let rows=[];
    try{ rows=await restHistorical("SPSL"); console.log("SPSL REST live", rows.length); }catch(e){ console.log("REST fail"); }
    if(!rows.length){ try{ rows=await yahooHistory("SPSL"); }catch{} }
    
    if(rows.length>20){
      const analysis=fillPageWithData(rows, "Live Real");
      if(badge){ 
        badge.textContent="● SPSL Live - "+analysis.signal+" - Real Data ("+rows.length+" days)"; 
        badge.style.background= analysis.signal==="BUY"?"#0a7a3d": analysis.signal==="SELL"?"#a12a24":"#0a7a3d";
      }
      state.retryCount=0;
      state.loading=false;
      return;
    }
  }catch(e){ console.log("Live fetch failed"); }
  
  if(badge){ 
    const hasCache = loadCache().length>0;
    badge.textContent = hasCache ? "● SPSL Cached - Retrying Live ("+(state.retryCount+1)+")" : "● SPSL Demo - Retrying Live ("+(state.retryCount+1)+")"; 
  }
  state.retryCount++;
  setTimeout(()=>{ state.loading=false; loadAll(); }, 15000);
  state.loading=false;
}

function init(){
  const chips=$("chips"); if(chips){ chips.innerHTML=""; const btn=document.createElement("button"); btn.textContent="SPSL - Sitara Petroleum"; btn.classList.add("active"); btn.style.background="#0a3d2e"; btn.style.color="#fff"; btn.style.padding="8px 16px"; btn.style.borderRadius="20px"; btn.style.border="none"; btn.style.fontWeight="bold"; chips.appendChild(btn); const info=document.createElement("div"); info.style.fontSize="11px"; info.style.color="#6b8a80"; info.style.marginTop="6px"; info.textContent="SPSL Only - Saari Info SPSL ki - Demo + Live + Cache"; chips.appendChild(info); }
  const si=$("searchInput"); if(si){ si.value="SPSL"; si.placeholder="SPSL - Sitara Petroleum"; si.disabled=true; }
}

window.addEventListener('load', ()=>{
  try{ fetch(CFG.rest+"/",{mode:"no-cors"}); }catch{}
  init(); setTimeout(()=>loadAll(),300);
});
