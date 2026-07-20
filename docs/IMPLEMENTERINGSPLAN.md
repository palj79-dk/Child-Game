# Implementeringsplan — 0 kr., udført af Claude Code

*Version 1.0 · Status: **UDKAST – afventer godkendelse** · Intet er påbegyndt.*

Denne plan omsætter `FORBEDRINGSPLAN.md` til en konkret arbejdsgang, hvor **alt
arbejde udføres af Claude Code (AI)** og **den samlede kontantudgift er 0 kr.**
De to elementer der normalt koster penge — indtalt stemme og professionel
grafik — løses med gratis, AI-drevne metoder:

- **Grafik:** Claude *tegner selv* al SVG-grafik. Ingen download, ingen
  licenskøb, ingen illustrator — og resultatet er on-brand fra dag 1.
- **Lyd:** **Piper TTS** (gratis, MIT-licens, dansk neural stemme) renderet til
  lydfiler af et Claude-skrevet script. Ingen abonnement, ingen indtaler.

Alle kodeændringer, tests, scripts og QA laver Claude Code.

---

## 0 · Feasibility — verificeret i dette miljø (20. juli 2026)

| Byggesten | Status | Konsekvens |
|---|---|---|
| Python 3.11 + pip (pypi tilladt) | ✅ | Piper og hjælpescripts kan installeres |
| `piper-tts` på pypi (1.5.0) | ✅ | Gratis dansk neural TTS |
| Node 22 | ✅ | esbuild-bundling, testrunner |
| `ffmpeg` via Playwright-binær (`/opt/pw-browsers/ffmpeg-1011/ffmpeg-linux`, n7.0.1) | ✅ | Normalisering/trim/AAC-konvertering af lyd |
| Playwright + Chromium | ✅ | Automatisk verifikation af hvert trin |
| Claude tegner SVG | ✅ | Grafik uden download/licens |
| `huggingface.co`, `github.com` | ⛔ 403 (blokeret af netpolitik) | **Pipers stemmemodel kan ikke hentes her nu** → se beslutning §B.3 |
| `raw.githubusercontent.com` | ✅ 200 | Delvis kanal, men modellen ligger ikke her |

**Eneste reelle forhindring:** selve TTS-*modelfilen* (~40-60 MB) hostes på
HuggingFace, som miljøets netværkspolitik pt. blokerer. Alt andet kan Claude
Code gøre direkte. Løsningen er ét simpelt valg (§B.3) — begge muligheder er
0 kr.

---

## Del A · Grafik — Claude-tegnet SVG (0 kr., ingen download)

Fravalg af Twemoji: Twemoji skulle stadig hentes fra et CDN (blokeret her) og
giver ikke egen identitet. Når Claude alligevel kan tegne SVG, springer vi
direkte til **egen grafik** — gratis, netuafhængig og unik.

### A.1 Metode
- Claude skriver hver illustration som håndlavet SVG efter en fast stilguide,
  normaliseret til `viewBox="0 0 100 100"`.
- Alt samles i ét inline **`<symbol>`-spritesheet**; koden bruger
  `<use href="#dyr-ko">` via et centralt `icon(navn)`-lag (samme
  abstraktion som audio-manifestet — så en enkelt asset kan forbedres uden
  at røre spillene).
- Optimeres med SVGO (npm, tilladt). Budget < 300 KB samlet.

### A.2 Stilguide (som i FORBEDRINGSPLAN §2.3)
Flad "papirklip"-stil: tyk blød kontur, afrundede hjørner, simple glade
ansigter, ingen gradienter. Palette = spillets 6 opgavefarver + fløde/brun/grå
+ maskotfarve, defineret som CSS-variabler.

### A.3 Asset-liste (~45, tegnes af Claude)
| Gruppe | Antal | Indhold |
|---|---|---|
| Dyr | 10 | ko, får, gris, hest, høne, and, hund, kat, frø, bi |
| Ting (skygge/rim) | ~20 | æble, træ, bil, hat, hus, sko, is, stol, spand, bold, trold … |
| Maskot "Ravnen Rikke" | 5 poser | vinker, peger, jubler, trøster, tænker |
| UI-ikoner | ~10 | hjem, højttaler, tandhjul, stjerne, prik, konfetti |
| Skolefont | 1 | børnevenlig WOFF2 (Andika/ABeeZee, SIL OFL — gratis) til bogstav/tal-kort; subsettes til A-Å + 0-9 (~15 KB) |

### A.4 Kvalitetssikring
- Efter hver assetgruppe: render i Playwright, screenshot, visuel
  egenkontrol (genkendelighed, ensartethed, silhuet-læsbarhed i skygge-spil).
- Farveblind-/kontrasttjek (WCAG AA) på farver + former (form er altid
  medsignal, aldrig kun farve).
- **Fallback pr. asset:** hvis en illustration ikke når genkendelighed,
  markeres den i en liste og forsøges igen — koden fungerer imens med et
  simpelt reserve-symbol.

### A.5 Leverance
`assets/sprites.svg`, `assets/icon.js` (icon-lag), skolefont-WOFF2, og
opdaterede spil der henter grafik via `icon()`.

---

## Del B · Lyd — Piper TTS-pipeline (0 kr., AI-renderet)

Målet fra FORBEDRINGSPLAN §1 er uændret: **alle replikker bliver
forudindspillede filer**, styret af et `manifest.json`, så stemmen kan
udskiftes uden kodeændring. Her er det bare Piper (gratis) i stedet for betalt
TTS eller indtaler.

### B.1 Hvad Claude bygger (netuafhængigt, kan gøres her og nu)
1. **`audio/manifest.json`** — ~220 replik-id'er med dansk tekst + kategori
   (fuldt katalog i FORBEDRINGSPLAN §1.3). Claude skriver det.
2. **`tools/render_audio.py`** — læser manifestet, kalder Piper pr. replik,
   kører ffmpeg (normaliser −16 LUFS, trim stilhed, → 64 kbps mono .m4a),
   og validerer at hvert id har en fil. Idempotent og reproducerbart.
3. **`AudioManager`-modul** — `say(id | [ids])` promise-baseret med kø,
   preload pr. spil, og fallback-kæde (fil → Web Speech på manifest-teksten →
   stilhed + visuel hint). Effektlyde forbliver Web Audio-genererede.
4. **Integration** — erstat `speak(tekst)` med `audio.say(id)` i alle 8 spil.
5. **QA-script** — manifest ↔ filer-konsistens; Playwright kører app med lyd
   forudindlæst og bekræfter at hvert spil kalder gyldige id'er.

Punkt 1-5 kræver **ingen** netadgang og kan laves med det samme. Kun selve
kørslen af Piper (punkt B.2) kræver modellen.

### B.2 Rendering med Piper
- `pip install piper-tts` (pypi ✅).
- Dansk stemme: `da_DK` neural voice fra Piper-voices (medium-kvalitet).
- Script kører Piper på manifest-teksterne → WAV → ffmpeg → .m4a.
- Resultat: ~10-12 min. lyd, ~5-6 MB, ens på alle enheder.

### B.3 ⚠️ Beslutning: hvor hentes/renderes modellen (begge 0 kr.)
Pipers danske model ligger på HuggingFace, som **dette** miljøs netpolitik
blokerer. Derfor ét valg:

- **B.3-a (anbefalet) — Åbn netpolitikken for byg-sessionen.**
  Tillad `huggingface.co` (og evt. `github.com`) i miljøets netværkspolitik,
  så henter og renderer Claude *alt* her: manifest → Piper → .m4a → integreret
  → verificeret. Du får en færdig app-mappe uden at røre noget selv.
  (Se docs om netværkspolitik: https://code.claude.com/docs/en/claude-code-on-the-web)
- **B.3-b — Claude leverer scriptet, du kører det lokalt én gang.**
  Claude skriver `render_audio.py` + `README`; du kører det på din egen maskine
  (hvor HuggingFace er åben), lægger de færdige `.m4a`-filer i `audio/da/` og
  committer. Stadig 0 kr., Claude laver alt kodearbejdet.

Indtil modellen er hentet, kører appen på Web Speech-fallback (som i dag), så
udvikling og test af alt andet er ikke blokeret.

### B.4 Ærlig forbehold om kvalitet
Piper dansk (neural) er markant bedre og mere ensartet end enheds-TTS, men
ikke helt på niveau med en professionel indtaler. Til første Play-udgivelse er
det rigeligt. Fordi manifestet adskiller id fra fil, kan en rigtig indtaling
lægges ind senere som ren filudskiftning — uden kodeændring og uden at haste.
Fallback-stige hvis Piper-dansk skuffer på enkeltord (fx bogstavlyde):
manuel efterjustering af teksten (fonetisk stavning) i manifestet og
gen-render — stadig 0 kr.

---

## Del C · Kode-optimeringer (0 kr., alt af Claude, ingen afhængigheder)

Alle 16 punkter fra FORBEDRINGSPLAN §3 er ren kode og laves af Claude:

- **Spil (O1-O7):** anti-gentagelses-buffer, adaptiv sværhedsgrad efter
  succesrate, segment-baseret hit-test i Spor & skriv, auto-gentagelse af
  instruktion, rim-familie-regler mod utilsigtede rim, fast grid i Tæl med.
- **Robusthed (R1-R5):** localStorage med try/catch + versioneret skema,
  opdeling i ES-moduler + esbuild-bundling (bevarer "én HTML-fil" ved release),
  logik-tests + Playwright i CI (GitHub Actions), JSDoc + ts-check.
- **Tilgængelighed (T1-T4):** `prefers-reduced-motion`, WCAG-kontrast,
  fuldskærm/orientering, langt-tryk-håndtering.

---

## Del D · Faseplan (Claude Code-arbejdsgange)

Hver fase ender med commit + Playwright-verifikation. Estimaterne er nu
Claude-arbejdssessioner, ikke mandeuger.

| Fase | Indhold | Netadgang? | Leverance |
|---|---|---|---|
| **I1. Fundament** | R1, R2, R3, R5 — moduler, esbuild, logik-tests, CI | Nej | Testbar kodebase, grønt CI, uændret funktion |
| **I2. Grafik** | Del A — Claude tegner ~45 SVG + skolefont, `icon()`-lag | Nej | Egen ensartet grafik på alle enheder |
| **I3. Lyd-kode** | Del B.1 — manifest, AudioManager, integration, QA-script | Nej | Klar til at afspille filer; kører på fallback indtil I4 |
| **I4. Lyd-render** | Del B.2 — Piper-render til .m4a (kræver beslutning B.3) | **Ja** (HF) | Ens dansk tale på alle enheder |
| **I5. Optimeringer** | Del C — O1-O7, T1-T4 | Nej | Bedre spil + tilgængelighed |
| **I6. Play-klargøring** | PWA-manifest/ikoner, kreditering, privatlivspolitik | Nej | Klar til Capacitor-pakning (PLAN.md fase 2) |

Kun **I4** afhænger af beslutning B.3. Alt andet kan Claude Code lave uden at
du foretager dig noget. Rækkefølgen kan justeres (fx tage I4 sидst).

---

## Det du skal godkende

1. **Grafik = Claude-tegnet egen SVG** (anbefalet) — bekræft, eller vælg
   Twemoji hvis du foretrækker det (kræver dog netadgang til CDN).
2. **Lyd = Piper TTS**, og **hvor den renderes**:
   - **B.3-a:** du åbner netpolitikken for `huggingface.co`, så gør Claude det
     hele her (anbefalet, mindst arbejde for dig), eller
   - **B.3-b:** Claude leverer scriptet, du kører det lokalt én gang.
3. **Faserækkefølge I1-I6** — ok, eller ønsker du fx lyd (I3/I4) før grafik?

Alt er 0 kr. Sig god for punkterne, så starter jeg med I1.
