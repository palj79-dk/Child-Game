// @ts-check
/* QA: tjekker at hvert id i audio/manifest.json har en tilhørende lydfil, og
   omvendt (ingen forældreløse filer). No-op indtil manifestet findes (I3).
   Kør: npm run check-audio */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const manifestPath = join(root, "audio", "manifest.json");
const audioDir = join(root, "audio", "da");

if (!existsSync(manifestPath)) {
  console.log("ℹ Intet audio/manifest.json endnu – springer lyd-tjek over (OK).");
  process.exit(0);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const entries = manifest.clips || manifest;
const ids = Object.keys(entries);
if (!ids.length) {
  console.error("✗ Manifestet er tomt.");
  process.exit(1);
}

const haveFiles = existsSync(audioDir) ? new Set(readdirSync(audioDir)) : new Set();
let missing = 0;
for (const id of ids) {
  const file = entries[id].fil || `${id}.m4a`;
  if (!haveFiles.has(file)) {
    missing++;
    if (missing <= 20) console.warn(`  mangler fil for id '${id}': ${file}`);
  }
}

// forældreløse filer (fil uden manifest-id)
const wantFiles = new Set(ids.map((id) => entries[id].fil || `${id}.m4a`));
const orphans = [...haveFiles].filter((f) => f.endsWith(".m4a") && !wantFiles.has(f));

console.log(`Manifest: ${ids.length} id'er · filer til stede: ${haveFiles.size} · manglende: ${missing} · forældreløse: ${orphans.length}`);

if (missing > 0) {
  // Indtil lyden er renderet (I4) er manglende filer forventet → advar men fejl ikke,
  // med mindre lyd-mappen faktisk er begyndt at blive fyldt.
  if (haveFiles.size === 0) {
    console.log("ℹ Lyd endnu ikke renderet (I4) – manifest valideret strukturelt (OK).");
    process.exit(0);
  }
  console.error(`✗ ${missing} manifest-id'er mangler en lydfil.`);
  process.exit(1);
}
if (orphans.length) {
  console.error("✗ Forældreløse lydfiler: " + orphans.slice(0, 20).join(", "));
  process.exit(1);
}
console.log("✔ Lyd-manifest og filer er konsistente.");
