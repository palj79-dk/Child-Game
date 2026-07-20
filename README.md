# Leg & Lær – dansk læringsspil for 3-6-årige

Et samlet læringsspil med 8 danske minispil, bygget i ren HTML/CSS/JavaScript
(ES-moduler, ingen frameworks) med henblik på udgivelse på Google Play via
Capacitor. **Offline, reklamefrit, uden dataindsamling.**

> Fuld baggrund, pædagogik og markedsundersøgelse ligger i [`docs/`](docs/)
> (`SPECIFIKATION.md`, `PLAN.md`, `IMPLEMENTERINGSPLAN.md`, `FORBEDRINGSPLAN.md`,
> `HANDOFF.md`).

## De 8 minispil

🔤 Bogstav-jagt · 🔢 Tæl med · 🔺 Farver & former · 🃏 Vendespil ·
👤 Skygge-leg · 🐄 Dyrelyde · 🎵 Rim-tid · ✏️ Spor & skriv

## Kom i gang

```bash
npm install          # esbuild, playwright-core, typescript, @types/node
npm test             # rene logik-tests (Node, ingen browser)
npm run typecheck    # JSDoc + ts-check
npm run build        # samler til én HTML-fil: build/laeringsspil.html
npm run smoke        # Playwright-røgtest af den byggede app
```

Åbn `build/laeringsspil.html` i Chrome (gerne tablet, liggende). Under udvikling
kan `src/index.html` også åbnes via en lokal server.

## Projektstruktur

```
src/
  index.html      HTML-skal (build inliner CSS + JS + sprites)
  styles.css      al styling
  main.js         indgang – wirer UI'en op
  engine.js       spilmotor (runde, fremdrift, svar, fest)
  store.js        localStorage m/ fejlhåndtering + versioneret skema (R1)
  speech.js       Web Speech-fallback  ·  sfx.js  Web Audio-effektlyde
  data.js         alt dansk indhold (bogstaver, dyr, farver, rim, glyffer …)
  games/          ét modul pr. minispil + index.js (GAMES)
tools/
  build.mjs       esbuild-bundler → build/laeringsspil.html
  check_audio.mjs QA: manifest ↔ lydfiler
  render_audio.py Piper-TTS-render (I4)
test/
  logic.test.mjs  invarianter i opgave-generatorerne
  smoke.mjs       Playwright-gennemspilning
```

Hvert spil eksponerer en **ren `gen(level)`-funktion** (returnerer opgavedata uden
at røre DOM) som logik-testene kan verificere, plus en `task()` der bygger scenen.

## Status

Se [`PROGRESS.md`](PROGRESS.md) for fase-for-fase-status (I1–I6).
