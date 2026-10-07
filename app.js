const CFG={lens:"https://api.psxlens.com/v1",rest:"https://psx-rest-api.onrender.com",yahoo:"https://query1.finance.yahoo.com/v8/finance/chart"};
const state={symbol:"SYS",name:"Systems Limited",sector:"Technology & Communication",tf:"1D",rows:[],daily:[],quote:null,analysis:null};

const $=id=>document.getElementById(id);
const fmt=n=>Number.isFinite(+n)?(+n).toLocaleString("en-PK",{minimumFractionDigits:2,maximumFractionDigits:2}):"—";
const compact=n=>Number.isFinite(+n)?(+n).toLocaleString("en-PK",{notation:"compact",maximumFractionDigits:1}):"—";
function setText(id,v){$(id).textContent=v??"—";}
function signalClass(s){return s==="BUY"?"buy":s==="SELL"?"sell":"neutral";}
function setSignal(el,signal){el.classList.remove("buy","sell","neutral");el.classList.add(signalClass(signal));}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));}

async function getJSON(url,ms=12000){
  const c=new AbortController(); const t=setTimeout(()=>c.abort(),ms);
  try{const r=await fetch(url,{signal:c.signal,cache:"no-store"});if(!r.ok)throw new Error("request");return await r.json();}
  finally{clearTimeout(t)}
}
function pick(obj,keys){for(const k of keys){if(obj&&obj[k]!==undefined&&obj[k]!==null)return obj[k]}return null}
function normalizeRows(raw){
  let a=Array.isArray(raw)?raw:(raw?.data||raw?.prices||raw?.candles||raw?.results||[]);
  if(Array.isArray(raw?.results)&&raw.results[0]?.candles)a=raw.results[0].candles;
  return a.map(x=>{
    if(Array.isArray(x))return {t:new Date(x[0]).getTime(),o:+x[1],h:+x[2],l:+x[3],c:+x[4],v:+x[5]||0};
    return {t:new Date(pick(x,["date","timestamp","time"])).getTime(),o:+pick(x,["open","o"]),h:+pick(x,["high","h"]),l:+pick(x,["low","l"]),c:+pick(x,["close","c"]),v:+pick(x,["volume","v"])||0};
  }).filter(x=>Number.isFinite(x.t)&&[x.o,x.h,x.l,x.c].every(Number.isFinite)).sort((a,b)=>a.t-b.t);
}
function ema(a,n){if(a.length<n)return [];let k=2/(n+1),e=a.slice(0,n).reduce((s,x)=>s+x,0)/n,out=Array(n-1).fill(null);out.push(e);for(let i=n;i<a.length;i++){e=a[i]*k+e*(1-k);out.push(e)}return out}
function sma(a,n){return a.length<n?null:a.slice(-n).reduce((s,x)=>s+x,0)/n}
function rsi(a,n=14){if(a.length<=n)return null;let g=0,l=0;for(let i=1;i<=n;i++){let d=a[i]-a[i-1];g+=Math.max(d,0);l+=Math.max(-d,0)}g/=n;l/=n;for(let i=n+1;i<a.length;i++){let d=a[i]-a[i-1];g=(g*(n-1)+Math.max(d,0))/n;l=(l*(n-1)+Math.max(-d,0))/n}return l===0?100:100-100/(1+g/l)}
function atr(rows,n=14){if(rows.length<=n)return null;let tr=[];for(let i=1;i<rows.length;i++)tr.push(Math.max(rows[i].h-rows[i].l,Math.abs(rows[i].h-rows[i-1].c),Math.abs(rows[i].l-rows[i-1].c)));return sma(tr,n)}
function macd(a){if(a.length<35)return null;const e12=ema(a,12),e26=ema(a,26);let line=[];for(let i=0;i<a.length;i++)if(e12[i]!=null&&e26[i]!=null)line.push(e12[i]-e26[i]);return line.length?line[line.length-1]:null}
function aggregate(rows,minutes){if(minutes===1)return rows;let out=[];let bucket=null;for(const r of rows){let key=Math.floor(r.t/(minutes*60000));if(key!==bucket){bucket=key;out.push({...r})}else{let x=out[out.length-1];x.h=Math.max(x.h,r.h);x.l=Math.min(x.l,r.l);x.c=r.c;x.v+=r.v}}return out}
function weeklyMonthly(rows,month){const map=new Map();for(const r of rows){const d=new Date(r.t);const key=month?`${d.getUTCFullYear()}-${d.getUTCMonth()}`:`${d.getUTCFullYear()}-${Math.floor((d.getUTCDate()-1)/7)}`;if(!map.has(key))map.set(key,{...r});else{let x=map.get(key);x.h=Math.max(x.h,r.h);x.l=Math.min(x.l,r.l);x.c=r.c;x.v+=r.v}}return [...map.values()].sort((a,b)=>a.t-b.t)}
function pivot(rows){if(rows.length<2)return [null,null,null,null,null];let r=rows[rows.length-2],p=(r.h+r.l+r.c)/3;return [p,2*p-r.h,p-(r.h-r.l),2*p-r.l,p+(r.h-r.l)]}
function score(rows){if(rows.length<55)return {signal:"NO TRADE",e:{},rsi:null,macd:null,atr:null};let c=rows.map(x=>x.c),e9=ema(c,9).at(-1),e20=ema(c,20).at(-1),e50=ema(c,50).at(-1),e100=ema(c,100).at(-1),e200=ema(c,200).at(-1),rv=rsi(c),mc=macd(c);let s=0;s+=e9>e20?1:-1;s+=e20>e50?1:-1;s+=e50>e200?1:-1;s+=rv>55?1:rv<45?-1:0;s+=mc>0?1:mc<0?-1:0;return {signal:s>=3?"BUY":s<=-3?"SELL":"NO TRADE",e:{e9,e20,e50,e100,e200},rsi:rv,macd:mc,atr:atr(rows)}}
function marketStatus(){const d=new Date(new Date().toLocaleString("en-US",{timeZone:"Asia/Karachi"}));const day=d.getDay(),m=d.getHours()*60+d.getMinutes();return day>=1&&day<=5&&m>=570&&m<=780?"Market Open":"Market Closed"}

async function loadQuote(){
  try{
    const q=await getJSON(`${CFG.lens}/quotes/${encodeURIComponent(state.symbol)}`);
    const x=q?.data||q?.quote||q; state.quote=x;
    state.name=pick(x,["name","company_name","company","title"])||state.name;
    state.sector=pick(x,["sector","sector_name"])||state.sector;
    setText("price",fmt(+pick(x,["price","close","last","current_price"])));
    const ch=+pick(x,["change","change_amount","net_change"]); const pct=+pick(x,["change_pct","change_percent","percent_change"]);
    setText("change",Number.isFinite(ch)?`${ch>=0?"+":""}${fmt(ch)}${Number.isFinite(pct)?` (${pct>=0?"+":""}${fmt(pct)}%)`:""}`:"—");
    $("change").classList.toggle("up",ch>0);$("change").classList.toggle("down",ch<0);
    setText("open",fmt(+pick(x,["open"])));setText("high",fmt(+pick(x,["high"])));setText("low",fmt(+pick(x,["low"])));setText("prev",fmt(+pick(x,["previous_close","prev_close","previous"])));
  }catch(e){}
  $("marketStatus").textContent=marketStatus();
}
async function loadDaily(){
  try{
    let j=await getJSON(`${CFG.lens}/prices/${encodeURIComponent(state.symbol)}?range=1Y`);
    let rows=normalizeRows(j); if(rows.length<60)throw new Error("short");
    state.daily=rows;
  }catch(e){
    try{state.daily=normalizeRows(await getJSON(`${CFG.rest}/historical/${encodeURIComponent(state.symbol)}?limit=500&order=asc`))}catch(e2){state.daily=[]}
  }
}
async function loadIntraday(tf){
  if(!["5m","15m","30m","1h"].includes(tf))return [];
  try{
    const interval=tf==="1h"?"60m":tf;
    const j=await getJSON(`${CFG.yahoo}/${encodeURIComponent(state.symbol)}.KA?range=5d&interval=${interval}`);
    const r=j?.chart?.result?.[0];if(!r)return [];
    const q=r.indicators?.quote?.[0]||{},ts=r.timestamp||[];
    return ts.map((t,i)=>({t:t*1000,o:+q.open[i],h:+q.high[i],l:+q.low[i],c:+q.close[i],v:+q.volume[i]||0})).filter(x=>[x.o,x.h,x.l,x.c].every(Number.isFinite));
  }catch(e){return []}
}
async function buildRows(){
  if(["5m","15m","30m","1h"].includes(state.tf))return await loadIntraday(state.tf);
  if(state.tf==="4h")return aggregate(await loadIntraday("1h"),240);
  if(state.tf==="1W")return weeklyMonthly(state.daily,false);
  if(state.tf==="1M")return weeklyMonthly(state.daily,true);
  return state.daily;
}
function setVerdict(a){
  const s=a.signal; $("verdict").textContent=s;
  const card=$("verdictCard");setSignal(card,s);
  const msg=s==="BUY"?"Trend is Up • Pullback can be a buying opportunity.":s==="SELL"?"Trend is Down • Bounce Back is a Sell Opportunity.":"Wait Please • No Clear Direction.";
  $("verdictMessage").textContent=msg;$("trendMessage").textContent=msg;setSignal($("trendMessage"),s);
}
function setIndicator(id,s){const el=$(id);el.querySelector("b").textContent=s;setSignal(el,s)}
function render(a,rows){
  setText("ema9",fmt(a.e.e9));setText("ema20",fmt(a.e.e20));setText("ema50",fmt(a.e.e50));setText("ema100",fmt(a.e.e100));setText("ema200",fmt(a.e.e200));
  const p=pivot(rows);["p","s1","s2","r1","r2"].forEach((id,i)=>setText(id,fmt(p[i])));
  setVerdict(a);
  const r=a.rsi;setText("rsiCard",r);$("rsiCard").querySelector("b").textContent=Number.isFinite(r)?fmt(r):"—";setSignal($("rsiCard"),r>55?"BUY":r<45?"SELL":"NO TRADE");
  $("macdCard").querySelector("b").textContent=Number.isFinite(a.macd)?(a.macd>=0?"BUY":"SELL"):"—";setSignal($("macdCard"),a.macd>0?"BUY":a.macd<0?"SELL":"NO TRADE");
  setIndicator("intradayCard",a.signal);setIndicator("shortCard",a.signal);setIndicator("swingCard",a.signal);
  const v=rows.at(-1)?.v||0,avg=sma(rows.slice(0,-1).map(x=>x.v),22);let vs="—",vc="NO TRADE";if(v&&avg){vs=v>avg*1.08?"↑ Above Average":v<avg*.92?"↓ Below Average":"-- Around Average";vc=v>avg*1.08?"BUY":v<avg*.92?"SELL":"NO TRADE"}$("volumeState").textContent=vs;$("volCard").querySelector("b").textContent=vs;setSignal($("volCard"),vc);
  drawChart(rows,a.e);
}
function drawChart(rows,e){
  const c=$("chart"),ctx=c.getContext("2d"),dpr=devicePixelRatio||1,w=c.clientWidth,h=c.clientHeight;c.width=w*dpr;c.height=h*dpr;ctx.scale(dpr,dpr);ctx.clearRect(0,0,w,h);
  if(rows.length<2){ctx.fillStyle=getComputedStyle(document.body).color;ctx.font="14px system-ui";ctx.fillText("Data unavailable",20,30);return}
  const view=rows.slice(-90), hi=Math.max(...view.map(x=>x.h)),lo=Math.min(...view.map(x=>x.l)),pad=18,volH=52,chartH=h-volH-pad*2,range=hi-lo||1;
  const xStep=(w-pad*2)/view.length;const y=v=>pad+(hi-v)/range*chartH;
  ctx.strokeStyle=document.body.classList.contains("dark")?"#2a403b":"#e1ebe7";ctx.lineWidth=1;for(let i=0;i<5;i++){let yy=pad+i*chartH/4;ctx.beginPath();ctx.moveTo(pad,yy);ctx.lineTo(w-pad,yy);ctx.stroke()}
  view.forEach((r,i)=>{let x=pad+i*xStep+xStep/2,up=r.c>=r.o;ctx.strokeStyle=up?"#18a65b":"#d64249";ctx.fillStyle=up?"#18a65b":"#d64249";ctx.beginPath();ctx.moveTo(x,y(r.h));ctx.lineTo(x,y(r.l));ctx.stroke();let top=y(Math.max(r.o,r.c)),bot=y(Math.min(r.o,r.c));ctx.fillRect(x-xStep*.32,top,Math.max(2,xStep*.64),Math.max(1,bot-top))});
  const lines=[["e9","#16a34a"],["e20","#dc2626"],["e50",document.body.classList.contains("dark")?"#fff":"#111"],["e100","#38bdf8"],["e200","#f97316"]];
  for(const [key,col] of lines){let n=+key.slice(1),arr=ema(view.map(x=>x.c),n);if(!arr.length)continue;ctx.strokeStyle=col;ctx.lineWidth=1.5;ctx.beginPath();arr.forEach((v,i)=>{if(v==null)return;let x=pad+i*xStep+xStep/2,yy=y(v);i===0?ctx.moveTo(x,yy):ctx.lineTo(x,yy)});ctx.stroke()}
  const av=sma(view.map(x=>x.v),22)||1;view.forEach((r,i)=>{let x=pad+i*xStep+xStep/2,bh=Math.min(volH-2,(r.v/av)*(volH-4));ctx.fillStyle=r.v>av?"#36a66a":"#d6a13c";ctx.fillRect(x-xStep*.28,h-bh-4,Math.max(1,xStep*.56),bh)});
}
async function selectSymbol(sym,name,sector){state.symbol=sym.toUpperCase();state.name=name||state.name;state.sector=sector||state.sector;setText("symbol",state.symbol);setText("company",state.name);setText("sector",state.sector);setText("chartTitle",state.symbol);await refresh()}
async function refresh(){
  setText("company",state.name);setText("sector",state.sector);$("updated").textContent="Data update time: Loading…";
  await loadQuote();await loadDaily();state.rows=await buildRows();
  if(state.rows.length){state.analysis=score(state.rows);render(state.analysis,state.rows)}else{setVerdict({signal:"NO TRADE"});drawChart([],{});["intradayCard","shortCard","swingCard","rsiCard","macdCard","volCard"].forEach(id=>{$(id).querySelector("b").textContent="—"})}
  $("chartTf").textContent={5m:"5 Minutes",15m:"15 Minutes",30m:"30 Minutes",1h:"1 Hour",4h:"4 Hour",1D:"Daily",1W:"Weekly",1M:"Monthly"}[state.tf];
  $("updated").textContent=`Data update time: ${new Date().toLocaleTimeString("en-PK",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}`;
}
function init(){
  const chips=["KSE 100","OGDC","PPL","MARI","SYS","HBL","UBL","MEBL","LUCK"];const wrap=$("chips");chips.forEach(x=>{let b=document.createElement("button");b.className="chip";b.textContent=x;b.onclick=()=>{if(x==="KSE 100")return;document.querySelectorAll(".chip").forEach(z=>z.classList.remove("active"));b.classList.add("active");selectSymbol(x)};wrap.appendChild(b)});
  const tfs=[["5m","5 Minutes"],["15m","15 Minutes"],["30m","30 Minutes"],["1h","1 Hour"],["4h","4 Hour"],["1D","Daily"],["1W","Weekly"],["1M","Monthly"]];const tw=$("timeframes");tfs.forEach(([v,l])=>{let b=document.createElement("button");b.className="tf"+(v==="1D"?" active":"");b.textContent=l;b.onclick=async()=>{document.querySelectorAll(".tf").forEach(z=>z.classList.remove("active"));b.classList.add("active");state.tf=v;await refresh()};tw.appendChild(b)});
  $("themeToggle").onclick=()=>{document.body.classList.toggle("dark");$("themeToggle").textContent=document.body.classList.contains("dark")?"☀":"☾";if(state.rows.length)drawChart(state.rows,state.analysis?.e||{})};
  $("searchInput").addEventListener("input",async e=>{let q=e.target.value.trim();if(q.length<2){$("searchResults").classList.add("hidden");return}try{let j=await getJSON(`${CFG.lens}/search?q=${encodeURIComponent(q)}`);let a=j?.data||j?.results||j||[];if(!Array.isArray(a))a=[];$("searchResults").innerHTML=a.slice(0,7).map(x=>{let s=pick(x,["symbol","ticker"]);let n=pick(x,["name","company_name","company"]);let sec=pick(x,["sector","sector_name"])||"—";return `<button data-s="${escapeHtml(s||"")}" data-n="${escapeHtml(n||"")}" data-sec="${escapeHtml(sec)}"><b>${escapeHtml(s||"")}</b> · ${escapeHtml(n||"")}</button>`}).join("");$("searchResults").classList.toggle("hidden",!a.length);$("searchResults").querySelectorAll("button").forEach(b=>b.onclick=()=>{$("searchResults").classList.add("hidden");$("searchInput").value="";selectSymbol(b.dataset.s,b.dataset.n,b.dataset.sec)})}catch(e){$("searchResults").classList.add("hidden")}});document.addEventListener("click",e=>{if(!e.target.closest(".search-wrap"))$("searchResults").classList.add("hidden")});
  window.addEventListener("resize",()=>{if(state.rows.length)drawChart(state.rows,state.analysis?.e||{})});
  setText("symbol",state.symbol);setText("company",state.name);setText("sector",state.sector);refresh();setInterval(refresh,60000);
}
init();