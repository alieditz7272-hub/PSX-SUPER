# NH PSX SUPER ANALYSIS
## MASTER WORKFLOW — FINAL

This is the locked specification for the NH PSX Super Analysis PWA.

- Fresh mobile-first PWA named NH PSX Super Analysis.
- Header: NH-PSX, Super Analysis, Developed by Nadeem Hassan, WhatsApp 03009412177, Pakistan clock, market status, update time.
- Only a dark/light theme toggle in the top-right. No hamburger or four-square menu.
- Search by PSX symbol/company name; show selected company and sector.
- Quote: Open, High, Low, Close, Previous Day Close, change amount/percentage, market status.
- Verdicts only: BUY, SELL, NO TRADE.
- BUY = green; SELL = red; NO TRADE = orange everywhere relevant.
- BUY message: “Trend is Up • Pullback can be a buying opportunity.”
- SELL message: “Trend is Down • Bounce Back is a Sell Opportunity.”
- NO TRADE message: “Wait Please • No Clear Direction.”
- Timeframes: 5m, 15m, 30m, 1h, 4h, Daily, Weekly, Monthly.
- EMA: 9 green, 20 red, 50 white, 100 sky blue, 200 orange.
- Pivot: P, S1, S2, R1, R2.
- Candlestick chart with volume and EMA overlays.
- Volume versus 22-session average: green up arrow / red down arrow / yellow --.
- Compact indicator cards: Intraday, Short Term, Swing, RSI, MACD, Volume.
- Interface must not expose source names, API names, formulas, backend details, technical settings or debug information.
- Installable PWA with manifest, service worker and app icon.
- GitHub Pages compatible; no Netlify, Firebase, Gemini or admin/login dependency.
- No fake/random market data. Unavailable data must be shown as unavailable.
- Full mobile width, vertical flow, no horizontal overflow.
- Final package must pass HTML/CSS/JS, manifest, service-worker and ZIP integrity checks.

### ADMIN
- NO Admin section.
- NO login system.
- NO username/password requirement.
- NO server-side user database.
