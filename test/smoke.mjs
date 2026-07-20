// @ts-check
/* Playwright røgtest: åbner den byggede app, går ind i alle 8 spil og tjekker at
   scenen bygges uden konsolfejl. Kør: npm run build && npm run smoke
   Bruger Playwright-Chromium fra /opt/pw-browsers hvis CHROME_PATH ikke er sat. */
import { chromium } from "playwright-core";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { existsSync, readdirSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const appFile = join(root, "build", "laeringsspil.html");

function findChromium() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const base = "/opt/pw-browsers";
  if (existsSync(base)) {
    for (const d of readdirSync(base)) {
      const p = join(base, d, "chrome-linux", "chrome");
      if (d.startsWith("chromium") && existsSync(p)) return p;
    }
  }
  return undefined; // lad Playwright finde sin egen
}

async function main() {
  if (!existsSync(appFile)) throw new Error("Byg først: npm run build");
  const exe = findChromium();
  const browser = await chromium.launch({
    executablePath: exe,
    args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  /** @type {string[]} */
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push("console.error: " + m.text());
  });

  await page.goto("file://" + appFile);

  const cards = await page.locator(".game-card").count();
  if (cards !== 8) throw new Error(`Forventede 8 spil-kort, fandt ${cards}`);
  console.log(`✔ ${cards} spil-kort på forsiden`);

  for (let i = 0; i < cards; i++) {
    // ind i spillet
    await page.locator(".game-card").nth(i).click();
    await page.waitForTimeout(150);
    const name = await page.locator(".game-card").nth(i).getAttribute("data-name").catch(() => null);
    // scenen skal have indhold (valg / flok / spor / kort)
    const stageChildren = await page.locator("#stage > *").count();
    if (stageChildren < 1) throw new Error(`Spil ${i}: tom scene`);
    // tilbage til forsiden
    await page.locator("#homeBtn").click();
    await page.waitForTimeout(80);
    console.log(`✔ Spil ${i + 1}/${cards}${name ? " (" + name + ")" : ""}: scene bygget (${stageChildren} elementer)`);
  }

  await browser.close();

  if (errors.length) {
    console.error("✗ Konsolfejl fundet:\n" + errors.join("\n"));
    process.exit(1);
  }
  console.log("✔ Røgtest bestået – ingen konsolfejl.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
