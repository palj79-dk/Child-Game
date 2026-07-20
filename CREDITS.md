# Kreditering og licenser

»Leg & Lær« er bygget med gratis, åbne værktøjer. Tak til:

## Skrifttype
- **ABeeZee** af Anja Meiners — licens **SIL Open Font License 1.1**.
  Fuld licens: [`assets/font/OFL-ABeeZee.txt`](assets/font/OFL-ABeeZee.txt).
  Bruges (subsettet til A-Å + 0-9) på bogstav- og talkortene.

## Tale (lyd)
- **Piper** neural TTS (MIT-licens) med den danske stemme
  **`da_DK-talesyntese-medium`** fra Piper-voices-samlingen. Alle replikker er
  renderet på forhånd og bundtet lokalt i appen.

## Grafik
- Alle illustrationer, maskotten "Ravnen Rikke" og UI-ikoner er **tegnet fra
  bunden som SVG** til dette projekt (ingen tredjeparts-billedassets).

## Effektlyde
- Genereret i browseren med Web Audio API (ingen filer).

## Byggeværktøjer
- **esbuild** (MIT) til at samle koden til én HTML-fil.
- **Playwright** (Apache-2.0) til automatiske røgtests og ikon-rendering.
- **fontTools** (MIT) til subsetting af skrifttypen, **lameenc/LAME** (LGPL) til
  MP3-kodning af lyden.

Appen indsamler ingen data, viser ingen reklamer og virker offline. Se
[`docs/privatlivspolitik.md`](docs/privatlivspolitik.md).
