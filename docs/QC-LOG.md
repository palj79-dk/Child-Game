# Play-log (udviklings-/QC-funktion) – og hvordan den fjernes før udgivelse

Play-loggen hjælper med at vurdere **om sværhedsgraden passer**, og **hvor lang
tid** barnet bruger pr. opgave. Den er **100 % lokal** – alt gemmes kun på
enheden (`localStorage`-nøgle `legr_qclog`), intet sendes nogen steder.

## Hvad logges

For hver opgave registreres tidsstemplet:

| Hændelse | Felter |
|---|---|
| `session-start` | rolle (barn/voksen/qc) |
| `spil-start` | spil, niveau |
| `opgave` | spil, niveau, prompt |
| `rigtigt` | spil, niveau, **ms** (løsetid), **forsøg** (antal fejl før) |
| `forkert` | spil, forsøg |
| `niveau` | spil, niveau (når adaptiv sværhedsgrad flytter trin) |
| `stjerne` | spil, ialt |
| `hjem` | – |

Øverst vises et **resumé pr. spil**: niveau, antal rigtige, fejl-procent og
gennemsnitlig løsetid – så man hurtigt kan se om et spil er for let/svært.

## Hvem kan se den

- Loggen **kører for alle roller** (barn/voksen/QC), så man kan observere et
  rigtigt barn spille og bagefter gennemgå forløbet.
- **Voksen:** åbn Forældre → **“Vis play-log”**.
- **QC-tester:** desuden en flydende **🔍 Log**-knap nederst på skærmen.
- Knapperne **Kopiér** (til udklipsholder) og **Ryd** findes i log-visningen.

## ⚠️ Sådan fjernes funktionen før udgivelse

Funktionen er samlet bag ét flag. Vælg **A** (hurtigt) eller **B** (helt væk):

### A. Slå fra med kill-switch (anbefalet til test-builds)
Sæt i `src/playlog.js`:

```js
export const DEV_INSTRUMENTATION = false;
```

Så bliver `playlog.log()` en no-op, og **al** log-/QC-UI skjules
(`body.nodev`-reglen i `styles.css`), inkl. QC-rolle-knappen og “Vis play-log”.
Rolle-vælgeren (Barn/Voksen) består. Byg igen: `npm run build`.

### B. Fjern koden helt (til den endelige Play-udgivelse)
1. Slet `src/playlog.js` og `docs/QC-LOG.md`.
2. Fjern importen og kaldene til `playlog`/`DEV_INSTRUMENTATION` i
   `src/engine.js` og `src/ui.js` (søg efter `playlog`).
3. Fjern `taskStart`/`taskAttempts` i `src/engine.js` hvis de ikke bruges andet.
4. Fjern i `src/index.html`: `#role` (hvis rolle-valg ikke ønskes), `#qclog`,
   `#qcBtn`, samt `#logBtn` og `.role-btn[data-role="qc"]`.
5. Fjern i `src/styles.css`: blokkene for `#role`, `#qclog`, `#qcBtn`, `.dev-only`.
6. Fjern rolle/qc-felterne i `src/store.js` hvis rolle-valg heller ikke ønskes.
7. Fjern testene “rolle/QC” og “play-log” i `test/logic.test.mjs`.
8. `npm test && npm run typecheck && npm run build`.

> Privatlivspolitikken nævner allerede at intet forlader enheden, så loggen
> bryder ikke nul-dataindsamlingen – men den bør alligevel fjernes (eller mindst
> slås fra med A) i den offentlige udgave, da den logger børns spil lokalt.
