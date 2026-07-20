// @ts-check
/* Læser de renderede lydfiler (audio/da/*.mp3) og skriver dem som base64
   data-URI'er ind i src/audio-data.generated.js, så den byggede HTML er ÉN
   selvstændig fil (lyd inkluderet, virker fra file:// og offline).
   Kør efter render: node tools/embed_audio.mjs */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const audioDir = join(root, "audio", "da");
const manifest = JSON.parse(readFileSync(join(root, "audio", "manifest.json"), "utf8"));
const clips = manifest.clips;

/** @type {Record<string,string>} */
const data = {};
let missing = 0;
let bytes = 0;
for (const id of Object.keys(clips)) {
  const file = join(audioDir, clips[id].fil);
  if (!existsSync(file)) {
    missing++;
    continue;
  }
  const buf = readFileSync(file);
  bytes += buf.length;
  data[id] = "data:audio/mpeg;base64," + buf.toString("base64");
}

const header =
  "// @ts-nocheck\n/* AUTO-GENERERET af tools/embed_audio.mjs – rediger ikke i hånden.\n" +
  `   ${Object.keys(data).length} indspillede replikker (Piper da_DK) som base64 data-URI'er. */\n`;
writeFileSync(
  join(root, "src", "audio-data.generated.js"),
  header + "export const AUDIO_DATA = " + JSON.stringify(data) + ";\n"
);

const b64kb = (bytes * 1.34) / 1024;
console.log(
  `✔ Indlejret ${Object.keys(data).length} lydfiler (${(bytes / 1024 / 1024).toFixed(1)} MB rå, ` +
    `~${(b64kb / 1024).toFixed(1)} MB base64)${missing ? ` · ${missing} mangler` : ""}.`
);
