# Fremdrift – implementeringsplan I1–I6

Følger `docs/IMPLEMENTERINGSPLAN.md` §D. Hver fase afsluttes med commit +
verifikation (logik-tests + Playwright-røgtest) og et eksporteret snapshot.

| Fase | Indhold | Status |
|---|---|---|
| **I1 Fundament** | ES-moduler, esbuild-bundle, R1 (localStorage), R3 (logik-tests + Playwright + CI), R5 (JSDoc/ts-check) | ✅ færdig |
| **I2 Grafik** | ~48 egne SVG i spritesheet, `icon()`-lag, skolefont, emoji erstattet | ✅ færdig |
| **I3 Lyd-kode** | `audio/manifest.json`, AudioManager (kø/preload/fallback), integration, QA | ✅ færdig |
| **I4 Lyd-render** | Piper TTS → `.mp3` (HuggingFace) | ✅ færdig |
| **I5 Optimeringer** | O1–O7, T1–T4 | ✅ færdig |
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

## I4 – Lyd-render (færdig)

- **Piper TTS** (gratis, neural dansk stemme `da_DK-talesyntese-medium`) hentet
  fra HuggingFace (61 MB model, engangs-download til byg – appen forbliver
  offline). Netadgangen fra det nye miljø virker (HTTP 200).
- **`tools/render_audio.py`** renderer alle 202 replikker: tekst → Piper → WAV →
  trim stilhed → peak-normalisér → **MP3 64 kbps mono** (via `lameenc`, så
  ingen fuld ffmpeg kræves). Idempotent (`--force`, `--only`). Resultat:
  **202 filer, 1,9 MB** i `audio/da/`.
- **`tools/embed_audio.mjs`** indlejrer filerne som base64 data-URI'er i
  `src/audio-data.generated.js`, så den byggede HTML er **én selvstændig fil
  med lyd** (virker fra `file://`, ingen fetch). AudioManager afspiller nu
  filerne; Web Speech er kun fallback.
- Verificeret: Chromium afkoder og afspiller en indlejret MP3 (1,99 s, `ended`
  fyrer rent); `check-audio` = 202/202 konsistent; build **2,6 MB**; tests +
  typecheck + røgtest grønt.
- *Kvalitet:* Piper-dansk er markant bedre og ens på alle enheder end enheds-TTS.
  En professionel indtaler kan senere lægges ind som ren filudskiftning (kør
  `render_audio.py` erstattes af nye filer + `embed_audio.mjs`) uden kodeændring.

## I5 – Optimeringer (færdig)

Spiloplevelse:
- **O1** anti-gentagelses-buffer (`src/anti_repeat.js`, `fresh()`): samme opgave
  kommer ikke to gange i træk – aktiv i alle 7 valg-baserede spil.
- **O2** adaptiv sværhedsgrad: glidende vindue over de sidste 10 opgaver pr. spil
  i `store` (>40 % fejl → trin ned; høj succes → trin op), med **forældre-lås**
  i indstillinger. `engine.level()` bruger nu det adaptive niveau.
- **O3** segment-baseret hit-test i Spor & skriv: afstand fra prik til
  linjestykket (forrige→aktuelle finger), så hurtige fingre ikke sidder fast.
- **O4** automatisk venlig gentagelse af instruktionen efter ~11 s inaktivitet
  (sammen med puls-hintet efter 6 s).
- **O5** rim-familie-regel: distraktorer deler aldrig rim-familie med målordet
  (nyt `fam`-felt i data + test).
- **O6** taleoverlap i vendespil: løst af AudioManager-køen (I3).
- **O7** fast gitter i Tæl med (5 kolonner) – mængden er let at afkode.

Tilgængelighed:
- **T1** `prefers-reduced-motion`: dæmpede animationer, konfetti slås fra.
- **T2** WCAG-kontrast: mørkere guld på stjerner/fremdrift, mørkere gul opgavefarve,
  form altid som medsignal (aldrig kun farve).
- **T3** fuldskærm + landscape-lås bag forældre-gaten (Capacitor låser natively i
  fase 2).
- **T4** langt-tryk: `contextmenu` forhindret + `-webkit-touch-callout:none`.

14 logik-tests grønne (inkl. O1/O2/O5), typecheck + røgtest grønt.
