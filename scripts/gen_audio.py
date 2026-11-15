#!/usr/bin/env python3
"""Generate neural German audio (normal + slow) for every app string with Piper.

Reads a JSON list of German strings, synthesizes two MP3s each (normal + slow),
writes them to public/audio/<hash>.mp3 and <hash>.slow.mp3, and writes a manifest
mapping each string to its hash.

Usage: python3 scripts/gen_audio.py <strings.json> [--limit N]
"""
import hashlib
import json
import os
import subprocess
import sys
import tempfile
import wave

from piper import PiperVoice
try:
    from piper import SynthesisConfig
except Exception:
    SynthesisConfig = None

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL = os.environ.get("PIPER_MODEL")  # must be set to the .onnx path
OUT_DIR = os.path.join(ROOT, "public", "audio")
MANIFEST = os.path.join(ROOT, "src", "content", "audioManifest.json")
NORMAL_SCALE = 1.0
SLOW_SCALE = 1.5


def h(text: str) -> str:
    return hashlib.sha1(text.encode("utf-8")).hexdigest()[:16]


def synth(voice, text: str, wav_path: str, scale: float):
    cfg = SynthesisConfig(length_scale=scale) if SynthesisConfig else None
    with wave.open(wav_path, "wb") as wf:
        if cfg is not None:
            voice.synthesize_wav(text, wf, syn_config=cfg)
        else:
            voice.synthesize_wav(text, wf)


def to_mp3(wav_path: str, mp3_path: str):
    subprocess.run(["lame", "--silent", "-b", "96", wav_path, mp3_path], check=True)


def main():
    if not MODEL or not os.path.exists(MODEL):
        print("Set PIPER_MODEL to the .onnx path", file=sys.stderr)
        sys.exit(1)
    strings_path = sys.argv[1]
    limit = None
    if "--limit" in sys.argv:
        limit = int(sys.argv[sys.argv.index("--limit") + 1])
    with open(strings_path) as f:
        strings = json.load(f)
    if limit:
        strings = strings[:limit]
    os.makedirs(OUT_DIR, exist_ok=True)
    voice = PiperVoice.load(MODEL)
    manifest = {}
    total = len(strings)
    for i, text in enumerate(strings, 1):
        key = h(text)
        manifest[text] = key
        normal_mp3 = os.path.join(OUT_DIR, f"{key}.mp3")
        slow_mp3 = os.path.join(OUT_DIR, f"{key}.slow.mp3")
        for mp3_path, scale in ((normal_mp3, NORMAL_SCALE), (slow_mp3, SLOW_SCALE)):
            if os.path.exists(mp3_path):
                continue
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
                wav_path = tmp.name
            try:
                synth(voice, text, wav_path, scale)
                to_mp3(wav_path, mp3_path)
            finally:
                os.unlink(wav_path)
        if i % 25 == 0 or i == total:
            print(f"[{i}/{total}] {text[:40]}", flush=True)
    with open(MANIFEST, "w") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=0, sort_keys=True)
    print(f"done: {total} strings, manifest -> {MANIFEST}")


if __name__ == "__main__":
    main()
