import manifest from "../content/audioManifest.json";
import { speak } from "./speech";

const map = manifest as Record<string, string>;
const BASE = import.meta.env.BASE_URL;
const SLOW_RATE = 0.7;

export function hasClip(text: string): boolean {
  return Object.hasOwn(map, text?.trim());
}

export function clipUrl(text: string, slow = false): string | null {
  const key = text?.trim();
  if (!key || !Object.hasOwn(map, key)) return null;
  return `${BASE}audio/${map[key]}${slow ? ".slow" : ""}.mp3`;
}

// Why Web Audio instead of an <audio> element:
// GitHub Pages serves the clips as `audio/mp3` (not the standard `audio/mpeg`).
// iOS Safari's <audio> element rejects that Content-Type and the app fell back
// to the robotic system voice. Web Audio decodes the raw MP3 bytes itself, so
// the HTTP Content-Type is irrelevant and playback is consistent on iOS.

type AC = AudioContext;
let ctx: AC | null = null;
const buffers = new Map<string, AudioBuffer>();
const pending = new Map<string, Promise<AudioBuffer>>();
let currentSource: AudioBufferSourceNode | null = null;

function getCtx(): AC | null {
  const Ctor =
    (globalThis as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext })
      .AudioContext ||
    (globalThis as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) {
    try { ctx = new Ctor(); } catch { return null; }
  }
  return ctx;
}

async function loadBuffer(context: AC, url: string): Promise<AudioBuffer> {
  const cached = buffers.get(url);
  if (cached) return cached;
  let p = pending.get(url);
  if (!p) {
    p = fetch(url)
      .then((r) => r.arrayBuffer())
      .then((bytes) => context.decodeAudioData(bytes))
      .then((buf) => { buffers.set(url, buf); pending.delete(url); return buf; })
      .catch((e) => { pending.delete(url); throw e; });
    pending.set(url, p);
  }
  return p;
}

// Resume the AudioContext on the first user gesture so later playback works on iOS.
if (typeof document !== "undefined") {
  const unlock = () => { getCtx()?.resume().catch(() => {}); };
  document.addEventListener("pointerdown", unlock, { once: true, passive: true });
  document.addEventListener("touchend", unlock, { once: true, passive: true });
}

/** Test-only: clear the decoded-buffer cache and context so tests are isolated. */
export function __resetAudioForTest(): void {
  buffers.clear();
  pending.clear();
  ctx = null;
  currentSource = null;
}

export function playAudio(text: string, opts: { slow?: boolean } = {}): void {
  const slow = !!opts.slow;
  let fellBack = false;
  const fb = () => {
    if (fellBack) return;
    fellBack = true;
    if (slow) speak(text, "de-DE", SLOW_RATE);
    else speak(text);
  };
  const url = clipUrl(text, slow);
  if (!url) { fb(); return; }
  const context = getCtx();
  if (!context) { fb(); return; }
  // Resume synchronously inside the gesture that called us.
  context.resume?.().catch(() => {});
  loadBuffer(context, url)
    .then((buf) => {
      try {
        if (currentSource) { try { currentSource.stop(); } catch { /* already stopped */ } }
        const src = context.createBufferSource();
        src.buffer = buf;
        src.connect(context.destination);
        currentSource = src;
        src.onended = () => { if (currentSource === src) currentSource = null; };
        src.start();
      } catch { fb(); }
    })
    .catch(fb);
}
