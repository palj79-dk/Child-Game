# HANDOFF — »Leg & Lær«, dansk læringsspil for 3-6-årige

*Sidst opdateret: 20. juli 2026 · Til brug ved opstart af nyt cloud-miljø og
genoptagelse af arbejdet.*

Dette dokument samler **alt** hvad en ny session (eller en anden person)
skal bruge for at fortsætte projektet uden at læse historikken. Læs det først,
åbn derefter de nævnte filer.

---

## 1. Hvad projektet er

Én Android-app til Google Play: en **samling af 8 danske minispil** for børn på
**3-6 år**, bygget i ren HTML/CSS/JavaScript og pakket til Android med
Capacitor. Læringsmål inden for sprog, tal, farver/former, hukommelse, logik
og naturkendskab. Appen skal være **offline, reklamefri og uden
dataindsamling**.

**Repo:** `palj79-dk/TD` · **Arbejdsbranch:**
`claude/danish-learning-game-google-play-pdi2fc`

## 2. Status lige nu (hvad er gjort)

| Område | Status |
|---|---|
| Markedsundersøgelse + pædagogisk grundlag | ✅ færdig (`SPECIFIKATION.md`) |
| Prototype med alle 8 minispil | ✅ spilbar (`prototype/laeringsspil.html`) |
| Automatisk test (Playwright, alle 8 spil) | ✅ grøn (script i afsnit 6) |
| Forbedringsplan (lyd/grafik/optimeringer) | ✅ skrevet, **afventer godkendelse** (`FORBEDRINGSPLAN.md`) |
| 0-kr. implementeringsplan via Claude Code | ✅ skrevet, **afventer godkendelse** (`IMPLEMENTERINGSPLAN.md`) |
| Produktionslyd (indtalt/TTS) | ⏳ ikke påbegyndt — kræver netværksbeslutning (afsnit 4) |
| Egen SVG-grafik | ⏳ ikke påbegyndt |
| Kode-optimeringer (16 punkter) | ⏳ ikke påbegyndt |
| Android-pakning (Capacitor) | ⏳ ikke påbegyndt (fase 2 i `PLAN.md`) |

**Prototypen bruger midlertidigt:** enhedens TTS-stemme (Web Speech API) og
emoji som grafik. Begge skal erstattes — det er hele pointen med
forbedrings-/implementeringsplanen.

## 3. Dokumenterne og deres rolle (læs i denne rækkefølge)

1. **`README.md`** — kort overblik + liste over de 8 spil.
2. **`SPECIFIKATION.md`** — den fulde specifikation: konkurrentanalyse,
   pædagogik (de 6 læreplanstemaer), spildesign, UX-krav for 3-6-årige,
   teknisk arkitektur, valg af Capacitor frem for TWA, Google Play
   Families-krav.
3. **`PLAN.md`** — overordnet projektplan frem til Play-lancering (faser +
   milepæle).
4. **`FORBEDRINGSPLAN.md`** — detaljeret spec for at løfte lyd + grafik til
   produktionskvalitet, plus 16 optimeringer fundet ved kodegennemgang.
5. **`IMPLEMENTERINGSPLAN.md`** — **den vigtigste ved genoptagelse.** Hvordan
   alt gøres for **0 kr.** udført af Claude Code: grafik = Claude-tegnet SVG,
   lyd = gratis Piper TTS. Indeholder faseplan I1-I6 og de præcise
   beslutningspunkter.
6. **`prototype/laeringsspil.html`** — den fungerende prototype (åbn i Chrome).

## 4. ⚠️ Det ENE der kræver en beslutning: netværk til lyd-rendering

Lyden skal renderes med gratis **Piper TTS**, men Pipers danske stemmemodel
hostes på **HuggingFace**, som standard-netpolitikken (**Trusted**) blokerer.
Alt andet arbejde kræver ingen netadgang.

### Sådan sætter du det nye miljø op (så Claude kan rendere lyden i skyen)

Når du opretter/redigerer cloud-miljøet:

1. Klik sky-ikonet med miljøets navn → hold over miljøet → tandhjuls-ikonet.
2. Sæt **Network access** til **Custom**.
3. I **Allowed domains**, skriv:
   ```
   huggingface.co
   *.huggingface.co
   *.hf.co
   ```
4. **Sæt flueben i "Also include default list of common package managers"**
   (ellers mister miljøet pypi/npm/GitHub, og `pip install piper-tts` fejler).
5. Gem. Ændringen slår igennem i en **ny** session i miljøet.

> Dette åbner kun **byggemiljøet** for at hente stemmemodellen. Selve appen
> forbliver offline og uden dataindsamling.

### Alternativ (hvis du ikke vil åbne netværket)

Claude leverer et færdigt `tools/render_audio.py` + README; du kører det på din
egen maskine én gang og committer `.m4a`-filerne. Også 0 kr.

## 5. Sådan genoptages arbejdet i det nye miljø

Start en ny session på branchen `claude/danish-learning-game-google-play-pdi2fc`
og giv Claude denne besked (tilpas beslutningerne):

> Læs `HANDOFF.md` og `IMPLEMENTERINGSPLAN.md`. Jeg har oprettet et nyt miljø
> med HuggingFace åbnet i netpolitikken. Grafik = Claude-tegnet SVG, lyd =
> Piper TTS renderet her. Gå i gang med fase **I1 (fundament)**, og fortsæt
> gennem I2-I6. Vis mig resultatet efter hver fase.

**Faserækkefølge (fra `IMPLEMENTERINGSPLAN.md` §D):**

| Fase | Indhold | Netadgang |
|---|---|---|
| I1 Fundament | ES-moduler, esbuild, logik-tests, CI | Nej |
| I2 Grafik | ~45 Claude-tegnede SVG + skolefont, `icon()`-lag | Nej |
| I3 Lyd-kode | `manifest.json`, AudioManager, integration, QA | Nej |
| I4 Lyd-render | Piper → `.m4a` (kræver HuggingFace åben) | **Ja** |
| I5 Optimeringer | 16 punkter (O1-O7, R1-R5, T1-T4) | Nej |
| I6 Play-klargøring | PWA-manifest, ikoner, privatlivspolitik | Nej |

Kun **I4** kræver netadgangen fra afsnit 4. I1-I3 og I5-I6 kan startes med det
samme uanset hvad.

## 6. Sådan tester du prototypen (verificeret virker)

Miljøet har Node 22, Python 3.11, og Playwright-Chromium i
`/opt/pw-browsers/`. Manuel test: åbn `prototype/laeringsspil.html` i Chrome
(helst tablet, liggende). Automatisk røgtest:

```bash
# i en scratchpad-mappe
npm install playwright-core
# smoke-scriptet gennemspiller alle 8 spil og tjekker for konsolfejl.
# (Se den fulde version i sessionshistorikken; kernen er:)
node -e '
const { chromium } = require("playwright-core");
(async () => {
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  p.on("pageerror", e => console.log("FEJL:", e.message));
  await p.goto("file://" + process.cwd() + "/../TD/prototype/laeringsspil.html");
  console.log("spil-kort:", await p.locator(".game-card").count());  // forventet: 8
  await b.close();
})();'
```

Seneste kørsel: alle 8 spil kan gennemføres, stjerner tildeles og gemmes,
ingen konsolfejl.

## 7. Vigtige tekniske fakta til den nye session

- **Miljø:** Node 22, Python 3.11 + pip, `ffmpeg` findes i
  `/opt/pw-browsers/ffmpeg-1011/ffmpeg-linux`, Playwright-Chromium i
  `/opt/pw-browsers/`. `piper-tts` kan installeres fra pypi.
- **Netpolitik i det gamle miljø:** pypi/npm/crates/go + `raw.githubusercontent.com`
  var åbne; `huggingface.co` og `github.com`-release-assets blokeret (403).
  Derfor afsnit 4.
- **Prototypens arkitektur:** én HTML-fil. Spil defineres i et `GAMES`-array;
  hvert spil har `id`, `navn`, `ikon` og en `task()`, der bygger scenen og
  sætter `promptText` + `say`. Motoren kører 5 opgaver → 1 stjerne
  (vendespil/spor tæller anderledes). Tale via `speak()`, effektlyde via Web
  Audio, tilstand i `localStorage` under nøglen `legr`.
- **Ved release:** koden splittes i ES-moduler og bundles tilbage til én fil
  med esbuild, så "én HTML-fil"-egenskaben bevares.

## 8. Beslutninger der allerede er truffet (og hvorfor)

- **Capacitor** frem for TWA/Bubblewrap → ægte offline uden hosting-krav.
- **Ingen reklamer/analytics/konti** → simpel Families-compliance + salgsargument.
- **Grafik = Claude-tegnet SVG** frem for Twemoji → 0 kr., netuafhængigt, egen
  identitet. (Afventer din endelige bekræftelse.)
- **Lyd = Piper TTS** nu, evt. professionel indtaler senere som ren
  filudskiftning via manifestet. (Afventer din bekræftelse + netværksvalg.)

## 9. Åbne spørgsmål til dig

1. Bekræfter du **grafik = Claude-tegnet SVG**?
2. Åbner du **HuggingFace** i det nye miljø (afsnit 4), eller foretrækker du at
   køre render-scriptet lokalt?
3. Er **faserækkefølgen I1-I6** ok, eller vil du prioritere fx lyd før grafik?
4. Budget bekræftes til **0 kr.** (ingen illustrator/indtaler i første omgang)?

---

*Alle filer i projektet er committet og pushet til
`origin/claude/danish-learning-game-google-play-pdi2fc`. Intet arbejde ligger
kun lokalt.*
