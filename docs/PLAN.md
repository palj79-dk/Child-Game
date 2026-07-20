# Projektplan: »Leg & Lær« fra HTML-fil til Google Play

Planen bygger på `SPECIFIKATION.md`. Estimaterne er kalendertid for én
udvikler på deltid; faserne kan overlappe.

## Fase 0 – Fundament (✅ udført i dette repo)

- [x] Markedsundersøgelse, teknologivalg og pædagogisk grundlag (se specifikation)
- [x] Fungerende prototype som **én HTML-fil** med alle 8 minispil, dansk tale
      (Web Speech API), stjerner, sværhedstrin og forældre-gate:
      `prototype/laeringsspil.html`

## Fase 1 – Fra prototype til produkt (3-4 uger)

1. **Kodebase:** split prototypen i moduler (spilmotor, opgavegeneratorer,
   UI, lyd, lagring). Stadig vanilla JS, ingen frameworks. Enhedstest af
   opgavegeneratorer og sværhedslogik i Node.
2. ~~**Spil 7 og 8:** Rim-tid og Spor tallet/bogstavet~~ ✅ udført i
   prototypen (kuraterede danske rim-par og SVG-sporingsbaner for tal og
   bogstaver).
3. **Lyd:** producer danske speaks (indtaler eller kvalitets-TTS renderet til
   filer): alle instruktioner, bogstavnavne + lyde, tal, farver, dyr, ros.
   Manifest-styret lydkatalog med Web Speech som fallback.
4. **Grafik:** erstat emoji med egne SVG-illustrationer (ensartet på tværs af
   enheder); maskot-figur; fest-animationer.
5. **Adaptiv sværhedsgrad** + klistermærke-samlebog.

## Fase 2 – Android-pakning (1 uge)

1. `npm init` + Capacitor: `npx cap add android`; webfilerne bundles lokalt
   (ægte offline, ingen hosting).
2. Konfiguration: landscape-default, ingen permissions, minSdk 26, app-ikon,
   splash. Byg **AAB** i Android Studio; signering med upload-nøgle.
3. Test på fysisk billig Android-tablet + telefon: lyd-autoplay efter første
   tryk, rotation, genoptag fra baggrund, flytilstand.

## Fase 3 – Play-klargøring (1 uge, delvist parallelt)

1. Google Play-udviklerkonto (25 USD engangsgebyr).
2. Privatlivspolitik-side (dansk + engelsk, "indsamler ingen data") hostet på
   en simpel statisk side; linkes i app (bag forældre-gate) og Play Console.
3. Play Console: Target audience ("5 & under" + "6-8"), Families-erklæringer,
   Data safety ("no data collected"), IARC-indholdsklassificering (PEGI 3).
4. Butiksmateriale: dansk beskrivelse, skærmbilleder (tablet + telefon),
   feature-grafik 1024×500, ikon 512×512.
5. **Lukket test** med mindst de af Play krævede testere; derefter
   produktions-release. Opt-in til Teacher Approved.

## Fase 4 – Børnetest og lancering (2 uger)

1. Test med 3-5 børn i målgruppen (observation, forældresamtykke); justér
   touch-størrelser, taletempo og sværhedskurve efter fund.
2. Ret fund, ny lukket test-build, indsend til produktion.
3. Efter godkendelse: overvåg Play-vitals (ANR/crash) og anmeldelser.

## Fase 5 – Efter lancering (løbende)

- Indholdsudvidelser: sortér skrald, klokken, to-spiller-vendespil,
  plus-stykker, årstider.
- Overvej PWA-udgave på eget domæne (samme kodebase) og senere iOS via
  Capacitor.

## Milepæle

| Milepæl | Kriterium |
|---|---|
| M1 Prototype | 6 spil spilbare i browser med dansk tale (✅) |
| M2 Indholdskomplet | 8 spil, egne speaks og SVG-grafik |
| M3 Android-build | AAB installeret og testet offline på fysisk tablet |
| M4 Play-godkendt | Families-review bestået, lukket test gennemført |
| M5 Lancering | Live i Google Play, PEGI 3, ingen kritiske vitals |

## Beslutninger der er truffet (og hvorfor)

- **Capacitor frem for TWA/Bubblewrap:** ægte offline uden hosting-krav –
  vigtigst for en børneapp (se specifikationens afsnit 6.2).
- **Ingen reklamer/analytics/konti:** gør Families-compliance enkel og er et
  salgsargument til forældre.
- **Forudindspillet dansk lyd i produktionen:** enheds-TTS er for ujævn til
  at bære en sprog-app for 3-6-årige.
