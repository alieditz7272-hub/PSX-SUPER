const API="https://api.psxlens.com/v1";

const state={
 symbol:"SYS",
 name:"Systems Limited",
 sector:"Technology & Communication",
 tf:"1D",
 rows:[],
 daily:[]
};

const $=id=>document.getElementById(id);

const fmt=n=>{
 n=Number(n);
 return Number.isFinite(n)
 ? n.toLocaleString("en-PK",{minimumFractionDigits:2,maximumFractionDigits:2})
 : "—";
};

const pick=(o,keys)=>{
 for(const k of keys)
  if(o?.[k]!==undefined&&o?.[k]!==null)return o[k];
 return null;
};

async function get(url){
 const r=await fetch(url,{cache:"no-store"});
 if(!r.ok)throw new Error("Data unavailable");
 return r.json();
}

function rows(raw){
 const a=Array.isArray(raw)
  ?raw
  :(raw?.data||raw?.prices||raw?.candles||raw?.results||[]);

 return a.map(x=>{
  if(Array.isArray(x))
   return{
    t:new Date(x[0]).getTime(),
    o:+x[1],h:+x[2],l:+x[3],c:+x[4],v:+x[5]||0
   };

  return{
   t:new Date(pick(x,["date","timestamp","time"])).getTime(),
   o:+pick(x,["open","o"]),
   h:+pick(x,["high","h"]),
   l:+pick(x,["low","l"]),
   c:+pick(x,["close","c"]),
   v:+pick(x,["volume","v"])||0
  };
 }).filter(x=>
  Number.isFinite(x.t)&&
  [x.o,x.h,x.l,x.c].every(Number.isFinite)
 ).sort((a,b)=>a.t-b.t);
}

function ema(a,n){
 if(a.length<n)return[];
 let k=2/(n+1);
 let e=a.slice(0,n).reduce((s,x)=>s+x,0)/n;
 let out=Array(n-1).fill(null);
 out.push(e);

 for(let i=n;i<a.length;i++){
  e=a[i]*k+e*(1-k);
  out.push(e);
 }
 return out;
}

function sma(a,n){
 return a.length<n?null:a.slice(-n).reduce((s,x)=>s+x,0)/n;
}

function rsi(a,n=14){
 if(a.length<=n)return null;

 let g=0,l=0;

 for(let i=1;i<=n;i++){
  const d=a[i]-a[i-1];
  g+=Math.max(d,0);
  l+=Math.max(-d,0);
 }

 g/=n;
 l/=n;

 for(let i=n+1;i<a.length;i++){
  const d=a[i]-a[i-1];
  g=(g*(n-1)+Math.max(d,0))/n;
  l=(l*(n-1)+Math.max(-d,0))/n;
 }

 return l===0?100:100-100/(1+g/l);
}

function macd(a){
 if(a.length<35)return null;

 const e12=ema(a,12);
 const e26=ema(a,26);

 let last=null;

 for(let i=0;i<a.length;i++){
  if(e12[i]!=null&&e26[i]!=null)
   last=e12[i]-e26[i];
 }

 return last;
}

function pivot(r){
 if(r.length<2)return[null,null,null,null,null];

 const x=r[r.length-2];
 const p=(x.h+x.l+x.c)/3;

 return[
  p,
  2*p-x.h,
  p-(x.h-x.l),
  2*p-x.l,
  p+(x.h-x.l)
 ];
}

function signal(r){
 if(r.length<55)
  return{signal:"NO TRADE",e:{},rsi:null,macd:null};

 const c=r.map(x=>x.c);

 const e9=ema(c,9).at(-1);
 const e20=ema(c,20).at(-1);
 const e50=ema(c,50).at(-1);
 const e100=ema(c,100).at(-1);
 const e200=ema(c,200).at(-1);

 const R=rsi(c);
 const M=macd(c);

 let s=0;

 s+=e9>e20?1:-1;
 s+=e20>e50?1:-1;
 s+=e50>e200?1:-1;

 if(R>55)s++;
 if(R<45)s--;

 if(M>0)s++;
 if(M<0)s--;

 return{
  signal:s>=3?"BUY":s<=-3?"SELL":"NO TRADE",
  e:{e9,e20,e50,e100,e200},
  rsi:R,
  macd:M
 };
}

function set(id,v){
 const el=$(id);
 if(el)el.textContent=v??"—";
}

function colour(el,s){
 if(!el)return;
 el.classList.remove("buy","sell","neutral");
 el.classList.add(
  s==="BUY"?"buy":
  s==="SELL"?"sell":"neutral"
 );
}

function setVerdict(s){
 set("verdict",s);

 const card=$("verdictCard");
 colour(card,s);

 const msg=
 s==="BUY"
 ?"Trend is Up • Pullback can be a buying opportunity."
 :s==="SELL"
 ?"Trend is Down • Bounce Back is a Sell Opportunity."
 :"Wait Please • No Clear Direction.";

 set("verdictMessage",msg);
 set("trendMessage",msg);
 colour($("trendMessage"),s);
}

async function quote(){

 try{

  const j=await get(
   `${API}/quotes/${encodeURIComponent(state.symbol)}`
  );

  const q=j?.data||j?.quote||j;

  state.name=
   pick(q,["name","company_name","company","title"])
   ||state.name;

  state.sector=
   pick(q,["sector","sector_name"])
   ||state.sector;

  const price=pick(q,[
   "price","close","last","current_price"
  ]);

  const change=pick(q,[
   "change","change_amount","net_change"
  ]);

  const pct=pick(q,[
   "change_pct","change_percent","percent_change"
  ]);

  set("price",fmt(price));

  set(
   "change",
   Number.isFinite(+change)
   ?`${+change>=0?"+":""}${fmt(change)}${
      Number.isFinite(+pct)
      ?` (${+pct>=0?"+":""}${fmt(pct)}%)`
      :""
    }`
   :"—"
  );

  set("open",fmt(pick(q,["open"])));
  set("high",fmt(pick(q,["high"])));
  set("low",fmt(pick(q,["low"])));

  set(
   "prev",
   fmt(pick(q,[
    "previous_close",
    "prev_close",
    "previous"
   ]))
  );

 }catch(e){

  set("price","—");
  set("change","—");
  set("open","—");
  set("high","—");
  set("low","—");
  set("prev","—");

 }

 set("company",state.name);
 set("sector",state.sector);
}

async function history(){

 try{

  const j=await get(
   `${API}/prices/${encodeURIComponent(state.symbol)}?range=1Y`
  );

  state.daily=rows(j);

 }catch(e){

  state.daily=[];

 }

}

function render(){

 const r=state.daily;

 if(!r.length){

  setVerdict("NO TRADE");
  set("updated","Data update time: Data unavailable");
  draw([]);
  return;
 }

 const a=signal(r);

 set("ema9",fmt(a.e.e9));
 set("ema20",fmt(a.e.e20));
 set("ema50",fmt(a.e.e50));
 set("ema100",fmt(a.e.e100));
 set("ema200",fmt(a.e.e200));

 const p=pivot(r);

 ["p","s1","s2","r1","r2"]
 .forEach((id,i)=>set(id,fmt(p[i])));

 setVerd
