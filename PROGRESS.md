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
| **I6 Play-klargøring** | PWA-manifest, ikoner, kreditering, privatlivspolitik | ✅ færdig |

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
- **Opdatering:** de 8 kategori-ikoner på forsidens spil-kort er nu også tegnet
  som egen SVG (`spil-bogstav`, `spil-tal`, `spil-form`, `spil-memory`,
  `spil-skygge`, `spil-dyr`, `spil-rim`, `spil-spor`) – forsiden er dermed 100 %
  egen grafik uden emoji. I alt ~56 symboler i spritesheetet.

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

## Rolig tilstand (lavarousal, tilføjet efter I6)

For at barnet kan **fokusere på opgaven frem for at blive overstimuleret af
farve- og lyseffekter** – uden at UI'et bliver kedeligt – er der tilføjet en
**"Rolig tilstand"** i forældremenuen (**slået til som standard**):

- **Ingen konfetti**; stjernen **toner blidt ind** i stedet for at poppe.
- **Blød to-tone "pling"** i stedet for den 5-tonede fanfare.
- Forkert svar giver en **rolig rød kant-markering** i stedet for at ryste.
- Langsommere, blødere puls-hint.

Farver, stjerner og verbal ros bevares, så feedbacken stadig er positiv og
levende. Opgaveskærmen var i forvejen lavarousal (rolig pastelbaggrund, ét
element i fokus, store trykflader). Kan slås fra af en forælder for en mere
livlig fejring, og `prefers-reduced-motion` respekteres fortsat uafhængigt.
Standardværdien sættes ét sted (`store.calm` i `src/store.js`).

## I6 – Play-klargøring (færdig)

- **PWA-manifest** (`src/manifest.webmanifest`): navn, landscape, standalone,
  tema-/baggrundsfarve, kategorier (education/kids/games).
- **App-ikoner** genereret fra egen SVG (`tools/gen_icons.mjs` → Chromium-render):
  192, 512 og maskable-512 + favicon. Maskotten "Ravnen Rikke" på blå baggrund.
  Genbruges som Capacitor-ikoner.
- **Service worker** (`src/sw.js`): cacher app-skallen så PWA-udgaven virker
  offline; registreres kun over http(s) (ikke `file://`).
- **Build** kopierer nu manifest + sw.js + `icons/` ved siden af bundlen og
  skriver også `build/index.html` (så `start_url:"."` virker).
- **Privatlivspolitik** på dansk og engelsk (`docs/privatlivspolitik.md`,
  `docs/privacy-policy.md`): “indsamler ingen data”, klar til Play Console.
- **Kreditering** (`CREDITS.md`): ABeeZee (OFL), Piper (MIT), egen SVG, esbuild,
  Playwright, fontTools, lameenc.
- **I appen:** ny “Om & privatliv”-skærm bag forældre-gaten med resumé af
  privatliv + kreditering.
- **Capacitor-guide** (`docs/CAPACITOR.md`): præcise trin til AAB + Play Console
  (fase 2-3 i `PLAN.md`).

Appen er hermed teknisk klar til Capacitor-pakning og Google Play-forløbet.

## Feedback-runde (efter test på mobil)

**Mobil/portræt-layout (fixet):** svar-kort fik faste responsive størrelser og
nye portræt-media-queries, så alle spil nu fylder inden for en høj, smal skærm
(var: kort på ~300px der flød ud over skærmen og blev klippet). Landscape uændret.

**Byg-fejl (fundet + fixet):** `build.mjs` brugte `String.replace` med bundlen som
*erstatnings-streng*, hvormed `$`-mønstre ($&, $\`) blev fortolket og kunne lukke
`<script>` for tidligt (hele JS-kilden blev vist som tekst på siden). Skiftet til
funktions-replacers – permanent løst.

**TTS-kvalitet (forbedret, men ærligt: gratis TTS-loft):** kun `da_DK-talesyntese-medium`
findes for dansk (ingen high-model). Forbedringer: rigtige **danske bogstavnavne**
("bæ", "sæ", "æm" i stedet for det bare bogstav), fjernet "..." fra dyrelyd/rim-tekster,
og re-renderet med **roligere tempo** (length-scale 1.12) og renere udtale
(noise-scale 0.5). En professionel indtaler kan lægges ind senere som ren
filudskiftning via manifestet – uden kodeændring.

**Rolle-vælger + QC play-log (bygget):**
- Ved første start vælges rolle: **Barn / Voksen / QC-tester** (huskes; kan ændres
  under Forældre → "Skift rolle"). Barnet mødes kun af den ene skærm én gang.
- **QC-tester** aktiverer en **play-log** (knap nederst til venstre): en tidsstemplet,
  læsbar liste over hvordan spillet forløber (spil-start, opgave + prompt, rigtigt/
  forkert, niveau-ændring, stjerne, hjem). **100 % lokal** (kun på enheden, intet
  sendes) – i tråd med nul-dataindsamling. Kan kopieres og ryddes.
- 16 logik-tests grønne (inkl. rolle/QC + play-log), typecheck + røgtest grønt.
