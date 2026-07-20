# Leg & Lær – dansk læringsspil for 3-6-årige

Et samlet læringsspil med flere minispil på dansk, bygget i ren HTML/CSS/JS
med henblik på udgivelse på Google Play.

## Indhold i dette repo

| Fil | Beskrivelse |
|---|---|
| [`SPECIFIKATION.md`](SPECIFIKATION.md) | Grundig specifikation: markedsundersøgelse, pædagogisk grundlag (læreplanstemaerne), de 8 minispil, UX-krav for 3-6-årige, teknisk arkitektur, valg af pakningsteknologi (Capacitor vs. TWA/Bubblewrap) og Google Play Families-krav |
| [`PLAN.md`](PLAN.md) | Projektplan med faser og milepæle frem til Google Play-lancering |
| [`prototype/laeringsspil.html`](prototype/laeringsspil.html) | **Fungerende prototype i én HTML-fil** – åbn den direkte i en browser |

## Prototypen

Otte spilbare minispil med dansk oplæsning (Web Speech API), stjerne-belønning,
stigende sværhedsgrad og forældre-gate:

1. 🔤 **Bogstav-jagt** – bogstavgenkendelse (inkl. æ, ø, å)
2. 🔢 **Tæl med** – tælle og mængdeforståelse (1-10)
3. 🔺 **Farver & former** – farvenavne og grundformer
4. 🃏 **Vendespil** – hukommelse og ordforråd
5. 👤 **Skygge-leg** – visuel diskrimination
6. 🐄 **Dyrelyde** – naturkendskab og lytteforståelse
7. 🎵 **Rim-tid** – fonologisk opmærksomhed (danske rim-par)
8. ✏️ **Spor & skriv** – finmotorik: spor tal og bogstaver med fingeren

Alt kører offline, uden reklamer og uden nogen form for dataindsamling –
stjerner gemmes kun lokalt på enheden.

**Prøv den:** åbn `prototype/laeringsspil.html` i Chrome (gerne på en tablet i
liggende format). Tryk på højttaler-knappen 🔊 for at høre instruktionen igen.
