/* =========================================================
   NH PSX SUPER ANALYSIS
   Consolidated App Engine
   ========================================================= */

const CFG = {
  lens: "https://api.psxlens.com/v1",
  yahoo: "https://query1.finance.yahoo.com/v8/finance/chart"
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

/* =========================================================
   HELPERS
   ========================================================= */

const fmt = n => {
  n = Number(n);
  return Number.isFinite(n)
    ? n.toLocaleString("en-PK", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    : "—";
};

const num = n => {
  const v = Number(n);
  return Number.isFinite(v) ? v : null;
};

const pick = (o, keys) => {
  for (const k of keys) {
    if (
      o &&
      o[k] !== undefined &&
      o[k] !== null &&
      o[k] !== ""
    ) {
      return o[k];
    }
  }
  return null;
};

async function getJSON(url) {
  const r = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json"
    }
  });

  if (!r.ok) {
    throw new Error("Data unavailable");
  }

  return r.json();
}

function set(id, value) {
  const el = $(id);
  if (el) el.textContent = value ?? "—";
}

function colour(el, signal) {
  if (!el) return;

  el.classList.remove("buy", "sell", "neutral");

  el.classList.add(
    signal === "BUY"
      ? "buy"
      : signal === "SELL"
      ? "sell"
      : "neutral"
  );
}

function cleanRows(rows) {
  return rows
    .filter(x =>
      Number.isFinite(x.t) &&
      Number.isFinite(x.o) &&
      Number.isFinite(x.h) &&
      Number.isFinite(x.l) &&
      Number.isFinite(x.c)
    )
    .sort((a, b) => a.t - b.t);
}

/* =========================================================
   DATA NORMALIZATION
   ========================================================= */

function normalizeRows(raw) {
  const arr =
    Array.isArray(raw)
      ? raw
      : (
          raw?.data ||
          raw?.prices ||
          raw?.candles ||
          raw?.results ||
          raw?.rows ||
          []
        );

  const out = [];

  for (const x of arr) {
    if (Array.isArray(x)) {
      const t = new Date(x[0]).getTime();

      out.push({
        t,
        o: num(x[1]),
        h: num(x[2]),
        l: num(x[3]),
        c: num(x[4]),
        v: num(x[5]) || 0
      });

      continue;
    }

    const rawTime = pick(x, [
      "date",
      "datetime",
      "timestamp",
      "time",
      "t"
    ]);

    let t;

    if (typeof rawTime === "number") {
      t =
        rawTime < 10000000000
          ? rawTime * 1000
          : rawTime;
    } else {
      t = new Date(rawTime).getTime();
    }

    out.push({
      t,
      o: num(pick(x, ["open", "o"])),
      h: num(pick(x, ["high", "h"])),
      l: num(pick(x, ["low", "l"])),
      c: num(pick(x, ["close", "c"])),
      v: num(pick(x, ["volume", "v"])) || 0
    });
  }

  return cleanRows(out);
}

/* =========================================================
   YAHOO DATA
   ========================================================= */

function yahooSymbol(symbol) {
  return `${symbol}.KA`;
}

async function yahooHistory(symbol, interval, range) {
  const url =
    `${CFG.yahoo}/${encodeURIComponent(yahooSymbol(symbol))}` +
    `?period1=0&period2=${Math.floor(Date.now() / 1000)}` +
    `&interval=${interval}&range=${range}` +
    `&includePrePost=false&events=div%2Csplits`;

  const j = await getJSON(url);

  const result =
    j?.chart?.result?.[0];

  if (!result) {
    throw new Error("No market data");
  }

  const timestamps = result.timestamp || [];
  const q = result.indicators?.quote?.[0] || {};

  const rows = [];

  for (let i = 0; i < timestamps.length; i++) {
    const o = num(q.open?.[i]);
    const h = num(q.high?.[i]);
    const l = num(q.low?.[i]);
    const c = num(q.close?.[i]);
    const v = num(q.volume?.[i]) || 0;

    if (
      Number.isFinite(o) &&
      Number.isFinite(h) &&
      Number.isFinite(l) &&
      Number.isFinite(c)
    ) {
      rows.push({
        t: timestamps[i] * 1000,
        o,
        h,
        l,
        c,
        v
      });
    }
  }

  return cleanRows(rows);
}

/* =========================================================
   PSX LENS DATA
   ========================================================= */

async function lensQuote(symbol) {
  const urls = [
    `${CFG.lens}/quotes/${encodeURIComponent(symbol)}`,
    `${CFG.lens}/quote/${encodeURIComponent(symbol)}`
  ];

  for (const url of urls) {
    try {
      const j = await getJSON(url);

      const q =
        j?.data ||
        j?.quote ||
        j?.result ||
        j;

      if (q && typeof q === "object") {
        return q;
      }
    } catch (_) {}
  }

  throw new Error("Quote unavailable");
}

async function lensHistory(symbol) {
  const urls = [
    `${CFG.lens}/prices/${encodeURIComponent(symbol)}?range=1Y`,
    `${CFG.lens}/history/${encodeURIComponent(symbol)}?range=1Y`,
    `${CFG.lens}/prices/${encodeURIComponent(symbol)}?period=1Y`
  ];

  for (const url of urls) {
    try {
      const j = await getJSON(url);
      const rows = normalizeRows(j);

      if (rows.length) {
        return rows;
      }
    } catch (_) {}
  }

  throw new Error("History unavailable");
}

/* =========================================================
   QUOTE
   ========================================================= */

async function loadQuote() {
  let q = null;

  try {
    q = await lensQuote(state.symbol);
  } catch (_) {}

  if (!q) {
    try {
      const j = await getJSON(
        `${CFG.yahoo}/${encodeURIComponent(
          yahooSymbol(state.symbol)
        )}?range=5d&interval=1d`
      );

      const result =
        j?.chart?.result?.[0];

      const meta = result?.meta || {};
      const quote =
        result?.indicators?.quote?.[0] || {};

      const i =
        (quote.close || []).length - 1;

      const price =
        num(quote.close?.[i]) ??
        num(meta.regularMarketPrice);

      const prev =
        num(quote.close?.[i - 1]) ??
        num(meta.previousClose);

      q = {
        name: meta.longName || meta.shortName,
        company_name: meta.longName || meta.shortName,
        sector: "",
        price,
        close: price,
        previous_close: prev,
        open: num(quote.open?.[i]),
        high: num(quote.high?.[i]),
        low: num(quote.low?.[i]),
        change:
          Number.isFinite(price) &&
          Number.isFinite(prev)
            ? price - prev
            : null,
        change_pct:
          Number.isFinite(price) &&
          Number.isFinite(prev) &&
          prev !== 0
            ? ((price - prev) / prev) * 100
            : null
      };
    } catch (_) {}
  }

  if (!q) {
    set("price", "—");
    set("change", "—");
    set("open", "—");
    set("high", "—");
    set("low", "—");
    set("prev", "—");
    return;
  }

  state.quote = q;

  const name =
    pick(q, [
      "name",
      "company_name",
      "company",
      "title",
      "longName"
    ]);

  const sector =
    pick(q, [
      "sector",
      "sector_name"
    ]);

  if (name) state.name = String(name);
  if (sector) state.sector = String(sector);

  const price = num(
    pick(q, [
      "price",
      "last",
      "close",
      "current_price",
      "regularMarketPrice"
    ])
  );

  const previous = num(
    pick(q, [
      "previous_close",
      "prev_close",
      "previous",
      "previousClose"
    ])
  );

  let change = num(
    pick(q, [
      "change",
      "change_amount",
      "net_change"
    ])
  );

  let pct = num(
    pick(q, [
      "change_pct",
      "change_percent",
      "percent_change"
    ])
  );

  if (
    !Number.isFinite(change) &&
    Number.isFinite(price) &&
    Number.isFinite(previous)
  ) {
    change = price - previous;
  }

  if (
    !Number.isFinite(pct) &&
    Number.isFinite(change) &&
    Number.isFinite(previous) &&
    previous !== 0
  ) {
    pct = (change / previous) * 100;
  }

  set("price", fmt(price));

  if (Number.isFinite(change)) {
    set(
      "change",
      `${change >= 0 ? "+" : ""}${fmt(change)}` +
      (
        Number.isFinite(pct)
          ? ` (${pct >= 0 ? "+" : ""}${fmt(pct)}%)`
          : ""
      )
    );
  } else {
    set("change", "—");
  }

  set(
    "open",
    fmt(pick(q, ["open"]))
  );

  set(
    "high",
    fmt(pick(q, ["high"]))
  );

  set(
    "low",
    fmt(pick(q, ["low"]))
  );

  set(
    "prev",
    fmt(previous)
  );

  set("company", state.name);
  set("sector", state.sector);
}

/* =========================================================
   HISTORY
   ========================================================= */

async function loadDaily() {
  let rows = [];

  try {
    rows = await lensHistory(state.symbol);
  } catch (_) {}

  if (!rows.length) {
    try {
      rows = await yahooHistory(
        state.symbol,
        "1d",
        "1y"
      );
    } catch (_) {}
  }

  state.daily = rows;

  return rows;
}

/* =========================================================
   TIMEFRAME DATA
   ========================================================= */

function aggregate(rows, minutes) {
  if (!rows.length) return [];

  const bucketMs = minutes * 60 * 1000;
  const groups = new Map();

  for (const x of rows) {
    const bucket =
      Math.floor(x.t / bucketMs) *
      bucketMs;

    if (!groups.has(bucket)) {
      groups.set(bucket, []);
    }

    groups.get(bucket).push(x);
  }

  const out = [];

  for (const [t, group] of groups) {
    if (!group.length) continue;

    out.push({
      t,
      o: group[0].o,
      h: Math.max(...group.map(x => x.h)),
      l: Math.min(...group.map(x => x.l)),
      c: group[group.length - 1].c,
      v: group.reduce(
        (s, x) => s + (x.v || 0),
        0
      )
    });
  }

  return cleanRows(out);
}

function aggregateCalendar(rows, type) {
  if (!rows.length) return [];

  const groups = new Map();

  for (const x of rows) {
    const d = new Date(x.t);

    let key;

    if (type === "week") {
      const day = d.getDay();
      const diff =
        day === 0
          ? -6
          : 1 - day;

      const monday = new Date(d);
      monday.setDate(
        d.getDate() + diff
      );
      monday.setHours(0, 0, 0, 0);

      key = monday.getTime();
    } else {
      key =
        new Date(
          d.getFullYear(),
          d.getMonth(),
          1
        ).getTime();
    }

    if (!groups.has(key)) {
      groups.set(key, []);
    }

    groups.get(key).push(x);
  }

  const out = [];

  for (const [t, group] of groups) {
    out.push({
      t,
      o: group[0].o,
      h: Math.max(...group.map(x => x.h)),
      l: Math.min(...group.map(x => x.l)),
      c: group[group.length - 1].c,
      v: group.reduce(
        (s, x) => s + (x.v || 0),
        0
      )
    });
  }

  return cleanRows(out);
}

async function getTimeframeRows() {
  const tf = state.tf;

  if (tf === "1D") {
    return state.daily;
  }

  if (tf === "1W") {
    return aggregateCalendar(
      state.daily,
      "week"
    );
  }

  if (tf === "1M") {
    return aggregateCalendar(
      state.daily,
      "month"
    );
  }

  let interval = "5m";
  let range = "1mo";

  if (tf === "5m") {
    interval = "5m";
    range = "1mo";
  }

  if (tf === "15m") {
    interval = "15m";
    range = "1mo";
  }

  if (tf === "30m") {
    interval = "30m";
    range = "1mo";
  }

  if (tf === "1h") {
    interval = "1h";
    range = "3mo";
  }

  if (tf === "4h") {
    interval = "1h";
    range = "6mo";
  }

  try {
    const rows = await yahooHistory(
      state.symbol,
      interval,
      range
    );

    if (tf === "4h") {
      return aggregate(rows, 240);
    }

    return rows;
  } catch (_) {
    return [];
  }
}

/* =========================================================
   TECHNICAL INDICATORS
   ========================================================= */

function ema(values, period) {
  if (values.length < period) {
    return [];
  }

  const k = 2 / (period + 1);

  let e =
    values
      .slice(0, period)
      .reduce((a, b) => a + b, 0) /
    period;

  const out =
    Array(period - 1).fill(null);

  out.push(e);

  for (
    let i = period;
    i < values.length;
    i++
  ) {
    e =
      values[i] * k +
      e * (1 - k);

    out.push(e);
  }

  return out;
}

function rsi(values, period = 14) {
  if (values.length <= period) {
    return null;
  }

  let gain = 0;
  let loss = 0;

  for (let i = 1; i <= period; i++) {
    const d =
      values[i] - values[i - 1];

    gain += Math.max(d, 0);
    loss += Math.max(-d, 0);
  }

  gain /= period;
  loss /= period;

  for (
    let i = period + 1;
    i < values.length;
    i++
  ) {
    const d =
      values[i] - values[i - 1];

    gain =
      (gain * (period - 1) +
        Math.max(d, 0)) /
      period;

    loss =
      (loss * (period - 1) +
        Math.max(-d, 0)) /
      period;
  }

  if (loss === 0) return 100;

  const rs = gain / loss;

  return 100 - 100 / (1 + rs);
}

function macd(values) {
  if (values.length < 35) {
    return {
      line: null,
      signal: null,
      histogram: null
    };
  }

  const e12 = ema(values, 12);
  const e26 = ema(values, 26);

  const line = [];

  for (let i = 0; i < values.length; i++) {
    if (
      e12[i] !== null &&
      e12[i] !== undefined &&
      e26[i] !== null &&
      e26[i] !== undefined
    ) {
      line.push(e12[i] - e26[i]);
    }
  }

  if (line.length < 9) {
    return {
      line: line.at(-1) ?? null,
      signal: null,
      histogram: null
    };
  }

  const sig = ema(line, 9);

  const lastLine = line.at(-1);
  const lastSignal = sig.at(-1);

  return {
    line: lastLine,
    signal: lastSignal,
    histogram:
      Number.isFinite(lastLine) &&
      Number.isFinite(lastSignal)
        ? lastLine - lastSignal
        : null
  };
}

function pivot(rows) {
  if (rows.length < 2) {
    return [
      null,
      null,
      null,
      null,
      null
    ];
  }

  const x =
    rows[rows.length - 2];

  const p =
    (x.h + x.l + x.c) / 3;

  return [
    p,
    2 * p - x.h,
    p - (x.h - x.l),
    2 * p - x.l,
    p + (x.h - x.l)
  ];
}

/* =========================================================
   SIGNAL ENGINE
   ========================================================= */

function analyse(rows) {
  if (rows.length < 55) {
    return {
      signal: "NO TRADE",
      e9: null,
      e20: null,
      e50: null,
      e100: null,
      e200: null,
      rsi: null,
      macd: null
    };
  }

  const closes =
    rows.map(x => x.c);

  const e9 =
    ema(closes, 9).at(-1);

  const e20 =
    ema(closes, 20).at(-1);

  const e50 =
    ema(closes, 50).at(-1);

  const e100 =
    ema(closes, 100).at(-1);

  const e200 =
    ema(closes, 200).at(-1);

  const R = rsi(closes, 14);
  const M = macd(closes);

  let score = 0;

  if (
    Number.isFinite(e9) &&
    Number.isFinite(e20)
  ) {
    score += e9 > e20 ? 1 : -1;
  }

  if (
    Number.isFinite(e20) &&
    Number.isFinite(e50)
  ) {
    score += e20 > e50 ? 1 : -1;
  }

  if (
    Number.isFinite(e50) &&
    Number.isFinite(e200)
  ) {
    score += e50 > e200 ? 1 : -1;
  }

  if (Number.isFinite(R)) {
    if (R >= 55) score++;
    if (R <= 45) score--;
  }

  if (Number.isFinite(M?.histogram)) {
    if (M.histogram > 0) score++;
    if (M.histogram < 0) score--;
  }

  let signal = "NO TRADE";

  if (score >= 3) {
    signal = "BUY";
  } else if (score <= -3) {
    signal = "SELL";
  }

  return {
    signal,
    e9,
    e20,
    e50,
    e100,
    e200,
    rsi: R,
    macd: M
  };
}

/* =========================================================
   VERDICT
   ========================================================= */

function setVerdict(signal) {
  set("verdict", signal);

  const card =
    $("verdictCard");

  const trend =
    $("trendMessage");

  colour(card, signal);
  colour(trend, signal);

  const message =
    signal === "BUY"
      ? "Trend is Up • Pullback can be a buying opportunity."
      : signal === "SELL"
      ? "Trend is Down • Bounce Back is a Sell Opportunity."
      : "Wait Please • No Clear Direction.";

  set(
    "verdictMessage",
    message
  );

  set(
    "trendMessage",
    message
  );
}

/* =========================================================
   INDICATOR CARDS
   ========================================================= */

function setIndicator(id, signal) {
  const card = $(id);

  if (!card) return;

  const value =
    card.querySelector("b");

  if (value) {
    value.textContent =
      signal;
  }

  colour(card, signal);
}

function renderIndicators(rows, analysis) {
  const signal =
    analysis.signal;

  setIndicator(
    "intradayCard",
    signal
  );

  setIndicator(
    "shortCard",
    signal
  );

  setIndicator(
    "swingCard",
    signal
  );

  let rsiSignal = "NO TRADE";

  if (Number.isFinite(analysis.rsi)) {
    if (analysis.rsi >= 55) {
      rsiSignal = "BUY";
    } else if (analysis.rsi <= 45) {
      rsiSignal = "SELL";
    }
  }

  setIndicator(
    "rsiCard",
    rsiSignal
  );

  let macdSignal = "NO TRADE";

  if (
    Number.isFinite(
      analysis.macd?.histogram
    )
  ) {
    if (
      analysis.macd.histogram > 0
    ) {
      macdSignal = "BUY";
    } else if (
      analysis.macd.histogram < 0
    ) {
      macdSignal = "SELL";
    }
  }

  setIndicator(
    "macdCard",
    macdSignal
  );

  const volumes =
    rows
      .slice(-22)
      .map(x => x.v)
      .filter(v =>
        Number.isFinite(v)
      );

  let volumeSignal =
    "NO TRADE";

  if (volumes.length >= 2) {
    const current =
      volumes.at(-1);

    const previous =
      volumes.slice(0, -1);

    const avg =
      previous.reduce(
        (a, b) => a + b,
        0
      ) / previous.length;

    if (current > avg * 1.1) {
      volumeSignal = "BUY";
    } else if (
      current < avg * 0.9
    ) {
      volumeSignal = "SELL";
    }
  }

  setIndicator(
    "volCard",
    volumeSignal
  );

  renderVolume(rows);
}

function renderVolume(rows) {
  if (!rows.length) {
    set("volumeState", "—");
    return;
  }

  const volumes =
    rows
      .slice(-22)
      .map(x => x.v)
      .filter(v =>
        Number.isFinite(v) &&
        v > 0
      );

  if (volumes.length < 2) {
    set("volumeState", "—");
    return;
  }

  const current =
    volumes.at(-1);

  const avg =
    volumes
      .slice(0, -1)
      .reduce(
        (a, b) => a + b,
        0
      ) /
    Math.max(
      1,
      volumes.length - 1
    );

  if (current > avg * 1.1) {
    set(
      "volumeState",
      "↑ Above Average"
    );
  } else if (
    current < avg * 0.9
  ) {
    set(
      "volumeState",
      "↓ Below Average"
    );
  } else {
    set(
      "volumeState",
      "-- Around Average"
    );
  }
}

/* =========================================================
   CANVAS CHART
   ========================================================= */

function draw(rows) {
  const canvas =
    $("chart");

  if (!canvas) return;

  const parent =
    canvas.parentElement;

  const width =
    Math.max(
      300,
      parent?.clientWidth ||
      window.innerWidth - 24
    );

  const height =
    Math.max(
      260,
      Math.min(430, width * 0.68)
    );

  const dpr =
    window.devicePixelRatio || 1;

  canvas.width =
    width * dpr;

  canvas.height =
    height * dpr;

  canvas.style.width =
    `${width}px`;

  canvas.style.height =
    `${height}px`;

  const ctx =
    canvas.getContext("2d");

  ctx.setTransform(
    dpr,
    0,
    0,
    dpr,
    0,
    0
  );

  ctx.clearRect(
    0,
    0,
    width,
    height
  );

  if (!rows.length) {
    ctx.fillStyle =
      "#7a8582";

    ctx.font =
      "13px system-ui";

    ctx.textAlign =
      "center";

    ctx.fillText(
      "Data unavailable",
      width / 2,
      height / 2
    );

    return;
  }

  const visible =
    rows.slice(-70);

  const left = 8;
  const right = 8;
  const top = 14;
  const bottom = 42;

  const chartH =
    height - top - bottom;

  const priceH =
    chartH * 0.76;

  const volumeTop =
    top + priceH + 12;

  const volumeH =
    chartH * 0.24 - 12;

  const highs =
    visible.map(x => x.h);

  const lows =
    visible.map(x => x.l);

  const max =
    Math.max(...highs);

  const min =
    Math.min(...lows);

  const range =
    max - min || 1;

  const maxVol =
    Math.max(
      1,
      ...visible.map(
        x => x.v || 0
      )
    );

  const step =
    (width - left - right) /
    visible.length;

  const candleW =
    Math.max(
      2,
      Math.min(10, step * 0.58)
    );

  const yPrice = price =>
    top +
    ((max - price) / range) *
      priceH;

  /* Grid */

  ctx.strokeStyle =
    "rgba(100,120,115,.16)";

  ctx.lineWidth = 1;

  for (let i = 0; i <= 4; i++) {
    const y =
      top +
      (priceH / 4) * i;

    ctx.beginPath();
    ctx.moveTo(
      left,
      y
    );
    ctx.lineTo(
      width - right,
      y
    );
    ctx.stroke();
  }

  /* Candles */

  visible.forEach((x, i) => {
    const cx =
      left +
      step * i +
      step / 2;

    const yo =
      yPrice(x.o);

    const yh =
      yPrice(x.h);

    const yl =
      yPrice(x.l);

    const yc =
      yPrice(x.c);

    const up =
      x.c >= x.o;

    ctx.strokeStyle =
      up
        ? "#16a34a"
        : "#dc2626";

    ctx.fillStyle =
      up
        ? "#16a34a"
        : "#dc2626";

    ctx.lineWidth = 1;

    ctx.beginPath();

    ctx.moveTo(
      cx,
      yh
    );

    ctx.lineTo(
      cx,
      yl
    );

    ctx.stroke();

    const bodyTop =
      Math.min(yo, yc);

    const bodyH =
      Math.max(
        1,
        Math.abs(yc - yo)
      );

    ctx.fillRect(
      cx - candleW / 2,
      bodyTop,
      candleW,
      bodyH
    );

    /* Volume */

    const vh =
      ((x.v || 0) /
        maxVol) *
      volumeH;

    ctx.globalAlpha =
      0.25;

    ctx.fillRect(
      cx - candleW / 2,
      volumeTop +
        volumeH -
        vh,
      candleW,
      vh
    );

    ctx.globalAlpha = 1;
  });

  /* EMA overlays */

  const closes =
    visible.map(x => x.c);

  const periods = [
    {
      n: 9,
      color: "#16a34a"
    },
    {
      n: 20,
      color: "#dc2626"
    },
    {
      n: 50,
      color: "#64748b"
    },
    {
      n: 100,
      color: "#38bdf8"
    },
    {
      n: 200,
      color: "#f59e0b"
    }
  ];

  periods.forEach(item => {
    const values =
      ema(closes, item.n);

    if (!values.length) return;

    ctx.strokeStyle =
      item.color;

    ctx.lineWidth = 1.3;

    ctx.beginPath();

    let started = false;

    values.forEach(
      (v, i) => {
        if (!Number.isFinite(v))
          return;

        const x =
          left +
          step * i +
          step / 2;

        const y =
          yPrice(v);

        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
    );

    ctx.stroke();
  });

  /* Last price */

  const last =
    visible.at(-1);

  if (last) {
    const y =
      yPrice(last.c);

    ctx.setLineDash([
      4,
      4
    ]);

    ctx.strokeStyle =
      "rgba(15,79,70,.55)";

    ctx.beginPath();

    ctx.moveTo(
      left,
      y
    );

    ctx.lineTo(
      width - right,
      y
    );

    ctx.stroke();

    ctx.setLineDash([]);

    ctx.fillStyle =
      "#17221f";

    ctx.font =
      "11px system-ui";

    ctx.textAlign =
      "right";

    ctx.fillText(
      fmt(last.c),
      width - right,
      Math.max(
        11,
        y - 4
      )
    );
  }

  /* Date labels */

  ctx.fillStyle =
    "#71807b";

  ctx.font =
    "9px system-ui";

  ctx.textAlign =
    "center";

  const labelIndexes = [
    0,
    Math.floor(
      visible.length / 2
    ),
    visible.length - 1
  ];

  for (const i of labelIndexes) {
    const x =
      left +
      step * i +
      step / 2;

    const d =
      new Date(
        visible[i].t
      );

    const label =
      state.tf === "1D" ||
      state.tf === "1W" ||
      state.tf === "1M"
        ? `${d.getDate()}/${d.getMonth() + 1}`
        : d.toLocaleTimeString(
            "en-PK",
            {
              hour: "2-digit",
              minute: "2-digit"
            }
          );

    ctx.fillText(
      label,
      x,
      height - 10
    );
  }
}

/* =========================================================
   RENDER
   ========================================================= */

function render(rows) {
  state.rows = rows;

  if (!rows.length) {
    setVerdict("NO TRADE");

    set(
      "updated",
      "Data update time: Data unavailable"
    );

    set(
      "volumeState",
      "—"
    );

    draw([]);

    return;
  }

  const analysis =
    analyse(rows);

  set(
    "ema9",
    fmt(analysis.e9)
  );

  set(
    "ema20",
    fmt(analysis.e20)
  );

  set(
    "ema50",
    fmt(analysis.e50)
  );

  set(
    "ema100",
    fmt(analysis.e100)
  );

  set(
    "ema200",
    fmt(analysis.e200)
  );

  const pivots =
    pivot(rows);

  [
    "p",
    "s1",
    "s2",
    "r1",
    "r2"
  ].forEach(
    (id, i) =>
      set(
        id,
        fmt(pivots[i])
      )
  );

  setVerdict(
    analysis.signal
  );

  renderIndicators(
    rows,
    analysis
  );

  set(
    "chartTitle",
    state.symbol
  );

  set(
    "chartTf",
    timeframeLabel(
      state.tf
    )
  );

  set(
    "updated",
    "Data update time: " +
    new Date().toLocaleTimeString(
      "en-PK",
      {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }
    )
  );

  draw(rows);
}

/* =========================================================
   TIMEFRAME UI
   ========================================================= */

const TIMEFRAMES = [
  ["5m", "5m"],
  ["15m", "15m"],
  ["30m", "30m"],
  ["1h", "1h"],
  ["4h", "4h"],
  ["1D", "Daily"],
  ["1W", "Weekly"],
  ["1M", "Monthly"]
];

function timeframeLabel(tf) {
  const found =
    TIMEFRAMES.find(
      x => x[0] === tf
    );

  return found
    ? found[1]
    : tf;
}

function buildTimeframes() {
  const box =
    $("timeframes");

  if (!box) return;

  box.innerHTML = "";

  TIMEFRAMES.forEach(
    ([value, label]) => {
      const btn =
        document.createElement(
          "button"
        );

      btn.type = "button";

      btn.textContent =
        label;

      btn.dataset.tf =
        value;

      btn.className =
        value === state.tf
          ? "active"
          : "";

      btn.addEventListener(
        "click",
        async () => {
          state.tf = value;

          box
            .querySelectorAll(
              "button"
            )
            .forEach(
              b =>
                b.classList.toggle(
                  "active",
                  b.dataset.tf ===
                    value
                )
            );

          set(
            "chartTf",
            timeframeLabel(
              value
            )
          );

          const rows =
            await getTimeframeRows();

          render(rows);
        }
      );

      box.appendChild(btn);
    }
  );
}

/* =========================================================
   STOCK LIST / SEARCH
   ========================================================= */

const STOCKS = [
  {
    symbol: "KSE100",
    name: "KSE 100 Index",
    sector: "Pakistan Stock Exchange"
  },
  {
    symbol: "OGDC",
    name: "Oil & Gas Development Company",
    sector: "Oil & Gas"
  },
  {
    symbol: "PPL",
    name: "Pakistan Petroleum Limited",
    sector: "Oil & Gas"
  },
  {
    symbol: "MARI",
    name: "Mari Energies",
    sector: "Oil & Gas"
  },
  {
    symbol: "SYS",
    name: "Systems Limited",
    sector: "Technology & Communication"
  },
  {
    symbol: "HBL",
    name: "Habib Bank Limited",
    sector: "Commercial Banks"
  },
  {
    symbol: "UBL",
    name: "United Bank Limited",
    sector: "Commercial Banks"
  },
  {
    symbol: "MEBL",
    name: "Meezan Bank Limited",
    sector: "Commercial Banks"
  },
  {
    symbol: "LUCK",
    name: "Lucky Cement",
    sector: "Cement"
  }
];

function buildChips() {
  const box =
    $("chips");

  if (!box) return;

  box.innerHTML = "";

  STOCKS.forEach(stock => {
    const btn =
      document.createElement(
        "button"
      );

    btn.type = "button";
    btn.textContent =
      stock.symbol;

    btn.className =
      stock.symbol === state.symbol
        ? "active"
        : "";

    btn.addEventListener(
      "click",
      () =>
        selectStock(
          stock.symbol,
          stock.name,
          stock.sector
        )
    );

    box.appendChild(btn);
  });
}

function setupSearch() {
  const input =
    $("searchInput");

  const results =
    $("searchResults");

  if (!input || !results) return;

  input.addEventListener(
    "input",
    () => {
      const q =
        input.value
          .trim()
          .toLowerCase();

      if (!q) {
        results.classList.add(
          "hidden"
        );

        results.innerHTML = "";

        return;
      }

      const matches =
        STOCKS.filter(
          x =>
            x.symbol
              .toLowerCase()
              .includes(q) ||
            x.name
              .toLowerCase()
              .includes(q)
        );

      results.innerHTML = "";

      matches.forEach(stock => {
        const item =
          document.createElement(
            "button"
          );

        item.type = "button";

        item.textContent =
          `${stock.symbol} — ${stock.name}`;

        item.addEventListener(
          "click",
          () => {
            selectStock(
              stock.symbol,
              stock.name,
              stock.sector
            );

            input.value = "";

            results.classList.add(
              "hidden"
            );
          }
        );

        results.appendChild(
          item
        );
      });

      results.classList.toggle(
        "hidden",
        !matches.length
      );
    }
  );
}

async function selectStock(
  symbol,
  name,
  sector
) {
  state.symbol =
    symbol;

  state.name =
    name || symbol;

  state.sector =
    sector || "—";

  state.daily = [];
  state.rows = [];

  set(
    "symbol",
    state.symbol
  );

  set(
    "company",
    state.name
  );

  set(
    "sector",
    state.sector
  );

  buildChips();

  await refresh();
}

/* =========================================================
   MARKET STATUS
   ========================================================= */

function updateMarketStatus() {
  const el =
    $("marketStatus");

  if (!el) return;

  const now =
    new Date();

  const day =
    now.getDay();

  const hour =
    now.getHours();

  const minute =
    now.getMinutes();

  const current =
    hour * 60 + minute;

  const open =
    9 * 60 + 30;

  const close =
    15 * 60 + 30;

  const weekday =
    day >= 1 &&
    day <= 5;

  el.textContent =
    weekday &&
    current >= open &&
    current <= close
      ? "Market Open"
      : "Market Closed";
}

/* =========================================================
   FULL REFRESH
   ========================================================= */

async function refresh() {
  if (state.loading) return;

  state.loading = true;

  try {
    set(
      "company",
      state.name
    );

    set(
      "sector",
      state.sector
    );

    await Promise.all([
      loadQuote(),
      loadDaily()
    ]);

    const rows =
      await getTimeframeRows();

    render(rows);

  } catch (_) {
    render([]);
  } finally {
    state.loading = false;
  }

  updateMarketStatus();
}

/* =========================================================
   THEME
   ========================================================= */

function setupTheme() {
  const btn =
    $("themeToggle");

  if (!btn) return;

  const saved =
    localStorage.getItem(
      "nh-psx-theme"
    );

  if (saved === "dark") {
    document.body.classList.add(
      "dark"
    );

    btn.textContent = "☀";
  }

  btn.addEventListener(
    "click",
    () => {
      const dark =
        document.body.classList.toggle(
          "dark"
        );

      localStorage.setItem(
        "nh-psx-theme",
        dark
          ? "dark"
          : "light"
      );

      btn.textContent =
        dark ? "☀" : "☾";
    }
  );
}

/* =========================================================
   PWA INSTALL
   ========================================================= */

function setupInstall() {
  const btn =
    $("installBtn");

  if (!btn) return;

  btn.hidden = true;

  window.addEventListener(
    "beforeinstallprompt",
    event => {
      event.preventDefault();

      state.installPrompt =
        event;

      btn.hidden = false;
    }
  );

  btn.addEventListener(
    "click",
    async () => {
      if (!state.installPrompt) {
        return;
      }

      try {
        await state.installPrompt.prompt();

        await state.installPrompt.userChoice;
      } catch (_) {}

      state.installPrompt =
        null;

      btn.hidden = true;
    }
  );

  window.addEventListener(
    "appinstalled",
    () => {
      state.installPrompt =
        null;

      btn.hidden = true;
    }
  );
}

/* =========================================================
   SERVICE WORKER
   ========================================================= */

function registerServiceWorker() {
  if (
    "serviceWorker" in
    navigator
  ) {
    window.addEventListener(
      "load",
      () => {
        navigator.serviceWorker
          .register("./sw.js")
          .catch(() => {});
      }
    );
  }
}

/* =========================================================
   WINDOW RESIZE
   ========================================================= */

let resizeTimer;

window.addEventListener(
  "resize",
  () => {
    clearTimeout(
      resizeTimer
    );

    resizeTimer =
      setTimeout(() => {
        draw(state.rows);
      }, 150);
  }
);

/* =========================================================
   AUTO REFRESH
   ========================================================= */

setInterval(
  () => {
    refresh();
  },
  60000
);

setInterval(
  () => {
    updateMarketStatus();
  },
  30000
);

/* =========================================================
   START
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async () => {
    set(
      "symbol",
      state.symbol
    );

    set(
      "company",
      state.name
    );

    set(
      "sector",
      state.sector
    );

    buildChips();
    buildTimeframes();
    setupSearch();
    setupTheme();
    setupInstall();
    registerServiceWorker();
    updateMarketStatus();

    await refresh();
  }
);
