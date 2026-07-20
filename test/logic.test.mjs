// @ts-check
/* Rene logik-tests (R3). Kører i Node uden browser: tester opgave-generatorerne
   for invarianter (ingen dubletter i svarmuligheder, korrekt niveau-pool, ét rigtigt
   svar, rim-regler). Kør: npm test */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { gen as bogstavGen } from "../src/games/bogstav.js";
import { gen as talGen, numberOptions } from "../src/games/tal.js";
import { gen as formGen } from "../src/games/form.js";
import { gen as memoryGen } from "../src/games/memory.js";
import { gen as skyggeGen } from "../src/games/skygge.js";
import { gen as dyrGen } from "../src/games/dyr.js";
import { gen as rimGen } from "../src/games/rim.js";
import { gen as sporGen } from "../src/games/spor.js";
import { GAMES } from "../src/games/index.js";
import { store } from "../src/store.js";
import { fresh, _resetRecent } from "../src/anti_repeat.js";
import { playlog, DEV_INSTRUMENTATION } from "../src/playlog.js";
import { MANIFEST } from "../src/audio-manifest.generated.js";
import { LETTERS, ANIMALS, COLORS, SHAPES, RIM, GLYPHS, LETTER_EKSEMPEL, LETTER_EKSEMPEL_SYM } from "../src/data.js";
import * as ids from "../src/audio-ids.js";

const REPS = 400;
const LEVELS = [0, 1, 2];

/** @param {any[]} a */
const uniq = (a) => new Set(a).size === a.length;

test("GAMES: 8 spil med unikke id'er", () => {
  assert.equal(GAMES.length, 8);
  assert.ok(uniq(GAMES.map((g) => g.id)));
  for (const g of GAMES) {
    assert.ok(g.id && g.navn && g.ikon && typeof g.task === "function");
  }
});

test("bogstav: rigtigt antal, mål med i opts, ingen dubletter", () => {
  const N = [3, 4, 6];
  for (const lvl of LEVELS) {
    for (let r = 0; r < REPS; r++) {
      const { opts, target } = bogstavGen(lvl);
      assert.equal(opts.length, N[lvl]);
      assert.ok(opts.includes(target));
      assert.ok(uniq(opts));
    }
  }
});

test("tal.numberOptions: 3 distinkte, inkl. n, i [1,max]", () => {
  for (let max = 3; max <= 10; max++) {
    for (let n = 1; n <= max; n++) {
      const o = numberOptions(n, max);
      assert.equal(o.length, 3);
      assert.ok(uniq(o));
      assert.ok(o.includes(n));
      assert.ok(o.every((v) => v >= 1 && v <= max));
    }
  }
});

test("tal.gen: n i [1,max], opts korrekte", () => {
  for (const lvl of LEVELS) {
    for (let r = 0; r < REPS; r++) {
      const { n, max, opts } = talGen(lvl);
      assert.ok(n >= 1 && n <= max);
      assert.equal(opts.length, 3);
      assert.ok(opts.includes(n));
      assert.ok(uniq(opts));
    }
  }
});

test("form: distinkte farve/form-kombinationer, mål med i opts", () => {
  const N = [4, 5, 6];
  for (const lvl of LEVELS) {
    for (let r = 0; r < REPS; r++) {
      const { opts, target } = formGen(lvl);
      assert.equal(opts.length, N[lvl]);
      assert.ok(opts.includes(target));
      const keys = opts.map((o) => o.s.navn + "|" + o.c.navn);
      assert.ok(uniq(keys), "ingen ens farve+form-kombination");
    }
  }
});

test("memory: deck = par*2, hvert dyr præcis to gange", () => {
  const P = [3, 4, 6];
  for (const lvl of LEVELS) {
    for (let r = 0; r < REPS; r++) {
      const { pairs, deck } = memoryGen(lvl);
      assert.equal(pairs, P[lvl]);
      assert.equal(deck.length, pairs * 2);
      const counts = new Map();
      for (const c of deck) counts.set(c.a, (counts.get(c.a) || 0) + 1);
      for (const v of counts.values()) assert.equal(v, 2);
      assert.equal(counts.size, pairs);
    }
  }
});

test("skygge/dyr: mål med i opts, ingen dubletter", () => {
  const N = [3, 4, 6]; // dyr-niveauer
  for (const lvl of LEVELS) {
    for (let r = 0; r < REPS; r++) {
      const d = dyrGen(lvl);
      assert.equal(d.opts.length, N[lvl]);
      assert.ok(d.opts.includes(d.target));
      assert.ok(uniq(d.opts));
      const s = skyggeGen(lvl);
      assert.ok(s.opts.includes(s.target));
      assert.ok(uniq(s.opts));
    }
  }
});

test("rim: præcis ét rigtigt svar, og det rimer på målet", () => {
  const N = [3, 4, 5]; // 1 rigtig + distraktorer
  for (const lvl of LEVELS) {
    for (let r = 0; r < REPS; r++) {
      const { target, options } = rimGen(lvl);
      assert.equal(options.length, N[lvl]);
      const rigtige = options.filter((o) => o.rigtig);
      assert.equal(rigtige.length, 1);
      assert.equal(rigtige[0].ord, target.rimOrd);
    }
  }
});

test("O5: ingen distraktor deler rim-familie med målet", () => {
  for (const lvl of LEVELS) {
    for (let r = 0; r < REPS; r++) {
      const { target, options } = rimGen(lvl);
      const distraktorer = options.filter((o) => !o.rigtig);
      for (const d of distraktorer) {
        assert.notEqual(d.fam, target.fam, `distraktor ${d.ord} rimer utilsigtet på ${target.ord}`);
      }
    }
  }
});

test("O1: fresh() undgår gentagelse inden for vinduet", () => {
  _resetRecent();
  const pool = ["a", "b", "c", "d"];
  const keys = [];
  for (let i = 0; i < 60; i++) {
    const v = fresh("t", () => pool[(Math.random() * pool.length) | 0], (x) => x, 2);
    keys.push(v);
  }
  for (let i = 2; i < keys.length; i++) {
    assert.notEqual(keys[i], keys[i - 1]);
    assert.notEqual(keys[i], keys[i - 2]);
  }
});

test("O2: recordTask justerer niveau; lås fastholder", () => {
  store.reset();
  const id = "bogstav";
  assert.equal(store.level(id), 0);
  // hæv kunstigt til 2 og fejl gentagne gange → trin ned
  store.adapt(id).level = 2;
  for (let i = 0; i < 5; i++) store.recordTask(id, false);
  assert.ok(store.level(id) < 2, "niveau falder ved mange fejl");
  // lås: niveau ændres ikke uanset udfald
  const locked = store.level(id);
  store.lockLevel = true;
  for (let i = 0; i < 10; i++) store.recordTask(id, false);
  assert.equal(store.level(id), locked, "låst niveau ændres ikke");
  store.lockLevel = false;
  store.reset();
});

test("spor: glyf i niveau-pool, pool vokser med niveau", () => {
  let prevLen = 0;
  for (const lvl of LEVELS) {
    let poolLen = 0;
    for (let r = 0; r < REPS; r++) {
      const { g, pool, erTal } = sporGen(lvl);
      assert.ok(pool.includes(g));
      assert.equal(erTal, "1234567890".includes(g));
      poolLen = pool.length;
    }
    assert.ok(poolLen > prevLen, "poolen vokser med niveauet");
    prevLen = poolLen;
  }
});

test("lyd: hvert id spillene beder om findes i manifestet", () => {
  const need = [];
  need.push(...ids.ROS_IDS, ...ids.PROEV_IDS, ...Object.values(ids.SYS), ...Object.values(ids.SPIL));
  for (const L of LETTERS)
    need.push(ids.bogstavNavn(L), ids.bogstavLyd(L), ids.bogstavEksempel(L), ids.bogstavLydEksempel(L));
  for (let n = 1; n <= 10; n++) need.push(ids.talOrd(n));
  for (const a of ANIMALS)
    need.push(ids.talHvormange(a.sym), ids.dyrUbest(a.sym), ids.dyrFlertal(a.sym), ids.dyrLyd(a.sym), ids.dyrelydSpm(a.sym));
  for (const c of COLORS) for (const s of SHAPES) need.push(ids.formSaetning(c.navn, s.navn));
  for (const r of RIM) need.push(ids.rimSpm(r.ord), ids.rimOrd(r.ord), ids.rimOrd(r.rimOrd));
  for (const g of Object.keys(GLYPHS)) need.push(ids.sporGlyf(g));
  const missing = need.filter((id) => !MANIFEST[id]);
  assert.deepEqual(missing, [], "id'er uden manifest-tekst: " + missing.join(", "));
});

test("bogstaver: hvert bogstav har eksempelord + symbol der findes i spritesheet", () => {
  const sprites = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "assets", "sprites.svg"), "utf8");
  const defined = new Set([...sprites.matchAll(/<symbol id="([^"]+)"/g)].map((m) => m[1]));
  for (const L of LETTERS) {
    assert.ok(LETTER_EKSEMPEL[L], `mangler eksempelord for ${L}`);
    const sym = LETTER_EKSEMPEL_SYM[L];
    assert.ok(sym, `mangler symbol for ${L}`);
    assert.ok(defined.has(sym), `symbol '${sym}' (${L}) findes ikke i sprites.svg`);
  }
});

test("rolle/QC: role sætter qc korrekt", () => {
  store.reset();
  assert.equal(store.role, "");
  assert.equal(store.qc, false);
  store.role = "barn";
  assert.equal(store.qc, false);
  store.role = "qc";
  assert.equal(store.qc, true);
  store.reset();
});

test("play-log: kun aktiv når enabled; dump/clear virker; ingen netværk", () => {
  playlog.clear();
  playlog.enabled = false;
  playlog.log("opgave", { spil: "tal" });
  assert.equal(playlog.entries().length, 0, "logger ikke når deaktiveret");
  playlog.enabled = true;
  playlog.log("spil-start", { spil: "bogstav", niveau: 0 });
  playlog.log("rigtigt", { spil: "bogstav" });
  assert.equal(playlog.entries().length, 2);
  assert.match(playlog.dump(), /spil-start/);
  assert.match(playlog.dump(), /rigtigt/);
  playlog.clear();
  assert.equal(playlog.entries().length, 0);
  playlog.enabled = false;
});

test("play-log: resumé samler tid/forsøg/niveau pr. spil", () => {
  playlog.clear();
  playlog.enabled = true;
  playlog.log("spil-start", { spil: "tal", niveau: 1 });
  playlog.log("opgave", { spil: "tal", niveau: 1 });
  playlog.log("forkert", { spil: "tal", forsøg: 1 });
  playlog.log("rigtigt", { spil: "tal", niveau: 1, ms: 4000, forsøg: 1 });
  playlog.log("opgave", { spil: "tal", niveau: 1 });
  playlog.log("rigtigt", { spil: "tal", niveau: 1, ms: 2000, forsøg: 0 });
  const s = playlog.summary().tal;
  assert.equal(s.rigtige, 2);
  assert.equal(s.forkerte, 1);
  assert.equal(s.niveau, 1);
  assert.equal(Math.round(s.tidSum / s.tidN), 3000, "snit-løsetid 3000 ms");
  assert.match(playlog.summaryText(), /RESUMÉ/);
  playlog.clear();
  playlog.enabled = false;
});

test("play-log: DEV_INSTRUMENTATION er en boolean kill-switch", () => {
  assert.equal(typeof DEV_INSTRUMENTATION, "boolean");
});

test("store: addStar øger, reset nulstiller (in-memory i Node)", () => {
  store.reset();
  assert.equal(store.stars("bogstav"), 0);
  store.addStar("bogstav");
  store.addStar("bogstav");
  assert.equal(store.stars("bogstav"), 2);
  store.reset();
  assert.equal(store.stars("bogstav"), 0);
});
