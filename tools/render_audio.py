#!/usr/bin/env python3
# =====================================================================
# render_audio.py — renderer alle replikker i audio/manifest.json til
# lydfiler med gratis Piper TTS (dansk neural stemme). Idempotent og
# reproducerbart: samme manifest → samme filer.
#
# Pipeline pr. replik:  tekst → Piper → WAV (22.05 kHz mono) →
#   trim stilhed → peak-normaliser → MP3 64 kbps mono (lameenc).
#
# Kræver: piper-tts, lameenc, numpy (pip). Stemmemodellen hentes fra
# HuggingFace (se DEFAULT_MODEL); netadgang til huggingface.co kræves
# KUN til denne engangs-download. Selve appen forbliver offline.
#
# Brug:
#   python3 tools/render_audio.py                 # render manglende
#   python3 tools/render_audio.py --force         # gen-render alt
#   python3 tools/render_audio.py --only sys_stjerne,tal_1
# =====================================================================
import argparse
import io
import json
import os
import subprocess
import sys
import wave

import numpy as np
import lameenc

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST = os.path.join(ROOT, "audio", "manifest.json")
OUT_DIR = os.path.join(ROOT, "audio", "da")
VOICE_DIR = os.path.join(ROOT, "tools", ".piper-voices")
DEFAULT_MODEL = os.path.join(VOICE_DIR, "da_DK-talesyntese-medium.onnx")
MODEL_URL = (
    "https://huggingface.co/rhasspy/piper-voices/resolve/main/"
    "da/da_DK/talesyntese/medium/da_DK-talesyntese-medium.onnx"
)

BITRATE = 64          # kbps
TARGET_PEAK = 0.707   # ~ -3 dBFS
SILENCE_THR = 0.02    # relativ tærskel for trim


def ensure_model(model):
    """Hent stemmemodellen fra HuggingFace hvis den mangler."""
    cfg = model + ".json"
    if os.path.exists(model) and os.path.exists(cfg):
        return
    os.makedirs(VOICE_DIR, exist_ok=True)
    for url, dest in [(MODEL_URL, model), (MODEL_URL + ".json", cfg)]:
        if os.path.exists(dest):
            continue
        print(f"  henter {os.path.basename(dest)} …")
        rc = subprocess.call(["curl", "-sSL", "--max-time", "300", "-o", dest, url])
        if rc != 0 or not os.path.exists(dest):
            sys.exit(f"Kunne ikke hente {url} (netpolitik skal tillade huggingface.co).")


def piper_wav(text, model):
    """Kør Piper og returnér (pcm_int16, sample_rate)."""
    p = subprocess.run(
        ["piper", "-m", model, "-f", "-"],
        input=text.encode("utf-8"),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    if p.returncode != 0:
        raise RuntimeError(p.stderr.decode("utf-8", "ignore")[-300:])
    w = wave.open(io.BytesIO(p.stdout), "rb")
    sr = w.getframerate()
    pcm = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16)
    return pcm, sr


def process(pcm, sr):
    """Trim stilhed i begge ender og peak-normalisér."""
    thr = int(SILENCE_THR * 32768)
    idx = np.where(np.abs(pcm) > thr)[0]
    if len(idx):
        a = max(0, idx[0] - int(0.02 * sr))
        b = min(len(pcm), idx[-1] + int(0.06 * sr))
        pcm = pcm[a:b]
    peak = int(np.max(np.abs(pcm))) or 1
    pcm = (pcm.astype(np.float32) * (TARGET_PEAK * 32768 / peak)).clip(-32768, 32767).astype(np.int16)
    return pcm


def to_mp3(pcm, sr):
    enc = lameenc.Encoder()
    enc.set_bit_rate(BITRATE)
    enc.set_in_sample_rate(sr)
    enc.set_channels(1)
    enc.set_quality(2)
    return enc.encode(pcm.tobytes()) + enc.flush()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", default=DEFAULT_MODEL)
    ap.add_argument("--force", action="store_true", help="gen-render selv eksisterende filer")
    ap.add_argument("--only", default="", help="kommasepareret liste af id'er")
    args = ap.parse_args()

    with open(MANIFEST, encoding="utf-8") as f:
        clips = json.load(f)["clips"]
    os.makedirs(OUT_DIR, exist_ok=True)
    ensure_model(args.model)

    only = set(x for x in args.only.split(",") if x)
    ids = [i for i in clips if not only or i in only]

    done = skip = 0
    total_bytes = 0
    for i, cid in enumerate(ids, 1):
        entry = clips[cid]
        out = os.path.join(OUT_DIR, entry["fil"])
        if os.path.exists(out) and not args.force:
            skip += 1
            total_bytes += os.path.getsize(out)
            continue
        pcm, sr = piper_wav(entry["tekst"], args.model)
        mp3 = to_mp3(process(pcm, sr), sr)
        with open(out, "wb") as fo:
            fo.write(mp3)
        total_bytes += len(mp3)
        done += 1
        if done % 25 == 0 or i == len(ids):
            print(f"  {i}/{len(ids)} … ({done} renderet, {skip} sprunget over)")

    print(f"✔ Færdig: {done} renderet, {skip} allerede til stede. "
          f"Samlet {total_bytes/1024/1024:.1f} MB i {OUT_DIR}")


if __name__ == "__main__":
    main()
