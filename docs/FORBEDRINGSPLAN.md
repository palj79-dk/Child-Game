# Forbedringsplan: Lyd, grafik og øvrige optimeringer

*Version 1.0 · Status: **UDKAST – afventer godkendelse** · Intet i dette
dokument er påbegyndt.*

Dokumentet specificerer i detaljer, hvordan prototypens to midlertidige
elementer – **enheds-TTS-stemmen** og **emoji-grafikken** – opgraderes til
produktionskvalitet, samt hvilke øvrige optimeringer en gennemgang af
prototypen har afdækket. Til sidst en faseopdelt plan med beslutningspunkter.

---

## DEL 1 · LYD: Fra enheds-TTS til indtalte danske speaks

### 1.1 Problemet i dag

Prototypen bruger Web Speech API (`speechSynthesis`, `da-DK`). Det virker,
men: stemmen varierer fra enhed til enhed (nogle Android-tablets har ingen
dansk stemme overhovedet), udtalen af enkeltbogstaver og dyrelyde ("muh",
"øf øf") er upålidelig, og tempoet/prosodien er ikke børnevenlig. For en
sprog-app til 3-6-årige er lyden *selve produktet* – den skal være ens og god
på alle enheder.

### 1.2 Målarkitektur

**Alle replikker bliver forudindspillede lydfiler, der bundles i appen.**
Web Speech beholdes kun som nød-fallback for tekst, der endnu ikke har en fil.

```
audio/
  manifest.json          ← id → { fil, tekst, kategori }
  da/
    sys_velkomst.m4a
    ros_01.m4a … ros_06.m4a
    bogstav_A_navn.m4a  bogstav_A_lyd.m4a  …
    tal_1.m4a … tal_10.m4a
    spil_bogstav_instruks_A.m4a …
    …
```

- **`manifest.json`** er kontrakten mellem indhold og kode. Hver replik har
  et stabilt id, sin danske tekst (bruges til QA, fallback-TTS og senere
  genindspilning) og kategori. Koden beder aldrig om en fil, kun om et id –
  derfor kan hele stemmen udskiftes (fx TTS → rigtig indtaler) **uden én
  kodeændring**.
- **`AudioManager`** (nyt modul) erstatter `speak()`:
  - `say(id | [ids])` – afspiller én eller flere replikker i sekvens
    (fx `["spil_rim_hvad_rimer", "ord_kat"]`), promise-baseret så hint-timer
    og låse kan vente på, at talen er færdig.
  - Afbryder igangværende tale ved ny instruktion (som i dag).
  - Preloader spillets replikker ved spilstart (`<audio>`-pool eller Web
    Audio-buffere); effektlyde forbliver Web Audio-genererede.
  - Fallback-kæde: fil findes ikke → Web Speech med manifest-teksten →
    stilhed + visuel hint (appen skal fungere helt uden lyd, jf. spec §8).

### 1.3 Replik-katalog (komplet opgørelse)

Sætninger indspilles **hele** – sammenklippede enkeltord lyder hakkende.
Kun hvor kombinatorikken er lille, bruges faste helsætninger; ellers
omformuleres opgaven, så sætningen kan være fast og målordet ligge sidst.

| Kategori | Eksempler | Antal |
|---|---|---|
| System | velkomst, "vælg et spil", stjerne-jubel, "hold knappen inde" | ~8 |
| Ros | "Flot!", "Sikke godt!", "Hurra for dig!" … | 8 |
| Prøv-igen | "Prøv igen!", "Næsten! Prøv en gang til" … | 4 |
| Bogstaver | navn + lyd pr. bogstav ("A" / "a siger ah") | 25×2 = 50 |
| Tal | "en" … "ti" | 10 |
| Spil-instruktioner | 1-2 faste pr. spil ("Vendespil! Find to ens") | ~14 |
| Bogstav-jagt | "Find bogstavet …" (fast) + bogstavnavn | 1 (+genbrug) |
| Tæl med | "Hvor mange … er der?" – helsætning pr. dyr (10 dyr) | 10 |
| Farver & former | "Tryk på den {farve} {form}" – 6×5 helsætninger | 30 |
| Dyr | ubestemt form ("en ko"), flertal, dyrelyd indtalt ("muuuh!") | 10×3 = 30 |
| Dyrelyde-spil | "Hvilket dyr siger …?" – helsætning pr. dyr | 10 |
| Rim | "Hvad rimer på …?" pr. målord + alle 20 ordnavne | 10+20 = 30 |
| Spor & skriv | "Skriv tallet/bogstavet …" pr. glyf (14) + "følg prikkerne" | 15 |
| **I alt** | | **~220 replikker, ≈ 10-12 min. lyd** |

### 1.4 Produktionsmetode – tre muligheder (beslutningspunkt A)

| Metode | Kvalitet | Pris | Tid | Note |
|---|---|---|---|---|
| **A1. Kvalitets-TTS renderet til filer** (Azure Neural da-DK "Christel", Google WaveNet da-DK el. ElevenLabs) | God, ensartet | ~0-150 kr. | 1-2 dage (scriptet) | Genereres af et script fra manifestet → 100 % reproducerbart. Licens til app-brug skal bekræftes hos valgt udbyder |
| **A2. Egen indtaling** (forælder/bekendt, god mikrofon) | Personlig, varierende | 0 kr. | 3-5 dage | Kræver disciplin for ensartethed; indtalingsvejledning i §1.5 |
| **A3. Professionel dansk indtaler** (freelanceplatform/studie) | Bedst | ca. 1.500-4.000 kr. | 1-2 uger | Det rigtige til den endelige Play-udgivelse |

**Anbefaling:** A1 nu (hele pipelinen bygges og appen bliver ensartet på alle
enheder med det samme), A3 som senere udskiftning – manifestet gør skiftet
til en ren fil-udskiftning.

### 1.5 Tekniske standarder for lydfilerne

- **Master:** WAV 48 kHz mono. **Distribution:** AAC/.m4a 64 kbps mono
  (afspilles af både Android WebView og senere iOS); ~10-12 min ≈ 5-6 MB.
- Loudness-normaliseret til −16 LUFS, peak ≤ −3 dB, stilhed trimmet til
  ≤ 100 ms i begge ender (vigtigt for responsivitet).
- Roligt tempo, tydelig artikulation, glad men ikke overgearet tone; samme
  mikrofon/afstand/rum for alle optagelser.
- Batch-behandling scriptes (ffmpeg): normalisering, trim, konvertering –
  så en genindspilning aldrig kræver manuelt lydarbejde.
- QA: script tjekker at alle manifest-id'er har en fil (og omvendt);
  gennemlytningstjekliste; til sidst forståelsestest med et barn.

---

## DEL 2 · GRAFIK: Fra emoji til egen SVG-grafik

### 2.1 Problemet i dag

Emoji renderes af enhedens font: udseendet varierer voldsomt mellem enheder,
nogle glyffer mangler på ældre Android (fx 🧌 trold, 🪣 spand), farvestilen er
usammenhængende, og skygge-spillets silhuetter (CSS-filter på emoji) kan give
utydelige omrids. Derudover er bogstav-/talkort ren systemfont, som ikke
følger dansk skoletypografi.

### 2.2 To-trins strategi (beslutningspunkt B)

**Trin 1 – Bundlede Twemoji-SVG'er (hurtig gevinst, 3-4 dage):**
Twemoji er open source (CC-BY 4.0, kræver kun kreditering i
forældre-sektionen) og findes som enkeltstående SVG-filer. De ~45 emoji,
appen bruger, bundles som lokale SVG'er og indsættes via et centralt
`icon(navn)`-hjælpekald. Gevinst: **identisk udseende på alle enheder**,
ingen manglende glyffer, skarpe silhuetter – uden at vente på egen grafik.

**Trin 2 – Egen illustrationsstil (2-3 uger, kan ligge efter lancering):**
Egne illustrationer erstatter Twemoji gradvist, kategori for kategori
(dyr først – de bærer mest identitet). Fordi alt går gennem `icon()`-laget,
kan udskiftningen ske løbende.

### 2.3 Stilguide for egen grafik (trin 2)

- **Stil:** flad "papirklip"-look med blød, tyk kontur (4-6 enheder ved
  viewBox 100), afrundede hjørner, enkle glade ansigter på dyr og maskot.
  Ingen gradienter/skygger (holder filstørrelse og stil-ensartethed).
- **Palette:** genbruger spillets 6 opgavefarver + 3 neutrale (fløde, brun,
  grå) + maskotfarve. Defineres som CSS-variabler; SVG'er bruger
  `currentColor`/klasser, hvor det giver mening.
- **Maskot "Ravnen Rikke":** 5 poser – velkomst (vinker), peger (hint),
  jubler (stjerne), trøster (forkert svar), tænker. Placeres fast nederst
  i hjørnet af spilskærmen.
- **Format:** alle assets normaliseret til `viewBox="0 0 100 100"`, samlet i
  ét inline SVG-spritesheet (`<symbol id>` + `<use>`), optimeret med SVGO.
  Budget: **< 300 KB samlet**.
- **Silhuetter** genereres fortsat automatisk (CSS-filter på SVG'en) – ingen
  ekstra assets.
- **Typografi til bogstav-/talkort:** børnevenlig rund skrift med
  enkelt-etages a og g som i dansk skoleundervisning (fx Andika eller
  ABeeZee, SIL OFL-licens). Subsettet WOFF2 (A-Å + 0-9) bundles, ~15 KB.
  Sporebanerne i Spor & skriv efterjusteres, så de matcher skriftens former.

### 2.4 Asset-liste (trin 2)

| Kategori | Antal | Note |
|---|---|---|
| Dyr | 10 | ko, får, gris, hest, høne, and, hund, kat, frø, bi |
| Ting (skygge/rim) | ~20 | æble, træ, bil, hat, hus, sko, is, stol, spand … |
| Maskot-poser | 5 | se §2.3 |
| UI-ikoner | ~10 | hjem, højttaler, tandhjul, stjerne, dots, konfetti-bidder |
| Former | 0 | genereres allerede som SVG-kode ✓ |
| **I alt** | **~45** | |

Produktion: egen tegning i Figma/Inkscape efter stilguiden, evt. med købt
illustratør til dyrene (typisk 200-500 kr./stk. hos freelancere) –
beslutning kan udskydes til trin 2 går i gang.

---

## DEL 3 · Øvrige optimeringer (fra kodegennemgang af prototypen)

### 3.1 Spiloplevelse og pædagogik

| # | Fund | Forbedring | Prioritet |
|---|---|---|---|
| O1 | Samme opgave kan trækkes to gange i træk (ren `pick()`) | Anti-gentagelses-buffer: husk de sidste 2-3 mål pr. spil og træk om | Høj |
| O2 | Sværhedsgrad styres kun af samlede stjerner og kan aldrig falde | Adaptiv styring: glidende vindue over de sidste 10 svar; > ca. 40 % fejl → trin ned, høj succes → trin op; manuel låsning i forældremenu | Høj |
| O3 | Spor & skriv: hurtige fingre kan springe en prik over og sidde fast (hit-test kun på punkter) | Segment-baseret hit-test: tjek linjestykket fra forrige til aktuel position mod næste prik | Høj |
| O4 | Instruktion gentages kun ved tryk på 🔊 | Automatisk venlig gentagelse af instruktionen efter ~10 s inaktivitet (sammen med eksisterende puls-hint) | Mellem |
| O5 | Rim: distraktorer tjekkes ikke for utilsigtede rim på tværs af par (fx ord i samme rim-familie) | Definér rim-familier i data; distraktor-udvælgelse udelukker målordets familie; lingvistisk QA af alle kombinationer | Mellem |
| O6 | Vendespil giver fuld runde-progression, men taleoverlap ved hurtig vending | Tale-kø i AudioManager løser det (Del 1) | Lav |
| O7 | Tæl med: op til 10 ens dyr på én linje kan ombrydes grimt | Grid-layout med faste pladser (fx 2×5), så mængden er let at afkode | Mellem |

### 3.2 Robusthed og kodekvalitet

| # | Fund | Forbedring | Prioritet |
|---|---|---|---|
| R1 | `localStorage` uden fejlhåndtering (kan kaste i inkognito/fuld disk) | try/catch + in-memory-fallback; versioneret skema `{ v: 1, … }` med migrering | Høj |
| R2 | Al kode i én fil – fint til prototype, men svært at teste | Split i ES-moduler (motor, spil, audio, lager, UI); esbuild bundler til én fil ved release, så "én HTML-fil"-egenskaben bevares | Høj |
| R3 | Ingen automatiske tests i repoet | Flyt Playwright-smoketesten ind i `test/`; tilføj rene logik-tests (opgavegeneratorer: ingen dubletter i svarmuligheder, korrekt niveau-pool, rim-familie-regler) + GitHub Actions CI | Høj |
| R4 | Web Speech-stemmelisten indlæses asynkront; første replik kan få forkert stemme | Irrelevant efter Del 1 (filer); indtil da: afvent `voiceschanged` før første `speak` | Lav |
| R5 | `// @ts-check` mangler | JSDoc-typer + ts-check i CI fanger fejl uden TypeScript-migrering | Mellem |

### 3.3 Tilgængelighed og enheder

| # | Fund | Forbedring | Prioritet |
|---|---|---|---|
| T1 | Konfetti/puls tager ikke hensyn til `prefers-reduced-motion` | Respektér media queryen: dæmpede animationer | Mellem |
| T2 | Kontrast på gule stjerne-elementer mod hvid er lav | WCAG AA-gennemgang af paletten (mørkere kant om gule elementer) | Mellem |
| T3 | Ingen fuldskærm/orienteringsstyring | Browser: Fullscreen API bag forældre-gate. Capacitor (fase 2 i PLAN.md): immersive mode + landscape-lås i native config | Mellem |
| T4 | Langt tryk kan markere/åbne kontekstmenu på nogle enheder | `contextmenu`-preventDefault + `-webkit-touch-callout: none` | Lav |

### 3.4 Klargøring til udgivelse (uændret fra PLAN.md, medtaget for helhed)

- PWA-manifest + ikonsæt (genbruges direkte som Capacitor-ikoner).
- Versionsnummer + Twemoji/font-kreditering i forældre-sektionen.
- Privatlivspolitik-tekst (dansk/engelsk).

---

## DEL 4 · Faseopdelt plan (afventer godkendelse)

Rækkefølgen er valgt så fundamentet (moduler + tests) lægges, før indholdet
(lyd/grafik) bygges ovenpå – det gør lyd- og grafikarbejdet sikkert at rulle
ind. Estimater er kalendertid på deltid.

| Fase | Indhold | Estimat | Leverance |
|---|---|---|---|
| **F1. Fundament** | R1, R2, R3, R5: moduler, esbuild, logik-tests, Playwright i CI | ~1 uge | Samme app, testbar kodebase, grønt CI |
| **F2. Lyd-pipeline** | Manifest (~220 replikker), AudioManager med kø/preload/fallback, genererings- og QA-scripts, TTS-renderede filer (beslutning A) | ~1 uge | Ens dansk tale på alle enheder |
| **F3. Grafik trin 1** | Twemoji-SVG-bundling bag `icon()`-lag, skolefont på bogstav/tal-kort, justerede sporebaner, UI-ikoner | ~3-4 dage | Identisk grafik på alle enheder |
| **F4. Spil-optimeringer** | O1-O5, O7 + T1-T4 | ~1 uge | Bedre spiloplevelse og tilgængelighed |
| **F5. Grafik trin 2** | Egen illustrationsstil + maskot jf. stilguide (beslutning om illustratør) | 2-3 uger | Egen visuel identitet – **kan ligge efter første Play-udgivelse** |
| **F6. Indtaler** | Professionel dansk indtaling erstatter TTS-filerne (ren filudskiftning via manifestet) | 1-2 uger | Endelig stemme – kan også ligge efter første udgivelse |

Efter F4 er appen teknisk klar til Capacitor-pakning og Play-forløbet i
`PLAN.md` (fase 2-4); F5/F6 kan køre parallelt med eller efter udgivelsen.

### Beslutningspunkter til godkendelse

1. **A: Lydproduktion** – anbefalet: TTS-renderede filer nu (A1),
   professionel indtaler senere (A3). Alternativ: egen indtaling (A2).
2. **B: Grafikstrategi** – anbefalet: Twemoji-bundling nu (trin 1), egen
   illustrationsstil som trin 2 efter/omkring lancering.
3. **Rækkefølgen F1-F6** – herunder om F5/F6 må ligge efter første
   Play-udgivelse.
4. **Budgetramme** for evt. illustrator (F5) og indtaler (F6) – kan begge
   holdes på 0 kr. med hhv. egen tegning og TTS, hvis det ønskes.
