// @ts-check
/* Genererer app-ikoner (PNG) til PWA/Capacitor ud fra en indlejret SVG ved at
   rendere den i Chromium i de ønskede størrelser. Full-bleed baggrund → egner
   sig som "maskable". Kør: node tools/gen_icons.mjs
   → assets/icons/icon-512.png, icon-192.png, icon-maskable-512.png, favicon-32.png */
import { chromium } from "playwright-core";
import { mkdirSync, existsSync, readdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "assets", "icons");

function findChromium() {
  const base = "/opt/pw-browsers";
  if (existsSync(base))
    for (const d of readdirSync(base)) {
      const p = join(base, d, "chrome-linux", "chrome");
      if (d.startsWith("chromium") && existsSync(p)) return p;
    }
  return undefined;
}

/** Ikon-kunst: blå baggrund (full-bleed), maskotten "Ravnen Rikke" og en stjerne.
 * @param {boolean} maskable mindre motiv (safe-zone) til maskable-ikon */
function iconSvg(maskable) {
  const s = maskable ? 0.62 : 0.78; // motivets størrelse
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <rect width="512" height="512" fill="#2f8ad8"/>
    <rect width="512" height="512" fill="url(#g)"/>
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#57a8e6"/><stop offset="1" stop-color="#1d6fb8"/>
    </linearGradient></defs>
    <g transform="translate(256 268) scale(${s}) translate(-256 -256)">
      <!-- stjerne -->
      <path d="M392 150 l14 34 37 3 -28 24 9 36 -32 -20 -32 20 9 -36 -28 -24 37 -3z" fill="#ffd23e" stroke="#2b3a55" stroke-width="6" stroke-linejoin="round"/>
      <!-- krop -->
      <ellipse cx="256" cy="300" rx="120" ry="128" fill="#3a4a63" stroke="#2b3a55" stroke-width="8"/>
      <!-- hoved -->
      <circle cx="256" cy="176" r="84" fill="#43536d" stroke="#2b3a55" stroke-width="8"/>
      <!-- næb -->
      <path d="M330 176 L410 158 L346 210 Z" fill="#f0a51a" stroke="#2b3a55" stroke-width="8" stroke-linejoin="round"/>
      <!-- øje -->
      <circle cx="238" cy="166" r="22" fill="#fff"/><circle cx="244" cy="166" r="11" fill="#2b3a55"/>
      <!-- vinge der vinker -->
      <path d="M150 250 Q66 220 82 132 Q150 190 190 268 Z" fill="#2f3c50" stroke="#2b3a55" stroke-width="8" stroke-linejoin="round"/>
      <!-- ben -->
      <path d="M214 420 L206 456 M298 420 L306 456" stroke="#f0a51a" stroke-width="12" stroke-linecap="round"/>
    </g>
  </svg>`;
}

const targets = [
  { file: "icon-512.png", size: 512, maskable: false },
  { file: "icon-192.png", size: 192, maskable: false },
  { file: "icon-maskable-512.png", size: 512, maskable: true },
  { file: "favicon-32.png", size: 32, maskable: false },
];

async function main() {
  mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ executablePath: findChromium(), args: ["--no-sandbox"] });
  const page = await browser.newPage();
  for (const t of targets) {
    const svg = iconSvg(t.maskable);
    const html = `<!doctype html><meta charset="utf-8"><style>*{margin:0;padding:0}#i{width:${t.size}px;height:${t.size}px}</style><div id="i">${svg}</div>`;
    await page.setViewportSize({ width: t.size, height: t.size });
    await page.setContent(html);
    const buf = await page.locator("#i").screenshot({ omitBackground: false });
    writeFileSync(join(outDir, t.file), buf);
    console.log(`  ✔ ${t.file} (${t.size}×${t.size})`);
  }
  await browser.close();
  console.log("✔ Ikoner genereret i assets/icons/");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
