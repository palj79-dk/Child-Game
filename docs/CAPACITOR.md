# Pakning til Google Play med Capacitor (fase 2)

Appen er nu klar til at blive pakket som en Android-app. Web-aktiverne ligger i
`build/` efter `npm run build` (én HTML-fil + `manifest.webmanifest`, `sw.js`,
`icons/`). Capacitor bundler dem lokalt → **ægte offline, ingen hosting**.

## Trin

```bash
npm run build                      # producerer build/ (webDir)
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Leg & Lær" dk.lundjacobsen.legoglaer --web-dir=build
npx cap add android
npx cap sync
npx cap open android               # åbner Android Studio
```

## Konfiguration (Android Studio / capacitor.config)

- **Orientering:** lås til landscape (`android:screenOrientation="landscape"`
  eller via `@capacitor/screen-orientation`).
- **minSdkVersion:** 26 (Android 8) – dækker børnetablet-markedet.
- **Ingen tilladelser:** fjern alt i manifestet appen ikke behøver (den behøver
  ingen).
- **Ikoner/splash:** brug `assets/icons/icon-512.png` (+ maskable) som kilde til
  `@capacitor/assets` (`npx capacitor-assets generate`).
- **Byg AAB** (krav i Play) med upload-nøgle → Play Console.

## Play Console (fase 3, jf. PLAN.md)

- Target audience: “5 & under” + “6-8”; IARC → PEGI 3.
- Data safety: **“collects no data”** (se `docs/privatlivspolitik.md`).
- Families-erklæringer; privatlivspolitik-link (da/en findes i `docs/`).
- Ingen reklamer, ingen konti, ingen tilladelser → enkel compliance.
- Lukket test før produktion; opt-in til Teacher Approved.

Se `docs/PLAN.md` (fase 2-4) og `docs/SPECIFIKATION.md` §6-7 for detaljer.
