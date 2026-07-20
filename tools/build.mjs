// @ts-check
/* =====================================================================
   Bundler: samler ES-modulerne + CSS (+ SVG-sprites + font + lyd fra
   senere faser) tilbage til ÉN selvstændig HTML-fil, så prototypens
   "én HTML-fil"-egenskab bevares (jf. HANDOFF §7 / R2).
   Kør: npm run build  →  build/laeringsspil.html
   ===================================================================== */
import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync, cpSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const srcDir = join(root, "src");
const outDir = join(root, "build");

/** @param {string} p */
const read = (p) => readFileSync(p, "utf8");
/** @param {string} p */
const readIf = (p) => (existsSync(p) ? read(p) : "");

async function main() {
  // 1) Bundle JS (ES-moduler → én IIFE, minificeret)
  const result = await build({
    entryPoints: [join(srcDir, "main.js")],
    bundle: true,
    format: "iife",
    minify: true,
    target: ["es2019"],
    legalComments: "none",
    write: false,
  });
  const js = result.outputFiles[0].text;

  // 2) CSS + evt. font-CSS (I2)
  let css = read(join(srcDir, "styles.css"));
  const fontCss = readIf(join(root, "assets", "fonts.css"));
  if (fontCss) css += "\n" + fontCss;

  // 3) SVG-spritesheet (I2, valgfri)
  const sprites = readIf(join(root, "assets", "sprites.svg"));

  // 4) Sæt HTML sammen
  let html = read(join(srcDir, "index.html"));
  // VIGTIGT: brug funktions-replacers, ellers fortolker String.replace $-mønstre
  // ($&, $`, …) i CSS/JS og korrumperer bundlen (kan lukke <script> for tidligt).
  html = html.replace(/<!--STYLE-->[\s\S]*?<!--\/STYLE-->/, () => `<style>\n${css}\n</style>`);
  html = html.replace(/<!--SCRIPT-->[\s\S]*?<!--\/SCRIPT-->/, () => `<script>\n${js}\n</script>`);
  if (sprites) {
    // skjult inline spritesheet lige efter <body>
    html = html.replace(
      /<body>/,
      () => `<body>\n<div id="svg-sprites" aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden">\n${sprites}\n</div>`
    );
  }

  mkdirSync(outDir, { recursive: true });
  const outFile = join(outDir, "laeringsspil.html");
  writeFileSync(outFile, html);
  // også en index.html så PWA'ens start_url "." virker
  writeFileSync(join(outDir, "index.html"), html);

  // 5) Kopiér PWA-aktiver ved siden af bundlen (manifest, service worker, ikoner)
  for (const f of ["manifest.webmanifest", "sw.js"]) {
    if (existsSync(join(srcDir, f))) copyFileSync(join(srcDir, f), join(outDir, f));
  }
  const iconsSrc = join(root, "assets", "icons");
  if (existsSync(iconsSrc)) cpSync(iconsSrc, join(outDir, "icons"), { recursive: true });

  const kb = (Buffer.byteLength(html) / 1024).toFixed(1);
  console.log(`✔ Bygget ${outFile} (${kb} KB) + PWA-aktiver (manifest, sw.js, icons/)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
