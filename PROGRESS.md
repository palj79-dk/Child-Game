# Fremdrift – implementeringsplan I1–I6

Følger `docs/IMPLEMENTERINGSPLAN.md` §D. Hver fase afsluttes med commit +
verifikation (logik-tests + Playwright-røgtest) og et eksporteret snapshot.

| Fase | Indhold | Status |
|---|---|---|
| **I1 Fundament** | ES-moduler, esbuild-bundle, R1 (localStorage), R3 (logik-tests + Playwright + CI), R5 (JSDoc/ts-check) | ✅ færdig |
| **I2 Grafik** | ~45 egne SVG i spritesheet, `icon()`-lag, skolefont, emoji erstattet | ⏳ |
| **I3 Lyd-kode** | `audio/manifest.json`, AudioManager (kø/preload/fallback), integration, QA | ⏳ |
| **I4 Lyd-render** | Piper TTS → `.m4a` (HuggingFace) | ⏳ |
| **I5 Optimeringer** | O1–O7, T1–T4 | ⏳ |
| **I6 Play-klargøring** | PWA-manifest, ikoner, kreditering, privatlivspolitik | ⏳ |

## I1 – Fundament (færdig)

- Prototypen (én HTML-fil) splittet i ES-moduler: `engine`, `store`, `speech`,
  `sfx`, `data`, `ui`, `main` + ét modul pr. minispil under `src/games/`.
- **R1:** `store.js` bruger try/catch + in-memory-fallback og versioneret skema
  `{ v: 1, … }` med migreringskrog.
- **R2:** `tools/build.mjs` (esbuild) samler alt tilbage til én selvstændig
  `build/laeringsspil.html` (24,8 KB) – "én HTML-fil"-egenskaben bevaret.
- **R3:** 10 logik-tests (`node --test`) over de rene `gen()`-generatorer +
  Playwright-røgtest (`test/smoke.mjs`) + GitHub Actions CI (`.github/workflows/ci.yml`).
- **R5:** `// @ts-check` + JSDoc i alle moduler; `npm run typecheck` grønt.
- Verificeret: build + røgtest grøn, og en fuld runde af Bogstav-jagt spilles
  igennem uden konsolfejl (3 korrekte svar → 3 fremdriftsprikker).

Funktionaliteten er **uændret** ift. prototypen – kun arkitektur, robusthed og
test er lagt til. Grafik (emoji) og lyd (enheds-TTS) opgraderes i I2–I4.
