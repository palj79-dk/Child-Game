# Specifikation: »Leg & Lær« – dansk læringsspil til 3-6-årige

*Version 1.0 · 20. juli 2026 · Målplatform: Google Play (Android), bygget som HTML/webapp*

---

## 1. Formål og vision

Én samlet app med en **samling af minispil**, der gennem leg træner små børns
tidlige færdigheder på **dansk**: bogstaver og lyde, tal og mængder, farver og
former, hukommelse, logik og viden om natur og dyr. Appen skal:

- være 100 % på dansk med **oplæst tale** (målgruppen kan ikke læse),
- kunne bruges **helt uden voksen hjælp** efter start,
- virke **offline** (ingen internetkrav efter installation),
- være **uden reklamer, køb i app og dataindsamling** – både af hensyn til
  børnene og for at gøre Google Play-godkendelsen (Families-programmet) enkel,
- være bygget i **HTML/CSS/JavaScript** og pakket til Android.

## 2. Markedsundersøgelse – hvad findes der?

Gennemgang af eksisterende danske/dansksprogede læringsapps til målgruppen:

| App | Indhold | Observationer |
|---|---|---|
| **ALPA Kids (ALPA læringsspil på dansk)** | 70+ småspil: bogstaver, tal, former, dansk natur og kultur, 3-8 år | Tætteste konkurrent. Ingen reklamer, ingen dataindsamling, lavet med lærere. Abonnementsmodel. |
| **Danske læringsspil (bogstaver og ord)** | Vendespil/huskespil med store/små bogstaver og første ord; ord læses højt | Enkelt koncept, auditiv + visuel læring. Viser at oplæsning er centralt. |
| **DinoTim** | Første ord, bogstaver, vokaler/konsonanter, tælling, 3-8 år | Oversat international app – dansk oplæsning er til tider maskinel. |
| **Børnespil – Tal spil for børn** | Talgenkendelse, tælle, skrive tal, udtale, 2-6 år | Fokuseret enkelt-emne-app. |
| **Kids læringsspil (First Step)** m.fl. | Generiske internationale pakker oversat til dansk | Ofte reklamefinansierede og med tynd/dårlig dansk lyd. |

**Konklusioner der former vores design:**

1. Der er et hul for en **dansk-først** app med naturlig dansk tale og danske
   temaer (danske dyr, årstider, genbrug/natur), som ikke er en oversættelse.
2. De bedste apps kombinerer **mange små spil under ét tag** med en fælles
   figur/ramme – det giver variation uden at barnet skal skifte app.
3. **Ingen reklamer** er både et kvalitets- og et konkurrenceparameter.
4. Oplæsning af alle instruktioner og svar er standard i de gode apps.

## 3. Pædagogisk grundlag

Spilsamlingen læner sig op ad **den styrkede pædagogiske læreplans seks
læreplanstemaer** for danske dagtilbud, så indholdet taler samme sprog som
børnehaverne:

| Læreplanstema | Sådan dækkes det i appen |
|---|---|
| Kommunikation og sprog | Bogstavlyde, rim, ordforråd, oplæsning af alt |
| Krop, sanser og bevægelse | Finmotorik: træk-og-slip, spore bogstaver/tal med fingeren |
| Natur, udeliv og science | Danske dyr og deres lyde, sortering (genbrug), tælle i naturen |
| Kultur, æstetik og fællesskab | Farver, musik/lyde, danske sange-univers i grafikken |
| Alsidig personlig udvikling | Mestring: stigende sværhedsgrad, ros, ingen "fejl-straf" |
| Social udvikling | To-spiller-vendespil på samme skærm (fase 2) |

**Læringsprincipper:**

- **Ingen tabertilstand.** Forkerte svar giver blid lyd + nyt forsøg; rigtige
  svar giver stjerner, konfetti og verbal ros ("Flot!", "Sikke godt!").
- **Adaptiv sværhedsgrad** i tre trin (ca. 3-4 år / 4-5 år / 5-6 år): flere
  svarmuligheder, større talområde, små bogstaver oveni store osv. Justeres
  automatisk efter succesrate og kan låses af forældre.
- **Korte runder** (5 opgaver pr. runde) – passer til målgruppens
  koncentrationsspænd.

## 4. Spilsamlingen (8 minispil)

Alle spil deler samme opbygning: talt instruktion → opgave → feedback →
stjerne efter 5 rigtige. Fælles maskot ("Ravnen Rikke" – arbejdstitel) guider.

| # | Spil | Læringsmål | Mekanik | Sværhedstrin |
|---|---|---|---|---|
| 1 | **Bogstav-jagt** | Bogstavgenkendelse + lyde (fonemer), inkl. æ/ø/å | Stemmen siger "Find B – b siger *b*". Tryk på det rigtige af 3-6 bogstavkort | 3→6 kort; store → små bogstaver; navn → lyd |
| 2 | **Tæl med** | Mængdeforståelse, tal 1-10 | Dyr vises, "Hvor mange får er der?" – tryk på det rigtige tal | 1-3 → 1-5 → 1-10; senere "en mere/en mindre" |
| 3 | **Farver & former** | Farvenavne, grundformer | "Tryk på den røde trekant" i et gitter af figurer | Kun farve → kun form → farve+form kombineret |
| 4 | **Vendespil** | Hukommelse, ordforråd (ord siges højt ved vending) | Klassisk memory med danske dyr/ting | 6 → 8 → 12 kort |
| 5 | **Skygge-leg** | Visuel diskrimination, logik | Match ting med deres skygge/omrids | 3 → 4 → 5 muligheder, mere ens silhuetter |
| 6 | **Dyrelyde** | Naturkendskab, lytteforståelse | "Hvilket dyr siger muh?" – tryk på dyret | Kendte gårddyr → danske vilde dyr (pindsvin, ræv, solsort) |
| 7 | **Rim-tid** | Fonologisk opmærksomhed (vigtigste før-læse-færdighed) | "Hvad rimer på kat?" – tre billeder, ét rimer (hat) | Tydelige rim → sværere; senere "samme forlyd" |
| 8 | **Spor tallet/bogstavet** | Finmotorik, skriveretning | Følg pilene med fingeren og "skriv" bogstavet/tallet | Brede spor → smallere; tal → bogstaver |

**Fase 2-ideer (efter lancering):** sortér skrald (natur/science), klokken
(hel time), to-spiller-vendespil, enkle plus-stykker med brikker, årstider.

### Belønning og fremdrift

- Hver runde giver en stjerne; stjerner samles pr. spil (vises på forsiden).
- Milepæle udløser en lille fest-animation og en ny "klistermærke"-figur i en
  samlebog. Ingen tidspres, ingen rangliste, intet der kan "mistes".
- Fremdrift gemmes lokalt (localStorage) – ingen konti, intet i skyen.

## 5. UX-krav (3-6 år)

Baseret på anerkendte retningslinjer for småbørns-UI (NN/g, Sesame Workshop):

- **Touch-mål min. 2×2 cm** (~64+ dp) med god luft imellem; hele kortet er
  trykfladen, ikke kun ikonet.
- **Ingen læsekrav:** al instruktion er tale + ikon; gentag-knap (højttaler)
  på hver skærm. Visuel "puls/glød" på interaktive elementer efter få
  sekunders inaktivitet.
- **Kun enkle gestusser:** tryk og simpelt træk. Ingen dobbelttryk, langt
  tryk, pinch eller svirp i børnedelen.
- **Liggende format (landscape)** som primær orientering – passer til
  tablets, som er målgruppens typiske enhed; skal dog også fungere stående.
- Store, glade farver med god kontrast; én ting i fokus ad gangen; rolige
  baggrunde uden forstyrrende dekoration.
- **Forældre-gate** foran indstillinger/info: "Hold knappen inde i 3
  sekunder" + lille regneopgave – så børn ikke ender i indstillinger.
- Lydstyrkelogik: tale dukker musikken; alt kan slås fra i forældremenuen.

## 6. Teknisk arkitektur

### 6.1 Grundprincip: HTML-først, offline-først

Hele spillet er en webapp i **vanilla HTML/CSS/JavaScript uden
byggeværktøjer og uden runtime-afhængigheder**. Prototypen er bevidst **én
enkelt HTML-fil** (`prototype/laeringsspil.html`) – den kan åbnes direkte i en
browser, deles og testes uden installation. I produktudgaven splittes koden i
moduler, men princippet "alt bundles lokalt, intet hentes fra nettet" består.

- **Grafik:** SVG + emoji/egne tegninger som inline-assets. Ingen tunge
  billedfiler; appen bør kunne holdes under ~20 MB inkl. lyd.
- **Lyd (afgørende for kvaliteten):**
  - *Produktion:* forudindspillede **danske speaks** (rigtig indtaler eller
    kvalitets-TTS renderet til .ogg/.m4a på forhånd) bundtet i appen. Det
    sikrer ensartet, naturlig dansk uanset enhed.
  - *Prototype/fallback:* Web Speech API (`speechSynthesis`, `da-DK`) – findes
    på de fleste Android-enheder, men kvalitet varierer; derfor kun fallback.
  - Effektlyde (pling, konfetti, blid "prøv igen") genereres med Web Audio
    API eller små bundtede filer.
- **Tilstand:** `localStorage` (stjerner, sværhedsgrad, lydindstillinger).
- **Ingen netværkskald overhovedet** i børnedelen – det er samtidig det
  stærkeste privatlivsargument over for Google Play.

### 6.2 Pakning til Google Play – valgmuligheder

| Metode | Hvordan | Fordele | Ulemper |
|---|---|---|---|
| **TWA/Bubblewrap (PWA i Play)** | PWA hostes på et domæne; Bubblewrap genererer en Android-app der viser den i Chrome uden browser-UI | Meget let, lille APK, auto-opdatering via web | **Kræver hosting + Digital Asset Links**, reelt netafhængig ved førstegangsstart, mindre kontrol; dårligt match til "skal virke offline i sommerhuset" |
| **Capacitor** ⭐ anbefalet | Webappen kopieres ind i et rigtigt Android-projekt og køres i systemets WebView; `npx cap add android` → AAB i Android Studio | **Alle filer bundles lokalt = ægte offline**, ingen hosting, adgang til native API'er (fx skærmlås til landscape, TTS-plugin) ved behov, aktivt vedligeholdt | Lidt større app; opdateringer kræver ny Play-release |
| Cordova | Som Capacitor, ældre økosystem | Kendt | I praksis afløst af Capacitor |
| Native wrapper i egen WebView | Håndskrevet Android-projekt | Fuld kontrol | Unødigt arbejde ift. Capacitor |

**Anbefaling: Capacitor.** For en børneapp der skal være offline, reklamefri
og uden hosting-afhængighed er lokal bundling det rigtige valg. Bubblewrap/TWA
er kun attraktiv hvis vi alligevel vil drive en offentlig web-udgave.

### 6.3 Målkrav til Android-pakken

- `minSdkVersion` 26+ (Android 8) – dækker reelt hele markedet af børnetablets.
- **AAB-format** (krav i Play), landscape som default, `resizeableActivity`.
- Ingen andre permissions end ingen – appen skal ikke bede om noget.
- WebView-krav: appen skal testes på laveste understøttede WebView-version.

## 7. Google Play: Families-krav og udgivelse

Appen målrettes børn og **skal** derfor overholde Google Play
Families-politikkerne. Vores designvalg gør compliance næsten triviel:

1. **Target audience:** "Ages 5 & under" + "6-8" i Play Console;
   indholdsklassificering (IARC) udfyldes → PEGI 3.
2. **Ingen reklamer** → ingen krav om certificerede ad-SDK'er, ingen
   personaliseringsproblemer.
3. **Ingen dataindsamling** (ingen analytics, ingen crash-SDK'er med
   person-ID, ingen konti) → Data safety-sektionen udfyldes med "collects no
   data"; COPPA/GDPR-risiko elimineres ved design.
4. **Privatlivspolitik er stadig obligatorisk** – kort side på dansk/engelsk
   der bekræfter nul-indsamling; skal linkes i Play Console *og* i appens
   forældresektion.
5. Ingen links ud af appen uden for forældre-gaten; ingen sociale funktioner,
   ingen chat (skærpet forbudt for børneapps pr. politikopdatering juli 2026).
6. **Teacher Approved-programmet:** når appen er godkendt i Families, opt-in
   til Teacher Approved – redaktionel udvælgelse, men vores profil (pædagogisk
   forankring, ingen ads) er præcis hvad programmet belønner.
7. Udvikler-konto: engangsgebyr 25 USD; til test kræves lukket test med
   testere før produktion (gælder nye personlige udviklerkonti).

**Butiksmateriale:** dansk butikstekst, skærmbilleder i landscape fra tablet
og telefon, feature-grafik 1024×500, app-ikon 512×512.

## 8. Kvalitet og test

- **Enhedstest af spillogik** (opgavegeneratorer, sværhedsjustering) – logikken
  holdes adskilt fra DOM, så den kan testes i Node.
- **Manuel matrix:** billig Android-tablet (mest udbredt i målgruppen),
  mellemklasse-telefon, Chrome desktop. Tjek: lyd efter lydløs-knap,
  rotation, hjem-knap/genoptag, offline-flytilstand.
- **Børnetest:** 3-5 børn i målgruppen observeres (forældresamtykke, ingen
  optagelse). Succeskriterier: kan starte et spil uden hjælp; forstår talt
  instruktion; ingen utilsigtede exits.
- Tilgængelighed: fungerer uden lyd (visuelle hints), farveblind-sikre
  kombinationer i Farver & former (form + farve, aldrig kun farve som signal).

## 9. Risici

| Risiko | Håndtering |
|---|---|
| Dansk TTS-kvalitet svinger på enheder | Forudindspillede speaks i produktionen; TTS kun i prototype |
| Families-review afviser app | Nul-data-design minimerer angrebsflade; privatlivspolitik klar fra dag 1 |
| WebView-forskelle (lyd-autoplay, touch) | Lyd startes altid af brugerens første tryk; testmatrix |
| Emoji-grafik ser forskellig ud pr. enhed | I produktion erstattes emoji af egne SVG-illustrationer |
| Målgruppen trykker vildt | Ingen destruktive handlinger; forældre-gate; debounce på svar |

## 10. Bilag: kilder

- ALPA Kids: https://apps.apple.com/dk/app/alpa-l%C3%A6ringsspil-p%C3%A5-dansk/id6446890016
- Danske læringsspil (bogstaver og ord): https://apps.apple.com/dk/app-bundle/danske-l%C3%A6ringsspil-bogstaver-og-ord/id931176230
- DinoTim: https://apps.apple.com/dk/app/dinotim-l%C3%A6ringsspil-med-t%C3%A6lle/id962699433
- Google Play Families Policies: https://support.google.com/googleplay/android-developer/answer/9893335
- Families-program/Teacher Approved: https://play.google.com/console/about/programs/families/
- PWA i Play (TWA-codelab): https://developers.google.com/codelabs/pwa-in-play
- Bubblewrap: https://www.thinktecture.com/en/pwa/twa-bubblewrap/
- Den styrkede pædagogiske læreplan: https://uvm.dk/dagtilbud/laeringsmiljoe-sprog-og-stoette/paedagogiske-laereplaner-i-dagtilbud/
- UX for børn (NN/g): https://www.nngroup.com/articles/children-ux-physical-development/
- Sesame Workshop – Touch Tablet Experiences for Preschoolers: https://joanganzcooneycenter.org/wp-content/uploads/2020/02/SesameWorkshop-2012.pdf
