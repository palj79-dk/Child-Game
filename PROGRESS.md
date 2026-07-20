# Fremdrift – implementeringsplan I1–I6

Følger `docs/IMPLEMENTERINGSPLAN.md` §D. Hver fase afsluttes med commit +
verifikation (logik-tests + Playwright-røgtest) og et eksporteret snapshot.

| Fase | Indhold | Status |
|---|---|---|
| **I1 Fundament** | ES-moduler, esbuild-bundle, R1 (localStorage), R3 (logik-tests + Playwright + CI), R5 (JSDoc/ts-check) | ✅ færdig |
| **I2 Grafik** | ~48 egne SVG i spritesheet, `icon()`-lag, skolefont, emoji erstattet | ✅ færdig |
| **I3 Lyd-kode** | `audio/manifest.json`, AudioManager (kø/preload/fallback), integration, QA | ✅ færdig |
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

## I2 – Grafik (færdig)

- **~48 egne SVG** tegnet fra bunden i flad "papirklip"-stil og samlet i ét
  inline `<symbol>`-spritesheet (`assets/sprites.svg`): 11 dyr, 27 ting, 5
  maskot-poser ("Ravnen Rikke"), 5 UI-ikoner.
- **`icon()`-lag** (`src/icon.js`): koden beder om et symbol-navn, ikke en fil;
  `build.mjs` inliner spritesheetet i den byggede HTML. Alle spil-emoji er
  erstattet (dyr, ting, rim, vendespil, skygge, hjem/højttaler/tandhjul/stjerne,
  maskot-logo).
- **Skygge-spillet** danner fortsat silhuetter automatisk via CSS-filter på
  SVG'en – verificeret: bilens skygge matcher bil-ikonet.
- **Skolefont:** ABeeZee (SIL OFL 1.1, enkelt-etages *a* som i dansk skoleskrift)
  hentet fra GitHub, subsettet til A-Å + 0-9 + tegnsætning (4,3 KB WOFF2),
  indlejret som base64 og lagt på bogstav-/talkortene. Licens gemt i
  `assets/font/OFL-ABeeZee.txt` (krediteres i I6).
- Verificeret med skærmbilleder af alle 8 spil + forside; build 52 KB, ingen
  konsolfejl, alle 10 logik-tests + typecheck + røgtest grønt.
- *Note:* de 8 kategori-ikoner på forsidens spil-kort er stadig emoji (indgik
  ikke i asset-listen på ~45) – kan tegnes som grafik-trin-2-polish senere.

## I3 – Lyd-kode (færdig)

- **`audio/manifest.json`** (kontrakten) genereres af `tools/gen_manifest.mjs`
  ud fra spildata → **202 replikker** i 11 kategorier (system, ros, prøv, bogstav
  navn+lyd, tal, instruks, tæl-helsætninger, 30 farve/form-sætninger, dyr
  ubest/flertal/lyd, dyrelyd-spørgsmål, rim, spor). Hvert id har `{ fil, tekst,
  kategori }`. Teksten indlejres også i bundlen (`src/audio-manifest.generated.js`)
  til fallback.
- **Stabile id'er** (`src/audio-ids.js`) deles mellem spillene og generatoren –
  koden beder om et *id*, aldrig en fil, så stemmen kan udskiftes uden kodeændring.
- **AudioManager** (`src/audio.js`): `say(id | [ids])` er promise-baseret med kø,
  afbryder igangværende tale, forudindlæser, og har fallback-kæden **fil → Web
  Speech på manifest-teksten → stilhed** (appen fungerer helt uden lyd).
- **Integration:** alle 8 spil + motor + UI kalder nu `audio.say(id)` i stedet for
  `speak(tekst)`. Effektlyde forbliver Web Audio.
- **QA:** `tools/check_audio.mjs` validerer manifest ↔ filer; ny logik-test sikrer
  at *hvert* id spillene beder om findes i manifestet (11 tests grønne).
- Lyden kører på Web Speech-fallback indtil filerne renderes i **I4**.
